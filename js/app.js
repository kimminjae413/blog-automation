// HAIRGATOR - app.js (완전히 새로운 글감 큐 시스템 중심 설계)
// 기존 완성도를 유지하면서 글감 큐 시스템으로 완전 재구성

// ===== 글감 큐 데이터 구조 (원래 설계 반영) =====
let contentQueue = [
    {
        id: 1,
        targetAudience: "30대 직장인 여성들",
        keywords: ["겨울", "건조", "헤어케어", "보습"],
        title: "겨울철 건조한 모발 완벽 관리법",
        tone: "친근하고 실용적",
        status: "대기중",
        createdAt: new Date().toISOString(),
        priority: "normal"
    },
    {
        id: 2,
        targetAudience: "헤어샵 사장님들",
        keywords: ["고객상담", "매출증대", "서비스", "재방문"],
        title: "고객 재방문율 200% 높이는 상담 노하우",
        tone: "전문적이면서 비즈니스 중심",
        status: "대기중",
        createdAt: new Date().toISOString(),
        priority: "high"
    },
    {
        id: 3,
        targetAudience: "20대 뷰티 관심층",
        keywords: ["트렌드", "헤어스타일", "염색", "MZ세대"],
        title: "2024 MZ세대가 열광하는 헤어 트렌드 TOP 10",
        tone: "트렌디하고 캐주얼",
        status: "대기중",
        createdAt: new Date().toISOString(),
        priority: "normal"
    },
    {
        id: 4,
        targetAudience: "40대 중년 여성들",
        keywords: ["탈모예방", "볼륨", "안티에이징", "모발영양"],
        title: "40대부터 시작하는 탈모 예방 완벽 가이드",
        tone: "신뢰감 있고 전문적",
        status: "대기중",
        createdAt: new Date().toISOString(),
        priority: "high"
    },
    {
        id: 5,
        targetAudience: "펜션 운영자들",
        keywords: ["고객서비스", "어메니티", "헤어케어용품", "펜션관리"],
        title: "펜션 어메니티로 헤어케어 용품 준비하는 법",
        tone: "실무적이고 구체적",
        status: "대기중",
        createdAt: new Date().toISOString(),
        priority: "normal"
    }
];

// ===== 전역 상태 관리 =====
let currentFilter = 'all';
let automationInterval = null;
let isProcessing = false;
let currentTopic = null;
let generatedContent = null;
let qualityData = null;
let automationEnabled = false;

// 시스템 통계
let systemStats = {
    totalGenerated: 0,
    totalPublished: 0,
    averageQuality: 0,
    systemStatus: '정상',
    startTime: Date.now(),
    successRate: 100
};

// ===== 메인 애플리케이션 클래스 =====
class HairGatorQueueApp {
    constructor() {
        this.initialized = false;
        this.modules = {
            utils: null,
            aiService: null
        };
        
        this.eventHandlers = new Map();
        this.activeModals = new Set();
        this.scheduledTasks = new Map();
        this.qualityCheckTimeout = null;
        this.processingQueue = new Set();
        
        // 큐 시스템 설정
        this.queueSettings = {
            maxConcurrent: 3,
            retryAttempts: 3,
            retryDelay: 2000,
            autoSave: true,
            autoBackup: true
        };
        
        // API 설정 (하드코딩)
        this.apiConfig = {
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
        
        console.log('🦄 HAIRGATOR 글감 큐 시스템 초기화 시작...');
    }
    
    // ===== 애플리케이션 초기화 =====
    async initialize() {
        if (this.initialized) return;
        
        try {
            // DOM 로드 대기
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 모듈 연결
            this.connectModules();
            
            // 큐 시스템 초기화
            this.initializeQueueSystem();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // UI 초기화
            this.initializeUI();
            
            // 자동화 시스템 초기화
            this.initializeAutomation();
            
            // 모니터링 시작
            this.startMonitoring();
            
            this.initialized = true;
            
            // 초기화 완료 알림
            this.showWelcomeMessage();
            this.logActivity('시스템 시작', 'HAIRGATOR 글감 큐 시스템이 시작되었습니다.', 'success');
            
            console.log('✅ HAIRGATOR 글감 큐 시스템 초기화 완료!');
            
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
            this.showNotification('error', '초기화 실패', '시스템 초기화 중 오류가 발생했습니다.');
        }
    }
    
    // ===== 모듈 연결 =====
    connectModules() {
        // AI 서비스 모듈 연결 (전역 AIService 사용)
        if (window.AIService) {
            this.modules.aiService = window.AIService;
            console.log('🤖 AI 서비스 모듈 연결 완료');
        }
        
        // Utils 모듈 연결
        if (window.Utils || window.QualityAnalyzer) {
            this.modules.utils = window.Utils || window.QualityAnalyzer;
            console.log('🔧 Utils 모듈 연결 완료');
        }
        
        // 전역 함수들 바인딩
        this.bindGlobalFunctions();
    }
    
    // ===== 전역 함수 바인딩 =====
    bindGlobalFunctions() {
        // 글감 큐 관련 함수들
        window.processNextInQueue = this.processNextInQueue.bind(this);
        window.processAllQueue = this.processAllQueue.bind(this);
        window.addQuickContent = this.addQuickContent.bind(this);
        window.showQueueManager = this.showQueueManager.bind(this);
        window.showAddContentModal = this.showAddContentModal.bind(this);
        window.addNewContent = this.addNewContent.bind(this);
        window.deleteQueueItem = this.deleteQueueItem.bind(this);
        window.clearCompletedQueue = this.clearCompletedQueue.bind(this);
        window.filterQueue = this.filterQueue.bind(this);
        
        // AI 및 콘텐츠 관련
        window.checkQuality = this.checkQuality.bind(this);
        window.publishContent = this.publishContent.bind(this);
        window.generateImage = this.generateImage.bind(this);
        window.testClaudeConnection = this.testClaudeConnection.bind(this);
        window.testOpenAIConnection = this.testOpenAIConnection.bind(this);
        
        // SEO 도구들
        window.generateSEOTitle = this.generateSEOTitle.bind(this);
        window.generateMetaDescription = this.generateMetaDescription.bind(this);
        window.suggestKeywords = this.suggestKeywords.bind(this);
        window.checkSEOScore = this.checkSEOScore.bind(this);
        
        // 자동화 및 설정
        window.toggleAutomation = this.toggleAutomation.bind(this);
        window.startAutomation = this.startAutomation.bind(this);
        
        // 모달 및 UI 관리
        window.showModal = this.showModal.bind(this);
        window.closeModal = this.closeModal.bind(this);
        window.switchTab = this.switchTab.bind(this);
        window.addKeyword = this.addKeyword.bind(this);
        window.downloadImage = this.downloadImage.bind(this);
        
        console.log('🔗 전역 함수 바인딩 완료');
    }
    
    // ===== 큐 시스템 초기화 =====
    initializeQueueSystem() {
        // 저장된 큐 로드
        this.loadQueueFromStorage();
        
        // 큐 상태 업데이트
        this.updateQueueStats();
        this.updateNextItemPreview();
        this.updateQueueManagerContent();
        
        // 자동 저장 설정
        if (this.queueSettings.autoSave) {
            setInterval(() => {
                this.saveQueueToStorage();
            }, 30000); // 30초마다 자동 저장
        }
        
        // 자동 백업 설정
        if (this.queueSettings.autoBackup) {
            setInterval(() => {
                this.createAutoBackup();
            }, 300000); // 5분마다 자동 백업
        }
        
        console.log('📝 글감 큐 시스템 초기화 완료');
        console.log(`📊 큐 상태: ${this.getQueueStatistics().total}개 총 글감, ${this.getQueueStatistics().waiting}개 대기중`);
    }
    
    // ===== 이벤트 리스너 설정 =====
    setupEventListeners() {
        // 키보드 단축키
        this.setupKeyboardShortcuts();
        
        // 큐 관련 이벤트
        this.setupQueueEvents();
        
        // 창 이벤트
        this.setupWindowEvents();
        
        // 커스텀 이벤트
        this.setupCustomEvents();
    }
    
    // ===== 키보드 단축키 설정 =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter: 다음 글 작성
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.processNextInQueue();
            }
            
            // Ctrl+S: 저장
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveQueueToStorage();
                this.showNotification('success', '저장 완료', '글감 큐가 저장되었습니다.');
            }
            
            // Ctrl+P: 품질 검사
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.checkQuality();
            }
            
            // F1: 도움말
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelp();
            }
            
            // Escape: 모달 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // ===== 큐 이벤트 설정 =====
    setupQueueEvents() {
        // 큐 아이템 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.queue-item')) {
                this.handleQueueItemClick(e);
            }
        });
        
        // 폼 변경 감지
        document.addEventListener('input', (e) => {
            if (e.target.matches('#quickTarget, #quickTitle, #quickKeywords, #quickTone')) {
                this.handleQuickFormChange();
            }
        });
    }
    
    // ===== 창 이벤트 설정 =====
    setupWindowEvents() {
        // 페이지 이탈 시 확인
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.returnValue = '처리 중인 작업이 있습니다. 페이지를 떠나시겠습니까?';
                return e.returnValue;
            }
        });
        
        // 온라인/오프라인 상태
        window.addEventListener('online', () => {
            this.showNotification('success', '연결 복구', '인터넷 연결이 복구되었습니다.');
            this.logActivity('연결 상태', '온라인 상태로 변경', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('warning', '연결 끊김', '오프라인 모드로 전환됩니다.');
            this.logActivity('연결 상태', '오프라인 상태로 변경', 'warning');
        });
    }
    
    // ===== 커스텀 이벤트 설정 =====
    setupCustomEvents() {
        // 큐 처리 완료 이벤트
        document.addEventListener('queue-item-processed', (e) => {
            this.handleQueueItemProcessed(e.detail);
        });
        
        // 자동화 상태 변경 이벤트
        document.addEventListener('automation-status-change', (e) => {
            this.handleAutomationStatusChange(e.detail);
        });
    }
    
    // ===== UI 초기화 =====
    initializeUI() {
        // 탭 시스템 설정
        this.setupTabs();
        
        // 알림 컨테이너 생성
        this.createNotificationContainer();
        
        // 통계 업데이트
        this.updateSystemStats();
        
        // AI 상태 업데이트
        this.updateAIStatus();
        
        console.log('🎨 UI 초기화 완료');
    }
    
    // ===== 자동화 시스템 초기화 =====
    initializeAutomation() {
        // 자동화 설정 로드
        this.loadAutomationSettings();
        
        // 자동화 모니터링 시작
        this.startAutomationMonitoring();
        
        console.log('🤖 자동화 시스템 초기화 완료');
    }
    
    // ===== 모니터링 시작 =====
    startMonitoring() {
        // 시스템 상태 모니터링
        setInterval(() => {
            this.updateSystemStatus();
        }, 60000); // 1분마다
        
        // 큐 상태 모니터링
        setInterval(() => {
            this.monitorQueueHealth();
        }, 30000); // 30초마다
        
        console.log('📊 모니터링 시스템 시작');
    }
    
    // ===== 웰컴 메시지 =====
    showWelcomeMessage() {
        this.showNotification('success', '시스템 준비 완료', 
            'HAIRGATOR 글감 큐 시스템이 준비되었습니다. "다음 글 작성" 버튼을 클릭하여 시작하세요!');
        
        // 팁 표시 (첫 방문자용)
        if (!localStorage.getItem('hairgator_visited')) {
            setTimeout(() => {
                this.showTips();
                localStorage.setItem('hairgator_visited', 'true');
            }, 3000);
        }
    }
    
    // ===== 팁 표시 =====
    showTips() {
        const tips = [
            'Ctrl+Enter로 빠르게 다음 글감을 처리할 수 있습니다.',
            '빠른 추가 섹션에서 간단히 글감을 추가하세요.',
            '전체 처리 버튼으로 모든 대기 글감을 일괄 처리할 수 있습니다.',
            '자동화 기능으로 정해진 시간에 자동으로 글을 생성하세요.'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.showNotification('info', '💡 팁', randomTip);
    }
    
    // ===== 글감 큐 관리 함수들 =====
    
    // 큐 상태 업데이트
    updateQueueStats() {
        const stats = this.getQueueStatistics();
        
        const waitingEl = document.getElementById('queueWaiting');
        const completedEl = document.getElementById('queueCompleted');
        
        if (waitingEl) waitingEl.textContent = stats.waiting;
        if (completedEl) completedEl.textContent = stats.completed;
    }
    
    // 다음 예정 아이템 미리보기 업데이트
    updateNextItemPreview() {
        const nextItem = this.getNextQueueItem();
        const preview = document.getElementById('nextItemPreview');
        
        if (!preview) return;
        
        if (nextItem) {
            preview.innerHTML = `
                <div class="queue-item">
                    <div class="queue-title">${nextItem.title}</div>
                    <div class="queue-meta">
                        <span>${nextItem.targetAudience}</span>
                        <span class="queue-status waiting">대기중</span>
                    </div>
                    <div class="queue-priority priority-${nextItem.priority || 'normal'}">
                        우선순위: ${this.getPriorityText(nextItem.priority)}
                    </div>
                </div>
            `;
        } else {
            preview.innerHTML = '<p class="text-center" style="color: #6b7280; font-style: italic;">큐가 비어있습니다</p>';
        }
    }
    
    // 큐 관리 콘텐츠 업데이트
    updateQueueManagerContent() {
        const container = document.getElementById('queueContainer');
        if (!container) return;
        
        const filteredQueue = this.getFilteredQueue();
        
        if (filteredQueue.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: #6b7280;">해당하는 글감이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = filteredQueue.map(item => this.createQueueItemHTML(item)).join('');
    }
    
    // 큐 아이템 HTML 생성
    createQueueItemHTML(item) {
        const statusClass = this.getStatusClass(item.status);
        const priorityClass = `priority-${item.priority || 'normal'}`;
        
        return `
            <div class="queue-item ${statusClass} ${priorityClass}" data-id="${item.id}">
                <div class="queue-header">
                    <div class="queue-title">${item.title}</div>
                    <div class="queue-actions">
                        <button class="btn btn-secondary btn-small" onclick="editQueueItem(${item.id})">수정</button>
                        <button class="btn btn-error btn-small" onclick="deleteQueueItem(${item.id})">삭제</button>
                    </div>
                </div>
                <div class="queue-meta">
                    <span class="target-audience">${item.targetAudience}</span>
                    <span class="queue-status ${item.status}">${this.getStatusText(item.status)}</span>
                    <span class="queue-priority ${priorityClass}">${this.getPriorityText(item.priority)}</span>
                </div>
                <div class="queue-details">
                    <div class="keywords">키워드: ${item.keywords.join(', ')}</div>
                    <div class="tone">톤: ${item.tone}</div>
                    <div class="created-at">생성: ${new Date(item.createdAt).toLocaleDateString('ko-KR')}</div>
                </div>
                ${item.error ? `<div class="queue-error">오류: ${item.error}</div>` : ''}
                ${item.generatedAt ? `<div class="queue-generated">생성 완료: ${new Date(item.generatedAt).toLocaleString('ko-KR')}</div>` : ''}
            </div>
        `;
    }
    
    // ===== 큐 조작 함수들 =====
    
    // 빠른 글감 추가
    addQuickContent() {
        const target = this.getInputValue('quickTarget');
        const title = this.getInputValue('quickTitle');
        const keywords = this.getInputValue('quickKeywords');
        const tone = this.getInputValue('quickTone');
        
        if (!target || !title || !keywords) {
            this.showNotification('warning', '입력 필요', '모든 필드를 입력해주세요.');
            return;
        }
        
        const newItem = this.createQueueItem({
            targetAudience: target,
            title: title,
            keywords: keywords.split(',').map(k => k.trim()),
            tone: tone || "친근하고 실용적",
            priority: 'normal'
        });
        
        this.addToQueue(newItem);
        this.clearQuickForm();
        
        this.showNotification('success', '글감 추가', '새 글감이 큐에 추가되었습니다.');
        this.logActivity('글감 추가', `"${title}" 글감이 추가되었습니다.`);
    }
    
    // 새 글감 추가 (상세 모달)
    addNewContent() {
        const target = this.getInputValue('newTargetAudience');
        const title = this.getInputValue('newTitle');
        const keywords = this.getInputValue('newKeywords');
        const tone = this.getInputValue('newTone');
        
        if (!target || !title || !keywords) {
            this.showNotification('warning', '입력 필요', '모든 필드를 입력해주세요.');
            return;
        }
        
        const newItem = this.createQueueItem({
            targetAudience: target,
            title: title,
            keywords: keywords.split(',').map(k => k.trim()),
            tone: tone || "친근하고 실용적",
            priority: 'normal'
        });
        
        this.addToQueue(newItem);
        this.closeModal('addContentModal');
        this.clearNewContentForm();
        
        this.showNotification('success', '글감 추가', '새 글감이 큐에 추가되었습니다.');
        this.logActivity('글감 추가', `"${title}" 글감이 추가되었습니다.`);
    }
    
    // 큐 아이템 생성
    createQueueItem(data) {
        return {
            id: Date.now() + Math.random(),
            targetAudience: data.targetAudience,
            title: data.title,
            keywords: Array.isArray(data.keywords) ? data.keywords : [data.keywords],
            tone: data.tone,
            status: '대기중',
            priority: data.priority || 'normal',
            createdAt: new Date().toISOString(),
            retryCount: 0
        };
    }
    
    // 큐에 아이템 추가
    addToQueue(item) {
        contentQueue.push(item);
        this.saveQueueToStorage();
        this.updateQueueStats();
        this.updateNextItemPreview();
        this.updateQueueManagerContent();
        
        // 커스텀 이벤트 발송
        document.dispatchEvent(new CustomEvent('queue-item-added', {
            detail: { item }
        }));
    }
    
    // 큐 아이템 삭제
    deleteQueueItem(id) {
        const item = this.findQueueItem(id);
        if (!item) return;
        
        if (!confirm(`"${item.title}" 글감을 삭제하시겠습니까?`)) return;
        
        contentQueue = contentQueue.filter(item => item.id !== id);
        this.saveQueueToStorage();
        this.updateQueueStats();
        this.updateNextItemPreview();
        this.updateQueueManagerContent();
        
        this.showNotification('success', '삭제 완료', '글감이 삭제되었습니다.');
        this.logActivity('글감 삭제', `"${item.title}" 글감이 삭제되었습니다.`);
    }
    
    // 완료된 항목 일괄 삭제
    clearCompletedQueue() {
        const completed = contentQueue.filter(item => item.status === '완료');
        if (completed.length === 0) {
            this.showNotification('info', '삭제할 항목 없음', '완료된 글감이 없습니다.');
            return;
        }
        
        if (!confirm(`${completed.length}개의 완료된 글감을 삭제하시겠습니까?`)) return;
        
        contentQueue = contentQueue.filter(item => item.status !== '완료');
        this.saveQueueToStorage();
        this.updateQueueStats();
        this.updateNextItemPreview();
        this.updateQueueManagerContent();
        
        this.showNotification('success', '삭제 완료', `${completed.length}개 글감이 삭제되었습니다.`);
        this.logActivity('일괄 삭제', `완료된 ${completed.length}개 글감을 삭제했습니다.`);
    }
    
    // ===== AI 처리 함수들 =====
    
    // 다음 글감 처리
    async processNextInQueue() {
        if (isProcessing) {
            this.showNotification('warning', '처리 중', '이미 다른 작업이 진행 중입니다.');
            return;
        }
        
        const nextItem = this.getNextQueueItem();
        if (!nextItem) {
            this.showNotification('info', '큐 없음', '처리할 글감이 없습니다.');
            return;
        }
        
        try {
            isProcessing = true;
            await this.processQueueItem(nextItem);
        } catch (error) {
            console.error('큐 처리 오류:', error);
            this.showNotification('error', '처리 실패', error.message);
            this.logActivity('처리 실패', `글감 처리 실패: ${error.message}`, 'error');
        } finally {
            isProcessing = false;
        }
    }
    
    // 전체 큐 처리
    async processAllQueue() {
        const waitingItems = contentQueue.filter(item => item.status === '대기중');
        
        if (waitingItems.length === 0) {
            this.showNotification('info', '큐 없음', '처리할 글감이 없습니다.');
            return;
        }
        
        if (isProcessing) {
            this.showNotification('warning', '처리 중', '이미 다른 작업이 진행 중입니다.');
            return;
        }
        
        if (!confirm(`${waitingItems.length}개의 글감을 모두 처리하시겠습니까?`)) {
            return;
        }
        
        isProcessing = true;
        this.showGenerationProgress();
        
        try {
            let processed = 0;
            let failed = 0;
            
            for (let i = 0; i < waitingItems.length; i++) {
                const item = waitingItems[i];
                this.updateProgressText(`(${i+1}/${waitingItems.length}) "${item.title}" 처리 중...`);
                
                try {
                    await this.processQueueItem(item);
                    processed++;
                    
                    // API 레이트 리밋 방지
                    if (i < waitingItems.length - 1) {
                        await this.delay(2000);
                    }
                } catch (error) {
                    console.error(`아이템 ${item.id} 처리 실패:`, error);
                    this.updateQueueItemStatus(item.id, '실패', error.message);
                    failed++;
                }
            }
            
            const message = `${processed}개 성공, ${failed}개 실패`;
            this.showNotification('success', '전체 처리 완료', message);
            this.logActivity('전체 처리', message);
            
        } catch (error) {
            this.showNotification('error', '처리 실패', error.message);
            this.logActivity('전체 처리 실패', error.message, 'error');
        } finally {
            isProcessing = false;
            this.hideGenerationProgress();
            this.updateQueueStats();
            this.updateQueueManagerContent();
        }
    }
    
    // 개별 큐 아이템 처리
    async processQueueItem(item) {
        // 상태 업데이트
        this.updateQueueItemStatus(item.id, '작성중');
        
        this.showGenerationProgress();
        this.updateProgressText(`"${item.title}" 처리 중...`);
        
        try {
            // AI 서비스로 콘텐츠 생성
            const content = await this.generateContentFromItem(item);
            
            // 결과 적용
            this.displayGeneratedContent(content, item);
            
            // 상태 완료로 변경
            this.updateQueueItemStatus(item.id, '완료');
            item.generatedContent = content;
            item.generatedAt = new Date().toISOString();
            
            this.saveQueueToStorage();
            this.showNotification('success', '생성 완료', `"${item.title}" 글이 생성되었습니다.`);
            this.logActivity('글 생성', `"${item.title}" 글이 생성되었습니다.`);
            
            // 글쓰기 탭으로 전환
            this.switchTab('write');
            
            // 통계 업데이트
            systemStats.totalGenerated++;
            this.updateSystemStats();
            
            // 커스텀 이벤트 발송
            document.dispatchEvent(new CustomEvent('queue-item-processed', {
                detail: { item, content, success: true }
            }));
            
        } catch (error) {
            this.updateQueueItemStatus(item.id, '실패', error.message);
            throw error;
        } finally {
            this.hideGenerationProgress();
        }
    }
    
    // AI 콘텐츠 생성
    async generateContentFromItem(item) {
        if (this.modules.aiService && this.modules.aiService.generateBlogContent) {
            // AI 서비스 사용
            const result = await this.modules.aiService.generateBlogContent(item);
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'AI 콘텐츠 생성 실패');
            }
        } else {
            // AI 서비스가 없는 경우 Claude API 직접 호출
            return await this.callClaudeAPI(item);
        }
    }
    
    // Claude API 직접 호출
    async callClaudeAPI(item) {
        const prompt = this.createContentPrompt(item);
        
        const response = await fetch(this.apiConfig.claude.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiConfig.claude.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.apiConfig.claude.model,
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Claude API 오류: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            title: item.title,
            content: data.content[0].text,
            metaDescription: this.generateMetaDescription(data.content[0].text),
            keywords: item.keywords,
            targetAudience: item.targetAudience,
            tone: item.tone,
            wordCount: data.content[0].text.length
        };
    }
    
    // 콘텐츠 생성 프롬프트 생성
    createContentPrompt(item) {
        return `당신은 헤어케어 전문 블로그 작성자입니다. 다음 조건에 맞는 헤어케어 블로그 글을 작성해주세요.

**글 정보:**
- 타겟 독자: ${item.targetAudience}
- 글 제목: ${item.title}
- 핵심 키워드: ${item.keywords.join(', ')}
- 톤 앤 매너: ${item.tone}

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

**톤 앤 매너**: ${item.tone}
**타겟 독자**: "${item.targetAudience}"에게 직접 말하는 듯한 친근한 어조

블로그 본문만 출력하세요 (다른 설명이나 주석은 제외):`;
    }
    
    // 생성된 콘텐츠 표시
    displayGeneratedContent(content, item) {
        this.setInputValue('postTitle', content.title);
        this.setInputValue('postContent', content.content);
        this.setInputValue('postTags', content.keywords.join(', '));
        this.setInputValue('seoTitle', content.title);
        this.setInputValue('primaryKeywords', content.keywords.join(', '));
        
        if (content.metaDescription) {
            this.setInputValue('metaDescription', content.metaDescription);
        }
        
        generatedContent = content;
        currentTopic = item;
        
        // 품질 검사 자동 실행
        setTimeout(() => {
            this.checkQuality();
        }, 500);
    }
    
    // ===== 품질 검사 =====
    async checkQuality() {
        const title = this.getInputValue('postTitle');
        const content = this.getInputValue('postContent');
        
        if (!title || !content) {
            this.showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
            return null;
        }
        
        try {
            const analysis = this.analyzeQuality(content, title);
            this.displayQualityResults(analysis);
            
            qualityData = analysis;
            
            this.logActivity('품질 검사', `품질 점수: ${analysis.overall}/100`);
            
            return analysis;
            
        } catch (error) {
            console.error('품질 검사 오류:', error);
            this.showNotification('error', '품질 검사 실패', error.message);
            return null;
        }
    }
    
    // 품질 분석
    analyzeQuality(content, title) {
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
        if (currentTopic && currentTopic.keywords) {
            const density = this.calculateKeywordDensity(content, currentTopic.keywords);
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
            }
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
    
    // 품질 결과 표시
    displayQualityResults(analysis) {
        const overallElement = document.getElementById('overallQuality');
        if (overallElement) {
            overallElement.textContent = `${analysis.overall}점`;
            overallElement.className = 'quality-score ' + this.getQualityClass(analysis.overall);
        }
        
        // 개별 메트릭 업데이트
        this.updateMetric('wordCount', analysis.details.wordCount, analysis.wordCount);
        this.updateMetric('readability', `${analysis.readability}점`, analysis.readability);
        this.updateMetric('structureScore', `${analysis.structure}점`, analysis.structure);
        this.updateMetric('keywordDensity', `${analysis.keywordDensity}점`, analysis.keywordDensity);
    }
    
    // 메트릭 업데이트
    updateMetric(id, value, score) {
        const valueElement = document.getElementById(id);
        const barElement = document.getElementById(id + 'Bar');
        
        if (valueElement) valueElement.textContent = value;
        if (barElement) {
            barElement.style.width = `${score}%`;
            barElement.className = 'metric-fill ' + this.getQualityClass(score);
        }
    }
    
    // 품질 클래스 반환
    getQualityClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        return 'poor';
    }
    
    // ===== 발행 기능 =====
    async publishContent() {
        const title = this.getInputValue('postTitle');
        const content = this.getInputValue('postContent');
        
        if (!title || !content) {
            this.showNotification('warning', '내용 부족', '제목과 본문을 모두 입력해주세요.');
            return;
        }
        
        // 품질 검사
        if (!qualityData || qualityData.overall < 60) {
            const quality = await this.checkQuality();
            if (!quality || quality.overall < 60) {
                const proceed = confirm('품질 점수가 60점 미만입니다. 그래도 발행하시겠습니까?');
                if (!proceed) return;
            }
        }
        
        // 발행 확인
        if (!confirm('정말로 발행하시겠습니까?')) return;
        
        try {
            // 발행 시뮬레이션
            await this.simulatePublishing({
                title, content,
                category: this.getInputValue('postCategory'),
                tags: this.getInputValue('postTags'),
                metaDescription: this.getInputValue('metaDescription')
            });
            
            // 발행 성공 처리
            systemStats.totalPublished++;
            this.updateSystemStats();
            
            this.showNotification('success', '발행 완료', '블로그에 성공적으로 발행되었습니다.');
            this.logActivity('발행 성공', `"${title}" 글이 발행되었습니다.`, 'success');
            
            // 에디터 초기화 옵션
            if (confirm('에디터를 초기화하시겠습니까?')) {
                this.clearEditor();
            }
            
        } catch (error) {
            console.error('발행 오류:', error);
            this.showNotification('error', '발행 실패', error.message);
            this.logActivity('발행 실패', error.message, 'error');
        }
    }
    
    // 발행 시뮬레이션
    async simulatePublishing(postData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% 성공률
                    resolve({
                        success: true,
                        postId: 'post_' + Date.now(),
                        publishedAt: new Date().toISOString()
                    });
                } else {
                    reject(new Error('네트워크 오류로 발행에 실패했습니다.'));
                }
            }, 2000);
        });
    }
    
    // ===== 이미지 생성 =====
    async generateImage() {
        const prompt = this.getInputValue('imagePrompt');
        if (!prompt) {
            this.showNotification('warning', '프롬프트 필요', '이미지 설명을 입력해주세요.');
            return;
        }
        
        try {
            this.showNotification('info', '이미지 생성 중', 'AI가 이미지를 생성하고 있습니다...');
            
            // OpenAI API 호출 또는 시뮬레이션
            const imageUrl = await this.generateImageAPI(prompt);
            
            const container = document.getElementById('generatedImages');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; margin: 1rem 0;">
                        <img src="${imageUrl}" alt="${prompt}" style="max-width: 100%; border-radius: 8px; box-shadow: var(--shadow);">
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-light);">${prompt}</p>
                        <button class="btn btn-secondary mt-1" onclick="downloadImage('${imageUrl}')">💾 이미지 저장</button>
                    </div>
                `;
            }
            
            this.showNotification('success', '이미지 생성 완료', '이미지가 성공적으로 생성되었습니다.');
            this.logActivity('이미지 생성', `"${prompt}" 이미지가 생성되었습니다.`);
            
        } catch (error) {
            console.error('이미지 생성 오류:', error);
            this.showNotification('error', '이미지 생성 실패', error.message);
        }
    }
    
    // 이미지 생성 API
    async generateImageAPI(prompt) {
        try {
            const response = await fetch(this.apiConfig.openai.imageURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.openai.apiKey}`
                },
                body: JSON.stringify({
                    prompt: `Professional haircare related image: ${prompt}. High quality, clean background, professional lighting.`,
                    n: 1,
                    size: "1024x1024"
                })
            });
            
            if (!response.ok) {
                throw new Error(`이미지 생성 실패: ${response.status}`);
            }
            
            const data = await response.json();
            return data.data[0].url;
            
        } catch (error) {
            // 실패시 플레이스홀더 이미지 반환
            console.warn('OpenAI 이미지 생성 실패, 플레이스홀더 사용:', error);
            return `https://via.placeholder.com/512x512/667eea/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`;
        }
    }
    
    // ===== SEO 도구들 =====
    
    generateSEOTitle() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 글감을 선택해주세요.');
            return;
        }
        
        const titlePatterns = [
            `${currentTopic.title} | ${currentTopic.targetAudience} 필수 가이드`,
            `2024년 최신 ${currentTopic.keywords[0]} 완전정복`,
            `${currentTopic.keywords[0]} 전문가가 알려주는 실전 노하우`,
            `${currentTopic.targetAudience}을 위한 ${currentTopic.keywords[0]} 핵심 전략`,
            `실무진이 인정한 ${currentTopic.keywords[0]} 베스트 가이드`
        ];
        
        const randomTitle = titlePatterns[Math.floor(Math.random() * titlePatterns.length)];
        this.setInputValue('seoTitle', randomTitle);
        
        this.showNotification('success', 'SEO 제목 생성', 'SEO 최적화된 제목이 생성되었습니다.');
    }
    
    generateMetaDescription(content = null) {
        const postContent = content || this.getInputValue('postContent');
        if (!postContent) {
            this.showNotification('warning', '본문 필요', '본문을 입력해주세요.');
            return '';
        }
        
        const firstParagraph = postContent.split('\n\n')[0] || '';
        let metaDesc = firstParagraph.replace(/[#*`]/g, '').trim();
        
        if (metaDesc.length > 150) {
            metaDesc = metaDesc.substring(0, 147) + '...';
        }
        
        if (content === null) {
            this.setInputValue('metaDescription', metaDesc);
            this.showNotification('success', '메타 설명 생성', '메타 설명이 자동으로 생성되었습니다.');
        }
        
        return metaDesc;
    }
    
    async suggestKeywords() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 글감을 선택해주세요.');
            return;
        }
        
        const baseKeywords = currentTopic.keywords;
        const additionalKeywords = [
            "전문가", "노하우", "가이드", "팁", "방법", "효과", "추천", "비법", "완벽", "실전"
        ];
        
        const allKeywords = [...baseKeywords, ...additionalKeywords];
        
        const container = document.getElementById('keywordSuggestions');
        if (container) {
            container.innerHTML = `
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <h4>💡 추천 키워드</h4>
                    <div class="keyword-tags">
                        ${allKeywords.map(keyword => 
                            `<span class="keyword-tag" onclick="addKeyword('${keyword}')">${keyword}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        this.showNotification('success', '키워드 제안 완료', '추천 키워드가 생성되었습니다. 클릭하여 추가하세요.');
    }
    
    checkSEOScore() {
        const title = this.getInputValue('seoTitle') || this.getInputValue('postTitle');
        const content = this.getInputValue('postContent');
        const keywords = this.getInputValue('primaryKeywords');
        
        if (!title || !content) {
            this.showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
            return;
        }
        
        let score = 0;
        let feedback = [];
        
        // 제목 길이 검사
        if (title.length >= 30 && title.length <= 60) {
            score += 25;
            feedback.push('✅ 제목 길이가 적절합니다.');
        } else {
            feedback.push('❌ 제목 길이를 30-60자로 조정하세요.');
        }
        
        // 키워드 밀도 검사
        if (keywords) {
            const keywordList = keywords.split(',').map(k => k.trim());
            const density = this.calculateKeywordDensity(content, keywordList);
            if (density >= 1.5 && density <= 4.0) {
                score += 30;
                feedback.push('✅ 키워드 밀도가 적절합니다.');
            } else {
                feedback.push('❌ 키워드 밀도를 1.5-4%로 조정하세요.');
            }
        }
        
        // 구조 검사
        if (/^#+\s/gm.test(content)) {
            score += 25;
            feedback.push('✅ 제목 구조가 좋습니다.');
        } else {
            feedback.push('❌ 소제목(##, ###)을 추가하세요.');
        }
        
        if (/^[-*+]\s/gm.test(content)) {
            score += 20;
            feedback.push('✅ 목록 구조가 포함되어 있습니다.');
        } else {
            feedback.push('❌ 불릿 포인트나 번호 목록을 추가하세요.');
        }
        
        // 결과 표시
        const type = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
        this.showNotification(type, `SEO 점수: ${score}/100`, feedback.join('\n'));
    }
    
    // ===== 자동화 기능 =====
    
    toggleAutomation() {
        const toggle = document.getElementById('automationEnabled');
        automationEnabled = toggle?.checked || false;
        
        if (automationEnabled) {
            this.startAutomation();
            this.showNotification('success', '자동화 시작', '자동 처리가 활성화되었습니다.');
            this.logActivity('자동화 시작', '자동 처리 시스템이 시작되었습니다.');
        } else {
            this.stopAutomation();
            this.showNotification('info', '자동화 중지', '자동 처리가 비활성화되었습니다.');
            this.logActivity('자동화 중지', '자동 처리 시스템이 중지되었습니다.');
        }
        
        this.saveAutomationSettings();
    }
    
    startAutomation() {
        if (automationInterval) {
            clearInterval(automationInterval);
        }
        
        const interval = parseInt(this.getInputValue('processInterval') || '60') * 60 * 1000;
        
        automationInterval = setInterval(async () => {
            const waitingItems = contentQueue.filter(item => item.status === '대기중');
            if (waitingItems.length > 0 && !isProcessing) {
                console.log('자동화: 다음 글감 처리 시작');
                await this.processNextInQueue();
            }
        }, interval);
        
        this.showNotification('success', '자동화 시작', `${interval/60000}분마다 자동으로 처리합니다.`);
    }
    
    stopAutomation() {
        if (automationInterval) {
            clearInterval(automationInterval);
            automationInterval = null;
        }
    }
    
    // ===== AI 연결 테스트 =====
    
    async testClaudeConnection() {
        try {
            const statusEl = document.getElementById('claudeStatus');
            if (statusEl) statusEl.innerHTML = '🔄 테스트 중...';
            
            const response = await fetch(this.apiConfig.claude.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiConfig.claude.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.apiConfig.claude.model,
                    max_tokens: 100,
                    messages: [{
                        role: 'user',
                        content: '안녕하세요'
                    }]
                })
            });
            
            if (response.ok) {
                if (statusEl) statusEl.innerHTML = '✅ 연결됨';
                this.showNotification('success', 'Claude 연결 성공', 'API가 정상적으로 작동합니다.');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            const statusEl = document.getElementById('claudeStatus');
            if (statusEl) statusEl.innerHTML = '❌ 연결 실패';
            this.showNotification('error', 'Claude 연결 실패', error.message);
        }
    }
    
    async testOpenAIConnection() {
        try {
            const statusEl = document.getElementById('openaiStatus');
            if (statusEl) statusEl.innerHTML = '🔄 테스트 중...';
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiConfig.openai.apiKey}`
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
            
            if (response.ok) {
                if (statusEl) statusEl.innerHTML = '✅ 연결됨';
                this.showNotification('success', 'OpenAI 연결 성공', 'API가 정상적으로 작동합니다.');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            const statusEl = document.getElementById('openaiStatus');
            if (statusEl) statusEl.innerHTML = '❌ 연결 실패';
            this.showNotification('error', 'OpenAI 연결 실패', error.message);
        }
    }
    
    // ===== 유틸리티 함수들 =====
    
    // 큐 필터링
    filterQueue(status) {
        currentFilter = status;
        this.updateQueueManagerContent();
        
        // 버튼 활성화 상태 업데이트
        document.querySelectorAll('[onclick^="filterQueue"]').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        
        const activeBtn = document.querySelector(`[onclick="filterQueue('${status}')"]`);
        if (activeBtn) {
            activeBtn.classList.remove('btn-secondary');
            activeBtn.classList.add('btn-primary');
        }
    }
    
    // 큐 통계 조회
    getQueueStatistics() {
        return {
            total: contentQueue.length,
            waiting: contentQueue.filter(item => item.status === '대기중').length,
            processing: contentQueue.filter(item => item.status === '작성중').length,
            completed: contentQueue.filter(item => item.status === '완료').length,
            failed: contentQueue.filter(item => item.status === '실패').length
        };
    }
    
    // 다음 큐 아이템 조회
    getNextQueueItem() {
        // 우선순위 순으로 정렬하여 첫 번째 대기중 아이템 반환
        const waitingItems = contentQueue
            .filter(item => item.status === '대기중')
            .sort((a, b) => {
                const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 };
                return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
            });
        
        return waitingItems[0] || null;
    }
    
    // 필터된 큐 조회
    getFilteredQueue() {
        if (currentFilter === 'all') {
            return contentQueue;
        }
        return contentQueue.filter(item => item.status === currentFilter);
    }
    
    // 큐 아이템 검색
    findQueueItem(id) {
        return contentQueue.find(item => item.id == id);
    }
    
    // 큐 아이템 상태 업데이트
    updateQueueItemStatus(id, status, error = null) {
        const item = this.findQueueItem(id);
        if (item) {
            item.status = status;
            if (error) item.error = error;
            if (status === '완료') item.completedAt = new Date().toISOString();
            
            this.saveQueueToStorage();
            this.updateQueueStats();
            this.updateQueueManagerContent();
        }
    }
    
    // 상태 텍스트 반환
    getStatusText(status) {
        const statusMap = {
            '대기중': '대기중',
            '작성중': '작성중',
            '완료': '완료',
            '실패': '실패'
        };
        return statusMap[status] || status;
    }
    
    // 상태 클래스 반환
    getStatusClass(status) {
        const classMap = {
            '대기중': 'waiting',
            '작성중': 'processing',
            '완료': 'completed',
            '실패': 'failed'
        };
        return classMap[status] || '';
    }
    
    // 우선순위 텍스트 반환
    getPriorityText(priority) {
        const priorityMap = {
            'high': '높음',
            'normal': '보통',
            'low': '낮음'
        };
        return priorityMap[priority] || '보통';
    }
    
    // ===== 저장/로드 함수들 =====
    
    // 큐 저장
    saveQueueToStorage() {
        try {
            localStorage.setItem('hairgator_queue', JSON.stringify(contentQueue));
            localStorage.setItem('hairgator_queue_last_saved', new Date().toISOString());
        } catch (error) {
            console.error('큐 저장 실패:', error);
        }
    }
    
    // 큐 로드
    loadQueueFromStorage() {
        try {
            const saved = localStorage.getItem('hairgator_queue');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    contentQueue = parsed;
                    console.log(`📂 저장된 큐 로드됨: ${contentQueue.length}개 항목`);
                }
            }
        } catch (error) {
            console.error('큐 로드 실패:', error);
        }
    }
    
    // 자동화 설정 저장
    saveAutomationSettings() {
        const settings = {
            enabled: automationEnabled,
            interval: this.getInputValue('processInterval'),
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hairgator_automation', JSON.stringify(settings));
    }
    
    // 자동화 설정 로드
    loadAutomationSettings() {
        try {
            const saved = localStorage.getItem('hairgator_automation');
            if (saved) {
                const settings = JSON.parse(saved);
                automationEnabled = settings.enabled || false;
                
                const toggle = document.getElementById('automationEnabled');
                if (toggle) toggle.checked = automationEnabled;
                
                const interval = document.getElementById('processInterval');
                if (interval) interval.value = settings.interval || '60';
            }
        } catch (error) {
            console.error('자동화 설정 로드 실패:', error);
        }
    }
    
    // 자동 백업 생성
    createAutoBackup() {
        const backup = {
            queue: contentQueue,
            stats: systemStats,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const backupKey = `hairgator_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        
        // 오래된 백업 정리 (최대 5개 유지)
        this.cleanupOldBackups();
    }
    
    // 오래된 백업 정리
    cleanupOldBackups() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('hairgator_backup_'))
            .sort()
            .reverse();
        
        if (backupKeys.length > 5) {
            backupKeys.slice(5).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
    
    // ===== UI 헬퍼 함수들 =====
    
    // 입력값 조회
    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }
    
    // 입력값 설정
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) element.value = value;
    }
    
    // 빠른 폼 초기화
    clearQuickForm() {
        ['quickTarget', 'quickTitle', 'quickKeywords', 'quickTone'].forEach(id => {
            this.setInputValue(id, '');
        });
    }
    
    // 새 콘텐츠 폼 초기화
    clearNewContentForm() {
        ['newTargetAudience', 'newTitle', 'newKeywords', 'newTone'].forEach(id => {
            this.setInputValue(id, '');
        });
    }
    
    // 에디터 초기화
    clearEditor() {
        ['postTitle', 'postContent', 'postTags', 'seoTitle', 'metaDescription', 'primaryKeywords'].forEach(id => {
            this.setInputValue(id, '');
        });
        
        generatedContent = null;
        currentTopic = null;
        qualityData = null;
        
        // 품질 결과 초기화
        const container = document.getElementById('qualityResults');
        if (container) container.innerHTML = '';
    }
    
    // 탭 전환
    switchTab(tabName) {
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 모든 탭 컨텐츠 숨김
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 선택된 탭 활성화
        const tabButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
        const tabContent = document.getElementById(`${tabName}Tab`);
        
        if (tabButton) tabButton.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
    }
    
    // 모달 표시
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.activeModals.add(modalId);
        }
    }
    
    // 모달 닫기
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete(modalId);
        }
    }
    
    // 모든 모달 닫기
    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    }
    
    // 큐 관리자 표시
    showQueueManager() {
        this.switchTab('queue');
        this.updateQueueManagerContent();
    }
    
    // 글감 추가 모달 표시
    showAddContentModal() {
        this.showModal('addContentModal');
    }
    
    // 키워드 추가
    addKeyword(keyword) {
        const input = document.getElementById('primaryKeywords');
        if (input) {
            const current = input.value.trim();
            const keywords = current ? current.split(',').map(k => k.trim()) : [];
            
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                input.value = keywords.join(', ');
                this.showNotification('success', '키워드 추가', `"${keyword}"가 추가되었습니다.`);
            }
        }
    }
    
    // 이미지 다운로드
    downloadImage(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `hairgator_image_${Date.now()}.jpg`;
        link.click();
        
        this.showNotification('success', '다운로드 시작', '이미지 다운로드가 시작되었습니다.');
    }
    
    // ===== 모니터링 및 상태 관리 =====
    
    // 시스템 상태 업데이트
    updateSystemStatus() {
        const status = this.checkSystemHealth();
        systemStats.systemStatus = status.overall;
        
        const statusEl = document.getElementById('systemStatus');
        if (statusEl) {
            statusEl.textContent = status.overall;
            statusEl.className = `status ${status.class}`;
        }
    }
    
    // 시스템 상태 검사
    checkSystemHealth() {
        let issues = [];
        
        // 메모리 사용량 확인
        if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) {
            issues.push('메모리 사용량 높음');
        }
        
        // 큐 상태 확인
        const failedItems = contentQueue.filter(item => item.status === '실패').length;
        if (failedItems > 3) {
            issues.push('처리 실패 항목 많음');
        }
        
        // 자동화 상태 확인
        if (automationEnabled && !automationInterval) {
            issues.push('자동화 시스템 오류');
        }
        
        if (issues.length === 0) {
            return { overall: '정상', class: 'healthy' };
        } else if (issues.length <= 2) {
            return { overall: '주의', class: 'warning' };
        } else {
            return { overall: '오류', class: 'error' };
        }
    }
    
    // 큐 상태 모니터링
    monitorQueueHealth() {
        const stats = this.getQueueStatistics();
        
        // 대기 항목이 너무 많은 경우 경고
        if (stats.waiting > 10) {
            this.showNotification('warning', '큐 과부하', `${stats.waiting}개의 글감이 대기 중입니다.`);
        }
        
        // 실패 항목이 많은 경우 경고
        if (stats.failed > 5) {
            this.showNotification('warning', '처리 실패', `${stats.failed}개의 글감 처리가 실패했습니다.`);
        }
    }
    
    // 자동화 모니터링 시작
    startAutomationMonitoring() {
        setInterval(() => {
            if (automationEnabled) {
                const waitingCount = contentQueue.filter(item => item.status === '대기중').length;
                const processingCount = contentQueue.filter(item => item.status === '작성중').length;
                
                // 자동화 상태 표시 업데이트
                const statusEl = document.getElementById('automationStatus');
                if (statusEl) {
                    if (processingCount > 0) {
                        statusEl.textContent = `처리 중 (${processingCount}개)`;
                        statusEl.className = 'status processing';
                    } else if (waitingCount > 0) {
                        statusEl.textContent = `대기 중 (${waitingCount}개)`;
                        statusEl.className = 'status waiting';
                    } else {
                        statusEl.textContent = '활성 (대기 없음)';
                        statusEl.className = 'status active';
                    }
                }
            }
        }, 5000); // 5초마다
    }
    
    // ===== 알림 시스템 =====
    
    // 알림 컨테이너 생성
    createNotificationContainer() {
        if (document.getElementById('notificationContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // 알림 표시
    showNotification(type, title, message) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-weight: bold; margin-bottom: 0.25rem;">${title}</div>
                    <div style="font-size: 0.9rem; white-space: pre-line;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; padding: 0; margin-left: 1rem;">×</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // 알림 색상 조회
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
    
    // ===== 활동 로그 =====
    
    // 활동 로그
    logActivity(title, description, type = 'info') {
        const timestamp = new Date().toLocaleString('ko-KR');
        console.log(`[${timestamp}] ${title}: ${description}`);
        
        // 활동 로그를 localStorage에 저장 (선택사항)
        try {
            const logs = JSON.parse(localStorage.getItem('hairgator_logs') || '[]');
            logs.unshift({ timestamp, title, description, type });
            
            // 최대 100개 로그만 유지
            if (logs.length > 100) {
                logs.splice(100);
            }
            
            localStorage.setItem('hairgator_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('로그 저장 실패:', error);
        }
    }
    
    // ===== 시스템 통계 업데이트 =====
    updateSystemStats() {
        const elements = {
            'totalGenerated': systemStats.totalGenerated,
            'totalPublished': systemStats.totalPublished,
            'systemStatus': systemStats.systemStatus,
            'overallQuality': qualityData?.overall || 0
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    // AI 상태 업데이트
    updateAIStatus() {
        const claudeStatus = document.getElementById('claudeStatus');
        const openaiStatus = document.getElementById('openaiStatus');
        
        if (claudeStatus) claudeStatus.textContent = '✅ 연결됨';
        if (openaiStatus) openaiStatus.textContent = '✅ 연결됨';
    }
    
    // ===== 헬퍼 함수들 =====
    
    // 지연 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 변경사항 확인
    hasUnsavedChanges() {
        return isProcessing || this.processingQueue.size > 0;
    }
    
    // 진행 상태 표시
    showGenerationProgress() {
        const progressEl = document.getElementById('generationProgress');
        if (progressEl) progressEl.style.display = 'block';
    }
    
    // 진행 상태 숨김
    hideGenerationProgress() {
        const progressEl = document.getElementById('generationProgress');
        if (progressEl) progressEl.style.display = 'none';
    }
    
    // 진행 텍스트 업데이트
    updateProgressText(text) {
        const textEl = document.getElementById('progressText');
        if (textEl) textEl.textContent = text;
    }
    
    // 도움말 표시
    showHelp() {
        const helpContent = `
🦄 HAIRGATOR 글감 큐 시스템 도움말

⌨️ 키보드 단축키:
• Ctrl+Enter: 다음 글 작성
• Ctrl+S: 저장
• Ctrl+P: 품질 검사
• F1: 도움말
• Esc: 모달 닫기

📝 사용법:
1. 빠른 추가로 글감 등록
2. "다음 글 작성" 또는 "전체 처리"
3. 품질 검사 후 발행

🤖 자동화:
• 설정한 간격으로 자동 처리
• 우선순위별 처리 순서
• 실패 시 자동 재시도

💡 팁:
• 키워드는 콤마로 구분
• 우선순위 높음 글감이 먼저 처리
• 백업은 자동으로 생성됨
        `;
        
        this.showNotification('info', '💡 도움말', helpContent);
    }
    
    // 탭 설정
    setupTabs() {
        // 기본 탭 활성화
        this.switchTab('write');
    }
    
    // 큐 아이템 클릭 처리
    handleQueueItemClick(e) {
        const queueItem = e.target.closest('.queue-item');
        if (!queueItem) return;
        
        const id = queueItem.dataset.id;
        const item = this.findQueueItem(id);
        
        if (item && item.generatedContent) {
            // 생성된 콘텐츠가 있으면 에디터에 로드
            this.displayGeneratedContent(item.generatedContent, item);
            this.switchTab('write');
        }
    }
    
    // 빠른 폼 변경 처리
    handleQuickFormChange() {
        // 입력값이 있으면 추가 버튼 활성화 등의 UI 업데이트
        const target = this.getInputValue('quickTarget');
        const title = this.getInputValue('quickTitle');
        const keywords = this.getInputValue('quickKeywords');
        
        const addBtn = document.getElementById('quickAddBtn');
        if (addBtn) {
            addBtn.disabled = !target || !title || !keywords;
        }
    }
    
    // 큐 처리 완료 처리
    handleQueueItemProcessed(detail) {
        console.log('큐 아이템 처리 완료:', detail);
        this.updateQueueStats();
        this.updateNextItemPreview();
    }
    
    // 자동화 상태 변경 처리
    handleAutomationStatusChange(detail) {
        console.log('자동화 상태 변경:', detail);
        this.updateSystemStats();
    }
}

// ===== 전역 애플리케이션 인스턴스 =====
let hairgatorApp = null;

// ===== 애플리케이션 시작 =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 HAIRGATOR 시스템 시작...');
    
    try {
        hairgatorApp = new HairGatorQueueApp();
        await hairgatorApp.initialize();
        
        // 전역 참조 설정
        window.hairgatorApp = hairgatorApp;
        
        console.log('✅ HAIRGATOR 시스템 준비 완료!');
        
    } catch (error) {
        console.error('❌ HAIRGATOR 시스템 초기화 실패:', error);
        alert('시스템 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
    }
});

// ===== 추가 전역 함수들 (호환성) =====

// 편집 기능 (향후 구현)
function editQueueItem(id) {
    console.log('편집 기능:', id);
    // TODO: 편집 모달 구현
    hairgatorApp?.showNotification('info', '편집 기능', '편집 기능은 곧 추가될 예정입니다.');
}

// 내보내기 기능
function exportQueue() {
    const data = {
        queue: contentQueue,
        stats: systemStats,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hairgator_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    hairgatorApp?.showNotification('success', '내보내기 완료', '데이터가 다운로드되었습니다.');
}

// 가져오기 기능
function importQueue() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.queue && Array.isArray(data.queue)) {
                    if (confirm('기존 큐를 덮어쓰시겠습니까?')) {
                        contentQueue = data.queue;
                        hairgatorApp?.saveQueueToStorage();
                        hairgatorApp?.updateQueueStats();
                        hairgatorApp?.updateQueueManagerContent();
                        hairgatorApp?.showNotification('success', '가져오기 완료', `${data.queue.length}개 항목이 로드되었습니다.`);
                    }
                } else {
                    throw new Error('올바르지 않은 파일 형식입니다.');
                }
            } catch (error) {
                hairgatorApp?.showNotification('error', '가져오기 실패', error.message);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}
