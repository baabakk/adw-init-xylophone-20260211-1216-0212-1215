/**
 * Visual Feedback Module
 * Manages visual feedback animations for bar activation and state management
 * Coordinates with input handler to provide immediate visual response
 */

class VisualFeedback {
    constructor() {
        // Bar elements cache
        this.barElements = [];
        
        // Animation configuration
        this.activeDuration = 300; // ms - how long the active state persists
        this.animationClass = 'active';
        
        // Active animation tracking
        this.activeTimeouts = new Map();
        
        // Animation state
        this.isInitialized = false;
    }

    /**
     * Initialize visual feedback system
     * Caches bar elements and sets up animation infrastructure
     * @returns {boolean} Success status
     */
    initialize() {
        // Cache all bar elements
        this.barElements = Array.from(document.querySelectorAll('.bar'));
        
        if (this.barElements.length === 0) {
            console.error('No xylophone bars found for visual feedback');
            return false;
        }
        
        // Ensure CSS animations are available
        this.validateAnimationSupport();
        
        this.isInitialized = true;
        console.log('Visual feedback system initialized');
        return true;
    }

    /**
     * Validate that CSS animation support is available
     */
    validateAnimationSupport() {
        const testElement = this.barElements[0];
        const computedStyle = window.getComputedStyle(testElement);
        
        // Check for transition support
        if (!computedStyle.transition && !computedStyle.webkitTransition) {
            console.warn('CSS transitions not supported, animations may not work');
        }
    }

    /**
     * Activate visual feedback for a bar
     * Adds active class and schedules removal after duration
     * @param {number} noteIndex - Index of bar to activate (0-10)
     * @returns {boolean} Success status
     */
    activateBar(noteIndex) {
        if (!this.isInitialized) {
            console.warn('Visual feedback not initialized');
            return false;
        }
        
        // Validate note index
        if (noteIndex < 0 || noteIndex >= this.barElements.length) {
            console.warn(`Invalid note index for visual feedback: ${noteIndex}`);
            return false;
        }
        
        const bar = this.barElements[noteIndex];
        
        // Clear any existing timeout for this bar
        if (this.activeTimeouts.has(noteIndex)) {
            clearTimeout(this.activeTimeouts.get(noteIndex));
            this.activeTimeouts.delete(noteIndex);
        }
        
        // Add active class for animation
        bar.classList.add(this.animationClass);
        
        // Schedule removal of active class
        const timeout = setTimeout(() => {
            bar.classList.remove(this.animationClass);
            this.activeTimeouts.delete(noteIndex);
        }, this.activeDuration);
        
        this.activeTimeouts.set(noteIndex, timeout);
        
        return true;
    }

    /**
     * Deactivate visual feedback for a bar immediately
     * @param {number} noteIndex - Index of bar to deactivate
     * @returns {boolean} Success status
     */
    deactivateBar(noteIndex) {
        if (!this.isInitialized) {
            return false;
        }
        
        if (noteIndex < 0 || noteIndex >= this.barElements.length) {
            return false;
        }
        
        const bar = this.barElements[noteIndex];
        
        // Clear timeout if exists
        if (this.activeTimeouts.has(noteIndex)) {
            clearTimeout(this.activeTimeouts.get(noteIndex));
            this.activeTimeouts.delete(noteIndex);
        }
        
        // Remove active class
        bar.classList.remove(this.animationClass);
        
        return true;
    }

    /**
     * Check if a bar is currently active
     * @param {number} noteIndex - Index of bar to check
     * @returns {boolean} True if bar is active
     */
    isBarActive(noteIndex) {
        if (!this.isInitialized || noteIndex < 0 || noteIndex >= this.barElements.length) {
            return false;
        }
        
        return this.barElements[noteIndex].classList.contains(this.animationClass);
    }

    /**
     * Get bar element by index
     * @param {number} noteIndex - Index of bar
     * @returns {HTMLElement|null} Bar element or null
     */
    getBarElement(noteIndex) {
        if (!this.isInitialized || noteIndex < 0 || noteIndex >= this.barElements.length) {
            return null;
        }
        return this.barElements[noteIndex];
    }

    /**
     * Set active duration for animations
     * @param {number} duration - Duration in milliseconds
     */
    setActiveDuration(duration) {
        if (duration > 0 && duration <= 2000) {
            this.activeDuration = duration;
        } else {
            console.warn('Invalid active duration, must be between 0 and 2000ms');
        }
    }

    /**
     * Get current active duration
     * @returns {number} Duration in milliseconds
     */
    getActiveDuration() {
        return this.activeDuration;
    }

    /**
     * Deactivate all bars immediately
     */
    deactivateAllBars() {
        if (!this.isInitialized) {
            return;
        }
        
        // Clear all timeouts
        this.activeTimeouts.forEach((timeout, noteIndex) => {
            clearTimeout(timeout);
            this.barElements[noteIndex].classList.remove(this.animationClass);
        });
        
        this.activeTimeouts.clear();
    }

    /**
     * Get count of currently active bars
     * @returns {number} Number of active bars
     */
    getActiveBarCount() {
        return this.activeTimeouts.size;
    }

    /**
     * Get array of currently active bar indices
     * @returns {Array<number>} Array of active bar indices
     */
    getActiveBars() {
        return Array.from(this.activeTimeouts.keys());
    }

    /**
     * Add custom CSS class to a bar
     * @param {number} noteIndex - Index of bar
     * @param {string} className - CSS class to add
     * @returns {boolean} Success status
     */
    addBarClass(noteIndex, className) {
        if (!this.isInitialized || noteIndex < 0 || noteIndex >= this.barElements.length) {
            return false;
        }
        
        this.barElements[noteIndex].classList.add(className);
        return true;
    }

    /**
     * Remove custom CSS class from a bar
     * @param {number} noteIndex - Index of bar
     * @param {string} className - CSS class to remove
     * @returns {boolean} Success status
     */
    removeBarClass(noteIndex, className) {
        if (!this.isInitialized || noteIndex < 0 || noteIndex >= this.barElements.length) {
            return false;
        }
        
        this.barElements[noteIndex].classList.remove(className);
        return true;
    }

    /**
     * Pulse animation for a bar (multiple quick activations)
     * @param {number} noteIndex - Index of bar to pulse
     * @param {number} count - Number of pulses (default: 3)
     * @param {number} interval - Interval between pulses in ms (default: 150)
     * @returns {Promise} Resolves when pulse sequence completes
     */
    async pulseBar(noteIndex, count = 3, interval = 150) {
        if (!this.isInitialized || noteIndex < 0 || noteIndex >= this.barElements.length) {
            return Promise.reject('Invalid bar index or not initialized');
        }
        
        for (let i = 0; i < count; i++) {
            this.activateBar(noteIndex);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    /**
     * Highlight all bars in sequence (wave effect)
     * @param {number} interval - Interval between bars in ms (default: 100)
     * @returns {Promise} Resolves when sequence completes
     */
    async highlightSequence(interval = 100) {
        if (!this.isInitialized) {
            return Promise.reject('Visual feedback not initialized');
        }
        
        for (let i = 0; i < this.barElements.length; i++) {
            this.activateBar(i);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    /**
     * Set custom animation class name
     * @param {string} className - CSS class name for active state
     */
    setAnimationClass(className) {
        if (typeof className === 'string' && className.length > 0) {
            this.animationClass = className;
        } else {
            console.warn('Invalid animation class name');
        }
    }

    /**
     * Get current animation class name
     * @returns {string} Animation class name
     */
    getAnimationClass() {
        return this.animationClass;
    }

    /**
     * Reset visual feedback system
     * Clears all active states and timeouts
     */
    reset() {
        this.deactivateAllBars();
        console.log('Visual feedback system reset');
    }

    /**
     * Clean up and dispose of visual feedback system
     */
    dispose() {
        // Clear all timeouts
        this.deactivateAllBars();
        
        // Clear references
        this.barElements = [];
        this.activeTimeouts.clear();
        this.isInitialized = false;
        
        console.log('Visual feedback system disposed');
    }
}

// Export singleton instance
export default new VisualFeedback();
