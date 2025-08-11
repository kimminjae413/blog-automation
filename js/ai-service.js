// HAIRGATOR - ai-service.js
// AI 서비스 관리 및 API 연동 - 완전수정본 (API키 포함)

// AI 서비스 클래스
class HairGatorAIService {
    constructor() {
        // 개발/운영 환경 감지
        this.isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.serverEndpoint = this.isDevMode ? 'http://localhost:3000' : '';
        
        // API 설정 (하드코딩)
        this.config = {
            claude: {
                apiKey: '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',
                baseURL: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-5-sonnet-20241022'
            },
            openai: {
                apiKey: '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',
                baseURL: 'https://api.openai.com/v1/chat/completions',
                imageURL: 'https://api.openai.com/v1/images/generations',
                model: 'gpt-4o'
            }
        };
        
        // 큐 및 처리 설정
        this.requestQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.rateLimitDelay = 2000;
        this.currentAIService = 'claude'; // 기본값
        this.lastRequestTime = null;
        
        
        // 통계 및 상태 추적
        this.statistics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            currentService: 'claude',
            averageResponseTime: 0,
            lastRequestTime: null
        };

        // 사용자 글쓰기 스타일 학습 데이터
        this.userWritingStyle = {
            tone: 'professional', // professional, casual, friendly
            structure: 'detailed', // detailed, concise, bullet-points
            vocabulary: 'technical', // technical, simple, mixed
            examples: [], // 사용자가 작성한 글 샘플들
            preferences: {
                introStyle: 'direct', // direct, story, question
                conclusionStyle: 'actionable', // actionable, summary, call-to-action
                useEmojis: false,
                preferredLength: 'medium' // short, medium, long
            }
        };
        
        console.log('🤖 HAIRGATOR AI 서비스 초기화 완료');
        console.log('📝 Claude: 글 작성 전용');
        console.log('🎨 OpenAI: 이미지 생성 전용');
        
        // 서비스 초기화
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
        if (this.isDevMode && this.serverEndpoint) {
            try {
                const response = await fetch(`${this.serverEndpoint}/api/health`);
                if (response.ok) {
                    console.log('✅ AI 서버 연결 성공');
                    this.logActivity('서버 연결', 'AI 서버와 연결되었습니다.', 'success');
                } else {
                    throw new Error('서버 응답 오류');
                }
            } catch (error) {
                console.warn('⚠️ AI 서버 미연결 - 클라이언트 직접 호출 모드');
                this.logActivity('서버 연결', 'AI 서버 미연결 - 클라이언트 직접 호출 모드로 실행합니다.', 'warning');
            }
        }
    }
    
    // AI 서비스 설정
    setAIService(service) {
        if (['claude', 'openai'].includes(service)) {
            this.currentAIService = service;
            this.statistics.currentService = service;
            this.logActivity('AI 서비스 변경', `${service.toUpperCase()}로 AI 서비스가 변경되었습니다.`);
            return true;
        }
        return false;
    }
    
    // API 키 설정 (하드코딩되어 있으므로 경고만 표시)
    setAPIKey(service, key) {
        console.warn(`⚠️ API 키가 이미 하드코딩되어 있습니다. 서비스: ${service}`);
        return true;
    
    // ===========================================
    // 사용자 글쓰기 스타일 학습 기능
    // ===========================================
    
    // 사용자 글 샘플 추가
    addWritingSample(title, content, category = 'general') {
        const sample = {
            title,
            content,
            category,
            timestamp: new Date().toISOString(),
            wordCount: content.split(' ').length,
            analyzed: false
        };
        
        this.userWritingStyle.examples.push(sample);
        
        // 최대 20개 샘플만 유지
        if (this.userWritingStyle.examples.length > 20) {
            this.userWritingStyle.examples.shift();
        }
        
        // 스타일 분석 실행
        this.analyzeWritingStyle();
        
        console.log('📚 글쓰기 샘플 추가됨:', title);
        return sample;
    }
    
    // 글쓰기 스타일 분석
    analyzeWritingStyle() {
        if (this.userWritingStyle.examples.length < 3) {
            console.log('📊 스타일 분석을 위해 최소 3개의 샘플이 필요합니다.');
            return;
        }
        
        const samples = this.userWritingStyle.examples;
        
        // 평균 글 길이 분석
        const avgWordCount = samples.reduce((sum, sample) => sum + sample.wordCount, 0) / samples.length;
        if (avgWordCount < 500) {
            this.userWritingStyle.preferences.preferredLength = 'short';
        } else if (avgWordCount > 1500) {
            this.userWritingStyle.preferences.preferredLength = 'long';
        } else {
            this.userWritingStyle.preferences.preferredLength = 'medium';
        }
        
        // 톤 분석 (간단한 키워드 기반)
        const allContent = samples.map(s => s.content).join(' ').toLowerCase();
        const technicalWords = ['기술적', '전문적', '분석', '연구', '데이터', '효과', '성분', '방법', '과정'].filter(word => allContent.includes(word)).length;
        const casualWords = ['정말', '진짜', '완전', '대박', '꿀팁', '간단히', '쉽게', '편하게'].filter(word => allContent.includes(word)).length;
        
        if (technicalWords > casualWords) {
            this.userWritingStyle.tone = 'professional';
            this.userWritingStyle.vocabulary = 'technical';
        } else if (casualWords > technicalWords) {
            this.userWritingStyle.tone = 'casual';
            this.userWritingStyle.vocabulary = 'simple';
        } else {
            this.userWritingStyle.tone = 'friendly';
            this.userWritingStyle.vocabulary = 'mixed';
        }
        
        console.log('🎯 글쓰기 스타일 분석 완료:', this.userWritingStyle);
    }
    
    // 사용자 스타일 기반 프롬프트 생성
    generateStylePrompt() {
        const style = this.userWritingStyle;
        
        let stylePrompt = '\n\n### 글쓰기 스타일 가이드:\n';
        
        // 톤 설정
        switch (style.tone) {
            case 'professional':
                stylePrompt += '- 전문적이고 신뢰할 수 있는 톤으로 작성\n';
                stylePrompt += '- 정확한 정보와 근거를 제시\n';
                break;
            case 'casual':
                stylePrompt += '- 친근하고 편안한 톤으로 작성\n';
                stylePrompt += '- 일상적인 표현과 예시 사용\n';
                break;
            case 'friendly':
                stylePrompt += '- 친절하고 도움이 되는 톤으로 작성\n';
                stylePrompt += '- 독자를 배려하는 표현 사용\n';
                break;
        }
        
        // 어휘 수준
        switch (style.vocabulary) {
            case 'technical':
                stylePrompt += '- 전문 용어를 적절히 사용하되 설명 포함\n';
                break;
            case 'simple':
                stylePrompt += '- 쉽고 이해하기 쉬운 표현 사용\n';
                break;
            case 'mixed':
                stylePrompt += '- 전문 용어와 일반 용어를 적절히 혼합\n';
                break;
        }
        
        // 글 길이
        switch (style.preferences.preferredLength) {
            case 'short':
                stylePrompt += '- 간결하고 핵심적인 내용으로 구성 (1000-1500자)\n';
                break;
            case 'long':
                stylePrompt += '- 상세하고 깊이 있는 내용으로 구성 (2500-3500자)\n';
                break;
            case 'medium':
                stylePrompt += '- 적절한 분량으로 균형 잡힌 구성 (1500-2500자)\n';
                break;
        }
        
        // 구조
        stylePrompt += '- 소제목을 활용한 체계적인 구성\n';
        stylePrompt += '- 실용적인 팁과 구체적인 예시 포함\n';
        stylePrompt += '- 독자 행동을 유도하는 마무리\n';
        
        // 사용자 샘플이 있으면 참고 스타일 추가
        if (style.examples.length > 0) {
            stylePrompt += '\n### 참고할 사용자 글쓰기 스타일:\n';
            const recentSample = style.examples[style.examples.length - 1];
            const samplePreview = recentSample.content.substring(0, 200) + '...';
            stylePrompt += `예시 글: "${samplePreview}"\n`;
            stylePrompt += '위 예시와 유사한 스타일과 접근 방식을 참고하여 작성해주세요.\n';
        }
        
        return stylePrompt;
    }
    
    // ===========================================
    // Claude 글 작성 전용 기능
    // ===========================================
    
    // 헤어케어 콘텐츠 생성 (Claude 전용)
    async generateHaircareContent(topic, options = {}) {
        const requestData = {
            topic: topic,
            options: {
                targetAudience: options.targetAudience || 'hair_professionals',
                contentType: options.contentType || 'guide',
                naverSEO: options.naverSEO !== false,
                includeImages: false, // 이미지는 별도 OpenAI 처리
                length: options.length || 'medium',
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('generate_content', requestData);
    }
    
    // 콘텐츠 품질 검사 (Claude 전용)
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
    
    // 키워드 제안 (Claude 전용)
    async suggestKeywords(topic, options = {}) {
        const requestData = {
            topic: topic,
            options: {
                count: options.count || 10,
                targetAudience: options.targetAudience || 'hair_professionals',
                category: options.category || 'haircare',
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('suggest_keywords', requestData);
    }
    
    // ===========================================
    // OpenAI 이미지 생성 전용 기능
    // ===========================================
    
    // 헤어케어 이미지 생성 (OpenAI 전용)
    async generateHaircareImage(prompt, options = {}) {
        const requestData = {
            prompt: prompt,
            options: {
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                style: options.style || 'natural',
                haircareContext: true,
                ...options
            },
            timestamp: Date.now()
        };
        
        return this.queueRequest('generate_image', requestData);
    }
    
    // 헤어스타일 이미지 생성
    async generateHairstyleImage(hairstyle, options = {}) {
        const enhancedPrompt = `Professional ${hairstyle} hairstyle, salon quality, professional lighting, clean background, detailed hair texture, modern styling, ${options.gender || 'female'} model`;
        
        return this.generateHaircareImage(enhancedPrompt, {
            ...options,
            hairstyleGeneration: true
        });
    }
    
    // ===========================================
    // 요청 큐 및 처리 시스템
    // ===========================================
    
    // 요청 큐에 추가
    async queueRequest(type, data) {
        return new Promise((resolve, reject) => {
            const request = {
                id: Date.now() + Math.random(),
                type,
                data,
                resolve,
                reject,
                timestamp: Date.now(),
                retryCount: 0
            };
            
            this.requestQueue.push(request);
            console.log(`📝 AI 요청 큐에 추가: ${type} (대기: ${this.requestQueue.length})`);
            
            this.processQueue();
        });
    }
    
    // 요청 큐 처리
    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                console.log(`🔄 AI 요청 처리 중: ${request.type}`);
                
                const startTime = Date.now();
                const result = await this.executeRequest(request);
                const responseTime = Date.now() - startTime;
                
                // 통계 업데이트
                this.updateStatistics(true, responseTime);
                
                console.log(`✅ AI 요청 완료: ${request.type} (${responseTime}ms)`);
                request.resolve(result);
                
            } catch (error) {
                console.log(`❌ AI 요청 실패: ${request.type}`, error.message);
                
                // 재시도 로직
                if (request.retryCount < this.retryAttempts) {
                    request.retryCount++;
                    console.log(`🔄 AI 요청 재시도: ${request.type} 요청을 재시도합니다. (${request.retryCount}/${this.retryAttempts})`);
                    this.requestQueue.unshift(request);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                } else {
                    this.updateStatistics(false);
                    console.log(`💥 AI 요청 최종 실패: ${request.type} 요청이 최종 실패했습니다: ${error.message}`);
                    request.reject(error);
                }
            }
        }
        
        this.isProcessing = false;
    }
    
    // 개별 요청 실행
    async executeRequest(request) {
        const { type, data } = request;
        
        // 서버 요청 시도 (개발 모드)
        if (this.isDevMode && this.serverEndpoint) {
            try {
                return await this.callServer(type, data);
            } catch (error) {
                console.warn('🔄 서버 요청 실패, 클라이언트 직접 호출로 전환:', error.message);
            }
        }
        
        // 클라이언트 직접 API 호출
        return await this.callDirectAPI(request);
    }
    
    // 서버 API 호출 (개발 모드)
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
    
    // 클라이언트 직접 API 호출
    async callDirectAPI(request) {
        const { type, data } = request;
        
        // 이미지 생성은 OpenAI, 나머지는 Claude
        if (type === 'generate_image') {
            return await this.callOpenAIAPI(data);
        } else {
            return await this.callClaudeAPI(type, data);
        }
    }
    
    // ===========================================
    // Claude API 호출 (글 작성 전용)
    // ===========================================
    
    async callClaudeAPI(type, data) {
        const { apiKey, baseURL, model } = this.config.claude;
        
        let prompt = '';
        
        switch (type) {
            case 'generate_content':
                prompt = this.buildContentPrompt(data);
                break;
            case 'check_quality':
                prompt = this.buildQualityCheckPrompt(data);
                break;
            case 'suggest_keywords':
                prompt = this.buildKeywordPrompt(data);
                break;
            default:
                throw new Error(`지원하지 않는 요청 타입: ${type}`);
        }
        
        // 사용자 스타일 프롬프트 추가
        prompt += this.generateStylePrompt();
        
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Claude API 오류 (${response.status}): ${errorData}`);
        }
        
        const result = await response.json();
        const generatedText = result.content[0].text;
        
        return this.parseClaudeResponse(type, generatedText, data);
    }
    
    // 콘텐츠 생성 프롬프트 구축
    buildContentPrompt(data) {
        const { topic, options } = data;
        
        // 타겟 독자 정보 (utils.js 의존성 제거)
        const targetAudienceInfo = this.getTargetAudienceInfo(options.targetAudience);
        
        return `헤어케어 전문 블로그 글을 작성해주세요.

주제: ${topic.title}
키워드: ${topic.keywords.join(', ')}
타겟 독자: ${targetAudienceInfo.name}
카테고리: ${topic.category || '헤어케어 일반'}

요구사항:
1. 네이버 SEO에 최적화된 구조
2. 전문적이면서도 이해하기 쉬운 내용
3. 실용적인 팁과 구체적인 예시 포함
4. 소제목을 활용한 체계적인 구성
5. 1500-2500자 분량

구성 요소:
- 매력적인 제목 (50-60자)
- 도입부 (문제 제기 또는 호기심 유발)
- 본문 (3-5개 소제목으로 구성)
- 실용적인 팁 섹션
- 마무리 (행동 유도 및 요약)
- 메타 설명 (120-150자)

응답 형식을 JSON으로 해주세요:
{
  "title": "생성된 제목",
  "content": "마크다운 형식의 본문 내용",
  "metaDescription": "SEO용 메타 설명",
  "tags": ["태그1", "태그2", "태그3"],
  "seoScore": 85
}`;
    }
    
    // 품질 검사 프롬프트 구축
    buildQualityCheckPrompt(data) {
        const { content, options } = data;
        
        return `다음 헤어케어 블로그 글의 품질을 분석해주세요.

제목: ${options.title || '제목 없음'}
본문: ${content}
타겟 키워드: ${(options.targetKeywords || []).join(', ')}

분석 항목:
1. 글자 수 및 가독성
2. 키워드 밀도 및 SEO 최적화
3. 구조 및 논리성
4. 전문성 및 신뢰도
5. 네이버 검색 최적화

응답 형식을 JSON으로 해주세요:
{
  "overallScore": 85,
  "wordCount": {"count": 2150, "score": 90},
  "readability": {"score": 88, "level": "중급"},
  "keywordDensity": {"density": 2.3, "score": 85},
  "structure": {"score": 90, "headings": 5},
  "expertise": {"score": 82, "trustSignals": 3},
  "recommendations": ["개선사항1", "개선사항2"]
}`;
    }
    
    // 키워드 제안 프롬프트 구축
    buildKeywordPrompt(data) {
        const { topic, options } = data;
        
        return `다음 헤어케어 주제에 대한 SEO 키워드를 제안해주세요.

주제: ${topic.title}
기본 키워드: ${topic.keywords.join(', ')}
타겟 독자: ${options.targetAudience}
제안 개수: ${options.count}

요구사항:
1. 네이버 검색 최적화
2. 롱테일 키워드 포함
3. 검색 의도별 분류
4. 난이도별 분류

응답 형식을 JSON으로 해주세요:
{
  "keywords": [
    {"keyword": "키워드1", "searchVolume": "높음", "difficulty": "중", "intent": "정보"},
    {"keyword": "키워드2", "searchVolume": "중간", "difficulty": "낮음", "intent": "구매"}
  ],
  "categories": {
    "정보성": ["키워드1", "키워드2"],
    "상업성": ["키워드3", "키워드4"]
  }
}`;
    }
    
    // Claude 응답 파싱
    parseClaudeResponse(type, text, originalData) {
        try {
            // JSON 응답 파싱 시도
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    success: true,
                    data: parsed,
                    service: 'claude',
                    type: type
                };
            }
        } catch (error) {
            console.warn('JSON 파싱 실패, 텍스트 응답 처리:', error.message);
        }
        
        // JSON 파싱 실패 시 텍스트 기반 처리
        return this.parseTextResponse(type, text, originalData);
    }
    
    // 텍스트 응답 파싱
    parseTextResponse(type, text, originalData) {
        switch (type) {
            case 'generate_content':
                return {
                    success: true,
                    data: {
                        title: originalData.topic.title + ' - 전문가 가이드',
                        content: text,
                        metaDescription: text.substring(0, 150) + '...',
                        tags: originalData.topic.keywords || [],
                        seoScore: 75
                    },
                    service: 'claude',
                    type: type
                };
                
            case 'check_quality':
                const wordCount = text.split(' ').length;
                return {
                    success: true,
                    data: {
                        overallScore: 75,
                        wordCount: { count: wordCount, score: 70 },
                        readability: { score: 75, level: '중급' },
                        keywordDensity: { density: 2.0, score: 70 },
                        structure: { score: 80, headings: 3 },
                        expertise: { score: 70, trustSignals: 2 },
                        recommendations: ['구조 개선 필요', 'SEO 최적화 필요']
                    },
                    service: 'claude',
                    type: type
                };
                
            default:
                return {
                    success: true,
                    data: { content: text },
                    service: 'claude',
                    type: type
                };
        }
    }
    
    // ===========================================
    // OpenAI API 호출 (이미지 생성 전용)
    // ===========================================
    
    async callOpenAIAPI(data) {
        const { apiKey, imageURL } = this.config.openai;
        const { prompt, options } = data;
        
        // 헤어케어 전용 프롬프트 향상
        const enhancedPrompt = this.enhanceImagePrompt(prompt, options);
        
        const response = await fetch(imageURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'dall-e-3',
                prompt: enhancedPrompt,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                n: 1
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenAI API 오류 (${response.status}): ${errorData}`);
        }
        
        const result = await response.json();
        
        return {
            success: true,
            data: {
                imageUrl: result.data[0].url,
                prompt: enhancedPrompt,
                originalPrompt: prompt,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard'
            },
            service: 'openai',
            type: 'generate_image'
        };
    }
    
    // 이미지 프롬프트 향상
    enhanceImagePrompt(originalPrompt, options) {
        let enhancedPrompt = originalPrompt;
        
        // 헤어케어 컨텍스트 추가
        if (options.haircareContext) {
            enhancedPrompt += ', professional hair salon setting, modern styling tools, clean professional environment';
        }
        
        // 품질 향상 키워드 추가
        enhancedPrompt += ', high quality, professional photography, detailed, realistic, clean composition';
        
        // 스타일 지정
        if (options.style === 'natural') {
            enhancedPrompt += ', natural lighting, realistic colors';
        } else if (options.style === 'artistic') {
            enhancedPrompt += ', artistic lighting, creative composition';
        }
        
        return enhancedPrompt;
    }
    
    // ===========================================
    // 유틸리티 및 헬퍼 함수
    // ===========================================
    
    // 타겟 독자 정보 반환 (utils.js 의존성 제거)
    getTargetAudienceInfo(audienceKey) {
        const audiences = {
            hair_professionals: {
                name: "헤어 디자이너 & 헤어 관련 종사자",
                description: "헤어 전문가들을 위한 실무 중심 콘텐츠"
            },
            beauty_professionals: {
                name: "뷰티 전문가 & 미용사",
                description: "뷰티 전문가들을 위한 종합 미용 정보"
            },
            general_users: {
                name: "일반인",
                description: "헤어케어에 관심 있는 일반인들을 위한 가이드"
            },
            beginners: {
                name: "헤어케어 초보자",
                description: "헤어케어를 처음 시작하는 분들을 위한 기초 정보"
            }
        };
        
        return audiences[audienceKey] || audiences.general_users;
    }
    
    // 통계 업데이트
    updateStatistics(success, responseTime = 0) {
        this.statistics.totalRequests++;
        this.statistics.lastRequestTime = new Date().toISOString();
        
        if (success) {
            this.statistics.successfulRequests++;
            
            // 평균 응답 시간 계산
            if (responseTime > 0) {
                const currentAvg = this.statistics.averageResponseTime;
                const totalSuccessful = this.statistics.successfulRequests;
                this.statistics.averageResponseTime = 
                    ((currentAvg * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
            }
        } else {
            this.statistics.failedRequests++;
        }
    }
    
    // API 키 설정 (하드코딩되어 있으므로 경고만 표시)
    setAPIKey(service, key) {
        console.warn('⚠️ API 키가 이미 하드코딩되어 있습니다. 보안상 하드코딩은 권장하지 않습니다.');
        return true;
    }
    
    // 연결 상태 테스트
    async testConnection(service = 'claude') {
        try {
            if (service === 'claude') {
                // Claude 연결 테스트
                const testResult = await this.generateHaircareContent({
                    title: "연결 테스트",
                    keywords: ["테스트"]
                }, {
                    targetAudience: 'general_users',
                    length: 'short'
                });
                
                return {
                    success: testResult.success,
                    service: 'claude',
                    message: '글 작성 서비스 연결 성공'
                };
            } else if (service === 'openai') {
                // OpenAI 연결 테스트
                const testResult = await this.generateHaircareImage('test haircut style');
                
                return {
                    success: testResult.success,
                    service: 'openai',
                    message: '이미지 생성 서비스 연결 성공'
                };
            }
        } catch (error) {
            return {
                success: false,
                service: service,
                message: `연결 테스트 실패: ${error.message}`
            };
        }
    }
    
    // 마크다운을 HTML로 변환 (간단한 변환)
    markdownToHTML(markdown) {
        return markdown
            .replace(/^### (.+)/gm, '<h3>$1</h3>')
            .replace(/^## (.+)/gm, '<h2>$1</h2>')
            .replace(/^# (.+)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>');
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
    
    // 상세 품질 분석 (기존 함수 복원)
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
    
    // SEO 점수 계산
    calculateSEOScore(content) {
        let score = 0;
        
        // 키워드 밀도 체크 (전역 currentTopic 사용)
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
    
    // 건강 상태 체크
    async healthCheck() {
        const status = {
            timestamp: new Date().toISOString(),
            aiService: this.currentAIService,
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing,
            serverConnection: false,
            lastRequestTime: this.lastRequestTime || null,
            statistics: this.getStatistics()
        };
        
        // 서버 연결 체크 (개발 모드)
        if (this.isDevMode && this.serverEndpoint) {
            try {
                const response = await fetch(`${this.serverEndpoint}/api/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
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
    
    // 서비스 재시작
    restart() {
        this.requestQueue = [];
        this.isProcessing = false;
        this.statistics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            currentService: this.currentAIService,
            averageResponseTime: 0,
            lastRequestTime: null
        };
        
        console.log('🔄 AI 서비스 재시작 완료');
        this.logActivity('서비스 재시작', 'AI 서비스가 재시작되었습니다.', 'info');
    }
    
    // 유틸리티 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 로그 활동 (전역 함수 사용)
    logActivity(action, message, type = 'info') {
        if (typeof window.logActivity === 'function') {
            window.logActivity(action, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${action}: ${message}`);
        }
    }
}

// AI 서비스 인스턴스 생성 및 전역 등록
const hairGatorAI = new HairGatorAIService();

// 전역에서 접근 가능하도록 설정
window.HairGatorAI = hairGatorAI;

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HairGatorAIService;
}

console.log('🤖 HAIRGATOR AI 서비스 로드 완료');
console.log('📝 Claude API: 글 작성 전용 서비스');
console.log('🎨 OpenAI API: 이미지 생성 전용 서비스');
console.log('🧠 사용자 글쓰기 스타일 학습 기능 포함');

// 초기 연결 테스트 (개발 모드에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 개발 모드: AI 서비스 연결 테스트 실행');
    
    setTimeout(async () => {
        try {
            const claudeTest = await hairGatorAI.testConnection('claude');
            const openaiTest = await hairGatorAI.testConnection('openai');
            
            console.log('📝 Claude 테스트:', claudeTest.success ? '✅ 성공' : '❌ 실패');
            console.log('🎨 OpenAI 테스트:', openaiTest.success ? '✅ 성공' : '❌ 실패');
        } catch (error) {
            console.warn('⚠️ 초기 연결 테스트 중 오류:', error.message);
        }
    }, 2000);
}
