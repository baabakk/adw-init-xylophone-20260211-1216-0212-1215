/**
 * Input Handler Module
 * Manages user input events: mouse clicks, touch events, and keyboard presses
 * Handles debouncing, hybrid device support, and event coordination
 */

import xylophone from './xylophone.js';
import visualFeedback from './visual-feedback.js';

class InputHandler {
    constructor() {
        // Debouncing configuration
        this.keyDebounceTime = 100; // ms between repeated key presses
        this.lastKeyPress = new Map(); // Track last press time per key
        
        // Touch/mouse hybrid device handling
        this.touchActive = false;
        this.touchTimeout = null;
        this.touchDebounceTime = 300; // ms to ignore mouse after touch
        
        // Keyboard repeat prevention
        this.keysCurrentlyPressed = new Set();
        
        // Event listeners storage for cleanup
        this.listeners = [];
        
        // Bar elements cache
        this.barElements = [];
    }

    /**
     * Initialize input handlers
     * Sets up all event listeners for mouse, touch, and keyboard
     */
    initialize() {
        // Cache bar elements
        this.barElements = Array.from(document.querySelectorAll('.bar'));
        
        if (this.barElements.length === 0) {
            console.error('No xylophone bars found in DOM');
            return false;
        }

        // Set up mouse event listeners
        this.setupMouseEvents();
        
        // Set up touch event listeners
        this.setupTouchEvents();
        
        // Set up keyboard event listeners
        this.setupKeyboardEvents();
        
        console.log('Input handler initialized');
        return true;
    }

    /**
     * Set up mouse event listeners for each bar
     */
    setupMouseEvents() {
        this.barElements.forEach((bar, index) => {
            // Mouse click handler
            const clickHandler = (event) => {
                event.preventDefault();
                
                // Ignore mouse events shortly after touch (hybrid device handling)
                if (this.touchActive) {
                    return;
                }
                
                this.handleBarActivation(index);
            };
            
            // Mouse enter handler for hover effects (optional enhancement)
            const mouseEnterHandler = () => {
                if (!this.touchActive) {
                    bar.classList.add('hover');
                }
            };
            
            // Mouse leave handler
            const mouseLeaveHandler = () => {
                bar.classList.remove('hover');
            };
            
            bar.addEventListener('click', clickHandler);
            bar.addEventListener('mouseenter', mouseEnterHandler);
            bar.addEventListener('mouseleave', mouseLeaveHandler);
            
            // Store listeners for cleanup
            this.listeners.push(
                { element: bar, event: 'click', handler: clickHandler },
                { element: bar, event: 'mouseenter', handler: mouseEnterHandler },
                { element: bar, event: 'mouseleave', handler: mouseLeaveHandler }
            );
        });
    }

    /**
     * Set up touch event listeners for each bar
     */
    setupTouchEvents() {
        this.barElements.forEach((bar, index) => {
            // Touch start handler
            const touchStartHandler = (event) => {
                event.preventDefault();
                
                // Mark touch as active to suppress mouse events
                this.touchActive = true;
                
                // Clear any existing touch timeout
                if (this.touchTimeout) {
                    clearTimeout(this.touchTimeout);
                }
                
                // Reset touch active flag after debounce period
                this.touchTimeout = setTimeout(() => {
                    this.touchActive = false;
                }, this.touchDebounceTime);
                
                this.handleBarActivation(index);
            };
            
            // Touch end handler
            const touchEndHandler = (event) => {
                event.preventDefault();
            };
            
            bar.addEventListener('touchstart', touchStartHandler, { passive: false });
            bar.addEventListener('touchend', touchEndHandler, { passive: false });
            
            // Store listeners for cleanup
            this.listeners.push(
                { element: bar, event: 'touchstart', handler: touchStartHandler },
                { element: bar, event: 'touchend', handler: touchEndHandler }
            );
        });
    }

    /**
     * Set up keyboard event listeners
     */
    setupKeyboardEvents() {
        // Keydown handler
        const keyDownHandler = (event) => {
            const key = event.key;
            
            // Check if key is mapped to a note
            const noteIndex = xylophone.getNoteIndexForKey(key);
            if (noteIndex === null) {
                return; // Key not mapped
            }
            
            // Prevent default behavior for mapped keys
            event.preventDefault();
            
            // Prevent key repeat (holding down key)
            if (this.keysCurrentlyPressed.has(key)) {
                return;
            }
            
            // Check debounce timing
            const now = Date.now();
            const lastPress = this.lastKeyPress.get(key) || 0;
            
            if (now - lastPress < this.keyDebounceTime) {
                return; // Too soon after last press
            }
            
            // Mark key as pressed
            this.keysCurrentlyPressed.add(key);
            this.lastKeyPress.set(key, now);
            
            // Activate the corresponding bar
            this.handleBarActivation(noteIndex);
        };
        
        // Keyup handler
        const keyUpHandler = (event) => {
            const key = event.key;
            
            // Remove key from currently pressed set
            this.keysCurrentlyPressed.delete(key);
        };
        
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        
        // Store listeners for cleanup
        this.listeners.push(
            { element: document, event: 'keydown', handler: keyDownHandler },
            { element: document, event: 'keyup', handler: keyUpHandler }
        );
    }

    /**
     * Handle bar activation (from any input source)
     * Coordinates note playing and visual feedback
     * @param {number} noteIndex - Index of note/bar to activate
     */
    handleBarActivation(noteIndex) {
        // Validate note index
        if (!xylophone.isValidNoteIndex(noteIndex)) {
            console.warn(`Invalid note index: ${noteIndex}`);
            return;
        }

        // Play the note
        const success = xylophone.playNote(noteIndex);
        
        if (success) {
            // Trigger visual feedback
            visualFeedback.activateBar(noteIndex);
            
            // Emit custom event for other modules (e.g., recording)
            this.emitNoteEvent(noteIndex);
        }
    }

    /**
     * Emit custom event when note is played
     * @param {number} noteIndex - Index of played note
     */
    emitNoteEvent(noteIndex) {
        const event = new CustomEvent('notePlayed', {
            detail: {
                noteIndex: noteIndex,
                timestamp: Date.now(),
                noteInfo: xylophone.getNoteInfo(noteIndex)
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Get bar element by note index
     * @param {number} noteIndex - Index of note
     * @returns {HTMLElement|null} Bar element or null
     */
    getBarElement(noteIndex) {
        if (noteIndex >= 0 && noteIndex < this.barElements.length) {
            return this.barElements[noteIndex];
        }
        return null;
    }

    /**
     * Programmatically trigger a bar (for playback/demo)
     * @param {number} noteIndex - Index of note to trigger
     */
    triggerBar(noteIndex) {
        this.handleBarActivation(noteIndex);
    }

    /**
     * Set key debounce time
     * @param {number} time - Debounce time in milliseconds
     */
    setKeyDebounceTime(time) {
        if (time >= 0 && time <= 1000) {
            this.keyDebounceTime = time;
        } else {
            console.warn('Invalid debounce time, must be between 0 and 1000ms');
        }
    }

    /**
     * Get key debounce time
     * @returns {number} Debounce time in milliseconds
     */
    getKeyDebounceTime() {
        return this.keyDebounceTime;
    }

    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean} True if key is pressed
     */
    isKeyPressed(key) {
        return this.keysCurrentlyPressed.has(key);
    }

    /**
     * Get all currently pressed keys
     * @returns {Array} Array of pressed keys
     */
    getPressedKeys() {
        return Array.from(this.keysCurrentlyPressed);
    }

    /**
     * Enable or disable input handling
     * @param {boolean} enabled - True to enable, false to disable
     */
    setEnabled(enabled) {
        this.barElements.forEach(bar => {
            if (enabled) {
                bar.style.pointerEvents = 'auto';
                bar.removeAttribute('disabled');
            } else {
                bar.style.pointerEvents = 'none';
                bar.setAttribute('disabled', 'true');
            }
        });
    }

    /**
     * Clean up event listeners
     */
    dispose() {
        // Remove all event listeners
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Clear listeners array
        this.listeners = [];
        
        // Clear touch timeout
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
        
        // Clear state
        this.keysCurrentlyPressed.clear();
        this.lastKeyPress.clear();
        this.barElements = [];
        
        console.log('Input handler disposed');
    }
}

// Export singleton instance
export default new InputHandler();