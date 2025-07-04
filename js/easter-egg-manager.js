/**
 * Easter Egg Manager Module
 * Handles all easter egg functionality and click tracking
 */

class EasterEggManager {
    constructor() {
        this.clickCounters = {
            langToggle: 0,
            pengClick: 0,
            tributeClick: 0,
            essenceCard: 0,
            phoebeWisdom: 0,
            phoebeWisdomBoss: 0,
            emailIcon: 0,
            wechatIcon: 0
        };

        this.easterEggTriggered = {
            langToggle: false,
            pengClick: false,
            tributeClick: false,
            essenceCard: false,
            phoebeWisdom: false,
            phoebeWisdomBoss: false,
            emailIcon: false,
            wechatIcon: false,
            cyberpunk: false,
            zote: false,
            roseQuote: false,
            zelda: false,
            runaway: false,
            smellyCat: false
        };

        this.easterEggTriggerCounts = {
            langToggle: 0,
            pengClick: 0,
            tributeClick: 0,
            essenceCard: 0,
            phoebeWisdom: 0,
            phoebeWisdomBoss: 0,
            phoebeKeyboard: 0,
            c137: 0,
            emailIcon: 0,
            wechatIcon: 0
        };

        this.clickTimers = {};
        this.triggerThreshold = 3;
        this.maxTriggers = 3;
        this.resetTimeout = 1000;

        // Special easter egg states
        this.cyberpunkEasterEggTriggered = false;
        this.zoteEasterEggTriggered = false;
        this.roseQuoteEasterEggTriggered = false;
        this.zeldaEasterEggTriggered = false;
        this.runawayEasterEggTriggered = false;
        this.smellyCatEasterEggTriggered = false;

        this.init();
    }

    init() {
        this.setupEasterEggElements();
        this.exposeGlobalVariables();
        
        // Expose global functions for backward compatibility
        window.handleEasterEgg = (eggType, audioFile, message) => 
            this.handleEasterEgg(eggType, audioFile, message);
        window.showEasterEggNotification = (message) => 
            this.showEasterEggNotification(message);
    }

    exposeGlobalVariables() {
        // Expose for backward compatibility
        window.clickCounters = this.clickCounters;
        window.easterEggTriggered = this.easterEggTriggered;
        window.easterEggTriggerCounts = this.easterEggTriggerCounts;
    }

    setupEasterEggElements() {
        // Setup tribute click easter egg
        this.setupTributeEasterEgg();

        // Setup Phoebe wisdom easter eggs
        this.setupPhoebeEasterEggs();

        // Setup final text easter egg
        this.setupFinalTextEasterEgg();

        // Setup contact icons easter eggs
        this.setupContactEasterEggs();
    }

    setupTributeEasterEgg() {
        const tributeElements = document.querySelectorAll('.tribute');

        tributeElements.forEach(tribute => {
            const handleTributeClick = (e) => {
                e.preventDefault();

                // Increment counter
                this.clickCounters.tributeClick++;

                // Sync state globally
                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('tributeClick', this.clickCounters.tributeClick);
                }

                console.log(`Tribute clicked, count: ${this.clickCounters.tributeClick}`);

                // Clear existing timer
                if (this.clickTimers.tributeClick) {
                    clearTimeout(this.clickTimers.tributeClick);
                }

                // Set timer to reset counter after timeout
                this.clickTimers.tributeClick = setTimeout(() => {
                    console.log("⏰ tributeClick counter reset to 0 (timeout)");
                    this.clickCounters.tributeClick = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('tributeClick', 0);
                    }
                }, this.resetTimeout);

                // Check if triple clicked
                if (this.clickCounters.tributeClick === this.triggerThreshold) {
                    // Check if this easter egg has reached its trigger limit
                    if (this.easterEggTriggerCounts.tributeClick >= this.maxTriggers) {
                        console.log(`tributeClick easter egg has reached maximum triggers (${this.maxTriggers}/${this.maxTriggers})`);
                        this.clickCounters.tributeClick = 0;

                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('tributeClick', 0);
                        }
                        return;
                    }

                    console.log("tributeClick easter egg triggered!");
                    this.easterEggTriggered.tributeClick = true;
                    this.easterEggTriggerCounts.tributeClick++;

                    // Play audio and show notification
                    if (window.playAudio) {
                        window.playAudio("tears.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "眼泪止不住地流..."
                        : "Tears I can't hold back...";
                    this.showEasterEggNotification(message);

                    // Reset counter
                    this.clickCounters.tributeClick = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('tributeClick', 0);
                    }
                }
            };

            tribute.addEventListener('click', handleTributeClick);
            tribute.addEventListener('touchend', handleTributeClick);
        });
    }

    setupPhoebeEasterEggs() {
        const phoebeTitles = document.querySelectorAll('.phoebe-title');
        const phoebeQuotes = document.querySelectorAll('.phoebe-quote');

        phoebeTitles.forEach(title => {
            const handlePhoebeWisdomClick = (e) => {
                e.preventDefault();

                this.clickCounters.phoebeWisdom++;

                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('phoebeWisdom', this.clickCounters.phoebeWisdom);
                }

                console.log(`Phoebe wisdom clicked, count: ${this.clickCounters.phoebeWisdom}`);

                if (this.clickTimers.phoebeWisdom) {
                    clearTimeout(this.clickTimers.phoebeWisdom);
                }

                this.clickTimers.phoebeWisdom = setTimeout(() => {
                    console.log("⏰ phoebeWisdom counter reset to 0 (timeout)");
                    this.clickCounters.phoebeWisdom = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('phoebeWisdom', 0);
                    }
                }, this.resetTimeout);

                if (this.clickCounters.phoebeWisdom === this.triggerThreshold) {
                    if (this.easterEggTriggerCounts.phoebeWisdom >= this.maxTriggers) {
                        console.log(`phoebeWisdom easter egg has reached maximum triggers (${this.maxTriggers}/${this.maxTriggers})`);
                        this.clickCounters.phoebeWisdom = 0;

                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('phoebeWisdom', 0);
                        }
                        return;
                    }

                    console.log("phoebeWisdom easter egg triggered!");
                    this.easterEggTriggered.phoebeWisdom = true;
                    this.easterEggTriggerCounts.phoebeWisdom++;

                    if (window.playAudio) {
                        window.playAudio("im-phoebe-buffay-hi.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "嗨，我是菲比·布菲！"
                        : "Hi, I'm Phoebe Buffay!";
                    this.showEasterEggNotification(message);

                    this.clickCounters.phoebeWisdom = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('phoebeWisdom', 0);
                    }
                }
            };

            title.addEventListener('click', handlePhoebeWisdomClick);
            title.addEventListener('touchend', handlePhoebeWisdomClick);
        });

        phoebeQuotes.forEach(quote => {
            const handlePhoebeBossClick = (e) => {
                e.preventDefault();

                this.clickCounters.phoebeWisdomBoss++;

                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('phoebeWisdomBoss', this.clickCounters.phoebeWisdomBoss);
                }

                console.log(`Phoebe boss clicked, count: ${this.clickCounters.phoebeWisdomBoss}`);

                if (this.clickTimers.phoebeWisdomBoss) {
                    clearTimeout(this.clickTimers.phoebeWisdomBoss);
                }

                this.clickTimers.phoebeWisdomBoss = setTimeout(() => {
                    console.log("⏰ phoebeWisdomBoss counter reset to 0 (timeout)");
                    this.clickCounters.phoebeWisdomBoss = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('phoebeWisdomBoss', 0);
                    }
                }, this.resetTimeout);

                if (this.clickCounters.phoebeWisdomBoss === this.triggerThreshold) {
                    if (this.easterEggTriggerCounts.phoebeWisdomBoss >= this.maxTriggers) {
                        console.log(`phoebeWisdomBoss easter egg has reached maximum triggers (${this.maxTriggers}/${this.maxTriggers})`);
                        this.clickCounters.phoebeWisdomBoss = 0;

                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('phoebeWisdomBoss', 0);
                        }
                        return;
                    }

                    console.log("phoebeWisdomBoss easter egg triggered!");
                    this.easterEggTriggered.phoebeWisdomBoss = true;
                    this.easterEggTriggerCounts.phoebeWisdomBoss++;

                    if (window.playAudio) {
                        window.playAudio("boss.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "你才是你自己的老板！"
                        : "You are the boss of you!";
                    this.showEasterEggNotification(message);

                    this.clickCounters.phoebeWisdomBoss = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('phoebeWisdomBoss', 0);
                    }
                }
            };

            quote.addEventListener('click', handlePhoebeBossClick);
            quote.addEventListener('touchend', handlePhoebeBossClick);
        });
    }

    setupFinalTextEasterEgg() {
        const finalTexts = document.querySelectorAll('.final-text');

        finalTexts.forEach(finalText => {
            const handlePengClick = (e) => {
                e.preventDefault();

                this.clickCounters.pengClick++;

                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('pengClick', this.clickCounters.pengClick);
                }

                console.log(`Peng clicked, count: ${this.clickCounters.pengClick}`);

                if (this.clickTimers.pengClick) {
                    clearTimeout(this.clickTimers.pengClick);
                }

                this.clickTimers.pengClick = setTimeout(() => {
                    console.log("⏰ pengClick counter reset to 0 (timeout)");
                    this.clickCounters.pengClick = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('pengClick', 0);
                    }
                }, this.resetTimeout);

                if (this.clickCounters.pengClick === this.triggerThreshold) {
                    if (this.easterEggTriggerCounts.pengClick >= this.maxTriggers) {
                        console.log(`pengClick easter egg has reached maximum triggers (${this.maxTriggers}/${this.maxTriggers})`);
                        this.clickCounters.pengClick = 0;

                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('pengClick', 0);
                        }
                        return;
                    }

                    console.log("pengClick easter egg triggered!");
                    this.easterEggTriggered.pengClick = true;
                    this.easterEggTriggerCounts.pengClick++;

                    if (window.playAudio) {
                        window.playAudio("computer.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "计算机科学家的浪漫"
                        : "A Computer Scientist's Romance";
                    this.showEasterEggNotification(message);

                    this.clickCounters.pengClick = 0;

                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('pengClick', 0);
                    }
                }
            };

            finalText.addEventListener('click', handlePengClick);
            finalText.addEventListener('touchend', handlePengClick);
        });
    }

    // Setup email and wechat icon easter eggs
    setupContactEasterEggs() {
        const emailIcons = document.querySelectorAll('.email-icon');
        const wechatIcons = document.querySelectorAll('.wechat-icon');

        emailIcons.forEach(icon => {
            const originalHandler = icon.onclick;

            const handleEmailClick = (e) => {
                // Execute original copy functionality
                if (originalHandler) {
                    originalHandler.call(icon, e);
                }

                this.clickCounters.emailIcon++;

                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('emailIcon', this.clickCounters.emailIcon);
                }

                console.log(`Email icon clicked, count: ${this.clickCounters.emailIcon}`);

                if (this.clickTimers.emailIcon) {
                    clearTimeout(this.clickTimers.emailIcon);
                }

                this.clickTimers.emailIcon = setTimeout(() => {
                    this.clickCounters.emailIcon = 0;
                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('emailIcon', 0);
                    }
                }, this.resetTimeout);

                if (this.clickCounters.emailIcon === this.triggerThreshold) {
                    if (this.easterEggTriggerCounts.emailIcon >= this.maxTriggers) {
                        this.clickCounters.emailIcon = 0;
                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('emailIcon', 0);
                        }
                        return;
                    }

                    this.easterEggTriggered.emailIcon = true;
                    this.easterEggTriggerCounts.emailIcon++;

                    if (window.playAudio) {
                        window.playAudio("email-notification.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "邮件已发送！"
                        : "Email sent!";
                    this.showEasterEggNotification(message);

                    this.clickCounters.emailIcon = 0;
                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('emailIcon', 0);
                    }
                }
            };

            icon.addEventListener('click', handleEmailClick);
        });

        wechatIcons.forEach(icon => {
            const originalHandler = icon.onclick;

            const handleWechatClick = (e) => {
                // Execute original copy functionality
                if (originalHandler) {
                    originalHandler.call(icon, e);
                }

                this.clickCounters.wechatIcon++;

                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('wechatIcon', this.clickCounters.wechatIcon);
                }

                console.log(`WeChat icon clicked, count: ${this.clickCounters.wechatIcon}`);

                if (this.clickTimers.wechatIcon) {
                    clearTimeout(this.clickTimers.wechatIcon);
                }

                this.clickTimers.wechatIcon = setTimeout(() => {
                    this.clickCounters.wechatIcon = 0;
                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('wechatIcon', 0);
                    }
                }, this.resetTimeout);

                if (this.clickCounters.wechatIcon === this.triggerThreshold) {
                    if (this.easterEggTriggerCounts.wechatIcon >= this.maxTriggers) {
                        this.clickCounters.wechatIcon = 0;
                        if (window.StateSyncManager) {
                            window.StateSyncManager.syncEasterEggState('wechatIcon', 0);
                        }
                        return;
                    }

                    this.easterEggTriggered.wechatIcon = true;
                    this.easterEggTriggerCounts.wechatIcon++;

                    if (window.playAudio) {
                        window.playAudio("wechat-notification.mp3");
                    }

                    const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "微信消息已发送！"
                        : "WeChat message sent!";
                    this.showEasterEggNotification(message);

                    this.clickCounters.wechatIcon = 0;
                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('wechatIcon', 0);
                    }
                }
            };

            icon.addEventListener('click', handleWechatClick);
        });
    }

    showEasterEggNotification(message) {
        console.log("🎉 Showing easter egg notification:", message);

        // Remove existing notification
        const existingNotification = document.getElementById('easterEggNotification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = Utils.createElement('div', {
            id: 'easterEggNotification',
            className: 'easter-egg-notification',
            style: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(254, 235, 234, 0.95);
                color: #333;
                padding: 1.5rem 2rem;
                border-radius: 15px;
                font-family: var(--font-primary);
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(254, 235, 234, 0.8);
                opacity: 0;
                animation: easterEggFadeIn 0.5s ease-out forwards;
                max-width: 80vw;
                word-wrap: break-word;
            `
        }, message);

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'easterEggFadeOut 0.5s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 3000);

        // Click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.style.animation = 'easterEggFadeOut 0.5s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        });
    }

    // Public API methods
    getClickCount(eggType) {
        return this.clickCounters[eggType] || 0;
    }

    getTriggerCount(eggType) {
        return this.easterEggTriggerCounts[eggType] || 0;
    }

    isTriggered(eggType) {
        return this.easterEggTriggered[eggType] || false;
    }

    resetEasterEgg(eggType) {
        this.clickCounters[eggType] = 0;
        this.easterEggTriggered[eggType] = false;
        
        if (this.clickTimers[eggType]) {
            clearTimeout(this.clickTimers[eggType]);
            delete this.clickTimers[eggType];
        }
        
        console.log(`🔄 Easter egg reset: ${eggType}`);
    }

    resetAllEasterEggs() {
        Object.keys(this.clickCounters).forEach(eggType => {
            this.resetEasterEgg(eggType);
        });
        
        // Reset trigger counts
        Object.keys(this.easterEggTriggerCounts).forEach(eggType => {
            this.easterEggTriggerCounts[eggType] = 0;
        });
        
        console.log("🔄 All easter eggs reset");
    }

    // Add new easter egg dynamically
    addEasterEgg(eggType, element, audioFile, message) {
        if (!element || !audioFile || !message) {
            console.warn("Invalid easter egg parameters");
            return;
        }

        // Initialize counters if not exists
        if (!(eggType in this.clickCounters)) {
            this.clickCounters[eggType] = 0;
            this.easterEggTriggered[eggType] = false;
            this.easterEggTriggerCounts[eggType] = 0;
        }

        // Add event listeners
        const handler = (e) => {
            e.preventDefault();
            this.handleEasterEgg(eggType, audioFile, message);
        };

        element.addEventListener('click', handler);
        element.addEventListener('touchend', handler);

        console.log(`🆕 Easter egg added: ${eggType}`);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes easterEggFadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes easterEggFadeOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.EasterEggManager = EasterEggManager;
