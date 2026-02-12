/**
 * Application Entry Point
 * Orchestrates initialization of all modules and handles audio context setup
 * Manages autoplay policy compliance and user interaction requirements
 */

import audioEngine from './audio-engine.js';
import xylophone from './xylophone.js';
import inputHandler from './input-handler.js';
import visualFeedback from './visual-feedback.js';
import controls from './controls.js';

class XylophoneApp {
    constructor() {
        this.isInitialized = false;
        this.audioNotice = null;
        this.initializationAttempts = 0;
        this.maxInitializationAttempts = 3;
    }

    /**
     * Initialize the application
     * Called when DOM is ready
     */
    async initialize() {
        console.log('Initializing Interactive Xylophone...');
        
        try {
            // Get audio notice element
            this.audioNotice = document.getElementById('audio-notice');
            
            // Initialize visual feedback first (no audio context needed)
            const visualSuccess = visualFeedback.initialize();
            if (!visualSuccess) {
                throw new Error('Failed to initialize visual feedback');
            }
            
            // Initialize input handler (no audio context needed)
            const inputSuccess = inputHandler.initialize();
            if (!inputSuccess) {
                throw new Error('Failed to initialize input handler');
            }
            
            // Initialize controls (no audio context needed initially)
            controls.initialize(); // Optional, won't throw if elements missing
            
            // Attempt to initialize audio context
            // This may fail due to autoplay policy requiring user gesture
            const audioSuccess = await this.initializeAudio();
            
            if (!audioSuccess) {
                // Show notice to user to click/tap to enable audio
                this.showAudioNotice();
                // Set up one-time click handler to initialize audio
                this.setupAudioInitializationHandler();
            } else {
                this.isInitialized = true;
                console.log('Application initialized successfully');
            }
            
            // Set up error handlers
            this.setupErrorHandlers();
            
            // Log browser compatibility info
            this.logBrowserInfo();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize audio engine
     * @returns {Promise<boolean>} Success status
     */
    async initializeAudio() {
        try {
            const success = await audioEngine.initialize();
            
            if (success) {
                console.log('Audio engine initialized');
                return true;
            } else {
                console.warn('Audio engine initialization failed');
                return false;
            }
        } catch (error) {
            console.warn('Audio engine initialization error:', error);
            return false;
        }
    }

    /**
     * Show audio notice to user
     */
    showAudioNotice() {
        if (this.audioNotice) {
            this.audioNotice.style.display = 'block';
            console.log('Audio notice displayed - user interaction required');
        }
    }

    /**
     * Hide audio notice
     */
    hideAudioNotice() {
        if (this.audioNotice) {
            this.audioNotice.style.display = 'none';
        }
    }

    /**
     * Set up handler to initialize audio on user interaction
     */
    setupAudioInitializationHandler() {
        const initHandler = async (event) => {
            // Prevent multiple initialization attempts
            if (this.isInitialized) {
                return;
            }
            
            this.initializationAttempts++;
            
            console.log('User interaction detected, initializing audio...');
            
            // Try to initialize audio
            const success = await this.initializeAudio();
            
            if (success) {
                // Audio initialized successfully
                this.isInitialized = true;
                this.hideAudioNotice();
                
                // Remove initialization handlers
                document.removeEventListener('click', initHandler);
                document.removeEventListener('touchstart', initHandler);
                document.removeEventListener('keydown', initHandler);
                
                console.log('Audio initialized after user interaction');
                
                // Play a welcome note (optional)
                // xylophone.playNote(0);
            } else {
                // Still failed after user interaction
                if (this.initializationAttempts >= this.maxInitializationAttempts) {
                    this.showErrorMessage('Unable to initialize audio. Please check browser settings.');
                    document.removeEventListener('click', initHandler);
                    document.removeEventListener('touchstart', initHandler);
                    document.removeEventListener('keydown', initHandler);
                }
            }
        };
        
        // Listen for any user interaction
        document.addEventListener('click', initHandler, { once: false });
        document.addEventListener('touchstart', initHandler, { once: false });
        document.addEventListener('keydown', initHandler, { once: false });
    }

    /**
     * Set up global error handlers
     */
    setupErrorHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Don't show error to user for every rejection, just log it
        });
        
        // Handle general errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        // Create error notice if it doesn't exist
        let errorNotice = document.getElementById('error-notice');
        
        if (!errorNotice) {
            errorNotice = document.createElement('div');
            errorNotice.id = 'error-notice';
            errorNotice.className = 'audio-notice';
            errorNotice.style.backgroundColor = '#fee2e2';
            errorNotice.style.color = '#991b1b';
            errorNotice.style.border = '1px solid #fecaca';
            
            const container = document.querySelector('.container');
            if (container) {
                container.appendChild(errorNotice);
            }
        }
        
        errorNotice.innerHTML = `<p>${message}</p>`;
        errorNotice.style.display = 'block';
    }

    /**
     * Log browser compatibility information
     */
    logBrowserInfo() {
        const userAgent = navigator.userAgent;
        const hasWebAudio = !!(window.AudioContext || window.webkitAudioContext);
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        console.log('Browser Info:', {
            userAgent: userAgent,
            webAudioSupport: hasWebAudio,
            touchSupport: hasTouchSupport,
            audioContextState: audioEngine.getState()
        });
        
        // Warn if Web Audio API is not supported
        if (!hasWebAudio) {
            console.error('Web Audio API not supported in this browser');
            this.showErrorMessage('Your browser does not support Web Audio API. Please use a modern browser.');
        }
    }

    /**
     * Check if application is ready
     * @returns {boolean} True if fully initialized
     */
    isReady() {
        return this.isInitialized && audioEngine.isReady();
    }

    /**
     * Get application state
     * @returns {Object} State information
     */
    getState() {
        return {
            initialized: this.isInitialized,
            audioReady: audioEngine.isReady(),
            audioState: audioEngine.getState(),
            activeNotes: xylophone.getActiveNoteCount(),
            activeBars: visualFeedback.getActiveBarCount(),
            recording: controls.isCurrentlyRecording(),
            playing: controls.isCurrentlyPlaying()
        };
    }

    /**
     * Reset application to initial state
     */
    reset() {
        console.log('Resetting application...');
        
        // Stop all audio
        xylophone.stopAllNotes();
        
        // Reset visual feedback
        visualFeedback.reset();
        
        // Reset controls
        controls.reset();
        
        console.log('Application reset complete');
    }

    /**
     * Clean up and dispose of application
     */
    async dispose() {
        console.log('Disposing application...');
        
        // Dispose all modules
        inputHandler.dispose();
        visualFeedback.dispose();
        controls.dispose();
        await audioEngine.dispose();
        
        this.isInitialized = false;
        
        console.log('Application disposed');
    }
}

// Create application instance
const app = new XylophoneApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.initialize();
    });
} else {
    // DOM already loaded
    app.initialize();
}

// Expose app instance globally for debugging
window.xylophoneApp = app;

// Handle page visibility changes (pause/resume audio context)
document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
        console.log('Page hidden, audio context may suspend');
    } else {
        console.log('Page visible, resuming audio context');
        await audioEngine.resume();
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.dispose();
});

// Export for potential module usage
export default app;
