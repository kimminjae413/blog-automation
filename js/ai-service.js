// HAIRGATOR - ai-service.js
// AI 서비스 관리 및 API 연동 - app.js 호환 버전

// AI 서비스 클래스
class HairGatorAIService {
    constructor() {
        // API 설정 (하드코딩)
        this.config = {
            claude: {
                apiKey: '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',
                baseURL: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-5-sonnet-20241022'
            },
            openai: {
                apiKey: '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',
                imageURL: 'https://api.openai.com/v1/images/generations'
            }
        };
        
        // 통계 및 상태 추적
        this.statistics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            currentService: 'claude',
            averageResponseTime: 0,
            lastRequestTime: null
        };
        
        console.log('🤖 HAIRGATOR AI 서비스 초기화 완료');
        console.log('📝 Claude: 글 작성 전용');
        console.log('🎨 OpenAI: 이미지 생성 전용');
    }
    
    // ===== 메인 블로그 콘텐츠 생성 (app.js 호환) =====
    async generateBlogContent(queueItem) {
        try {
            const startTime = Date.now();
            
            // Claude API 호출
            const content = await this.callClaudeAPI(queueItem);
            
            // 통계 업데이트
            const responseTime = Date.now() - startTime;
            this.updateStatistics(true, responseTime);
            
            console.log(`✅ 블로그 콘텐츠 생성 완료: "${queueItem.title}"`);
            
            return {
                success: true,
                data: content,
                service: 'claude',
                responseTime: responseTime
            };
            
        } catch (error) {
            this.updateStatistics(false);
            console.error('❌ 블로그 콘텐츠 생성 실패:', error);
            
            return {
                success: false,
                error: error.message,
                service: 'claude'
            };
        }
    }
    
    // ===== Claude API 직접 호출 =====
    async callClaudeAPI(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
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
        
        return {
            title: queueItem.title,
            content: generatedText,
            metaDescription: this.generateMetaDescription(generatedText),
            keywords: queueItem.keywords,
            targetAudience: queueItem.targetAudience,
            tone: queueItem.tone,
            wordCount: generatedText.length
        };
    }
    
    // ===== 콘텐츠 생성 프롬프트 =====
    createContentPrompt(queueItem) {
        return `당신은 헤어케어 전문 블로그 작성자입니다. 다음 조건에 맞는 헤어케어 블로그 글을 작성해주세요.

**글 정보:**
- 타겟 독자: ${queueItem.targetAudience}
- 글 제목: ${queueItem.title}
- 핵심 키워드: ${queueItem.keywords.join(', ')}
- 톤 앤 매너: ${queueItem.tone}

**작성 요구사항:**
1. **분량**: 1500-2500자의 완성된 블로그 글
2. **형식**: 마크다운 형식 (제목은 ## 사용, 소제목은 ### 사용)
3. **구조**: 
   - 도입부 (문제 제기 또는 관심 유발)
   - 본문 (3-4개 소제목으로 구성)
   - 결론 (실행 가능한 팁 요약)
4. **내용**: 
   - 실용적이고 구체적인 정보 포함
   - 헤어케어 전문 용어를 적절히 사용하되 이해하기 쉽게 설명
   - 키워드를 자연스럽게 본문에 포함 (키워드 밀도 2-3%)
   - 타겟 독자의 관심사와 고민을 반영
5. **SEO**: 
   - 네이버 검색에 최적화된 구조
   - 불릿 포인트와 번호 목록 활용
   - 굵은 글씨(**텍스트**)로 중요 포인트 강조

**톤 앤 매너**: ${queueItem.tone}
**타겟 독자**: "${queueItem.targetAudience}"에게 직접 말하는 듯한 친근한 어조

블로그 본문만 출력하세요 (다른 설명이나 주석은 제외):`;
    }
    
    // ===== 이미지 생성 (OpenAI) =====
    async generateImage(prompt, options = {}) {
        try {
            const startTime = Date.now();
            
            // 헤어케어 전용 프롬프트 향상
            const enhancedPrompt = `Professional haircare related image: ${prompt}. High quality, clean background, professional lighting, modern hair salon setting.`;
            
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
                throw new Error(`OpenAI API 오류 (${response.status}): ${errorText}`);
            }
            
            const result = await response.json();
            const responseTime = Date.now() - startTime;
            
            this.updateStatistics(true, responseTime);
            console.log(`✅ 이미지 생성 완료: "${prompt}"`);
            
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
            
            // 실패시 플레이스홀더 이미지 반환
            return {
                success: false,
                error: error.message,
                fallbackUrl: `https://via.placeholder.com/512x512/667eea/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`,
                service: 'openai'
            };
        }
    }
    
    // ===== 품질 검사 =====
    async checkQuality(content, title, keywords = []) {
        try {
            const analysis = this.analyzeQuality(content, title, keywords);
            
            console.log(`📊 품질 검사 완료: ${analysis.overall}/100점`);
            
            return {
                success: true,
                data: analysis,
                service: 'local'
            };
            
        } catch (error) {
            console.error('❌ 품질 검사 실패:', error);
            
            return {
                success: false,
                error: error.message,
                service: 'local'
            };
        }
    }
    
    // ===== 품질 분석 =====
    analyzeQuality(content, title, keywords = []) {
        const wordCount = content.length;
        const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const headings = (content.match(/^#+\s/gm) || []).length;
        
        // 점수 계산
        let wordCountScore = 0;
        if (wordCount >= 1500 && wordCount <= 2500) wordCountScore = 100;
        else if (wordCount >= 1000) wordCountScore = 80;
        else if (wordCount >= 500) wordCountScore = 60;
        else wordCountScore = 30;
        
        let readabilityScore = 100;
        if (sentences.length > 0) {
            const avgWordsPerSentence = wordCount / sentences.length;
            if (avgWordsPerSentence > 30) readabilityScore = 60;
            else if (avgWordsPerSentence > 20) readabilityScore = 80;
        }
        
        let structureScore = 0;
        if (headings >= 3) structureScore += 40;
        if (paragraphs >= 5) structureScore += 30;
        if (content.includes('**')) structureScore += 20;
        if (content.includes('- ')) structureScore += 10;
        
        let keywordScore = 50; // 기본값
        if (keywords.length > 0) {
            const density = this.calculateKeywordDensity(content, keywords);
            if (density >= 1.5 && density <= 4.0) keywordScore = 100;
            else if (density >= 1.0 && density <= 5.0) keywordScore = 75;
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
    
    // ===== 키워드 밀도 계산 =====
    calculateKeywordDensity(content, keywords) {
        const totalChars = content.length;
        let keywordCount = 0;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            keywordCount += (content.match(regex) || []).length;
        });
        
        return (keywordCount / totalChars) * 100;
    }
    
    // ===== 개선 추천사항 생성 =====
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
    
    // ===== 메타 설명 생성 =====
    generateMetaDescription(content) {
        const firstParagraph = content.split('\n\n')[0] || '';
        let metaDesc = firstParagraph.replace(/[#*`]/g, '').trim();
        
        if (metaDesc.length > 150) {
            metaDesc = metaDesc.substring(0, 147) + '...';
        }
        
        return metaDesc;
    }
    
    // ===== 연결 테스트 =====
    async testConnection(service = 'claude') {
        try {
            if (service === 'claude') {
                // Claude 연결 테스트
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
                            content: '안녕하세요'
                        }]
                    })
                });
                
                return {
                    success: response.ok,
                    service: 'claude',
                    message: response.ok ? 'Claude 연결 성공' : `Claude 연결 실패 (${response.status})`
                };
                
            } else if (service === 'openai') {
                // OpenAI 연결 테스트 (간단한 텍스트 완성으로 테스트)
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.openai.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'user',
                            content: '안녕하세요'
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
    
    // ===== 통계 업데이트 =====
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
    
    // ===== 통계 조회 =====
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

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HairGatorAIService;
}

console.log('🤖 HAIRGATOR AI 서비스 로드 완료');
console.log('📝 Claude API: 블로그 글 작성 전용');
console.log('🎨 OpenAI API: 이미지 생성 전용');
console.log('🔗 app.js와 완벽 호환 모드');
