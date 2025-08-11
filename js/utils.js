// js/utils.js - 유틸리티 함수들

// ===== DOM 조작 유틸리티 =====
const DOM = {
    // 요소 선택
    get: (id) => document.getElementById(id),
    getAll: (selector) => document.querySelectorAll(selector),
    
    // 클래스 조작
    addClass: (element, className) => element?.classList.add(className),
    removeClass: (element, className) => element?.classList.remove(className),
    toggleClass: (element, className) => element?.classList.toggle(className),
    
    // 스타일 조작
    show: (element) => element && (element.style.display = 'block'),
    hide: (element) => element && (element.style.display = 'none'),
    toggle: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },
    
    // 값 설정/가져오기
    setValue: (id, value) => {
        const element = DOM.get(id);
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    },
    
    getValue: (id) => {
        const element = DOM.get(id);
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                return element.checked;
            } else {
                return element.value;
            }
        }
        return null;
    }
};

// ===== 탭 관리 시스템 =====
const TabManager = {
    initialize() {
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    },

    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // 선택된 탭 활성화
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        const targetContent = document.getElementById(`${tabName}Tab`);
        
        if (targetTab && targetContent) {
            targetTab.classList.add('active');
            targetContent.classList.add('active');
        }
    }
};

// ===== 알림 시스템 =====
const NotificationManager = {
    container: null,

    initialize() {
        this.container = DOM.get('notificationContainer');
        if (!this.container) {
            this.createContainer();
        }
    },

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    },

    show(type, title, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="notification-body">${message}</div>
        `;
        
        this.container.appendChild(notification);
        
        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
        
        return notification;
    }
};

// ===== 모달 관리 =====
const ModalManager = {
    show(modalId) {
        const modal = DOM.get(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    hide(modalId) {
        const modal = DOM.get(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    initialize() {
        // 모달 외부 클릭시 닫기
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.hide(event.target.id);
            }
        });

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="block"]');
                openModals.forEach(modal => {
                    this.hide(modal.id);
                });
            }
        });
    }
};

// ===== 진행상태 표시 =====
const ProgressManager = {
    show(message = 'AI가 작업 중입니다...') {
        const progress = DOM.get('generationProgress');
        if (progress) {
            progress.classList.remove('hidden');
            const loader = progress.querySelector('.btn-loader');
            const text = progress.querySelector('#progressText');
            
            if (loader) loader.style.display = 'inline-block';
            if (text) text.textContent = message;
        }
    },

    hide() {
        const progress = DOM.get('generationProgress');
        if (progress) {
            progress.classList.add('hidden');
            const loader = progress.querySelector('.btn-loader');
            if (loader) loader.style.display = 'none';
        }
    },

    updateText(message) {
        const text = DOM.get('progressText');
        if (text) {
            text.textContent = message;
        }
    }
};

// ===== 품질 분석 유틸리티 =====
const QualityAnalyzer = {
    analyze(content, title = '', keywords = []) {
        const analysis = {
            wordCount: this.getWordCount(content),
            readability: this.calculateReadability(content),
            structure: this.analyzeStructure(content),
            keywordDensity: this.calculateKeywordDensity(content, keywords),
            seoScore: this.calculateSEOScore(content, title, keywords)
        };

        analysis.overallScore = this.calculateOverallScore(analysis);
        analysis.recommendations = this.generateRecommendations(analysis);
        
        return analysis;
    },

    getWordCount(content) {
        return content.length;
    },

    calculateReadability(content) {
        const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        
        if (sentences.length === 0) return 0;
        
        const avgWordsPerSentence = words.length / sentences.length;
        
        let score = 100;
        if (avgWordsPerSentence > 25) score -= (avgWordsPerSentence - 25) * 2;
        if (avgWordsPerSentence < 8) score -= (8 - avgWordsPerSentence) * 3;
        
        return Math.max(0, Math.min(100, score));
    },

    analyzeStructure(content) {
        const h2Count = (content.match(/^## /gm) || []).length;
        const h3Count = (content.match(/^### /gm) || []).length;
        const listCount = (content.match(/^[-*+]\s/gm) || []).length;
        const boldCount = (content.match(/\*\*[^*]+\*\*/g) || []).length;
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        
        let score = 0;
        if (h2Count + h3Count >= 3) score += 40;
        if (listCount >= 3) score += 25;
        if (boldCount >= 3) score += 20;
        if (paragraphs >= 4) score += 15;
        
        return Math.min(100, score);
    },

    calculateKeywordDensity(content, keywords) {
        if (!keywords.length) return 0;
        
        const totalChars = content.length;
        let keywordCount = 0;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            keywordCount += (content.match(regex) || []).length;
        });
        
        return (keywordCount / totalChars) * 100;
    },

    calculateSEOScore(content, title, keywords) {
        let score = 0;
        
        // 제목에 키워드 포함
        if (keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 25;
        }
        
        // 키워드 밀도
        const density = this.calculateKeywordDensity(content, keywords);
        if (density >= 1.5 && density <= 4.0) score += 30;
        else if (density >= 1.0 && density <= 5.0) score += 20;
        
        // 구조적 요소
        if (/^##\s/gm.test(content)) score += 20;
        if (/^[-*+]\s/gm.test(content)) score += 15;
        if (/\*\*[^*]+\*\*/g.test(content)) score += 10;
        
        return Math.min(100, score);
    },

    calculateOverallScore(analysis) {
        const weights = {
            wordCount: 0.20,
            readability: 0.25,
            structure: 0.25,
            seoScore: 0.30
        };

        // 글자 수 점수
        let wordCountScore = 0;
        if (analysis.wordCount >= 1500 && analysis.wordCount <= 2500) wordCountScore = 100;
        else if (analysis.wordCount >= 1000) wordCountScore = 80;
        else if (analysis.wordCount >= 500) wordCountScore = 60;
        else wordCountScore = 30;

        const overall = 
            wordCountScore * weights.wordCount +
            analysis.readability * weights.readability +
            analysis.structure * weights.structure +
            analysis.seoScore * weights.seoScore;

        return Math.round(overall);
    },

    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.wordCount < 1500) {
            recommendations.push('글 길이를 1500자 이상으로 늘려주세요.');
        }
        
        if (analysis.readability < 70) {
            recommendations.push('문장을 더 짧고 명확하게 작성해주세요.');
        }
        
        if (analysis.structure < 60) {
            recommendations.push('소제목과 목록을 더 추가해주세요.');
        }
        
        if (analysis.seoScore < 70) {
            recommendations.push('키워드를 더 자연스럽게 포함해주세요.');
        }
        
        return recommendations;
    }
};

// ===== 저장소 관리 =====
const StorageManager = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('저장 실패:', error);
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('로드 실패:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('삭제 실패:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('전체 삭제 실패:', error);
            return false;
        }
    }
};

// ===== 키보드 단축키 =====
const KeyboardManager = {
    shortcuts: new Map(),

    initialize() {
        document.addEventListener('keydown', (event) => {
            const key = this.getKeyString(event);
            const handler = this.shortcuts.get(key);
            
            if (handler) {
                event.preventDefault();
                handler(event);
            }
        });
    },

    register(keys, handler) {
        this.shortcuts.set(keys, handler);
    },

    getKeyString(event) {
        const parts = [];
        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }
};

// ===== 이벤트 관리 =====
const EventManager = {
    listeners: new Map(),

    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
    },

    off(event, handler) {
        if (this.listeners.has(event)) {
            const handlers = this.listeners.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    },

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`이벤트 핸들러 오류 (${event}):`, error);
                }
            });
        }
    }
};

// ===== 유틸리티 함수들 =====
const Utils = {
    // 날짜 포맷팅
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    // 딜레이 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 디바운스
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
    },

    // 텍스트 처리
    truncate(text, length, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length - suffix.length) + suffix;
    },

    // 랜덤 ID 생성
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // 배열 셔플
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // 객체 깊은 복사
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// ===== 전역 함수들 (하위 호환성) =====
function showNotification(type, title, message) {
    return NotificationManager.show(type, title, message);
}

function showModal(modalId) {
    return ModalManager.show(modalId);
}

function closeModal(modalId) {
    return ModalManager.hide(modalId);
}

function switchTab(tabName) {
    return TabManager.switchTab(tabName);
}

function showGenerationProgress(message) {
    return ProgressManager.show(message);
}

function hideGenerationProgress() {
    return ProgressManager.hide();
}

function updateProgressText(message) {
    return ProgressManager.updateText(message);
}

function checkQuality() {
    const content = DOM.getValue('postContent') || '';
    const title = DOM.getValue('postTitle') || '';
    const keywords = (DOM.getValue('primaryKeywords') || '').split(',').map(k => k.trim()).filter(k => k);
    
    if (!content || !title) {
        showNotification('warning', '내용 필요', '제목과 본문을 입력해주세요.');
        return;
    }

    const analysis = QualityAnalyzer.analyze(content, title, keywords);
    displayQualityResults(analysis);
}

function displayQualityResults(analysis) {
    const overallElement = DOM.get('overallQuality');
    if (overallElement) {
        overallElement.textContent = `${analysis.overallScore}점`;
        
        // 점수에 따른 클래스 설정
        overallElement.className = 'quality-score';
        if (analysis.overallScore >= 90) {
            overallElement.classList.add('excellent');
        } else if (analysis.overallScore >= 80) {
            overallElement.classList.add('good');
        } else if (analysis.overallScore >= 70) {
            overallElement.classList.add('fair');
        } else {
            overallElement.classList.add('poor');
        }
    }

    // 개별 메트릭 업데이트
    updateMetric('wordCount', analysis.wordCount, Math.min(100, (analysis.wordCount / 1500) * 100));
    updateMetric('readability', `${Math.round(analysis.readability)}점`, analysis.readability);
    updateMetric('structureScore', `${Math.round(analysis.structure)}점`, analysis.structure);
    updateMetric('keywordDensity', `${analysis.keywordDensity.toFixed(1)}%`, Math.min(100, analysis.keywordDensity * 25));
}

function updateMetric(id, value, score) {
    const valueElement = DOM.get(id);
    const barElement = DOM.get(id + 'Bar');
    
    if (valueElement) valueElement.textContent = value;
    if (barElement) {
        barElement.style.width = `${score}%`;
        
        // 점수에 따른 색상 설정
        barElement.className = 'metric-fill';
        if (score >= 90) {
            barElement.classList.add('excellent');
        } else if (score >= 80) {
            barElement.classList.add('good');
        } else if (score >= 70) {
            barElement.classList.add('fair');
        } else {
            barElement.classList.add('poor');
        }
    }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
    // 모든 유틸리티 시스템 초기화
    TabManager.initialize();
    NotificationManager.initialize();
    ModalManager.initialize();
    KeyboardManager.initialize();
    
    // 기본 키보드 단축키 등록
    KeyboardManager.register('ctrl+enter', () => {
        if (typeof processNextInQueue === 'function') {
            processNextInQueue();
        }
    });
    
    KeyboardManager.register('ctrl+s', () => {
        if (typeof saveQueueToStorage === 'function') {
            saveQueueToStorage();
            showNotification('success', '저장 완료', '데이터가 저장되었습니다.');
        }
    });
    
    KeyboardManager.register('ctrl+p', () => {
        checkQuality();
    });
    
    KeyboardManager.register('f1', () => {
        showNotification('info', '키보드 단축키', 
            'Ctrl+Enter: 다음 글 작성\nCtrl+S: 저장\nCtrl+P: 품질 검사\nF1: 도움말');
    });
    
    console.log('🔧 유틸리티 시스템 초기화 완료');
});
