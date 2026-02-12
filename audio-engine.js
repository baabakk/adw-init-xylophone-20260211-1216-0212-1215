/**
 * Audio Engine Module
 * Manages Web Audio API interactions, oscillator creation, and ADSR envelope synthesis
 * Provides low-latency audio generation for xylophone tones
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.activeOscillators = new Set();
        
        // ADSR envelope parameters for xylophone-like percussive sound
        this.envelope = {
            attack: 0.005,      // Very fast attack (5ms) for percussive strike
            decay: 0.1,         // Quick decay to sustain level
            sustain: 0.3,       // Lower sustain level for natural decay
            release: 1.2        // Longer release for resonance tail
        };
        
        // Oscillator configuration
        this.oscillatorType = 'sine'; // Sine wave for pure, bell-like tone
        this.defaultVolume = 0.7;     // Default master volume (0-1)
    }

    /**
     * Initialize the audio context and master gain node
     * Must be called after user gesture due to browser autoplay policies
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            // Create AudioContext (with vendor prefixes for older browsers)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            
            if (!AudioContextClass) {
                throw new Error('Web Audio API not supported in this browser');
            }

            this.audioContext = new AudioContextClass();
            
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.defaultVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            // Resume context if suspended (autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('Audio engine initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Play a note with specified frequency
     * Creates oscillator with ADSR envelope for percussive xylophone tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Note duration in seconds (default: 2.0)
     * @returns {boolean} Success status
     */
    playNote(frequency, duration = 2.0) {
        if (!this.isInitialized || !this.audioContext) {
            console.warn('Audio engine not initialized');
            return false;
        }

        try {
            const now = this.audioContext.currentTime;
            
            // Create oscillator for tone generation
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = this.oscillatorType;
            oscillator.frequency.value = frequency;
            
            // Create gain node for ADSR envelope
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // Start at zero
            
            // Connect audio graph: oscillator -> gain -> master gain -> destination
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Apply ADSR envelope
            const attackEnd = now + this.envelope.attack;
            const decayEnd = attackEnd + this.envelope.decay;
            const releaseStart = now + duration;
            const releaseEnd = releaseStart + this.envelope.release;
            
            // Attack: ramp up to peak volume
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1.0, attackEnd);
            
            // Decay: ramp down to sustain level
            gainNode.gain.linearRampToValueAtTime(this.envelope.sustain, decayEnd);
            
            // Sustain: hold at sustain level until release
            gainNode.gain.setValueAtTime(this.envelope.sustain, releaseStart);
            
            // Release: ramp down to zero
            gainNode.gain.linearRampToValueAtTime(0, releaseEnd);
            
            // Start oscillator
            oscillator.start(now);
            
            // Stop oscillator after release completes
            oscillator.stop(releaseEnd);
            
            // Track active oscillator
            this.activeOscillators.add(oscillator);
            
            // Clean up after oscillator stops
            oscillator.onended = () => {
                oscillator.disconnect();
                gainNode.disconnect();
                this.activeOscillators.delete(oscillator);
            };
            
            return true;
            
        } catch (error) {
            console.error('Error playing note:', error);
            return false;
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (!this.isInitialized || !this.masterGain) {
            console.warn('Audio engine not initialized');
            return;
        }

        // Clamp volume to valid range
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        // Apply smooth volume change to avoid clicks
        const now = this.audioContext.currentTime;
        this.masterGain.gain.setTargetAtTime(clampedVolume, now, 0.01);
    }

    /**
     * Get current master volume
     * @returns {number} Current volume (0-1)
     */
    getVolume() {
        if (!this.isInitialized || !this.masterGain) {
            return this.defaultVolume;
        }
        return this.masterGain.gain.value;
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        if (!this.isInitialized) {
            return;
        }

        const now = this.audioContext.currentTime;
        
        // Stop all active oscillators with quick fade out
        this.activeOscillators.forEach(oscillator => {
            try {
                oscillator.stop(now + 0.05); // 50ms fade out
            } catch (error) {
                // Oscillator may already be stopped
                console.debug('Error stopping oscillator:', error);
            }
        });
        
        this.activeOscillators.clear();
    }

    /**
     * Resume audio context if suspended (for autoplay policy compliance)
     * @returns {Promise<boolean>} Success status
     */
    async resume() {
        if (!this.audioContext) {
            return false;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('Audio context resumed');
            }
            return true;
        } catch (error) {
            console.error('Error resuming audio context:', error);
            return false;
        }
    }

    /**
     * Get audio context state
     * @returns {string} State: 'suspended', 'running', 'closed', or 'uninitialized'
     */
    getState() {
        if (!this.audioContext) {
            return 'uninitialized';
        }
        return this.audioContext.state;
    }

    /**
     * Check if audio engine is ready to play
     * @returns {boolean} Ready status
     */
    isReady() {
        return this.isInitialized && 
               this.audioContext && 
               this.audioContext.state === 'running';
    }

    /**
     * Get number of currently playing notes
     * @returns {number} Active oscillator count
     */
    getActiveNoteCount() {
        return this.activeOscillators.size;
    }

    /**
     * Clean up and close audio context
     */
    async dispose() {
        if (!this.audioContext) {
            return;
        }

        try {
            // Stop all active notes
            this.stopAllNotes();
            
            // Close audio context
            await this.audioContext.close();
            
            this.audioContext = null;
            this.masterGain = null;
            this.isInitialized = false;
            
            console.log('Audio engine disposed');
        } catch (error) {
            console.error('Error disposing audio engine:', error);
        }
    }
}

// Export singleton instance
export default new AudioEngine();