/**
 * Main Application Module
 * Coordinates all components and manages application state
 */

class FeebeeApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.state = {
            currentQuoteIndex: 0,
            currentQuoteSection: 'himym',
            isEnglish: true
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Feebee App...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize state synchronization
            this.initializeStateSynchronization();
            
            // Setup responsive handlers
            this.setupResponsiveHandlers();
            
            // Initialize easter eggs
            this.initializeEasterEggs();
            
            this.isInitialized = true;
            console.log('✅ Feebee App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Feebee App:', error);
        }
    }

    async initializeComponents() {
        // Initialize language manager
        if (window.LanguageManager) {
            this.components.language = new window.LanguageManager();
        }

        // Initialize quote manager
        if (window.QuoteManager) {
            this.components.quotes = new window.QuoteManager();
        }

        // Initialize navigation
        if (window.NavigationManager) {
            this.components.navigation = new window.NavigationManager();
        }

        // Initialize audio manager
        if (window.AudioManager) {
            this.components.audio = new window.AudioManager();
        }

        // Initialize easter egg manager
        if (window.EasterEggManager) {
            this.components.easterEggs = new window.EasterEggManager();
        }

        // Initialize essence manager
        if (window.EssenceManager) {
            this.components.essence = new window.EssenceManager();
        }

        // Initialize special effects manager
        if (window.SpecialEffectsManager) {
            this.components.specialEffects = new window.SpecialEffectsManager();
        }

        // Initialize color circle
        this.initializeColorCircle();

        // Setup additional interactions
        this.setupAdditionalInteractions();
    }

    initializeColorCircle() {
        const colorCircle = document.querySelector('.color-circle');
        if (!colorCircle) return;

        let eventCount = 0;
        let processing = false;

        const handleColorCircleClick = Utils.throttle(async (event) => {
            if (processing) return;

            processing = true;
            eventCount++;

            console.log(`🎨 Color circle clicked, count: ${eventCount}`);

            // Sync state globally
            if (window.StateSyncManager) {
                window.StateSyncManager.syncColorCircleState({
                    eventCount,
                    processing: true
                });
            }

            try {
                // Add ripple effect
                this.createRippleEffect(event);

                // Handle special click counts with different easter eggs
                if (eventCount === 5) {
                    console.log("🟦 Triggering Zima squares easter egg");
                    await this.handleZimaSquaresEasterEgg();
                } else if (eventCount === 10) {
                    console.log("🌈 Triggering advanced color easter egg");
                    await this.handleAdvancedColorEasterEgg();
                } else if (eventCount === 15) {
                    console.log("🎵 Triggering random loser audio");
                    if (this.components.specialEffects) {
                        this.components.specialEffects.playRandomLoser();
                    }
                } else if (eventCount === 20) {
                    console.log("🌀 Triggering Rick Portal!");
                    if (this.components.specialEffects) {
                        this.components.specialEffects.triggerRickPortal();
                    }
                    eventCount = 0; // Reset after portal
                } else if (eventCount >= 25) {
                    // Reset counter after 25 clicks if portal wasn't triggered
                    eventCount = 0;
                }

            } finally {
                processing = false;
                if (window.StateSyncManager) {
                    window.StateSyncManager.syncColorCircleState({
                        eventCount,
                        processing: false
                    });
                }
            }
        }, 200);

        colorCircle.addEventListener('click', handleColorCircleClick);

        // Touch support
        if (Utils.isTouchDevice()) {
            colorCircle.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleColorCircleClick(e);
            });
        }
    }

    createRippleEffect(event) {
        const circle = event.currentTarget;
        const rect = circle.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = Utils.createElement('div', {
            className: 'ripple',
            style: `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `
        });

        circle.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    async handleZimaSquaresEasterEgg() {
        console.log('🟦 Zima squares easter egg triggered!');

        if (this.components.specialEffects) {
            this.components.specialEffects.createZimaSquares(10);
        }

        // Play Zima Blue audio
        if (window.playAudio) {
            window.playAudio("zima-blue.mp3");
        }
    }

    async handleAdvancedColorEasterEgg() {
        console.log('🌈 Advanced color easter egg triggered!');

        // Glow effect on color circle
        const colorCircle = document.querySelector('.color-circle');
        if (colorCircle) {
            colorCircle.style.animation = 'glow 2s ease-in-out infinite alternate';

            setTimeout(() => {
                colorCircle.style.animation = '';
            }, 4000);
        }

        // Play cyberpunk audio
        if (window.playAudio) {
            window.playAudio("cyberpunk.mp3");
        }

        // Show notification
        if (this.components.easterEggs) {
            this.components.easterEggs.showEasterEggNotification(
                window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                    ? "赛博朋克2077"
                    : "Cyberpunk 2077"
            );
        }
    }

    setupAdditionalInteractions() {
        // Setup code item click handlers for copying color codes
        this.setupColorCodeCopying();

        // Setup responsive font adaptation
        this.setupResponsiveFontAdaptation();

        // Initialize touch events for quotes
        this.initializeQuoteTouchEvents();
    }

    setupColorCodeCopying() {
        const codeItems = document.querySelectorAll('.code-item');

        codeItems.forEach(item => {
            item.addEventListener('click', () => {
                const text = item.textContent.trim();
                Utils.copyToClipboard(text);
            });

            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                const text = item.textContent.trim();
                Utils.copyToClipboard(text);
            });
        });
    }

    setupResponsiveFontAdaptation() {
        // Expose global function for backward compatibility
        window.adaptFontSizeResponsive = () => {
            if (this.components.essence) {
                this.components.essence.adaptAllCardFontSizes();
            }
        };
    }

    initializeQuoteTouchEvents() {
        // This is handled by QuoteManager, but we expose it globally for compatibility
        window.initializeQuoteTouchEvents = () => {
            if (this.components.quotes) {
                this.components.quotes.setupQuoteInteractions();
            }
        };
    }

    setupEventListeners() {
        // Contact icons
        const emailIcon = document.querySelector('.email-icon');
        const wechatIcon = document.querySelector('.wechat-icon');

        if (emailIcon) {
            emailIcon.addEventListener('click', () => {
                Utils.copyToClipboard(CONFIG.site.email);
            });
        }

        if (wechatIcon) {
            wechatIcon.addEventListener('click', () => {
                Utils.copyToClipboard(CONFIG.site.wechat);
            });
        }

        // Window resize handler
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Scroll handler for navigation
        window.addEventListener('scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 100));
    }

    initializeStateSynchronization() {
        if (window.StateSyncManager) {
            window.StateSyncManager.init();
        }
    }

    setupResponsiveHandlers() {
        // Font size adaptation
        this.adaptFontSizes();
        
        // Setup responsive quote handling
        this.setupResponsiveQuotes();
    }

    adaptFontSizes() {
        const adaptEssenceFonts = () => {
            const essenceTitles = document.querySelectorAll('.essence-title');
            const essenceDescs = document.querySelectorAll('.essence-desc');

            essenceTitles.forEach(title => {
                const textLength = title.textContent.length;
                let fontSize;

                if (textLength <= 8) fontSize = '1.7rem';
                else if (textLength <= 12) fontSize = '1.5rem';
                else if (textLength <= 16) fontSize = '1.3rem';
                else if (textLength <= 20) fontSize = '1.2rem';
                else fontSize = '1.1rem';

                title.style.fontSize = fontSize;
            });

            essenceDescs.forEach(desc => {
                const textLength = desc.textContent.length;
                let fontSize;

                if (textLength <= 6) fontSize = '1.4rem';
                else if (textLength <= 10) fontSize = '1.3rem';
                else if (textLength <= 14) fontSize = '1.2rem';
                else fontSize = '1.1rem';

                desc.style.fontSize = fontSize;
            });
        };

        // Initial adaptation
        adaptEssenceFonts();

        // Expose globally for backward compatibility
        window.adaptFontSizeResponsive = adaptEssenceFonts;
    }

    setupResponsiveQuotes() {
        // Quote font size adaptation will be handled by QuoteManager
        // This is a placeholder for any additional responsive quote setup
    }

    initializeEasterEggs() {
        // Initialize global easter egg variables for backward compatibility
        if (!window.clickCounters) {
            window.clickCounters = {
                langToggle: 0,
                pengClick: 0,
                tributeClick: 0,
                essenceCard: 0,
                phoebeWisdom: 0,
                phoebeWisdomBoss: 0,
                emailIcon: 0,
                wechatIcon: 0
            };
        }

        if (!window.easterEggTriggered) {
            window.easterEggTriggered = {
                cyberpunk: false,
                zote: false,
                roseQuote: false,
                dondaWisdom: false,
                phoebeWisdom: false,
                phoebeWisdomBoss: false,
                langToggle: false
            };
        }

        if (!window.easterEggTriggerCounts) {
            window.easterEggTriggerCounts = {
                langToggle: 0,
                phoebeWisdom: 0,
                phoebeWisdomBoss: 0
            };
        }
    }

    handleResize() {
        // Re-adapt font sizes on resize
        if (window.adaptFontSizeResponsive) {
            window.adaptFontSizeResponsive();
        }
        
        // Re-adapt quote font sizes
        if (window.adaptQuoteFontSize) {
            window.adaptQuoteFontSize();
        }
    }

    handleScroll() {
        // Update navigation active states
        if (this.components.navigation && this.components.navigation.updateActiveSection) {
            this.components.navigation.updateActiveSection();
        }
    }

    // Public API methods
    getState() {
        return { ...this.state };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    getComponent(name) {
        return this.components[name];
    }
}

// Initialize the application
window.FeebeeApp = FeebeeApp;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new FeebeeApp();
    });
} else {
    window.app = new FeebeeApp();
}
