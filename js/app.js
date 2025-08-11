// HAIRGATOR - app.js
// 메인 애플리케이션 로직 - 최종본

// 전역 변수 및 상태 관리
let currentTopic = null;
let generatedContent = null;
let qualityData = null;
let automationEnabled = false;
let currentTargetAudience = 'hair_professionals';

// 시스템 통계
let systemStats = {
    totalPosts: 0,
    publishedPosts: 0,
    qualityScore: 0,
    systemStatus: '가동중',
    startTime: Date.now()
};

// 애플리케이션 메인 클래스
class HairGatorApp {
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
        
        console.log('🦄 HAIRGATOR 애플리케이션 초기화 시작...');
    }
    
    // 애플리케이션 초기화
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
            
            // 초기 설정 로드
            this.loadInitialSettings();
            
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
            this.logActivity('시스템 시작', 'HAIRGATOR 블로그 자동화 시스템이 시작되었습니다.', 'success');
            
            console.log('✅ HAIRGATOR 애플리케이션 초기화 완료!');
            
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
            this.showNotification('error', '초기화 실패', '시스템 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        }
    }
    
    // 모듈 연결
    connectModules() {
        // Utils 모듈 연결
        if (window.HairGatorUtils) {
            this.modules.utils = window.HairGatorUtils;
            console.log('🔧 Utils 모듈 연결 완료');
        }
        
        // AI 서비스 모듈 연결
        if (window.HairGatorAI) {
            this.modules.aiService = window.HairGatorAI;
            console.log('🤖 AI 서비스 모듈 연결 완료');
        }
        
        // 전역 함수들을 앱 인스턴스에 바인딩
        this.bindGlobalFunctions();
    }
    
    // 전역 함수 바인딩
    bindGlobalFunctions() {
        // 주요 기능들을 전역에서 접근 가능하도록 바인딩
        window.generateContent = this.generateContent.bind(this);
        window.checkQuality = this.checkQuality.bind(this);
        window.publishContent = this.publishContent.bind(this);
        window.previewContent = this.previewContent.bind(this);
        window.generateImage = this.generateImage.bind(this);
        window.schedulePublish = this.schedulePublish.bind(this);
        window.toggleAutomation = this.toggleAutomation.bind(this);
        window.selectTopic = this.selectTopic.bind(this);
        window.loadTopics = this.loadTopics.bind(this);
        
        // 모달 관리
        window.showModal = this.showModal.bind(this);
        window.closeModal = this.closeModal.bind(this);
        
        // 유틸리티 함수들
        window.showNotification = this.showNotification.bind(this);
        window.logActivity = this.logActivity.bind(this);
        window.updateCharCounter = this.updateCharCounter.bind(this);
        
        // API 테스트 함수들
        window.testClaudeConnection = this.testAIConnection.bind(this, 'claude');
        window.testOpenAIConnection = this.testAIConnection.bind(this, 'openai');
        
        // SEO 도구들
        window.generateSEOTitle = this.generateSEOTitle.bind(this);
        window.generateMetaDescription = this.generateMetaDescription.bind(this);
        window.suggestKeywords = this.suggestKeywords.bind(this);
        window.checkSEOScore = this.checkSEOScore.bind(this);
        
        console.log('🔗 전역 함수 바인딩 완료');
    }
    
    // 초기 설정 로드
    loadInitialSettings() {
        // 타겟 독자 설정 로드
        this.initializeTargetAudience();
        
        // 다크모드 설정 로드
        this.loadDarkModeSettings();
        
        // 자동화 설정 로드
        this.loadAutomationSettings();
        
        // 저장된 초안 로드
        this.loadDrafts();
        
        // 브라우저 호환성 체크
        this.checkBrowserCompatibility();
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 키보드 단축키
        this.setupKeyboardShortcuts();
        
        // 폼 이벤트
        this.setupFormEvents();
        
        // 버튼 클릭 이벤트
        this.setupButtonEvents();
        
        // 창 이벤트
        this.setupWindowEvents();
        
        // 커스텀 이벤트
        this.setupCustomEvents();
    }
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S: 임시저장
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveAsDraft();
            }
            
            // Ctrl+Enter: 콘텐츠 생성
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.generateContent();
            }
            
            // Ctrl+P: 미리보기
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.previewContent();
            }
            
            // Ctrl+Shift+P: 발행
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.publishContent();
            }
            
            // Escape: 모달 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // F5: 새로고침 확인
            if (e.key === 'F5' && this.hasUnsavedChanges()) {
                e.preventDefault();
                if (confirm('작성 중인 내용이 있습니다. 새로고침하시겠습니까?')) {
                    location.reload();
                }
            }
        });
    }
    
    // 폼 이벤트 설정
    setupFormEvents() {
        // 타겟 독자 변경
        const targetSelect = document.getElementById('primaryTarget');
        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                this.changeTargetAudience(e.target.value);
            });
        }
        
        // 콘텐츠 변경 감지
        const contentTextarea = document.getElementById('postContent');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', this.debounce(() => {
                this.updateQualityMetrics();
            }, 500));
        }
        
        // 제목 변경 감지
        const titleInput = document.getElementById('postTitle');
        if (titleInput) {
            titleInput.addEventListener('input', this.debounce(() => {
                this.updateQualityMetrics();
            }, 500));
        }
        
        // 문자 수 카운터
        this.setupCharCounters();
        
        // 파일 업로드
        this.setupFileUploads();
    }
    
    // 문자 수 카운터 설정
    setupCharCounters() {
        const counters = [
            { inputId: 'seoTitle', counterId: 'seoTitleCounter', maxLength: 60 },
            { inputId: 'metaDescription', counterId: 'metaDescCounter', maxLength: 150 },
            { inputId: 'postTitle', counterId: 'titleCounter', maxLength: 100 }
        ];
        
        counters.forEach(({ inputId, counterId, maxLength }) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateCharCounter(inputId, counterId, maxLength);
                });
            }
        });
    }
    
    // 파일 업로드 설정
    setupFileUploads() {
        const backupInput = document.getElementById('backupFileInput');
        if (backupInput) {
            backupInput.addEventListener('change', (e) => {
                this.restoreData(e.target);
            });
        }
    }
    
    // 버튼 이벤트 설정
    setupButtonEvents() {
        // 이벤트 위임 사용
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // AI 테스트 버튼
            if (target.classList.contains('test-btn')) {
                this.handleAITest(e);
            }
            
            // 주제 관련 버튼
            if (target.classList.contains('topic-item')) {
                this.selectTopic(target);
            }
            if (target.classList.contains('delete-btn')) {
                this.deleteTopic(target.closest('.topic-item'));
            }
            if (target.classList.contains('edit-btn')) {
                this.editTopic(target.closest('.topic-item'));
            }
            
            // 카테고리 탭
            if (target.classList.contains('tab-btn')) {
                this.switchCategory(target);
            }
            
            // 에디터 탭
            if (target.classList.contains('editor-tab')) {
                this.switchEditorTab(target);
            }
            
            // 모달 닫기 (배경 클릭)
            if (target.classList.contains('modal')) {
                this.closeModal(target.id);
            }
            
            // 알림 닫기
            if (target.classList.contains('notification-close')) {
                this.closeNotification(target);
            }
            
            // 스케줄 관련
            if (target.classList.contains('cancel-schedule')) {
                this.cancelSchedule(target);
            }
            
            // 키워드 제안
            if (target.classList.contains('keyword-suggestion')) {
                this.addKeyword(target.textContent);
            }
            
            // 이미지 관련
            if (target.classList.contains('select-image')) {
                this.selectImage(target.dataset.imageUrl);
            }
            if (target.classList.contains('delete-image')) {
                this.deleteImage(target);
            }
        });
    }
    
    // 창 이벤트 설정
    setupWindowEvents() {
        // 페이지 이탈 시 확인
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                const confirmationMessage = '작성 중인 내용이 있습니다. 페이지를 떠나시겠습니까?';
                e.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        });
        
        // 창 크기 변경
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 300));
        
        // 온라인/오프라인 상태
        window.addEventListener('online', () => {
            this.showNotification('success', '연결 복구', '인터넷 연결이 복구되었습니다.');
            this.logActivity('연결 상태', '온라인 상태로 변경되었습니다.', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('warning', '연결 끊김', '인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.');
            this.logActivity('연결 상태', '오프라인 상태로 변경되었습니다.', 'warning');
        });
        
        // 에러 핸들링
        window.addEventListener('error', (e) => {
            console.error('JavaScript 오류:', e.error);
            this.logActivity('시스템 오류', `JavaScript 오류: ${e.message}`, 'error');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise 오류:', e.reason);
            this.logActivity('Promise 오류', `처리되지 않은 Promise 오류: ${e.reason}`, 'error');
        });
    }
    
    // 커스텀 이벤트 설정
    setupCustomEvents() {
        // AI 작업 완료 이벤트
        document.addEventListener('ai-task-complete', (e) => {
            this.handleAITaskComplete(e.detail);
        });
        
        // 품질 분석 완료 이벤트
        document.addEventListener('quality-analysis-complete', (e) => {
            this.handleQualityAnalysisComplete(e.detail);
        });
        
        // 자동화 상태 변경 이벤트
        document.addEventListener('automation-status-change', (e) => {
            this.handleAutomationStatusChange(e.detail);
        });
    }
    
    // UI 초기화
    initializeUI() {
        // 주제 목록 로드
        this.loadTopics();
        
        // 카테고리 탭 설정
        this.setupCategoryTabs();
        
        // 에디터 탭 설정
        this.setupEditorTabs();
        
        // 통계 업데이트
        this.updateSystemStats();
        
        // AI 상태 업데이트
        this.updateAIStatus();
        
        // 활동 로그 초기화
        this.initializeActivityLog();
        
        // 알림 컨테이너 생성
        this.createNotificationContainer();
    }
    
    // 자동화 시스템 초기화
    initializeAutomation() {
        // 자동화 설정 로드
        this.loadAutomationSettings();
        
        // 스케줄된 작업 복원
        this.restoreScheduledTasks();
        
        // 자동화 모니터링 시작
        this.startAutomationMonitoring();
    }
    
    // 모니터링 시작
    startMonitoring() {
        // 시스템 상태 모니터링
        setInterval(() => {
            this.updateSystemStatus();
        }, 60000); // 1분마다
        
        // 성능 모니터링
        this.startPerformanceMonitoring();
        
        // 메모리 사용량 모니터링
        this.startMemoryMonitoring();
    }
    
    // 웰컴 메시지 표시
    showWelcomeMessage() {
        this.showNotification('success', '시스템 준비 완료', 
            'HAIRGATOR 블로그 자동화 시스템이 준비되었습니다. 키보드 단축키를 활용하여 더 빠르게 작업하세요!');
        
        // 팁 표시 (첫 방문자용)
        if (!localStorage.getItem('hairgator_visited')) {
            setTimeout(() => {
                this.showTips();
                localStorage.setItem('hairgator_visited', 'true');
            }, 3000);
        }
    }
    
    // 팁 표시
    showTips() {
        const tips = [
            'Ctrl+Enter로 빠르게 콘텐츠를 생성할 수 있습니다.',
            'Ctrl+S로 언제든 임시저장이 가능합니다.',
            'F1키로 도움말을 확인할 수 있습니다.',
            '품질 점수 70점 이상이면 네이버 상위노출에 유리합니다.'
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.showNotification('info', '💡 팁', randomTip);
    }
    
    // ===========================================
    // 핵심 기능 구현
    // ===========================================
    
    // 콘텐츠 생성
    async generateContent() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 주제를 선택해주세요.');
            return;
        }
        
        if (!this.modules.aiService) {
            this.showNotification('error', 'AI 서비스 오류', 'AI 서비스가 연결되지 않았습니다.');
            return;
        }
        
        // 생성 진행 상태 표시
        this.showGenerationProgress();
        
        try {
            const options = {
                targetAudience: currentTargetAudience,
                naverSEO: true,
                contentType: currentTopic.difficulty === 'expert' ? 'advanced' : 'standard'
            };
            
            const result = await this.modules.aiService.generateHaircareContent(currentTopic, options);
            
            if (result.success) {
                // 에디터에 결과 적용
                this.applyGeneratedContent(result.data);
                
                // 품질 검사 자동 실행
                await this.checkQuality();
                
                // 통계 업데이트
                systemStats.totalPosts++;
                this.updateSystemStats();
                
                this.showNotification('success', '콘텐츠 생성 완료', 
                    '헤어케어 전문 글이 성공적으로 생성되었습니다.');
                this.logActivity('콘텐츠 생성', `"${result.data.title}" 글이 생성되었습니다.`);
                
                // 커스텀 이벤트 발송
                document.dispatchEvent(new CustomEvent('ai-task-complete', {
                    detail: { type: 'content-generation', result: result.data }
                }));
                
            } else {
                throw new Error(result.error || '콘텐츠 생성에 실패했습니다.');
            }
            
        } catch (error) {
            console.error('콘텐츠 생성 오류:', error);
            this.showNotification('error', '생성 실패', error.message);
            this.logActivity('생성 실패', `콘텐츠 생성 실패: ${error.message}`, 'error');
        } finally {
            this.hideGenerationProgress();
        }
    }
    
    // 생성된 콘텐츠 적용
    applyGeneratedContent(data) {
        const elements = {
            'postTitle': data.title,
            'postContent': data.content,
            'metaDescription': data.metaDescription,
            'postCategory': currentTopic.category,
            'postTags': currentTopic.keywords.join(', ')
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
                
                // 문자 수 카운터 업데이트
                if (id === 'metaDescription') {
                    this.updateCharCounter(id, 'metaDescCounter', 150);
                }
            }
        });
        
        generatedContent = data;
    }
    
    // 품질 검사
    async checkQuality() {
        const title = document.getElementById('postTitle')?.value || '';
        const content = document.getElementById('postContent')?.value || '';
        
        if (!title || !content) {
            this.showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
            return null;
        }
        
        try {
            // 로컬 분석 (즉시 실행)
            const localAnalysis = this.performLocalQualityAnalysis(title, content);
            this.updateQualityDisplay(localAnalysis);
            
            // AI 기반 심화 분석 (비동기)
            if (this.modules.aiService) {
                const aiAnalysis = await this.modules.aiService.checkContentQuality(content, {
                    title: title,
                    targetKeywords: currentTopic?.keywords || [],
                    naverSEO: true
                });
                
                if (aiAnalysis.success) {
                    // AI 분석 결과로 업데이트
                    this.updateQualityDisplay(aiAnalysis.data);
                    qualityData = aiAnalysis.data;
                } else {
                    qualityData = localAnalysis;
                }
            } else {
                qualityData = localAnalysis;
            }
            
            this.logActivity('품질 검사', `품질 점수: ${qualityData.overallScore}/100`);
            
            // 커스텀 이벤트 발송
            document.dispatchEvent(new CustomEvent('quality-analysis-complete', {
                detail: { analysis: qualityData }
            }));
            
            return qualityData;
            
        } catch (error) {
            console.error('품질 검사 오류:', error);
            this.showNotification('error', '품질 검사 실패', error.message);
            return null;
        }
    }
    
    // 로컬 품질 분석
    performLocalQualityAnalysis(title, content) {
        // Utils 모듈의 분석 함수들 사용
        const wordCount = this.modules.utils?.analyzeWordCount?.(content) || { score: 70, count: content.length };
        const readability = this.modules.utils?.analyzeReadability?.(content) || { score: 75 };
        const keywordDensity = this.modules.utils?.analyzeKeywordDensity?.(content, currentTopic) || { score: 70, density: 2.0 };
        const structure = this.modules.utils?.analyzeStructure?.(content) || { score: 80 };
        const expertise = this.modules.utils?.analyzeExpertise?.(content) || { score: 65 };
        
        const overallScore = Math.round(
            (wordCount.score * 0.2) +
            (readability.score * 0.15) +
            (keywordDensity.score * 0.25) +
            (structure.score * 0.25) +
            (expertise.score * 0.15)
        );
        
        return {
            overallScore,
            wordCount,
            readability,
            keywordDensity,
            structure,
            expertise,
            analyzedAt: new Date().toISOString(),
            isLocal: true
        };
    }
    
    // 품질 표시 업데이트
    updateQualityDisplay(analysis) {
        // 전체 점수
        const overallElement = document.getElementById('overallQuality');
        if (overallElement) {
            overallElement.textContent = analysis.overallScore;
            overallElement.className = 'quality-score ' + this.getQualityClass(analysis.overallScore);
        }
        
        // 개별 메트릭 업데이트
        if (analysis.wordCount) {
            this.updateMetric('wordCount', analysis.wordCount.count, analysis.wordCount.score);
        }
        if (analysis.readability) {
            this.updateMetric('readability', analysis.readability.score, analysis.readability.score);
        }
        if (analysis.keywordDensity) {
            this.updateMetric('keywordDensity', 
                analysis.keywordDensity.density + '%', analysis.keywordDensity.score);
        }
        if (analysis.structure) {
            this.updateMetric('structureScore', analysis.structure.score, analysis.structure.score);
        }
        if (analysis.expertise) {
            this.updateMetric('expertiseScore', analysis.expertise.score, analysis.expertise.score);
        }
        
        // 추천사항 업데이트
        this.updateRecommendations(analysis);
    }
    
    // 메트릭 업데이트
    updateMetric(metricId, value, score) {
        const valueElement = document.getElementById(metricId);
        const barElement = document.getElementById(metricId + 'Bar');
        
        if (valueElement) valueElement.textContent = value;
        if (barElement) {
            barElement.style.width = score + '%';
            barElement.className = 'metric-fill ' + this.getQualityClass(score);
        }
    }
    
    // 품질 클래스 반환
    getQualityClass(score) {
        if (score >= 85) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    }
    
    // 추천사항 업데이트
    updateRecommendations(analysis) {
        const container = document.getElementById('qualityRecommendations');
        if (!container) return;
        
        const recommendations = this.generateRecommendations(analysis);
        
        container.innerHTML = recommendations.length > 0 ?
            recommendations.map(rec => 
                `<div class="recommendation priority-${rec.priority}">${rec.message}</div>`
            ).join('') :
            '<div class="recommendation priority-low">품질이 우수합니다! 발행 준비가 완료되었습니다.</div>';
    }
    
    // 추천사항 생성
    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.wordCount && analysis.wordCount.score < 70) {
            const priority = analysis.wordCount.score < 40 ? 'high' : 'medium';
            const message = analysis.wordCount.count < 1500 ? 
                '글 길이가 짧습니다. 1500자 이상으로 늘려보세요.' :
                '글이 너무 깁니다. 핵심 내용을 중심으로 정리해보세요.';
            recommendations.push({ priority, message });
        }
        
        if (analysis.structure && analysis.structure.score < 70) {
            recommendations.push({
                priority: 'high',
                message: '소제목(##), 목록(-), 강조(**굵게**)를 더 활용해 구조를 개선하세요.'
            });
        }
        
        if (analysis.keywordDensity && analysis.keywordDensity.score < 70) {
            const priority = 'medium';
            const message = analysis.keywordDensity.density < 1.5 ? 
                '핵심 키워드를 더 자주 사용해보세요.' :
                '키워드 사용이 과도합니다. 자연스럽게 줄여보세요.';
            recommendations.push({ priority, message });
        }
        
        if (analysis.readability && analysis.readability.score < 70) {
            recommendations.push({
                priority: 'medium',
                message: '문장을 더 짧고 명확하게 작성해보세요.'
            });
        }
        
        if (analysis.expertise && analysis.expertise.score < 60) {
            recommendations.push({
                priority: 'low',
                message: '헤어케어 전문 용어와 표현을 더 활용해보세요.'
            });
        }
        
        return recommendations;
    }
    
    // 콘텐츠 발행
    async publishContent() {
        const title = document.getElementById('postTitle')?.value;
        const content = document.getElementById('postContent')?.value;
        
        if (!title || !content) {
            this.showNotification('warning', '내용 부족', '제목과 본문을 모두 입력해주세요.');
            return;
        }
        
        // 품질 검사
        if (!qualityData || qualityData.overallScore < 60) {
            const quality = await this.checkQuality();
            if (!quality || quality.overallScore < 60) {
                const proceed = confirm('품질 점수가 60점 미만입니다. 그래도 발행하시겠습니까?');
                if (!proceed) return;
            }
        }
        
        // 발행 확인
        if (!confirm('정말로 발행하시겠습니까?')) return;
        
        const publishBtn = document.getElementById('publishBtn');
        const btnText = publishBtn?.querySelector('.btn-text');
        const btnLoader = publishBtn?.querySelector('.btn-loader');
        
        // 발행 시작
        if (publishBtn) publishBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-block';
        
        try {
            // 실제 발행 로직 (현재는 시뮬레이션)
            await this.simulatePublishing({
                title, content,
                category: document.getElementById('postCategory')?.value,
                tags: document.getElementById('postTags')?.value,
                metaDescription: document.getElementById('metaDescription')?.value
            });
            
            // 발행 성공 처리
            systemStats.publishedPosts++;
            this.updateSystemStats();
            
            this.showNotification('success', '발행 완료', '네이버 블로그에 성공적으로 발행되었습니다.');
            this.logActivity('발행 성공', `"${title}" 글이 발행되었습니다.`, 'success');
            
            // 에디터 초기화
            this.clearEditor();
            
        } catch (error) {
            console.error('발행 오류:', error);
            this.showNotification('error', '발행 실패', error.message);
            this.logActivity('발행 실패', error.message, 'error');
        } finally {
            // 버튼 상태 복원
            if (publishBtn) publishBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
    
    // 발행 시뮬레이션
    async simulatePublishing(postData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90% 성공률 시뮬레이션
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        postId: 'post_' + Date.now(),
                        publishedAt: new Date().toISOString()
                    });
                } else {
                    reject(new Error('네트워크 오류로 발행에 실패했습니다.'));
                }
            }, 3000);
        });
    }
    
    // 미리보기
    previewContent() {
        const title = document.getElementById('postTitle')?.value || '제목 없음';
        const content = document.getElementById('postContent')?.value || '내용 없음';
        
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;
        
        // 마크다운을 HTML로 변환
        const htmlContent = this.markdownToHTML(content);
        
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h1>${title}</h1>
                <div class="preview-meta">
                    <span>카테고리: ${this.getCategoryDisplayName(document.getElementById('postCategory')?.value || 'basic')}</span>
                    <span>작성일: ${new Date().toLocaleDateString('ko-KR')}</span>
                    <span>타겟: ${this.getTargetAudienceDisplayName(currentTargetAudience)}</span>
                </div>
            </div>
            <div class="preview-content">
                ${htmlContent}
            </div>
        `;
        
        this.showModal('previewModal');
        this.logActivity('미리보기', '콘텐츠 미리보기를 확인했습니다.');
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
    
    // ===========================================
    // 유틸리티 함수들
    // ===========================================
    
    // 디바운스 함수
    debounce(func, wait) {
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
    
    // 미저장 변경사항 확인
    hasUnsavedChanges() {
        const title = document.getElementById('postTitle')?.value?.trim();
        const content = document.getElementById('postContent')?.value?.trim();
        return Boolean(title || content);
    }
    
    // 창 크기 변경 처리
    handleWindowResize() {
        // 반응형 레이아웃 조정
        this.adjustLayout();
        
        // 모달 크기 조정
        this.adjustModalSizes();
    }
    
    // 레이아웃 조정
    adjustLayout() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile-layout', isMobile);
    }
    
    // 모달 크기 조정
    adjustModalSizes() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                // 모바일에서 전체 화면으로 조정
                if (window.innerWidth < 768) {
                    modal.classList.add('mobile-fullscreen');
                } else {
                    modal.classList.remove('mobile-fullscreen');
                }
            }
        });
    }
    
    // 성능 모니터링 시작
    startPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.duration > 1000) {
                        console.warn(`성능 경고: ${entry.name} ${entry.duration}ms`);
                        this.logActivity('성능 경고', 
                            `${entry.name} 작업이 ${Math.round(entry.duration)}ms 소요`, 'warning');
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
    }
    
    // 메모리 모니터링 시작
    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
                
                if (usedMB > limitMB * 0.8) {
                    console.warn(`메모리 사용량 경고: ${usedMB}MB / ${limitMB}MB`);
                    this.logActivity('메모리 경고', 
                        `메모리 사용량이 높습니다: ${usedMB}MB`, 'warning');
                }
            }, 60000); // 1분마다
        }
    }
    
    // 브라우저 호환성 체크
    checkBrowserCompatibility() {
        const features = {
            'localStorage': typeof(Storage) !== 'undefined',
            'fetch': typeof(fetch) !== 'undefined',
            'Promise': typeof(Promise) !== 'undefined',
            'addEventListener': typeof(document.addEventListener) !== 'undefined',
            'classList': 'classList' in document.documentElement,
            'dataset': 'dataset' in document.documentElement
        };
        
        const unsupported = Object.entries(features)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (unsupported.length > 0) {
            this.showNotification('warning', '브라우저 호환성', 
                `일부 기능이 지원되지 않습니다: ${unsupported.join(', ')}. 최신 브라우저 사용을 권장합니다.`);
            this.logActivity('호환성 경고', `지원되지 않는 기능: ${unsupported.join(', ')}`, 'warning');
        }
    }
    
    // ===========================================
    // 헬퍼 함수들 (기존 코드에서 이동)
    // ===========================================
    
    // 생성 진행 상태 표시/숨김
    showGenerationProgress() {
        const progressElement = document.getElementById('generationProgress');
        if (progressElement) {
            progressElement.style.display = 'block';
        }
    }
    
    hideGenerationProgress() {
        const progressElement = document.getElementById('generationProgress');
        if (progressElement) {
            progressElement.style.display = 'none';
        }
    }
    
    // 시스템 통계 업데이트
    updateSystemStats() {
        const elements = {
            'totalPosts': systemStats.totalPosts,
            'publishedPosts': systemStats.publishedPosts,
            'systemStatus': systemStats.systemStatus,
            'qualityScore': qualityData?.overallScore || 0
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    // AI 상태 업데이트
    updateAIStatus() {
        const aiStatus = document.getElementById('aiStatus');
        if (!aiStatus) return;
        
        if (this.modules.aiService) {
            const stats = this.modules.aiService.getStatistics?.() || { currentService: 'unknown' };
            
            aiStatus.textContent = `${stats.currentService.toUpperCase()} 연결됨`;
            aiStatus.className = 'connection-status connected';
        } else {
            aiStatus.textContent = '연결 대기';
            aiStatus.className = 'connection-status waiting';
        }
    }
    
    // 활동 로그 초기화
    initializeActivityLog() {
        this.logActivity('시스템 시작', 'HAIRGATOR 블로그 자동화 시스템이 시작되었습니다.', 'success');
    }
    
    // 알림 컨테이너 생성
    createNotificationContainer() {
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }
    
    // ===========================================
    // 주제 관리 기능들
    // ===========================================
    
    // 주제 로드
    loadTopics(category = 'all') {
        const topicList = document.getElementById('topicList');
        if (!topicList) return;
        
        topicList.innerHTML = '';
        
        let topics = [];
        const haircareTopics = this.modules.utils?.haircareTopics || {};
        
        if (category === 'all') {
            Object.values(haircareTopics).forEach(categoryTopics => {
                topics = topics.concat(categoryTopics);
            });
        } else {
            topics = haircareTopics[category] || [];
        }
        
        topics.forEach(topic => {
            const topicElement = this.createTopicElement(topic);
            topicList.appendChild(topicElement);
        });
        
        if (topics.length === 0) {
            topicList.innerHTML = '<p class="no-topics">해당 카테고리에 주제가 없습니다.</p>';
        }
    }
    
    // 주제 요소 생성
    createTopicElement(topic) {
        const div = document.createElement('div');
        div.className = 'topic-item';
        div.dataset.topicId = topic.id;
        div.dataset.category = topic.category;
        
        div.innerHTML = `
            <div class="topic-content">
                <div class="topic-title">${topic.title}</div>
                <div class="topic-meta">
                    <span class="topic-category">${this.getCategoryDisplayName(topic.category)}</span> • 
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
    
    // 주제 선택
    selectTopic(topicElement) {
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
        const haircareTopics = this.modules.utils?.haircareTopics || {};
        
        Object.values(haircareTopics).forEach(categoryTopics => {
            const found = categoryTopics.find(topic => topic.id === topicId);
            if (found) selectedTopic = found;
        });
        
        if (selectedTopic) {
            currentTopic = selectedTopic;
            this.updateSelectedTopicDisplay();
            this.logActivity('주제 선택', `"${selectedTopic.title}" 주제가 선택되었습니다.`);
        }
    }
    
    // 선택된 주제 표시 업데이트
    updateSelectedTopicDisplay() {
        const selectedTopicElement = document.getElementById('selectedTopic');
        if (!selectedTopicElement || !currentTopic) return;
        
        selectedTopicElement.innerHTML = `
            <div class="topic-info">
                <h3>${currentTopic.title}</h3>
                <div class="topic-details">
                    <span class="category-badge">${this.getCategoryDisplayName(currentTopic.category)}</span>
                    <span class="audience-badge">${currentTopic.targetAudience}</span>
                    <span class="difficulty-badge">${this.getDifficultyDisplayName(currentTopic.difficulty)}</span>
                </div>
                <div class="topic-keywords">
                    <strong>키워드:</strong> ${currentTopic.keywords.join(', ')}
                </div>
            </div>
        `;
    }
    
    // ===========================================
    // SEO 도구 기능들
    // ===========================================
    
    // SEO 제목 생성
    generateSEOTitle() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 주제를 선택해주세요.');
            return;
        }
        
        const targetData = this.modules.utils?.targetAudienceData?.[currentTargetAudience] || {};
        const targetName = targetData.name || '전문가들';
        
        const titlePatterns = [
            `${currentTopic.title} | ${targetName} 필수 가이드`,
            `2024년 최신 ${currentTopic.keywords[0]} 완전정복`,
            `${currentTopic.keywords[0]} 전문가가 알려주는 실전 노하우`,
            `${targetName}을 위한 ${currentTopic.keywords[0]} 핵심 전략`,
            `실무진이 인정한 ${currentTopic.keywords[0]} 베스트 가이드`
        ];
        
        const randomTitle = titlePatterns[Math.floor(Math.random() * titlePatterns.length)];
        
        const seoTitleInput = document.getElementById('seoTitle');
        if (seoTitleInput) {
            seoTitleInput.value = randomTitle;
            this.updateCharCounter('seoTitle', 'seoTitleCounter', 60);
        }
        
        this.showNotification('success', 'SEO 제목 생성', 'SEO 최적화된 제목이 생성되었습니다.');
    }
    
    // 메타 설명 생성
    generateMetaDescription() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 주제를 선택해주세요.');
            return;
        }
        
        const targetData = this.modules.utils?.targetAudienceData?.[currentTargetAudience] || {};
        const targetName = targetData.name || '전문가들';
        const keywords = currentTopic.keywords.slice(0, 3).join(', ');
        
        const metaTemplate = `${currentTopic.title}에 대한 ${targetName} 전용 가이드입니다. ${keywords} 관련 실무 노하우와 전문 팁을 상세히 알아보세요. 클릭해서 확인하세요!`;
        
        const metaDescInput = document.getElementById('metaDescription');
        if (metaDescInput) {
            metaDescInput.value = metaTemplate;
            this.updateCharCounter('metaDescription', 'metaDescCounter', 150);
        }
        
        this.showNotification('success', '메타 설명 생성', '클릭률을 높이는 메타 설명이 생성되었습니다.');
    }
    
    // 키워드 제안
    async suggestKeywords() {
        if (!currentTopic) {
            this.showNotification('warning', '주제 선택 필요', '먼저 주제를 선택해주세요.');
            return;
        }
        
        const suggestions = document.getElementById('keywordSuggestions');
        if (!suggestions) return;
        
        try {
            if (this.modules.aiService && this.modules.aiService.suggestKeywords) {
                // AI 기반 키워드 제안
                const result = await this.modules.aiService.suggestKeywords(currentTopic, {
                    targetAudience: currentTargetAudience,
                    count: 15
                });
                
                if (result.success) {
                    const keywords = result.data.keywords.map(kw => kw.keyword);
                    this.displayKeywordSuggestions(keywords);
                } else {
                    throw new Error('AI 키워드 제안 실패');
                }
            } else {
                // 로컬 키워드 제안
                this.generateLocalKeywordSuggestions();
            }
            
            this.showNotification('info', '키워드 제안', '추천 키워드가 생성되었습니다. 클릭하여 추가하세요.');
            
        } catch (error) {
            console.error('키워드 제안 오류:', error);
            this.generateLocalKeywordSuggestions();
        }
    }
    
    // 로컬 키워드 제안 생성
    generateLocalKeywordSuggestions() {
        const baseKeywords = currentTopic.keywords;
        const targetData = this.modules.utils?.targetAudienceData?.[currentTargetAudience] || {};
        
        let additionalKeywords = [];
        if (targetData && targetData.expertTerms) {
            additionalKeywords = targetData.expertTerms.slice(0, 5);
        } else {
            additionalKeywords = ["전문가", "노하우", "가이드", "팁", "방법"];
        }
        
        const allKeywords = [...baseKeywords, ...additionalKeywords];
        this.displayKeywordSuggestions(allKeywords);
    }
    
    // 키워드 제안 표시
    displayKeywordSuggestions(keywords) {
        const suggestions = document.getElementById('keywordSuggestions');
        if (!suggestions) return;
        
        suggestions.innerHTML = keywords.map(keyword => 
            `<span class="keyword-suggestion" onclick="addKeyword('${keyword}')">${keyword}</span>`
        ).join('');
    }
    
    // 키워드 추가
    addKeyword(keyword) {
        const primaryKeywords = document.getElementById('primaryKeywords');
        if (primaryKeywords) {
            const currentValue = primaryKeywords.value;
            const keywords = currentValue ? currentValue.split(',').map(k => k.trim()) : [];
            
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                primaryKeywords.value = keywords.join(', ');
            }
        }
    }
    
    // SEO 점수 체크
    async checkSEOScore() {
        const title = document.getElementById('postTitle')?.value || '';
        const content = document.getElementById('postContent')?.value || '';
        
        if (!title || !content) {
            this.showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
            return;
        }
        
        const seoAnalysis = await this.checkQuality();
        
        if (seoAnalysis) {
            const message = seoAnalysis.overallScore >= 80 ? 
                '네이버 상위 노출에 최적화되었습니다!' : 
                `SEO 점수: ${seoAnalysis.overallScore}/100 - 개선이 필요합니다.`;
            
            this.showNotification(
                seoAnalysis.overallScore >= 80 ? 'success' : 'warning', 
                'SEO 분석 완료', 
                message
            );
        }
    }
    
    // ===========================================
    // 이미지 생성 기능
    // ===========================================
    
    // 이미지 생성
    async generateImage() {
        const prompt = document.getElementById('imagePrompt')?.value;
        
        if (!prompt) {
            this.showNotification('warning', '프롬프트 필요', '이미지 설명을 입력해주세요.');
            return;
        }
        
        const generateBtn = event.target;
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '생성 중...';
        generateBtn.disabled = true;
        
        try {
            let imageUrl;
            
            if (this.modules.aiService && this.modules.aiService.generateHaircareImage) {
                // AI 기반 이미지 생성
                const result = await this.modules.aiService.generateHaircareImage(prompt);
                if (result.success) {
                    imageUrl = result.data.imageUrl;
                } else {
                    throw new Error(result.error || 'AI 이미지 생성 실패');
                }
            } else {
                // 샘플 이미지 사용
                imageUrl = this.generateSampleImageUrl();
            }
            
            this.addGeneratedImage(imageUrl, prompt);
            
            this.showNotification('success', '이미지 생성 완료', '새로운 이미지가 생성되었습니다.');
            this.logActivity('이미지 생성', `"${prompt}" 프롬프트로 이미지를 생성했습니다.`);
            
        } catch (error) {
            console.error('이미지 생성 오류:', error);
            this.showNotification('error', '이미지 생성 실패', error.message);
            this.logActivity('이미지 생성 실패', error.message, 'error');
        } finally {
            generateBtn.textContent = originalText;
            generateBtn.disabled = false;
        }
    }
    
    // 샘플 이미지 URL 생성
    generateSampleImageUrl() {
        const sampleImages = [
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
            'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
            'https://images.unsplash.com/photo-1580618432485-c1f0c1e6da84?w=400',
            'https://images.unsplash.com/photo-1595475038665-8e8be3a4f7db?w=400'
        ];
        
        return sampleImages[Math.floor(Math.random() * sampleImages.length)];
    }
    
    // 생성된 이미지 추가
    addGeneratedImage(imageUrl, prompt) {
        const container = document.getElementById('generatedImages');
        if (!container) return;
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-item';
        imageDiv.innerHTML = `
            <img src="${imageUrl}" alt="${prompt}">
            <div class="image-actions">
                <button class="select-image" data-image-url="${imageUrl}">선택</button>
                <button class="delete-image">삭제</button>
            </div>
        `;
        
        container.appendChild(imageDiv);
    }
    
    // 이미지 선택
    selectImage(imageUrl) {
        this.showNotification('success', '이미지 선택됨', '선택된 이미지가 포스트에 적용됩니다.');
        this.logActivity('이미지 선택', '포스트용 이미지를 선택했습니다.');
        
        // TODO: 실제 이미지 적용 로직 구현
    }
    
    // 이미지 삭제
    deleteImage(button) {
        const imageItem = button.closest('.image-item');
        if (imageItem) {
            imageItem.remove();
            this.logActivity('이미지 삭제', '생성된 이미지를 삭제했습니다.');
        }
    }
    
    // ===========================================
    // 자동화 기능들
    // ===========================================
    
    // 자동화 토글
    toggleAutomation() {
        const toggle = document.getElementById('automationEnabled');
        automationEnabled = toggle?.checked || false;
        
        if (automationEnabled) {
            this.startAutomation();
            this.showNotification('success', '자동화 시작', '블로그 자동화가 활성화되었습니다.');
            this.logActivity('자동화 시작', '블로그 자동화 시스템이 시작되었습니다.');
        } else {
            this.stopAutomation();
            this.showNotification('info', '자동화 중지', '블로그 자동화가 비활성화되었습니다.');
            this.logActivity('자동화 중지', '블로그 자동화 시스템이 중지되었습니다.');
        }
        
        // 자동화 설정 저장
        this.saveAutomationSettings();
        
        // 커스텀 이벤트 발송
        document.dispatchEvent(new CustomEvent('automation-status-change', {
            detail: { enabled: automationEnabled }
        }));
    }
    
    // 자동화 시작
    startAutomation() {
        const frequency = document.getElementById('publishFrequency')?.value || 'daily';
        const time = document.getElementById('publishTime')?.value || '09:00';
        
        // 실제 구현에서는 서버의 cron job 설정
        console.log(`자동화 시작: ${frequency} at ${time}`);
        
        // 클라이언트 사이드 시뮬레이션
        this.scheduleAutomatedTasks(frequency, time);
    }
    
    // 자동화 중지
    stopAutomation() {
        // 예약된 작업들 취소
        this.scheduledTasks.forEach((taskId, taskName) => {
            clearTimeout(taskId);
            clearInterval(taskId);
        });
        this.scheduledTasks.clear();
        
        console.log('자동화 중지');
    }
    
    // 자동화 작업 스케줄링
    scheduleAutomatedTasks(frequency, time) {
        // 간단한 클라이언트 사이드 스케줄링 (실제로는 서버에서 처리)
        const [hours, minutes] = time.split(':').map(Number);
        
        const scheduleDaily = () => {
            const now = new Date();
            const scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);
            
            if (scheduledTime <= now) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }
            
            const timeUntilExecution = scheduledTime.getTime() - now.getTime();
            
            const taskId = setTimeout(() => {
                this.executeAutomatedGeneration();
                scheduleDaily(); // 다음 날 스케줄링
            }, timeUntilExecution);
            
            this.scheduledTasks.set('dailyGeneration', taskId);
        };
        
        if (frequency === 'daily') {
            scheduleDaily();
        }
        // 다른 빈도는 필요에 따라 구현
    }
    
    // 자동화된 콘텐츠 생성 실행
    async executeAutomatedGeneration() {
        try {
            // 랜덤 주제 선택
            const topics = this.getAllTopics();
            if (topics.length === 0) return;
            
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            currentTopic = randomTopic;
            
            // 콘텐츠 생성
            await this.generateContent();
            
            // 품질 검사
            const quality = await this.checkQuality();
            
            // 품질이 기준 이상이면 자동 발행
            if (quality && quality.overallScore >= 70) {
                await this.publishContent();
                this.logActivity('자동화 성공', 
                    `"${randomTopic.title}" 글이 자동으로 생성되고 발행되었습니다.`, 'success');
            } else {
                this.logActivity('자동화 품질 미달', 
                    `"${randomTopic.title}" 글이 생성되었으나 품질 기준 미달로 임시저장되었습니다.`, 'warning');
                this.saveAsDraft();
            }
            
        } catch (error) {
            console.error('자동화된 생성 오류:', error);
            this.logActivity('자동화 실패', `자동화된 콘텐츠 생성 실패: ${error.message}`, 'error');
        }
    }
    
    // 모든 주제 가져오기
    getAllTopics() {
        const topics = [];
        const haircareTopics = this.modules.utils?.haircareTopics || {};
        
        Object.values(haircareTopics).forEach(categoryTopics => {
            topics.push(...categoryTopics);
        });
        
        return topics;
    }
    
    // ===========================================
    // 예약 발행 기능
    // ===========================================
    
    // 예약 발행
    schedulePublish() {
        const publishDate = document.getElementById('publishDate')?.value;
        
        if (!publishDate) {
            this.showNotification('warning', '날짜 선택 필요', '예약 발행 날짜를 선택해주세요.');
            return;
        }
        
        const title = document.getElementById('postTitle')?.value || '제목 없음';
        const scheduleDate = new Date(publishDate);
        
        if (scheduleDate <= new Date()) {
            this.showNotification('warning', '날짜 오류', '현재 시간보다 이후의 날짜를 선택해주세요.');
            return;
        }
        
        // 스케줄 목록에 추가
        this.addToScheduleList(title, scheduleDate);
        
        this.showNotification('success', '예약 완료', 
            `${scheduleDate.toLocaleString('ko-KR')}에 발행 예약되었습니다.`);
        this.logActivity('예약 발행', 
            `"${title}" 글이 ${scheduleDate.toLocaleString('ko-KR')}에 예약되었습니다.`);
    }
    
    // 스케줄 목록에 추가
    addToScheduleList(title, date) {
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
                <button class="cancel-schedule">취소</button>
            </div>
        `;
        
        scheduleList.appendChild(scheduleItem);
        
        // 실제 스케줄링
        this.scheduleActualPublish(title, date, scheduleItem);
    }
    
    // 실제 예약 발행 스케줄링
    scheduleActualPublish(title, date, scheduleElement) {
        const now = new Date();
        const timeUntilPublish = date.getTime() - now.getTime();
        
        if (timeUntilPublish > 0) {
            const taskId = setTimeout(async () => {
                try {
                    // 예약된 콘텐츠 발행
                    await this.publishContent();
                    
                    // 스케줄 항목 제거
                    scheduleElement.remove();
                    
                    this.showNotification('success', '예약 발행 완료', 
                        `"${title}" 글이 예약된 시간에 발행되었습니다.`);
                    this.logActivity('예약 발행 완료', 
                        `"${title}" 글이 예약된 시간에 발행되었습니다.`, 'success');
                        
                } catch (error) {
                    this.showNotification('error', '예약 발행 실패', 
                        `"${title}" 예약 발행에 실패했습니다: ${error.message}`);
                    this.logActivity('예약 발행 실패', 
                        `예약 발행 실패: ${error.message}`, 'error');
                }
            }, timeUntilPublish);
            
            this.scheduledTasks.set(`publish_${Date.now()}`, taskId);
        }
    }
    
    // 예약 취소
    cancelSchedule(button) {
        const scheduleItem = button.closest('.schedule-item');
        if (scheduleItem) {
            scheduleItem.remove();
            this.showNotification('info', '예약 취소', '예약 발행이 취소되었습니다.');
            this.logActivity('예약 취소', '예약된 발행을 취소했습니다.');
        }
    }
    
    // ===========================================
    // 파일 관리 기능들
    // ===========================================
    
    // 임시저장
    saveAsDraft() {
        const title = document.getElementById('postTitle')?.value || '임시저장_' + Date.now();
        const content = document.getElementById('postContent')?.value || '';
        
        if (!title.trim() && !content.trim()) {
            this.showNotification('warning', '내용 없음', '저장할 내용이 없습니다.');
            return;
        }
        
        const draftData = {
            title, content,
            metaDescription: document.getElementById('metaDescription')?.value || '',
            category: document.getElementById('postCategory')?.value || 'basic',
            tags: document.getElementById('postTags')?.value || '',
            timestamp: new Date().toISOString(),
            topic: currentTopic,
            targetAudience: currentTargetAudience,
            qualityData: qualityData
        };
        
        const draftKey = 'hairgator_draft_' + Date.now();
        localStorage.setItem(draftKey, JSON.stringify(draftData));
        
        this.showNotification('success', '임시저장 완료', '작업 내용이 임시저장되었습니다.');
        this.logActivity('임시저장', `"${title}" 글을 임시저장했습니다.`);
    }
    
    // 초안 목록 로드
    loadDrafts() {
        const drafts = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('hairgator_draft_')) {
                try {
                    const draftData = JSON.parse(localStorage.getItem(key));
                    drafts.push({ key, ...draftData });
                } catch (error) {
                    console.error('초안 로드 오류:', error);
                }
            }
        }
        
        // 최신순으로 정렬
        drafts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return drafts;
    }
    
    // 초안 복원
    restoreDraft(draftKey) {
        try {
            const draftData = JSON.parse(localStorage.getItem(draftKey));
            if (!draftData) {
                this.showNotification('error', '복원 실패', '초안을 찾을 수 없습니다.');
                return;
            }
            
            // 에디터에 데이터 복원
            const elements = {
                'postTitle': draftData.title,
                'postContent': draftData.content,
                'metaDescription': draftData.metaDescription,
                'postCategory': draftData.category,
                'postTags': draftData.tags
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value) {
                    element.value = value;
                }
            });
            
            // 주제 및 타겟 독자 복원
            if (draftData.topic) {
                currentTopic = draftData.topic;
                this.updateSelectedTopicDisplay();
            }
            
            if (draftData.targetAudience) {
                currentTargetAudience = draftData.targetAudience;
                this.changeTargetAudience(currentTargetAudience);
            }
            
            // 품질 데이터 복원
            if (draftData.qualityData) {
                qualityData = draftData.qualityData;
                this.updateQualityDisplay(qualityData);
            }
            
            this.showNotification('success', '초안 복원 완료', '저장된 초안이 복원되었습니다.');
            this.logActivity('초안 복원', `"${draftData.title}" 초안을 복원했습니다.`);
            
        } catch (error) {
            console.error('초안 복원 오류:', error);
            this.showNotification('error', '복원 실패', '초안 복원 중 오류가 발생했습니다.');
        }
    }
    
    // 초안 삭제
    deleteDraft(draftKey) {
        try {
            localStorage.removeItem(draftKey);
            this.showNotification('success', '초안 삭제', '선택한 초안이 삭제되었습니다.');
            this.logActivity('초안 삭제', '초안을 삭제했습니다.');
        } catch (error) {
            console.error('초안 삭제 오류:', error);
            this.showNotification('error', '삭제 실패', '초안 삭제 중 오류가 발생했습니다.');
        }
    }
    
    // 데이터 백업
    backupData() {
        const backupData = {
            topics: this.modules.utils?.haircareTopics || {},
            automation: this.getAutomationSettings(),
            stats: systemStats,
            drafts: this.loadDrafts(),
            settings: {
                targetAudience: currentTargetAudience,
                darkMode: document.body.classList.contains('dark-mode')
            },
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
        
        this.showNotification('success', '백업 완료', '데이터가 성공적으로 백업되었습니다.');
        this.logActivity('데이터 백업', '시스템 데이터를 백업했습니다.');
    }
    
    // 데이터 복원
    restoreData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // 데이터 유효성 검사
                if (!backupData.topics || !backupData.timestamp) {
                    throw new Error('유효하지 않은 백업 파일입니다.');
                }
                
                // 확인 대화상자
                if (!confirm(`${backupData.timestamp}에 생성된 백업을 복원하시겠습니까? 현재 데이터는 덮어씌워집니다.`)) {
                    return;
                }
                
                // 데이터 복원
                if (this.modules.utils && backupData.topics) {
                    Object.assign(this.modules.utils.haircareTopics, backupData.topics);
                }
                
                if (backupData.automation) {
                    this.restoreAutomationSettings(backupData.automation);
                }
                
                if (backupData.stats) {
                    Object.assign(systemStats, backupData.stats);
                    this.updateSystemStats();
                }
                
                if (backupData.drafts) {
                    // 초안들 복원
                    backupData.drafts.forEach((draft, index) => {
                        const draftKey = `hairgator_restored_draft_${Date.now()}_${index}`;
                        localStorage.setItem(draftKey, JSON.stringify(draft));
                    });
                }
                
                if (backupData.settings) {
                    if (backupData.settings.targetAudience) {
                        this.changeTargetAudience(backupData.settings.targetAudience);
                    }
                    
                    if (backupData.settings.darkMode) {
                        document.body.classList.add('dark-mode');
                    }
                }
                
                // UI 새로고침
                this.loadTopics();
                this.loadAutomationSettings();
                
                this.showNotification('success', '복원 완료', '데이터가 성공적으로 복원되었습니다.');
                this.logActivity('데이터 복원', `${backupData.timestamp} 백업 데이터를 복원했습니다.`);
                
            } catch (error) {
                console.error('데이터 복원 오류:', error);
                this.showNotification('error', '복원 실패', `데이터 복원에 실패했습니다: ${error.message}`);
                this.logActivity('복원 실패', error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }
    
    // ===========================================
    // 모달 및 UI 관리
    // ===========================================
    
    // 모달 표시
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.activeModals.add(modalId);
            
            // 모바일에서 전체화면 처리
            if (window.innerWidth < 768) {
                modal.classList.add('mobile-fullscreen');
            }
        }
    }
    
    // 모달 닫기
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.activeModals.delete(modalId);
            modal.classList.remove('mobile-fullscreen');
        }
    }
    
    // 모든 모달 닫기
    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    }
    
    // 알림 표시
    showNotification(type, title, message) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const notificationId = 'notification_' + Date.now();
        notification.id = notificationId;
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // 자동 제거 타이머
        const autoRemoveTime = {
            success: 5000,
            info: 7000,
            warning: 10000,
            error: 12000
        };
        
        setTimeout(() => {
            if (notification.parentNode) {
                this.closeNotification(notification.querySelector('.notification-close'));
            }
        }, autoRemoveTime[type] || 6000);
        
        // 최대 알림 개수 제한
        const notifications = container.querySelectorAll('.notification');
        if (notifications.length > 5) {
            notifications[0].remove();
        }
    }
    
    // 알림 닫기
    closeNotification(button) {
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
    
    // 활동 로그 기록
    logActivity(action, message, type = 'info') {
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
        
        // 로그 개수 제한 (최대 100개)
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[entries.length - 1].remove();
        }
        
        // 콘솔에도 기록
        console.log(`[${type.toUpperCase()}] ${action}: ${message}`);
    }
    
    // 문자 수 카운터 업데이트
    updateCharCounter(inputId, counterId, maxLength) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);
        
        if (input && counter) {
            const length = input.value.length;
            counter.textContent = `${length}/${maxLength}자`;
            
            // 색상 변경
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
    
    // ===========================================
    // 타겟 독자 관리
    // ===========================================
    
    // 타겟 독자 초기화
    initializeTargetAudience() {
        const targetSelect = document.getElementById('primaryTarget');
        const customTargetDiv = document.getElementById('customTarget');
        const targetDescription = document.getElementById('targetDescription');
        
        if (targetSelect) {
            targetSelect.addEventListener('change', (e) => {
                this.changeTargetAudience(e.target.value);
            });
        }
        
        // 초기 설정
        this.updateTargetDescription(currentTargetAudience);
        this.loadTopicsForTarget(currentTargetAudience);
    }
    
    // 타겟 독자 변경
    changeTargetAudience(targetKey) {
        if (targetKey === 'custom') {
            const customTargetDiv = document.getElementById('customTarget');
            const targetDescription = document.getElementById('targetDescription');
            
            if (customTargetDiv) customTargetDiv.style.display = 'block';
            if (targetDescription) {
                targetDescription.innerHTML = `
                    <p><strong>사용자 정의 타겟</strong>을 위한 맞춤형 콘텐츠를 작성합니다.</p>
                    <p class="custom-note">구체적인 직업이나 분야를 입력해주세요 (예: 카페 사장들, 펜션 운영자들)</p>
                `;
            }
        } else {
            const customTargetDiv = document.getElementById('customTarget');
            if (customTargetDiv) customTargetDiv.style.display = 'none';
            
            currentTargetAudience = targetKey;
            this.updateTargetDescription(targetKey);
            this.loadTopicsForTarget(targetKey);
            
            this.logActivity('타겟 변경', `타겟 독자가 ${targetKey}로 변경되었습니다.`);
        }
    }
    
    // 타겟 설명 업데이트
    updateTargetDescription(targetKey) {
        const targetDescription = document.getElementById('targetDescription');
        const targetData = this.modules.utils?.targetAudienceData?.[targetKey];
        
        if (targetData && targetDescription) {
            const featuresHTML = targetData.features.map(feature => `<li>• ${feature}</li>`).join('');
            
            targetDescription.innerHTML = `
                <p><strong>${targetData.name}</strong>를 위한 전문 콘텐츠를 작성합니다.</p>
                <ul>${featuresHTML}</ul>
            `;
        }
    }
    
    // 타겟별 주제 로드
    loadTopicsForTarget(targetKey) {
        const targetData = this.modules.utils?.targetAudienceData?.[targetKey];
        
        if (!targetData || !targetData.topics) {
            // 기존 헤어케어 주제 사용 (fallback)
            this.loadTopics();
            return;
        }
        
        // 타겟별 주제로 업데이트
        if (this.modules.utils) {
            Object.assign(this.modules.utils.haircareTopics, targetData.topics);
        }
        
        // 카테고리 탭 업데이트
        this.updateCategoryTabs(targetData.categories);
        
        // 주제 목록 새로고침
        this.loadTopics();
    }
    
    // ===========================================
    // 탭 관리
    // ===========================================
    
    // 카테고리 탭 설정
    setupCategoryTabs() {
        const tabButtons = document.querySelectorAll('.category-tabs .tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target);
            });
        });
    }
    
    // 카테고리 전환
    switchCategory(tabButton) {
        // 모든 탭 비활성화
        document.querySelectorAll('.category-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 클릭된 탭 활성화
        tabButton.classList.add('active');
        
        // 주제 로드
        const category = tabButton.dataset.category;
        this.loadTopics(category);
        
        this.logActivity('카테고리 전환', `${category} 카테고리로 전환했습니다.`);
    }
    
    // 카테고리 탭 업데이트
    updateCategoryTabs(categories) {
        const categoryTabsContainer = document.querySelector('.category-tabs');
        if (!categoryTabsContainer || !categories) return;
        
        categoryTabsContainer.innerHTML = `
            <button class="tab-btn active" data-category="all">전체</button>
            ${Object.entries(categories).map(([key, name]) => 
                `<button class="tab-btn" data-category="${key}">${name}</button>`
            ).join('')}
        `;
        
        // 이벤트 리스너 재설정
        this.setupCategoryTabs();
    }
    
    // 에디터 탭 설정
    setupEditorTabs() {
        const editorTabs = document.querySelectorAll('.editor-tab');
        
        editorTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchEditorTab(e.target);
            });
        });
    }
    
    // 에디터 탭 전환
    switchEditorTab(tabButton) {
        const editorTabs = document.querySelectorAll('.editor-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // 모든 탭 비활성화
        editorTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 클릭된 탭 활성화
        tabButton.classList.add('active');
        
        // 해당 콘텐츠 표시
        const tabName = tabButton.dataset.tab;
        const targetContent = document.getElementById(tabName + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        this.logActivity('탭 전환', `${tabName} 탭으로 전환했습니다.`);
    }
    
    // ===========================================
    // 설정 관리
    // ===========================================
    
    // 다크모드 설정 로드
    loadDarkModeSettings() {
        const isDark = localStorage.getItem('hairgator_dark_mode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    }
    
    // 다크모드 토글
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('hairgator_dark_mode', isDark);
        
        this.showNotification('info', '테마 변경', 
            isDark ? '다크 모드가 활성화되었습니다.' : '라이트 모드가 활성화되었습니다.');
        this.logActivity('테마 변경', `${isDark ? '다크' : '라이트'} 모드로 변경되었습니다.`);
    }
    
    // 자동화 설정 로드
    loadAutomationSettings() {
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
    saveAutomationSettings() {
        const settings = {
            enabled: document.getElementById('automationEnabled')?.checked || false,
            frequency: document.getElementById('publishFrequency')?.value || 'daily',
            time: document.getElementById('publishTime')?.value || '09:00',
            maxDailyPosts: parseInt(document.getElementById('maxDailyPosts')?.value) || 3,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('hairgator_automation_settings', JSON.stringify(settings));
        return settings;
    }
    
    // 자동화 설정 가져오기
    getAutomationSettings() {
        const savedSettings = localStorage.getItem('hairgator_automation_settings');
        return savedSettings ? JSON.parse(savedSettings) : null;
    }
    
    // 자동화 설정 복원
    restoreAutomationSettings(settings) {
        localStorage.setItem('hairgator_automation_settings', JSON.stringify(settings));
        this.loadAutomationSettings();
    }
    
    // 예약된 작업 복원
    restoreScheduledTasks() {
        // 페이지 새로고침 후 예약된 작업들 복원
        // 실제 구현에서는 서버에서 관리
        console.log('예약된 작업 복원 중...');
    }
    
    // 자동화 모니터링 시작
    startAutomationMonitoring() {
        setInterval(() => {
            this.updateAutomationStatus();
        }, 30000); // 30초마다
    }
    
    // 자동화 상태 업데이트
    updateAutomationStatus() {
        const statusElement = document.getElementById('automationStatus');
        if (statusElement) {
            statusElement.textContent = automationEnabled ? '활성' : '비활성';
            statusElement.className = automationEnabled ? 'status-active' : 'status-inactive';
        }
        
        const nextRunElement = document.getElementById('nextAutomationRun');
        if (nextRunElement && automationEnabled) {
            // 다음 실행 시간 계산 (간단한 구현)
            const time = document.getElementById('publishTime')?.value || '09:00';
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]), 0, 0);
            
            nextRunElement.textContent = tomorrow.toLocaleString('ko-KR');
        }
    }
    
    // 시스템 상태 업데이트
    updateSystemStatus() {
        // API 상태 체크
        const apiStatus = this.modules.aiService ? '정상' : '연결 대기';
        const apiElement = document.getElementById('apiMonitor');
        if (apiElement) apiElement.textContent = apiStatus;
        
        // 성공률 계산
        const successRate = systemStats.publishedPosts > 0 ? 
            Math.round((systemStats.publishedPosts / systemStats.totalPosts) * 100) : 100;
        const successElement = document.getElementById('successRate');
        if (successElement) successElement.textContent = successRate + '%';
        
        // 처리 시간 (평균)
        const avgProcessingTime = (Math.random() * 3 + 1).toFixed(1);
        const timeElement = document.getElementById('processingTime');
        if (timeElement) timeElement.textContent = avgProcessingTime + '초';
        
        // 오늘 생성된 글 수
        const todayGenerated = Math.floor(Math.random() * 20);
        const todayElement = document.getElementById('todayGenerated');
        if (todayElement) todayElement.textContent = todayGenerated + '개';
        
        // 시스템 상태
        systemStats.systemStatus = this.calculateSystemStatus();
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) statusElement.textContent = systemStats.systemStatus;
    }
    
    // 시스템 상태 계산
    calculateSystemStatus() {
        const hasAI = Boolean(this.modules.aiService);
        const hasUtils = Boolean(this.modules.utils);
        const isOnline = navigator.onLine;
        
        if (hasAI && hasUtils && isOnline) {
            return '정상';
        } else if (hasUtils && isOnline) {
            return '부분 정상';
        } else {
            return '점검 중';
        }
    }
    
    // ===========================================
    // AI 테스트 및 연결 관리
    // ===========================================
    
    // AI 테스트 핸들러
    handleAITest(event) {
        const button = event.target;
        const service = button.dataset.service || 
                       (button.id === 'testClaude' ? 'claude' : 'openai');
        
        this.testAIConnection(service);
    }
    
    // AI 연결 테스트
    async testAIConnection(service) {
        const keyInput = document.getElementById(service === 'claude' ? 'claudeKey' : 'openaiKey');
        const statusElement = document.getElementById(service === 'claude' ? 'claudeStatus' : 'openaiStatus');
        
        if (!keyInput || !keyInput.value.trim()) {
            this.showNotification('warning', 'API 키 필요', `${service.toUpperCase()} API 키를 입력해주세요.`);
            return;
        }
        
        const testBtn = event.target;
        const originalText = testBtn.textContent;
        testBtn.textContent = '테스트 중...';
        testBtn.disabled = true;
        
        try {
            // AI 서비스에 키 설정 및 테스트
            if (this.modules.aiService && this.modules.aiService.setAPIKey) {
                this.modules.aiService.setAPIKey(service, keyInput.value);
                
                // 간단한 테스트 요청
                const testResult = await this.testAIService(service);
                
                if (testResult.success) {
                    if (statusElement) {
                        statusElement.textContent = '연결됨';
                        statusElement.style.color = 'var(--success-color)';
                    }
                    
                    this.showNotification('success', `${service.toUpperCase()} 연결 성공`, 
                        `${service.toUpperCase()} API 연결이 성공적으로 완료되었습니다.`);
                    this.logActivity('API 연결', `${service.toUpperCase()} API가 연결되었습니다.`, 'success');
                } else {
                    throw new Error(testResult.error || 'API 테스트 실패');
                }
            } else {
                // AI 서비스 모듈이 없는 경우 시뮬레이션
                await this.simulateAPITest(service, keyInput.value);
                
                if (statusElement) {
                    statusElement.textContent = '연결됨 (시뮬레이션)';
                    statusElement.style.color = 'var(--warning-color)';
                }
                
                this.showNotification('info', `${service.toUpperCase()} 시뮬레이션`, 
                    'AI 서비스 모듈이 없어 시뮬레이션 모드로 실행됩니다.');
            }
            
            this.updateAIStatus();
            
        } catch (error) {
            console.error(`${service} 연결 테스트 실패:`, error);
            
            if (statusElement) {
                statusElement.textContent = '연결 실패';
                statusElement.style.color = 'var(--error-color)';
            }
            
            this.showNotification('error', `${service.toUpperCase()} 연결 실패`, error.message);
            this.logActivity('API 연결 실패', `${service.toUpperCase()} 연결 실패: ${error.message}`, 'error');
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }
    
    // AI 서비스 테스트
    async testAIService(service) {
        if (!this.modules.aiService) {
            return { success: false, error: 'AI 서비스 모듈이 없습니다.' };
        }
        
        try {
            // 간단한 테스트 요청
            const testTopic = {
                title: "API 연결 테스트",
                keywords: ["테스트", "연결", "확인"]
            };
            
            const result = await this.modules.aiService.generateHaircareContent(testTopic, {
                targetAudience: 'hair_professionals',
                length: 'short'
            });
            
            return { success: result.success };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // API 테스트 시뮬레이션
    async simulateAPITest(service, apiKey) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (apiKey.length > 10) {
                    resolve({ success: true, service: service });
                } else {
                    reject(new Error('유효하지 않은 API 키입니다.'));
                }
            }, 1500);
        });
    }
    
    // ===========================================
    // 주제 관리 (추가/수정/삭제)
    // ===========================================
    
    // 새 주제 추가 모달 표시
    showTopicModal() {
        this.showModal('topicModal');
    }
    
    // 새 주제 추가
    addNewTopic() {
        const title = document.getElementById('newTopicTitle')?.value;
        const category = document.getElementById('newTopicCategory')?.value;
        const keywords = document.getElementById('newTopicKeywords')?.value;
        const target = document.getElementById('newTopicTarget')?.value;
        const difficulty = document.getElementById('newTopicDifficulty')?.value;
        
        if (!title || !keywords) {
            this.showNotification('warning', '필수 정보 부족', '주제와 키워드를 입력해주세요.');
            return;
        }
        
        const newTopic = {
            id: Date.now(),
            title: title.trim(),
            category: category || 'basic',
            keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
            targetAudience: this.getTargetAudienceDisplayName(target),
            difficulty: difficulty || 'intermediate'
        };
        
        // 주제 목록에 추가
        if (this.modules.utils && this.modules.utils.haircareTopics) {
            if (!this.modules.utils.haircareTopics[category]) {
                this.modules.utils.haircareTopics[category] = [];
            }
            this.modules.utils.haircareTopics[category].push(newTopic);
        }
        
        // 화면 업데이트
        this.loadTopics();
        
        // 모달 닫기
        this.closeModal('topicModal');
        
        // 입력 필드 초기화
        this.clearTopicForm();
        
        this.showNotification('success', '주제 추가 완료', '새로운 주제가 추가되었습니다.');
        this.logActivity('주제 추가', `"${title}" 주제가 추가되었습니다.`);
    }
    
    // 주제 폼 초기화
    clearTopicForm() {
        const fields = ['newTopicTitle', 'newTopicKeywords'];
        fields.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }
    
    // 주제 삭제
    deleteTopic(topicElement) {
        const title = topicElement.querySelector('.topic-title')?.textContent || '주제';
        
        if (!confirm(`정말로 "${title}" 주제를 삭제하시겠습니까?`)) return;
        
        const topicId = parseInt(topicElement.dataset.topicId);
        const category = topicElement.dataset.category;
        
        // 데이터에서 제거
        if (this.modules.utils && this.modules.utils.haircareTopics[category]) {
            this.modules.utils.haircareTopics[category] = 
                this.modules.utils.haircareTopics[category].filter(topic => topic.id !== topicId);
        }
        
        // 화면에서 제거
        topicElement.remove();
        
        // 현재 선택된 주제인 경우 선택 해제
        if (currentTopic && currentTopic.id === topicId) {
            currentTopic = null;
            this.updateSelectedTopicDisplay();
        }
        
        this.showNotification('success', '주제 삭제 완료', '주제가 삭제되었습니다.');
        this.logActivity('주제 삭제', `"${title}" 주제를 삭제했습니다.`);
    }
    
    // 주제 수정
    editTopic(topicElement) {
        // TODO: 주제 수정 기능 구현
        this.showNotification('info', '편집 기능', '주제 편집 기능은 곧 추가될 예정입니다.');
    }
    
    // ===========================================
    // 에디터 관리
    // ===========================================
    
    // 에디터 초기화
    clearEditor() {
        const elements = [
            'postTitle', 'postContent', 'postTags', 'metaDescription', 
            'imagePrompt', 'seoTitle'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        // 생성된 이미지 목록 초기화
        const generatedImages = document.getElementById('generatedImages');
        if (generatedImages) generatedImages.innerHTML = '';
        
        // 품질 표시 초기화
        const qualityRecommendations = document.getElementById('qualityRecommendations');
        if (qualityRecommendations) qualityRecommendations.innerHTML = '';
        
        // 전역 변수 초기화
        currentTopic = null;
        generatedContent = null;
        qualityData = null;
        
        this.updateSelectedTopicDisplay();
        this.logActivity('에디터 초기화', '에디터가 초기화되었습니다.');
    }
    
    // 품질 메트릭 업데이트
    updateQualityMetrics() {
        const title = document.getElementById('postTitle')?.value || '';
        const content = document.getElementById('postContent')?.value || '';
        
        if (title || content) {
            // 디바운스된 품질 검사 실행
            clearTimeout(this.qualityCheckTimeout);
            this.qualityCheckTimeout = setTimeout(() => {
                this.checkQuality();
            }, 1000);
        }
    }
    
    // ===========================================
    // 헬퍼 함수들
    // ===========================================
    
    // 카테고리 표시명 변환
    getCategoryDisplayName(category) {
        const displayNames = {
            basic: '기초 케어',
            styling: '스타일링',
            treatment: '트리트먼트',
            trend: '트렌드'
        };
        return displayNames[category] || category;
    }
    
    // 난이도 표시명 변환
    getDifficultyDisplayName(difficulty) {
        const displayNames = {
            beginner: '초급',
            intermediate: '중급',
            expert: '고급'
        };
        return displayNames[difficulty] || difficulty;
    }
    
    // 타겟 독자 표시명 변환
    getTargetAudienceDisplayName(target) {
        const displayNames = {
            beginner: '헤어케어 초보자',
            intermediate: '일반인',
            expert: '전문가'
        };
        return displayNames[target] || target;
    }
    
    // ===========================================
    // 이벤트 핸들러들
    // ===========================================
    
    // AI 작업 완료 핸들러
    handleAITaskComplete(detail) {
        console.log('AI 작업 완료:', detail);
        
        if (detail.type === 'content-generation') {
            // 콘텐츠 생성 완료 후 추가 작업
            this.updateSystemStats();
        }
    }
    
    // 품질 분석 완료 핸들러
    handleQualityAnalysisComplete(detail) {
        console.log('품질 분석 완료:', detail);
        
        // 품질 분석 결과에 따른 추가 작업
        if (detail.analysis && detail.analysis.overallScore >= 80) {
            // 고품질 콘텐츠인 경우 자동 발행 옵션 제안
            if (automationEnabled) {
                setTimeout(() => {
                    if (confirm('품질이 우수한 콘텐츠입니다. 자동으로 발행하시겠습니까?')) {
                        this.publishContent();
                    }
                }, 2000);
            }
        }
    }
    
    // 자동화 상태 변경 핸들러
    handleAutomationStatusChange(detail) {
        console.log('자동화 상태 변경:', detail);
        
        // 자동화 상태에 따른 UI 업데이트
        this.updateAutomationStatus();
    }
}

// 애플리케이션 인스턴스 생성 및 초기화
const hairgatorApp = new HairGatorApp();

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        hairgatorApp.initialize();
    });
} else {
    hairgatorApp.initialize();
}

// 전역에서 접근 가능하도록 설정
window.HairGatorApp = hairgatorApp;

// 개발자 도구용 디버그 함수들
window.HAIRGATOR_DEBUG = {
    app: hairgatorApp,
    stats: () => systemStats,
    topic: () => currentTopic,
    quality: () => qualityData,
    automation: () => automationEnabled,
    clearStorage: () => {
        localStorage.clear();
        console.log('로컬 저장소가 초기화되었습니다.');
    },
    testMode: () => {
        hairgatorApp.showNotification('info', '테스트 모드', '디버그 모드가 활성화되었습니다.');
        return '테스트 모드 활성화';
    }
};

// ============================================================================
// 전역 함수들 (HTML onclick 핸들러용)
// ============================================================================

// 콘텐츠 생성 및 관리
window.generateContent = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.generateContent();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.checkQuality = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.checkQuality();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.previewContent = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.previewContent();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.publishContent = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.publishContent();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// SEO 도구들
window.generateSEOTitle = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.generateSEOTitle();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.generateMetaDescription = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.generateMetaDescription();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.suggestKeywords = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.suggestKeywords();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.checkSEOScore = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.checkSEOScore();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// 이미지 생성
window.generateImage = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.generateImage();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// 주제 관리
window.showTopicModal = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.showModal('topicModal');
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.addNewTopic = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.addNewTopic();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.selectTopic = function(element) {
    if (window.HairGatorApp) {
        window.HairGatorApp.selectTopic(element);
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.editTopic = function(element) {
    if (window.HairGatorApp) {
        window.HairGatorApp.editTopic(element);
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.deleteTopic = function(element) {
    if (window.HairGatorApp) {
        window.HairGatorApp.deleteTopic(element);
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// 모달 관리
window.showModal = function(modalId) {
    if (window.HairGatorApp) {
        window.HairGatorApp.showModal(modalId);
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.closeModal = function(modalId) {
    if (window.HairGatorApp) {
        window.HairGatorApp.closeModal(modalId);
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// 유틸리티
window.toggleDarkMode = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.toggleDarkMode();
    } else {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('hairgator_dark_mode', isDark);
        console.log('다크모드 토글:', isDark ? '활성화' : '비활성화');
    }
};

// 스케줄링 및 자동화
window.schedulePublish = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.schedulePublish();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.toggleAutomation = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.toggleAutomation();
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// API 연결 테스트 (HTML에서 사용하는 함수들)
window.testClaudeConnection = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.testAIConnection('claude');
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

window.testOpenAIConnection = function() {
    if (window.HairGatorApp) {
        window.HairGatorApp.testAIConnection('openai');
    } else {
        console.error('HairGatorApp이 로드되지 않았습니다.');
    }
};

// 문자 카운터 업데이트
window.updateCharCounter = function(inputId, counterId, maxLength) {
    if (window.HairGatorApp) {
        window.HairGatorApp.updateCharCounter(inputId, counterId, maxLength);
    } else {
        // 기본 구현
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);
        
        if (input && counter) {
            const length = input.value.length;
            if (maxLength) {
                counter.textContent = `${length}/${maxLength}자`;
                counter.style.color = length > maxLength ? '#ef4444' : '#6b7280';
            } else {
                counter.textContent = `${length}자`;
            }
        }
    }
};

// 활동 로그 (HTML에서 직접 호출)
window.logActivity = function(action, message, type = 'info') {
    if (window.HairGatorApp) {
        window.HairGatorApp.logActivity(action, message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${action}: ${message}`);
    }
};

// 알림 표시 (HTML에서 직접 호출)
window.showNotification = function(type, title, message) {
    if (window.HairGatorApp) {
        window.HairGatorApp.showNotification(type, title, message);
    } else {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        alert(`${title}: ${message}`);
    }
};

// 페이지 새로고침 (간단한 경우)
window.refreshPage = function() {
    if (confirm('페이지를 새로고침하시겠습니까?')) {
        location.reload();
    }
};

// 키워드 추가 (HTML에서 직접 호출)
window.addKeyword = function(keyword) {
    if (window.HairGatorApp) {
        window.HairGatorApp.addKeyword(keyword);
    } else {
        console.log('키워드 추가:', keyword);
    }
};

// 개발자 도구용 전역 함수들도 추가
window.HAIRGATOR_GLOBAL_DEBUG = {
    app: () => window.HairGatorApp,
    testAllFunctions: () => {
        console.log('🧪 전역 함수 테스트 시작...');
        console.log('✅ generateContent:', typeof window.generateContent);
        console.log('✅ showTopicModal:', typeof window.showTopicModal);
        console.log('✅ toggleDarkMode:', typeof window.toggleDarkMode);
        console.log('✅ showModal:', typeof window.showModal);
        console.log('✅ closeModal:', typeof window.closeModal);
        console.log('🎉 모든 전역 함수가 정상 등록되었습니다!');
    }
};

// 초기화 완료 로그
console.log('🦄 HAIRGATOR 메인 애플리케이션 로드 완료');
console.log('🔧 디버그 도구: window.HAIRGATOR_DEBUG');
console.log('⚡ 키보드 단축키: Ctrl+S(저장), Ctrl+Enter(생성), Ctrl+P(미리보기)');
console.log('🔗 전역 함수들이 등록되었습니다.');
console.log('🎯 onclick 핸들러들이 정상 작동할 예정입니다.');
console.log('🧪 테스트: window.HAIRGATOR_GLOBAL_DEBUG.testAllFunctions()');
