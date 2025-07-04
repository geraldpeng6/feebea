/**
 * Essence Manager Module
 * Handles essence cards and their quote changing functionality
 */

class EssenceManager {
    constructor() {
        this.currentQuotes = [0, 1, 2, 3]; // Track current quote index for each card
        
        // Quote data for essence cards
        this.quotes = {
            english: [
                {
                    title: "The night is dark and full of terrors",
                    desc: "Game of Thrones"
                },
                {
                    title: "I have a hangover. A hangover with a hangover",
                    desc: "Black Books"
                },
                {
                    title: "Life is a beautiful robe crawling with lice",
                    desc: "Zhang Ailing"
                },
                {
                    title: "Sometimes you have to run before you can walk",
                    desc: "Iron Man"
                },
                {
                    title: "Winter is coming",
                    desc: "Game of Thrones"
                },
                {
                    title: "I'm not great at the advice. Can I interest you in a sarcastic comment?",
                    desc: "Chandler Bing"
                },
                {
                    title: "The way I see it, every life is a pile of good things and bad things",
                    desc: "Doctor Who"
                },
                {
                    title: "We are all in the gutter, but some of us are looking at the stars",
                    desc: "Oscar Wilde"
                },
                {
                    title: "In the end, we will remember not the words of our enemies, but the silence of our friends",
                    desc: "Martin Luther King Jr."
                },
                {
                    title: "The only way to do great work is to love what you do",
                    desc: "Steve Jobs"
                }
            ],
            chinese: [
                {
                    title: "长夜漫漫，处处险恶",
                    desc: "权力的游戏"
                },
                {
                    title: "我宿醉了。比宿醉还醉的宿醉",
                    desc: "布莱克书店"
                },
                {
                    title: "人生是一袭华美的袍，爬满了虱子",
                    desc: "张爱玲"
                },
                {
                    title: "有时候你必须先跑起来，才能学会走路",
                    desc: "钢铁侠"
                },
                {
                    title: "凛冬将至",
                    desc: "权力的游戏"
                },
                {
                    title: "我不擅长给建议。要不要来点讽刺的评论？",
                    desc: "钱德勒·宾"
                },
                {
                    title: "在我看来，每个人的生活都是好事和坏事的堆积",
                    desc: "神秘博士"
                },
                {
                    title: "我们都在阴沟里，但仍有人仰望星空",
                    desc: "奥斯卡·王尔德"
                },
                {
                    title: "最终，我们记住的不是敌人的话语，而是朋友的沉默",
                    desc: "马丁·路德·金"
                },
                {
                    title: "成就伟大工作的唯一方法就是热爱你所做的事",
                    desc: "史蒂夫·乔布斯"
                }
            ]
        };

        this.init();
    }

    init() {
        this.setupEssenceCards();
        this.initializeRandomQuotes();
        
        // Expose global function for backward compatibility
        window.changeQuote = (cardIndex) => this.changeQuote(cardIndex);
    }

    setupEssenceCards() {
        const essenceCards = document.querySelectorAll('.essence-card');
        
        essenceCards.forEach((card, globalIndex) => {
            // Calculate card index (0-3) from global index
            const cardIndex = globalIndex % 4;
            
            const handleCardClick = (e) => {
                e.preventDefault();
                this.changeQuote(cardIndex);
            };

            card.addEventListener('click', handleCardClick);
            
            // Touch support
            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleCardClick(e);
            });

            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(e);
                }
            });

            // Make focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Change quote for card ${cardIndex + 1}`);
        });
    }

    getCurrentLanguage() {
        return window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    }

    changeQuote(cardIndex) {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
        
        let newQuoteIndex;
        do {
            newQuoteIndex = Math.floor(Math.random() * activeQuotes.length);
        } while (newQuoteIndex === this.currentQuotes[cardIndex]);

        this.currentQuotes[cardIndex] = newQuoteIndex;
        const quote = activeQuotes[newQuoteIndex];
        
        // Sync essence card state to global state
        if (window.StateSyncManager && window.StateSyncManager.syncEssenceState) {
            window.StateSyncManager.syncEssenceState({
                currentQuotes: [...this.currentQuotes],
                cardIndex: cardIndex,
                quoteIndex: newQuoteIndex,
                isEnglish: isEnglish
            });
        }

        // Update all cards with the same index (English and Chinese versions)
        this.updateCardContent(cardIndex, quote);
        
        console.log(`🔄 Card ${cardIndex} updated with quote ${newQuoteIndex}: "${quote.title}"`);
    }

    updateCardContent(cardIndex, quote) {
        const allCards = document.querySelectorAll('.essence-card');
        const targetCards = Array.from(allCards).filter((card, index) => index % 4 === cardIndex);
        
        targetCards.forEach(card => {
            const titleElement = card.querySelector('.essence-title');
            const descElement = card.querySelector('.essence-desc');
            
            if (titleElement && descElement) {
                // Add fade out effect
                card.style.opacity = '0.3';
                card.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    titleElement.textContent = quote.title;
                    descElement.textContent = quote.desc;
                    
                    // Adapt font sizes
                    this.adaptCardFontSizes(card);
                    
                    // Fade back in
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 200);
            }
        });
    }

    adaptCardFontSizes(card) {
        const titleElement = card.querySelector('.essence-title');
        const descElement = card.querySelector('.essence-desc');
        
        if (titleElement) {
            const textLength = titleElement.textContent.length;
            let fontSize;

            if (textLength <= 8) fontSize = '1.7rem';
            else if (textLength <= 12) fontSize = '1.5rem';
            else if (textLength <= 16) fontSize = '1.3rem';
            else if (textLength <= 20) fontSize = '1.2rem';
            else fontSize = '1.1rem';

            // Apply responsive scaling
            if (Utils.isMobile()) {
                const mobileSizes = {
                    '1.7rem': '1.3rem',
                    '1.5rem': '1.2rem',
                    '1.3rem': '1.1rem',
                    '1.2rem': '1rem',
                    '1.1rem': '0.9rem'
                };
                fontSize = mobileSizes[fontSize] || fontSize;
            }

            titleElement.style.fontSize = fontSize;
        }

        if (descElement) {
            const textLength = descElement.textContent.length;
            let fontSize;

            if (textLength <= 6) fontSize = '1.4rem';
            else if (textLength <= 10) fontSize = '1.3rem';
            else if (textLength <= 14) fontSize = '1.2rem';
            else fontSize = '1.1rem';

            // Apply responsive scaling
            if (Utils.isMobile()) {
                const mobileSizes = {
                    '1.4rem': '1.1rem',
                    '1.3rem': '1rem',
                    '1.2rem': '0.95rem',
                    '1.1rem': '0.9rem'
                };
                fontSize = mobileSizes[fontSize] || fontSize;
            }

            descElement.style.fontSize = fontSize;
        }
    }

    initializeRandomQuotes() {
        // Initialize with random quotes for each card
        for (let i = 0; i < 4; i++) {
            this.changeQuote(i);
        }
        console.log("🎲 Essence cards initialized with random quotes");
    }

    adaptAllCardFontSizes() {
        const allCards = document.querySelectorAll('.essence-card');
        allCards.forEach(card => {
            this.adaptCardFontSizes(card);
        });
    }

    // Public API methods
    getCurrentQuotes() {
        return [...this.currentQuotes];
    }

    setQuoteForCard(cardIndex, quoteIndex) {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
        
        if (cardIndex >= 0 && cardIndex < 4 && quoteIndex >= 0 && quoteIndex < activeQuotes.length) {
            this.currentQuotes[cardIndex] = quoteIndex;
            const quote = activeQuotes[quoteIndex];
            this.updateCardContent(cardIndex, quote);
        }
    }

    getQuoteForCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < 4) {
            const isEnglish = this.getCurrentLanguage() === 'en';
            const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
            const quoteIndex = this.currentQuotes[cardIndex];
            return activeQuotes[quoteIndex];
        }
        return null;
    }

    addQuote(englishQuote, chineseQuote) {
        if (englishQuote && englishQuote.title && englishQuote.desc) {
            this.quotes.english.push(englishQuote);
        }
        
        if (chineseQuote && chineseQuote.title && chineseQuote.desc) {
            this.quotes.chinese.push(chineseQuote);
        }
        
        console.log("📝 New quote added to essence cards");
    }

    removeQuote(index) {
        if (index >= 0 && index < this.quotes.english.length) {
            this.quotes.english.splice(index, 1);
        }
        
        if (index >= 0 && index < this.quotes.chinese.length) {
            this.quotes.chinese.splice(index, 1);
        }
        
        // Update current quotes if they reference removed quotes
        this.currentQuotes = this.currentQuotes.map(quoteIndex => {
            const isEnglish = this.getCurrentLanguage() === 'en';
            const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
            return quoteIndex >= activeQuotes.length ? 0 : quoteIndex;
        });
        
        console.log("🗑️ Quote removed from essence cards");
    }

    getQuoteCount() {
        const isEnglish = this.getCurrentLanguage() === 'en';
        const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
        return activeQuotes.length;
    }

    getAllQuotes() {
        return {
            english: [...this.quotes.english],
            chinese: [...this.quotes.chinese]
        };
    }

    // Refresh all cards when language changes
    refreshCards() {
        for (let i = 0; i < 4; i++) {
            const isEnglish = this.getCurrentLanguage() === 'en';
            const activeQuotes = isEnglish ? this.quotes.english : this.quotes.chinese;
            const quote = activeQuotes[this.currentQuotes[i]];
            if (quote) {
                this.updateCardContent(i, quote);
            }
        }
        console.log("🔄 All essence cards refreshed for language change");
    }
}

// Export for use in other modules
window.EssenceManager = EssenceManager;
