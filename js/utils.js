// HAIRGATOR - utils.js
// 유틸리티 함수 및 공통 기능 - 완전개편 (관리자모드+간편작성)

// 시스템 통계 및 상태
let systemStats = {
    totalPosts: 0,
    publishedPosts: 0,
    qualityScore: 0,
    systemStatus: '가동중'
};

// 네이버 SEO 최적화를 위한 품질 기준
const seoQualityStandards = {
    wordCount: { min: 1500, ideal: 2500, max: 5000 },
    keywordDensity: { min: 1.5, ideal: 2.5, max: 4.0 },
    titleLength: { min: 30, ideal: 50, max: 60 },
    metaLength: { min: 120, ideal: 140, max: 150 },
    headingCount: { min: 3, ideal: 5, max: 10 },
    engagement: { min: 1, ideal: 3, max: 5 }
};

// ===================================
// 관리자 모드: 타겟 독자 관리 시스템
// ===================================

// 기본 타겟 독자 데이터 (수정 가능)
let targetAudienceData = {
    hair_professionals: {
        name: "헤어 디자이너 & 헤어 관련 종사자",
        description: "헤어 전문가들을 위한 실무 중심 콘텐츠를 작성합니다.",
        color: "#8B5CF6", // 보라색
        icon: "✂️",
        features: [
            "최신 헤어 트렌드 및 기법",
            "고객 상담 및 서비스 노하우", 
            "살롱 운영 및 마케팅 팁",
            "제품 지식 및 기술 정보"
        ],
        categories: [
            { id: "advanced_techniques", name: "고급 기술", icon: "🎨" },
            { id: "salon_management", name: "살롱 운영", icon: "💼" },
            { id: "client_consultation", name: "고객 상담", icon: "💬" },
            { id: "product_knowledge", name: "제품 분석", icon: "🧪" }
        ],
        topics: {
            advanced_techniques: [
                {
                    id: "balayage_2024",
                    title: "2024년 발라야지 최신 기법",
                    keywords: ["발라야지", "헤어컬러", "그라데이션", "기법"],
                    difficulty: "advanced",
                    estimatedReadTime: 8
                },
                {
                    id: "layer_cutting_pro",
                    title: "프로를 위한 레이어 커팅 마스터클래스",
                    keywords: ["레이어컷", "커팅기법", "헤어디자인"],
                    difficulty: "expert",
                    estimatedReadTime: 12
                }
            ],
            salon_management: [
                {
                    id: "salon_marketing_2024",
                    title: "헤어샵 마케팅 전략 완전정복",
                    keywords: ["헤어샵", "마케팅", "고객유치", "운영"],
                    difficulty: "intermediate",
                    estimatedReadTime: 10
                }
            ]
        },
        writingStyle: {
            tone: "전문적이면서 실무 중심적",
            language: "전문 용어 사용, 구체적 기법 설명",
            structure: "이론 → 실습 → 응용 순서"
        }
    },
    
    beauty_enthusiasts: {
        name: "뷰티 애호가 & 헤어케어 관심층",
        description: "뷰티에 관심 많은 일반인들을 위한 트렌드 정보를 제공합니다.",
        color: "#EC4899", // 핑크색
        icon: "💖",
        features: [
            "최신 뷰티 트렌드 분석",
            "제품 리뷰 및 추천",
            "홈케어 노하우",
            "스타일링 팁"
        ],
        categories: [
            { id: "trend_analysis", name: "트렌드 분석", icon: "📈" },
            { id: "product_reviews", name: "제품 리뷰", icon: "⭐" },
            { id: "diy_care", name: "홈케어 DIY", icon: "🏠" },
            { id: "styling_tips", name: "스타일링 팁", icon: "💄" }
        ],
        topics: {
            trend_analysis: [
                {
                    id: "hair_trends_2024",
                    title: "2024년 봄 헤어 트렌드 완전분석",
                    keywords: ["헤어트렌드", "2024", "봄", "유행"],
                    difficulty: "beginner",
                    estimatedReadTime: 6
                }
            ],
            product_reviews: [
                {
                    id: "shampoo_comparison",
                    title: "드럭스토어 샴푸 vs 프리미엄 브랜드 비교",
                    keywords: ["샴푸추천", "제품비교", "가성비"],
                    difficulty: "beginner",
                    estimatedReadTime: 8
                }
            ]
        },
        writingStyle: {
            tone: "친근하고 트렌디함",
            language: "쉬운 용어, 생생한 후기",
            structure: "트렌드 → 분석 → 적용법 순서"
        }
    },
    
    salon_owners: {
        name: "살롱 & 헤어샵 운영자",
        description: "헤어샵 사장님들을 위한 경영 및 운영 정보를 제공합니다.",
        color: "#059669", // 초록색
        icon: "🏢",
        features: [
            "살롱 경영 전략",
            "직원 관리 및 교육",
            "고객 서비스 향상",
            "매출 증대 방안"
        ],
        categories: [
            { id: "business_strategy", name: "경영 전략", icon: "📊" },
            { id: "staff_management", name: "직원 관리", icon: "👥" },
            { id: "customer_service", name: "고객 서비스", icon: "🤝" },
            { id: "revenue_growth", name: "매출 관리", icon: "💰" }
        ],
        topics: {
            business_strategy: [
                {
                    id: "salon_digital_marketing",
                    title: "헤어샵 디지털 마케팅 완전가이드",
                    keywords: ["헤어샵마케팅", "SNS마케팅", "디지털"],
                    difficulty: "intermediate",
                    estimatedReadTime: 15
                }
            ]
        },
        writingStyle: {
            tone: "비즈니스 중심, 실용적",
            language: "경영 용어, 구체적 수치",
            structure: "현황 → 전략 → 실행방안 순서"
        }
    },
    
    general_consumers: {
        name: "일반 소비자",
        description: "헤어케어에 관심있는 일반인들을 위한 기초 정보를 제공합니다.",
        color: "#3B82F6", // 파란색
        icon: "👤",
        features: [
            "기초 헤어케어 방법",
            "제품 선택 가이드",
            "헤어 트러블 해결",
            "간단한 홈케어 팁"
        ],
        categories: [
            { id: "basic_care", name: "기초 케어", icon: "🧴" },
            { id: "product_guide", name: "제품 가이드", icon: "🛍️" },
            { id: "trouble_solving", name: "트러블 해결", icon: "🔧" },
            { id: "home_care", name: "홈케어", icon: "🏠" }
        ],
        topics: {
            basic_care: [
                {
                    id: "shampoo_basics",
                    title: "올바른 샴푸 방법 A부터 Z까지",
                    keywords: ["샴푸", "기초", "올바른방법"],
                    difficulty: "beginner",
                    estimatedReadTime: 5
                }
            ]
        },
        writingStyle: {
            tone: "쉽고 친근함",
            language: "일상 용어, 쉬운 설명",
            structure: "문제 → 해결책 → 실천방법 순서"
        }
    },

    // ===================================
    // 🆕 기타 (간편 작성 모드)
    // ===================================
    custom_simple: {
        name: "기타 (간편 작성)",
        description: "타겟과 간단한 스토리만 입력하면 AI가 자동으로 완성해드립니다.",
        color: "#F59E0B", // 주황색
        icon: "✨",
        features: [
            "타겟 독자만 설정",
            "5줄 스토리 입력",
            "AI 자동 확장",
            "즉시 콘텐츠 생성"
        ],
        categories: [
            { id: "simple_write", name: "간편 작성", icon: "✍️" }
        ],
        topics: {
            simple_write: [
                {
                    id: "custom_template",
                    title: "사용자 맞춤 주제",
                    keywords: ["맞춤", "간편", "작성"],
                    difficulty: "auto",
                    estimatedReadTime: "자동계산"
                }
            ]
        },
        writingStyle: {
            tone: "타겟에 맞춰 자동 조정",
            language: "입력된 스토리 기반 자동 생성",
            structure: "스토리 → AI 확장 → 완성"
        }
    }
};

// ===================================
// 관리자 모드: 타겟 독자 관리 함수들
// ===================================

// 새 타겟 독자 추가
function addNewTargetAudience(targetData) {
    const id = targetData.id || `target_${Date.now()}`;
    targetAudienceData[id] = {
        name: targetData.name,
        description: targetData.description,
        color: targetData.color || "#6B7280",
        icon: targetData.icon || "👤",
        features: targetData.features || [],
        categories: targetData.categories || [],
        topics: targetData.topics || {},
        writingStyle: targetData.writingStyle || {
            tone: "친근함",
            language: "쉬운 용어",
            structure: "기본 구조"
        }
    };
    saveTargetAudienceData();
    return id;
}

// 타겟 독자 수정
function updateTargetAudience(targetId, updates) {
    if (targetAudienceData[targetId]) {
        Object.assign(targetAudienceData[targetId], updates);
        saveTargetAudienceData();
        return true;
    }
    return false;
}

// 타겟 독자 삭제
function deleteTargetAudience(targetId) {
    if (targetId !== 'custom_simple' && targetAudienceData[targetId]) {
        delete targetAudienceData[targetId];
        saveTargetAudienceData();
        return true;
    }
    return false;
}

// 카테고리 추가
function addCategoryToTarget(targetId, categoryData) {
    if (targetAudienceData[targetId]) {
        const category = {
            id: categoryData.id || `cat_${Date.now()}`,
            name: categoryData.name,
            icon: categoryData.icon || "📁"
        };
        targetAudienceData[targetId].categories.push(category);
        targetAudienceData[targetId].topics[category.id] = [];
        saveTargetAudienceData();
        return category.id;
    }
    return null;
}

// 주제 추가
function addTopicToCategory(targetId, categoryId, topicData) {
    if (targetAudienceData[targetId] && targetAudienceData[targetId].topics[categoryId]) {
        const topic = {
            id: topicData.id || `topic_${Date.now()}`,
            title: topicData.title,
            keywords: topicData.keywords || [],
            difficulty: topicData.difficulty || "beginner",
            estimatedReadTime: topicData.estimatedReadTime || 5
        };
        targetAudienceData[targetId].topics[categoryId].push(topic);
        saveTargetAudienceData();
        return topic.id;
    }
    return null;
}

// ===================================
// 간편 작성 모드 전용 함수들
// ===================================

// 간편 작성용 프롬프트 생성
function generateSimpleWritingPrompt(targetAudience, storyLines) {
    const prompt = `
헤어케어 전문 블로그 글을 작성해주세요.

타겟 독자: ${targetAudience}
작성하고 싶은 내용:
${storyLines.map((line, index) => `${index + 1}. ${line}`).join('\n')}

요구사항:
1. 위 내용을 바탕으로 1500-2500자 분량의 완성된 블로그 글 작성
2. 타겟 독자에 맞는 톤과 언어 사용
3. SEO 최적화된 제목과 구조
4. 실용적이고 구체적인 정보 포함
5. 자연스러운 마크다운 형식

응답 형식:
{
  "title": "매력적인 제목 (50-60자)",
  "content": "마크다운 형식의 완성된 본문",
  "metaDescription": "SEO용 메타 설명 (120-150자)",
  "tags": ["관련", "태그", "목록"],
  "targetKeywords": ["핵심", "키워드"],
  "estimatedReadTime": 8
}
`;
    return prompt;
}

// 간편 작성 데이터 검증
function validateSimpleWritingInput(targetAudience, storyLines) {
    const errors = [];
    
    if (!targetAudience || targetAudience.trim() === '') {
        errors.push('타겟 독자를 입력해주세요.');
    }
    
    if (!storyLines || storyLines.length === 0) {
        errors.push('최소 1줄 이상의 스토리를 입력해주세요.');
    }
    
    if (storyLines && storyLines.length > 10) {
        errors.push('스토리는 최대 10줄까지 입력 가능합니다.');
    }
    
    // 각 줄 길이 검증
    storyLines.forEach((line, index) => {
        if (line.trim().length < 5) {
            errors.push(`${index + 1}번째 줄이 너무 짧습니다. (최소 5자)`);
        }
        if (line.trim().length > 200) {
            errors.push(`${index + 1}번째 줄이 너무 깁니다. (최대 200자)`);
        }
    });
    
    return errors;
}

// ===================================
// 기존 헤어케어 주제 데이터 (유지)
// ===================================

// 헤어케어 전문 주제 데이터
const haircareTopics = {
    basic: [
        {
            id: 1,
            title: "모발 타입별 맞춤 샴푸 선택법",
            keywords: ["샴푸", "모발타입", "헤어케어", "건성모발", "지성모발"],
            category: "basic",
            targetAudience: "헤어케어 초보자",
            difficulty: "beginner"
        },
        {
            id: 2,
            title: "올바른 헤어 드라이 방법과 주의사항",
            keywords: ["헤어드라이어", "모발건조", "헤어케어", "모발손상예방"],
            category: "basic",
            targetAudience: "일반인",
            difficulty: "beginner"
        },
        {
            id: 3,
            title: "트리트먼트 vs 헤어팩 완벽 비교",
            keywords: ["트리트먼트", "헤어팩", "모발영양", "헤어케어제품"],
            category: "basic",
            targetAudience: "헤어케어 관심층",
            difficulty: "intermediate"
        }
    ],
    styling: [
        {
            id: 4,
            title: "2024년 최신 헤어 트렌드 완벽 가이드",
            keywords: ["헤어트렌드", "헤어스타일", "2024트렌드", "유행헤어"],
            category: "styling",
            targetAudience: "트렌드 팔로워",
            difficulty: "intermediate"
        },
        {
            id: 5,
            title: "얼굴형별 어울리는 헤어스타일 찾기",
            keywords: ["얼굴형", "헤어스타일", "헤어컨설팅", "스타일링"],
            category: "styling",
            targetAudience: "스타일링 고민층",
            difficulty: "intermediate"
        }
    ],
    treatment: [
        {
            id: 6,
            title: "탈모 예방과 효과적인 관리법",
            keywords: ["탈모예방", "모발관리", "두피케어", "헤어로스"],
            category: "treatment",
            targetAudience: "탈모 고민층",
            difficulty: "expert"
        }
    ]
};

// ===================================
// 기존 분석 함수들 (복원)
// ===================================

// 키워드 밀도 점수 계산
function calculateKeywordDensityScore(content, keywords) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    
    if (totalWords === 0) return 0;
    
    let totalKeywordCount = 0;
    keywords.forEach(keyword => {
        const keywordCount = content.toLowerCase().split(keyword.toLowerCase()).length - 1;
        totalKeywordCount += keywordCount;
    });
    
    return (totalKeywordCount / totalWords) * 100;
}

// 음절 수 계산 (근사치)
function calculateAvgSyllables(words) {
    const koreanSyllables = words.reduce((sum, word) => {
        return sum + (word.match(/[가-힣]/g) || []).length;
    }, 0);
    
    const englishSyllables = words.reduce((sum, word) => {
        const englishWord = word.replace(/[^a-zA-Z]/g, '');
        return sum + Math.max(1, (englishWord.match(/[aeiouAEIOU]/g) || []).length);
    }, 0);
    
    return (koreanSyllables + englishSyllables) / words.length || 1;
}

// 글자 수 분석
function analyzeWordCount(content) {
    const count = content.length;
    const standards = seoQualityStandards.wordCount;
    
    let score = 0;
    if (count >= standards.min && count <= standards.max) {
        if (count >= standards.ideal - 200 && count <= standards.ideal + 200) {
            score = 100;
        } else {
            score = Math.max(70, 100 - Math.abs(count - standards.ideal) / 10);
        }
    } else if (count < standards.min) {
        score = (count / standards.min) * 60;
    } else {
        score = Math.max(40, 100 - (count - standards.max) / 50);
    }
    
    return {
        count: count,
        score: Math.round(score),
        status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
    };
}

// 가독성 분석
function analyzeReadability(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) {
        return { score: 0, status: 'poor' };
    }
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = calculateAvgSyllables(words);
    
    // Flesch-Kincaid 유사 공식 (한국어 조정)
    let score = 100 - (avgWordsPerSentence * 1.5) - (avgSyllablesPerWord * 85);
    score = Math.max(0, Math.min(100, score));
    
    return {
        score: Math.round(score),
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
    };
}

// 키워드 밀도 분석
function analyzeKeywordDensity(content, currentTopic) {
    if (!currentTopic) {
        return { score: 50, density: 0, status: 'fair' };
    }
    
    const words = content.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    let totalKeywordCount = 0;
    currentTopic.keywords.forEach(keyword => {
        const keywordCount = content.toLowerCase().split(keyword.toLowerCase()).length - 1;
        totalKeywordCount += keywordCount;
    });
    
    const density = (totalKeywordCount / totalWords) * 100;
    const standards = seoQualityStandards.keywordDensity;
    
    let score = 0;
    if (density >= standards.min && density <= standards.max) {
        if (density >= standards.ideal - 0.5 && density <= standards.ideal + 0.5) {
            score = 100;
        } else {
            score = Math.max(70, 100 - Math.abs(density - standards.ideal) * 10);
        }
    } else if (density < standards.min) {
        score = (density / standards.min) * 60;
    } else {
        score = Math.max(30, 100 - (density - standards.max) * 15);
    }
    
    return {
        density: Math.round(density * 10) / 10,
        score: Math.round(score),
        status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
    };
}

// 구조 분석
function analyzeStructure(content) {
    let score = 0;
    
    const h1Count = (content.match(/^# /gm) || []).length;
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    
    const listItems = (content.match(/^[-*+] /gm) || []).length;
    const orderedLists = (content.match(/^\d+\. /gm) || []).length;
    
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (h1Count >= 1) score += 20;
    if (h2Count >= 2) score += 25;
    if (h3Count >= 1) score += 15;
    if (listItems + orderedLists >= 3) score += 20;
    if (paragraphs.length >= 5) score += 20;
    
    return {
        score: Math.min(100, score),
        headers: { h1: h1Count, h2: h2Count, h3: h3Count },
        lists: listItems + orderedLists,
        paragraphs: paragraphs.length,
        status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
    };
}

// 전문성 분석
function analyzeExpertise(content) {
    const expertTerms = [
        '헤어게이터', '모발', '두피', '큐티클', '케라틴', '콜라겐',
        '트리트먼트', '헤어팩', '세럼', '에센스', '샴푸', '컨디셔너',
        '스타일링', '펌', '염색', '탈색', '영양', '수분', '단백질',
        '실리콘', '황산계', '파라벤', 'pH', '산성', '알칼리성'
    ];
    
    let expertTermCount = 0;
    expertTerms.forEach(term => {
        const regex = new RegExp(term, 'gi');
        const matches = content.match(regex);
        if (matches) expertTermCount += matches.length;
    });
    
    const expertPatterns = [
        /전문가/g, /연구/g, /임상/g, /효과적/g, /권장/g,
        /성분/g, /함유/g, /농도/g, /비율/g, /측정/g
    ];
    
    let patternCount = 0;
    expertPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) patternCount += matches.length;
    });
    
    const totalWords = content.split(/\s+/).length;
    const expertiseRatio = (expertTermCount + patternCount) / totalWords;
    
    let score = Math.min(100, expertiseRatio * 1000);
    
    return {
        score: Math.round(score),
        expertTerms: expertTermCount,
        patterns: patternCount,
        ratio: Math.round(expertiseRatio * 1000) / 1000,
        status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'
    };
}

// ===================================
// 기존 UI 함수들 (복원)
// ===================================

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 문자 수 카운터 업데이트
function updateCharCounter(inputId, counterId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    
    if (input && counter) {
        const length = input.value.length;
        counter.textContent = `${length}/${maxLength}자`;
        
        counter.className = 'char-counter';
        if (length > maxLength) {
            counter.classList.add('error');
        } else if (length >= maxLength * 0.8) {
            counter.classList.add('warning');
        } else if (length >= maxLength * 0.5) {
            counter.classList.add('success');
        }
    }
}

// 품질 클래스 반환
function getQualityClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
}

// 모달 관리
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 알림 시스템
function showNotification(type, title, message) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${title}</div>
            <button class="notification-close" onclick="closeNotification(this)">&times;</button>
        </div>
        <div class="notification-body">${message}</div>
    `;
    
    container.appendChild(notification);
    
    const autoRemoveTime = {
        success: 5000,
        info: 7000,
        warning: 10000,
        error: 12000
    };
    
    setTimeout(() => {
        if (notification.parentNode) {
            closeNotification(notification.querySelector('.notification-close'));
        }
    }, autoRemoveTime[type] || 6000);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// 활동 로그 시스템
function logActivity(action, message, type = 'info') {
    const logContainer = document.getElementById('activityLog');
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    
    logEntry.innerHTML = `
        <div class="log-message">${message}</div>
        <div class="log-time">${timestamp}</div>
        <div class="log-status ${type}">${action}</div>
    `;
    
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[entries.length - 1].remove();
    }
}

// 메트릭 업데이트
function updateMetric(metricId, value, score) {
    const valueElement = document.getElementById(metricId);
    const barElement = document.getElementById(metricId + 'Bar');
    
    if (valueElement) valueElement.textContent = value;
    if (barElement) {
        barElement.style.width = score + '%';
        barElement.className = 'metric-fill ' + getQualityClass(score);
    }
}

// 시스템 통계 업데이트
function updateSystemStats() {
    const elements = {
        'totalPosts': systemStats.totalPosts,
        'publishedPosts': systemStats.publishedPosts,
        'systemStatus': systemStats.systemStatus,
        'qualityScore': systemStats.qualityScore
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// 다크모드 토글
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('hairgator_dark_mode', isDark);
    
    showNotification('info', '테마 변경', 
        isDark ? '다크 모드가 활성화되었습니다.' : '라이트 모드가 활성화되었습니다.');
}

// 다크모드 설정 로드
function loadDarkModeSettings() {
    const isDark = localStorage.getItem('hairgator_dark_mode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

// 브라우저 호환성 체크
function checkBrowserCompatibility() {
    const features = {
        'localStorage': typeof(Storage) !== 'undefined',
        'fetch': typeof(fetch) !== 'undefined',
        'Promise': typeof(Promise) !== 'undefined',
        'addEventListener': typeof(document.addEventListener) !== 'undefined'
    };
    
    const unsupported = Object.entries(features)
        .filter(([feature, supported]) => !supported)
        .map(([feature]) => feature);
    
    if (unsupported.length > 0) {
        showNotification('warning', '브라우저 호환성', 
            `일부 기능이 지원되지 않습니다: ${unsupported.join(', ')}. 최신 브라우저 사용을 권장합니다.`);
        logActivity('호환성 경고', `지원되지 않는 기능: ${unsupported.join(', ')}`, 'warning');
    }
}

// 시스템 정보 표시
function showSystemInfo() {
    const info = {
        version: '1.0.0',
        buildDate: '2024-01-15',
        features: [
            'AI 콘텐츠 생성 (Claude + OpenAI)',
            '헤어케어 전문 주제 관리',
            '실시간 품질 분석',
            '네이버 블로그 연동',
            '자동화 스케줄링',
            '시스템 모니터링'
        ],
        browser: navigator.userAgent,
        performance: performance.now()
    };
    
    console.table(info);
    showNotification('info', '시스템 정보', 
        `HAIRGATOR v${info.version} - ${info.features.length}개 주요 기능 탑재`);
}

// 데이터 백업/복원
function backupData() {
    const backupData = {
        topics: haircareTopics,
        targetAudiences: targetAudienceData,
        automation: localStorage.getItem('hairgator_automation_settings'),
        stats: systemStats,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hairgator_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', '백업 완료', '데이터가 성공적으로 백업되었습니다.');
    logActivity('데이터 백업', '시스템 데이터를 백업했습니다.');
}

function restoreData(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (!backupData.topics || !backupData.timestamp) {
                throw new Error('유효하지 않은 백업 파일입니다.');
            }
            
            if (backupData.topics) Object.assign(haircareTopics, backupData.topics);
            if (backupData.targetAudiences) Object.assign(targetAudienceData, backupData.targetAudiences);
            
            if (backupData.automation) {
                localStorage.setItem('hairgator_automation_settings', backupData.automation);
            }
            
            if (backupData.stats) {
                Object.assign(systemStats, backupData.stats);
                updateSystemStats();
            }
            
            showNotification('success', '복원 완료', '데이터가 성공적으로 복원되었습니다.');
            logActivity('데이터 복원', `${backupData.timestamp} 백업 데이터를 복원했습니다.`);
            
        } catch (error) {
            showNotification('error', '복원 실패', `데이터 복원에 실패했습니다: ${error.message}`);
            logActivity('복원 실패', error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// 타겟 독자 표시명 변환 (기존 함수)
function getTargetAudienceDisplayName(target) {
    const displayNames = {
        beginner: '헤어케어 초보자',
        intermediate: '일반인',
        expert: '전문가'
    };
    return displayNames[target] || target;
}

// ===================================
// 데이터 저장/로드 함수들
// ===================================

// 타겟 독자 데이터 저장
function saveTargetAudienceData() {
    try {
        localStorage.setItem('hairgator_target_audiences', JSON.stringify(targetAudienceData));
        return true;
    } catch (error) {
        console.error('타겟 독자 데이터 저장 실패:', error);
        return false;
    }
}

// 타겟 독자 데이터 로드
function loadTargetAudienceData() {
    try {
        const saved = localStorage.getItem('hairgator_target_audiences');
        if (saved) {
            const loadedData = JSON.parse(saved);
            // 기본 데이터와 병합
            targetAudienceData = { ...targetAudienceData, ...loadedData };
        }
        return true;
    } catch (error) {
        console.error('타겟 독자 데이터 로드 실패:', error);
        return false;
    }
}

// ===================================
// 유틸리티 함수들
// ===================================

// 카테고리 표시명 가져오기
function getCategoryDisplayName(categoryId, targetId = 'general_consumers') {
    const target = targetAudienceData[targetId];
    if (target && target.categories) {
        const category = target.categories.find(cat => cat.id === categoryId);
        return category ? `${category.icon} ${category.name}` : categoryId;
    }
    return categoryId;
}

// 난이도 표시명 가져오기
function getDifficultyDisplayName(difficulty) {
    const difficultyMap = {
        'beginner': '🌱 초급',
        'intermediate': '🌿 중급', 
        'advanced': '🌳 고급',
        'expert': '🏆 전문가',
        'auto': '🤖 자동'
    };
    return difficultyMap[difficulty] || difficulty;
}

// 색상 테마 생성
function generateThemeColors(baseColor) {
    return {
        primary: baseColor,
        light: baseColor + '20', // 20% 투명도
        dark: baseColor.replace('#', '#2D'), // 더 어둡게
        text: '#1F2937',
        background: '#F9FAFB'
    };
}

// 타겟별 스타일 클래스 생성
function getTargetStyleClass(targetId) {
    const target = targetAudienceData[targetId];
    if (!target) return 'default-theme';
    
    return `target-${targetId}`;
}

// ===================================
// 초기화 및 설정
// ===================================

// 시스템 초기화
function initializeHairGatorSystem() {
    console.log('🦄 HAIRGATOR Utils 시스템 초기화...');
    
    // 저장된 데이터 로드
    loadTargetAudienceData();
    
    // CSS 동적 생성 (타겟별 테마)
    generateTargetThemeCSS();
    
    console.log('✅ HAIRGATOR Utils 초기화 완료');
    console.log(`📊 등록된 타겟 독자: ${Object.keys(targetAudienceData).length}개`);
    
    return true;
}

// 타겟별 테마 CSS 생성
function generateTargetThemeCSS() {
    const styleId = 'hairgator-target-themes';
    let existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    let css = '';
    Object.entries(targetAudienceData).forEach(([targetId, data]) => {
        const colors = generateThemeColors(data.color);
        css += `
        .target-${targetId} {
            --target-primary: ${colors.primary};
            --target-light: ${colors.light};
            --target-dark: ${colors.dark};
        }
        
        .target-${targetId} .category-badge {
            background: ${colors.light};
            color: ${colors.primary};
            border: 1px solid ${colors.primary};
        }
        
        .target-${targetId} .topic-item:hover {
            border-color: ${colors.primary};
        }
        `;
    });
    
    style.textContent = css;
    document.head.appendChild(style);
}

// ===================================
// Export 및 전역 접근
// ===================================

// 전역 접근을 위한 윈도우 객체 설정
if (typeof window !== 'undefined') {
    window.HairGatorUtils = {
        // 데이터 접근
        targetAudienceData,
        seoQualityStandards,
        systemStats,
        
        // 관리 함수들
        addNewTargetAudience,
        updateTargetAudience,
        deleteTargetAudience,
        addCategoryToTarget,
        addTopicToCategory,
        
        // 간편 작성 함수들
        generateSimpleWritingPrompt,
        validateSimpleWritingInput,
        
        // 유틸리티 함수들
        getCategoryDisplayName,
        getDifficultyDisplayName,
        generateThemeColors,
        getTargetStyleClass,
        
        // 시스템 함수들
        saveTargetAudienceData,
        loadTargetAudienceData,
        initializeHairGatorSystem,
        generateTargetThemeCSS
    };
    
    // 초기화 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHairGatorSystem);
    } else {
        initializeHairGatorSystem();
    }
}

// ES6 모듈 export
export {
    targetAudienceData,
    haircareTopics,
    seoQualityStandards,
    naverSEOPatterns,
    systemStats,
    addNewTargetAudience,
    updateTargetAudience,
    deleteTargetAudience,
    addCategoryToTarget,
    addTopicToCategory,
    generateSimpleWritingPrompt,
    validateSimpleWritingInput,
    calculateKeywordDensityScore,
    calculateAvgSyllables,
    analyzeWordCount,
    analyzeReadability,
    analyzeKeywordDensity,
    analyzeStructure,
    analyzeExpertise,
    debounce,
    updateCharCounter,
    getQualityClass,
    showModal,
    closeModal,
    showNotification,
    closeNotification,
    logActivity,
    updateMetric,
    updateSystemStats,
    toggleDarkMode,
    loadDarkModeSettings,
    checkBrowserCompatibility,
    showSystemInfo,
    backupData,
    restoreData,
    getCategoryDisplayName,
    getDifficultyDisplayName,
    getTargetAudienceDisplayName,
    generateThemeColors,
    getTargetStyleClass,
    saveTargetAudienceData,
    loadTargetAudienceData,
    initializeHairGatorSystem,
    generateTargetThemeCSS
};

console.log('🦄 HAIRGATOR Utils 로드 완료 - 관리자모드 + 간편작성 + 기존기능 통합');
console.log('✨ 새 기능: 타겟/카테고리/주제 자유 관리 + 5줄 스토리 자동 확장');
console.log('🔧 기존 기능: 분석엔진, UI관리, 백업복원, 다크모드 등 모든 기능 포함');
