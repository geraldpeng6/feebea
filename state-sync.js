// State Synchronization Manager for Infinite Scroll
// This script ensures all states are synchronized across the three positions in infinite scroll

// Global state object to store all synchronized states
window.globalState = {
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
        }
    }
};

// State synchronization functions
const StateSyncManager = {
    // Sync quote state across all positions
    syncQuoteState: function(newState) {
        window.globalState.quote = { ...window.globalState.quote, ...newState };
        
        // Update all quote sections
        const allQuoteSections = document.querySelectorAll('.quote-section');
        allQuoteSections.forEach(section => {
            const quoteText = section.querySelector('.quote-text');
            const quoteAuthor = section.querySelector('.quote-author');
            
            if (quoteText && quoteAuthor) {
                // Update content based on current state
                this.updateQuoteContent(quoteText, quoteAuthor);
            }
        });
    },
    
    // Update quote content helper
    updateQuoteContent: function(quoteTextElement, quoteAuthorElement) {
        const state = window.globalState.quote;
        const currentLang = document.documentElement.lang || 'en';
        
        // Get current quotes based on section and language
        let quotes;
        if (state.currentSection === 'himym') {
            quotes = currentLang === 'zh' ? himymQuotes.zh : himymQuotes.en;
        }
        
        if (quotes && quotes[state.currentIndex]) {
            const quote = quotes[state.currentIndex];
            quoteTextElement.textContent = quote.text;
            quoteAuthorElement.textContent = quote.author;
        }
    },
    
    // Sync virtual keyboard state
    syncVirtualKeyboardState: function(newState) {
        window.globalState.virtualKeyboard = { ...window.globalState.virtualKeyboard, ...newState };
    },
    
    // Sync audio state
    syncAudioState: function(newState) {
        window.globalState.audio = { ...window.globalState.audio, ...newState };
    },
    
    // Sync color circle state
    syncColorCircleState: function(newState) {
        window.globalState.colorCircle = { ...window.globalState.colorCircle, ...newState };
    },
    
    // Sync easter egg states
    syncEasterEggState: function(eggType, count) {
        if (!window.globalState.easterEggs.clickCounters[eggType]) {
            window.globalState.easterEggs.clickCounters[eggType] = 0;
        }
        window.globalState.easterEggs.clickCounters[eggType] = count;
    },
    
    // Sync essence card state
    syncEssenceState: function(newState) {
        if (!window.globalState.essence) {
            window.globalState.essence = {};
        }
        window.globalState.essence = { ...window.globalState.essence, ...newState };
    },
    
    // Sync Zote easter egg state
    syncZoteState: function(newState) {
        if (!window.globalState.zote) {
            window.globalState.zote = {
                triggered: false,
                currentPrecept: 56,
                cycleCount: 0
            };
        }
        window.globalState.zote = { ...window.globalState.zote, ...newState };
    },
    
    // Sync Donda's wisdom state
    syncDondaWisdomState: function(newState) {
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
    },
    
    // Sync meditation state
    syncMeditationState: function(newState) {
        if (!window.globalState.meditation) {
            window.globalState.meditation = {
                isRunawayMode: false,
                englishContent: "",
                chineseContent: ""
            };
        }
        window.globalState.meditation = { ...window.globalState.meditation, ...newState };
    },
    
    // Initialize state synchronization
    init: function() {
        console.log('🔄 State Synchronization Manager initialized');
        
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
            window.globalState.easterEggs.clickCounters = { ...window.clickCounters };
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