/**
 * Language Toggle Module
 * Handles switching between English and Chinese content
 */

class LanguageManager {
    constructor() {
        this.isEnglish = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLanguage();
            });

            // Touch support
            langToggle.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.toggleLanguage();
            });
        }
    }

    toggleLanguage() {
        // Handle cumulative click easter egg
        if (window.clickCounters) {
            window.clickCounters.langToggle++;
            
            // Sync language toggle state globally
            if (window.StateSyncManager) {
                window.StateSyncManager.syncEasterEggState('langToggle', window.clickCounters.langToggle);
            }
            
            console.log(`Language toggle clicked, cumulative count: ${window.clickCounters.langToggle}`);
            console.log("Current language:", this.isEnglish ? "English" : "Chinese");
            
            if (window.clickCounters.langToggle === 3) {
                // Check if this easter egg has reached its trigger limit (3 times)
                if (window.easterEggTriggerCounts && window.easterEggTriggerCounts.langToggle >= 3) {
                    console.log("Language toggle easter egg has reached maximum triggers (3/3)");
                    window.clickCounters.langToggle = 0;
                    
                    // Sync reset state globally
                    if (window.StateSyncManager) {
                        window.StateSyncManager.syncEasterEggState('langToggle', 0);
                    }
                    return;
                }
                
                console.log("Language toggle easter egg triggered!");
                if (window.easterEggTriggered) {
                    window.easterEggTriggered.langToggle = true;
                }
                if (window.easterEggTriggerCounts) {
                    window.easterEggTriggerCounts.langToggle++;
                }
                
                setTimeout(() => {
                    console.log("About to play they-dont-know.mp3");
                    if (window.playAudio) {
                        window.playAudio("they-dont-know.mp3");
                    }
                    if (window.showEasterEggNotification) {
                        window.showEasterEggNotification(
                            this.isEnglish
                                ? "They Don't Know That We Know They Know We Know."
                                : "他们不知道我们知道他们知道我们知道。"
                        );
                    }
                }, 500);
                
                window.clickCounters.langToggle = 0; // Reset counter after triggering
                
                // Sync reset state globally
                if (window.StateSyncManager) {
                    window.StateSyncManager.syncEasterEggState('langToggle', 0);
                }
            }
        }

        this.switchLanguage();
        this.updateUI();
        this.updateContent();
    }

    switchLanguage() {
        this.isEnglish = !this.isEnglish;
        
        const body = document.body;
        if (this.isEnglish) {
            body.classList.remove('chinese');
        } else {
            body.classList.add('chinese');
        }
    }

    updateUI() {
        const langChinese = document.getElementById('langChinese');
        const langEnglish = document.getElementById('langEnglish');
        const copyText = document.getElementById('copyText');
        const debugButton = document.getElementById('debugButton');

        if (!langChinese || !langEnglish) return;

        if (this.isEnglish) {
            langEnglish.classList.add('active');
            langEnglish.classList.remove('inactive');
            langChinese.classList.add('inactive');
            langChinese.classList.remove('active');
            
            if (debugButton) debugButton.textContent = "Debug";
            if (copyText) copyText.textContent = "Copied to clipboard";
        } else {
            langChinese.classList.add('active');
            langChinese.classList.remove('inactive');
            langEnglish.classList.add('inactive');
            langEnglish.classList.remove('active');
            
            if (debugButton) debugButton.textContent = "调试";
            if (copyText) copyText.textContent = "已复制到剪贴板";
        }
    }

    updateContent() {
        const englishContent = document.getElementById('englishContent');
        const chineseContent = document.getElementById('chineseContent');

        if (!englishContent || !chineseContent) return;

        if (this.isEnglish) {
            englishContent.classList.remove('hidden');
            chineseContent.classList.add('hidden');
        } else {
            englishContent.classList.add('hidden');
            chineseContent.classList.remove('hidden');
        }

        // Re-adapt font sizes and update content after language change
        setTimeout(() => {
            // Update quote section content for new language
            if (window.app && window.app.components.quotes) {
                window.app.components.quotes.updateQuoteSection();
                window.app.components.quotes.adaptQuoteFontSize();
            }

            // Refresh essence cards for new language
            if (window.app && window.app.components.essence) {
                window.app.components.essence.refreshCards();
            }

            // Re-adapt font sizes
            if (window.adaptFontSizeResponsive) {
                window.adaptFontSizeResponsive();
            }

            // Legacy compatibility
            if (window.adaptQuoteFontSize) {
                window.adaptQuoteFontSize();
            }
            if (window.updateQuoteSection) {
                window.updateQuoteSection();
            }
            if (window.initializeQuoteTouchEvents) {
                window.initializeQuoteTouchEvents();
            }
        }, 100);
    }

    getCurrentLanguage() {
        return this.isEnglish ? 'en' : 'zh';
    }

    setLanguage(lang) {
        const shouldBeEnglish = lang === 'en';
        if (this.isEnglish !== shouldBeEnglish) {
            this.toggleLanguage();
        }
    }
}

// Export for use in other modules
window.LanguageManager = LanguageManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.languageManager = new LanguageManager();
    });
} else {
    window.languageManager = new LanguageManager();
}
