/**
 * Controls Module
 * Manages optional volume control and sequence recording/playback functionality
 * Provides UI interaction handlers for control elements
 */

import audioEngine from './audio-engine.js';
import xylophone from './xylophone.js';
import inputHandler from './input-handler.js';

class Controls {
    constructor() {
        // Volume control elements
        this.volumeSlider = null;
        this.volumeValue = null;
        
        // Recording control elements
        this.recordBtn = null;
        this.playBtn = null;
        this.clearBtn = null;
        this.recordingStatus = null;
        
        // Recording state
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedSequence = [];
        this.recordingStartTime = 0;
        this.maxRecordingLength = 100; // Maximum notes in sequence
        this.playbackTimeout = null;
        
        // Event listeners storage
        this.listeners = [];
        
        // Initialization state
        this.isInitialized = false;
    }

    /**
     * Initialize controls module
     * Sets up event listeners and UI state
     * @returns {boolean} Success status
     */
    initialize() {
        // Get control elements
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.recordBtn = document.getElementById('record-btn');
        this.playBtn = document.getElementById('play-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.recordingStatus = document.getElementById('recording-status');
        
        // Check if control elements exist
        if (!this.volumeSlider || !this.recordBtn) {
            console.warn('Control elements not found, controls disabled');
            return false;
        }
        
        // Set up volume control
        this.setupVolumeControl();
        
        // Set up recording controls
        this.setupRecordingControls();
        
        // Listen for note played events
        this.setupNoteListener();
        
        this.isInitialized = true;
        console.log('Controls initialized');
        return true;
    }

    /**
     * Set up volume control slider and display
     */
    setupVolumeControl() {
        // Set initial volume from audio engine
        const currentVolume = audioEngine.getVolume();
        this.volumeSlider.value = Math.round(currentVolume * 100);
        this.updateVolumeDisplay(currentVolume * 100);
        
        // Volume slider input handler
        const volumeInputHandler = (event) => {
            const volumePercent = parseInt(event.target.value, 10);
            const volumeDecimal = volumePercent / 100;
            
            // Update audio engine volume
            audioEngine.setVolume(volumeDecimal);
            
            // Update display
            this.updateVolumeDisplay(volumePercent);
        };
        
        this.volumeSlider.addEventListener('input', volumeInputHandler);
        
        // Store listener for cleanup
        this.listeners.push({
            element: this.volumeSlider,
            event: 'input',
            handler: volumeInputHandler
        });
    }

    /**
     * Update volume display text
     * @param {number} volumePercent - Volume percentage (0-100)
     */
    updateVolumeDisplay(volumePercent) {
        if (this.volumeValue) {
            this.volumeValue.textContent = `${volumePercent}%`;
        }
    }

    /**
     * Set up recording control buttons
     */
    setupRecordingControls() {
        // Record button handler
        const recordHandler = () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        };
        
        // Play button handler
        const playHandler = () => {
            if (this.isPlaying) {
                this.stopPlayback();
            } else {
                this.playRecording();
            }
        };
        
        // Clear button handler
        const clearHandler = () => {
            this.clearRecording();
        };
        
        this.recordBtn.addEventListener('click', recordHandler);
        this.playBtn.addEventListener('click', playHandler);
        this.clearBtn.addEventListener('click', clearHandler);
        
        // Store listeners for cleanup
        this.listeners.push(
            { element: this.recordBtn, event: 'click', handler: recordHandler },
            { element: this.playBtn, event: 'click', handler: playHandler },
            { element: this.clearBtn, event: 'click', handler: clearHandler }
        );
    }

    /**
     * Set up listener for note played events
     */
    setupNoteListener() {
        const notePlayedHandler = (event) => {
            if (this.isRecording) {
                this.recordNote(event.detail);
            }
        };
        
        document.addEventListener('notePlayed', notePlayedHandler);
        
        // Store listener for cleanup
        this.listeners.push({
            element: document,
            event: 'notePlayed',
            handler: notePlayedHandler
        });
    }

    /**
     * Start recording sequence
     */
    startRecording() {
        if (this.isPlaying) {
            console.warn('Cannot record while playing');
            return;
        }
        
        this.isRecording = true;
        this.recordedSequence = [];
        this.recordingStartTime = Date.now();
        
        // Update UI
        this.recordBtn.classList.add('recording');
        this.recordBtn.innerHTML = `
            <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="6" y="6" width="8" height="8"/>
            </svg>
            Stop
        `;
        this.updateRecordingStatus('Recording...');
        
        console.log('Recording started');
    }

    /**
     * Stop recording sequence
     */
    stopRecording() {
        if (!this.isRecording) {
            return;
        }
        
        this.isRecording = false;
        
        // Update UI
        this.recordBtn.classList.remove('recording');
        this.recordBtn.innerHTML = `
            <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="6"/>
            </svg>
            Record
        `;
        
        // Enable play and clear buttons if sequence has notes
        if (this.recordedSequence.length > 0) {
            this.playBtn.disabled = false;
            this.clearBtn.disabled = false;
            this.updateRecordingStatus(`Recorded ${this.recordedSequence.length} notes`);
        } else {
            this.updateRecordingStatus('No notes recorded');
        }
        
        console.log(`Recording stopped: ${this.recordedSequence.length} notes`);
    }

    /**
     * Record a note to the sequence
     * @param {Object} noteDetail - Note event detail with noteIndex and timestamp
     */
    recordNote(noteDetail) {
        if (!this.isRecording) {
            return;
        }
        
        // Check maximum recording length
        if (this.recordedSequence.length >= this.maxRecordingLength) {
            console.warn('Maximum recording length reached');
            this.stopRecording();
            return;
        }
        
        // Calculate delay from recording start
        const delay = noteDetail.timestamp - this.recordingStartTime;
        
        // Add note to sequence
        this.recordedSequence.push({
            noteIndex: noteDetail.noteIndex,
            delay: delay
        });
        
        // Update status
        this.updateRecordingStatus(`Recording... (${this.recordedSequence.length} notes)`);
    }

    /**
     * Play recorded sequence
     */
    async playRecording() {
        if (this.recordedSequence.length === 0) {
            console.warn('No recording to play');
            return;
        }
        
        if (this.isPlaying) {
            console.warn('Already playing');
            return;
        }
        
        this.isPlaying = true;
        
        // Update UI
        this.playBtn.classList.add('playing');
        this.playBtn.innerHTML = `
            <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="6" y="4" width="3" height="12"/>
                <rect x="11" y="4" width="3" height="12"/>
            </svg>
            Stop
        `;
        this.recordBtn.disabled = true;
        this.clearBtn.disabled = true;
        this.updateRecordingStatus('Playing...');
        
        console.log('Playing recording');
        
        try {
            // Play sequence
            await this.playSequenceWithTiming();
        } catch (error) {
            console.error('Error playing recording:', error);
        } finally {
            this.stopPlayback();
        }
    }

    /**
     * Play sequence with accurate timing
     * @returns {Promise} Resolves when playback completes
     */
    async playSequenceWithTiming() {
        const startTime = Date.now();
        
        for (let i = 0; i < this.recordedSequence.length; i++) {
            if (!this.isPlaying) {
                break; // Playback was stopped
            }
            
            const note = this.recordedSequence[i];
            const targetTime = startTime + note.delay;
            const currentTime = Date.now();
            const waitTime = targetTime - currentTime;
            
            // Wait until target time
            if (waitTime > 0) {
                await new Promise(resolve => {
                    this.playbackTimeout = setTimeout(resolve, waitTime);
                });
            }
            
            // Play note if still playing
            if (this.isPlaying) {
                inputHandler.triggerBar(note.noteIndex);
            }
        }
    }

    /**
     * Stop playback
     */
    stopPlayback() {
        if (!this.isPlaying) {
            return;
        }
        
        this.isPlaying = false;
        
        // Clear any pending timeout
        if (this.playbackTimeout) {
            clearTimeout(this.playbackTimeout);
            this.playbackTimeout = null;
        }
        
        // Update UI
        this.playBtn.classList.remove('playing');
        this.playBtn.innerHTML = `
            <svg class="icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
            Play
        `;
        this.recordBtn.disabled = false;
        this.clearBtn.disabled = false;
        this.updateRecordingStatus(`Recorded ${this.recordedSequence.length} notes`);
        
        console.log('Playback stopped');
    }

    /**
     * Clear recorded sequence
     */
    clearRecording() {
        if (this.isPlaying) {
            this.stopPlayback();
        }
        
        this.recordedSequence = [];
        
        // Update UI
        this.playBtn.disabled = true;
        this.clearBtn.disabled = true;
        this.updateRecordingStatus('');
        
        console.log('Recording cleared');
    }

    /**
     * Update recording status display
     * @param {string} message - Status message
     */
    updateRecordingStatus(message) {
        if (this.recordingStatus) {
            this.recordingStatus.textContent = message;
        }
    }

    /**
     * Get current volume percentage
     * @returns {number} Volume percentage (0-100)
     */
    getVolume() {
        if (!this.volumeSlider) {
            return 70; // Default
        }
        return parseInt(this.volumeSlider.value, 10);
    }

    /**
     * Set volume percentage
     * @param {number} volumePercent - Volume percentage (0-100)
     */
    setVolume(volumePercent) {
        if (!this.volumeSlider) {
            return;
        }
        
        // Clamp to valid range
        const clampedVolume = Math.max(0, Math.min(100, volumePercent));
        
        // Update slider
        this.volumeSlider.value = clampedVolume;
        
        // Update audio engine
        audioEngine.setVolume(clampedVolume / 100);
        
        // Update display
        this.updateVolumeDisplay(clampedVolume);
    }

    /**
     * Get recorded sequence
     * @returns {Array} Array of recorded notes
     */
    getRecordedSequence() {
        return [...this.recordedSequence];
    }

    /**
     * Check if currently recording
     * @returns {boolean} True if recording
     */
    isCurrentlyRecording() {
        return this.isRecording;
    }

    /**
     * Check if currently playing
     * @returns {boolean} True if playing
     */
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    /**
     * Get recording length
     * @returns {number} Number of recorded notes
     */
    getRecordingLength() {
        return this.recordedSequence.length;
    }

    /**
     * Set maximum recording length
     * @param {number} maxLength - Maximum number of notes
     */
    setMaxRecordingLength(maxLength) {
        if (maxLength > 0 && maxLength <= 500) {
            this.maxRecordingLength = maxLength;
        } else {
            console.warn('Invalid max recording length, must be between 1 and 500');
        }
    }

    /**
     * Export recorded sequence as JSON
     * @returns {string} JSON string of sequence
     */
    exportSequence() {
        return JSON.stringify(this.recordedSequence, null, 2);
    }

    /**
     * Import sequence from JSON
     * @param {string} jsonString - JSON string of sequence
     * @returns {boolean} Success status
     */
    importSequence(jsonString) {
        try {
            const sequence = JSON.parse(jsonString);
            
            // Validate sequence format
            if (!Array.isArray(sequence)) {
                throw new Error('Invalid sequence format');
            }
            
            // Validate each note
            for (const note of sequence) {
                if (typeof note.noteIndex !== 'number' || typeof note.delay !== 'number') {
                    throw new Error('Invalid note format');
                }
            }
            
            this.recordedSequence = sequence;
            
            // Update UI
            if (this.recordedSequence.length > 0) {
                this.playBtn.disabled = false;
                this.clearBtn.disabled = false;
                this.updateRecordingStatus(`Imported ${this.recordedSequence.length} notes`);
            }
            
            console.log('Sequence imported successfully');
            return true;
            
        } catch (error) {
            console.error('Error importing sequence:', error);
            return false;
        }
    }

    /**
     * Reset controls to initial state
     */
    reset() {
        // Stop any active recording or playback
        if (this.isRecording) {
            this.stopRecording();
        }
        if (this.isPlaying) {
            this.stopPlayback();
        }
        
        // Clear recording
        this.clearRecording();
        
        // Reset volume to default
        this.setVolume(70);
        
        console.log('Controls reset');
    }

    /**
     * Clean up and dispose of controls
     */
    dispose() {
        // Stop any active operations
        this.reset();
        
        // Remove all event listeners
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
        
        // Clear references
        this.volumeSlider = null;
        this.volumeValue = null;
        this.recordBtn = null;
        this.playBtn = null;
        this.clearBtn = null;
        this.recordingStatus = null;
        this.recordedSequence = [];
        
        this.isInitialized = false;
        
        console.log('Controls disposed');
    }
}

// Export singleton instance
export default new Controls();
