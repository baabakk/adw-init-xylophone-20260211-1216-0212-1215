# Interactive Xylophone

A browser-based interactive xylophone application that runs entirely in your browser with no external dependencies. Play musical notes using mouse clicks, touch gestures, or keyboard keys, with real-time audio synthesis powered by the Web Audio API.

## Features

- **11-note xylophone** with visually distinct, colorful bars
- **Multiple input methods**: mouse clicks, touch gestures, and keyboard keys
- **Real-time audio synthesis** using Web Audio API (no external audio files)
- **Percussive xylophone tone** with ADSR envelope for realistic sound
- **Polyphonic playback** supporting overlapping notes
- **Visual feedback** with smooth animations when bars are activated
- **Volume control** with real-time adjustment
- **Sequence recording** to capture and replay your melodies
- **Fully offline** - works without internet connection after initial load
- **Zero dependencies** - pure HTML, CSS, and JavaScript
- **Responsive design** adapting to different screen sizes

## Quick Start

### Running the Application

1. **Download** all files to a local directory
2. **Open** `index.html` in a modern web browser
3. **Click anywhere** on the page to enable audio (required by browser autoplay policies)
4. **Start playing** by clicking bars, tapping on touch devices, or pressing keyboard keys

That's it! No installation, no build process, no server required.

### Keyboard Controls

The xylophone is mapped to the following keyboard keys (home row and adjacent keys):

```
A  S  D  F  G  H  J  K  L  ;  '
C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5
```

- **A** = C4 (middle C)
- **S** = D4
- **D** = E4
- **F** = F4
- **G** = G4
- **H** = A4 (concert A, 440 Hz)
- **J** = B4
- **K** = C5 (octave up)
- **L** = D5
- **;** = E5
- **'** = F5

## Browser Compatibility

### Supported Browsers

The application requires Web Audio API support and works in:

- **Chrome/Edge**: Version 34+ (recommended)
- **Firefox**: Version 25+
- **Safari**: Version 14.1+
- **Opera**: Version 21+

### Feature Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ✅ | ✅ |
| ES6 Modules | ✅ | ✅ | ✅ | ✅ |
| CSS Animations | ✅ | ✅ | ✅ | ✅ |

### Known Limitations

- **Internet Explorer**: Not supported (lacks Web Audio API)
- **Older mobile browsers**: May have limited audio support
- **iOS Safari < 14.1**: Web Audio API support is limited

## Technical Architecture

### Module Structure

The application uses a modular JavaScript architecture with clear separation of concerns:

```
app.js (orchestrator)
├── audio-engine.js (Web Audio API wrapper)
├── xylophone.js (note mapping and triggering)
├── input-handler.js (user input processing)
├── visual-feedback.js (UI animations)
└── controls.js (volume and recording)
```

### Audio Engine (`audio-engine.js`)

- Manages Web Audio API `AudioContext`
- Creates oscillators for tone generation
- Implements ADSR envelope for percussive sound:
  - **Attack**: 5ms (fast strike)
  - **Decay**: 100ms (quick drop)
  - **Sustain**: 30% level (natural resonance)
  - **Release**: 1.2s (long tail)
- Handles master volume control
- Tracks active oscillators for polyphony management

### Xylophone Module (`xylophone.js`)

- Defines 11-note C major scale (C4 to F5)
- Maps keyboard keys to note indices
- Coordinates with audio engine for note playback
- Manages polyphony limits (max 20 simultaneous notes)
- Provides note information and validation

### Input Handler (`input-handler.js`)

- Processes mouse clicks, touch events, and keyboard presses
- Implements debouncing to prevent rapid repeated triggers
- Handles hybrid devices (touch + mouse)
- Prevents keyboard repeat when holding keys
- Emits custom events for note playback

### Visual Feedback (`visual-feedback.js`)

- Manages CSS class-based animations
- Activates bars with 300ms animation duration
- Tracks active animation states
- Provides utility methods for visual effects

### Controls (`controls.js`)

- Implements volume slider with real-time adjustment
- Provides sequence recording functionality:
  - Records note index and timing
  - Supports up to 100 notes per sequence
  - Accurate playback with timing preservation
- Handles UI state for recording controls

### Application Entry (`app.js`)

- Orchestrates module initialization
- Handles browser autoplay policy compliance
- Manages audio context lifecycle
- Provides error handling and user feedback
- Logs browser compatibility information

## Usage Guide

### Playing Notes

**Mouse/Trackpad:**
- Click any xylophone bar to play its note
- Bars light up and animate when activated

**Touch (Mobile/Tablet):**
- Tap any bar to play its note
- Multi-touch supported for chords

**Keyboard:**
- Press keys A, S, D, F, G, H, J, K, L, ;, ' to play notes
- Hold multiple keys for chords

### Volume Control

1. Locate the volume slider in the controls section
2. Drag the slider left (quieter) or right (louder)
3. Volume adjusts in real-time from 0% to 100%
4. Default volume is 70%

### Recording Sequences

**To Record:**
1. Click the **Record** button (red circle icon)
2. Play notes using any input method
3. Click **Stop** (square icon) when finished
4. Status shows number of recorded notes

**To Play Back:**
1. Click the **Play** button (triangle icon)
2. Recording plays with original timing preserved
3. Click **Stop** to interrupt playback

**To Clear:**
1. Click the **Clear** button (trash icon)
2. Recording is deleted and buttons are disabled

### Tips for Best Experience

- **Enable audio**: Click anywhere on the page if you see "Click anywhere to enable audio"
- **Use headphones**: For best audio quality and latency
- **Experiment**: Try playing scales, chords, and melodies
- **Record patterns**: Capture interesting sequences to replay later
- **Adjust volume**: Find comfortable listening level

## Troubleshooting

### No Sound

**Problem**: Clicking bars produces no audio

**Solutions**:
1. **Check browser compatibility**: Ensure you're using a supported browser (Chrome 34+, Firefox 25+, Safari 14.1+, Edge 79+)
2. **Enable audio**: Click anywhere on the page to initialize audio context (required by browser autoplay policies)
3. **Check volume**: Ensure volume slider is not at 0% and system volume is up
4. **Check mute**: Verify browser tab is not muted (check tab icon)
5. **Reload page**: Refresh the browser and try again
6. **Check console**: Open browser DevTools (F12) and check for error messages

### Audio Latency

**Problem**: Delay between clicking and hearing sound

**Solutions**:
1. **Use Chrome**: Chrome typically has lowest Web Audio API latency
2. **Close other tabs**: Reduce browser resource usage
3. **Disable extensions**: Some extensions can interfere with audio
4. **Check system load**: Close unnecessary applications
5. **Use wired audio**: Bluetooth can add latency

### Visual Issues

**Problem**: Bars not displaying correctly or animations not working

**Solutions**:
1. **Check browser version**: Update to latest version
2. **Enable hardware acceleration**: Check browser settings
3. **Zoom level**: Reset browser zoom to 100%
4. **Clear cache**: Clear browser cache and reload
5. **Try different browser**: Test in another supported browser

### Touch Not Working

**Problem**: Tapping bars on mobile/tablet doesn't work

**Solutions**:
1. **Check touch support**: Verify device has touch capability
2. **Reload page**: Refresh browser
3. **Try different browser**: Test in Chrome or Safari mobile
4. **Check zoom**: Ensure page is not zoomed in/out
5. **Enable JavaScript**: Verify JavaScript is enabled

### Recording Issues

**Problem**: Recording doesn't capture notes or playback fails

**Solutions**:
1. **Check recording status**: Verify "Recording..." appears when recording
2. **Play notes while recording**: Ensure you're playing notes after clicking Record
3. **Don't exceed limit**: Maximum 100 notes per recording
4. **Stop before playing**: Click Stop before attempting playback
5. **Clear and retry**: Click Clear and start a new recording

### Browser Console Errors

**Problem**: Errors appear in browser console (F12)

**Common errors and solutions**:

- **"Web Audio API not supported"**: Update browser or use supported browser
- **"AudioContext was not allowed to start"**: Click page to enable audio
- **"Failed to initialize audio engine"**: Reload page and try again
- **"Invalid note index"**: This is a bug - please report with steps to reproduce

### Performance Issues

**Problem**: Application is slow or unresponsive

**Solutions**:
1. **Close other tabs**: Reduce browser memory usage
2. **Disable extensions**: Temporarily disable browser extensions
3. **Clear browser data**: Clear cache and cookies
4. **Restart browser**: Close and reopen browser
5. **Check system resources**: Close unnecessary applications

## File Structure

```
interactive-xylophone/
├── index.html          # Main HTML structure
├── styles.css          # Visual styling and animations
├── audio-engine.js     # Web Audio API wrapper
├── xylophone.js        # Note mapping and triggering
├── input-handler.js    # User input processing
├── visual-feedback.js  # Visual animations
├── controls.js         # Volume and recording controls
├── app.js              # Application orchestrator
└── README.md           # This file
```

## Technical Details

### Audio Synthesis

- **Oscillator type**: Sine wave (pure tone)
- **Frequency range**: 261.63 Hz (C4) to 698.46 Hz (F5)
- **Sample rate**: Browser default (typically 44.1 kHz or 48 kHz)
- **Bit depth**: 32-bit float (Web Audio API standard)
- **Polyphony**: Up to 20 simultaneous notes
- **Latency**: <50ms (typically 10-20ms on modern browsers)

### Note Frequencies

| Note | Frequency (Hz) | Keyboard Key |
|------|----------------|-------------|
| C4   | 261.63         | A           |
| D4   | 293.66         | S           |
| E4   | 329.63         | D           |
| F4   | 349.23         | F           |
| G4   | 392.00         | G           |
| A4   | 440.00         | H           |
| B4   | 493.88         | J           |
| C5   | 523.25         | K           |
| D5   | 587.33         | L           |
| E5   | 659.25         | ;           |
| F5   | 698.46         | '           |

### Performance Characteristics

- **File size**: ~50 KB total (HTML + CSS + JS)
- **Load time**: <100ms on modern connections
- **Memory usage**: ~5-10 MB (browser dependent)
- **CPU usage**: <5% on modern hardware
- **Audio latency**: 10-50ms (browser and system dependent)
- **Visual latency**: <16ms (60 fps)

## Customization

### Changing Colors

Edit `styles.css` and modify the CSS custom properties in `:root`:

```css
:root {
    --bar-color-0: #ef4444;  /* Red */
    --bar-color-1: #f97316;  /* Orange */
    /* ... etc ... */
}
```

### Adjusting Audio Parameters

Edit `audio-engine.js` and modify the envelope parameters:

```javascript
this.envelope = {
    attack: 0.005,   // Attack time in seconds
    decay: 0.1,      // Decay time in seconds
    sustain: 0.3,    // Sustain level (0-1)
    release: 1.2     // Release time in seconds
};
```

### Changing Note Mapping

Edit `xylophone.js` and modify the `keyMap` object:

```javascript
this.keyMap = {
    'a': 0, 'A': 0,  // Map 'a' key to note 0
    // ... etc ...
};
```

### Adjusting Visual Feedback

Edit `visual-feedback.js` and modify the duration:

```javascript
this.activeDuration = 300; // Duration in milliseconds
```

## Development

### Code Style

- **ES6+ JavaScript**: Modern syntax with classes and modules
- **JSDoc comments**: Comprehensive documentation for all methods
- **Modular architecture**: Clear separation of concerns
- **Error handling**: Try-catch blocks and validation
- **Console logging**: Informative debug messages

### Testing

**Manual testing checklist**:
- [ ] All 11 bars play distinct notes
- [ ] Mouse clicks work on all bars
- [ ] Touch gestures work on mobile
- [ ] All keyboard keys trigger correct notes
- [ ] Visual feedback appears on activation
- [ ] Volume control adjusts audio level
- [ ] Recording captures and plays back accurately
- [ ] Multiple notes can play simultaneously
- [ ] Audio initializes after user interaction
- [ ] Works offline after initial load

### Debugging

**Enable debug logging**:

Open browser console (F12) to see detailed logs:
- Module initialization status
- Audio context state changes
- Note playback events
- Input event processing
- Error messages and warnings

**Check application state**:

In browser console, run:
```javascript
window.xylophoneApp.getState()
```

This returns current application state including:
- Initialization status
- Audio context state
- Active notes count
- Recording/playback status

## License

This project is provided as-is for educational and personal use. Feel free to modify and distribute.

## Credits

Built with:
- **Web Audio API**: For real-time audio synthesis
- **Modern JavaScript**: ES6+ features and modules
- **CSS3**: Animations and responsive design
- **HTML5**: Semantic markup and accessibility

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Verify browser compatibility
3. Check browser console for error messages
4. Try in a different browser
5. Ensure all files are in the same directory

## Version History

**v1.0.0** (Initial Release)
- 11-note xylophone with C major scale
- Mouse, touch, and keyboard input
- Web Audio API synthesis with ADSR envelope
- Visual feedback animations
- Volume control
- Sequence recording and playback
- Fully offline capable
- Zero external dependencies

---

**Enjoy making music with your Interactive Xylophone!** 🎵
