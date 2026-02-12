/**
 * Xylophone Module
 * Core xylophone logic managing note mapping, frequency calculation, and note triggering
 * Handles polyphony and coordinates with audio engine
 */

import audioEngine from './audio-engine.js';

class Xylophone {
    constructor() {
        // Musical note configuration - C major scale across 11 notes
        // Starting from C4 (middle C) and going up
        this.notes = [
            { name: 'C4', frequency: 261.63 },  // Note 0
            { name: 'D4', frequency: 293.66 },  // Note 1
            { name: 'E4', frequency: 329.63 },  // Note 2
            { name: 'F4', frequency: 349.23 },  // Note 3
            { name: 'G4', frequency: 392.00 },  // Note 4
            { name: 'A4', frequency: 440.00 },  // Note 5 (concert A)
            { name: 'B4', frequency: 493.88 },  // Note 6
            { name: 'C5', frequency: 523.25 },  // Note 7 (octave up)
            { name: 'D5', frequency: 587.33 },  // Note 8
            { name: 'E5', frequency: 659.25 },  // Note 9
            { name: 'F5', frequency: 698.46 }   // Note 10
        ];
        
        // Keyboard mapping - maps keyboard keys to note indices
        this.keyMap = {
            'a': 0, 'A': 0,
            's': 1, 'S': 1,
            'd': 2, 'D': 2,
            'f': 3, 'F': 3,
            'g': 4, 'G': 4,
            'h': 5, 'H': 5,
            'j': 6, 'J': 6,
            'k': 7, 'K': 7,
            'l': 8, 'L': 8,
            ';': 9, ':': 9,
            "'": 10, '"': 10
        };
        
        // Note duration in seconds
        this.noteDuration = 2.0;
        
        // Polyphony tracking - currently playing notes
        this.activeNotes = new Set();
        
        // Maximum simultaneous notes (prevent audio context overload)
        this.maxPolyphony = 20;
    }

    /**
     * Play a note by index
     * @param {number} noteIndex - Index of note to play (0-10)
     * @returns {boolean} Success status
     */
    playNote(noteIndex) {
        // Validate note index
        if (noteIndex < 0 || noteIndex >= this.notes.length) {
            console.warn(`Invalid note index: ${noteIndex}`);
            return false;
        }

        // Check polyphony limit
        if (this.activeNotes.size >= this.maxPolyphony) {
            console.warn('Maximum polyphony reached, skipping note');
            return false;
        }

        // Get note configuration
        const note = this.notes[noteIndex];
        
        // Play note through audio engine
        const success = audioEngine.playNote(note.frequency, this.noteDuration);
        
        if (success) {
            // Track active note
            this.activeNotes.add(noteIndex);
            
            // Remove from active notes after duration
            setTimeout(() => {
                this.activeNotes.delete(noteIndex);
            }, this.noteDuration * 1000);
            
            console.debug(`Playing note ${note.name} (${note.frequency}Hz)`);
        }
        
        return success;
    }

    /**
     * Play a note by keyboard key
     * @param {string} key - Keyboard key character
     * @returns {boolean} Success status
     */
    playNoteByKey(key) {
        const noteIndex = this.keyMap[key];
        
        if (noteIndex === undefined) {
            console.debug(`No note mapped to key: ${key}`);
            return false;
        }
        
        return this.playNote(noteIndex);
    }

    /**
     * Get note information by index
     * @param {number} noteIndex - Index of note (0-10)
     * @returns {Object|null} Note object with name and frequency, or null if invalid
     */
    getNoteInfo(noteIndex) {
        if (noteIndex < 0 || noteIndex >= this.notes.length) {
            return null;
        }
        return { ...this.notes[noteIndex] };
    }

    /**
     * Get note index for a keyboard key
     * @param {string} key - Keyboard key character
     * @returns {number|null} Note index or null if not mapped
     */
    getNoteIndexForKey(key) {
        const index = this.keyMap[key];
        return index !== undefined ? index : null;
    }

    /**
     * Get all note information
     * @returns {Array} Array of note objects
     */
    getAllNotes() {
        return this.notes.map(note => ({ ...note }));
    }

    /**
     * Get keyboard mapping
     * @returns {Object} Key to note index mapping
     */
    getKeyMap() {
        return { ...this.keyMap };
    }

    /**
     * Check if a note is currently playing
     * @param {number} noteIndex - Index of note to check
     * @returns {boolean} True if note is active
     */
    isNotePlaying(noteIndex) {
        return this.activeNotes.has(noteIndex);
    }

    /**
     * Get count of currently playing notes
     * @returns {number} Number of active notes
     */
    getActiveNoteCount() {
        return this.activeNotes.size;
    }

    /**
     * Stop all currently playing notes
     */
    stopAllNotes() {
        audioEngine.stopAllNotes();
        this.activeNotes.clear();
    }

    /**
     * Set note duration
     * @param {number} duration - Duration in seconds
     */
    setNoteDuration(duration) {
        if (duration > 0 && duration <= 10) {
            this.noteDuration = duration;
        } else {
            console.warn('Invalid note duration, must be between 0 and 10 seconds');
        }
    }

    /**
     * Get current note duration
     * @returns {number} Duration in seconds
     */
    getNoteDuration() {
        return this.noteDuration;
    }

    /**
     * Set maximum polyphony
     * @param {number} maxNotes - Maximum simultaneous notes
     */
    setMaxPolyphony(maxNotes) {
        if (maxNotes > 0 && maxNotes <= 50) {
            this.maxPolyphony = maxNotes;
        } else {
            console.warn('Invalid polyphony limit, must be between 1 and 50');
        }
    }

    /**
     * Get maximum polyphony
     * @returns {number} Maximum simultaneous notes
     */
    getMaxPolyphony() {
        return this.maxPolyphony;
    }

    /**
     * Play a sequence of notes
     * @param {Array} sequence - Array of {noteIndex, delay} objects
     * @returns {Promise} Resolves when sequence completes
     */
    async playSequence(sequence) {
        if (!Array.isArray(sequence) || sequence.length === 0) {
            console.warn('Invalid sequence');
            return;
        }

        for (const item of sequence) {
            if (item.delay > 0) {
                await new Promise(resolve => setTimeout(resolve, item.delay));
            }
            
            if (item.noteIndex !== undefined) {
                this.playNote(item.noteIndex);
            }
        }
    }

    /**
     * Get total number of notes
     * @returns {number} Total note count
     */
    getNoteCount() {
        return this.notes.length;
    }

    /**
     * Validate note index
     * @param {number} noteIndex - Index to validate
     * @returns {boolean} True if valid
     */
    isValidNoteIndex(noteIndex) {
        return Number.isInteger(noteIndex) && 
               noteIndex >= 0 && 
               noteIndex < this.notes.length;
    }
}

// Export singleton instance
export default new Xylophone();