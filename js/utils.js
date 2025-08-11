// HAIRGATOR - utils.js
// 유틸리티 함수 및 공통 기능

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

// 네이버 상위노출 키워드 패턴
const naverSEOPatterns = {
    titlePatterns: [
        "완전정복", "총정리", "핵심가이드", "실전팁", "비법공개", 
        "상세가이드", "완벽분석", "전문가추천", "베스트", "최신트렌드"
    ],
    engagementWords: [
        "댓글", "공유", "좋아요", "구독", "팔로우", "클릭", 
        "문의", "상담", "예약", "신청"
    ],
    trustSignals: [
        "전문가", "검증된", "인증", "추천", "후기", "리뷰", 
        "경험담", "실제", "진짜", "정말"
    ]
};

// 타겟 독자별 전문 분야 데이터
const targetAudienceData = {
    hair_professionals: {
        name: "헤어 디자이너 & 헤어 관련 종사자",
        description: "헤어 전문가들을 위한 실무 중심 콘텐츠를 작성합니다.",
        features: [
            "최신 헤어 트렌드 및 기법",
            "고객 상담 및 서비스 노하우", 
            "살롱 운영 및 마케팅 팁",
            "제품 지식 및 기술 정보"
        ],
        expertTerms: ["커팅", "레이어링", "그라데이션", "텍스처라이징", "포인트컷"],
        writingStyle: {
            tone: "전문적이면서 실무 중심적",
            approach: "기술적 디테일과 실전 노하우 강조"
        }
    },
    beauty_professionals: {
        name: "뷰티 전문가 & 미용사", 
        description: "뷰티 전문가들을 위한 종합 미용 정보를 제공합니다.",
        features: [
            "최신 뷰티 트렌드 분석",
            "고객별 맞춤 서비스",
            "샵 운영 노하우",
            "제품 및 기술 정보"
        ]
    },
    fitness_trainers: {
        name: "퍼스널 트레이너 & 피트니스 전문가",
        description: "피트니스 전문가들을 위한 운동 및 트레이닝 정보를 제공합니다.",
        features: [
            "운동 프로그램 설계",
            "고객 맞춤 트레이닝",
            "영양 및 컨디셔닝", 
            "PT샵 운영 노하우"
        ]
    }
};

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

// 카테고리 표시명 변환
function getCategoryDisplayName(category) {
    const displayNames = {
        basic: '기초 케어',
        styling: '스타일링',
        treatment: '트리트먼트',
        trend: '트렌드'
    };
    return displayNames[category] || category;
}

// 난이도 표시명 변환
function getDifficultyDisplayName(difficulty) {
    const displayNames = {
        beginner: '초급',
        intermediate: '중급',
        expert: '고급'
    };
    return displayNames[difficulty] || difficulty;
}

// 타겟 독자 표시명 변환
function getTargetAudienceDisplayName(target) {
    const displayNames = {
        beginner: '헤어케어 초보자',
        intermediate: '일반인',
        expert: '전문가'
    };
    return displayNames[target] || target;
}

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
            
            Object.assign(haircareTopics, backupData.topics);
            
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

// 전역 객체로 내보내기
window.HairGatorUtils = {
    systemStats,
    seoQualityStandards,
    naverSEOPatterns,
    targetAudienceData,
    haircareTopics,
    debounce,
    updateCharCounter,
    getQualityClass,
    getCategoryDisplayName,
    getDifficultyDisplayName,
    getTargetAudienceDisplayName,
    calculateKeywordDensityScore,
    analyzeWordCount,
    analyzeReadability,
    analyzeKeywordDensity,
    analyzeStructure,
    analyzeExpertise,
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
    restoreData
};