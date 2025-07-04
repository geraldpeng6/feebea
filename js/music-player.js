/**
 * Music Player Manager
 * Handles advanced music playback with playlist, controls, and special audio effects
 */

class MusicPlayerManager {
    constructor() {
        this.audioElement = null;
        this.isPlaying = false;
        this.currentIndex = 0;
        this.playlist = [];
        this.playMode = 'stop'; // 'stop', 'repeat-one', 'repeat-all'
        this.volume = 0.3;
        
        this.playModes = {
            'stop': { icon: 'M6 6h12v12H6z', title: '播放完暂停' },
            'repeat-one': { icon: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z', title: '单曲循环' },
            'repeat-all': { icon: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z', title: '列表循环' }
        };
        
        this.init();
    }

    init() {
        this.setupAudioElement();
        this.setupControls();
        this.setupPlaylist();
        this.exposeGlobalFunctions();
        
        console.log('🎵 Music player manager initialized');
    }

    setupAudioElement() {
        this.audioElement = document.getElementById('cyberpunkAudio');
        if (!this.audioElement) {
            console.warn('Audio element not found, creating one');
            this.createAudioElement();
        }
        
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
            this.audioElement.addEventListener('ended', () => {
                this.handleTrackEnded();
            });
            
            this.audioElement.addEventListener('loadstart', () => {
                console.log('🎵 Audio loading started');
            });
            
            this.audioElement.addEventListener('canplay', () => {
                console.log('🎵 Audio can play');
            });
            
            this.audioElement.addEventListener('error', (e) => {
                console.error('🎵 Audio error:', e);
            });
        }
    }

    createAudioElement() {
        this.audioElement = Utils.createElement('audio', {
            id: 'cyberpunkAudio',
            preload: 'none'
        });
        
        const source = Utils.createElement('source', {
            src: '',
            type: 'audio/mpeg'
        });
        
        this.audioElement.appendChild(source);
        document.body.appendChild(this.audioElement);
    }

    setupControls() {
        const controlPanel = document.getElementById('audioControlPanel');
        const controlBtn = document.getElementById('audioControlBtn');
        const playModeBtn = document.getElementById('playModeBtn');
        
        if (controlBtn) {
            this.setupControlButton(controlBtn);
        }
        
        if (playModeBtn) {
            this.setupPlayModeButton(playModeBtn);
        }
        
        if (controlPanel) {
            this.setupControlPanel(controlPanel);
        }
    }

    setupControlButton(controlBtn) {
        let longPressTimer;
        let isLongPressing = false;
        
        // Mouse events for desktop
        controlBtn.addEventListener('mousedown', (e) => {
            if (window.innerWidth > 768) {
                isLongPressing = false;
                longPressTimer = setTimeout(() => {
                    isLongPressing = true;
                    this.showAudioControls();
                }, 500);
            }
        });
        
        controlBtn.addEventListener('mouseup', (e) => {
            if (window.innerWidth > 768) {
                clearTimeout(longPressTimer);
                if (!isLongPressing) {
                    this.toggleAudio();
                }
            }
        });
        
        // Touch events for mobile
        controlBtn.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) {
                isLongPressing = false;
                longPressTimer = setTimeout(() => {
                    isLongPressing = true;
                    this.showAudioControls();
                }, 500);
            }
        });
        
        controlBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            clearTimeout(longPressTimer);
            if (!isLongPressing) {
                this.toggleAudio();
            }
        });
        
        // Keyboard support
        controlBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleAudio();
            }
        });
        
        controlBtn.setAttribute('tabindex', '0');
    }

    setupPlayModeButton(playModeBtn) {
        playModeBtn.addEventListener('click', () => {
            this.cyclePlayMode();
        });
        
        playModeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.cyclePlayMode();
        });
        
        // Update initial state
        this.updatePlayModeButton();
    }

    setupControlPanel(controlPanel) {
        // Show/hide controls on hover for desktop
        if (window.innerWidth > 768) {
            controlPanel.addEventListener('mouseenter', () => {
                this.showAudioControls();
            });
        }
    }

    setupPlaylist() {
        this.updatePlaylistUI();
        this.updateAudioPanelVisibility();
    }

    exposeGlobalFunctions() {
        // Expose functions for backward compatibility
        window.addAudioToPlaylist = (audioData) => this.addToPlaylist(audioData);
        window.playAudio = (filename) => this.playAudioFile(filename);
        window.toggleAudio = () => this.toggleAudio();
        window.updateAudioButton = () => this.updateControlButton();
        window.audioPlaylist = this.playlist;
        window.currentAudioIndex = this.currentIndex;
        window.isAudioPlaying = this.isPlaying;
        window.cyberpunkAudio = this.audioElement;
    }

    addToPlaylist(audioData) {
        // Check if audio already exists to avoid duplicates
        const existingAudio = this.playlist.find(audio => 
            audio.src === audioData.src || audio.name === audioData.name
        );
        
        if (existingAudio) {
            console.log(`🎵 Audio "${audioData.name}" already in playlist, playing existing`);
            const existingIndex = this.playlist.indexOf(existingAudio);
            this.loadAudio(existingIndex, true);
            return;
        }
        
        // Add to playlist
        this.playlist.push(audioData);
        console.log(`🎵 Added "${audioData.name}" to playlist`);
        
        // Update UI
        this.updatePlaylistUI();
        this.updateAudioPanelVisibility();
        
        // Auto-play if this is the first song or if nothing is currently playing
        if (this.playlist.length === 1 || !this.isPlaying) {
            this.loadAudio(this.playlist.length - 1, true);
        }
        
        // Update global references
        window.audioPlaylist = this.playlist;
        window.currentAudioIndex = this.currentIndex;
    }

    loadAudio(index, autoPlay = false) {
        if (index >= 0 && index < this.playlist.length) {
            const audioData = this.playlist[index];
            this.currentIndex = index;
            
            console.log(`🎵 Loading: ${audioData.name}`);
            
            // Update UI immediately
            this.updatePlaylistUI();
            
            if (autoPlay) {
                this.loadAndPlayAudio(audioData);
            } else {
                this.loadAudioOnly(audioData);
            }
            
            // Update global reference
            window.currentAudioIndex = this.currentIndex;
        }
    }

    loadAndPlayAudio(audioData) {
        if (!this.audioElement) return;
        
        const source = this.audioElement.querySelector('source');
        if (source && source.src !== audioData.src) {
            source.src = audioData.src;
            this.audioElement.load();
            
            // Set start time when audio can play (only for first play)
            this.audioElement.addEventListener('canplay', () => {
                this.setAudioStartTime(audioData);
                this.playAudio();
            }, { once: true });
        } else if (source && source.src === audioData.src) {
            // Audio already loaded, just play
            this.playAudio();
        }
    }

    loadAudioOnly(audioData) {
        if (!this.audioElement) return;
        
        const source = this.audioElement.querySelector('source');
        if (source && source.src !== audioData.src) {
            source.src = audioData.src;
            this.audioElement.load();
            
            this.audioElement.addEventListener('canplay', () => {
                this.setAudioStartTime(audioData);
            }, { once: true });
        }
    }

    setAudioStartTime(audioData) {
        if (!audioData.hasPlayedBefore) {
            if (audioData.name === "Cyberpunk 2077") {
                this.audioElement.currentTime = 60; // Start at 1 minute
            } else if (audioData.name === "Runaway") {
                this.audioElement.currentTime = 38.5; // Start at 38.5 seconds
            } else if (audioData.name === "Who Is The Best") {
                this.audioElement.currentTime = 44; // Start at 44 seconds
            }
            // Mark as played
            audioData.hasPlayedBefore = true;
        }
    }

    playAudio() {
        if (!this.audioElement) return;
        
        this.audioElement.play().then(() => {
            this.isPlaying = true;
            this.updateControlButton();
            console.log(`🎵 Playing: ${this.playlist[this.currentIndex]?.name}`);
            
            // Update global reference
            window.isAudioPlaying = this.isPlaying;
        }).catch(error => {
            console.error("❌ Play failed:", error);
        });
    }

    pauseAudio() {
        if (!this.audioElement) return;
        
        this.audioElement.pause();
        this.isPlaying = false;
        this.updateControlButton();
        console.log("⏸️ Audio paused");
        
        // Update global reference
        window.isAudioPlaying = this.isPlaying;
    }

    toggleAudio() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
                const currentAudio = this.playlist[this.currentIndex];
                const source = this.audioElement?.querySelector('source');
                
                if (!source?.src || source.src !== currentAudio.src) {
                    // Need to load audio first
                    this.loadAndPlayAudio(currentAudio);
                } else {
                    // Audio already loaded, just play
                    this.playAudio();
                }
            }
        }
    }

    handleTrackEnded() {
        console.log('🎵 Track ended, checking play mode...');
        
        switch (this.playMode) {
            case 'repeat-one':
                // Replay current track
                this.audioElement.currentTime = 0;
                this.playAudio();
                break;
                
            case 'repeat-all':
                // Play next track, loop to beginning if at end
                this.playNext();
                break;
                
            case 'stop':
            default:
                // Stop playing
                this.isPlaying = false;
                this.updateControlButton();
                window.isAudioPlaying = this.isPlaying;
                break;
        }
    }

    playNext() {
        if (this.playlist.length === 0) return;
        
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.playlist.length) {
            nextIndex = 0; // Loop to beginning
        }
        
        this.loadAudio(nextIndex, true);
    }

    playPrevious() {
        if (this.playlist.length === 0) return;
        
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.playlist.length - 1; // Loop to end
        }
        
        this.loadAudio(prevIndex, true);
    }

    cyclePlayMode() {
        const modes = Object.keys(this.playModes);
        const currentIndex = modes.indexOf(this.playMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.playMode = modes[nextIndex];
        this.updatePlayModeButton();
        
        console.log(`🔄 Play mode changed to: ${this.playMode}`);
    }

    updateControlButton() {
        const controlBtn = document.getElementById('audioControlBtn');
        const playIcon = controlBtn?.querySelector('.play-icon');
        const pauseIcon = controlBtn?.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (this.isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }

    updatePlayModeButton() {
        const playModeBtn = document.getElementById('playModeBtn');
        const iconElement = playModeBtn?.querySelector('.mode-icon path');
        
        if (iconElement) {
            const modeData = this.playModes[this.playMode];
            iconElement.setAttribute('d', modeData.icon);
            playModeBtn.setAttribute('title', modeData.title);
            playModeBtn.setAttribute('data-mode', this.playMode);
        }
    }

    updatePlaylistUI() {
        const playlistContainer = document.getElementById('playlistItems');
        if (!playlistContainer) return;
        
        playlistContainer.innerHTML = '';
        
        this.playlist.forEach((audio, index) => {
            const item = Utils.createElement('div', {
                className: `playlist-item ${index === this.currentIndex ? 'active' : ''}`
            });
            
            item.innerHTML = `
                <span class="playlist-item-name">${audio.name}</span>
                <span class="playlist-item-type">${audio.type}</span>
            `;
            
            const handlePlaylistItemClick = () => {
                if (this.currentIndex !== index) {
                    const wasPlaying = this.isPlaying;
                    if (this.isPlaying) {
                        this.pauseAudio();
                    }
                    
                    // Load audio with auto-play if it was playing before
                    this.loadAudio(index, wasPlaying);
                }
            };
            
            item.addEventListener('click', handlePlaylistItemClick);
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                handlePlaylistItemClick();
            });
            
            playlistContainer.appendChild(item);
        });
    }

    updateAudioPanelVisibility() {
        const audioPanel = document.getElementById('audioControlPanel');
        if (!audioPanel) return;
        
        // Show panel only if there are songs in the playlist
        if (this.playlist.length > 0) {
            audioPanel.classList.add('show');
        } else {
            audioPanel.classList.remove('show');
        }
    }

    showAudioControls() {
        const audioPanel = document.getElementById('audioControlPanel');
        const playModeBtn = document.getElementById('playModeBtn');
        const playlistSidebar = document.getElementById('audioPlaylistSidebar');
        
        if (audioPanel) {
            if (window.innerWidth <= 768) {
                audioPanel.classList.add('mobile-show');
            } else {
                audioPanel.classList.add('show');
            }
        }
        
        console.log('🎵 Audio controls shown');
    }

    // Play audio file by filename (for backward compatibility)
    playAudioFile(filename) {
        const audioData = {
            name: filename.replace('.mp3', '').replace(/[-_]/g, ' '),
            src: `./phoebe/${filename}`,
            type: "Direct Play"
        };
        
        this.addToPlaylist(audioData);
    }

    // Public API methods
    getPlaylist() {
        return this.playlist;
    }

    getCurrentTrack() {
        return this.playlist[this.currentIndex];
    }

    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
    }

    getVolume() {
        return this.volume;
    }

    clearPlaylist() {
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.updatePlaylistUI();
        this.updateAudioPanelVisibility();
        this.updateControlButton();
        
        // Update global references
        window.audioPlaylist = this.playlist;
        window.currentAudioIndex = this.currentIndex;
        window.isAudioPlaying = this.isPlaying;
        
        console.log('🗑️ Playlist cleared');
    }
}

// Export for use in other modules
window.MusicPlayerManager = MusicPlayerManager;
