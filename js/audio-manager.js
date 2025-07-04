/**
 * Audio Manager Module
 * Handles audio playback, playlist management, and audio controls
 */

class AudioManager {
    constructor() {
        this.cyberpunkAudio = null;
        this.isAudioPlaying = false;
        this.currentAudioIndex = 0;
        this.audioPlaylist = [];
        this.playMode = 'stop'; // 'stop', 'repeat-one', 'repeat-all'
        this.volume = CONFIG.audio.defaultVolume;
        
        this.playModes = {
            'stop': { icon: 'M6 6h12v12H6z', title: '播放完暂停' },
            'repeat-one': { icon: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z M12 10v4l3-2-3-2z', title: '单曲循环' },
            'repeat-all': { icon: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z', title: '列表循环' }
        };

        this.init();
    }

    init() {
        this.setupAudioControls();
        this.initializePlaylist();
        
        // Expose global functions for backward compatibility
        window.playAudio = (filename) => this.playAudio(filename);
        window.playAudioFromTime = (filename, startTime) => this.playAudioFromTime(filename, startTime);
        window.setupAudioControl = () => this.setupAudioControls();
        window.initializePlaylist = () => this.initializePlaylist();
    }

    playAudio(filename) {
        console.log("🎵 Playing audio:", filename);

        // Try multiple possible paths, prioritizing phoebe folder
        const paths = [
            `./phoebe/${filename}`,
            `phoebe/${filename}`,
            `./audio/${filename}`,
            `audio/${filename}`,
            filename,
        ];

        let currentPathIndex = 0;

        const tryNextPath = () => {
            if (currentPathIndex >= paths.length) {
                console.error("❌ Audio file not found:", filename);
                return;
            }

            const audioPath = paths[currentPathIndex];
            console.log(`🔍 Trying path: ${audioPath}`);

            if (this.cyberpunkAudio) {
                this.cyberpunkAudio.pause();
                this.cyberpunkAudio.currentTime = 0;
            }

            this.cyberpunkAudio = new Audio(audioPath);
            this.cyberpunkAudio.volume = this.volume;

            this.cyberpunkAudio.addEventListener('loadstart', () => {
                console.log(`📡 Loading started: ${audioPath}`);
            });

            this.cyberpunkAudio.addEventListener('canplaythrough', () => {
                console.log(`✅ Audio loaded successfully: ${audioPath}`);
                this.cyberpunkAudio.play().catch(error => {
                    console.error("❌ Playback failed:", error);
                    currentPathIndex++;
                    tryNextPath();
                });
            });

            this.cyberpunkAudio.addEventListener('error', (e) => {
                console.error(`❌ Audio error for ${audioPath}:`, e);
                currentPathIndex++;
                tryNextPath();
            });

            this.cyberpunkAudio.addEventListener('ended', () => {
                console.log("🎵 Audio playback ended");
                this.handleAudioEnded();
            });

            // Set loading timeout
            setTimeout(() => {
                if (this.cyberpunkAudio && this.cyberpunkAudio.readyState < 2) {
                    console.warn(`⏰ Loading timeout for: ${audioPath}`);
                    currentPathIndex++;
                    tryNextPath();
                }
            }, 3000);
        };

        tryNextPath();
    }

    playAudioFromTime(filename, startTime) {
        console.log(`🎵 Playing audio from ${startTime}s:`, filename);

        const paths = [
            `./phoebe/${filename}`,
            `phoebe/${filename}`,
            `./audio/${filename}`,
            `audio/${filename}`,
            filename,
        ];

        let currentPathIndex = 0;

        const tryNextPath = () => {
            if (currentPathIndex >= paths.length) {
                console.error("❌ Audio file not found:", filename);
                return;
            }

            const audioPath = paths[currentPathIndex];

            if (this.cyberpunkAudio) {
                this.cyberpunkAudio.pause();
                this.cyberpunkAudio.currentTime = 0;
            }

            this.cyberpunkAudio = new Audio(audioPath);
            this.cyberpunkAudio.volume = this.volume;

            this.cyberpunkAudio.addEventListener('canplaythrough', () => {
                this.cyberpunkAudio.currentTime = startTime;
                this.cyberpunkAudio.play().catch(error => {
                    console.error("❌ Playback failed:", error);
                    currentPathIndex++;
                    tryNextPath();
                });
            });

            this.cyberpunkAudio.addEventListener('error', (e) => {
                console.error(`❌ Audio error for ${audioPath}:`, e);
                currentPathIndex++;
                tryNextPath();
            });

            this.cyberpunkAudio.addEventListener('ended', () => {
                this.handleAudioEnded();
            });
        };

        tryNextPath();
    }

    handleAudioEnded() {
        this.isAudioPlaying = false;
        
        switch (this.playMode) {
            case 'repeat-one':
                // Replay current audio
                if (this.cyberpunkAudio) {
                    this.cyberpunkAudio.currentTime = 0;
                    this.cyberpunkAudio.play();
                    this.isAudioPlaying = true;
                }
                break;
                
            case 'repeat-all':
                // Play next audio in playlist
                this.playNextInPlaylist();
                break;
                
            case 'stop':
            default:
                // Stop playback
                console.log("🛑 Audio playback stopped");
                break;
        }
    }

    playNextInPlaylist() {
        if (this.audioPlaylist.length === 0) return;
        
        this.currentAudioIndex = (this.currentAudioIndex + 1) % this.audioPlaylist.length;
        const nextAudio = this.audioPlaylist[this.currentAudioIndex];
        
        if (nextAudio && nextAudio.src) {
            const filename = nextAudio.src.split('/').pop();
            this.playAudio(filename);
        }
    }

    addToPlaylist(audioData) {
        if (!audioData || !audioData.src) return;
        
        // Check if already in playlist
        const exists = this.audioPlaylist.some(item => item.src === audioData.src);
        if (!exists) {
            this.audioPlaylist.push(audioData);
            console.log(`📝 Added to playlist: ${audioData.name || audioData.src}`);
        }
    }

    removeFromPlaylist(index) {
        if (index >= 0 && index < this.audioPlaylist.length) {
            const removed = this.audioPlaylist.splice(index, 1)[0];
            console.log(`🗑️ Removed from playlist: ${removed.name || removed.src}`);
            
            // Adjust current index if necessary
            if (this.currentAudioIndex >= this.audioPlaylist.length) {
                this.currentAudioIndex = Math.max(0, this.audioPlaylist.length - 1);
            }
        }
    }

    clearPlaylist() {
        this.audioPlaylist = [];
        this.currentAudioIndex = 0;
        console.log("🧹 Playlist cleared");
    }

    initializePlaylist() {
        this.clearPlaylist();
        console.log("🎵 Playlist initialized");
    }

    setupAudioControls() {
        // This method can be extended to create UI controls
        console.log("🎛️ Audio controls setup");
    }

    // Volume control
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.cyberpunkAudio) {
            this.cyberpunkAudio.volume = this.volume;
        }
        console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
    }

    getVolume() {
        return this.volume;
    }

    // Playback control
    pause() {
        if (this.cyberpunkAudio && !this.cyberpunkAudio.paused) {
            this.cyberpunkAudio.pause();
            this.isAudioPlaying = false;
            console.log("⏸️ Audio paused");
        }
    }

    resume() {
        if (this.cyberpunkAudio && this.cyberpunkAudio.paused) {
            this.cyberpunkAudio.play().then(() => {
                this.isAudioPlaying = true;
                console.log("▶️ Audio resumed");
            }).catch(error => {
                console.error("❌ Resume failed:", error);
            });
        }
    }

    stop() {
        if (this.cyberpunkAudio) {
            this.cyberpunkAudio.pause();
            this.cyberpunkAudio.currentTime = 0;
            this.isAudioPlaying = false;
            console.log("⏹️ Audio stopped");
        }
    }

    // Play mode control
    setPlayMode(mode) {
        if (this.playModes[mode]) {
            this.playMode = mode;
            console.log(`🔄 Play mode set to: ${mode}`);
        }
    }

    getPlayMode() {
        return this.playMode;
    }

    cyclePlayMode() {
        const modes = Object.keys(this.playModes);
        const currentIndex = modes.indexOf(this.playMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setPlayMode(modes[nextIndex]);
        return this.playMode;
    }

    // Status getters
    isPlaying() {
        return this.isAudioPlaying && this.cyberpunkAudio && !this.cyberpunkAudio.paused;
    }

    getCurrentTime() {
        return this.cyberpunkAudio ? this.cyberpunkAudio.currentTime : 0;
    }

    getDuration() {
        return this.cyberpunkAudio ? this.cyberpunkAudio.duration : 0;
    }

    getCurrentAudio() {
        return this.audioPlaylist[this.currentAudioIndex] || null;
    }

    getPlaylist() {
        return [...this.audioPlaylist];
    }

    // Seek control
    seek(time) {
        if (this.cyberpunkAudio) {
            this.cyberpunkAudio.currentTime = Math.max(0, Math.min(time, this.getDuration()));
        }
    }

    // Event listeners for special audio effects
    setupSpecialAudioEvents() {
        if (!this.cyberpunkAudio) return;

        // Add timeupdate listener for special effects
        this.cyberpunkAudio.addEventListener('timeupdate', () => {
            const currentAudio = this.getCurrentAudio();
            if (currentAudio && currentAudio.src === "./phoebe/jojo.mp3") {
                // Handle JOJO special effects
                this.handleJojoEffects();
            }
        });
    }

    handleJojoEffects() {
        // This can be extended for special audio-synced effects
        const currentTime = this.getCurrentTime();
        
        // Example: trigger effects at specific timestamps
        if (currentTime >= 18.5 && currentTime < 19) {
            // First JOJO effect
            if (window.showJojoTextEffects) {
                window.showJojoTextEffects();
            }
        } else if (currentTime >= 25.5 && currentTime < 26) {
            // Second JOJO effect
            if (window.showJojoTextEffects) {
                window.showJojoTextEffects();
            }
        }
    }
}

// Export for use in other modules
window.AudioManager = AudioManager;
