/**
 * Special Effects Manager
 * Handles complex visual effects like Rick Portal, letter explosions, etc.
 */

class SpecialEffectsManager {
    constructor() {
        this.isPortalActive = false;
        this.isEffectRunning = false;
        this.init();
    }

    init() {
        // Expose global functions for backward compatibility
        window.triggerRickPortal = () => this.triggerRickPortal();
        window.startAdvancedSuckingEffect = () => this.startAdvancedSuckingEffect();
        window.splitTextIntoLetters = (element) => this.splitTextIntoLetters(element);
        window.typeMessage = (text, element, callback) => this.typeMessage(text, element, callback);
        window.playRandomLoser = () => this.playRandomLoser();
    }

    triggerRickPortal() {
        if (this.isPortalActive) {
            console.log("🚫 Portal already active, ignoring trigger");
            return;
        }

        console.log("🎉 RICK PORTAL ACTIVATED! WUBBA LUBBA DUB DUB!");
        this.isPortalActive = true;

        // Add portal mode to body
        document.body.classList.add('portal-mode');
        document.documentElement.classList.add('portal-mode');

        // Create portal at screen center, slightly above middle
        const portal = Utils.createElement('div', {
            className: 'rick-portal',
            style: `
                left: 50%;
                top: 45%;
                transform: translate(-50%, -50%);
            `
        });

        portal.innerHTML = `
            <img src="./phoebe/rickandmorty.png" alt="Rick Portal" />
            <div class="rick-message" id="rickMessage"></div>
        `;

        document.body.appendChild(portal);

        setTimeout(() => {
            portal.classList.add("show");
        }, 100);

        setTimeout(() => {
            this.typeMessage(
                "WUBBA LUBBA DUB DUB!",
                document.getElementById("rickMessage"),
                () => {
                    // Play audio after typing completes
                    if (window.playAudio) {
                        window.playAudio("wubba-lubba.mp3");
                    }
                }
            );
        }, 2000);

        setTimeout(() => {
            this.startAdvancedSuckingEffect();
        }, 8000); // Start sucking effect during portal expansion phase
    }

    typeMessage(text, element, callback) {
        if (!element) return;
        
        let index = 0;
        element.textContent = "";

        const typeChar = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, 100 + Math.random() * 100);
            } else if (callback) {
                // Call callback after typing is complete
                setTimeout(callback, 500);
            }
        };
        
        typeChar();
    }

    startAdvancedSuckingEffect() {
        if (this.isEffectRunning) {
            console.log("🚫 Effect already running, ignoring");
            return;
        }

        this.isEffectRunning = true;
        console.log("🌪️ Starting advanced sucking effect");

        // Get portal position (screen center, slightly above middle)
        const portalCenterX = window.innerWidth / 2;
        const portalCenterY = window.innerHeight * 0.45; // Match portal position

        // Split all text elements into letters first
        const textElements = document.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, span:not(.letter-particle):not(.rick-portal *), div:not(.rick-portal):not(.rick-portal *):not(.final-background), a, button, label, li, td, th, blockquote, em, strong, i, b, u, small, code, pre"
        );

        textElements.forEach((element) => {
            if (
                element.textContent.trim() &&
                !element.querySelector(".letter-particle") &&
                !element.closest(".rick-portal") &&
                element.children.length === 0 // Only split leaf text elements
            ) {
                this.splitTextIntoLetters(element);
            }
        });

        // Get all letters and calculate distances from portal center
        const letters = Array.from(document.querySelectorAll(".letter-particle"));
        const letterDistances = letters.map((letter) => {
            const rect = letter.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2;
            const letterCenterY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(portalCenterX - letterCenterX, 2) +
                Math.pow(portalCenterY - letterCenterY, 2)
            );
            return {
                element: letter,
                distance,
                x: letterCenterX,
                y: letterCenterY,
            };
        });

        // Sort by distance (nearest first)
        letterDistances.sort((a, b) => a.distance - b.distance);

        // Animate letters with progressive acceleration based on distance
        letterDistances.forEach((letterData, index) => {
            const letter = letterData.element;
            const dx = portalCenterX - letterData.x;
            const dy = portalCenterY - letterData.y;
            const distance = letterData.distance;

            // Distance-based timing: closer letters start sooner, but much slower progression
            const distanceRatio = distance / Math.max(...letterDistances.map((l) => l.distance));
            const baseDelay = distanceRatio * 1500; // Slower start, max 1500ms delay

            // Slow start with gradual acceleration
            const progressRatio = index / letterDistances.length;
            const accelerationFactor = 0.3 + progressRatio * 1.2; // Start very slow
            const baseDuration = 5; // Longer base duration for slower effect
            const duration = Math.max(2, baseDuration / accelerationFactor);

            // Distance-based rotation intensity - gentler at start
            const rotationIntensity = 0.3 + distanceRatio * 1.2;
            const rotation = (Math.random() * 2 - 1) * rotationIntensity;

            // Apply optimized styles
            letter.style.cssText += `
                --dx: ${dx}px;
                --dy: ${dy}px;
                --rotation: ${rotation};
                --duration: ${duration}s;
                --delay: ${baseDelay}ms;
            `;

            letter.classList.add("element-sucking");
        });

        // Create final background transition
        setTimeout(() => {
            this.createFinalBackground();
        }, 12000);

        // Reset everything after effect completes
        setTimeout(() => {
            this.resetAfterEffect();
        }, 20000);
    }

    splitTextIntoLetters(element) {
        const text = element.textContent;
        if (!text || text.trim() === "") return;

        const letters = text.split("").map((char) => {
            const span = Utils.createElement('span', {
                className: 'letter-particle',
                style: `
                    display: inline-block;
                    will-change: transform, opacity, filter;
                    transform-origin: center center;
                    backface-visibility: hidden;
                    transform: translateZ(0);
                `
            }, char === " " ? "\u00A0" : char); // Use non-breaking space
            
            return span;
        });

        // Clear original content and add letter spans
        element.textContent = "";
        letters.forEach((letter) => element.appendChild(letter));
    }

    createFinalBackground() {
        const finalBg = Utils.createElement('div', {
            className: 'final-background'
        });

        document.body.appendChild(finalBg);

        setTimeout(() => {
            finalBg.classList.add('show');
        }, 100);
    }

    resetAfterEffect() {
        console.log("🔄 Resetting after portal effect");
        
        // Remove portal mode
        document.body.classList.remove('portal-mode');
        document.documentElement.classList.remove('portal-mode');

        // Remove portal and background elements
        const portal = document.querySelector('.rick-portal');
        const finalBg = document.querySelector('.final-background');
        
        if (portal && portal.parentNode) {
            portal.parentNode.removeChild(portal);
        }
        
        if (finalBg && finalBg.parentNode) {
            finalBg.parentNode.removeChild(finalBg);
        }

        // Reset letter particles
        const letterParticles = document.querySelectorAll('.letter-particle');
        letterParticles.forEach(particle => {
            if (particle.parentNode) {
                const originalText = particle.textContent;
                const parent = particle.parentNode;
                
                // If this is the only child, replace with text
                if (parent.children.length === 1 && parent.querySelector('.letter-particle')) {
                    const allLetters = Array.from(parent.querySelectorAll('.letter-particle'));
                    const fullText = allLetters.map(letter => letter.textContent).join('');
                    parent.textContent = fullText;
                }
            }
        });

        // Reset flags
        this.isPortalActive = false;
        this.isEffectRunning = false;
        
        console.log("✅ Portal effect reset complete");
    }

    playRandomLoser() {
        const loserFiles = ['loser1.mp3', 'loser2.mp3', 'loser3.mp3', 'loser4.mp3', 'loser5.mp3', 'loser6.mp3'];
        const randomIndex = Math.floor(Math.random() * loserFiles.length);
        const selectedFile = loserFiles[randomIndex];
        console.log(`🎵 Playing random loser audio: ${selectedFile}`);
        
        if (window.playAudio) {
            window.playAudio(selectedFile);
        }
    }

    // Create Zima squares effect
    createZimaSquares(count = 10) {
        console.log(`🟦 Creating ${count} Zima squares`);
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createSingleZimaSquare();
            }, i * 100);
        }
    }

    createSingleZimaSquare() {
        const square = Utils.createElement('div', {
            className: 'zima-square',
            style: `
                left: ${Utils.randomBetween(10, window.innerWidth - 30)}px;
                top: ${Utils.randomBetween(10, window.innerHeight - 30)}px;
            `
        });

        document.body.appendChild(square);

        // Add click handler
        square.addEventListener('click', () => {
            square.classList.add('feebea-flash');
            setTimeout(() => {
                if (square.parentNode) {
                    square.parentNode.removeChild(square);
                }
            }, 200);
        });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (square.parentNode) {
                square.parentNode.removeChild(square);
            }
        }, 10000);
    }

    // Public API methods
    isPortalRunning() {
        return this.isPortalActive;
    }

    isEffectActive() {
        return this.isEffectRunning;
    }

    forceReset() {
        this.resetAfterEffect();
    }
}

// Export for use in other modules
window.SpecialEffectsManager = SpecialEffectsManager;
