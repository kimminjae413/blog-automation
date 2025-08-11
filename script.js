// HAIRGATOR 완전한 블로그 자동화 시스템 - JavaScript

// 전역 변수
let currentTopic = null;
let generatedContent = null;
let qualityData = null;
let automationEnabled = false;
let systemStats = {
    totalPosts: 0,
    publishedPosts: 0,
    qualityScore: 0,
    systemStatus: '가동중'
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
        },
        {
            id: 6,
            title: "집에서 하는 간단한 헤어 어레인지 5가지",
            keywords: ["헤어어레인지", "셀프스타일링", "홈케어", "간편스타일링"],
            category: "styling",
            targetAudience: "바쁜 직장인",
            difficulty: "beginner"
        }
    ],
    treatment: [
        {
            id: 7,
            title: "탈모 예방과 효과적인 관리법",
            keywords: ["탈모예방", "모발관리", "두피케어", "헤어로스"],
            category: "treatment",
            targetAudience: "탈모 고민층",
            difficulty: "expert"
        },
        {
            id: 8,
            title: "손상모발 복구를 위한 집중 케어",
            keywords: ["손상모발", "모발복구", "헤어케어", "모발재생"],
            category: "treatment",
            targetAudience: "손상모발 고민층",
            difficulty: "intermediate"
        },
        {
            id: 9,
            title: "비듬과 두피 트러블 완벽 해결법",
            keywords: ["비듬", "두피트러블", "두피케어", "스칼프케어"],
            category: "treatment",
            targetAudience: "두피 고민층",
            difficulty: "intermediate"
        }
    ],
    trend: [
        {
            id: 10,
            title: "K-뷰티 헤어케어 글로벌 트렌드",
            keywords: ["K뷰티", "헤어케어트렌드", "한국뷰티", "글로벌트렌드"],
            category: "trend",
            targetAudience: "트렌드 선도층",
            difficulty: "expert"
        },
        {
            id: 11,
            title: "셀럽들의 헤어케어 비밀 레시피",
            keywords: ["셀럽헤어", "스타헤어케어", "헤어시크릿", "뷰티팁"],
            category: "trend",
            targetAudience: "셀럽 스타일 선호층",
            difficulty: "intermediate"
        },
        {
            id: 12,
            title: "계절별 헤어케어 필수 포인트",
            keywords: ["계절별헤어케어", "시즌케어", "헤어관리", "계절헤어"],
            category: "trend",
            targetAudience: "체계적 관리층",
            difficulty: "intermediate"
        }
    ]
};

// AI 설정 및 상태
const aiConfig = {
    claude: {
        connected: false,
        apiKey: null,
        lastTest: null
    },
    openai: {
        connected: false,
        apiKey: null,
        lastTest: null
    }
};

// 품질 검사 기준
const qualityStandards = {
    wordCount: { min: 1200, ideal: 2000, max: 3000 },
    readability: { min: 70, ideal: 85 },
    keywordDensity: { min: 1.5, ideal: 3.0, max: 5.0 },
    structure: { min: 70, ideal: 90 },
    expertise: { min: 60, ideal: 80 }
};

// 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log('HAIRGATOR 시스템 초기화 시작...');
    
    // 초기 데이터 로드
    initializeSystem();
    loadTopics();
    setupEventListeners();
    startMonitoring();
    
    console.log('HAIRGATOR 시스템 초기화 완료!');
    showNotification('success', '시스템 초기화 완료', 'HAIRGATOR 블로그 자동화 시스템이 준비되었습니다.');
});

// 시스템 초기화
function initializeSystem() {
    // 통계 업데이트
    updateSystemStats();
    
    // 자동화 설정 로드
    loadAutomationSettings();
    
    // 활동 로그 초기화
    initializeActivityLog();
    
    // 에디터 탭 설정
    setupEditorTabs();
    
    // 카테고리 탭 설정
    setupCategoryTabs();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // AI 연결 테스트 버튼
    const testButtons = document.querySelectorAll('.test-btn');
    testButtons.forEach(btn => {
        btn.addEventListener('click', handleAITest);
    });
    
    // 주제 관리 버튼들
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('topic-item')) {
            selectTopic(e.target);
        }
        if (e.target.classList.contains('delete-btn')) {
            deleteTopic(e.target.closest('.topic-item'));
        }
        if (e.target.classList.contains('edit-btn')) {
            editTopic(e.target.closest('.topic-item'));
        }
    });
    
    // 콘텐츠 변경 감지
    const contentTextarea = document.getElementById('postContent');
    const titleInput = document.getElementById('postTitle');
    
    if (contentTextarea) {
        contentTextarea.addEventListener('input', debounce(updateQualityMetrics, 500));
    }
    
    if (titleInput) {
        titleInput.addEventListener('input', debounce(updateQualityMetrics, 500));
    }
    
    // 자동화 토글
    const automationToggle = document.getElementById('automationEnabled');
    if (automationToggle) {
        automationToggle.addEventListener('change', toggleAutomation);
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// AI 연결 테스트
async function testClaudeConnection() {
    const keyInput = document.getElementById('claudeKey');
    const statusElement = document.getElementById('claudeStatus');
    const testBtn = event.target;
    
    if (!keyInput.value.trim()) {
        showNotification('warning', 'API 키 필요', 'Claude API 키를 입력해주세요.');
        return;
    }
    
    testBtn.textContent = '테스트 중...';
    testBtn.disabled = true;
    
    try {
        // 실제 API 테스트 (현재는 시뮬레이션)
        await simulateAPITest('claude', keyInput.value);
        
        aiConfig.claude.connected = true;
        aiConfig.claude.apiKey = keyInput.value;
        aiConfig.claude.lastTest = new Date();
        
        statusElement.textContent = '연결됨';
        statusElement.style.color = 'var(--success-color)';
        
        updateAIStatus();
        showNotification('success', 'Claude 연결 성공', 'Claude API 연결이 성공적으로 완료되었습니다.');
        
    } catch (error) {
        aiConfig.claude.connected = false;
        statusElement.textContent = '연결 실패';
        statusElement.style.color = 'var(--error-color)';
        
        showNotification('error', 'Claude 연결 실패', error.message);
    }
    
    testBtn.textContent = '테스트';
    testBtn.disabled = false;
}

async function testOpenAIConnection() {
    const keyInput = document.getElementById('openaiKey');
    const statusElement = document.getElementById('openaiStatus');
    const testBtn = event.target;
    
    if (!keyInput.value.trim()) {
        showNotification('warning', 'API 키 필요', 'OpenAI API 키를 입력해주세요.');
        return;
    }
    
    testBtn.textContent = '테스트 중...';
    testBtn.disabled = true;
    
    try {
        // 실제 API 테스트 (현재는 시뮬레이션)
        await simulateAPITest('openai', keyInput.value);
        
        aiConfig.openai.connected = true;
        aiConfig.openai.apiKey = keyInput.value;
        aiConfig.openai.lastTest = new Date();
        
        statusElement.textContent = '연결됨';
        statusElement.style.color = 'var(--success-color)';
        
        updateAIStatus();
        showNotification('success', 'OpenAI 연결 성공', 'OpenAI API 연결이 성공적으로 완료되었습니다.');
        
    } catch (error) {
        aiConfig.openai.connected = false;
        statusElement.textContent = '연결 실패';
        statusElement.style.color = 'var(--error-color)';
        
        showNotification('error', 'OpenAI 연결 실패', error.message);
    }
    
    testBtn.textContent = '테스트';
    testBtn.disabled = false;
}

// API 테스트 시뮬레이션
async function simulateAPITest(service, apiKey) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 실제 구현에서는 여기서 실제 API 호출
            if (apiKey.length > 10) {
                resolve({ status: 'success', service: service });
            } else {
                reject(new Error('유효하지 않은 API 키입니다.'));
            }
        }, 1500);
    });
}

// 주제 로드
function loadTopics(category = 'all') {
    const topicList = document.getElementById('topicList');
    if (!topicList) return;
    
    topicList.innerHTML = '';
    
    let topics = [];
    if (category === 'all') {
        Object.values(haircareTopics).forEach(categoryTopics => {
            topics = topics.concat(categoryTopics);
        });
    } else {
        topics = haircareTopics[category] || [];
    }
    
    topics.forEach(topic => {
        const topicElement = createTopicElement(topic);
        topicList.appendChild(topicElement);
    });
    
    if (topics.length === 0) {
        topicList.innerHTML = '<p class="no-topics">해당 카테고리에 주제가 없습니다.</p>';
    }
}

// 주제 요소 생성
function createTopicElement(topic) {
    const div = document.createElement('div');
    div.className = 'topic-item';
    div.dataset.topicId = topic.id;
    div.dataset.category = topic.category;
    
    div.innerHTML = `
        <div class="topic-content">
            <div class="topic-title">${topic.title}</div>
            <div class="topic-meta">
                <span class="topic-category">${getCategoryDisplayName(topic.category)}</span> • 
                <span class="topic-audience">${topic.targetAudience}</span> • 
                <span class="topic-keywords">${topic.keywords.slice(0, 3).join(', ')}</span>
            </div>
        </div>
        <div class="topic-actions">
            <button class="edit-btn">수정</button>
            <button class="delete-btn">삭제</button>
        </div>
    `;
    
    return div;
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

// 주제 선택
function selectTopic(topicElement) {
    // 기존 선택 해제
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 새 주제 선택
    topicElement.classList.add('selected');
    
    const topicId = parseInt(topicElement.dataset.topicId);
    const category = topicElement.dataset.category;
    
    // 주제 데이터 찾기
    let selectedTopic = null;
    Object.values(haircareTopics).forEach(categoryTopics => {
        const found = categoryTopics.find(topic => topic.id === topicId);
        if (found) selectedTopic = found;
    });
    
    if (selectedTopic) {
        currentTopic = selectedTopic;
        updateSelectedTopicDisplay();
        logActivity('주제 선택', `"${selectedTopic.title}" 주제가 선택되었습니다.`);
    }
}

// 선택된 주제 표시 업데이트
function updateSelectedTopicDisplay() {
    const selectedTopicElement = document.getElementById('selectedTopic');
    if (!selectedTopicElement || !currentTopic) return;
    
    selectedTopicElement.innerHTML = `
        <div class="topic-info">
            <h3>${currentTopic.title}</h3>
            <div class="topic-details">
                <span class="category-badge">${getCategoryDisplayName(currentTopic.category)}</span>
                <span class="audience-badge">${currentTopic.targetAudience}</span>
                <span class="difficulty-badge">${getDifficultyDisplayName(currentTopic.difficulty)}</span>
            </div>
            <div class="topic-keywords">
                <strong>키워드:</strong> ${currentTopic.keywords.join(', ')}
            </div>
        </div>
    `;
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

// 카테고리 탭 설정
function setupCategoryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 모든 탭 비활성화
            tabButtons.forEach(tab => tab.classList.remove('active'));
            
            // 클릭된 탭 활성화
            this.classList.add('active');
            
            // 주제 로드
            const category = this.dataset.category;
            loadTopics(category);
        });
    });
}

// 에디터 탭 설정
function setupEditorTabs() {
    const editorTabs = document.querySelectorAll('.editor-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    editorTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭 비활성화
            editorTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 클릭된 탭 활성화
            this.classList.add('active');
            
            // 해당 콘텐츠 표시
            const tabName = this.dataset.tab;
            const targetContent = document.getElementById(tabName + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// AI 콘텐츠 생성
async function generateContent() {
    if (!currentTopic) {
        showNotification('warning', '주제 선택 필요', '먼저 주제를 선택해주세요.');
        return;
    }
    
    if (!aiConfig.claude.connected) {
        showNotification('warning', 'Claude 연결 필요', 'Claude API를 먼저 연결해주세요.');
        return;
    }
    
    // 진행 상태 표시
    showGenerationProgress();
    
    try {
        // 실제 구현에서는 실제 API 호출
        const content = await generateHaircareContent(currentTopic);
        
        // 생성된 콘텐츠 에디터에 적용
        const titleInput = document.getElementById('postTitle');
        const contentTextarea = document.getElementById('postContent');
        const categorySelect = document.getElementById('postCategory');
        const tagsInput = document.getElementById('postTags');
        const metaDescription = document.getElementById('metaDescription');
        
        if (titleInput) titleInput.value = content.title;
        if (contentTextarea) contentTextarea.value = content.content;
        if (categorySelect) categorySelect.value = currentTopic.category;
        if (tagsInput) tagsInput.value = currentTopic.keywords.join(', ');
        if (metaDescription) metaDescription.value = content.metaDescription;
        
        generatedContent = content;
        
        // 품질 검사 자동 실행
        await checkQuality();
        
        // 통계 업데이트
        systemStats.totalPosts++;
        updateSystemStats();
        
        hideGenerationProgress();
        logActivity('콘텐츠 생성', `"${content.title}" 글이 생성되었습니다.`);
        showNotification('success', '콘텐츠 생성 완료', '헤어케어 전문 글이 성공적으로 생성되었습니다.');
        
    } catch (error) {
        hideGenerationProgress();
        logActivity('생성 실패', `콘텐츠 생성 중 오류가 발생했습니다: ${error.message}`, 'error');
        showNotification('error', '생성 실패', error.message);
    }
}

// 헤어케어 콘텐츠 생성 (시뮬레이션)
async function generateHaircareContent(topic) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const sampleContents = {
                1: {
                    title: `${topic.title}: 헤어게이터 전문가 완벽 가이드`,
                    content: `# ${topic.title}

안녕하세요, 헤어게이터입니다! 오늘은 ${topic.keywords[0]}에 대해 전문적이고 실용적인 정보를 공유해드리겠습니다.

## ${topic.keywords[0]}의 중요성

${topic.targetAudience}을 위한 ${topic.keywords[0]} 가이드입니다. 헤어게이터의 10년 노하우를 바탕으로 정확하고 신뢰할 수 있는 정보를 제공해드립니다.

### 1. 기본 이해하기

${topic.keywords[0]}는 헤어케어의 핵심 요소 중 하나입니다. 특히 ${topic.keywords[1]}와 밀접한 관련이 있어 주의 깊은 관리가 필요합니다.

**주요 특징:**
- 개인별 모발 상태에 따른 차이
- 계절별 관리 방법의 변화
- 전문가 권장 사항

### 2. 실전 적용 방법

헤어게이터에서 권장하는 단계별 방법을 소개합니다:

1. **1단계: 현재 상태 파악**
   - 모발 타입 분석
   - 두피 상태 확인
   - 개인별 특성 고려

2. **2단계: 적절한 제품 선택**
   - ${topic.keywords[2]} 중심의 제품군
   - 성분 확인 포인트
   - 헤어게이터 추천 제품

3. **3단계: 올바른 사용법**
   - 적정 사용량과 빈도
   - 효과적인 적용 방법
   - 주의사항 및 팁

### 3. 전문가 조언

헤어게이터 전문팀의 핵심 조언:

- **지속성이 핵심**: 꾸준한 관리가 가장 중요합니다
- **개인 맞춤**: 획일적인 방법보다는 개인에게 맞는 접근
- **전문가 상담**: 정기적인 전문가 상담을 통한 점검

### 4. 흔한 실수와 해결법

많은 분들이 하시는 실수들과 개선 방안:

- 과도한 사용으로 인한 부작용
- 제품 선택 시 주의사항
- 계절별 관리법 차이 무시

## 헤어게이터의 특별한 팁

10년간의 현장 경험을 바탕으로 한 특별한 노하우를 공유합니다:

1. **모닝 루틴 최적화**
2. **저녁 관리의 중요성**
3. **주간/월간 집중 케어**

## 마무리

${topic.keywords[0]}에 대한 올바른 이해와 실천이 건강하고 아름다운 모발을 만드는 첫걸음입니다. 

헤어게이터와 함께 여러분만의 완벽한 헤어케어 루틴을 만들어보세요. 추가 문의사항이 있으시면 언제든 헤어게이터 전문 상담팀에 연락해주세요.

---

*본 글은 헤어게이터 전문 연구팀의 검증을 거친 정보입니다.*`,
                    metaDescription: `${topic.title}에 대한 헤어게이터의 전문가 가이드. ${topic.keywords.slice(0, 3).join(', ')} 중심으로 실용적인 헤어케어 팁을 제공합니다.`
                }
            };
            
            const content = sampleContents[topic.id] || {
                title: `${topic.title}: 헤어게이터 전문가 가이드`,
                content: `# ${topic.title}\n\n헤어게이터의 전문적인 ${topic.keywords[0]} 가이드입니다.\n\n${topic.keywords.map(keyword => `## ${keyword}에 대해\n\n전문적인 내용을 여기에 작성합니다.\n`).join('\n')}`,
                metaDescription: `${topic.title}에 대한 헤어게이터의 전문 정보를 확인하세요.`
            };
            
            resolve(content);
        }, 3000);
    });
}

// 진행 상태 표시/숨김
function showGenerationProgress() {
    const progressElement = document.getElementById('generationProgress');
    if (progressElement) {
        progressElement.style.display = 'block';
    }
}

function hideGenerationProgress() {
    const progressElement = document.getElementById('generationProgress');
    if (progressElement) {
        progressElement.style.display = 'none';
    }
}

// 품질 검사
async function checkQuality() {
    const title = document.getElementById('postTitle')?.value || '';
    const content = document.getElementById('postContent')?.value || '';
    
    if (!title || !content) {
        showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
        return;
    }
    
    const quality = analyzeContentQuality(title, content);
    qualityData = quality;
    
    updateQualityDisplay(quality);
    logActivity('품질 검사', `품질 점수: ${quality.overall}/100`);
    
    return quality;
}

// 콘텐츠 품질 분석
function analyzeContentQuality(title, content) {
    const analysis = {
        wordCount: analyzeWordCount(content),
        readability: analyzeReadability(content),
        keywordDensity: analyzeKeywordDensity(content),
        structure: analyzeStructure(content),
        expertise: analyzeExpertise(content),
        overall: 0
    };
    
    // 전체 점수 계산 (가중 평균)
    analysis.overall = Math.round(
        (analysis.wordCount.score * 0.2) +
        (analysis.readability.score * 0.2) +
        (analysis.keywordDensity.score * 0.2) +
        (analysis.structure.score * 0.2) +
        (analysis.expertise.score * 0.2)
    );
    
    return analysis;
}

// 글자 수 분석
function analyzeWordCount(content) {
    const count = content.length;
    const standards = qualityStandards.wordCount;
    
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
    // 간단한 가독성 분석 (실제로는 더 복잡한 알고리즘 사용)
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

// 키워드 밀도 분석
function analyzeKeywordDensity(content) {
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
    const standards = qualityStandards.keywordDensity;
    
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
    
    // 헤더 구조 확인
    const h1Count = (content.match(/^# /gm) || []).length;
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    
    // 목록 구조 확인
    const listItems = (content.match(/^[-*+] /gm) || []).length;
    const orderedLists = (content.match(/^\d+\. /gm) || []).length;
    
    // 단락 구조 확인
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // 점수 계산
    if (h1Count >= 1) score += 20; // 제목
    if (h2Count >= 2) score += 25; // 주요 섹션
    if (h3Count >= 1) score += 15; // 세부 섹션
    if (listItems + orderedLists >= 3) score += 20; // 목록 사용
    if (paragraphs.length >= 5) score += 20; // 적절한 단락 구성
    
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
    
    // 전문적 표현 패턴 확인
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

// 품질 표시 업데이트
function updateQualityDisplay(quality) {
    // 전체 점수
    const overallQuality = document.getElementById('overallQuality');
    if (overallQuality) {
        overallQuality.textContent = quality.overall;
        overallQuality.className = 'quality-score ' + getQualityClass(quality.overall);
    }
    
    // 개별 메트릭 업데이트
    updateMetric('wordCount', quality.wordCount.count, quality.wordCount.score);
    updateMetric('readability', quality.readability.score, quality.readability.score);
    updateMetric('keywordDensity', quality.keywordDensity.density + '%', quality.keywordDensity.score);
    updateMetric('structureScore', quality.structure.score, quality.structure.score);
    updateMetric('expertiseScore', quality.expertise.score, quality.expertise.score);
    
    // 추천사항 업데이트
    updateRecommendations(quality);
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

// 품질 클래스 반환
function getQualityClass(score) {
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
}

// 추천사항 업데이트
function updateRecommendations(quality) {
    const container = document.getElementById('qualityRecommendations');
    if (!container) return;
    
    const recommendations = [];
    
    if (quality.wordCount.score < 70) {
        if (quality.wordCount.count < qualityStandards.wordCount.min) {
            recommendations.push('글 길이가 짧습니다. 더 자세한 설명을 추가해보세요.');
        } else {
            recommendations.push('글이 너무 깁니다. 핵심 내용을 중심으로 간결하게 정리해보세요.');
        }
    }
    
    if (quality.readability.score < 70) {
        recommendations.push('문장을 더 짧고 명확하게 작성해보세요.');
    }
    
    if (quality.keywordDensity.score < 70) {
        if (quality.keywordDensity.density < qualityStandards.keywordDensity.min) {
            recommendations.push('핵심 키워드를 더 자주 사용해보세요.');
        } else {
            recommendations.push('키워드 사용이 과도합니다. 자연스럽게 줄여보세요.');
        }
    }
    
    if (quality.structure.score < 70) {
        recommendations.push('헤더와 목록을 활용해 구조를 개선해보세요.');
    }
    
    if (quality.expertise.score < 70) {
        recommendations.push('헤어케어 전문 용어와 표현을 더 활용해보세요.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('훌륭한 품질의 글입니다! 발행 준비가 완료되었습니다.');
    }
    
    container.innerHTML = recommendations.map(rec => 
        `<div class="recommendation">${rec}</div>`
    ).join('');
}

// 품질 메트릭 실시간 업데이트
function updateQualityMetrics() {
    const title = document.getElementById('postTitle')?.value || '';
    const content = document.getElementById('postContent')?.value || '';
    
    if (title || content) {
        checkQuality();
    }
}

// 미리보기
function previewContent() {
    const title = document.getElementById('postTitle')?.value || '제목 없음';
    const content = document.getElementById('postContent')?.value || '내용 없음';
    
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;
    
    // 마크다운을 HTML로 변환 (간단한 변환)
    let htmlContent = content
        .replace(/^# (.+)/gm, '<h1>$1</h1>')
        .replace(/^## (.+)/gm, '<h2>$1</h2>')
        .replace(/^### (.+)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^[-*+] (.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>');
    
    previewContainer.innerHTML = `
        <div class="preview-header">
            <h1>${title}</h1>
            <div class="preview-meta">
                <span>카테고리: ${getCategoryDisplayName(document.getElementById('postCategory')?.value || 'basic')}</span>
                <span>작성일: ${new Date().toLocaleDateString('ko-KR')}</span>
            </div>
        </div>
        <div class="preview-content">
            ${htmlContent}
        </div>
    `;
    
    showModal('previewModal');
    logActivity('미리보기', '콘텐츠 미리보기를 확인했습니다.');
}

// 이미지 생성
async function generateImage() {
    const prompt = document.getElementById('imagePrompt')?.value;
    
    if (!prompt) {
        showNotification('warning', '프롬프트 필요', '이미지 설명을 입력해주세요.');
        return;
    }
    
    if (!aiConfig.openai.connected) {
        showNotification('warning', 'OpenAI 연결 필요', 'OpenAI API를 먼저 연결해주세요.');
        return;
    }
    
    const generateBtn = event.target;
    generateBtn.textContent = '생성 중...';
    generateBtn.disabled = true;
    
    try {
        // 실제 구현에서는 실제 API 호출
        const imageUrl = await generateImageWithAI(prompt);
        addGeneratedImage(imageUrl, prompt);
        
        showNotification('success', '이미지 생성 완료', '새로운 이미지가 생성되었습니다.');
        logActivity('이미지 생성', `"${prompt}" 프롬프트로 이미지를 생성했습니다.`);
        
    } catch (error) {
        showNotification('error', '이미지 생성 실패', error.message);
        logActivity('이미지 생성 실패', error.message, 'error');
    }
    
    generateBtn.textContent = '이미지 생성';
    generateBtn.disabled = false;
}

// AI 이미지 생성 (시뮬레이션)
async function generateImageWithAI(prompt) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 실제로는 OpenAI DALL-E API 호출
            const sampleImages = [
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
                'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
                'https://images.unsplash.com/photo-1580618432485-c1f0c1e6da84?w=400'
            ];
            
            const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
            resolve(randomImage);
        }, 2000);
    });
}

// 생성된 이미지 추가
function addGeneratedImage(imageUrl, prompt) {
    const container = document.getElementById('generatedImages');
    if (!container) return;
    
    const imageDiv = document.createElement('div');
    imageDiv.className = 'image-item';
    imageDiv.innerHTML = `
        <img src="${imageUrl}" alt="${prompt}">
        <div class="image-actions">
            <button class="select-image" onclick="selectImage('${imageUrl}')">선택</button>
            <button class="delete-image" onclick="deleteImage(this)">삭제</button>
        </div>
    `;
    
    container.appendChild(imageDiv);
}

// 이미지 선택/삭제
function selectImage(imageUrl) {
    showNotification('success', '이미지 선택됨', '선택된 이미지가 포스트에 적용됩니다.');
    logActivity('이미지 선택', '포스트용 이미지를 선택했습니다.');
}

function deleteImage(button) {
    const imageItem = button.closest('.image-item');
    if (imageItem) {
        imageItem.remove();
        logActivity('이미지 삭제', '생성된 이미지를 삭제했습니다.');
    }
}

// 콘텐츠 발행
async function publishContent() {
    const title = document.getElementById('postTitle')?.value;
    const content = document.getElementById('postContent')?.value;
    
    if (!title || !content) {
        showNotification('warning', '내용 부족', '제목과 본문을 모두 입력해주세요.');
        return;
    }
    
    // 품질 검사
    if (!qualityData || qualityData.overall < 60) {
        const quality = await checkQuality();
        if (quality.overall < 60) {
            showNotification('warning', '품질 기준 미달', '품질 점수가 60점 미만입니다. 내용을 개선해주세요.');
            return;
        }
    }
    
    const publishBtn = document.getElementById('publishBtn');
    const btnText = publishBtn.querySelector('.btn-text');
    const btnLoader = publishBtn.querySelector('.btn-loader');
    
    // 발행 시작
    publishBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    
    try {
        // 실제 구현에서는 네이버 블로그 API 호출
        await simulatePublishing();
        
        // 발행 성공 처리
        systemStats.publishedPosts++;
        updateSystemStats();
        
        showNotification('success', '발행 완료', '네이버 블로그에 성공적으로 발행되었습니다.');
        logActivity('발행 성공', `"${title}" 글이 네이버 블로그에 발행되었습니다.`, 'success');
        
        // 에디터 초기화
        clearEditor();
        
    } catch (error) {
        showNotification('error', '발행 실패', error.message);
        logActivity('발행 실패', error.message, 'error');
    }
    
    // 버튼 상태 복원
    publishBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
}

// 발행 시뮬레이션
async function simulatePublishing() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 90% 성공률 시뮬레이션
            if (Math.random() > 0.1) {
                resolve({ success: true, postId: 'post_' + Date.now() });
            } else {
                reject(new Error('네트워크 오류로 발행에 실패했습니다.'));
            }
        }, 3000);
    });
}

// 에디터 초기화
function clearEditor() {
    const elements = [
        'postTitle', 'postContent', 'postTags', 'metaDescription', 'imagePrompt'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const generatedImages = document.getElementById('generatedImages');
    if (generatedImages) generatedImages.innerHTML = '';
    
    const qualityRecommendations = document.getElementById('qualityRecommendations');
    if (qualityRecommendations) qualityRecommendations.innerHTML = '';
    
    currentTopic = null;
    generatedContent = null;
    qualityData = null;
    
    updateSelectedTopicDisplay();
}

// 임시저장
function saveAsDraft() {
    const title = document.getElementById('postTitle')?.value || '임시저장_' + Date.now();
    const content = document.getElementById('postContent')?.value || '';
    
    // 로컬 스토리지에 저장 (실제로는 서버에 저장)
    const draftData = {
        title, content,
        timestamp: new Date().toISOString(),
        topic: currentTopic
    };
    
    localStorage.setItem('hairgator_draft_' + Date.now(), JSON.stringify(draftData));
    
    showNotification('success', '임시저장 완료', '작업 내용이 임시저장되었습니다.');
    logActivity('임시저장', `"${title}" 글을 임시저장했습니다.`);
}

// 자동화 기능
function toggleAutomation() {
    const toggle = document.getElementById('automationEnabled');
    automationEnabled = toggle.checked;
    
    if (automationEnabled) {
        startAutomation();
        showNotification('success', '자동화 시작', '블로그 자동화가 활성화되었습니다.');
        logActivity('자동화 시작', '블로그 자동화 시스템이 시작되었습니다.');
    } else {
        stopAutomation();
        showNotification('info', '자동화 중지', '블로그 자동화가 비활성화되었습니다.');
        logActivity('자동화 중지', '블로그 자동화 시스템이 중지되었습니다.');
    }
}

function startAutomation() {
    // 자동화 스케줄 설정
    const frequency = document.getElementById('publishFrequency')?.value || 'daily';
    const time = document.getElementById('publishTime')?.value || '09:00';
    
    // 실제 구현에서는 cron job 설정
    console.log(`자동화 시작: ${frequency} at ${time}`);
}

function stopAutomation() {
    // 자동화 스케줄 제거
    console.log('자동화 중지');
}

// 스케줄링 관련 함수들
function schedulePublish() {
    const publishDate = document.getElementById('publishDate')?.value;
    
    if (!publishDate) {
        showNotification('warning', '날짜 선택 필요', '예약 발행 날짜를 선택해주세요.');
        return;
    }
    
    const title = document.getElementById('postTitle')?.value || '제목 없음';
    const scheduleDate = new Date(publishDate);
    
    // 스케줄 목록에 추가
    addToScheduleList(title, scheduleDate);
    
    showNotification('success', '예약 완료', `${scheduleDate.toLocaleString('ko-KR')}에 발행 예약되었습니다.`);
    logActivity('예약 발행', `"${title}" 글이 ${scheduleDate.toLocaleString('ko-KR')}에 예약되었습니다.`);
}

function addToScheduleList(title, date) {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.innerHTML = `
        <div class="schedule-content">
            <div class="schedule-title">${title}</div>
            <div class="schedule-time">${date.toLocaleString('ko-KR')}</div>
        </div>
        <div class="schedule-actions">
            <button class="edit-schedule">수정</button>
            <button class="cancel-schedule" onclick="cancelSchedule(this)">취소</button>
        </div>
    `;
    
    scheduleList.appendChild(scheduleItem);
}

function cancelSchedule(button) {
    const scheduleItem = button.closest('.schedule-item');
    if (scheduleItem) {
        scheduleItem.remove();
        showNotification('info', '예약 취소', '예약 발행이 취소되었습니다.');
        logActivity('예약 취소', '예약된 발행을 취소했습니다.');
    }
}

// 주제 관리
function showTopicModal() {
    showModal('topicModal');
}

function addNewTopic() {
    const title = document.getElementById('newTopicTitle')?.value;
    const category = document.getElementById('newTopicCategory')?.value;
    const keywords = document.getElementById('newTopicKeywords')?.value;
    const target = document.getElementById('newTopicTarget')?.value;
    
    if (!title || !keywords) {
        showNotification('warning', '필수 정보 부족', '주제와 키워드를 입력해주세요.');
        return;
    }
    
    const newTopic = {
        id: Date.now(),
        title: title,
        category: category,
        keywords: keywords.split(',').map(k => k.trim()),
        targetAudience: getTargetAudienceDisplayName(target),
        difficulty: target
    };
    
    // 해당 카테고리에 추가
    if (!haircareTopics[category]) {
        haircareTopics[category] = [];
    }
    haircareTopics[category].push(newTopic);
    
    // 화면 업데이트
    loadTopics();
    
    // 모달 닫기
    closeModal('topicModal');
    
    // 입력 필드 초기화
    document.getElementById('newTopicTitle').value = '';
    document.getElementById('newTopicKeywords').value = '';
    
    showNotification('success', '주제 추가 완료', '새로운 주제가 추가되었습니다.');
    logActivity('주제 추가', `"${title}" 주제가 추가되었습니다.`);
}

function getTargetAudienceDisplayName(target) {
    const displayNames = {
        beginner: '헤어케어 초보자',
        intermediate: '일반인',
        expert: '전문가'
    };
    return displayNames[target] || target;
}

function deleteTopic(topicElement) {
    if (!confirm('정말로 이 주제를 삭제하시겠습니까?')) return;
    
    const topicId = parseInt(topicElement.dataset.topicId);
    const category = topicElement.dataset.category;
    
    // 데이터에서 제거
    if (haircareTopics[category]) {
        haircareTopics[category] = haircareTopics[category].filter(topic => topic.id !== topicId);
    }
    
    // 화면에서 제거
    topicElement.remove();
    
    showNotification('success', '주제 삭제 완료', '주제가 삭제되었습니다.');
    logActivity('주제 삭제', '주제를 삭제했습니다.');
}

function editTopic(topicElement) {
    showNotification('info', '편집 기능', '주제 편집 기능은 곧 추가될 예정입니다.');
}

// 모니터링 시스템
function startMonitoring() {
    // 5분마다 시스템 상태 업데이트
    setInterval(updateSystemStatus, 5 * 60 * 1000);
    
    // 초기 상태 업데이트
    updateSystemStatus();
}

function updateSystemStatus() {
    // API 상태 체크
    const apiStatus = (aiConfig.claude.connected && aiConfig.openai.connected) ? '정상' : '일부 오류';
    document.getElementById('apiMonitor').textContent = apiStatus;
    
    // 성공률 계산 (임시)
    const successRate = systemStats.publishedPosts > 0 ? 
        Math.round((systemStats.publishedPosts / systemStats.totalPosts) * 100) : 100;
    document.getElementById('successRate').textContent = successRate + '%';
    
    // 처리 시간 (임시)
    document.getElementById('processingTime').textContent = (Math.random() * 3 + 1).toFixed(1) + '초';
    
    // 오늘 생성된 글 수 (임시)
    document.getElementById('todayGenerated').textContent = Math.floor(Math.random() * 20) + '개';
}

function refreshMonitoring() {
    updateSystemStatus();
    showNotification('info', '모니터링 새로고침', '시스템 상태가 업데이트되었습니다.');
    logActivity('모니터링 새로고침', '시스템 상태를 새로고침했습니다.');
}

// 시스템 통계 업데이트
function updateSystemStats() {
    document.getElementById('totalPosts').textContent = systemStats.totalPosts;
    document.getElementById('publishedPosts').textContent = systemStats.publishedPosts;
    document.getElementById('systemStatus').textContent = systemStats.systemStatus;
    
    // 평균 품질 점수 계산
    if (qualityData) {
        systemStats.qualityScore = qualityData.overall;
    }
    document.getElementById('qualityScore').textContent = systemStats.qualityScore;
}

// AI 상태 업데이트
function updateAIStatus() {
    const aiStatus = document.getElementById('aiStatus');
    if (!aiStatus) return;
    
    if (aiConfig.claude.connected && aiConfig.openai.connected) {
        aiStatus.textContent = '모든 서비스 연결됨';
        aiStatus.className = 'connection-status connected';
    } else if (aiConfig.claude.connected || aiConfig.openai.connected) {
        aiStatus.textContent = '일부 서비스 연결됨';
        aiStatus.className = 'connection-status partial';
    } else {
        aiStatus.textContent = '연결 대기';
        aiStatus.className = 'connection-status waiting';
    }
}

// 활동 로그 시스템
function initializeActivityLog() {
    logActivity('시스템 시작', 'HAIRGATOR 블로그 자동화 시스템이 시작되었습니다.', 'success');
}

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
    
    // 최신 로그를 맨 위에 추가
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // 로그 개수 제한 (최대 50개)
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[entries.length - 1].remove();
    }
}

// 자동화 설정 로드
function loadAutomationSettings() {
    // 로컬 스토리지에서 자동화 설정 로드
    const savedSettings = localStorage.getItem('hairgator_automation_settings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            const elements = {
                'automationEnabled': settings.enabled,
                'publishFrequency': settings.frequency,
                'publishTime': settings.time,
                'maxDailyPosts': settings.maxDailyPosts
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value !== undefined) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                }
            });
            
            automationEnabled = settings.enabled || false;
            
        } catch (error) {
            console.error('자동화 설정 로드 실패:', error);
        }
    }
}

// 자동화 설정 저장
function saveAutomationSettings() {
    const settings = {
        enabled: document.getElementById('automationEnabled')?.checked || false,
        frequency: document.getElementById('publishFrequency')?.value || 'daily',
        time: document.getElementById('publishTime')?.value || '09:00',
        maxDailyPosts: parseInt(document.getElementById('maxDailyPosts')?.value) || 3
    };
    
    localStorage.setItem('hairgator_automation_settings', JSON.stringify(settings));
}

// 일괄 생성 기능
async function generateBulkContent() {
    if (!aiConfig.claude.connected) {
        showNotification('warning', 'Claude 연결 필요', 'Claude API를 먼저 연결해주세요.');
        return;
    }
    
    const selectedTopics = document.querySelectorAll('.topic-item.selected');
    if (selectedTopics.length === 0) {
        showNotification('warning', '주제 선택 필요', '일괄 생성할 주제를 선택해주세요.');
        return;
    }
    
    const maxBulkGeneration = 5;
    if (selectedTopics.length > maxBulkGeneration) {
        showNotification('warning', '선택 제한', `최대 ${maxBulkGeneration}개까지만 선택 가능합니다.`);
        return;
    }
    
    if (!confirm(`선택된 ${selectedTopics.length}개 주제로 일괄 생성하시겠습니까?`)) {
        return;
    }
    
    showNotification('info', '일괄 생성 시작', `${selectedTopics.length}개 글 생성을 시작합니다.`);
    logActivity('일괄 생성 시작', `${selectedTopics.length}개 주제로 일괄 생성을 시작했습니다.`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < selectedTopics.length; i++) {
        const topicElement = selectedTopics[i];
        const topicId = parseInt(topicElement.dataset.topicId);
        
        // 주제 데이터 찾기
        let topic = null;
        Object.values(haircareTopics).forEach(categoryTopics => {
            const found = categoryTopics.find(t => t.id === topicId);
            if (found) topic = found;
        });
        
        if (!topic) {
            failCount++;
            continue;
        }
        
        try {
            // 각 주제별로 콘텐츠 생성
            currentTopic = topic;
            const content = await generateHaircareContent(topic);
            
            // 자동 저장 (임시저장 형태로)
            const draftData = {
                title: content.title,
                content: content.content,
                metaDescription: content.metaDescription,
                topic: topic,
                timestamp: new Date().toISOString(),
                bulkGenerated: true
            };
            
            localStorage.setItem(`hairgator_bulk_${Date.now()}_${i}`, JSON.stringify(draftData));
            
            successCount++;
            logActivity('일괄 생성', `"${content.title}" 생성 완료 (${i + 1}/${selectedTopics.length})`);
            
            // API 레이트 리밋 고려하여 2초 대기
            if (i < selectedTopics.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            failCount++;
            logActivity('일괄 생성 실패', `"${topic.title}" 생성 실패: ${error.message}`, 'error');
        }
    }
    
    // 일괄 생성 완료 알림
    const message = `일괄 생성 완료! 성공: ${successCount}개, 실패: ${failCount}개`;
    showNotification(failCount === 0 ? 'success' : 'warning', '일괄 생성 완료', message);
    logActivity('일괄 생성 완료', message, failCount === 0 ? 'success' : 'warning');
    
    // 통계 업데이트
    systemStats.totalPosts += successCount;
    updateSystemStats();
    
    // 선택 해제
    selectedTopics.forEach(topic => topic.classList.remove('selected'));
}

// 네이버 블로그 설정
function configureNaver() {
    showNotification('info', '설정 기능', '네이버 블로그 연동 설정은 곧 추가될 예정입니다.');
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
    
    // 자동 제거 (타입별 시간 차등)
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

// 유틸리티 함수들
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

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl+S: 임시저장
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveAsDraft();
    }
    
    // Ctrl+Enter: 콘텐츠 생성
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generateContent();
    }
    
    // Ctrl+P: 미리보기
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        previewContent();
    }
    
    // Escape: 모달 닫기
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// 페이지 이탈 시 임시저장 확인
window.addEventListener('beforeunload', function(e) {
    const title = document.getElementById('postTitle')?.value;
    const content = document.getElementById('postContent')?.value;
    
    if ((title && title.trim()) || (content && content.trim())) {
        const confirmationMessage = '작성 중인 내용이 있습니다. 페이지를 떠나시겠습니까?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

// 다크모드 지원 (선택사항)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('hairgator_dark_mode', isDark);
    
    showNotification('info', '테마 변경', isDark ? '다크 모드가 활성화되었습니다.' : '라이트 모드가 활성화되었습니다.');
}

// 다크모드 설정 로드
function loadDarkModeSettings() {
    const isDark = localStorage.getItem('hairgator_dark_mode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

// 에러 핸들링
window.addEventListener('error', function(e) {
    console.error('JavaScript 오류:', e.error);
    logActivity('시스템 오류', `JavaScript 오류가 발생했습니다: ${e.message}`, 'error');
    showNotification('error', '시스템 오류', '예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.');
});

// API 오류 핸들링
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise 오류:', e.reason);
    logActivity('API 오류', `비동기 처리 오류: ${e.reason}`, 'error');
    
    if (e.reason && e.reason.message) {
        showNotification('error', 'API 오류', e.reason.message);
    }
});

// 성능 모니터링
function monitorPerformance() {
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.duration > 1000) {
                console.warn(`성능 경고: ${entry.name} took ${entry.duration}ms`);
                logActivity('성능 경고', `${entry.name} 작업이 ${Math.round(entry.duration)}ms 소요되었습니다.`, 'warning');
            }
        });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
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
            
            // 데이터 유효성 검사
            if (!backupData.topics || !backupData.timestamp) {
                throw new Error('유효하지 않은 백업 파일입니다.');
            }
            
            // 데이터 복원
            Object.assign(haircareTopics, backupData.topics);
            
            if (backupData.automation) {
                localStorage.setItem('hairgator_automation_settings', backupData.automation);
            }
            
            if (backupData.stats) {
                Object.assign(systemStats, backupData.stats);
                updateSystemStats();
            }
            
            // 화면 업데이트
            loadTopics();
            loadAutomationSettings();
            
            showNotification('success', '복원 완료', '데이터가 성공적으로 복원되었습니다.');
            logActivity('데이터 복원', `${backupData.timestamp} 백업 데이터를 복원했습니다.`);
            
        } catch (error) {
            showNotification('error', '복원 실패', `데이터 복원에 실패했습니다: ${error.message}`);
            logActivity('복원 실패', error.message, 'error');
        }
    };
    
    reader.readAsText(file);
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

// 개발자 도구 감지 (선택사항)
function detectDevTools() {
    let devtools = { open: false };
    
    setInterval(() => {
        if (console.profile) {
            console.profile();
            console.profileEnd();
            
            if (console.clear) {
                console.clear();
                if (console.log.toString().indexOf('native code') === -1) {
                    devtools.open = true;
                }
            }
        }
    }, 1000);
    
    return devtools;
}

// 초기화 완료 후 추가 설정
document.addEventListener('DOMContentLoaded', function() {
    // 추가 초기화 작업들
    setTimeout(() => {
        loadDarkModeSettings();
        checkBrowserCompatibility();
        monitorPerformance();
        
        // 환경 정보 로깅
        logActivity('시스템 정보', `브라우저: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`);
        logActivity('시스템 정보', `화면 해상도: ${window.innerWidth}x${window.innerHeight}`);
        
        console.log('🦄 HAIRGATOR 시스템 완전 초기화 완료!');
        console.log('📊 시스템 정보를 보려면 showSystemInfo() 실행');
        console.log('🎯 키보드 단축키: Ctrl+S(임시저장), Ctrl+Enter(생성), Ctrl+P(미리보기)');
        
    }, 1000);
});

// 전역 함수들을 window 객체에 바인딩 (다른 스크립트에서 접근 가능)
window.HAIRGATOR = {
    generateContent,
    generateBulkContent,
    checkQuality,
    publishContent,
    previewContent,
    generateImage,
    showSystemInfo,
    backupData,
    restoreData,
    toggleDarkMode,
    version: '1.0.0'
};

// 콘솔 환영 메시지
console.log('%c🦄 HAIRGATOR 블로그 자동화 시스템', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%c✨ AI 기반 헤어케어 전문 콘텐츠 생성 시스템', 'color: #764ba2; font-size: 14px;');
console.log('%c🚀 시스템 버전: 1.0.0', 'color: #10b981; font-size: 12px;');
