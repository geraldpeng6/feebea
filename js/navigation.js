/**
 * Navigation Manager Module
 * Handles navigation dots and back-to-top functionality
 */

class NavigationManager {
    constructor() {
        this.navDots = [];
        this.backToTopBtn = null;
        this.sections = [];
        this.currentActiveSection = null;
        
        this.init();
    }

    init() {
        this.setupNavigationDots();
        this.setupBackToTop();
        this.bindEvents();
        this.updateActiveSection();
    }

    setupNavigationDots() {
        this.navDots = Array.from(document.querySelectorAll('.nav-dot'));
        this.sections = this.navDots.map(dot => {
            const sectionId = dot.dataset.section;
            return {
                id: sectionId,
                element: document.getElementById(sectionId),
                dot: dot
            };
        }).filter(section => section.element);

        // Add click handlers to navigation dots
        this.navDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToSection(dot.dataset.section);
            });

            // Add keyboard support
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateToSection(dot.dataset.section);
                }
            });

            // Make focusable
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('role', 'button');
        });
    }

    setupBackToTop() {
        this.backToTopBtn = document.getElementById('backToTopBtn');
        
        if (this.backToTopBtn) {
            this.backToTopBtn.addEventListener('click', () => {
                this.scrollToTop();
            });

            // Add keyboard support
            this.backToTopBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }
    }

    bindEvents() {
        // Scroll event listener for updating active section and back-to-top visibility
        const scrollHandler = Utils.throttle(() => {
            this.updateActiveSection();
            this.updateBackToTopVisibility();
        }, 100);

        window.addEventListener('scroll', scrollHandler);

        // Handle infinite scroll container if it exists
        const infiniteScrollContainer = document.getElementById('infinite-scroll-container');
        if (infiniteScrollContainer) {
            infiniteScrollContainer.addEventListener('scroll', scrollHandler);
        }
    }

    navigateToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) {
            console.warn(`Section with id "${sectionId}" not found`);
            return;
        }

        // Calculate offset for better positioning
        const offset = this.calculateScrollOffset();
        
        Utils.scrollToElement(targetElement, offset);

        // Update active state immediately for better UX
        this.setActiveSection(sectionId);

        // Announce navigation for screen readers
        this.announceNavigation(sectionId);
    }

    calculateScrollOffset() {
        // Account for fixed headers or other elements
        const langToggle = document.querySelector('.lang-toggle');
        const langToggleHeight = langToggle ? langToggle.offsetHeight : 0;
        
        return langToggleHeight + 20; // Add some padding
    }

    updateActiveSection() {
        if (this.sections.length === 0) return;

        const scrollContainer = document.getElementById('infinite-scroll-container') || window;
        const scrollTop = scrollContainer === window ? 
            window.pageYOffset : 
            scrollContainer.scrollTop;

        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * 0.3; // 30% of viewport height

        let activeSection = null;
        let minDistance = Infinity;

        // Find the section closest to the top of the viewport
        this.sections.forEach(section => {
            if (!section.element) return;

            const rect = section.element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementCenter = elementTop + (rect.height / 2);

            // Calculate distance from viewport center
            const viewportCenter = viewportHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);

            // Check if element is in viewport
            const isInViewport = elementTop < viewportHeight && (elementTop + rect.height) > 0;

            if (isInViewport && distance < minDistance) {
                minDistance = distance;
                activeSection = section;
            }
        });

        // Update active section if changed
        if (activeSection && activeSection.id !== this.currentActiveSection) {
            this.setActiveSection(activeSection.id);
        }
    }

    setActiveSection(sectionId) {
        // Remove active class from all dots
        this.navDots.forEach(dot => {
            dot.classList.remove('active');
            dot.setAttribute('aria-current', 'false');
        });

        // Add active class to current section's dot
        const activeDot = this.navDots.find(dot => dot.dataset.section === sectionId);
        if (activeDot) {
            activeDot.classList.add('active');
            activeDot.setAttribute('aria-current', 'true');
        }

        this.currentActiveSection = sectionId;
    }

    updateBackToTopVisibility() {
        if (!this.backToTopBtn) return;

        const scrollContainer = document.getElementById('infinite-scroll-container') || window;
        const scrollTop = scrollContainer === window ? 
            window.pageYOffset : 
            scrollContainer.scrollTop;

        const showThreshold = 300; // Show after scrolling 300px

        if (scrollTop > showThreshold) {
            this.backToTopBtn.classList.add('show');
            this.backToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            this.backToTopBtn.classList.remove('show');
            this.backToTopBtn.setAttribute('aria-hidden', 'true');
        }
    }

    scrollToTop() {
        const scrollContainer = document.getElementById('infinite-scroll-container');
        
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Update navigation state
        setTimeout(() => {
            this.updateActiveSection();
        }, 100);

        // Announce action for screen readers
        this.announceNavigation('top');
    }

    announceNavigation(sectionId) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('nav-live-region');
        
        if (!liveRegion) {
            liveRegion = Utils.createElement('div', {
                id: 'nav-live-region',
                'aria-live': 'polite',
                'aria-atomic': 'true',
                style: 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;'
            });
            document.body.appendChild(liveRegion);
        }

        // Get section name for announcement
        const sectionNames = {
            'header': 'Top of page',
            'color-display': 'Color display section',
            'quote-section': 'Quote section',
            'meditation': 'Meditation section',
            'essence': 'Essence cards section',
            'phoebe-section': 'Phoebe\'s wisdom section',
            'top': 'Top of page'
        };

        const sectionName = sectionNames[sectionId] || sectionId;
        liveRegion.textContent = `Navigated to ${sectionName}`;
    }

    // Public API methods
    getCurrentSection() {
        return this.currentActiveSection;
    }

    getSections() {
        return this.sections.map(section => ({
            id: section.id,
            element: section.element
        }));
    }

    // Programmatically navigate to a section
    goToSection(sectionId) {
        this.navigateToSection(sectionId);
    }

    // Add new section dynamically
    addSection(sectionId, tooltip) {
        const element = document.getElementById(sectionId);
        if (!element) {
            console.warn(`Element with id "${sectionId}" not found`);
            return;
        }

        // Check if section already exists
        const existingSection = this.sections.find(s => s.id === sectionId);
        if (existingSection) {
            console.warn(`Section "${sectionId}" already exists`);
            return;
        }

        // Create navigation dot
        const dot = Utils.createElement('div', {
            className: 'nav-dot',
            'data-tooltip': tooltip || sectionId,
            'data-section': sectionId,
            tabindex: '0',
            role: 'button'
        });

        // Add event listeners
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToSection(sectionId);
        });

        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToSection(sectionId);
            }
        });

        // Add to navigation container
        const navigation = document.querySelector('.navigation');
        if (navigation) {
            navigation.appendChild(dot);
        }

        // Update internal arrays
        this.navDots.push(dot);
        this.sections.push({
            id: sectionId,
            element: element,
            dot: dot
        });
    }

    // Remove section
    removeSection(sectionId) {
        const sectionIndex = this.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) {
            console.warn(`Section "${sectionId}" not found`);
            return;
        }

        const section = this.sections[sectionIndex];
        
        // Remove dot from DOM
        if (section.dot && section.dot.parentNode) {
            section.dot.parentNode.removeChild(section.dot);
        }

        // Remove from arrays
        this.sections.splice(sectionIndex, 1);
        const dotIndex = this.navDots.indexOf(section.dot);
        if (dotIndex > -1) {
            this.navDots.splice(dotIndex, 1);
        }
    }
}

// Export for use in other modules
window.NavigationManager = NavigationManager;
