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
            cyberpunk: false,
            zote: false,
            roseQuote: false,
            dondaWisdom: false,
            phoebeWisdom: false,
            phoebeWisdomBoss: false,
            langToggle: false
        };

        this.easterEggTriggerCounts = {
            langToggle: 0,
            phoebeWisdom: 0,
            phoebeWisdomBoss: 0
        };

        this.clickTimers = {};
        this.triggerThreshold = 3;
        this.maxTriggers = 3;
        this.resetTimeout = 1000;

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
    }

    setupTributeEasterEgg() {
        const tributeElements = document.querySelectorAll('.tribute');
        
        tributeElements.forEach(tribute => {
            tribute.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'tributeClick',
                    'tears.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh' 
                        ? "眼泪止不住地流..." 
                        : "Tears I can't hold back..."
                );
            });

            tribute.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'tributeClick',
                    'tears.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh' 
                        ? "眼泪止不住地流..." 
                        : "Tears I can't hold back..."
                );
            });
        });
    }

    setupPhoebeEasterEggs() {
        const phoebeTitles = document.querySelectorAll('.phoebe-title');
        const phoebeQuotes = document.querySelectorAll('.phoebe-quote');

        phoebeTitles.forEach(title => {
            title.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'phoebeWisdom',
                    'im-phoebe-buffay-hi.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "嗨，我是菲比·布菲！"
                        : "Hi, I'm Phoebe Buffay!"
                );
            });
        });

        phoebeQuotes.forEach(quote => {
            quote.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'phoebeWisdomBoss',
                    'boss.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "你才是你自己的老板！"
                        : "You are the boss of you!"
                );
            });
        });
    }

    setupFinalTextEasterEgg() {
        const finalTexts = document.querySelectorAll('.final-text');
        
        finalTexts.forEach(finalText => {
            finalText.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'pengClick',
                    'computer.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "计算机科学家的浪漫"
                        : "A Computer Scientist's Romance"
                );
            });

            finalText.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleEasterEgg(
                    'pengClick',
                    'computer.mp3',
                    window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                        ? "计算机科学家的浪漫"
                        : "A Computer Scientist's Romance"
                );
            });
        });
    }

    handleEasterEgg(eggType, audioFile, message) {
        console.log(`🥚 Easter egg triggered: ${eggType}`);
        
        // Increment click counter
        this.clickCounters[eggType]++;
        
        // Sync state globally
        if (window.StateSyncManager) {
            window.StateSyncManager.syncEasterEggState(eggType, this.clickCounters[eggType]);
        }

        console.log(`${eggType} clicked, count: ${this.clickCounters[eggType]}`);

        // Clear existing timer
        if (this.clickTimers[eggType]) {
            clearTimeout(this.clickTimers[eggType]);
        }

        // Set timer to reset counter after timeout
        this.clickTimers[eggType] = setTimeout(() => {
            console.log(`⏰ ${eggType} counter reset to 0 (timeout)`);
            this.clickCounters[eggType] = 0;
            
            // Sync reset state globally
            if (window.StateSyncManager) {
                window.StateSyncManager.syncEasterEggState(eggType, 0);
            }
        }, this.resetTimeout);

        // Check if triple clicked
        if (this.clickCounters[eggType] === this.triggerThreshold) {
            // Check if this easter egg has reached its trigger limit
            if (this.easterEggTriggerCounts[eggType] >= this.maxTriggers) {
                console.log(`${eggType} easter egg has reached maximum triggers (${this.maxTriggers}/${this.maxTriggers})`);
                this.clickCounters[eggType] = 0;
                
                // Sync reset state globally
                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState(eggType, 0);
                }
                return;
            }
            
            console.log(`${eggType} easter egg triggered! (${this.easterEggTriggerCounts[eggType] + 1}/${this.maxTriggers})`);
            this.easterEggTriggered[eggType] = true;
            this.easterEggTriggerCounts[eggType]++;
            
            // Trigger easter egg effects
            console.log(`Playing audio: ${audioFile}`);
            if (window.playAudio) {
                window.playAudio(audioFile);
            }
            this.showEasterEggNotification(message);
            
            // Reset click counter
            this.clickCounters[eggType] = 0;
            
            // Sync reset and trigger state globally
            if (window.StateSyncManager) {
                window.StateSyncManager.syncEasterEggState(eggType, 0);
                
                if (window.StateSyncManager.checkEasterEggTrigger) {
                    window.StateSyncManager.checkEasterEggTrigger(eggType, this.triggerThreshold);
                }
            }
        }
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
