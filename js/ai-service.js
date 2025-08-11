// ===== 콘텐츠 생성 프롬프트 (고품질 실무형) =====
    createContentPrompt(queueItem) {
        let styleInstructions = '';
        
        // 학습된 말투가 있으면 적용
        if (this.writingStyle.samples.length >= 3) {
            const style = this.writingStyle.analyzedStyle;
            styleInstructions = `

**학습된 말투 적용:**
- 문장 길이: ${style.sentenceLength === 'long' ? '긴 문장 선호 (50자 이상)' : 
                style.sentenceLength === 'short' ? '짧은 문장 선호 (25자 이하)' : '적당한 길이 문장 (25-50자)'}
- 톤: ${style.tone === 'friendly' ? '친근하고 따뜻한 톤' : '전문적이고 신뢰감 있는 톤'}
- 어휘: ${style.vocabulary === 'professional' ? '전문적인 용어 적극 사용' : '쉬운 일상 용어 위주'}
- 구조: ${style.structure === 'organized' ? '체계적인 소제목과 목록 구조' : '자연스러운 흐름'}

**참// HAIRGATOR - ai-service.js
// 실제 AI API 호출 (사용자 키 입력 방식) + 말투 학습 시스템

class HairGatorAIService {
    constructor() {
        // API 키를 하드코딩하지 않고 사용자 입력으로 받음
        this.config = {
            claude: {
                apiKey: '', // 사용자가 입력할 예정
                baseURL: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-5-sonnet-20241022'
            },
            openai: {
                apiKey: '', // 사용자가 입력할 예정
                baseURL: 'https://api.openai.com/v1/chat/completions',
                imageURL: 'https://api.openai.com/v1/images/generations'
            }
        };
        
        // 말투 학습 시스템
        this.writingStyle = {
            samples: [], // 학습용 텍스트 샘플들
            analyzedStyle: {
                sentenceLength: 'medium',
                tone: 'friendly',
                vocabulary: 'professional',
                structure: 'organized'
            }
        };
        
        // 연결 상태 추적
        this.connectionStatus = {
            claude: false,
            openai: false,
            lastChecked: null
        };
        
        // 통계 추적
        this.statistics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            currentService: 'claude',
            averageResponseTime: 0,
            lastRequestTime: null
        };
        
        console.log('🤖 HAIRGATOR AI 서비스 초기화 완료');
        console.log('🔑 API 키를 입력해주세요');
        
        // 저장된 말투 학습 데이터 로드
        this.loadWritingStyle();
    }
    
    // ===== API 키 설정 =====
    setAPIKey(service, key) {
        if (service === 'claude') {
            this.config.claude.apiKey = key;
            console.log('✅ Claude API 키 설정 완료');
            // 즉시 연결 상태 체크
            this.checkConnectionStatus('claude');
        } else if (service === 'openai') {
            this.config.openai.apiKey = key;
            console.log('✅ OpenAI API 키 설정 완료');
            // 즉시 연결 상태 체크
            this.checkConnectionStatus('openai');
        }
        return true;
    }
    
    // ===== 실시간 연결 상태 체크 =====
    async checkConnectionStatus(service) {
        try {
            const result = await this.testConnection(service);
            this.connectionStatus[service] = result.success;
            this.connectionStatus.lastChecked = new Date().toISOString();
            
            // UI 업데이트 (실제 결과 반영)
            this.updateConnectionUI(service, result.success);
            
            if (result.success) {
                console.log(`✅ ${service.toUpperCase()} 연결 성공`);
            } else {
                console.warn(`❌ ${service.toUpperCase()} 연결 실패: ${result.message}`);
                console.warn('💡 실제 글 작성 시 프록시나 백업 방법을 시도합니다.');
            }
            
            return result.success;
        } catch (error) {
            console.error(`❌ ${service.toUpperCase()} 연결 체크 중 오류:`, error);
            this.connectionStatus[service] = false;
            this.updateConnectionUI(service, false);
            return false;
        }
    }
    
    // 연결 상태 UI 업데이트 (정확한 표시)
    updateConnectionUI(service, isConnected) {
        const statusElement = document.getElementById(`${service}Status`);
        if (statusElement) {
            if (isConnected) {
                statusElement.textContent = '연결됨';
                statusElement.style.color = '#16a34a';
            } else {
                statusElement.textContent = 'API키 설정됨 (CORS 제한)';
                statusElement.style.color = '#f59e0b';
            }
        }
    }
    
    // ===== 말투 학습 시스템 =====
    addWritingSample(title, content, category = 'general') {
        const sample = {
            id: Date.now(),
            title,
            content,
            category,
            timestamp: new Date().toISOString(),
            wordCount: content.length
        };
        
        this.writingStyle.samples.push(sample);
        
        // 최대 20개 샘플만 유지
        if (this.writingStyle.samples.length > 20) {
            this.writingStyle.samples.shift();
        }
        
        // 말투 분석 실행
        this.analyzeWritingStyle();
        
        // 로컬스토리지에 저장
        this.saveWritingStyle();
        
        console.log('📚 말투 학습 샘플 추가됨:', title);
        
        // UI 업데이트
        this.updateWritingSamplesUI();
        
        return sample;
    }
    
    // 말투 분석
    analyzeWritingStyle() {
        if (this.writingStyle.samples.length < 3) {
            console.log('📊 말투 분석을 위해 최소 3개의 샘플이 필요합니다.');
            return;
        }
        
        const allContent = this.writingStyle.samples.map(s => s.content).join(' ');
        
        // 문장 길이 분석
        const sentences = allContent.split(/[.!?]/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
        
        // 톤 분석 (간단한 키워드 기반)
        const friendlyWords = ['안녕', '감사', '좋아', '멋진', '훌륭한', '최고'];
        const professionalWords = ['전문', '체계적', '효과적', '분석', '권장', '제안'];
        
        const friendlyCount = friendlyWords.reduce((count, word) => 
            count + (allContent.match(new RegExp(word, 'g')) || []).length, 0);
        const professionalCount = professionalWords.reduce((count, word) => 
            count + (allContent.match(new RegExp(word, 'g')) || []).length, 0);
        
        // 분석 결과 저장
        this.writingStyle.analyzedStyle = {
            sentenceLength: avgSentenceLength > 50 ? 'long' : avgSentenceLength > 25 ? 'medium' : 'short',
            tone: friendlyCount > professionalCount ? 'friendly' : 'professional',
            vocabulary: professionalCount > 5 ? 'professional' : 'casual',
            structure: allContent.includes('###') ? 'organized' : 'simple'
        };
        
        console.log('🎯 말투 분석 완료:', this.writingStyle.analyzedStyle);
    }
    
    // 말투 학습 데이터 저장
    saveWritingStyle() {
        try {
            localStorage.setItem('hairgator_writing_style', JSON.stringify(this.writingStyle));
        } catch (error) {
            console.warn('말투 학습 데이터 저장 실패:', error);
        }
    }
    
    // 말투 학습 데이터 로드
    loadWritingStyle() {
        try {
            const saved = localStorage.getItem('hairgator_writing_style');
            if (saved) {
                this.writingStyle = JSON.parse(saved);
                console.log('📚 저장된 말투 학습 데이터 로드됨:', this.writingStyle.samples.length + '개 샘플');
            }
        } catch (error) {
            console.warn('말투 학습 데이터 로드 실패:', error);
        }
    }
    
    // 말투 학습 샘플 UI 업데이트
    updateWritingSamplesUI() {
        const container = document.getElementById('writingSamplesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.writingStyle.samples.slice(-10).reverse().forEach(sample => {
            const sampleDiv = document.createElement('div');
            sampleDiv.className = 'writing-sample-item';
            sampleDiv.innerHTML = `
                <div class="sample-header">
                    <span class="sample-title">${sample.title}</span>
                    <span class="sample-date">${new Date(sample.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="sample-preview">${sample.content.substring(0, 100)}...</div>
                <button onclick="AIService.removeWritingSample(${sample.id})" class="remove-sample-btn">삭제</button>
            `;
            container.appendChild(sampleDiv);
        });
    }
    
    // 말투 샘플 삭제
    removeWritingSample(sampleId) {
        this.writingStyle.samples = this.writingStyle.samples.filter(s => s.id !== sampleId);
        this.saveWritingStyle();
        this.updateWritingSamplesUI();
        this.analyzeWritingStyle();
    }
    
    // ===== 메인 블로그 콘텐츠 생성 =====
    async generateBlogContent(queueItem) {
        try {
            const startTime = Date.now();
            console.log(`🚀 실제 AI로 블로그 콘텐츠 생성 시작: "${queueItem.title}"`);
            
            // API 키 확인
            if (!this.config.claude.apiKey && !this.config.openai.apiKey) {
                throw new Error('API 키가 설정되지 않았습니다. 설정 탭에서 API 키를 입력해주세요.');
            }
            
            // Claude 시도 → OpenAI 백업
            let content;
            if (this.config.claude.apiKey) {
                try {
                    content = await this.callClaudeAPI(queueItem);
                    console.log('✅ Claude API 호출 성공');
                } catch (error) {
                    console.log('❌ Claude 실패, OpenAI 시도:', error.message);
                    if (this.config.openai.apiKey) {
                        content = await this.callOpenAIAPI(queueItem);
                        console.log('✅ OpenAI API 호출 성공');
                    } else {
                        throw error;
                    }
                }
            } else if (this.config.openai.apiKey) {
                content = await this.callOpenAIAPI(queueItem);
                console.log('✅ OpenAI API 호출 성공');
            } else {
                throw new Error('사용 가능한 API 키가 없습니다.');
            }
            
            const responseTime = Date.now() - startTime;
            this.updateStatistics(true, responseTime);
            
            console.log(`✅ 실제 AI 콘텐츠 생성 완료: "${queueItem.title}" (${responseTime}ms)`);
            
            return {
                success: true,
                data: content,
                service: this.config.claude.apiKey ? 'claude' : 'openai',
                responseTime: responseTime
            };
            
        } catch (error) {
            this.updateStatistics(false);
            console.error('❌ AI 콘텐츠 생성 실패:', error);
            
            return {
                success: false,
                error: error.message,
                service: 'none'
            };
        }
    }
    
    // ===== Claude API 호출 =====
    async callClaudeAPI(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
        // 여러 방법으로 CORS 우회 시도
        const methods = [
            () => this.directClaudeCall(prompt, queueItem),
            () => this.proxyClaudeCall(prompt, queueItem, 'https://api.allorigins.win/raw?url='),
            () => this.proxyClaudeCall(prompt, queueItem, 'https://corsproxy.io/?'),
            () => this.proxyClaudeCall(prompt, queueItem, 'https://cors-anywhere.herokuapp.com/')
        ];
        
        for (let i = 0; i < methods.length; i++) {
            try {
                const result = await methods[i]();
                console.log(`✅ Claude 호출 성공 (방법 ${i + 1})`);
                return result;
            } catch (error) {
                console.log(`❌ Claude 방법 ${i + 1} 실패:`, error.message);
                if (i === methods.length - 1) {
                    throw error;
                }
            }
        }
    }
    
    // Claude 직접 호출
    async directClaudeCall(prompt, queueItem) {
        const response = await fetch(this.config.claude.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.claude.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.config.claude.model,
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API 오류 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const generatedText = result.content[0].text;
        
        return this.formatResponse(generatedText, queueItem);
    }
    
    // Claude 프록시 호출
    async proxyClaudeCall(prompt, queueItem, proxyUrl) {
        const targetUrl = encodeURIComponent(this.config.claude.baseURL);
        
        const response = await fetch(proxyUrl + targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.claude.apiKey,
                'anthropic-version': '2023-06-01',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                model: this.config.claude.model,
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`프록시 호출 실패 (${response.status})`);
        }
        
        const result = await response.json();
        
        // 프록시 응답 파싱
        let content;
        if (result.contents) {
            content = JSON.parse(result.contents).content[0].text;
        } else if (result.content) {
            content = result.content[0].text;
        } else {
            throw new Error('프록시 응답 파싱 실패');
        }
        
        return this.formatResponse(content, queueItem);
    }
    
    // ===== OpenAI API 호출 =====
    async callOpenAIAPI(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
        const response = await fetch(this.config.openai.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 4000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API 오류 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const generatedText = result.choices[0].message.content;
        
        return this.formatResponse(generatedText, queueItem);
    }
    
    // ===== 콘텐츠 생성 프롬프트 (전문가급 참고자료 기반) =====
    createContentPrompt(queueItem) {
        let styleInstructions = '';
        let referenceSection = '';
        let experienceSection = '';
        
        // 학습된 말투가 있으면 적용
        if (this.writingStyle.samples.length >= 3) {
            const style = this.writingStyle.analyzedStyle;
            styleInstructions = `

**학습된 말투 적용:**
- 문장 길이: ${style.sentenceLength === 'long' ? '긴 문장 선호 (50자 이상)' : 
                style.sentenceLength === 'short' ? '짧은 문장 선호 (25자 이하)' : '적당한 길이 문장 (25-50자)'}
- 톤: ${style.tone === 'friendly' ? '친근하고 따뜻한 톤' : '전문적이고 신뢰감 있는 톤'}
- 어휘: ${style.vocabulary === 'professional' ? '전문적인 용어 적극 사용' : '쉬운 일상 용어 위주'}
- 구조: ${style.structure === 'organized' ? '체계적인 소제목과 목록 구조' : '자연스러운 흐름'}

**참고할 기존 글 스타일:**
${this.writingStyle.samples.slice(-3).map(s => `"${s.content.substring(0, 200)}..."`).join('\n')}

위 스타일을 참고하여 일관성 있는 톤으로 작성해주세요.`;
        }
        
        // 참고 자료 섹션
        if (queueItem.referenceUrls && queueItem.referenceUrls.length > 0) {
            referenceSection = `

**📚 참고 자료 (반드시 활용):**
${queueItem.referenceUrls.map((url, index) => `${index + 1}. ${url}`).join('\n')}

**참고자료 활용 지침:**
- 위 자료들의 핵심 내용을 분석하여 글에 반영하세요
- 직접 인용할 때는 반드시 출처를 명시하세요: [출처: 사이트명 또는 연구명]
- 데이터나 통계는 정확한 수치와 함께 출처를 밝히세요
- 상반된 의견이 있다면 객관적으로 비교 분석하세요
- 참고자료를 바탕으로 한 추가 인사이트를 제공하세요`;
        }
        
        // 개인 경험 섹션
        if (queueItem.personalExperience && queueItem.personalExperience.trim()) {
            experienceSection = `

**💡 작성자의 실제 경험 및 노하우 (핵심 활용):**
"${queueItem.personalExperience}"

**경험 활용 지침:**
- 위 실제 경험을 글의 핵심 근거로 활용하세요
- 구체적인 수치나 사례는 그대로 인용하되, 자연스럽게 녹여내세요
- "실제로 경험해본 결과..." "저희 샵에서 적용한 방법은..." 등으로 표현
- 성공/실패 사례는 객관적인 분석과 함께 제시하세요
- 개인 경험을 일반화할 수 있는 원리나 법칙을 도출하세요`;
        }
        
        // PDF 파일 정보
        let pdfSection = '';
        if (queueItem.pdfFiles && queueItem.pdfFiles.length > 0) {
            pdfSection = `

**📄 첨부된 PDF 참고자료:**
${queueItem.pdfFiles.map((pdf, index) => `${index + 1}. ${pdf.name} (${this.formatFileSize(pdf.size)})`).join('\n')}

**PDF 활용 안내:**
- 첨부된 PDF는 논문이나 전문 자료일 가능성이 높습니다
- 학술적 근거나 연구 결과를 인용할 때 [연구명, 연도] 형식으로 출처 표기
- 전문 용어나 기술적 내용은 일반인도 이해할 수 있게 설명 추가`;
        }
        
        return `당신은 헤어케어 분야의 최고 전문가이자 경험 많은 디자이너입니다. 단순한 정보 제공이 아닌, 실무에서 바로 적용할 수 있는 깊이 있고 전문적인 헤어케어 콘텐츠를 작성해주세요.

**글 정보:**
- 타겟 독자: ${queueItem.targetAudience}
- 글 제목: ${queueItem.title}
- 핵심 키워드: ${queueItem.keywords.join(', ')}
- 톤 앤 매너: ${queueItem.tone}${styleInstructions}${referenceSection}${experienceSection}${pdfSection}

**전문가급 작성 요구사항:**

1. **깊이와 전문성**
   - 표면적인 정보가 아닌 업계 인사이더만 아는 노하우 포함
   - 실제 수치, 데이터, 사례를 구체적으로 제시
   - 일반적인 상식을 넘어선 전문적 관점 제공
   - 현장에서 검증된 실무 팁과 주의사항

2. **근거 기반 작성**
   - 모든 주장은 참고자료나 실제 경험으로 뒷받침
   - 출처가 있는 정보는 반드시 [출처: XX] 형식으로 명시
   - 개인 경험은 "실제 경험 결과..." 형태로 자연스럽게 삽입
   - 통계나 수치는 정확한 출처와 함께 제시

3. **실무 적용성**
   - 독자가 바로 실행할 수 있는 구체적 방법 제시
   - 단계별 실행 가이드 포함
   - 예상되는 문제점과 해결책 미리 제시
   - 비용, 시간, 효과 등 현실적 고려사항 포함

4. **차별화된 인사이트**
   - 일반 블로그에서 찾기 어려운 독창적 관점
   - 업계 트렌드에 대한 심층 분석
   - 성공/실패 사례의 원인 분석
   - 미래 전망과 대응 방안

5. **글 구조 (2000-3000자)**
   - ## 도입부: 문제 제기와 글의 가치 제시
   - ### 본문 1: 이론적 배경과 전문 지식
   - ### 본문 2: 실제 경험과 사례 분석  
   - ### 본문 3: 구체적 실행 방법과 팁
   - ### 본문 4: 주의사항과 고급 노하우
   - ## 결론: 핵심 요약과 실행 로드맵

6. **SEO와 가독성**
   - 키워드는 자연스럽게 본문에 녹여서 포함 (밀도 2-3%)
   - 중요한 포인트는 **굵은 글씨**로 강조
   - 번호나 불릿 포인트로 정보 정리
   - 소제목에는 검색 키워드 포함

7. **신뢰성과 윤리성**
   - 과장된 표현 금지 (예: "100% 보장", "완벽한 해결")
   - 개인차가 있을 수 있음을 명시
   - 전문가 상담이 필요한 경우 안내
   - 광고성 내용 최소화

**최종 목표**: ${queueItem.targetAudience}가 읽고 나서 "이 정보는 정말 전문적이고 실용적이다. 바로 적용해봐야겠다"라고 생각할 수 있는 수준의 콘텐츠

**중요**: 참고자료와 개인 경험을 최대한 활용하여 일반적인 AI 글과 차별화된 전문성을 보여주세요. 단순 정보 나열이 아닌, 독자에게 진정한 가치를 제공하는 인사이트 중심의 글을 작성해주세요.

헤어케어 전문 블로그 글만 작성해주세요 (다른 설명이나 주석은 제외):`;
    }
    
    // 파일 크기 포맷팅 헬퍼 함수
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // ===== 응답 포맷팅 =====
    formatResponse(content, queueItem) {
        return {
            title: queueItem.title,
            content: content,
            metaDescription: this.generateMetaDescription(content),
            keywords: queueItem.keywords,
            targetAudience: queueItem.targetAudience,
            tone: queueItem.tone,
            wordCount: content.length
        };
    }
    
    // ===== 이미지 생성 =====
    async generateImage(prompt, options = {}) {
        try {
            if (!this.config.openai.apiKey) {
                throw new Error('OpenAI API 키가 설정되지 않았습니다.');
            }
            
            const startTime = Date.now();
            const enhancedPrompt = `Professional haircare: ${prompt}. High quality, clean, modern salon setting, professional lighting.`;
            
            const response = await fetch(this.config.openai.imageURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.openai.apiKey}`
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
                const errorText = await response.text();
                throw new Error(`OpenAI 이미지 API 오류 (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            const responseTime = Date.now() - startTime;
            
            this.updateStatistics(true, responseTime);
            
            return {
                success: true,
                data: {
                    imageUrl: result.data[0].url,
                    prompt: enhancedPrompt,
                    originalPrompt: prompt
                },
                service: 'openai',
                responseTime: responseTime
            };
            
        } catch (error) {
            this.updateStatistics(false);
            console.error('❌ 이미지 생성 실패:', error);
            
            return {
                success: false,
                error: error.message,
                fallbackUrl: `https://via.placeholder.com/512x512/667eea/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`,
                service: 'openai'
            };
        }
    }
    
    // ===== 연결 테스트 =====
    async testConnection(service = 'claude') {
        try {
            if (service === 'claude') {
                if (!this.config.claude.apiKey) {
                    return {
                        success: false,
                        service: 'claude',
                        message: 'Claude API 키가 설정되지 않았습니다.'
                    };
                }
                
                const response = await fetch(this.config.claude.baseURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.config.claude.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: this.config.claude.model,
                        max_tokens: 100,
                        messages: [{
                            role: 'user',
                            content: '안녕하세요, 연결 테스트입니다.'
                        }]
                    })
                });
                
                return {
                    success: response.ok,
                    service: 'claude',
                    message: response.ok ? 'Claude 연결 성공' : `Claude 연결 실패 (${response.status})`
                };
                
            } else if (service === 'openai') {
                if (!this.config.openai.apiKey) {
                    return {
                        success: false,
                        service: 'openai',
                        message: 'OpenAI API 키가 설정되지 않았습니다.'
                    };
                }
                
                const response = await fetch(this.config.openai.baseURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.openai.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'user',
                            content: '안녕하세요, 연결 테스트입니다.'
                        }],
                        max_tokens: 50
                    })
                });
                
                return {
                    success: response.ok,
                    service: 'openai',
                    message: response.ok ? 'OpenAI 연결 성공' : `OpenAI 연결 실패 (${response.status})`
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
    
    // ===== 품질 검사 =====
    async checkQuality(content, title, keywords = []) {
        try {
            const analysis = this.analyzeQuality(content, title, keywords);
            return {
                success: true,
                data: analysis,
                service: 'local'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                service: 'local'
            };
        }
    }
    
    // 품질 분석
    analyzeQuality(content, title, keywords = []) {
        const wordCount = content.length;
        const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const headings = (content.match(/^#+\s/gm) || []).length;
        
        // 점수 계산
        let wordCountScore = wordCount >= 1500 && wordCount <= 2500 ? 100 : 
                           wordCount >= 1000 ? 80 : 
                           wordCount >= 500 ? 60 : 30;
        
        let readabilityScore = 100;
        if (sentences.length > 0) {
            const avgWordsPerSentence = wordCount / sentences.length;
            readabilityScore = avgWordsPerSentence > 30 ? 60 : 
                             avgWordsPerSentence > 20 ? 80 : 100;
        }
        
        let structureScore = 0;
        if (headings >= 3) structureScore += 40;
        if (paragraphs >= 5) structureScore += 30;
        if (content.includes('**')) structureScore += 20;
        if (content.includes('- ')) structureScore += 10;
        
        let keywordScore = 50;
        if (keywords.length > 0) {
            const density = this.calculateKeywordDensity(content, keywords);
            keywordScore = density >= 1.5 && density <= 4.0 ? 100 :
                          density >= 1.0 && density <= 5.0 ? 75 : 50;
        }
        
        const overall = Math.round(
            (wordCountScore * 0.25) +
            (readabilityScore * 0.25) +
            (structureScore * 0.25) +
            (keywordScore * 0.25)
        );
        
        return {
            overall,
            wordCount: wordCountScore,
            readability: readabilityScore,
            structure: structureScore,
            keywordDensity: keywordScore,
            details: {
                wordCount,
                sentences: sentences.length,
                paragraphs: paragraphs.length,
                headings
            },
            recommendations: this.generateRecommendations(overall, {
                wordCountScore,
                readabilityScore,
                structureScore,
                keywordScore
            })
        };
    }
    
    // 키워드 밀도 계산
    calculateKeywordDensity(content, keywords) {
        const totalChars = content.length;
        let keywordCount = 0;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            keywordCount += (content.match(regex) || []).length;
        });
        
        return (keywordCount / totalChars) * 100;
    }
    
    // 추천사항 생성
    generateRecommendations(overallScore, scores) {
        const recommendations = [];
        
        if (scores.wordCountScore < 70) {
            recommendations.push('글 길이를 1500자 이상으로 늘려주세요.');
        }
        
        if (scores.readabilityScore < 70) {
            recommendations.push('문장을 더 짧고 명확하게 작성해주세요.');
        }
        
        if (scores.structureScore < 60) {
            recommendations.push('소제목과 목록을 더 추가해주세요.');
        }
        
        if (scores.keywordScore < 70) {
            recommendations.push('키워드를 더 자연스럽게 포함해주세요.');
        }
        
        if (overallScore >= 85) {
            recommendations.push('훌륭한 품질의 글입니다! 네이버 상위 노출 가능성이 높습니다.');
        }
        
        return recommendations;
    }
    
    // 메타 설명 생성
    generateMetaDescription(content) {
        const firstParagraph = content.split('\n\n')[0] || '';
        let metaDesc = firstParagraph.replace(/[#*`]/g, '').trim();
        
        if (metaDesc.length > 150) {
            metaDesc = metaDesc.substring(0, 147) + '...';
        }
        
        return metaDesc;
    }
    
    // ===== 통계 관리 =====
    updateStatistics(success, responseTime = 0) {
        this.statistics.totalRequests++;
        this.statistics.lastRequestTime = new Date().toISOString();
        
        if (success) {
            this.statistics.successfulRequests++;
            
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
    
    getStatistics() {
        return {
            ...this.statistics,
            successRate: this.statistics.totalRequests > 0 ? 
                Math.round((this.statistics.successfulRequests / this.statistics.totalRequests) * 100) : 0
        };
    }
    
    // ===== 서비스 설정 =====
    setCurrentService(service) {
        if (['claude', 'openai'].includes(service)) {
            this.statistics.currentService = service;
            console.log(`🔄 AI 서비스 변경: ${service.toUpperCase()}`);
            return true;
        }
        return false;
    }
    
    // ===== 헬스 체크 =====
    async healthCheck() {
        const claudeTest = await this.testConnection('claude');
        const openaiTest = await this.testConnection('openai');
        
        return {
            timestamp: new Date().toISOString(),
            claude: claudeTest.success,
            openai: openaiTest.success,
            statistics: this.getStatistics()
        };
    }
}

// AI 서비스 인스턴스 생성 및 전역 등록
const AIService = new HairGatorAIService();

// 전역에서 접근 가능하도록 설정
window.AIService = AIService;
window.HairGatorAI = AIService; // 하위 호환성

console.log('🤖 HAIRGATOR AI 서비스 로드 완료');
console.log('🔑 설정 탭에서 API 키를 입력해주세요');
console.log('📝 Claude API 키 또는 OpenAI API 키 중 하나만 있으면 됩니다');
