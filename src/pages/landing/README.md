# BeyondStrings Landing Page

A premium, dark-themed React landing page built with Tailwind CSS. Fully responsive with interactive components.

## Installation

1. Copy all `.js` files into your React project's `src/components/landing/` directory
2. Install Tailwind CSS if not already installed:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
3. Ensure your `tailwind.config.js` includes the component colors:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#051424',
          dim: '#051424',
          bright: '#2c3a4c',
          container: {
            lowest: '#010f1f',
            low: '#0d1c2d',
            DEFAULT: '#122131',
            high: '#1c2b3c',
            highest: '#273647',
          },
        },
        primary: {
          DEFAULT: '#dbfcff',
          container: '#00f0ff',
        },
        secondary: {
          DEFAULT: '#d0bcff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

## Usage

### Option 1: Full Landing Page
```jsx
import BeyondStringsLanding from './components/landing/BeyondStringsLanding';

function App() {
  return <BeyondStringsLanding />;
}
```

### Option 2: Individual Sections
```jsx
import { Navbar, HeroSection, Pricing, Footer } from './components/landing';

function CustomPage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Pricing />
      <Footer />
    </div>
  );
}
```

## Component List

| Component | Description | Interactive |
|-----------|-------------|-------------|
| `Navbar` | Fixed nav with mobile hamburger menu | Mobile drawer, active states |
| `HeroSection` | Main hero with animations | Scroll reveal animations |
| `ProductShowcase` | Tabbed product modules | Tab switching with transitions |
| `Pricing` | Three-tier pricing cards | Hover effects, CTAs |
| `Testimonials` | Horizontal scroll cards | Arrow navigation, snap scroll |
| `ContactSection` | Contact form | Form validation, submit states |
| `GlassCard` | Reusable glassmorphism card | Hover glow effects |
| `AnimatedButton` | Premium button component | Shimmer, loading states |

## Features

- Fully responsive (mobile, tablet, desktop)
- Dark mode premium UI with glassmorphism
- Interactive navigation with smooth scroll
- Animated tab switching in product showcase
- Form validation and submission handling
- Horizontal scrolling testimonials with navigation
- Hover effects and micro-interactions
- Optimized images with lazy loading
- Accessible with proper ARIA labels

## File Structure

```
landing-page-components/
  ├── constants.js              # All data constants
  ├── utils.js                  # Utility functions (cn, debounce, throttle)
  ├── MaterialIcon.js           # Reusable Material Symbols icon
  ├── GlassCard.js              # Glassmorphism card component
  ├── GradientText.js           # Animated gradient text
  ├── AmbientGlow.js            # Background ambient lighting
  ├── AnimatedButton.js         # Premium animated button
  ├── SectionHeading.js         # Reusable section heading
  ├── Navbar.js                 # Fixed navigation with mobile menu
  ├── HeroSection.js            # Hero with animations
  ├── ValueProps.js             # Three value proposition cards
  ├── ProductShowcase.js        # Tabbed product showcase
  ├── FeaturesBento.js          # Bento grid features
  ├── HowItWorks.js             # Three step process
  ├── WhyBeyondStrings.js       # Feature comparison section
  ├── UseCases.js               # Use case cards
  ├── Pricing.js                # Pricing cards
  ├── VisionSection.js          # Company vision
  ├── Testimonials.js           # Testimonial carousel
  ├── ContactSection.js         # Contact form
  ├── FinalCTA.js               # Final call to action
  ├── Footer.js                 # Site footer
  ├── BeyondStringsLanding.js   # Main landing page (combines all)
  ├── index.js                  # Barrel exports
  └── README.md                 # Documentation
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
