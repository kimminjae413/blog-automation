// HAIRGATOR - ai-service.js
// AI 연동 서비스 (보안 강화 버전)

// ⚠️ 보안 가이드라인 준수
// - API 키는 서버에서만 관리
// - 클라이언트는 서버 프록시를 통해서만 AI 호출
// - 실제 운영시에는 /api/ 엔드포인트 사용 필수

class HairGatorAIService {
    constructor() {
        this.currentAIService = 'claude'; // 기본값
        this.isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.serverEndpoint = this.isDevMode ? 'http://localhost:3000' : '';
        this.rateLimitDelay = 2000; // API 호출 간격
        this.maxRetries = 3;
        this.requestQueue = [];
        this.isProcessing = false;
        
        // 실제 운영에서는 제거해야 할 임시 키 저장소
        this.tempKeys = {
            claude: null,
            openai: null
        };
        
        console.log('🤖 HairGator AI Service 초기화 완료');
        this.initializeService();
    }
    
    // 서비스 초기화
    initializeService() {
        // 서버 연결 상태 확인
        this.checkServerConnection();
        
        // API 상태 주기적 체크
        setInterval(() => {
            this.healthCheck();
        }, 60000); // 1분마다
        
        // 큐 처리 시작
        this.processQueue();
    }
    
    // 서버 연결 상태 확인
    async checkServerConnection() {
        if (this.isDevMode) {
            try {
                const response = await fetch(`${this.serverEndpoint}/api/health`);
                if (response.ok) {
                    console.log('✅ AI 서버 연결 성공');
                    this.logActivity('서버 연결', 'AI 서버와 연결되었습니다.', 'success');
                } else {
                    throw new Error('서버 응답 오류');
                }
            } catch (error) {
                console.warn('⚠️ AI 서버 미연결 - 샘플 모드로 실행');
                this.logActivity('서버 연결', 'AI 서버 미연결 - 샘플 모드로 실행합니다.', 'warning');
            }
        }
    }
    
    // AI 서비스 설정
    setAIService(service) {
        if (['claude', 'openai'].includes(service)) {
            this.currentAIService = service;
            this.logActivity('AI 서비스 변경', `${service.toUpperCase()}로 AI 서비스가 변경되었습니다.`);
            return true;
        }
        return false;
    }
    
    // API 키 설정 (개발 모드에서만 - 운영에서는 제거)
    setAPIKey(service, key) {
        if (this.isDevMode && ['claude', 'openai'].includes(service)) {
            this.tempKeys[service] = key;
            console.warn(`⚠️ 개발 모드: ${service} API 키 임시 저장`);
            return true;
        }
        console.error('❌ 운영 환경에서는 클라이언트 키 저장 불가');
        return false;
    }
    
    // 메인 AI 콘텐츠 생성 함수
    async generateHaircareContent(topic, options = {}) {
        const requestData = {
            service: this.currentAIService,
            topic: topic,
            options: {
                targetAudience: options.targetAudience || currentTargetAudience,
                contentType: options.contentType || 'guide',
                naverSEO: options.naverSEO !== false, // 기본값 true
                length: options.length || 'medium',
                tone: options.tone || 'professional_friendly',
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('generate_content', requestData);
    }
    
    // 이미지 생성
    async generateHaircareImage(prompt, options = {}) {
        const requestData = {
            prompt: this.enhanceImagePrompt(prompt),
            options: {
                style: options.style || 'professional',
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('generate_image', requestData);
    }
    
    // 콘텐츠 품질 검사
    async checkContentQuality(content, options = {}) {
        const requestData = {
            content: content,
            options: {
                checkType: options.checkType || 'comprehensive',
                naverSEO: options.naverSEO !== false,
                targetKeywords: options.targetKeywords || [],
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('check_quality', requestData);
    }
    
    // 키워드 제안
    async suggestKeywords(topic, options = {}) {
        const requestData = {
            topic: topic,
            options: {
                count: options.count || 10,
                targetAudience: options.targetAudience || currentTargetAudience,
                category: options.category || 'haircare',
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('suggest_keywords', requestData);
    }
    
    // SEO 최적화 제안
    async optimizeForNaverSEO(content, title, options = {}) {
        const requestData = {
            content: content,
            title: title,
            options: {
                targetKeywords: options.targetKeywords || [],
                targetAudience: options.targetAudience || currentTargetAudience,
                improvementAreas: options.improvementAreas || [],
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('optimize_seo', requestData);
    }
    
    // 요청 큐에 추가
    async queueRequest(type, data) {
        return new Promise((resolve, reject) => {
            const request = {
                id: Date.now() + Math.random(),
                type: type,
                data: data,
                resolve: resolve,
                reject: reject,
                retries: 0,
                createdAt: Date.now()
            };
            
            this.requestQueue.push(request);
            console.log(`📝 AI 요청 큐에 추가: ${type} (대기: ${this.requestQueue.length})`);
            
            // 큐 처리가 중단된 경우 재시작
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }
    
    // 큐 처리
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                console.log(`🔄 AI 요청 처리 중: ${request.type}`);
                const result = await this.executeRequest(request);
                request.resolve(result);
                
                this.logActivity('AI 요청 성공', `${request.type} 요청이 성공적으로 처리되었습니다.`, 'success');
                
                // 레이트 리밋 준수
                if (this.requestQueue.length > 0) {
                    await this.delay(this.rateLimitDelay);
                }
                
            } catch (error) {
                console.error(`❌ AI 요청 실패: ${request.type}`, error);
                
                // 재시도 로직
                if (request.retries < this.maxRetries) {
                    request.retries++;
                    this.requestQueue.unshift(request); // 큐 앞쪽에 다시 추가
                    
                    this.logActivity('AI 요청 재시도', `${request.type} 요청을 재시도합니다. (${request.retries}/${this.maxRetries})`, 'warning');
                    
                    // 재시도 전 대기
                    await this.delay(this.rateLimitDelay * request.retries);
                } else {
                    request.reject(error);
                    this.logActivity('AI 요청 실패', `${request.type} 요청이 최종 실패했습니다: ${error.message}`, 'error');
                }
            }
        }
        
        this.isProcessing = false;
    }
    
    // 실제 요청 실행
    async executeRequest(request) {
        const { type, data } = request;
        
        // 서버 연결이 가능한 경우 서버로 요청
        if (this.isDevMode && this.serverEndpoint) {
            try {
                return await this.callServer(type, data);
            } catch (error) {
                console.warn('서버 요청 실패, 로컬 처리로 전환:', error.message);
            }
        }
        
        // 로컬 처리 (샘플/시뮬레이션)
        return await this.processLocally(type, data);
    }
    
    // 서버 API 호출
    async callServer(type, data) {
        const endpoint = `${this.serverEndpoint}/api/ai/${type}`;
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-AI-Service': this.currentAIService
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `서버 오류: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // 로컬 처리 (샘플/개발 모드)
    async processLocally(type, data) {
        console.log(`🧪 로컬 처리: ${type}`);
        
        // 시뮬레이션 지연
        await this.delay(1000 + Math.random() * 2000);
        
        switch (type) {
            case 'generate_content':
                return this.generateSampleContent(data);
            case 'generate_image':
                return this.generateSampleImage(data);
            case 'check_quality':
                return this.checkSampleQuality(data);
            case 'suggest_keywords':
                return this.suggestSampleKeywords(data);
            case 'optimize_seo':
                return this.optimizeSampleSEO(data);
            default:
                throw new Error(`지원하지 않는 요청 타입: ${type}`);
        }
    }
    
    // 샘플 콘텐츠 생성
    generateSampleContent(data) {
        const { topic, options } = data;
        const targetData = targetAudienceData[options.targetAudience] || targetAudienceData['hair_professionals'];
        const targetName = targetData.name;
        
        // 네이버 SEO 최적화된 샘플 콘텐츠 생성
        if (options.naverSEO) {
            return this.generateNaverOptimizedContent(topic, targetName, options);
        }
        
        // 일반 콘텐츠 생성
        return this.generateStandardContent(topic, targetName, options);
    }
    
    // 네이버 SEO 최적화 콘텐츠 생성
    generateNaverOptimizedContent(topic, targetName, options) {
        const seoTitle = this.generateSEOTitle(topic, targetName);
        const content = this.generateSEOContent(topic, targetName, options);
        const metaDescription = this.generateSEOMetaDescription(topic, targetName);
        
        return {
            success: true,
            data: {
                title: seoTitle,
                content: content,
                metaDescription: metaDescription,
                seoOptimized: true,
                naverSEO: {
                    titleLength: seoTitle.length,
                    keywordPlacement: this.analyzeKeywordPlacement(seoTitle, content, topic.keywords),
                    structureScore: this.calculateStructureScore(content),
                    readabilityScore: this.calculateReadabilityScore(content)
                },
                generatedAt: new Date().toISOString(),
                aiService: this.currentAIService,
                processingTime: Math.round(Math.random() * 3000 + 1000)
            }
        };
    }
    
    // SEO 제목 생성
    generateSEOTitle(topic, targetName) {
        const titleTemplates = [
            `${topic.title} | ${targetName} 완전 가이드 2024`,
            `${topic.keywords[0]} 전문가가 알려주는 ${targetName} 필수 노하우`,
            `2024년 최신 ${topic.keywords[0]} 완전정복 - ${targetName} 전용`,
            `${targetName}을 위한 ${topic.keywords[0]} 실전 가이드`,
            `${topic.keywords[0]} 베스트 방법 - ${targetName} 추천`,
            `실무진이 인정한 ${topic.keywords[0]} 핵심 전략`,
            `${topic.title}: 전문가 검증 ${targetName} 가이드`
        ];
        
        let selectedTemplate = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
        
        // 길이 조정 (30-60자)
        if (selectedTemplate.length > 60) {
            selectedTemplate = selectedTemplate.substring(0, 57) + '...';
        } else if (selectedTemplate.length < 30) {
            selectedTemplate += ` | 완벽 분석`;
        }
        
        return selectedTemplate;
    }
    
    // SEO 최적화 콘텐츠 생성
    generateSEOContent(topic, targetName, options) {
        const primaryKeyword = topic.keywords[0];
        const secondaryKeywords = topic.keywords.slice(1);
        
        return `# ${topic.title}: ${targetName} 전문 가이드

안녕하세요, **${targetName}** 여러분! 오늘은 **${primaryKeyword}**에 대해 현장에서 바로 활용할 수 있는 **전문적인 내용**을 상세히 공유하겠습니다.

**${primaryKeyword}**는 ${targetName}에게 매우 중요한 요소입니다. 특히 **${secondaryKeywords[0]}**와 연관하여 체계적으로 접근하면 더욱 효과적인 결과를 얻을 수 있습니다.

## ${primaryKeyword}의 핵심 이해

### 왜 ${primaryKeyword}가 중요한가?

**${targetName}**으로서 여러분이 일상적으로 마주치는 ${primaryKeyword} 관련 이슈들을 효과적으로 해결할 수 있는 방법들을 알아보겠습니다.

현장에서 **${secondaryKeywords[0]}**와 관련된 업무를 처리할 때, 체계적인 접근법이 없다면 시간과 비용이 낭비될 수 있습니다. 특히 ${targetName}에게는 다음과 같은 이유로 중요합니다:

- **효율성 향상**: 올바른 ${primaryKeyword} 적용으로 업무 처리 시간 30% 단축
- **품질 개선**: 전문적인 ${secondaryKeywords[1] || secondaryKeywords[0]} 활용으로 서비스 품질 향상
- **고객 만족**: 더 나은 결과로 고객 만족도 85% 이상 달성
- **수익성**: 효과적인 방법으로 월평균 수익성 15% 개선

## 실무 적용 가능한 구체적 방법론

### 1단계: ${primaryKeyword} 현상 파악 및 분석

**${primaryKeyword}**를 다룰 때 가장 먼저 해야 할 일은 정확한 현상 파악입니다. 실무에서 검증된 체크리스트를 활용해보세요.

**필수 체크리스트:**
- [ ] 기본 상황 및 조건 확인
- [ ] 관련 요소들 종합 분석  
- [ ] 명확한 목표 설정 및 우선순위 결정
- [ ] 필요 자원 및 도구 파악
- [ ] 예상 소요 시간 및 비용 산정

### 2단계: 전문적 접근법 적용

**${targetName}**의 전문성을 활용한 체계적 접근 방식입니다:

**이론적 기반 마련**
- ${primaryKeyword}의 핵심 원리와 작동 메커니즘 이해
- 업계 표준 및 베스트 프랙티스 철저 검토
- 최신 연구 결과 및 트렌드 분석

**실무 기술 적용**
- 현장에서 검증된 **${secondaryKeywords[0]}** 기법 활용
- 개인별/상황별 맞춤 조정 방법
- 효과 측정 및 개선 방안

### 3단계: 고급 테크닉과 실전 노하우

경험 많은 **${targetName}**들이 실제로 사용하는 고급 기법들을 공개합니다:

**전문가 핵심 팁 #1**: ${secondaryKeywords[1] || secondaryKeywords[0]} 최대 활용법
- 구체적인 적용 방법과 단계별 가이드
- 주의해야 할 핵심 포인트 5가지
- 다양한 상황별 응용 방법

**전문가 핵심 팁 #2**: 효율성 극대화 전략
- 시간 절약을 위한 핵심 테크닉
- 품질 향상을 위한 체크포인트
- 비용 효율적 접근법과 리소스 관리

## ${targetName}을 위한 실제 현장 사례

### 사례 1: 일반적인 상황에서의 ${primaryKeyword} 적용

"실제로 저희 현장에서 **${primaryKeyword}**를 적용할 때 가장 효과적이었던 방법은..."

**상황**: 전형적인 업무 환경에서의 적용 사례
**적용 방법**: 단계별 구체적 실행 과정
**결과**: 30일 후 측정된 정량적 성과
**핵심 포인트**: 성공 요인 3가지 분석

### 사례 2: 까다로운 상황에서의 문제 해결

"특별히 어려운 케이스의 경우, **${secondaryKeywords[0]}** 접근법이 매우 유용했습니다..."

**도전 과제**: 복잡하고 까다로운 상황 설명
**해결 과정**: 창의적 문제 해결 접근법
**교훈**: 향후 유사 상황 대비 노하우

## 자주 묻는 질문 (FAQ)

### Q1: ${primaryKeyword} 적용 시 가장 흔한 실수는?

**A**: 가장 흔한 실수는 **기본기를 무시하고 고급 기법만 추구하는 것**입니다. ${primaryKeyword}의 기초 원리를 충분히 이해하지 못한 상태에서 복잡한 방법을 적용하면 오히려 역효과가 날 수 있습니다.

### Q2: ${targetName} 초보자도 바로 적용 가능한가요?

**A**: 네, 충분히 가능합니다. 다만 **단계별 접근**이 중요합니다. 처음에는 기본적인 ${secondaryKeywords[0]} 방법부터 시작하여 점차 고급 기법으로 발전시켜 나가세요.

### Q3: 얼마나 자주 ${primaryKeyword}를 적용해야 하나요?

**A**: **일관성**이 가장 중요합니다. 매일 조금씩이라도 꾸준히 적용하는 것이 일주일에 한 번 많이 하는 것보다 효과적입니다.

## 마무리: ${targetName}을 위한 특별한 조언

**${primaryKeyword}**에 대한 이해와 적용은 **${targetName}**에게 경쟁력을 제공하는 핵심 역량입니다. 

오늘 소개한 방법들을 현장에서 단계적으로 적용해보시고, 여러분만의 노하우로 발전시켜 나가시기 바랍니다.

**중요한 것은 꾸준함입니다.** 전문가는 하루아침에 만들어지지 않습니다. 지속적인 학습과 실습을 통해 더욱 발전된 **${targetName}**이 되어가시길 응원합니다.

---

💬 **여러분의 ${primaryKeyword} 경험을 댓글로 공유해주세요!** 어떤 방법이 가장 효과적이었는지, 또는 어려웠던 점은 무엇인지 궁금합니다.

👍 **이 글이 도움이 되셨다면 좋아요와 공유 부탁드립니다!** 더 많은 **${targetName}**들에게 유용한 정보가 전달될 수 있도록 함께해주세요.

🔔 **정기적인 전문 정보를 받아보시려면 구독해주세요!** 매주 실무에 도움되는 최신 정보와 노하우를 공유하겠습니다.

---

*본 글은 현장 경험이 풍부한 **${targetName}**들의 실무 노하우와 최신 연구 결과를 바탕으로 작성되었습니다.*`;
    }
    
    // SEO 메타 설명 생성
    generateSEOMetaDescription(topic, targetName) {
        const templates = [
            `${topic.title}에 대한 ${targetName} 전용 완벽 가이드입니다. ${topic.keywords.slice(0, 3).join(', ')} 관련 전문 노하우와 실무 팁을 상세히 알아보세요.`,
            `${targetName}을 위한 ${topic.keywords[0]} 전문 가이드! 실무에 바로 적용 가능한 ${topic.keywords[1]} 노하우와 현장 경험을 공유합니다.`,
            `${topic.keywords[0]} 관련 ${targetName} 필수 정보를 한눈에! ${topic.keywords[1]}, ${topic.keywords[2] || topic.keywords[0]} 중심으로 전문가가 직접 알려드립니다.`
        ];
        
        let description = templates[Math.floor(Math.random() * templates.length)];
        
        // 150자 제한
        if (description.length > 150) {
            description = description.substring(0, 147) + '...';
        }
        
        return description;
    }
    
    // 표준 콘텐츠 생성
    generateStandardContent(topic, targetName, options) {
        return {
            success: true,
            data: {
                title: `${topic.title}: ${targetName} 전문 가이드`,
                content: `# ${topic.title}\n\n${targetName}을 위한 전문적인 ${topic.keywords[0]} 가이드입니다.\n\n## 주요 내용\n\n${topic.keywords.map(keyword => `### ${keyword}\n\n전문적인 ${keyword} 관련 내용을 여기에 작성합니다.\n`).join('\n')}`,
                metaDescription: `${topic.title}에 대한 ${targetName}의 전문 정보를 확인하세요.`,
                seoOptimized: false,
                generatedAt: new Date().toISOString(),
                aiService: this.currentAIService,
                processingTime: Math.round(Math.random() * 2000 + 500)
            }
        };
    }
    
    // 샘플 이미지 생성
    generateSampleImage(data) {
        const { prompt, options } = data;
        
        // 헤어케어 관련 이미지 URL 풀
        const sampleImages = [
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1024&h=1024&fit=crop',
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1024&h=1024&fit=crop',
            'https://images.unsplash.com/photo-1580618432485-c1f0c1e6da84?w=1024&h=1024&fit=crop',
            'https://images.unsplash.com/photo-1595475038665-8e8be3a4f7db?w=1024&h=1024&fit=crop',
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1024&h=1024&fit=crop',
            'https://images.unsplash.com/photo-1522338242992-e1633a5603c5?w=1024&h=1024&fit=crop'
        ];
        
        const selectedImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        
        return {
            success: true,
            data: {
                imageUrl: selectedImage,
                prompt: prompt,
                enhancedPrompt: this.enhanceImagePrompt(prompt),
                style: options.style,
                size: options.size,
                generatedAt: new Date().toISOString(),
                processingTime: Math.round(Math.random() * 1500 + 500)
            }
        };
    }
    
    // 이미지 프롬프트 향상
    enhanceImagePrompt(originalPrompt) {
        const enhancements = [
            'professional haircare',
            'modern salon setting',
            'high quality photography',
            'clean aesthetic',
            'beautiful lighting',
            'Korean beauty style'
        ];
        
        const selectedEnhancements = enhancements
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        return `${originalPrompt}, ${selectedEnhancements.join(', ')}, professional photography, high resolution`;
    }
    
    // 샘플 품질 검사
    checkSampleQuality(data) {
        const { content } = data;
        
        // 실제 품질 분석 로직 (기존 함수 활용)
        const analysis = this.performDetailedQualityAnalysis(content);
        
        return {
            success: true,
            data: {
                overallScore: analysis.overallScore,
                naverSEOScore: analysis.naverSEOScore,
                details: analysis.details,
                recommendations: analysis.recommendations,
                checkedAt: new Date().toISOString(),
                processingTime: Math.round(Math.random() * 1000 + 300)
            }
        };
    }
    
    // 상세 품질 분석
    performDetailedQualityAnalysis(content) {
        const wordCount = content.length;
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const headings = (content.match(/^#+\s/gm) || []).length;
        const lists = (content.match(/^[-*+]\s/gm) || []).length;
        const bold = (content.match(/\*\*[^*]+\*\*/g) || []).length;
        
        // 점수 계산
        const wordCountScore = this.calculateWordCountScore(wordCount);
        const structureScore = this.calculateStructureScore(content);
        const readabilityScore = this.calculateReadabilityScore(content);
        const seoScore = this.calculateSEOScore(content);
        
        const overallScore = Math.round(
            (wordCountScore * 0.2) +
            (structureScore * 0.3) +
            (readabilityScore * 0.25) +
            (seoScore * 0.25)
        );
        
        return {
            overallScore,
            naverSEOScore: seoScore,
            details: {
                wordCount: { count: wordCount, score: wordCountScore },
                structure: { headings, lists, paragraphs, score: structureScore },
                readability: { sentences: sentences.length, score: readabilityScore },
                seo: { bold, score: seoScore }
            },
            recommendations: this.generateQualityRecommendations(overallScore, {
                wordCountScore, structureScore, readabilityScore, seoScore
            })
        };
    }
    
    // 단어 수 점수 계산
    calculateWordCountScore(wordCount) {
        if (wordCount >= 1500 && wordCount <= 5000) {
            return Math.min(100, 60 + (wordCount - 1500) / 35);
        } else if (wordCount < 1500) {
            return (wordCount / 1500) * 60;
        } else {
            return Math.max(40, 100 - (wordCount - 5000) / 100);
        }
    }
    
    // 구조 점수 계산
    calculateStructureScore(content) {
        let score = 0;
        
        const headings = (content.match(/^#+\s/gm) || []).length;
        const lists = (content.match(/^[-*+]\s/gm) || []).length;
        const bold = (content.match(/\*\*[^*]+\*\*/g) || []).length;
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        
        if (headings >= 3) score += 30;
        else if (headings >= 1) score += 15;
        
        if (lists >= 5) score += 25;
        else if (lists >= 2) score += 12;
        
        if (bold >= 5) score += 20;
        else if (bold >= 2) score += 10;
        
        if (paragraphs >= 5) score += 25;
        else if (paragraphs >= 3) score += 12;
        
        return Math.min(100, score);
    }
    
    // 가독성 점수 계산
    calculateReadabilityScore(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        
        if (sentences.length === 0 || words.length === 0) return 0;
        
        const avgWordsPerSentence = words.length / sentences.length;
        
        // 한국어 기준 가독성 (문장당 단어 수 기준)
        let score = 100;
        if (avgWordsPerSentence > 25) score -= (avgWordsPerSentence - 25) * 2;
        if (avgWordsPerSentence < 8) score -= (8 - avgWordsPerSentence) * 3;
        
        return Math.max(0, Math.min(100, score));
    }
    
    // SEO 점수 계산
    calculateSEOScore(content) {
        let score = 0;
        
        // 키워드 밀도 체크 (currentTopic 사용)
        if (window.currentTopic && window.currentTopic.keywords) {
            const keywords = window.currentTopic.keywords;
            const keywordDensity = this.calculateKeywordDensity(content, keywords);
            
            if (keywordDensity >= 1.5 && keywordDensity <= 4.0) {
                score += 40;
            } else if (keywordDensity >= 1.0 && keywordDensity <= 5.0) {
                score += 25;
            }
        } else {
            score += 30; // 기본 점수
        }
        
        // 구조적 SEO 요소
        const hasH2 = /^##\s/gm.test(content);
        const hasH3 = /^###\s/gm.test(content);
        const hasList = /^[-*+]\s/gm.test(content);
        const hasBold = /\*\*[^*]+\*\*/g.test(content);
        const hasQA = /^#{1,3}\s*(?:Q|질문|FAQ)/gm.test(content);
        const hasCTA = /(댓글|공유|좋아요|구독|팔로우)/g.test(content);
        
        if (hasH2) score += 15;
        if (hasH3) score += 10;
        if (hasList) score += 10;
        if (hasBold) score += 10;
        if (hasQA) score += 10;
        if (hasCTA) score += 5;
        
        return Math.min(100, score);
    }
    
    // 키워드 밀도 계산
    calculateKeywordDensity(content, keywords) {
        const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;
        
        let totalKeywordCount = 0;
        keywords.forEach(keyword => {
            const keywordCount = content.toLowerCase().split(keyword.toLowerCase()).length - 1;
            totalKeywordCount += keywordCount;
        });
        
        return (totalKeywordCount / totalWords) * 100;
    }
    
    // 품질 개선 추천사항 생성
    generateQualityRecommendations(overallScore, scores) {
        const recommendations = [];
        
        if (scores.wordCountScore < 70) {
            if (scores.wordCountScore < 40) {
                recommendations.push({
                    priority: 'high',
                    type: 'content_length',
                    message: '글 길이가 짧습니다. 네이버는 1500자 이상의 글을 선호합니다. 더 자세한 설명을 추가해보세요.'
                });
            } else {
                recommendations.push({
                    priority: 'medium',
                    type: 'content_length',
                    message: '글 길이를 조정해보세요. 너무 길거나 짧은 글은 검색 노출에 불리할 수 있습니다.'
                });
            }
        }
        
        if (scores.structureScore < 70) {
            recommendations.push({
                priority: 'high',
                type: 'structure',
                message: '소제목(##), 목록(-), 강조(**굵게**)를 더 활용해 구조를 개선하세요.'
            });
        }
        
        if (scores.readabilityScore < 70) {
            recommendations.push({
                priority: 'medium',
                type: 'readability',
                message: '문장을 더 짧고 명확하게 작성해보세요. 한 문장에 25단어 이하를 권장합니다.'
            });
        }
        
        if (scores.seoScore < 70) {
            recommendations.push({
                priority: 'high',
                type: 'seo',
                message: '키워드 배치를 개선하고, FAQ 섹션과 CTA(댓글 유도)를 추가해보세요.'
            });
        }
        
        if (overallScore >= 85) {
            recommendations.push({
                priority: 'low',
                type: 'excellent',
                message: '훌륭한 품질의 글입니다! 네이버 상위 노출 가능성이 높습니다.'
            });
        }
        
        return recommendations;
    }
    
    // 샘플 키워드 제안
    suggestSampleKeywords(data) {
        const { topic, options } = data;
        
        const baseKeywords = topic.keywords || [];
        const targetAudience = options.targetAudience || 'hair_professionals';
        
        // 타겟별 추가 키워드
        const additionalKeywords = {
            hair_professionals: ['헤어기법', '살롱운영', '고객상담', '트렌드분석', '스타일링'],
            beauty_professionals: ['뷰티트렌드', '고객관리', '샵운영', '서비스기법', '마케팅'],
            fitness_trainers: ['운동처방', 'PT기법', '고객관리', '트레이닝', '재활운동'],
            chefs_cooks: ['조리기법', '메뉴개발', '식재료', '주방운영', '레시피'],
            it_developers: ['개발기술', '코딩', '프로그래밍', '시스템', '프로젝트']
        };
        
        // 관련 키워드 생성
        const relatedKeywords = [
            ...baseKeywords,
            ...(additionalKeywords[targetAudience] || additionalKeywords['hair_professionals']),
            '전문가', '가이드', '노하우', '팁', '방법', '실무', '현장', '경험',
            '2024', '최신', '트렌드', '완전정복', '베스트', '추천'
        ];
        
        // 중복 제거 및 셔플
        const uniqueKeywords = [...new Set(relatedKeywords)]
            .sort(() => 0.5 - Math.random())
            .slice(0, options.count || 10);
        
        return {
            success: true,
            data: {
                keywords: uniqueKeywords.map((keyword, index) => ({
                    keyword: keyword,
                    relevance: Math.round((100 - index * 3) + Math.random() * 10),
                    searchVolume: Math.round(Math.random() * 10000 + 1000),
                    competition: ['낮음', '보통', '높음'][Math.floor(Math.random() * 3)]
                })),
                generatedAt: new Date().toISOString(),
                processingTime: Math.round(Math.random() * 800 + 200)
            }
        };
    }
    
    // 샘플 SEO 최적화
    optimizeSampleSEO(data) {
        const { content, title, options } = data;
        
        const currentAnalysis = this.performDetailedQualityAnalysis(content);
        const improvements = this.generateSEOImprovements(content, title, currentAnalysis);
        
        return {
            success: true,
            data: {
                currentScore: currentAnalysis.overallScore,
                optimizedScore: Math.min(100, currentAnalysis.overallScore + 15),
                improvements: improvements,
                optimizedTitle: this.optimizeTitle(title, options.targetKeywords),
                optimizedContent: this.optimizeContent(content, options.targetKeywords),
                processedAt: new Date().toISOString(),
                processingTime: Math.round(Math.random() * 1200 + 500)
            }
        };
    }
    
    // SEO 개선사항 생성
    generateSEOImprovements(content, title, analysis) {
        const improvements = [];
        
        if (analysis.details.wordCount.score < 80) {
            improvements.push({
                type: 'content_length',
                priority: 'high',
                current: `${analysis.details.wordCount.count}자`,
                suggestion: '1500-3000자로 조정',
                impact: '네이버 검색 노출 개선'
            });
        }
        
        if (analysis.details.structure.headings < 3) {
            improvements.push({
                type: 'structure',
                priority: 'high',
                current: `${analysis.details.structure.headings}개 소제목`,
                suggestion: '3-5개 소제목(H2, H3) 추가',
                impact: '가독성 및 SEO 향상'
            });
        }
        
        if (analysis.details.structure.lists < 3) {
            improvements.push({
                type: 'formatting',
                priority: 'medium',
                current: `${analysis.details.structure.lists}개 목록`,
                suggestion: '핵심 내용을 목록으로 정리',
                impact: '사용자 경험 개선'
            });
        }
        
        if (!/(댓글|공유|좋아요)/.test(content)) {
            improvements.push({
                type: 'engagement',
                priority: 'medium',
                current: 'CTA 없음',
                suggestion: '댓글 유도 문구 추가',
                impact: '사용자 참여 증가'
            });
        }
        
        return improvements;
    }
    
    // 제목 최적화
    optimizeTitle(title, targetKeywords = []) {
        let optimizedTitle = title;
        
        // 키워드가 없으면 추가
        if (targetKeywords.length > 0 && !title.toLowerCase().includes(targetKeywords[0].toLowerCase())) {
            optimizedTitle = `${targetKeywords[0]} ${title}`;
        }
        
        // 길이 조정
        if (optimizedTitle.length > 60) {
            optimizedTitle = optimizedTitle.substring(0, 57) + '...';
        } else if (optimizedTitle.length < 30) {
            optimizedTitle += ' | 완벽 가이드';
        }
        
        // 숫자 추가 (클릭률 향상)
        if (!/\d/.test(optimizedTitle)) {
            optimizedTitle = optimizedTitle.replace('가이드', '5가지 핵심 가이드');
        }
        
        return optimizedTitle;
    }
    
    // 콘텐츠 최적화
    optimizeContent(content, targetKeywords = []) {
        let optimizedContent = content;
        
        // 첫 문단에 키워드 추가
        if (targetKeywords.length > 0) {
            const paragraphs = optimizedContent.split('\n\n');
            if (paragraphs.length > 0 && !paragraphs[0].toLowerCase().includes(targetKeywords[0].toLowerCase())) {
                paragraphs[0] = paragraphs[0] + ` **${targetKeywords[0]}**에 대해 자세히 알아보겠습니다.`;
                optimizedContent = paragraphs.join('\n\n');
            }
        }
        
        // CTA 추가
        if (!/(댓글|공유|좋아요)/.test(optimizedContent)) {
            optimizedContent += '\n\n---\n\n💬 **이 글이 도움이 되셨다면 댓글로 의견을 공유해주세요!**\n👍 **좋아요와 공유로 더 많은 분들에게 도움을 주세요!**';
        }
        
        return optimizedContent;
    }
    
    // 키워드 배치 분석
    analyzeKeywordPlacement(title, content, keywords) {
        const placements = {
            title: keywords.some(k => title.toLowerCase().includes(k.toLowerCase())),
            firstParagraph: false,
            headings: false,
            lastParagraph: false,
            score: 0
        };
        
        const firstParagraph = content.split('\n\n')[0] || '';
        const lastParagraph = content.split('\n\n').slice(-1)[0] || '';
        const headings = content.match(/^#+\s.+/gm) || [];
        
        placements.firstParagraph = keywords.some(k => 
            firstParagraph.toLowerCase().includes(k.toLowerCase())
        );
        
        placements.lastParagraph = keywords.some(k => 
            lastParagraph.toLowerCase().includes(k.toLowerCase())
        );
        
        placements.headings = headings.some(h => 
            keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
        );
        
        // 점수 계산
        let score = 0;
        if (placements.title) score += 30;
        if (placements.firstParagraph) score += 25;
        if (placements.headings) score += 25;
        if (placements.lastParagraph) score += 20;
        
        placements.score = score;
        return placements;
    }
    
    // 건강 상태 체크
    async healthCheck() {
        const status = {
            timestamp: new Date().toISOString(),
            aiService: this.currentAIService,
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing,
            serverConnection: false,
            lastRequestTime: this.lastRequestTime || null
        };
        
        // 서버 연결 체크
        if (this.isDevMode && this.serverEndpoint) {
            try {
                const response = await fetch(`${this.serverEndpoint}/api/health`, {
                    method: 'GET',
                    timeout: 5000
                });
                status.serverConnection = response.ok;
            } catch (error) {
                status.serverConnection = false;
            }
        }
        
        // 상태 로깅
        if (status.queueLength > 10) {
            this.logActivity('큐 경고', `대기 중인 요청이 ${status.queueLength}개입니다.`, 'warning');
        }
        
        return status;
    }
    
    // 통계 정보 가져오기
    getStatistics() {
        return {
            totalRequests: this.requestQueue.length,
            currentService: this.currentAIService,
            isProcessing: this.isProcessing,
            rateLimitDelay: this.rateLimitDelay,
            maxRetries: this.maxRetries,
            serverEndpoint: this.serverEndpoint,
            isDevMode: this.isDevMode
        };
    }
    
    // 서비스 재시작
    restart() {
        this.requestQueue = [];
        this.isProcessing = false;
        console.log('🔄 AI 서비스 재시작 완료');
        this.logActivity('서비스 재시작', 'AI 서비스가 재시작되었습니다.', 'info');
    }
    
    // 유틸리티 함수들
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    logActivity(action, message, type = 'info') {
        // 전역 logActivity 함수 사용
        if (typeof window.logActivity === 'function') {
            window.logActivity(action, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${action}: ${message}`);
        }
    }
}

// 전역 AI 서비스 인스턴스 생성
window.HairGatorAI = new HairGatorAIService();

// 기존 함수들과의 호환성을 위한 래퍼 함수들
async function generateHaircareContent(topic) {
    try {
        const result = await window.HairGatorAI.generateHaircareContent(topic, {
            targetAudience: currentTargetAudience,
            naverSEO: true
        });
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'AI 콘텐츠 생성 실패');
        }
    } catch (error) {
        console.error('콘텐츠 생성 오류:', error);
        throw error;
    }
}

async function generateImageWithChatGPT(prompt) {
    try {
        const result = await window.HairGatorAI.generateHaircareImage(prompt);
        
        if (result.success) {
            return result.data.imageUrl;
        } else {
            throw new Error(result.error || 'AI 이미지 생성 실패');
        }
    } catch (error) {
        console.error('이미지 생성 오류:', error);
        throw error;
    }
}

// AI 서비스 설정 함수들
function setAIService(service) {
    return window.HairGatorAI.setAIService(service);
}

function setAIAPIKey(service, key) {
    return window.HairGatorAI.setAPIKey(service, key);
}

// AI 서비스 상태 확인
function getAIServiceStatus() {
    return window.HairGatorAI.getStatistics();
}

// AI 서비스 재시작
function restartAIService() {
    window.HairGatorAI.restart();
    showNotification('success', 'AI 서비스 재시작', 'AI 서비스가 재시작되었습니다.');
}

// 개발자 도구용 전역 함수들
window.HAIRGATOR_AI_DEBUG = {
    getQueue: () => window.HairGatorAI.requestQueue,
    getStats: () => window.HairGatorAI.getStatistics(),
    healthCheck: () => window.HairGatorAI.healthCheck(),
    restart: () => window.HairGatorAI.restart(),
    processQueue: () => window.HairGatorAI.processQueue()
};

console.log('🤖 HAIRGATOR AI Service 로드 완료');
console.log('🔧 디버그 도구: window.HAIRGATOR_AI_DEBUG');
console.log('📊 현재 AI 서비스:', window.HairGatorAI.currentAIService);

export { HairGatorAIService };