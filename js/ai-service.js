// 모의 블로그 콘텐츠 생성
    createMockBlogContent(queueItem) {
        const templates = {
            "겨울철 건조한 모발 완벽 관리법": `
## 겨울철 건조한 모발, 이렇게 관리하세요!

추운 겨울이 다가오면서 많은 분들이 **모발 건조**로 고민이 많으실 텐데요. 특히 ${queueItem.targetAudience}에게는 더욱 신경 쓰이는 부분일 것입니다.

겨울철 모발 관리는 단순히 샴푸만 바꾸는 것으로는 부족합니다. **체계적인 케어 루틴**과 **올바른 제품 선택**이 건강한 모발을 유지하는 핵심입니다.

### 1. 겨울철 모발이 건조해지는 과학적 원리

**낮은 습도**와 **차가운 바람**, 그리고 **실내 난방**으로 인해 모발의 **수분**이 빠르게 증발합니다. 

#### 주요 원인들:
- **실내외 온도차** (20도 이상): 모발 큐티클 손상 가속화
- **습도 20% 이하**: 모발 수분 손실률 300% 증가
- **정전기 발생**: 큐티클 들뜸으로 인한 거칠어짐
- **헤어드라이어 과도 사용**: 모발 단백질 변성

### 2. 단계별 겨울 헤어케어 루틴

#### 🧴 1단계: 올바른 세정
**보습 성분**이 풍부한 샴푸를 선택하고, **38도 이하의 미지근한 물**을 사용하세요.

- **세라마이드**, **히알루론산** 함유 제품 추천
- **황산계 계면활성제** (SLS, SLES) 피하기
- 주 2-3회 세정으로 충분

#### 💆‍♀️ 2단계: 집중 영양 공급
**딥컨디셔닝 트리트먼트**를 주 2회 이상 실시하세요.

- **케라틴 단백질** 보충으로 모발 강화
- **아르간오일**, **마카다미아오일** 활용
- 모발 끝부분부터 중간까지 집중 케어

#### 🌡️ 3단계: 열 보호 및 스타일링
**히트 프로텍터** 사용은 필수입니다.

- 드라이어 온도 80도 이하 유지
- **세라믹 코팅** 도구 사용
- 찬바람으로 마무리하여 큐티클 정리

### 3. 겨울철 필수 헤어케어 아이템

#### 🔹 기초 케어
1. **보습 샴푸**: 아미노산 계면활성제 기반
2. **단백질 컨디셔너**: 저분자 케라틴 함유
3. **헤어 오일**: 식물성 오일 (호호바, 아르간)

#### 🔹 집중 케어
1. **헤어 마스크**: 주 1-2회 15분간 적용
2. **리브인 트리트먼트**: 매일 사용 가능한 가벼운 제형
3. **스칼프 세럼**: 두피 건조 방지

### 4. 라이프스타일 개선 방법

#### 🏠 실내 환경 관리
- **가습기** 사용으로 습도 40-60% 유지
- **공기청정기**로 미세먼지 차단
- 취침 시 **실크 베개커버** 사용

#### 🧥 외출 시 보호 전략
- **모자**나 **스카프**로 바람 차단
- **UV 차단** 헤어 스프레이 사용
- 외출 후 즉시 **브러싱**으로 정전기 제거

### 5. 전문가가// HAIRGATOR - ai-service.js
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
            
            // 여러 방법으로 AI API 호출 시도
            let content;
            
            // 방법 1: 직접 호출 시도
            try {
                content = await this.callClaudeAPIDirectly(queueItem);
                console.log('✅ 직접 API 호출 성공');
            } catch (error) {
                console.log('❌ 직접 호출 실패, 대안 방법 시도:', error.message);
                
                // 방법 2: 다른 프록시 서비스 시도
                try {
                    content = await this.callClaudeAPIWithProxy(queueItem);
                    console.log('✅ 프록시 API 호출 성공');
                } catch (proxyError) {
                    console.log('❌ 프록시 호출도 실패:', proxyError.message);
                    
                    // 방법 3: OpenAI API 시도 (Claude 대신)
                    try {
                        content = await this.callOpenAIAPIAsBackup(queueItem);
                        console.log('✅ OpenAI 백업 API 호출 성공');
                    } catch (openaiError) {
                        console.log('❌ 모든 AI API 호출 실패');
                        throw new Error('모든 AI 서비스 연결 실패. 네트워크를 확인해주세요.');
                    }
                }
            }
            
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
    
    // Claude API 직접 호출 (기본 방법)
    async callClaudeAPIDirectly(queueItem) {
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
    
    // CORS 프록시를 통한 호출
    async callClaudeAPIWithProxy(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
        // 여러 프록시 서비스 시도
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-proxy.htmldriven.com/?url='
        ];
        
        for (const proxy of proxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(this.config.claude.baseURL), {
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
                
                if (response.ok) {
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
            } catch (error) {
                console.log(`프록시 ${proxy} 실패:`, error.message);
                continue;
            }
        }
        
        throw new Error('모든 프록시 서비스 실패');
    }
    
    // OpenAI를 백업으로 사용
    async callOpenAIAPIAsBackup(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.openai.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API 오류 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const generatedText = result.choices[0].message.content;
        
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
    
    // ===== Claude API 직접 호출 =====
    async callClaudeAPI(queueItem) {
        const prompt = this.createContentPrompt(queueItem);
        
        // CORS 프록시 사용
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = this.config.claude.baseURL;
        
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
            // CORS 프록시 실패 시 시뮬레이션 모드로 전환
            console.warn('API 호출 실패, 시뮬레이션 모드로 전환');
            return this.generateMockContent(queueItem);
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
    
    // ===== 시뮬레이션 콘텐츠 생성 (API 실패 시) =====
    generateMockContent(queueItem) {
        const mockContent = this.createMockBlogContent(queueItem);
        
        return {
            title: queueItem.title,
            content: mockContent,
            metaDescription: this.generateMetaDescription(mockContent),
            keywords: queueItem.keywords,
            targetAudience: queueItem.targetAudience,
            tone: queueItem.tone,
            wordCount: mockContent.length
        };
    }
    
    // 모의 블로그 콘텐츠 생성
    createMockBlogContent(queueItem) {
        const templates = {
            "겨울철 건조한 모발 완벽 관리법": `
## 겨울철 건조한 모발, 이렇게 관리하세요!

추운 겨울이 다가오면서 많은 분들이 **모발 건조**로 고민이 많으실 텐데요. 특히 ${queueItem.targetAudience}에게는 더욱 신경 쓰이는 부분일 것입니다.

### 1. 겨울철 모발이 건조해지는 이유

**낮은 습도**와 **차가운 바람**, 그리고 **실내 난방**으로 인해 모발의 **수분**이 빠르게 증발합니다. 

- 실내외 온도차로 인한 모발 스트레스
- 정전기 발생으로 인한 **큐티클 손상**
- 헤어드라이어 과도한 사용

### 2. 효과적인 헤어케어 방법

#### 🧴 올바른 샴푸 선택
- **보습형 샴푸** 사용하기
- **황산계 성분** 피하기
- 미지근한 물로 감기

#### 💆‍♀️ 딥컨디셔닝 케어
- 주 2-3회 **헤어팩** 사용
- **아르간오일**이나 **코코넛오일** 활용
- 끝부분 집중 케어

### 3. 일상 관리 팁

**실내 습도**를 40-60%로 유지하고, 외출 시에는 **모자**나 **스카프**로 모발을 보호하세요.

### 4. 추천 제품

HAIRGATOR의 **윈터 케어 라인**을 사용하시면 겨울철 건조한 모발도 촉촉하게 관리할 수 있습니다.

## 마무리

올바른 **헤어케어** 습관으로 건강하고 윤기나는 모발을 유지하세요! 
`,

            "고객 재방문율 200% 높이는 상담 노하우": `
## 고객 재방문율을 높이는 헤어샵 상담의 비밀

헤어샵 운영에서 가장 중요한 것은 바로 **고객 만족**과 **재방문율**입니다. ${queueItem.targetAudience}를 위한 실전 노하우를 공유해드립니다.

### 1. 첫 상담이 모든 것을 결정한다

**첫인상**은 3초 만에 결정됩니다. 고객이 매장에 들어서는 순간부터 세심한 배려가 필요합니다.

- 따뜻한 인사와 미소
- **고객의 이름** 기억하기
- 편안한 분위기 조성

### 2. 효과적인 상담 프로세스

#### 📋 상담 단계별 가이드

1. **경청하기**: 고객의 요구사항 파악
2. **제안하기**: 전문가적 조언 제공
3. **확인하기**: 최종 결정 전 재확인

#### 💡 상담 시 주의사항
- 과도한 권유 피하기
- **고객 예산** 고려하기
- 정직한 조언 제공

### 3. 신뢰 관계 구축 방법

**전문성**을 바탕으로 한 진정성 있는 상담이 고객의 마음을 움직입니다.

### 4. 사후 관리의 중요성

시술 후에도 지속적인 **케어 방법** 안내와 **정기적인 연락**으로 고객과의 관계를 유지하세요.

## 성공하는 헤어샵의 비결

고객 한 분 한 분을 소중히 여기는 마음이 바로 **재방문율 200% 증가**의 비결입니다!
`,

            "default": `
## ${queueItem.title}

${queueItem.targetAudience}을 위한 전문적인 헤어케어 가이드를 소개해드립니다.

### 주요 포인트

이번 글에서는 **${queueItem.keywords.join(', ')}**와 관련된 중요한 정보들을 ${queueItem.tone} 톤으로 설명해드리겠습니다.

### 1. 기본 이해

헤어케어의 기본 원리부터 차근차근 알아보겠습니다.

### 2. 실전 적용법

일상에서 쉽게 따라할 수 있는 **실용적인 팁**들을 제공해드립니다.

### 3. 전문가 조언

HAIRGATOR 전문팀이 추천하는 **핵심 노하우**를 공유합니다.

### 4. 주의사항

케어 시 반드시 알아두어야 할 **중요한 포인트**들입니다.

## 마무리

올바른 헤어케어로 건강하고 아름다운 모발을 만들어보세요!

---
*HAIRGATOR와 함께하는 전문 헤어케어*
`
        };
        
        return templates[queueItem.title] || templates["default"];
    }
    
    // ===== 기존 함수들 계속... =====
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
