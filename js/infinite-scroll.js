/**
 * Infinite Scroll Manager
 * Handles seamless infinite scrolling by duplicating content
 */

class InfiniteScrollManager {
    constructor() {
        this.container = null;
        this.content = null;
        this.isJumping = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupInfiniteScroll();
            });
        } else {
            this.setupInfiniteScroll();
        }
    }

    setupInfiniteScroll() {
        this.container = document.getElementById('infinite-scroll-container');
        if (!this.container) {
            console.warn('Infinite scroll container not found');
            return;
        }

        this.content = this.container.querySelector('.container');
        if (!this.content) {
            console.warn('Content container not found');
            return;
        }

        this.duplicateContent();
        this.setupScrollListener();
        this.setupResizeListener();
        this.setInitialScroll();

        console.log('🔄 Infinite scroll initialized');
    }

    duplicateContent() {
        const contentHTML = this.content.innerHTML;

        // Create before content (copy above)
        const before = document.createElement('div');
        before.className = 'container';
        before.innerHTML = contentHTML;
        this.container.insertBefore(before, this.content);

        // Create after content (copy below)
        const after = document.createElement('div');
        after.className = 'container';
        after.innerHTML = contentHTML;
        this.container.appendChild(after);

        console.log('📄 Content duplicated for infinite scroll');
    }

    getContentHeight() {
        return this.content ? this.content.offsetHeight : 0;
    }

    setInitialScroll() {
        if (!this.container || !this.content) return;

        // Start at the middle copy (second copy)
        const contentHeight = this.getContentHeight();
        this.container.scrollTop = contentHeight;
        
        console.log(`📍 Initial scroll position set to: ${contentHeight}px`);
    }

    setupScrollListener() {
        if (!this.container) return;

        this.container.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    handleScroll() {
        if (this.isJumping || !this.container || !this.content) return;

        const contentHeight = this.getContentHeight();
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        const totalHeight = contentHeight * 3;

        // More precise boundary detection
        if (scrollTop <= 3) {
            // Scrolled to the very top, jump to the second copy's corresponding position
            this.isJumping = true;
            this.container.scrollTop = contentHeight * 2 + scrollTop;
            setTimeout(() => { 
                this.isJumping = false; 
            }, 30);
            
            console.log('🔄 Jumped from top to middle copy');
            
        } else if (scrollTop >= totalHeight - containerHeight - 3) {
            // Scrolled to the very bottom, jump to the first copy's corresponding position
            this.isJumping = true;
            // Calculate relative position in current content
            const relativePosition = scrollTop - (contentHeight * 2);
            this.container.scrollTop = contentHeight + relativePosition;
            setTimeout(() => { 
                this.isJumping = false; 
            }, 30);
            
            console.log('🔄 Jumped from bottom to middle copy');
        }
    }

    setupResizeListener() {
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 100));
    }

    handleResize() {
        // Recalculate and adjust scroll position after resize
        setTimeout(() => {
            this.setInitialScroll();
        }, 100);
        
        console.log('📐 Infinite scroll adjusted for resize');
    }

    // Public API methods
    scrollToPosition(position) {
        if (!this.container) return;
        
        const contentHeight = this.getContentHeight();
        // Always scroll to the middle copy plus the desired position
        this.container.scrollTop = contentHeight + position;
    }

    getCurrentScrollPosition() {
        if (!this.container || !this.content) return 0;
        
        const contentHeight = this.getContentHeight();
        const scrollTop = this.container.scrollTop;
        
        // Calculate position relative to the middle copy
        if (scrollTop < contentHeight) {
            // In first copy
            return scrollTop + contentHeight;
        } else if (scrollTop >= contentHeight * 2) {
            // In third copy
            return scrollTop - contentHeight;
        } else {
            // In middle copy (normal position)
            return scrollTop - contentHeight;
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section || !this.container) return;

        // Find the section in the middle copy
        const allContainers = this.container.querySelectorAll('.container');
        const middleContainer = allContainers[1]; // Second container is the middle one
        
        if (!middleContainer) return;

        const targetSection = middleContainer.querySelector(`#${sectionId}`);
        if (!targetSection) return;

        const containerRect = this.container.getBoundingClientRect();
        const sectionRect = targetSection.getBoundingClientRect();
        
        // Calculate scroll position
        const currentScrollTop = this.container.scrollTop;
        const targetScrollTop = currentScrollTop + sectionRect.top - containerRect.top - 100; // 100px offset

        this.container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });

        console.log(`🎯 Scrolled to section: ${sectionId}`);
    }

    // Smooth scroll to top
    scrollToTop() {
        if (!this.container) return;
        
        const contentHeight = this.getContentHeight();
        this.container.scrollTo({
            top: contentHeight, // Scroll to the start of middle copy
            behavior: 'smooth'
        });
        
        console.log('⬆️ Scrolled to top');
    }

    // Get scroll progress (0-1)
    getScrollProgress() {
        if (!this.container || !this.content) return 0;
        
        const contentHeight = this.getContentHeight();
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        
        // Calculate progress within the middle copy
        let relativeScroll;
        if (scrollTop < contentHeight) {
            relativeScroll = scrollTop + contentHeight;
        } else if (scrollTop >= contentHeight * 2) {
            relativeScroll = scrollTop - contentHeight;
        } else {
            relativeScroll = scrollTop - contentHeight;
        }
        
        const maxScroll = contentHeight - containerHeight;
        return Math.max(0, Math.min(1, relativeScroll / maxScroll));
    }

    // Enable/disable infinite scroll
    setEnabled(enabled) {
        if (!this.container) return;
        
        if (enabled) {
            this.container.style.overflow = 'auto';
            this.setupScrollListener();
        } else {
            this.container.style.overflow = 'hidden';
            // Remove scroll listener would require storing the reference
        }
        
        console.log(`🔄 Infinite scroll ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Destroy infinite scroll and restore normal scrolling
    destroy() {
        if (!this.container || !this.content) return;
        
        // Remove duplicated content
        const allContainers = this.container.querySelectorAll('.container');
        allContainers.forEach((container, index) => {
            if (index !== 1) { // Keep only the middle (original) container
                container.remove();
            }
        });
        
        // Reset scroll position
        this.container.scrollTop = 0;
        
        console.log('🗑️ Infinite scroll destroyed');
    }

    // Refresh infinite scroll (useful after content changes)
    refresh() {
        if (!this.container || !this.content) return;
        
        console.log('🔄 Refreshing infinite scroll...');
        
        // Store current scroll position
        const currentPosition = this.getCurrentScrollPosition();
        
        // Remove old duplicates
        const allContainers = this.container.querySelectorAll('.container');
        allContainers.forEach((container, index) => {
            if (index !== 1) { // Remove all except middle container
                container.remove();
            }
        });
        
        // Re-duplicate content
        this.duplicateContent();
        
        // Restore scroll position
        this.scrollToPosition(currentPosition);
        
        console.log('✅ Infinite scroll refreshed');
    }
}

// Export for use in other modules
window.InfiniteScrollManager = InfiniteScrollManager;
