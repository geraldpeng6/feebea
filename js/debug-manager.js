/**
 * Debug Manager Module
 * Handles debug panel, easter egg controls, and developer tools
 */

class DebugManager {
    constructor() {
        this.debugPanelVisible = false;
        this.debugPermission = false;
        this.debugPermissionGranted = false;
        
        // Morse code variables for debug permission
        this.morseSequence = [];
        this.currentMorseChar = [];
        this.morseTimer = null;
        this.pressStartTime = 0;
        this.targetMorseSequence = ['-.-.', '.----', '...--', '--...']; // C, 1, 3, 7
        this.morseProgress = 0;
        
        // Konami code variables
        this.konamiSequence = [];
        this.konamiTarget = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'KeyB', 'KeyA'];
        this.konamiTimer = null;
        
        // Debug permission sequence (Konami + PENG)
        this.debugSequence = [];
        this.debugTarget = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'KeyB', 'KeyA', 'KeyP', 'KeyE', 'KeyN', 'KeyG'];
        this.debugTimer = null;
        
        this.init();
    }

    init() {
        this.setupDebugPanel();
        this.setupKeyboardListeners();
        this.setupMorseCodeListener();
        this.exposeGlobalFunctions();
        
        console.log('🔧 Debug manager initialized');
    }

    setupDebugPanel() {
        const debugToggle = document.getElementById('debugToggle');
        const debugPanel = document.getElementById('debugPanel');
        
        if (debugToggle && debugPanel) {
            debugToggle.addEventListener('click', () => {
                this.toggleDebugPanel();
            });
            
            debugToggle.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.toggleDebugPanel();
            });
            
            // Setup debug control buttons
            this.setupDebugControls();
            
            // Update debug info periodically when visible
            setInterval(() => {
                if (this.debugPanelVisible) {
                    this.updateDebugInfo();
                }
            }, 2000);
        }
    }

    setupDebugControls() {
        // Quick set buttons
        const setCyberpunkBtn = document.getElementById('setCyberpunkBtn');
        const setRoseBtn = document.getElementById('setRoseBtn');
        const triggerRunawayBtn = document.getElementById('triggerRunawayBtn');
        const triggerJojoBtn = document.getElementById('triggerJojoBtn');
        
        if (setCyberpunkBtn) {
            setCyberpunkBtn.addEventListener('click', () => this.setCyberpunkContent());
        }
        
        if (setRoseBtn) {
            setRoseBtn.addEventListener('click', () => this.setRoseContent());
        }
        
        if (triggerRunawayBtn) {
            triggerRunawayBtn.addEventListener('click', () => this.triggerRunawayEffect());
        }
        
        if (triggerJojoBtn) {
            triggerJojoBtn.addEventListener('click', () => this.triggerJojoEffect());
        }
        
        // Easter egg toggle buttons
        this.setupEasterEggButtons();
        
        // Reset and trigger all buttons
        const resetAllBtn = document.getElementById('resetAllBtn');
        const triggerAllBtn = document.getElementById('triggerAllBtn');
        
        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => this.resetAllEasterEggs());
        }
        
        if (triggerAllBtn) {
            triggerAllBtn.addEventListener('click', () => this.triggerAllEasterEggs());
        }
    }

    setupEasterEggButtons() {
        // Setup individual easter egg toggle buttons
        const easterEggButtons = [
            { id: 'toggleLangBtn', type: 'langToggle' },
            { id: 'togglePengBtn', type: 'pengClick' },
            { id: 'toggleTributeBtn', type: 'tributeClick' },
            { id: 'togglePhoebeBtn', type: 'phoebeWisdom' },
            { id: 'toggleBossBtn', type: 'phoebeWisdomBoss' },
            { id: 'toggleEmailBtn', type: 'emailIcon' },
            { id: 'toggleWechatBtn', type: 'wechatIcon' }
        ];
        
        easterEggButtons.forEach(({ id, type }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this.toggleEasterEggState(type, button);
                });
            }
        });
        
        // Setup other easter egg buttons
        const otherEggButtons = [
            { id: 'toggleCyberpunkBtn', type: 'cyberpunk' },
            { id: 'toggleZoteBtn', type: 'zote' },
            { id: 'toggleZeldaBtn', type: 'zelda' },
            { id: 'toggleRunawayBtn', type: 'runaway' },
            { id: 'toggleSmellyCatBtn', type: 'smellyCat' },
            { id: 'toggleRoseBtn', type: 'roseQuote' }
        ];
        
        otherEggButtons.forEach(({ id, type }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this.toggleOtherEasterEgg(type, button);
                });
            }
        });
        
        // Update button states initially
        this.updateEasterEggButtonStates();
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }

    setupMorseCodeListener() {
        // Setup morse code input on Pickle Rick or other elements
        document.addEventListener('keydown', (e) => {
            this.handleMorseInput(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleMorseRelease(e);
        });
    }

    handleKeyboardInput(e) {
        const key = e.key.toLowerCase();
        
        // Handle Konami sequence
        this.konamiSequence.push(e.code);
        
        // Keep only last 12 keys for konami sequence
        if (this.konamiSequence.length > 12) {
            this.konamiSequence.shift();
        }
        
        // Clear konami timer if exists
        if (this.konamiTimer) {
            clearTimeout(this.konamiTimer);
        }
        
        // Set timer to reset konami sequence after 3 seconds of inactivity
        this.konamiTimer = setTimeout(() => {
            this.konamiSequence = [];
            console.log("🎮 Konami sequence reset due to timeout");
        }, 3000);
        
        // Handle Debug Permission sequence (Konami + PENG)
        this.debugSequence.push(e.code);
        
        // Keep only last 16 keys for debug sequence
        if (this.debugSequence.length > 16) {
            this.debugSequence.shift();
        }
        
        // Clear debug timer if exists
        if (this.debugTimer) {
            clearTimeout(this.debugTimer);
        }
        
        // Set timer to reset debug sequence after 3 seconds of inactivity
        this.debugTimer = setTimeout(() => {
            this.debugSequence = [];
            console.log("🔧 Debug sequence reset due to timeout");
        }, 3000);
        
        // Check if debug permission sequence matches
        if (this.debugSequence.length === this.debugTarget.length && !this.debugPermissionGranted) {
            if (JSON.stringify(this.debugSequence) === JSON.stringify(this.debugTarget)) {
                console.log("🔧 Debug Permission Code activated! Full debug access granted");
                this.grantDebugPermission("keyboard");
                return;
            }
        }
        
        // Check if konami sequence matches
        if (this.konamiSequence.length === this.konamiTarget.length) {
            if (JSON.stringify(this.konamiSequence) === JSON.stringify(this.konamiTarget)) {
                console.log("🎮 Konami Code activated! Debug panel shown (no permission)");
                this.showDebugPanel();
                this.konamiSequence = [];
            }
        }
    }

    handleMorseInput(e) {
        // Handle morse code input (space bar for morse)
        if (e.code === 'Space' && !e.repeat) {
            this.pressStartTime = Date.now();
        }
    }

    handleMorseRelease(e) {
        if (e.code === 'Space' && this.pressStartTime > 0) {
            const pressDuration = Date.now() - this.pressStartTime;
            this.pressStartTime = 0;
            
            // Determine if it's a dot or dash
            const morseChar = pressDuration < 200 ? '.' : '-';
            this.currentMorseChar.push(morseChar);
            
            console.log(`📡 Morse input: ${morseChar} (${pressDuration}ms)`);
            
            // Clear existing timer
            if (this.morseTimer) {
                clearTimeout(this.morseTimer);
            }
            
            // Set timer to process character after 500ms of inactivity
            this.morseTimer = setTimeout(() => {
                this.processMorseCharacter();
            }, 500);
        }
    }

    processMorseCharacter() {
        const morseChar = this.currentMorseChar.join('');
        console.log(`📡 Processing morse character: ${morseChar}`);
        
        // Check if it matches the expected character in sequence
        if (morseChar === this.targetMorseSequence[this.morseProgress]) {
            this.morseProgress++;
            console.log(`✅ Morse progress: ${this.morseProgress}/${this.targetMorseSequence.length}`);
            
            // Check if sequence is complete
            if (this.morseProgress >= this.targetMorseSequence.length) {
                console.log("🎉 Morse code sequence completed! Debug permission granted!");
                this.grantDebugPermission("morse");
                this.morseProgress = 0;
                this.morseSequence = [];
            }
        } else {
            // Reset sequence
            console.log(`❌ Wrong morse character. Expected: ${this.targetMorseSequence[this.morseProgress]}, Got: ${morseChar}`);
            this.morseProgress = 0;
            this.morseSequence = [];
        }
        
        // Clear current character
        this.currentMorseChar = [];
    }

    grantDebugPermission(method) {
        this.debugPermission = true;
        this.debugPermissionGranted = true;
        
        // Show debug panel and button
        this.showDebugPanel();
        
        const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
            ? `🔓 调试权限已获得！方式：${method === 'morse' ? '摩尔斯电码：C-1-3-7' : '键盘序列'}`
            : `🔓 Debug Permission Granted! Method: ${method === 'morse' ? 'Morse code: C-1-3-7' : 'Keyboard sequence'}`;
        
        if (window.showEasterEggNotification) {
            window.showEasterEggNotification(message);
        }
    }

    showDebugPanel() {
        const debugToggle = document.getElementById('debugToggle');
        const debugPanel = document.getElementById('debugPanel');
        
        // Show debug button
        if (debugToggle) {
            debugToggle.classList.add('show');
        }
        
        // Show debug panel
        if (!this.debugPanelVisible && debugPanel) {
            this.debugPanelVisible = true;
            debugPanel.classList.add('show');
            this.updateDebugInfo();
        }
    }

    toggleDebugPanel() {
        const debugPanel = document.getElementById('debugPanel');
        
        this.debugPanelVisible = !this.debugPanelVisible;
        
        if (this.debugPanelVisible && debugPanel) {
            debugPanel.classList.add('show');
            this.updateDebugInfo();
        } else if (debugPanel) {
            debugPanel.classList.remove('show');
        }
    }

    updateDebugInfo() {
        const quotesList = document.getElementById('quotesList');
        if (!quotesList) return;
        
        const currentCards = document.querySelectorAll(
            window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                ? "#chineseContent .essence-card"
                : "#englishContent .essence-card"
        );
        
        let html = '<h5>Current Quotes:</h5>';
        currentCards.forEach((card, index) => {
            const titleEl = card.querySelector('.essence-title');
            if (titleEl) {
                const title = titleEl.textContent.trim();
                html += `<div style="font-size: 0.6rem; margin: 0.1rem 0;">${index + 1}. ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}</div>`;
            }
        });
        
        quotesList.innerHTML = html;
    }

    // Debug control functions
    setCyberpunkContent() {
        if (!this.checkPermission()) return;
        
        console.log("🤖 Setting all cards to Cyberpunk content...");
        
        const targetText = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
            ? "你是个天生的边缘行者"
            : "You're a natural-born Edgerunner.";
        
        this.setAllCardsToText(targetText);
    }

    setRoseContent() {
        if (!this.checkPermission()) return;
        
        console.log("🌹 Setting all cards to Rose content...");
        
        const targetText = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
            ? "你知道，你驯服了我，我们彼此都需要对方。对我来说，你是世界上唯一的了；对你来说，我也是世界上唯一的了。"
            : "You know, you have tamed me, and we need each other. To me, you are unique in all the world; to you, I am unique in all the world.";
        
        this.setAllCardsToText(targetText);
    }

    setAllCardsToText(targetText) {
        const currentCards = document.querySelectorAll(
            window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                ? "#chineseContent .essence-card"
                : "#englishContent .essence-card"
        );
        
        currentCards.forEach(card => {
            const titleEl = card.querySelector('.essence-title');
            if (titleEl) {
                titleEl.textContent = targetText;
            }
        });
        
        this.updateDebugInfo();
    }

    triggerRunawayEffect() {
        if (!this.checkPermission()) return;
        
        console.log("🎹 Triggering Runaway effect directly...");
        
        if (window.addAudioToPlaylist) {
            const runawayAudioData = {
                name: "Runaway",
                src: "./phoebe/runaway1.mp3",
                type: "Debug Trigger"
            };
            window.addAudioToPlaylist(runawayAudioData);
        }
    }

    triggerJojoEffect() {
        if (!this.checkPermission()) return;
        
        console.log("🎵 Triggering JOJO effect directly...");
        
        if (window.navigationManager && window.navigationManager.triggerJojoEasterEgg) {
            window.navigationManager.triggerJojoEasterEgg();
        }
    }

    toggleEasterEggState(eggType, buttonElement) {
        if (!this.checkPermission()) return;
        
        if (window.easterEggTriggered) {
            window.easterEggTriggered[eggType] = !window.easterEggTriggered[eggType];
            this.updateButtonState(buttonElement, window.easterEggTriggered[eggType]);
            console.log(`🎯 Debug: ${eggType} easter egg ${window.easterEggTriggered[eggType] ? 'activated' : 'deactivated'}`);
        }
    }

    toggleOtherEasterEgg(eggType, buttonElement) {
        if (!this.checkPermission()) return;
        
        // Handle special easter eggs
        switch(eggType) {
            case 'cyberpunk':
                if (window.cyberpunkEasterEggTriggered !== undefined) {
                    window.cyberpunkEasterEggTriggered = !window.cyberpunkEasterEggTriggered;
                    this.updateButtonState(buttonElement, window.cyberpunkEasterEggTriggered);
                }
                break;
            case 'zote':
                if (window.zoteEasterEggTriggered !== undefined) {
                    window.zoteEasterEggTriggered = !window.zoteEasterEggTriggered;
                    this.updateButtonState(buttonElement, window.zoteEasterEggTriggered);
                }
                break;
            // Add other cases as needed
        }
        
        console.log(`🎯 Debug: ${eggType} easter egg toggled`);
    }

    resetAllEasterEggs() {
        if (!this.checkPermission()) return;
        
        // Reset all easter egg states
        if (window.easterEggTriggered) {
            Object.keys(window.easterEggTriggered).forEach(key => {
                window.easterEggTriggered[key] = false;
            });
        }
        
        // Reset other easter eggs
        if (window.cyberpunkEasterEggTriggered !== undefined) window.cyberpunkEasterEggTriggered = false;
        if (window.zoteEasterEggTriggered !== undefined) window.zoteEasterEggTriggered = false;
        if (window.zeldaEasterEggTriggered !== undefined) window.zeldaEasterEggTriggered = false;
        if (window.runawayEasterEggTriggered !== undefined) window.runawayEasterEggTriggered = false;
        if (window.smellyCatEasterEggTriggered !== undefined) window.smellyCatEasterEggTriggered = false;
        if (window.roseQuoteEasterEggTriggered !== undefined) window.roseQuoteEasterEggTriggered = false;
        
        this.updateEasterEggButtonStates();
        console.log('🔄 Debug: All easter eggs reset');
    }

    triggerAllEasterEggs() {
        if (!this.checkPermission()) return;
        
        // Trigger all easter egg states
        if (window.easterEggTriggered) {
            Object.keys(window.easterEggTriggered).forEach(key => {
                window.easterEggTriggered[key] = true;
            });
        }
        
        // Trigger other easter eggs
        if (window.cyberpunkEasterEggTriggered !== undefined) window.cyberpunkEasterEggTriggered = true;
        if (window.zoteEasterEggTriggered !== undefined) window.zoteEasterEggTriggered = true;
        if (window.zeldaEasterEggTriggered !== undefined) window.zeldaEasterEggTriggered = true;
        if (window.runawayEasterEggTriggered !== undefined) window.runawayEasterEggTriggered = true;
        if (window.smellyCatEasterEggTriggered !== undefined) window.smellyCatEasterEggTriggered = true;
        if (window.roseQuoteEasterEggTriggered !== undefined) window.roseQuoteEasterEggTriggered = true;
        
        this.updateEasterEggButtonStates();
        console.log('🎉 Debug: All easter eggs triggered');
    }

    updateButtonState(buttonElement, isActive) {
        if (buttonElement) {
            if (isActive) {
                buttonElement.classList.add('active');
            } else {
                buttonElement.classList.remove('active');
            }
        }
    }

    updateEasterEggButtonStates() {
        // Update all button states based on current easter egg states
        const buttons = [
            { id: 'toggleLangBtn', state: window.easterEggTriggered?.langToggle },
            { id: 'togglePengBtn', state: window.easterEggTriggered?.pengClick },
            { id: 'toggleTributeBtn', state: window.easterEggTriggered?.tributeClick },
            { id: 'togglePhoebeBtn', state: window.easterEggTriggered?.phoebeWisdom },
            { id: 'toggleBossBtn', state: window.easterEggTriggered?.phoebeWisdomBoss },
            { id: 'toggleEmailBtn', state: window.easterEggTriggered?.emailIcon },
            { id: 'toggleWechatBtn', state: window.easterEggTriggered?.wechatIcon },
            { id: 'toggleCyberpunkBtn', state: window.cyberpunkEasterEggTriggered },
            { id: 'toggleZoteBtn', state: window.zoteEasterEggTriggered },
            { id: 'toggleZeldaBtn', state: window.zeldaEasterEggTriggered },
            { id: 'toggleRunawayBtn', state: window.runawayEasterEggTriggered },
            { id: 'toggleSmellyCatBtn', state: window.smellyCatEasterEggTriggered },
            { id: 'toggleRoseBtn', state: window.roseQuoteEasterEggTriggered }
        ];
        
        buttons.forEach(({ id, state }) => {
            const button = document.getElementById(id);
            if (button) {
                this.updateButtonState(button, state);
            }
        });
    }

    checkPermission() {
        if (!this.debugPermission) {
            const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                ? "❌ 无权限！请先使用摩尔斯电码或键盘序列获取权限。"
                : "❌ No permission! Use Morse code or keyboard sequence first.";
            
            if (window.showEasterEggNotification) {
                window.showEasterEggNotification(message);
            }
            return false;
        }
        return true;
    }

    exposeGlobalFunctions() {
        // Expose functions for backward compatibility
        window.debugManager = this;
        window.debugPermission = this.debugPermission;
    }

    // Public API methods
    hasPermission() {
        return this.debugPermission;
    }

    isPanelVisible() {
        return this.debugPanelVisible;
    }
}

// Export for use in other modules
window.DebugManager = DebugManager;
