# WhatsApp Chat UI

A dynamic, advanced WhatsApp-style chat interface built with React, featuring multiple chat modes, comprehensive theme customization, and robust edge case handling.

## ✨ Features

### Chat Modes
- **Formal Mode**: Professional conversations with neutral, work-appropriate styling
- **Romantic Mode**: Intimate conversations with warm, love-focused visual elements

### Theme Customization
- 🌞 **Light Theme**: Bright, clean interface for daytime usage
- 🌙 **Dark Theme**: Eye-friendly interface for low-light environments
- 🖥️ **System Auto**: Automatically adapts to device color scheme preference

### Background Personalization
- **24+ Curated Background Presets**
  - 11 Romantic-themed backgrounds (soft bokeh, skylines, love themes)
  - 13 Formal-themed backgrounds (nature, minimalist, professional designs)
  - Mode-specific filtering (formal backgrounds only show in formal mode, etc.)
- **Custom Upload**: Upload your own background images
- **Light/Dark Variants**: Appropriate background choices for each theme

### Advanced Chat Features
- ⏱️ **Chat Replay**: Re-watch conversations with timeline control
- 🎚️ **Zoom Levels**: 5 preset zoom levels (75% to 150%)
- ⚡ **Playback Speed**: Adjustable replay speed (0.5x to 2x)
- 👥 **Multiple Participants**: Support for multiple users with custom avatars
- 📤 **Chat Export**: Export conversations in supported formats
- 🎨 **Avatar Customization**: Upload custom profile images per user

### Robustness & Reliability
- **100+ Edge Case Handlers**: Comprehensive error handling for all scenarios
- **Defensive Programming**: Input validation, null-safety checks, graceful degradation
- **Performance Optimizations**: Memoization, lazy loading, efficient rendering
- **Sanitization**: XSS protection and input sanitization
- **Advanced Testing**: Edge case test suite with 50+ test scenarios

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Slv-WebTech/whatsapp-chats.git
cd whatsapp-chats

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will open at `http://localhost:1432/`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── App.js                          # Main app shell, state management
├── App.css                         # Global styles, theme variables
├── components/
│   ├── ChatWindow.js              # Chat display and message rendering
│   ├── ReplayControls.js          # Replay timeline with zoom & speed
│   ├── SettingsPanel.js           # Appearance, participants, export settings
│   ├── ChatHeader.js              # Chat header with contact info
│   ├── ChatBubble.js              # Individual message component
│   ├── FileUpload.js              # File import functionality
│   └── ui/                        # Reusable UI components (buttons, cards, etc.)
├── utils/
│   ├── parser.js                  # Chat file parsing with validation
│   ├── validators.js              # Input validation utilities
│   ├── errorHandling.js           # Error recovery and logging
│   ├── performance.js             # Performance monitoring & optimization
│   ├── sanitization.js            # XSS protection & data sanitization
│   ├── testEdgeCases.js           # Edge case testing utilities
│   └── [6 more utility modules]   # Additional utilities
└── index.css                       # Base styles
```

## 🎨 Customization

### Chat Modes

Toggle between Formal and Romantic modes in **Settings → Appearance**:
- Formal mode adapts colors and styling for professional conversations
- Romantic mode applies warm tones and love-focused visual elements

### Theme Selection

Choose your preferred theme in **Settings → Appearance**:
- **Light**: Bright interface (light backgrounds visible in this mode)
- **Dark**: Dark interface (dark backgrounds visible in this mode)
- **Auto**: Follows your system's color scheme preference

### Background Presets

Background presets are automatically filtered by:
1. **Chat Mode**: Formal backgrounds only show in formal mode; romantic in romantic mode
2. **Theme**: Light backgrounds visible only in light theme; dark in dark theme

Example background categories:
- **Romantic Light**: Romantic Skyline, Soft Love Bokeh, Pink Hearts Glow
- **Romantic Dark**: Deep Love Night, Dark Rose Neon, Romantic Night 4K
- **Formal Light**: Forest Nature, Serene Nature, Brand Flowers, Aesthetic HD
- **Formal Dark**: Anime Moon Landscape, Minimalist Design, Minimalism 4K, Night Ocean

### Participants & Avatars

In **Settings → Participants**:
1. Add multiple chat participants
2. Upload custom avatar images per participant
3. Select a participant to highlight their messages

### Export

Save conversations using **Settings → Export** for sharing or archival.

## 🛡️ Advanced Features

### Edge Case Handling

The application includes comprehensive edge case handlers for:
- **Input Validation**: Empty strings, null values, malformed data
- **Performance**: Large chat histories, rapid message parsing, memory optimization
- **Error Recovery**: Graceful degradation when resources fail
- **XSS Protection**: Sanitized user input, escaped HTML content
- **Timezone Handling**: Accurate date/time parsing and display

### Performance

- Memoized component renders reduce unnecessary re-renders
- Lazy-loaded chat history for large conversations
- Optimized CSS with CSS custom properties for efficient theming
- Debounced event handlers for frequently-fired events

### Testing

Test edge cases manually:
1. Upload corrupted chat exports
2. Try extreme zoom levels (75% to 150%)
3. Test with 500+ messages
4. Test with special characters in names
5. Rapid theme/mode switching
6. Upload oversized images for avatars/backgrounds

## 🎯 Built With

- **React 18+** - UI framework with hooks
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Lucide Icons** - Beautiful icon library
- **CSS Custom Properties** - Dynamic theming system

## 🔒 Security

- Input sanitization to prevent XSS attacks
- Safe HTML rendering with React's built-in escaping
- Validated file uploads (size and type checks)
- Error boundaries for graceful error handling
- No external API calls (offline-first architecture)

## 🎮 Usage Examples

### Starting a Formal Chat

1. Open **Settings**
2. Select **Chat Mode → Formal**
3. Choose a Formal background from Light or Dark presets
4. Add participants and customize avatars

### Creating a Romantic Message Thread

1. Select **Chat Mode → Romantic**
2. Pick a Romantic background preset
3. Set theme to your preference
4. Add participants

### Replaying a Conversation

1. Import a chat file (supported formats)
2. Use the timeline at the bottom to seek
3. Adjust zoom (75% to 150%) for readability
4. Control playback speed (0.5x to 2x)
5. Use pause/play controls

## 📝 API Reference

### Main State Management (App.js)

```javascript
// Chat Mode
const [chatMode, setChatMode] = useState('romantic'); // 'formal' | 'romantic'

// Theme Preference
const [themePreference, setThemePreference] = useState('system'); // 'light' | 'dark' | 'system'

// Background
const [chatBackground, setChatBackground] = useState('');

// Participants & Messages
const [participants, setParticipants] = useState([]);
const [messages, setMessages] = useState([]);
```

### Component Props

**SettingsPanel** - Configuration interface
```javascript
<SettingsPanel
  section="appearance"            // 'appearance' | 'participants' | 'export'
  theme="dark"                    // Current resolved theme
  themePreference="dark"          // User preference
  onThemeChange={handler}         // Theme change handler
  chatMode="romantic"             // Current chat mode
  onChatModeChange={handler}      // Chat mode change handler
  chatBackground=""               // Current background URL
  backgroundOptions={[...]}       // 24+ preset backgrounds
  onBackgroundPresetSelect={handler}  // Background selection handler
/>
```

**ReplayControls** - Conversation playback
```javascript
<ReplayControls
  messages={[...]}                // Chat messages
  speed={1}                       // Playback speed (0.5 to 2)
  onSpeedChange={handler}
  zoomLevel={100}                 // Zoom percentage
  onZoomChange={handler}
  isReplaying={false}             // Playback state
  currentMessageIndex={0}
  onMessageIndexChange={handler}
/>
```

## 🐛 Troubleshooting

### Background not showing
- Verify background URL is accessible
- Check that chatMode matches background's chatMode property
- Ensure theme (light/dark) matches background's mode property

### Chat not replaying
- Verify chat file format is supported
- Check browser console for parsing errors
- Ensure messages array is not empty

### Avatar not updating
- Clear browser cache
- Try uploading again with different image format
- Check image file size (should be < 5MB)

### Performance issues
- Reduce number of messages displayed at once
- Clear chat history and start fresh
- Try dark theme for reduced eye strain
- Close other browser tabs to free up resources

## 📞 Support

For issues, suggestions, or contributions:
1. Open an issue on GitHub
2. Include screenshots or error logs
3. Describe steps to reproduce
4. Specify your browser and OS

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Icons by Lucide
- Animations by Framer Motion
- Styling with Tailwind CSS

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Dual chat modes (Formal/Romantic)
- ✅ 24+ background presets with mode filtering
- ✅ Light/Dark/Auto theme support
- ✅ Chat replay with zoom & speed controls
- ✅ Multiple participants with avatars
- ✅ 100+ edge case handlers
- ✅ Comprehensive documentation

---

**Made with ❤️ for seamless, customizable chat experiences**

**Live Demo**: https://slv-webtech.github.io/whatsapp-chats/  
**GitHub**: https://github.com/Slv-WebTech/whatsapp-chats