/**
 * Navigation Manager Module
 * Handles navigation dots, back-to-top functionality, and special navigation logic
 */

class NavigationManager {
    constructor() {
        this.navDots = [];
        this.backToTopBtn = null;
        this.sections = ['header', 'color-display', 'quote-section', 'meditation', 'essence', 'phoebe-section'];
        this.currentActiveSection = null;
        this.infiniteScrollManager = null;
        
        // Meditation click tracker for JOJO easter egg (4th dot)
        this.meditationClickTracker = {
            clicks: [],
            requiredClicks: 4,
            delayTime: 2000, // 2 seconds
            delayTimer: null,
            isJojoPlaying: false
        };
        
        this.init();
    }

    init() {
        this.setupNavigationDots();
        this.setupBackToTop();
        this.bindEvents();
        this.updateActiveSection();
        
        // Get reference to infinite scroll manager
        setTimeout(() => {
            this.infiniteScrollManager = window.infiniteScrollManager;
        }, 100);
        
        console.log('🧭 Navigation manager initialized');
    }

    setupNavigationDots() {
        this.navDots = Array.from(document.querySelectorAll('.nav-dot'));
        
        this.navDots.forEach((dot, index) => {
            const sectionId = dot.getAttribute('data-section');
            if (sectionId) {
                // Add click event
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNavDotClick(sectionId, index);
                });
                
                // Add touch event for mobile
                dot.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleNavDotClick(sectionId, index);
                });
                
                // Add keyboard support
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleNavDotClick(sectionId, index);
                    }
                });
                
                // Make focusable
                dot.setAttribute('tabindex', '0');
            }
        });
        
        console.log(`🎯 Setup ${this.navDots.length} navigation dots`);
    }

    handleNavDotClick(sectionId, index) {
        // Special handling for meditation dot (4th dot, index 3)
        if (sectionId === 'meditation') {
            this.handleMeditationClick();
        } else {
            this.scrollToSection(sectionId);
        }
    }

    handleMeditationClick() {
        const now = Date.now();
        this.meditationClickTracker.clicks.push(now);
        
        console.log(`🧘 Meditation dot clicked, count: ${this.meditationClickTracker.clicks.length}`);
        
        // Remove clicks older than delayTime
        this.meditationClickTracker.clicks = this.meditationClickTracker.clicks.filter(
            clickTime => now - clickTime <= this.meditationClickTracker.delayTime
        );
        
        // Clear existing timer
        if (this.meditationClickTracker.delayTimer) {
            clearTimeout(this.meditationClickTracker.delayTimer);
            this.meditationClickTracker.delayTimer = null;
        }
        
        // Check if we have exactly 4 clicks within the time window
        if (this.meditationClickTracker.clicks.length === this.meditationClickTracker.requiredClicks) {
            console.log('🎵 4 clicks detected! Triggering JOJO easter egg');
            this.triggerJojoEasterEgg();
            
            // Reset clicks
            this.meditationClickTracker.clicks = [];
        } else if (this.meditationClickTracker.clicks.length > this.meditationClickTracker.requiredClicks) {
            // Reset if more than 4 clicks
            this.meditationClickTracker.clicks = [];
            console.log('Too many clicks, resetting meditation click tracker');
        } else {
            // Set timer to reset clicks and scroll normally if no more clicks
            this.meditationClickTracker.delayTimer = setTimeout(() => {
                console.log('🧘 Meditation click timer expired, scrolling to section');
                this.scrollToSection('meditation');
                this.meditationClickTracker.clicks = [];
                this.meditationClickTracker.delayTimer = null;
            }, this.meditationClickTracker.delayTime);
        }
    }

    triggerJojoEasterEgg() {
        this.meditationClickTracker.isJojoPlaying = true;
        
        // Add JOJO audio to playlist
        const jojoAudioData = {
            name: "JOJO's Bizarre Adventure",
            src: "./phoebe/jojo.mp3",
            type: "Easter Egg"
        };
        
        try {
            if (window.addAudioToPlaylist) {
                window.addAudioToPlaylist(jojoAudioData);
                console.log('🎵 JOJO audio added to playlist');
            }
            
            // Show notification
            if (window.showEasterEggNotification) {
                const message = window.languageManager && window.languageManager.getCurrentLanguage() === 'zh'
                    ? "🎵 JOJO的奇妙冒险！"
                    : "🎵 JOJO's Bizarre Adventure!";
                window.showEasterEggNotification(message);
            }
            
            // Setup JOJO text effects
            this.setupJojoTextEffects();
            
        } catch (error) {
            console.error('Failed to trigger JOJO easter egg:', error);
        }
    }

    setupJojoTextEffects() {
        // Get audio element and setup time-based text effects
        const audioElement = document.getElementById('cyberpunkAudio');
        if (!audioElement) return;
        
        let firstJojoTextTriggered = false;
        let secondJojoTextTriggered = false;
        
        const timeUpdateHandler = () => {
            // Only trigger JOJO text effects when actually playing jojo.mp3
            const currentAudio = window.audioPlaylist && window.audioPlaylist[window.currentAudioIndex];
            if (currentAudio && currentAudio.src === "./phoebe/jojo.mp3") {
                // First display at 18.5 seconds
                if (!firstJojoTextTriggered && audioElement.currentTime >= 18.5) {
                    firstJojoTextTriggered = true;
                    this.showJojoTextEffects();
                }
                // Second display at 25.5 seconds
                if (!secondJojoTextTriggered && audioElement.currentTime >= 25.5) {
                    secondJojoTextTriggered = true;
                    this.showJojoTextEffects();
                }
            }
        };
        
        const endedHandler = () => {
            this.meditationClickTracker.isJojoPlaying = false;
            firstJojoTextTriggered = false;
            secondJojoTextTriggered = false;
            audioElement.removeEventListener('timeupdate', timeUpdateHandler);
            audioElement.removeEventListener('ended', endedHandler);
        };
        
        audioElement.addEventListener('timeupdate', timeUpdateHandler);
        audioElement.addEventListener('ended', endedHandler);
    }

    showJojoTextEffects() {
        // Create JOJO text overlay
        const jojoOverlay = Utils.createElement('div', {
            className: 'jojo-text-overlay',
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
                background-size: 400% 400%;
                animation: jojoGradient 2s ease infinite;
                z-index: 15000;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            `
        });
        
        const jojoText = Utils.createElement('div', {
            className: 'jojo-text',
            style: `
                font-family: 'Arial Black', sans-serif;
                font-size: 4rem;
                font-weight: 900;
                color: #fff;
                text-shadow: 
                    3px 3px 0 #000,
                    -3px -3px 0 #000,
                    3px -3px 0 #000,
                    -3px 3px 0 #000,
                    0 0 20px rgba(255, 255, 255, 0.8);
                text-align: center;
                transform: scale(0);
                animation: jojoTextAppear 1.5s ease-out forwards;
            `
        }, "ジョジョの奇妙な冒険");
        
        jojoOverlay.appendChild(jojoText);
        document.body.appendChild(jojoOverlay);
        
        // Remove after animation
        setTimeout(() => {
            if (jojoOverlay.parentNode) {
                jojoOverlay.parentNode.removeChild(jojoOverlay);
            }
        }, 2000);
        
        console.log('🌟 JOJO text effects displayed');
    }

    scrollToSection(sectionId) {
        if (this.infiniteScrollManager) {
            this.infiniteScrollManager.scrollToSection(sectionId);
        } else {
            // Fallback to regular scrolling
            this.fallbackScrollToSection(sectionId);
        }
    }

    fallbackScrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        console.log(`🎯 Scrolled to section: ${sectionId}`);
    }

    setupBackToTop() {
        this.backToTopBtn = document.getElementById('backToTopBtn');
        if (!this.backToTopBtn) return;
        
        this.backToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });
        
        this.backToTopBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.scrollToTop();
        });
        
        // Keyboard support
        this.backToTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }

    scrollToTop() {
        if (this.infiniteScrollManager) {
            this.infiniteScrollManager.scrollToTop();
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        console.log('⬆️ Scrolled to top');
    }

    bindEvents() {
        // Scroll listener for updating active section and back-to-top visibility
        const scrollContainer = document.getElementById('infinite-scroll-container') || window;
        
        scrollContainer.addEventListener('scroll', Utils.throttle(() => {
            this.updateActiveSection();
            this.updateBackToTopVisibility();
        }, 100));
    }

    updateActiveSection() {
        let currentSection = '';
        
        this.sections.forEach(sectionId => {
            const section = this.findSectionElement(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });
        
        // Update nav dots
        this.navDots.forEach((dot, index) => {
            if (this.sections[index] === currentSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        this.currentActiveSection = currentSection;
    }

    findSectionElement(sectionId) {
        // Try to find in the current visible content
        let section = document.getElementById(sectionId);
        
        // If not found or not visible, try to find in the middle container
        if (!section) {
            const containers = document.querySelectorAll('.container');
            const middleContainer = containers[1]; // Second container is usually the middle one
            if (middleContainer) {
                section = middleContainer.querySelector(`#${sectionId}`);
            }
        }
        
        return section;
    }

    updateBackToTopVisibility() {
        if (!this.backToTopBtn) return;
        
        const scrollContainer = document.getElementById('infinite-scroll-container');
        const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.pageYOffset;
        
        if (scrollTop > 300) {
            this.backToTopBtn.classList.add('show');
        } else {
            this.backToTopBtn.classList.remove('show');
        }
    }

    // Public API methods
    getCurrentSection() {
        return this.currentActiveSection;
    }

    setActiveSection(sectionId) {
        this.scrollToSection(sectionId);
    }

    isJojoPlaying() {
        return this.meditationClickTracker.isJojoPlaying;
    }
}

// Export for use in other modules
window.NavigationManager = NavigationManager;
