/**
 * Quote Manager Module
 * Handles quote display, navigation, and touch interactions
 */

class QuoteManager {
    constructor() {
        this.currentQuoteIndex = 8; // Start with Zima Blue quote
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.swipeThreshold = 50;
        
        // Quote data
        this.himymQuotes = {
            english: [
                {
                    text: "The future is scary but you can't just run back to the past because it's familiar.",
                    author: "Robin"
                },
                {
                    text: "Because sometimes even if you know how something's gonna end that doesn't mean you can't enjoy the ride.",
                    author: "Ted"
                },
                {
                    text: "That's life, you know, we never end up where you thought you wanted to be.",
                    author: "Marshall"
                },
                {
                    text: "We're going to get older whether we like it or not, so the only question is whether we get on with our lives, or desperately cling to the past.",
                    author: "Ted"
                },
                {
                    text: "Look, you can't design your life like a building. It doesn't work that way. You just have to live it… and it'll design itself.",
                    author: "Lily"
                },
                {
                    text: "I realized that I'm searching, searching for what I really want in life. And you know what? I have absolutely no idea what that is.",
                    author: "Barney"
                },
                {
                    text: "So really the biggest mistake would be not to make that mistake, because then you'll go your whole life not knowing if something was a mistake or not.",
                    author: "Lily"
                },
                {
                    text: "You can't cling to the past, because no matter how tightly you hold on, it's already gone.",
                    author: "Ted"
                },
                {
                    text: "My search for truth is finished at last. I'm going home.",
                    author: "Zima Blue"
                }
            ],
            chinese: [
                {
                    text: "未来虽然可怕，但你不能因为过去很熟悉很诱人而转身跑回去。",
                    author: "Robin"
                },
                {
                    text: "因为有时候，即使你知道事情的结果也不代表你不能享受这个过程。",
                    author: "Ted"
                },
                {
                    text: "这就是人生，永远不会尽如人意。",
                    author: "Marshall"
                },
                {
                    text: "不管我们喜欢与否，我们都将变老。所以唯一的问题是我们选择继续生活下去还是可怜兮兮的守着过去。",
                    author: "Ted"
                },
                {
                    text: "你不能想设计建筑那样去规划自己的人生。生活不需要草图，你只需融入其中，上天自有安排。",
                    author: "Lily"
                },
                {
                    text: "我意识到我在寻找，寻找我生活中真正想要的东西。但是我完全不知道自己想要什么。",
                    author: "Barney"
                },
                {
                    text: "人生中最大的错误就是不去犯错。因为如果你不去犯错，你一辈子都不会知道它到底是不是一个错误。",
                    author: "Lily"
                },
                {
                    text: "你不能对过去念念不忘，因为无论你把回忆抓得多紧，它早已消失。",
                    author: "Ted"
                },
                {
                    text: "我对真理的探寻终于结束了。我要回家了。",
                    author: "Zima Blue"
                }
            ]
        };

        this.init();
    }

    init() {
        this.setupQuoteInteractions();
        this.updateQuoteSection();
        this.adaptQuoteFontSize();
        
        // Expose global functions for backward compatibility
        window.updateQuoteSection = () => this.updateQuoteSection();
        window.nextQuote = () => this.nextQuote();
        window.previousQuote = () => this.previousQuote();
        window.adaptQuoteFontSize = () => this.adaptQuoteFontSize();
    }

    setupQuoteInteractions() {
        const quoteSections = document.querySelectorAll('.quote-section');
        
        quoteSections.forEach(section => {
            // Click handler
            section.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextQuote();
            });

            // Touch handlers
            section.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            }, { passive: true });

            section.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e);
            }, { passive: true });

            // Keyboard navigation
            section.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousQuote();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextQuote();
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.nextQuote();
                }
            });

            // Make focusable for keyboard navigation
            section.setAttribute('tabindex', '0');
            section.setAttribute('role', 'button');
            section.setAttribute('aria-label', 'Navigate quotes with arrow keys or click');
        });
    }

    getCurrentLanguage() {
        return window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    }

    updateQuoteSection() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        const quote = currentQuotes[this.currentQuoteIndex];
        
        // Get all quote sections
        const allQuoteSections = document.querySelectorAll('.quote-section');
        
        allQuoteSections.forEach(quoteSection => {
            const quoteText = quoteSection.querySelector('.quote-text');
            if (!quoteText) return;
            
            // Add fade out effect
            quoteSection.style.opacity = '0.3';
            quoteSection.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                quoteText.innerHTML = `"${quote.text}" <span class="quote-author">— ${quote.author}</span>`;
                
                // Adapt font size based on content length
                this.adaptQuoteFontSize();
                
                // Fade back in
                quoteSection.style.opacity = '1';
                quoteSection.style.transform = 'translateY(0)';
            }, 200);
        });
    }

    nextQuote() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % currentQuotes.length;
        this.updateQuoteSection();
    }

    previousQuote() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        this.currentQuoteIndex = (this.currentQuoteIndex - 1 + currentQuotes.length) % currentQuotes.length;
        this.updateQuoteSection();
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > this.swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - previous quote
                this.previousQuote();
            } else {
                // Swipe left - next quote
                this.nextQuote();
            }
        }
    }

    adaptQuoteFontSize() {
        const quoteTexts = document.querySelectorAll('.quote-text');
        
        quoteTexts.forEach(quoteText => {
            if (!quoteText) return;
            
            const textLength = quoteText.textContent.length;
            let fontSize;
            
            // Determine font size based on text length
            if (textLength <= 50) {
                fontSize = '1.4rem';
            } else if (textLength <= 100) {
                fontSize = '1.3rem';
            } else if (textLength <= 150) {
                fontSize = '1.2rem';
            } else if (textLength <= 200) {
                fontSize = '1.1rem';
            } else {
                fontSize = '1rem';
            }
            
            // Apply responsive scaling
            if (Utils.isMobile()) {
                const mobileSizes = {
                    '1.4rem': '1.2rem',
                    '1.3rem': '1.1rem',
                    '1.2rem': '1rem',
                    '1.1rem': '0.95rem',
                    '1rem': '0.9rem'
                };
                fontSize = mobileSizes[fontSize] || fontSize;
            }
            
            quoteText.style.fontSize = fontSize;
        });
    }

    // Public API methods
    getCurrentQuote() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        return currentQuotes[this.currentQuoteIndex];
    }

    setQuoteIndex(index) {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        
        if (index >= 0 && index < currentQuotes.length) {
            this.currentQuoteIndex = index;
            this.updateQuoteSection();
        }
    }

    getQuoteCount() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        return currentQuotes.length;
    }

    // Add new quote dynamically
    addQuote(englishQuote, chineseQuote) {
        if (englishQuote && englishQuote.text && englishQuote.author) {
            this.himymQuotes.english.push(englishQuote);
        }
        
        if (chineseQuote && chineseQuote.text && chineseQuote.author) {
            this.himymQuotes.chinese.push(chineseQuote);
        }
    }

    // Remove quote by index
    removeQuote(index) {
        if (index >= 0 && index < this.himymQuotes.english.length) {
            this.himymQuotes.english.splice(index, 1);
        }
        
        if (index >= 0 && index < this.himymQuotes.chinese.length) {
            this.himymQuotes.chinese.splice(index, 1);
        }
        
        // Adjust current index if necessary
        const isEnglish = this.getCurrentLanguage() === 'en';
        const currentQuotes = isEnglish ? this.himymQuotes.english : this.himymQuotes.chinese;
        
        if (this.currentQuoteIndex >= currentQuotes.length) {
            this.currentQuoteIndex = Math.max(0, currentQuotes.length - 1);
        }
        
        this.updateQuoteSection();
    }
}

// Export for use in other modules
window.QuoteManager = QuoteManager;
