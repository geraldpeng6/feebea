// State Synchronization Manager for Infinite Scroll
// This script ensures all states are synchronized across the three positions in infinite scroll

// Global state object to store all synchronized states
window.globalState = window.globalState || {
    // Quote section state
    quote: {
        currentIndex: 0,
        currentSection: 'himym',
        touchStartX: 0,
        touchStartY: 0
    },
    
    // Virtual keyboard state
    virtualKeyboard: {
        isFirstOpen: true,
        clickCount: 0,
        clickTimer: null,
        isVisible: false
    },
    
    // Audio state
    audio: {
        currentPlaylist: [],
        currentIndex: -1,
        isPlaying: false,
        currentAudio: null
    },
    
    // Color circle state
    colorCircle: {
        eventCount: 0,
        processing: false
    },
    
    // Easter egg states
    easterEggs: {
        clickCounters: {
            langToggle: 0,
            pengClick: 0,
            tributeClick: 0,
            essenceCard: 0,
            phoebeWisdom: 0,
            phoebeWisdomBoss: 0,
            emailIcon: 0,
            wechatIcon: 0
        }, // Store all click counters
        triggers: {
            cyberpunk: false,
            zote: false,
            roseQuote: false,
            dondaWisdom: false,
            phoebeWisdom: false,
            phoebeWisdomBoss: false,
            langToggle: false
        },
        triggerSourceIndex: {
            cardEasterEgg: -1, // 记录哪个卡片索引是彩蛋触发源
            wisdomEasterEgg: -1 // 记录智慧语录彩蛋触发源
        },
        lastTriggerTime: 0, // 用于限制触发频率
        clickTimers: {} // 存储点击计时器
    },
    
    // Phoebe's Wisdom state
    phoebeWisdom: {
        currentQuote: '',
        currentAuthor: '',
        zoteMode: false,
        dondaMode: false
    },
    
    // Zote state
    zote: {
        triggered: false,
        currentPrecept: 56,
        cycleCount: 0
    },
    
    // Donda's wisdom state
    dondaWisdom: {
        isActive: false, 
        englishTitle: "",
        englishQuote: "",
        chineseTitle: "",
        chineseQuote: ""
    },
    
    // Essence cards state
    essence: {
        currentIndex: 0,
        easterEggTriggered: false,
        easterEggContent: null
    },
    
    // Meditation state
    meditation: {
        isRunawayMode: false,
        englishContent: "",
        chineseContent: ""
    },
    
    // Performance metrics
    performance: {
        lastUpdateTime: 0,
        updateInterval: 100, // 限制更新频率的毫秒数
        pendingUpdates: {} // 存储待处理的更新，避免频繁DOM操作
    },
    
    // 资源管理
    resources: {
        loadedImages: new Set(),
        loadedFonts: new Set(),
        failedResources: new Set(),
        retryCount: {},
        maxRetries: 3
    }
};

// State Synchronization Manager
const StateSyncManager = {
    // 节流函数，限制函数调用频率
    throttle: function(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },
    
    // 防抖函数，延迟执行频繁调用的函数
    debounce: function(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    },
    
    // 安全获取DOM元素
    safeQuerySelector: function(selector, parent = document) {
        try {
            return parent ? parent.querySelector(selector) : null;
        } catch (error) {
            console.error(`🔴 Error querying selector "${selector}":`, error);
            return null;
        }
    },
    
    safeQuerySelectorAll: function(selector, parent = document) {
        try {
            return parent ? parent.querySelectorAll(selector) : [];
        } catch (error) {
            console.error(`🔴 Error querying all "${selector}":`, error);
            return [];
        }
    },
    
    // Log wrapper with level control
    log: function(message, level = 'info') {
        // 可以根据需要禁用日志
        const debugMode = true;
        if (!debugMode && level !== 'error') return;
        
        switch(level) {
            case 'error':
                console.error(`🔴 [StateSyncManager] ${message}`);
                break;
            case 'warn':
                console.warn(`🟠 [StateSyncManager] ${message}`);
                break;
            case 'info':
                console.log(`🔵 [StateSyncManager] ${message}`);
                break;
            case 'debug':
                console.log(`🟢 [StateSyncManager] ${message}`);
                break;
        }
    },
    
    // 批量更新处理，限制DOM操作频率
    scheduleBatchUpdate: function(updateType, updateFunction) {
        const now = Date.now();
        const performanceData = window.globalState.performance;
        
        // 存储此类型的更新函数
        performanceData.pendingUpdates[updateType] = updateFunction;
        
        // 如果距离上次更新时间足够长，执行所有待处理的更新
        if (now - performanceData.lastUpdateTime >= performanceData.updateInterval) {
            this.executeBatchUpdates();
        }
    },
    
    // 执行所有待处理的批量更新
    executeBatchUpdates: function() {
        const performanceData = window.globalState.performance;
        const updates = performanceData.pendingUpdates;
        
        // 执行所有待处理的更新
        Object.keys(updates).forEach(updateType => {
            try {
                updates[updateType]();
            } catch (error) {
                this.log(`Error executing ${updateType} update: ${error.message}`, 'error');
            }
        });
        
        // 清空待处理更新列表
        performanceData.pendingUpdates = {};
        performanceData.lastUpdateTime = Date.now();
    },
    
    // Sync virtual keyboard state
    syncVirtualKeyboardState: function(newState) {
        try {
            // 更新全局虚拟键盘状态
            window.globalState.virtualKeyboard = {
                ...window.globalState.virtualKeyboard,
                ...newState
            };
            
            // 如果状态包含可见性变化，则同步UI
            if (newState.isVisible !== undefined) {
                this.scheduleBatchUpdate('virtualKeyboard', () => this.updateVirtualKeyboardUI());
            }
        } catch (error) {
            this.log(`Error syncing virtual keyboard state: ${error.message}`, 'error');
        }
    },
    
    // Update virtual keyboard UI based on state
    updateVirtualKeyboardUI: function() {
        try {
            const keyboard = document.getElementById('virtualKeyboard');
            if (!keyboard) {
                this.log('Virtual keyboard element not found', 'warn');
                return;
            }
            
            const state = window.globalState.virtualKeyboard;
            
            if (state.isVisible) {
                keyboard.classList.remove('hidden');
                keyboard.style.display = 'block';
                keyboard.style.transform = 'translateY(0)';
            } else {
                keyboard.style.transform = 'translateY(100%)';
                // 不立即隐藏元素，留时间给过渡动画
                setTimeout(() => {
                    if (!window.globalState.virtualKeyboard.isVisible) {
                        keyboard.classList.add('hidden');
                        keyboard.style.display = 'none';
                    }
                }, 300);
            }
            
            this.log('Virtual keyboard UI updated', 'debug');
        } catch (error) {
            this.log(`Error updating virtual keyboard UI: ${error.message}`, 'error');
        }
    },
    
    // Sync audio state
    syncAudioState: function(newState) {
        try {
            window.globalState.audio = {
                ...window.globalState.audio,
                ...newState
            };
            
            // 可以在这里添加同步所有音频播放器UI的代码
        } catch (error) {
            this.log(`Error syncing audio state: ${error.message}`, 'error');
        }
    },
    
    // Sync color circle state
    syncColorCircleState: function(newState) {
        try {
            window.globalState.colorCircle = {
                ...window.globalState.colorCircle,
                ...newState
            };
            
            // 更新全局变量确保兼容
            window.colorCircleProcessing = window.globalState.colorCircle.processing;
        } catch (error) {
            this.log(`Error syncing color circle state: ${error.message}`, 'error');
        }
    },
    
    // Sync Phoebe's Wisdom state and update all instances
    syncPhoebeWisdomState: function(newState) {
        try {
            window.globalState.phoebeWisdom = {
                ...window.globalState.phoebeWisdom,
                ...newState
            };
            
            // 节流处理，避免频繁更新
            this.scheduleBatchUpdate('phoebeWisdom', () => this.updateAllPhoebeWisdom());
        } catch (error) {
            this.log(`Error syncing Phoebe's Wisdom state: ${error.message}`, 'error');
        }
    },
    
    // Update all Phoebe's Wisdom sections
    updateAllPhoebeWisdom: function() {
        try {
            const state = window.globalState.phoebeWisdom;
            const zoteState = window.globalState.zote;
            const dondaState = window.globalState.dondaWisdom;
            
            // 获取所有的Phoebe's Wisdom区域
            const wisdomSections = this.safeQuerySelectorAll('.phoebe-quote');
            
            wisdomSections.forEach(section => {
                // 获取相关的DOM元素
                const title = this.safeQuerySelector('.phoebe-title', section);
                const quote = this.safeQuerySelector('.phoebe-quote-text', section);
                const author = this.safeQuerySelector('.phoebe-author', section);
                
                // 处理不同的模式
                if (zoteState.triggered) {
                    // 左特戒律模式
                    if (title) title.textContent = 'Zote\'s 57 Precepts';
                    if (quote && zoteState.currentPrecept <= 57) {
                        const preceptNumber = zoteState.currentPrecept || 1;
                        quote.textContent = `Precept ${preceptNumber}: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."`;
                    }
                    if (author) author.textContent = 'Zote the Mighty';
                } else if (dondaState.isActive) {
                    // Donda's Wisdom模式
                    const isEnglish = section.closest('#englishContent') !== null;
                    
                    if (title) title.textContent = isEnglish ? dondaState.englishTitle : dondaState.chineseTitle;
                    if (quote) quote.textContent = isEnglish ? dondaState.englishQuote : dondaState.chineseQuote;
                    if (author) author.textContent = 'Donda West';
                } else {
                    // 正常Phoebe's Wisdom模式
                    if (title && state.currentTitle) title.textContent = state.currentTitle;
                    if (quote && state.currentQuote) quote.textContent = state.currentQuote;
                    if (author && state.currentAuthor) author.textContent = state.currentAuthor;
                }
            });
            
            this.log('Updated all Phoebe\'s Wisdom sections', 'debug');
        } catch (error) {
            this.log(`Error updating Phoebe's Wisdom sections: ${error.message}`, 'error');
        }
    },
    
    // Sync essence cards state
    syncEssenceState: function(newState, updateUI = true) {
        try {
            if (!window.globalState.essence) {
                window.globalState.essence = {
                    currentIndex: 0,
                    easterEggTriggered: false,
                    easterEggContent: null
                };
            }
            
            window.globalState.essence = {
                ...window.globalState.essence,
                ...newState
            };
            
            // 如果需要更新UI并指定了索引
            if (updateUI && typeof newState.currentIndex !== 'undefined') {
                this.scheduleBatchUpdate('essence', () => {
                    this.updateAllEssenceCards(newState.currentIndex);
                });
            }
        } catch (error) {
            this.log(`Error syncing essence state: ${error.message}`, 'error');
        }
    },
    
    // Update all essence cards
    updateAllEssenceCards: function(cardIndex) {
        try {
            // 获取所有英文和中文卡片容器
            const englishCardContainer = this.safeQuerySelector('#englishContent .essence-card-container');
            const chineseCardContainer = this.safeQuerySelector('#chineseContent .essence-card-container');
            
            if (!englishCardContainer || !chineseCardContainer) {
                this.log('Card containers not found', 'warn');
                return;
            }
            
            // 获取所有卡片
            const englishCards = this.safeQuerySelectorAll('.essence-card', englishCardContainer);
            const chineseCards = this.safeQuerySelectorAll('.essence-card', chineseCardContainer);
            
            // 检查索引是否有效
            if (cardIndex < 0 || cardIndex >= englishCards.length || cardIndex >= chineseCards.length) {
                this.log(`Invalid card index: ${cardIndex}`, 'warn');
                return;
            }
            
            // 获取目标卡片
            const englishTargetCard = englishCards[cardIndex];
            const chineseTargetCard = chineseCards[cardIndex];
            
            // 处理彩蛋触发状态
            if (window.globalState.essence.easterEggTriggered && 
                window.globalState.essence.easterEggContent) {
                
                // 获取彩蛋内容
                const content = window.globalState.essence.easterEggContent;
                
                // 更新英文卡片
                if (englishTargetCard) {
                    const title = this.safeQuerySelector('.essence-title', englishTargetCard);
                    const desc = this.safeQuerySelector('.essence-desc', englishTargetCard);
                    
                    if (title && content.title) title.textContent = content.title;
                    if (desc && content.desc) desc.textContent = content.desc;
                }
                
                // 更新中文卡片
                if (chineseTargetCard) {
                    const title = this.safeQuerySelector('.essence-title', chineseTargetCard);
                    const desc = this.safeQuerySelector('.essence-desc', chineseTargetCard);
                    
                    if (title && content.titleChinese) title.textContent = content.titleChinese;
                    if (desc && content.descChinese) desc.textContent = content.descChinese;
                }
            }
            
            this.log(`Updated all essence cards at index ${cardIndex}`, 'debug');
        } catch (error) {
            this.log(`Error updating essence cards: ${error.message}`, 'error');
        }
    },
    
    // Sync Zote easter egg state
    syncZoteState: function(newState) {
        try {
            if (!window.globalState.zote) {
                window.globalState.zote = {
                    triggered: false,
                    currentPrecept: 56,
                    cycleCount: 0
                };
            }
            window.globalState.zote = { ...window.globalState.zote, ...newState };
            
            // 如果左特戒律被触发，同步更新所有Phoebe's Wisdom区域
            if (window.globalState.zote.triggered) {
                this.scheduleBatchUpdate('zote', () => this.updateAllPhoebeWisdom());
            }
        } catch (error) {
            this.log(`Error syncing Zote state: ${error.message}`, 'error');
        }
    },
    
    // Sync Donda's wisdom state
    syncDondaWisdomState: function(newState) {
        try {
            if (!window.globalState.dondaWisdom) {
                window.globalState.dondaWisdom = {
                    isActive: false,
                    englishTitle: "",
                    englishQuote: "",
                    chineseTitle: "",
                    chineseQuote: ""
                };
            }
            window.globalState.dondaWisdom = { ...window.globalState.dondaWisdom, ...newState };
            
            // 如果更新了状态，同步所有Phoebe's Wisdom区域
            if (newState.isActive !== undefined) {
                window.globalState.easterEggs.triggers.dondaWisdom = newState.isActive;
                this.scheduleBatchUpdate('donda', () => this.updateAllPhoebeWisdom());
            }
        } catch (error) {
            this.log(`Error syncing Donda wisdom state: ${error.message}`, 'error');
        }
    },
    
    // Sync meditation state
    syncMeditationState: function(newState) {
        try {
            if (!window.globalState.meditation) {
                window.globalState.meditation = {
                    isRunawayMode: false,
                    englishContent: "",
                    chineseContent: ""
                };
            }
            window.globalState.meditation = { ...window.globalState.meditation, ...newState };
            
            // 更新所有冥想文本内容
            this.scheduleBatchUpdate('meditation', () => this.updateAllMeditations());
        } catch (error) {
            this.log(`Error syncing meditation state: ${error.message}`, 'error');
        }
    },
    
    // 更新所有冥想区域
    updateAllMeditations: function() {
        try {
            const state = window.globalState.meditation;
            
            // 获取所有冥想文本元素
            const englishMeditations = this.safeQuerySelectorAll('#englishContent .meditation-text');
            const chineseMeditations = this.safeQuerySelectorAll('#chineseContent .meditation-text');
            
            // 更新所有英文冥想文本
            if (state.englishContent) {
                englishMeditations.forEach(meditation => {
                    meditation.innerHTML = state.englishContent;
                });
            }
            
            // 更新所有中文冥想文本
            if (state.chineseContent) {
                chineseMeditations.forEach(meditation => {
                    meditation.innerHTML = state.chineseContent;
                });
            }
            
            this.log('Updated all meditation texts', 'debug');
        } catch (error) {
            this.log(`Error updating meditations: ${error.message}`, 'error');
        }
    },
    
    // 卡片彩蛋同步管理 - 解决彩蛋触发多卡片问题
    handleCardEasterEgg: function(cardIndex, cardType, triggerCondition) {
        try {
            // 频率限制检查，避免短时间内多次触发
            const now = Date.now();
            if (now - window.globalState.easterEggs.lastTriggerTime < 500) {
                return false;
            }
            
            // 检查此卡片是否已经是彩蛋源
            const isSource = window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg === cardIndex;
            
            // 如果触发条件满足且此卡片是彩蛋源或尚未设置彩蛋源
            if (triggerCondition() && (isSource || window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg === -1)) {
                // 设置彩蛋源索引
                window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg = cardIndex;
                window.globalState.easterEggs.lastTriggerTime = now;
                
                // 标记对应类型的彩蛋已触发
                if (cardType && window.globalState.easterEggs.triggers) {
                    window.globalState.easterEggs.triggers[cardType] = true;
                }
                
                this.log(`Card easter egg triggered: ${cardType} at index ${cardIndex}`, 'info');
                
                // 返回true表示应该在此卡片上显示彩蛋内容
                return true;
            }
            
            // 如果不是彩蛋源卡片，则不触发彩蛋内容
            return false;
        } catch (error) {
            this.log(`Error handling card easter egg: ${error.message}`, 'error');
            return false;
        }
    },
    
    // 重置卡片彩蛋状态
    resetCardEasterEgg: function() {
        try {
            window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg = -1;
            this.log('Card easter egg source index reset', 'info');
        } catch (error) {
            this.log(`Error resetting card easter egg: ${error.message}`, 'error');
        }
    },
    
    // 清理连接事件和引用，避免内存泄漏
    cleanup: function() {
        try {
            // 清除所有计时器
            const timerIds = [
                window.globalState.virtualKeyboard.clickTimer,
                this._resourceTimeout
            ].filter(Boolean);
            
            timerIds.forEach(timerId => clearTimeout(timerId));
            
            // 帮助垃圾回收器回收内存
            for (const key in window.globalState.pendingUpdates) {
                if (window.globalState.pendingUpdates.hasOwnProperty(key)) {
                    window.globalState.pendingUpdates[key] = null;
                }
            }
            
            // 清理资源缓存
            window.globalState.resources.loadedImages = new Set();
            window.globalState.resources.failedResources = new Set();
            window.globalState.resources.retryCount = {};
            
            this.log('Cleaned up timers, references and resource caches', 'info');
        } catch (error) {
            this.log(`Error during cleanup: ${error.message}`, 'error');
        }
    },
    
    // 查找和修复无缝滚动内重复ID问题
    fixDuplicateIds: function() {
        try {
            // 找出所有容器
            const containers = this.safeQuerySelectorAll('#infinite-scroll-container > .container');
            if (containers.length <= 1) {
                this.log('No duplicate containers found, skipping ID fix', 'debug');
                return;
            }
            
            // 保留第一个容器中的原始ID，修改其他容器中的重复ID
            const originalContainer = containers[0];
            const elementWithIds = originalContainer.querySelectorAll('[id]');
            
            // 收集所有ID
            const idMap = {};
            elementWithIds.forEach(el => {
                idMap[el.id] = true;
            });
            
            // 修复其他容器中的重复ID
            for (let i = 1; i < containers.length; i++) {
                const container = containers[i];
                const duplicateElements = container.querySelectorAll('[id]');
                
                duplicateElements.forEach(el => {
                    const originalId = el.id;
                    // 为重复元素生成新ID
                    const newId = `${originalId}_duplicate_${i}`;
                    
                    // 替换ID
                    el.id = newId;
                    
                    // 更新任何可能引用此元素的属性，比如标签的for属性
                    const relatedLabels = container.querySelectorAll(`label[for="${originalId}"]`);
                    relatedLabels.forEach(label => {
                        label.setAttribute('for', newId);
                    });
                    
                    // 更新任何可能引用此元素的ARIA属性
                    const ariaReferences = container.querySelectorAll(`[aria-labelledby="${originalId}"], [aria-describedby="${originalId}"], [aria-controls="${originalId}"]`);
                    ariaReferences.forEach(ref => {
                        if (ref.hasAttribute('aria-labelledby')) {
                            ref.setAttribute('aria-labelledby', newId);
                        }
                        if (ref.hasAttribute('aria-describedby')) {
                            ref.setAttribute('aria-describedby', newId);
                        }
                        if (ref.hasAttribute('aria-controls')) {
                            ref.setAttribute('aria-controls', newId);
                        }
                    });
                });
            }
            
            this.log(`Fixed duplicate IDs in ${containers.length - 1} cloned containers`, 'info');
        } catch (error) {
            this.log(`Error fixing duplicate IDs: ${error.message}`, 'error');
        }
    },
    
    // 资源加载和管理
    resourceManager: {
        // 检测并修复所有容器中的图片
        fixImages: function() {
            try {
                const containers = StateSyncManager.safeQuerySelectorAll('#infinite-scroll-container > .container');
                if (containers.length <= 1) {
                    StateSyncManager.log('No multiple containers to fix images for', 'debug');
                    return;
                }
                
                // 收集第一个容器中的所有图片
                const originalContainer = containers[0];
                const originalImages = StateSyncManager.safeQuerySelectorAll('img', originalContainer);
                
                // 记录加载错误的图片
                const brokenImages = [];
                
                originalImages.forEach(img => {
                    // 如果图片已加载但出错
                    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                        brokenImages.push({
                            src: img.src,
                            alt: img.alt,
                            className: img.className,
                            id: img.id
                        });
                    }
                });
                
                // 遍历其他容器修复图片
                for (let i = 1; i < containers.length; i++) {
                    const container = containers[i];
                    const images = StateSyncManager.safeQuerySelectorAll('img', container);
                    
                    images.forEach(img => {
                        // 使用浏览器缓存来避免重复加载
                        if (!img.complete || (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                            // 创建新的图片元素以强制重新加载
                            const newImg = new Image();
                            
                            // 复制原始图片的所有属性
                            for (const attr of img.attributes) {
                                newImg.setAttribute(attr.name, attr.value);
                            }
                            
                            // 添加加载完成事件处理
                            newImg.onload = function() {
                                StateSyncManager.log(`Fixed image in container ${i}: ${newImg.src}`, 'debug');
                            };
                            
                            newImg.onerror = function() {
                                StateSyncManager.log(`Failed to load image in container ${i}: ${newImg.src}`, 'warn');
                                // 记录失败的资源
                                window.globalState.resources.failedResources.add(newImg.src);
                                
                                // 添加失败样式或占位符
                                newImg.classList.add('load-failed');
                                
                                // 尝试修复路径（常见问题是相对路径问题）
                                const retryCount = window.globalState.resources.retryCount[newImg.src] || 0;
                                if (retryCount < window.globalState.resources.maxRetries) {
                                    // 更新重试次数
                                    window.globalState.resources.retryCount[newImg.src] = retryCount + 1;
                                    
                                    // 尝试不同的路径修复方式
                                    setTimeout(() => {
                                        if (newImg.src.startsWith('./')) {
                                            // 尝试移除开头的./
                                            newImg.src = newImg.src.substring(2);
                                        } else if (!newImg.src.startsWith('/') && !newImg.src.startsWith('http')) {
                                            // 尝试添加/开头
                                            newImg.src = '/' + newImg.src;
                                        } else if (newImg.src.includes('../')) {
                                            // 尝试解析相对路径
                                            newImg.src = StateSyncManager.resourceManager.resolveRelativePath(newImg.src);
                                        }
                                    }, 500);
                                }
                            };
                            
                            // 替换原始图片
                            if (img.parentNode) {
                                img.parentNode.replaceChild(newImg, img);
                            }
                        }
                    });
                    
                    // 修复已知的损坏图片
                    brokenImages.forEach(brokenImg => {
                        const selector = brokenImg.id ? 
                            `#${brokenImg.id}` : 
                            (brokenImg.className ? 
                                `.${brokenImg.className.replace(/\s+/g, '.')}` : 
                                `img[src="${brokenImg.src}"]`);
                        
                        const imgToFix = StateSyncManager.safeQuerySelector(selector, container);
                        if (imgToFix) {
                            const newImg = new Image();
                            
                            // 复制原始图片属性
                            for (const attr of imgToFix.attributes) {
                                newImg.setAttribute(attr.name, attr.value);
                            }
                            
                            // 获取绝对路径可能修复路径问题
                            if (brokenImg.src.indexOf('//') === -1) {
                                const absolutePath = new URL(brokenImg.src, window.location.href).href;
                                newImg.src = absolutePath;
                            }
                            
                            if (imgToFix.parentNode) {
                                imgToFix.parentNode.replaceChild(newImg, imgToFix);
                            }
                        }
                    });
                }
                
                StateSyncManager.log(`Checked and fixed images across ${containers.length} containers`, 'info');
            } catch (error) {
                StateSyncManager.log(`Error fixing images: ${error.message}`, 'error');
            }
        },
        
        // 解析相对路径
        resolveRelativePath: function(path) {
            // 简单相对路径解析器
            const base = window.location.pathname;
            const parts = base.split('/').filter(Boolean);
            const pathParts = path.split('/').filter(Boolean);
            
            let resultParts = [...parts];
            
            for (const part of pathParts) {
                if (part === '..') {
                    resultParts.pop();
                } else if (part !== '.') {
                    resultParts.push(part);
                }
            }
            
            return '/' + resultParts.join('/');
        },
        
        // 检查和同步CSS状态
        syncStyles: function() {
            try {
                const containers = StateSyncManager.safeQuerySelectorAll('#infinite-scroll-container > .container');
                if (containers.length <= 1) return;
                
                // 获取第一个容器中所有具有style属性的元素
                const originalContainer = containers[0];
                const styledElements = originalContainer.querySelectorAll('[style]');
                
                // 记录样式信息
                const styleMap = new Map();
                
                styledElements.forEach(el => {
                    // 创建选择器（优先使用ID，其次是类名）
                    let selector;
                    if (el.id) {
                        selector = `#${el.id}`;
                    } else if (el.className) {
                        // 处理类名中的空格
                        selector = `.${el.className.replace(/\s+/g, '.')}`;
                    } else {
                        // 为无ID无类名的元素创建路径选择器
                        selector = StateSyncManager.resourceManager.getElementPath(el);
                    }
                    
                    styleMap.set(selector, el.style.cssText);
                });
                
                // 同步样式到其他容器
                for (let i = 1; i < containers.length; i++) {
                    const container = containers[i];
                    
                    styleMap.forEach((styleText, selector) => {
                        try {
                            // 查找对应元素
                            const elements = container.querySelectorAll(selector);
                            elements.forEach(el => {
                                // 检查是否需要更新样式
                                if (el.style.cssText !== styleText) {
                                    el.style.cssText = styleText;
                                }
                            });
                        } catch (error) {
                            StateSyncManager.log(`Error applying style for selector "${selector}": ${error.message}`, 'warn');
                        }
                    });
                }
                
                StateSyncManager.log('Synchronized styles across containers', 'debug');
            } catch (error) {
                StateSyncManager.log(`Error synchronizing styles: ${error.message}`, 'error');
            }
        },
        
        // 获取元素的路径选择器
        getElementPath: function(el) {
            const path = [];
            let current = el;
            
            while (current && current !== document.body && path.length < 6) {
                let selector = current.tagName.toLowerCase();
                
                if (current.id) {
                    selector = `#${current.id}`;
                    path.unshift(selector);
                    break;
                } else if (current.className) {
                    selector += `.${current.className.replace(/\s+/g, '.')}`;
                }
                
                // 如果有同级元素，添加:nth-child
                const parent = current.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(current);
                    if (index > 0) {
                        selector += `:nth-child(${index + 1})`;
                    }
                }
                
                path.unshift(selector);
                current = current.parentElement;
            }
            
            return path.join(' > ');
        }
    },
    
    // 同步彩蛋状态 - 修复彩蛋触发问题
    syncEasterEggState: function(eggType, clickCount) {
        try {
            // 确保clickCounters对象已初始化
            if (!window.globalState.easterEggs.clickCounters) {
                window.globalState.easterEggs.clickCounters = {};
            }
            
            // 更新点击计数
            window.globalState.easterEggs.clickCounters[eggType] = clickCount;
            
            // 同步到全局变量，确保兼容旧代码
            if (window.clickCounters && typeof window.clickCounters === 'object') {
                window.clickCounters[eggType] = clickCount;
            }
            
            this.log(`Easter egg state synced: ${eggType} = ${clickCount}`, 'debug');
            
            // 检查是否需要触发彩蛋
            this.checkEasterEggTrigger(eggType, clickCount);
        } catch (error) {
            this.log(`Error syncing easter egg state: ${error.message}`, 'error');
        }
    },
    
    // 检查是否应该触发彩蛋
    checkEasterEggTrigger: function(eggType, clickCount) {
        try {
            // 获取彩蛋触发阈值
            const triggerThreshold = this.getEasterEggTriggerThreshold(eggType);
            
            // 如果达到触发阈值
            if (clickCount >= triggerThreshold) {
                // 标记彩蛋已触发
                window.globalState.easterEggs.triggers[eggType] = true;
                
                // 同步到全局变量，确保兼容旧代码
                if (window.easterEggTriggered && typeof window.easterEggTriggered === 'object') {
                    window.easterEggTriggered[eggType] = true;
                }
                
                this.log(`Easter egg triggered: ${eggType}`, 'info');
                
                // 根据彩蛋类型执行特定操作
                switch(eggType) {
                    case 'phoebeWisdom':
                        // 更新Phoebe's Wisdom内容
                        this.syncPhoebeWisdomState({
                            currentQuote: window.isEnglish 
                                ? "Oh, I wish I could, but I don't want to." 
                                : "哦，我希望我能去帮忙，但我不想去。"
                        });
                        break;
                        
                    case 'phoebeWisdomBoss':
                        // 更新Phoebe's Wisdom Boss内容
                        this.syncPhoebeWisdomState({
                            currentQuote: window.isEnglish 
                                ? "You are the boss of you!" 
                                : "你是你自己的老板！"
                        });
                        break;
                        
                    case 'langToggle':
                        // 语言切换彩蛋已在toggleLanguage函数中处理
                        break;
                }
            }
        } catch (error) {
            this.log(`Error checking easter egg trigger: ${error.message}`, 'error');
        }
    },
    
    // 获取彩蛋触发阈值
    getEasterEggTriggerThreshold: function(eggType) {
        // 不同彩蛋的触发阈值
        const thresholds = {
            langToggle: 3,
            phoebeWisdom: 3,
            phoebeWisdomBoss: 3,
            emailIcon: 3,
            wechatIcon: 3,
            pengClick: 3,
            tributeClick: 3,
            essenceCard: 3
        };
        
        return thresholds[eggType] || 3; // 默认为3次点击
    },
    
    // Initialize state synchronization
    init: function() {
        try {
            this.log('State Synchronization Manager initializing...', 'info');
            
            // 修复任何重复ID问题
            this.fixDuplicateIds();
            
            // 初始化资源检查和修复
            setTimeout(() => {
                this.resourceManager.fixImages();
                this.resourceManager.syncStyles();
            }, 1000); // 延迟1秒执行，确保基本DOM已加载
            
            // 定期执行资源检查
            setInterval(() => {
                this.resourceManager.fixImages();
                this.resourceManager.syncStyles();
            }, 5000); // 每5秒检查一次
            
            // Override existing global variables with synchronized versions
            if (typeof window.virtualKeyboardState === 'undefined') {
                window.virtualKeyboardState = window.globalState.virtualKeyboard;
            }
            
            if (typeof window.audioState === 'undefined') {
                window.audioState = window.globalState.audio;
            }
            
            if (typeof window.colorCircleProcessing === 'undefined') {
                window.colorCircleProcessing = window.globalState.colorCircle.processing;
            }
            
            // Sync existing click counters if they exist
            if (typeof window.clickCounters !== 'undefined') {
                // 将全局clickCounters同步到我们的状态管理器
                Object.keys(window.clickCounters).forEach(key => {
                    window.globalState.easterEggs.clickCounters[key] = window.clickCounters[key];
                });
            }
            
            // 同步已触发的彩蛋状态
            if (typeof window.easterEggTriggered !== 'undefined') {
                // 将已触发的彩蛋状态同步到我们的状态管理器
                Object.keys(window.easterEggTriggered).forEach(key => {
                    window.globalState.easterEggs.triggers[key] = window.easterEggTriggered[key];
                });
            }
            
            // 同步彩蛋触发计数器
            if (typeof window.easterEggTriggerCounts !== 'undefined') {
                window.globalState.easterEggs.triggerCounts = { ...window.easterEggTriggerCounts };
            }
            
            // 同步彩蛋计时器
            if (typeof window.clickTimers !== 'undefined') {
                Object.keys(window.clickTimers).forEach(key => {
                    window.globalState.easterEggs.clickTimers[key] = window.clickTimers[key];
                });
            }
            
            // 初始化时同步所有元素状态
            this.updateAllPhoebeWisdom();
            this.updateAllMeditations();
            this.updateVirtualKeyboardUI();
            
            // 添加DOM变化观察器，确保无缝滚动时复制的元素保持同步
            this.setupMutationObserver();
            
            // 暴露彩蛋处理方法给window对象，使得其他脚本可以调用
            window.handleCardEasterEgg = this.handleCardEasterEgg.bind(this);
            window.resetCardEasterEgg = this.resetCardEasterEgg.bind(this);
            
            // 设置批量更新的定期执行
            setInterval(() => this.executeBatchUpdates(), 100);
            
            // 添加页面卸载时的清理
            window.addEventListener('beforeunload', () => this.cleanup());
            
            this.log('State Synchronization Manager initialized successfully', 'info');
        } catch (error) {
            this.log(`Error initializing state manager: ${error.message}`, 'error');
        }
    },
    
    // 增强版setupMutationObserver，处理资源相关变化
    setupMutationObserver: function() {
        try {
            // 如果已存在观察器，先移除
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            
            // 创建观察器实例
            this._observer = new MutationObserver((mutations) => {
                let shouldUpdateState = false;
                let hasResourceChanges = false;
                
                mutations.forEach((mutation) => {
                    // 检查是否有新加的节点
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach((node) => {
                            // 检查是否是容器元素
                            if (node.classList && node.classList.contains('container')) {
                                this.log('New container detected in infinite scroll - syncing state', 'info');
                                shouldUpdateState = true;
                                
                                // 修复复制后可能出现的重复ID问题
                                this.fixDuplicateIds();
                            }
                            
                            // 检查是否添加了资源相关元素
                            if (node.tagName === 'IMG' || node.tagName === 'VIDEO' || 
                                node.tagName === 'AUDIO' || node.tagName === 'IFRAME') {
                                hasResourceChanges = true;
                            }
                        });
                    }
                    
                    // 检查属性变化
                    if (mutation.type === 'attributes') {
                        // 如果修改了图片的src属性或样式属性
                        if (mutation.attributeName === 'src' || mutation.attributeName === 'style') {
                            hasResourceChanges = true;
                        }
                    }
                });
                
                // 如果检测到新的容器，一次性同步所有状态
                if (shouldUpdateState) {
                    // 同步所有状态到新添加的元素
                    this.updateAllPhoebeWisdom();
                    this.updateAllMeditations();
                    this.updateVirtualKeyboardUI();
                    
                    // 如果essence有状态，也同步更新
                    if (window.globalState.essence && 
                        typeof window.globalState.essence.currentIndex !== 'undefined') {
                        this.updateAllEssenceCards(window.globalState.essence.currentIndex);
                    }
                }
                
                // 如果有资源变化，检查并修复
                if (hasResourceChanges) {
                    // 使用防抖函数处理资源修复，避免频繁操作
                    clearTimeout(this._resourceTimeout);
                    this._resourceTimeout = setTimeout(() => {
                        this.resourceManager.fixImages();
                        this.resourceManager.syncStyles();
                    }, 500); // 等待500ms后执行
                }
            });
            
            // 配置观察选项，包含属性监控
            const config = { 
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'style', 'class']
            };
            
            // 开始观察document body的变化
            this._observer.observe(document.body, config);
            this.log('DOM Mutation Observer setup for state synchronization', 'info');
        } catch (error) {
            this.log(`Error setting up mutation observer: ${error.message}`, 'error');
        }
    },
    
    // 系统诊断和测试函数
    diagnostics: {
        // 运行全面诊断
        runFullDiagnosis: function() {
            console.group('📊 无缝滚动状态同步系统诊断');
            
            // 检查容器情况
            this.checkContainerStructure();
            
            // 检查状态同步情况
            this.checkStateSync();
            
            // 检查资源加载情况
            this.checkResourceLoading();
            
            // 检查事件处理器
            this.checkEventHandlers();
            
            console.groupEnd();
            
            return '✅ 诊断已完成，详情请查看控制台输出';
        },
        
        // 检查容器结构
        checkContainerStructure: function() {
            console.group('1. 容器结构检查');
            
            const container = document.getElementById('infinite-scroll-container');
            if (!container) {
                console.error('❌ 无缝滚动容器未找到！');
                console.groupEnd();
                return;
            }
            
            const childContainers = StateSyncManager.safeQuerySelectorAll('.container', container);
            console.log(`📦 检测到 ${childContainers.length} 个内容容器`);
            
            if (childContainers.length !== 3) {
                console.warn(`⚠️ 预期有3个内容容器，实际有 ${childContainers.length} 个`);
            }
            
            // 检查容器大小一致性
            const heights = Array.from(childContainers).map(c => c.offsetHeight);
            const allSameHeight = heights.every((h, i, arr) => i === 0 || Math.abs(h - arr[0]) < 10);
            
            if (!allSameHeight) {
                console.warn('⚠️ 容器高度不一致，可能影响无缝滚动：', heights);
            } else {
                console.log('✅ 容器高度一致性检查通过');
            }
            
            // 检查ID重复问题
            const ids = new Map();
            let duplicateFound = false;
            
            childContainers.forEach((container, index) => {
                const elements = container.querySelectorAll('[id]');
                elements.forEach(el => {
                    if (!ids.has(el.id)) {
                        ids.set(el.id, []);
                    }
                    ids.get(el.id).push({containerIndex: index, element: el});
                });
            });
            
            ids.forEach((instances, id) => {
                if (instances.length > 1) {
                    duplicateFound = true;
                    console.warn(`⚠️ ID "${id}" 在多个容器中重复出现 ${instances.length} 次`);
                }
            });
            
            if (!duplicateFound) {
                console.log('✅ 没有检测到ID重复问题');
            } else {
                console.log('ℹ️ ID重复可能会导致事件处理器和样式应用问题');
            }
            
            console.groupEnd();
        },
        
        // 检查状态同步
        checkStateSync: function() {
            console.group('2. 状态同步检查');
            
            // 检查智慧语录同步
            const wisdomSections = StateSyncManager.safeQuerySelectorAll('.phoebe-quote');
            if (wisdomSections.length > 0) {
                const quotes = Array.from(wisdomSections).map(s => {
                    const text = StateSyncManager.safeQuerySelector('.phoebe-quote-text', s);
                    return text ? text.textContent : 'N/A';
                });
                
                const allSameQuote = quotes.every((q, i, arr) => i === 0 || q === arr[0]);
                
                if (!allSameQuote) {
                    console.warn('⚠️ 智慧语录内容不同步：', quotes);
                } else {
                    console.log('✅ 智慧语录同步检查通过');
                }
            } else {
                console.log('ℹ️ 未找到智慧语录元素，跳过检查');
            }
            
            // 检查冥想文本同步
            const englishMeditations = StateSyncManager.safeQuerySelectorAll('#englishContent .meditation-text');
            if (englishMeditations.length > 0) {
                const meditationTexts = Array.from(englishMeditations).map(m => m.innerHTML);
                const allSameMeditation = meditationTexts.every((m, i, arr) => i === 0 || m === arr[0]);
                
                if (!allSameMeditation) {
                    console.warn('⚠️ 冥想文本内容不同步');
                } else {
                    console.log('✅ 冥想文本同步检查通过');
                }
            } else {
                console.log('ℹ️ 未找到冥想文本元素，跳过检查');
            }
            
            console.groupEnd();
        },
        
        // 检查资源加载情况
        checkResourceLoading: function() {
            console.group('3. 资源加载检查');
            
            // 检查图片加载
            const allImages = document.querySelectorAll('img');
            console.log(`📷 总计 ${allImages.length} 张图片`);
            
            let brokenImages = 0;
            let loadingImages = 0;
            let loadedImages = 0;
            
            allImages.forEach(img => {
                if (img.complete) {
                    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                        brokenImages++;
                    } else {
                        loadedImages++;
                    }
                } else {
                    loadingImages++;
                }
            });
            
            console.log(`✅ 已加载: ${loadedImages} | ⏳ 加载中: ${loadingImages} | ❌ 加载失败: ${brokenImages}`);
            
            // 检查已知失败资源
            const failedResources = window.globalState.resources.failedResources;
            if (failedResources.size > 0) {
                console.warn(`⚠️ ${failedResources.size} 个资源加载失败:`);
                console.log([...failedResources]);
            }
            
            console.groupEnd();
        },
        
        // 检查事件处理器
        checkEventHandlers: function() {
            console.group('4. 事件处理检查');
            
            // 检查滚动事件
            const container = document.getElementById('infinite-scroll-container');
            
            if (container) {
                // 使用getEventListeners需要Chrome开发者工具环境
                let scrollHandlerCount = 'Unknown';
                try {
                    // 尝试访问Chrome DevTools API获取事件监听器数量
                    if (typeof getEventListeners === 'function') {
                        const listeners = getEventListeners(container);
                        scrollHandlerCount = listeners.scroll ? listeners.scroll.length : 0;
                    }
                } catch (e) {
                    scrollHandlerCount = 'Unknown (仅在DevTools中可查询)';
                }
                
                console.log(`📜 无缝滚动容器滚动监听器: ${scrollHandlerCount}`);
            } else {
                console.warn('⚠️ 未找到无缝滚动容器，无法检查滚动事件');
            }
            
            // 检查MutationObserver状态
            if (StateSyncManager._observer) {
                console.log('✅ DOM变化观察器正在运行');
            } else {
                console.warn('⚠️ DOM变化观察器未运行');
            }
            
            console.groupEnd();
        },
        
        // 运行一个简单测试，修改一个元素状态并检查是否同步
        runSyncTest: function() {
            console.group('🧪 状态同步测试');
            
            // 生成一个随机测试ID
            const testId = 'sync_test_' + Math.floor(Math.random() * 10000);
            console.log(`ℹ️ 测试ID: ${testId}`);
            
            try {
                // 获取所有Container容器
                const containers = StateSyncManager.safeQuerySelectorAll('#infinite-scroll-container > .container');
                if (containers.length <= 1) {
                    console.warn('⚠️ 容器数量不足，无法测试同步');
                    console.groupEnd();
                    return '容器数量不足，无法测试同步';
                }
                
                // 选择第一个容器的智慧语录（如果有）或创建测试元素
                let testElements = [];
                
                // 首先尝试使用智慧语录
                const firstWisdom = containers[0].querySelector('.phoebe-quote-text');
                if (firstWisdom) {
                    testElements.push(firstWisdom);
                    
                    // 查找其他容器中对应元素
                    for (let i = 1; i < containers.length; i++) {
                        const wisdom = containers[i].querySelector('.phoebe-quote-text');
                        if (wisdom) {
                            testElements.push(wisdom);
                        }
                    }
                    
                    if (testElements.length > 1) {
                        // 记录原始内容
                        const originalText = testElements[0].textContent;
                        
                        // 修改第一个元素
                        const testText = `测试内容 [${testId}]`;
                        testElements[0].textContent = testText;
                        
                        // 触发状态同步
                        StateSyncManager.syncPhoebeWisdomState({
                            currentQuote: testText
                        });
                        
                        // 检查状态同步
                        setTimeout(() => {
                            console.log('测试同步结果:');
                            
                            let syncSuccess = true;
                            testElements.forEach((el, i) => {
                                const isSynced = el.textContent === testText;
                                console.log(`容器 ${i}: ${isSynced ? '✓' : '✗'}`);
                                if (!isSynced) syncSuccess = false;
                            });
                            
                            // 恢复原始内容
                            StateSyncManager.syncPhoebeWisdomState({
                                currentQuote: originalText
                            });
                            
                            if (syncSuccess) {
                                console.log('✅ 测试成功: 所有元素已同步');
                            } else {
                                console.error('❌ 测试失败: 部分元素未同步');
                            }
                            
                            console.groupEnd();
                        }, 500);
                        
                        return '测试中... 请查看控制台结果';
                    }
                }
                
                console.warn('⚠️ 未找到合适的测试元素');
                console.groupEnd();
                return '未找到合适的测试元素';
                
            } catch (error) {
                console.error('❌ 测试过程中出错:', error);
                console.groupEnd();
                return '测试过程中出错';
            }
        }
    }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        StateSyncManager.init();
    });
} else {
    StateSyncManager.init();
}

// Export for use in other scripts
window.StateSyncManager = StateSyncManager;

// 设置全局错误处理以捕获与状态同步相关的错误
window.addEventListener('error', function(event) {
    if (event.error && (
        event.error.message.includes('StateSyncManager') || 
        event.error.stack && event.error.stack.includes('state-sync.js')
    )) {
        console.error('🔴 [状态同步错误]', event.error);
        // 尝试恢复状态
        if (window.StateSyncManager) {
            window.StateSyncManager.log('尝试恢复状态同步', 'warn');
            setTimeout(() => {
                try {
                    // 重新初始化状态管理
                    window.StateSyncManager.init();
                } catch (e) {
                    console.error('🔴 无法恢复状态同步:', e);
                }
            }, 1000);
        }
        
        // 阻止错误冒泡
        event.preventDefault();
    }
});

// 暴露诊断接口给全局
window.checkInfiniteScrollSync = function() {
    return StateSyncManager.diagnostics.runFullDiagnosis();
};

window.testInfiniteScrollSync = function() {
    return StateSyncManager.diagnostics.runSyncTest();
};

// 在页面加载完成后显示友好提示
document.addEventListener('DOMContentLoaded', () => {
    console.info('ℹ️ 无缝滚动状态同步系统已启用');
    console.info('ℹ️ 使用 window.checkInfiniteScrollSync() 运行系统诊断');
    console.info('ℹ️ 使用 window.testInfiniteScrollSync() 测试状态同步');
});