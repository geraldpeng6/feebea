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
            return null;
        }
    },
    
    safeQuerySelectorAll: function(selector, parent = document) {
        try {
            return parent ? parent.querySelectorAll(selector) : [];
        } catch (error) {
            return [];
        }
    },
    
    // Log wrapper with level control
    log: function(message, level = 'info') {
        // 日志已禁用
        return;
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
            const wisdomSections = this.safeQuerySelectorAll('.phoebe-section');

            wisdomSections.forEach(section => {
                // 获取相关的DOM元素
                const title = this.safeQuerySelector('.phoebe-title', section);
                const quote = this.safeQuerySelector('.phoebe-quote', section);
                const author = this.safeQuerySelector('.phoebe-author', section);
                
                // 处理不同的模式
                if (zoteState.triggered) {
                    // 左特戒律模式 - 获取真实的戒律内容，支持中英文切换
                    const preceptNumber = zoteState.currentPrecept || 1;
                    const cycleCount = zoteState.cycleCount || 0;
                    const isEnglish = window.isEnglish;

                    // 获取戒律标题
                    const zoteTitle = this.getZoteTitle(cycleCount);
                    if (title) {
                        title.textContent = isEnglish ?
                            `${zoteTitle.en}'s Precepts` :
                            `${zoteTitle.zh}的戒律`;
                    }

                    // 获取戒律内容
                    const preceptContent = this.getZotePreceptContent(preceptNumber, isEnglish);
                    if (quote && preceptContent) {
                        const authorName = isEnglish ? zoteTitle.en : zoteTitle.zh;
                        quote.innerHTML = `"${preceptContent.title}<br><br>${preceptContent.content}" <br><br>- ${authorName}`;
                        quote.style.cursor = 'pointer';
                        // 设置点击事件来循环戒律
                        quote.onclick = () => {
                            if (typeof window.cycleZotePrecept === 'function') {
                                window.cycleZotePrecept();
                            }
                        };
                    }
                    if (author) {
                        author.textContent = isEnglish ? 'Zote the Mighty' : '强大的左特';
                    }
                } else if (dondaState.isActive) {
                    // Donda's Wisdom模式（仅英文）
                    if (title) title.textContent = "Donda's Wisdom";
                    if (quote) quote.textContent = dondaState.englishQuote || "… you got a lot of confidence that come off a little arrogant even though you're humble and everything –– but it be important to remember that the giant looks himself in the mirror and sees nothing…";
                    if (author) author.textContent = 'Donda West';
                } else {
                    // 正常Phoebe's Wisdom模式 - 支持双语显示
                    const isEnglish = window.isEnglish;

                    // 如果有自定义的状态内容，使用它
                    if (state.currentTitle || state.currentQuote || state.currentAuthor) {
                        if (title && state.currentTitle) {
                            title.textContent = isEnglish ? state.currentTitle : (state.currentTitleZh || state.currentTitle);
                        }
                        if (quote && state.currentQuote) {
                            quote.textContent = isEnglish ? state.currentQuote : (state.currentQuoteZh || state.currentQuote);
                        }
                        if (author && state.currentAuthor) {
                            author.textContent = isEnglish ? state.currentAuthor : (state.currentAuthorZh || state.currentAuthor);
                        }
                    } else {
                        // 否则使用默认的Phoebe语录（双语支持）
                        if (title) {
                            title.textContent = isEnglish ? "Phoebe's Wisdom" : "菲比的智慧";
                        }
                        if (quote) {
                            quote.textContent = isEnglish ? "NO, YOU ARE THE BOSS OF YOU!" : "你才是你自己的老板!";
                        }
                        if (author) {
                            author.textContent = isEnglish ? "Phoebe Buffay" : "菲比·布菲";
                        }
                    }
                }
            });
            
            this.log('Updated all Phoebe\'s Wisdom sections', 'debug');
        } catch (error) {
            this.log(`Error updating Phoebe's Wisdom sections: ${error.message}`, 'error');
        }
    },

    // Helper function to get Zote title based on cycle count
    getZoteTitle: function(cycleCount) {
        // 使用与index.html中getZoteTitle相同的逻辑
        if (typeof window.getZoteTitle === 'function') {
            return window.getZoteTitle(cycleCount);
        }

        // 如果无法访问全局函数，使用简化版本
        const titles = [
            { english: "Zote", chinese: "左特" },
            { english: "Terrifying, Beautiful, Powerful, Grey Prince Zote the Mighty", chinese: "可怕的，漂亮的，强大的灰色王子左特" },
            { english: "Gorgeous, Passionate, Terrifying, Beautiful, Powerful, Grey Prince Zote the Mighty", chinese: "华丽的，激情的，可怕的，漂亮的，强大的灰色王子左特" }
        ];

        const index = Math.min(cycleCount, titles.length - 1);
        return { en: titles[index].english, zh: titles[index].chinese };
    },

    // Helper function to get Zote precept content with language support
    getZotePreceptContent: function(preceptNumber, isEnglish = true) {
        // 从全局的zotePrecepts数组获取戒律内容
        if (typeof window.zotePrecepts !== 'undefined' && window.zotePrecepts) {
            const arrayIndex = preceptNumber - 1; // Convert to 0-based index
            if (arrayIndex >= 0 && arrayIndex < window.zotePrecepts.length) {
                const precept = window.zotePrecepts[arrayIndex];
                const lang = isEnglish ? 'en' : 'zh';
                return {
                    title: precept[lang].title,
                    content: precept[lang].content
                };
            }
        }

        // 如果无法获取到戒律数据，返回默认内容
        return {
            title: isEnglish ? `Precept ${preceptNumber}:` : `戒律 ${preceptNumber}:`,
            content: isEnglish ?
                "The wisdom of Zote the Mighty is beyond comprehension." :
                "强大的左特的智慧超越了理解。"
        };
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
    
    // 初始化meditation内容为中英文双语内容
    initializeMeditationContent: function() {
        try {
            // 设置原始的英文meditation内容
            const originalEnglishContent = `
                "Sometimes, it's difficult even for me<br />
                to understand what I've become.<br />
                And harder still to remember what I once was.<br />
                The blue of the tiles...<br />
                Zima Blue, the manufacturer called it.<br />
                The first thing I ever saw.<br />
                This was where I began.<br />
                A crude little machine with<br />
                barely enough intelligence to steer itself.<br />
                But it was my world.<br />
                It was all I knew, all I needed to know.<br />
                And now?<br />
                I will immerse myself.<br />
                And as I do, I will slowly shut down my higher brain functions...<br />
                un-making myself...<br />
                leaving just enough to appreciate my surroundings...<br />
                to extract some simple pleasure<br />
                from the execution of a task well done.<br />
                My search for truth is finished at last.<br />
                I'm going home."
            `;

            // 设置中文meditation内容
            const originalChineseContent = `
                "有时候，即使对我来说<br />
                也很难理解我变成了什么样子。<br />
                更难的是记起我曾经是什么样子。<br />
                瓷砖的蓝色...<br />
                制造商称之为齐马蓝。<br />
                这是我见过的第一样东西。<br />
                这就是我开始的地方。<br />
                一台粗糙的小机器<br />
                几乎没有足够的智能来控制自己。<br />
                但这就是我的世界。<br />
                这是我所知道的一切，我需要知道的一切。<br />
                而现在？<br />
                我将沉浸其中。<br />
                当我这样做时，我会慢慢关闭我的高级大脑功能...<br />
                解构我自己...<br />
                只留下足够的部分来欣赏我的周围环境...<br />
                从完成一项任务中<br />
                提取一些简单的快乐。<br />
                我对真相的探索终于结束了。<br />
                我要回家了。"
            `;

            // 初始化全局状态 - 中英文使用不同的内容
            window.globalState.meditation = {
                isRunawayMode: false,
                englishContent: originalEnglishContent,
                chineseContent: originalChineseContent
            };

            this.log('Meditation content initialized with bilingual content', 'info');
        } catch (error) {
            this.log(`Error initializing meditation content: ${error.message}`, 'error');
        }
    },

    // 更新所有冥想区域
    updateAllMeditations: function() {
        try {
            const state = window.globalState.meditation;
            const isEnglish = window.isEnglish;

            // 获取所有冥想文本元素（包括无限滚动中的所有实例）
            const allMeditations = this.safeQuerySelectorAll('.meditation-text');

            // 根据当前语言状态决定显示的内容
            const contentToShow = isEnglish ? state.englishContent : state.chineseContent;

            // 更新所有冥想文本元素
            if (contentToShow) {
                allMeditations.forEach((meditation, index) => {
                    meditation.innerHTML = contentToShow;
                    this.log(`Updated meditation text ${index + 1}`, 'debug');
                });
            }

            this.log(`Updated all meditation texts to ${isEnglish ? 'English' : 'Chinese'} content`, 'info');
        } catch (error) {
            this.log(`Error updating meditations: ${error.message}`, 'error');
        }
    },
    
    // 卡片彩蛋同步管理 - 解决彩蛋触发多卡片问题
    handleCardEasterEgg: function(cardIndex, cardType, triggerCondition) {
        try {
            // 频率限制检查，避免短时间内多次触发
            const now = Date.now();
            const timeSinceLastTrigger = now - window.globalState.easterEggs.lastTriggerTime;

            if (timeSinceLastTrigger < 500) {
                return false;
            }

            // 检查此卡片是否已经是彩蛋源
            const isSource = window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg === cardIndex;
            const currentSource = window.globalState.easterEggs.triggerSourceIndex.cardEasterEgg;

            // 检查触发条件
            const conditionResult = triggerCondition();

            // 对于玫瑰彩蛋，简化触发逻辑 - 只要条件满足就触发
            let shouldTrigger;
            if (cardType === 'rose') {
                shouldTrigger = conditionResult;
            } else {
                // 其他彩蛋使用原有逻辑
                shouldTrigger = conditionResult && (isSource || currentSource === -1);
            }

            if (shouldTrigger) {
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
    
    // 同步语言切换状态 - 确保所有内容都能正确切换语言
    syncLanguageState: function(isEnglish) {
        try {
            // 更新全局语言状态
            window.isEnglish = isEnglish;

            // 同步所有需要语言切换的内容
            this.scheduleBatchUpdate('languageSync', () => {
                // 更新所有Phoebe's Wisdom内容
                this.updateAllPhoebeWisdom();

                // 更新所有冥想文本
                this.updateAllMeditations();

                // 更新所有quote sections
                if (typeof window.updateQuoteSection === 'function') {
                    window.updateQuoteSection();
                }

                // 更新所有essence cards
                if (typeof window.updateAllEssenceCardsLanguage === 'function') {
                    window.updateAllEssenceCardsLanguage();
                }

                // 更新其他可能需要语言同步的内容
                this.updateLanguageDependentContent();

                // 统一适配所有字体大小，确保语言切换后字体大小一致
                if (this.fontManager) {
                    setTimeout(() => {
                        this.fontManager.adaptAllFontSizes();
                    }, 100); // 延迟执行，确保内容更新完成
                }
            });

            this.log(`Language state synced to: ${isEnglish ? 'English' : 'Chinese'}`, 'info');
        } catch (error) {
            this.log(`Error syncing language state: ${error.message}`, 'error');
        }
    },

    // 更新所有依赖语言的内容
    updateLanguageDependentContent: function() {
        try {
            const isEnglish = window.isEnglish;

            // 更新所有容器中的语言相关元素
            const containers = this.safeQuerySelectorAll('#infinite-scroll-container > .container');

            containers.forEach(container => {
                // 更新调试按钮文本
                const debugButtons = this.safeQuerySelectorAll('#debugButton, .debug-button', container);
                debugButtons.forEach(btn => {
                    if (btn) btn.textContent = isEnglish ? "Debug" : "调试";
                });

                // 更新复制提示文本
                const copyTexts = this.safeQuerySelectorAll('#copyText, .copy-text', container);
                copyTexts.forEach(text => {
                    if (text) text.textContent = isEnglish ? "Copied to clipboard" : "已复制到剪贴板";
                });

                // 更新其他可能的语言相关文本
                const languageElements = this.safeQuerySelectorAll('[data-en][data-zh]', container);
                languageElements.forEach(el => {
                    const enText = el.getAttribute('data-en');
                    const zhText = el.getAttribute('data-zh');
                    if (enText && zhText) {
                        el.textContent = isEnglish ? enText : zhText;
                    }
                });
            });

            this.log('Updated all language-dependent content', 'debug');
        } catch (error) {
            this.log(`Error updating language-dependent content: ${error.message}`, 'error');
        }
    },

    // 统一字体大小适配管理器
    fontManager: {
        // 统一的字体大小适配函数
        adaptAllFontSizes: function() {
            try {
                // 适配essence卡片字体
                this.adaptEssenceFontSizes();

                // 适配quote字体
                this.adaptQuoteFontSizes();

                StateSyncManager.log('All font sizes adapted', 'debug');
            } catch (error) {
                StateSyncManager.log(`Error adapting font sizes: ${error.message}`, 'error');
            }
        },

        // 适配essence卡片字体大小 - 已禁用，使用CSS固定字体大小
        adaptEssenceFontSizes: function() {
            // 不再执行任何字体调整，完全依赖CSS固定字体大小
            StateSyncManager.log('adaptEssenceFontSizes called but disabled - using fixed CSS font sizes', 'debug');
        },

        // 适配quote字体大小
        adaptQuoteFontSizes: function() {
            try {
                // 获取所有quote元素，不仅仅是当前可见的
                const allQuoteTexts = StateSyncManager.safeQuerySelectorAll('.quote-text');
                const allQuoteAuthors = StateSyncManager.safeQuerySelectorAll('.quote-author');
                const isMobile = window.innerWidth <= 768;
                const isSmallMobile = window.innerWidth <= 480;

                allQuoteTexts.forEach(quoteText => {
                    const textLength = quoteText.textContent.length;
                    let fontSize;

                    if (isSmallMobile) {
                        if (textLength <= 30) {
                            fontSize = "1rem";
                        } else if (textLength <= 60) {
                            fontSize = "0.9rem";
                        } else if (textLength <= 100) {
                            fontSize = "0.8rem";
                        } else if (textLength <= 150) {
                            fontSize = "0.7rem";
                        } else if (textLength <= 200) {
                            fontSize = "0.6rem";
                        } else {
                            fontSize = "0.55rem";
                        }
                    } else if (isMobile) {
                        if (textLength <= 30) {
                            fontSize = "1.1rem";
                        } else if (textLength <= 60) {
                            fontSize = "1rem";
                        } else if (textLength <= 100) {
                            fontSize = "0.9rem";
                        } else if (textLength <= 150) {
                            fontSize = "0.8rem";
                        } else if (textLength <= 200) {
                            fontSize = "0.7rem";
                        } else {
                            fontSize = "0.6rem";
                        }
                    } else {
                        // Desktop sizes
                        if (textLength <= 50) {
                            fontSize = "1.3rem";
                        } else if (textLength <= 100) {
                            fontSize = "1.1rem";
                        } else if (textLength <= 150) {
                            fontSize = "0.9rem";
                        } else if (textLength <= 200) {
                            fontSize = "0.8rem";
                        } else if (textLength <= 300) {
                            fontSize = "0.7rem";
                        } else {
                            fontSize = "0.6rem";
                        }
                    }

                    quoteText.style.fontSize = fontSize;
                });

                allQuoteAuthors.forEach(quoteAuthor => {
                    const authorLength = quoteAuthor.textContent.length;
                    let fontSize;

                    if (isSmallMobile) {
                        if (authorLength <= 10) {
                            fontSize = "0.7rem";
                        } else if (authorLength <= 20) {
                            fontSize = "0.6rem";
                        } else {
                            fontSize = "0.55rem";
                        }
                    } else if (isMobile) {
                        if (authorLength <= 10) {
                            fontSize = "0.75rem";
                        } else if (authorLength <= 20) {
                            fontSize = "0.7rem";
                        } else {
                            fontSize = "0.6rem";
                        }
                    } else {
                        // Desktop sizes
                        if (authorLength <= 10) {
                            fontSize = "1rem";
                        } else if (authorLength <= 20) {
                            fontSize = "0.9rem";
                        } else {
                            fontSize = "0.8rem";
                        }
                    }

                    quoteAuthor.style.fontSize = fontSize;
                });

                StateSyncManager.log('Quote font sizes adapted', 'debug');
            } catch (error) {
                StateSyncManager.log(`Error adapting quote font sizes: ${error.message}`, 'error');
            }
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
                        // 更新Phoebe's Wisdom内容（双语支持）
                        this.syncPhoebeWisdomState({
                            currentQuote: "Oh, I wish I could, but I don't want to.",
                            currentQuoteZh: "噢,我希望我能去帮忙,但我不想去."
                        });
                        break;

                    case 'phoebeWisdomBoss':
                        // 更新Phoebe's Wisdom Boss内容（双语支持）
                        this.syncPhoebeWisdomState({
                            currentQuote: "NO, YOU ARE THE BOSS OF YOU!",
                            currentQuoteZh: "你才是你自己的老板!"
                        });
                        break;

                    case 'langToggle':
                        // 语言切换彩蛋已在toggleLanguage函数中处理
                        break;

                    case 'essenceCard':
                        // 小王子essence卡片彩蛋 - 只有在cyberpunk彩蛋触发后才显示玫瑰引用
                        // 检查cyberpunk彩蛋是否已触发
                        const cyberpunkTriggered = window.globalState.easterEggs.triggers.cyberpunk ||
                                                 (typeof window.cyberpunkEasterEggTriggered !== 'undefined' && window.cyberpunkEasterEggTriggered);

                        if (cyberpunkTriggered) {
                            // cyberpunk彩蛋已触发，显示玫瑰引用
                            this.syncEssenceState({
                                easterEggTriggered: true,
                                easterEggContent: {
                                    title: "It is the time you have wasted for your rose that makes your rose so important",
                                    desc: "The Little Prince",
                                    titleChinese: "正是你为你的玫瑰花费的时光使你的玫瑰变得如此重要",
                                    descChinese: "小王子"
                                }
                            });
                        } else {
                            // cyberpunk彩蛋未触发，显示普通的小王子内容
                            this.syncEssenceState({
                                easterEggTriggered: true,
                                easterEggContent: {
                                    title: "What is essential is invisible to the eye",
                                    desc: "The Little Prince",
                                    titleChinese: "真正重要的东西是看不见的",
                                    descChinese: "小王子"
                                }
                            });
                        }
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

            // 初始化meditation内容为原始的双语内容
            this.initializeMeditationContent();
            this.updateAllMeditations();
            this.updateVirtualKeyboardUI();

            // 同步当前语言状态
            if (typeof window.isEnglish !== 'undefined') {
                this.syncLanguageState(window.isEnglish);
            }
            
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

                    // 同步当前语言状态到新容器
                    if (typeof window.isEnglish !== 'undefined') {
                        this.syncLanguageState(window.isEnglish);
                    }

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
            // 检查容器情况
            this.checkContainerStructure();

            // 检查状态同步情况
            this.checkStateSync();

            // 检查资源加载情况
            this.checkResourceLoading();

            // 检查事件处理器
            this.checkEventHandlers();

            return '诊断已完成';
        },
        
        // 检查容器结构
        checkContainerStructure: function() {
            const container = document.getElementById('infinite-scroll-container');
            if (!container) {
                return;
            }

            const childContainers = StateSyncManager.safeQuerySelectorAll('.container', container);

            // 检查容器大小一致性
            const heights = Array.from(childContainers).map(c => c.offsetHeight);
            const allSameHeight = heights.every((h, i, arr) => i === 0 || Math.abs(h - arr[0]) < 10);
            
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
                }
            });
        },
        
        // 检查状态同步
        checkStateSync: function() {
            // 检查智慧语录同步
            const wisdomSections = StateSyncManager.safeQuerySelectorAll('.phoebe-section');
            if (wisdomSections.length > 0) {
                const quotes = Array.from(wisdomSections).map(s => {
                    const text = StateSyncManager.safeQuerySelector('.phoebe-quote', s);
                    return text ? text.textContent : 'N/A';
                });

                const allSameQuote = quotes.every((q, i, arr) => i === 0 || q === arr[0]);
            }

            // 检查冥想文本同步
            const englishMeditations = StateSyncManager.safeQuerySelectorAll('#englishContent .meditation-text');
            if (englishMeditations.length > 0) {
                const meditationTexts = Array.from(englishMeditations).map(m => m.innerHTML);
                const allSameMeditation = meditationTexts.every((m, i, arr) => i === 0 || m === arr[0]);
            }
        },
        
        // 检查资源加载情况
        checkResourceLoading: function() {
            // 检查图片加载
            const allImages = document.querySelectorAll('img');

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

            // 检查已知失败资源
            const failedResources = window.globalState.resources.failedResources;
        },
        
        // 检查事件处理器
        checkEventHandlers: function() {
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
            }

            // 检查MutationObserver状态
            if (StateSyncManager._observer) {
                // DOM变化观察器正在运行
            } else {
                // DOM变化观察器未运行
            }
        },
        
        // 运行一个简单测试，修改一个元素状态并检查是否同步
        runSyncTest: function() {
            // 生成一个随机测试ID
            const testId = 'sync_test_' + Math.floor(Math.random() * 10000);

            try {
                // 获取所有Container容器
                const containers = StateSyncManager.safeQuerySelectorAll('#infinite-scroll-container > .container');
                if (containers.length <= 1) {
                    return '容器数量不足，无法测试同步';
                }
                
                // 选择第一个容器的智慧语录（如果有）或创建测试元素
                let testElements = [];
                
                // 首先尝试使用智慧语录
                const firstWisdom = containers[0].querySelector('.phoebe-section .phoebe-quote');
                if (firstWisdom) {
                    testElements.push(firstWisdom);

                    // 查找其他容器中对应元素
                    for (let i = 1; i < containers.length; i++) {
                        const wisdom = containers[i].querySelector('.phoebe-section .phoebe-quote');
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
                            let syncSuccess = true;
                            testElements.forEach((el, i) => {
                                const isSynced = el.textContent === testText;
                                if (!isSynced) syncSuccess = false;
                            });

                            // 恢复原始内容
                            StateSyncManager.syncPhoebeWisdomState({
                                currentQuote: originalText
                            });
                        }, 500);

                        return '测试中...';
                    }
                }

                return '未找到合适的测试元素';

            } catch (error) {
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
        // 尝试恢复状态
        if (window.StateSyncManager) {
            window.StateSyncManager.log('尝试恢复状态同步', 'warn');
            setTimeout(() => {
                try {
                    // 重新初始化状态管理
                    window.StateSyncManager.init();
                } catch (e) {
                    // 无法恢复状态同步
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
    // 标记StateSyncManager已准备好
    window.StateSyncManagerReady = true;
});