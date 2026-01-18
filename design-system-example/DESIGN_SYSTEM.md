# DDA Design System
## "Trigona JARVIS" — A Dark Tech Dashboard Aesthetic

A comprehensive design system inspired by the luxurious Trigona bar in Kuala Lumpur and the iconic JARVIS heads-up display from Iron Man. This system creates sophisticated, data-rich interfaces with a premium dark aesthetic and futuristic tech accents.

---

## Design Philosophy

### Core Principles

1. **Dark Luxury**: Deep, rich backgrounds that feel premium and immersive
2. **Tech Precision**: Clean geometric accents and targeting brackets reminiscent of HUD interfaces
3. **Ambient Glow**: Strategic use of glowing accents that feel alive without being overwhelming
4. **Data Clarity**: Information-dense layouts that remain scannable and elegant
5. **Layered Depth**: Subtle transparencies and gradients creating visual hierarchy

### Mood & Tone

- **Sophisticated** — Not gamified or childish
- **Operational** — Feels like a command center
- **Premium** — Evokes high-end technology
- **Calm Confidence** — Green/teal palette suggests stability and mastery

---

## Color System

### CSS Custom Properties

```css
:root {
  /* === BACKGROUNDS === */
  --bg-void: #0a0d0f;           /* Deepest black - page background */
  --bg-surface: #0d1214;        /* Card backgrounds */
  --bg-elevated: #111619;       /* Elevated surfaces, hover states */
  --bg-overlay: rgba(13, 18, 20, 0.85); /* Modal overlays */
  
  /* === PRIMARY ACCENT — TEAL/CYAN === */
  --accent-primary: #2dd4bf;     /* Main accent color */
  --accent-primary-dim: #14b8a6; /* Slightly muted primary */
  --accent-primary-muted: rgba(45, 212, 191, 0.15); /* For subtle backgrounds */
  --accent-primary-glow: rgba(45, 212, 191, 0.4);   /* For glow effects */
  
  /* === SECONDARY ACCENT — EMERALD/GREEN === */
  --accent-secondary: #22c55e;   /* Success, operational status */
  --accent-secondary-dim: #16a34a;
  --accent-secondary-muted: rgba(34, 197, 94, 0.15);
  
  /* === STATUS COLORS === */
  --status-operational: #22c55e;
  --status-warning: #eab308;
  --status-critical: #ef4444;
  --status-info: #3b82f6;
  
  /* === TEXT === */
  --text-primary: #f1f5f9;       /* Primary text - high emphasis */
  --text-secondary: #94a3b8;     /* Secondary text - medium emphasis */
  --text-tertiary: #64748b;      /* Tertiary text - low emphasis */
  --text-muted: #475569;         /* Disabled, placeholder */
  --text-accent: var(--accent-primary); /* Accent-colored text */
  
  /* === BORDERS === */
  --border-subtle: rgba(148, 163, 184, 0.08);
  --border-default: rgba(148, 163, 184, 0.12);
  --border-emphasis: rgba(148, 163, 184, 0.2);
  --border-accent: var(--accent-primary);
  
  /* === GRADIENTS === */
  --gradient-card: linear-gradient(
    135deg,
    rgba(45, 212, 191, 0.03) 0%,
    transparent 50%
  );
  --gradient-hero: linear-gradient(
    135deg,
    rgba(45, 212, 191, 0.08) 0%,
    rgba(34, 197, 94, 0.04) 100%
  );
  --gradient-glow: radial-gradient(
    ellipse at center,
    var(--accent-primary-glow) 0%,
    transparent 70%
  );
  
  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px var(--accent-primary-glow);
  --shadow-glow-sm: 0 0 10px var(--accent-primary-glow);
  
  /* === SPACING === */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* === RADII === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-glow: 300ms ease-in-out;
}
```

---

## Typography

### Font Stack

```css
:root {
  /* Display font — for headings and hero text */
  --font-display: 'Exo 2', 'Rajdhani', 'Orbitron', system-ui, sans-serif;
  
  /* Body font — for readable content */
  --font-body: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  
  /* Mono font — for data, numbers, codes */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
```

### Type Scale

```css
.text-display-xl {
  font-family: var(--font-display);
  font-size: 3rem;        /* 48px */
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.text-display-lg {
  font-family: var(--font-display);
  font-size: 2.25rem;     /* 36px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.text-heading-lg {
  font-family: var(--font-display);
  font-size: 1.5rem;      /* 24px */
  font-weight: 500;
  line-height: 1.3;
}

.text-heading-md {
  font-family: var(--font-display);
  font-size: 1.125rem;    /* 18px */
  font-weight: 500;
  line-height: 1.4;
}

.text-body {
  font-family: var(--font-body);
  font-size: 1rem;        /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

.text-body-sm {
  font-family: var(--font-body);
  font-size: 0.875rem;    /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

.text-label {
  font-family: var(--font-body);
  font-size: 0.75rem;     /* 12px */
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.text-data {
  font-family: var(--font-mono);
  font-size: 2rem;        /* 32px */
  font-weight: 600;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
```

---

## Core Components

### 1. JARVIS Brackets (HUD Corners)

The signature visual element — corner brackets that evoke targeting systems.

```css
/* Corner bracket mixin - apply to positioned parent */
.jarvis-brackets {
  position: relative;
}

.jarvis-brackets::before,
.jarvis-brackets::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: var(--accent-primary);
  border-style: solid;
  opacity: 0.6;
  transition: opacity var(--transition-base);
}

/* Top-left and top-right corners */
.jarvis-brackets::before {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
}

.jarvis-brackets::after {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
}

/* Bottom corners require additional pseudo-elements or child divs */
.jarvis-brackets-bottom::before {
  bottom: 0;
  left: 0;
  top: auto;
  border-width: 0 0 2px 2px;
}

.jarvis-brackets-bottom::after {
  bottom: 0;
  right: 0;
  top: auto;
  border-width: 0 2px 2px 0;
}

/* Hover state intensifies brackets */
.jarvis-brackets:hover::before,
.jarvis-brackets:hover::after {
  opacity: 1;
  border-color: var(--accent-primary);
  filter: drop-shadow(0 0 4px var(--accent-primary-glow));
}
```

### 2. Card Component

```css
.card {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all var(--transition-base);
  overflow: hidden;
}

/* Subtle gradient overlay */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-card);
  pointer-events: none;
}

.card:hover {
  border-color: var(--border-default);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Card with JARVIS brackets */
.card-bracketed {
  composes: card;
  composes: jarvis-brackets;
}
```

### 3. Hero Card (Welcome Section)

```css
.hero-card {
  position: relative;
  background: var(--gradient-hero);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  overflow: hidden;
}

/* Accent border glow on left edge */
.hero-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  bottom: 10%;
  width: 3px;
  background: var(--accent-primary);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-glow);
}

.hero-avatar {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  border: 3px solid var(--accent-secondary);
  padding: 4px;
  background: var(--bg-surface);
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  object-fit: cover;
}
```

### 4. Badge Component

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-primary {
  background: var(--accent-primary);
  color: var(--bg-void);
}

.badge-secondary {
  background: var(--accent-secondary-muted);
  color: var(--accent-secondary);
  border: 1px solid var(--accent-secondary);
}

.badge-outlined {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-emphasis);
}

.badge-coming-soon {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-tertiary);
  border: 1px solid var(--border-default);
}
```

### 5. Status Indicator

```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--status-operational);
  box-shadow: 0 0 8px var(--status-operational);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px currentColor;
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 16px currentColor;
  }
}

.status-dot--warning {
  background: var(--status-warning);
  box-shadow: 0 0 8px var(--status-warning);
}

.status-dot--critical {
  background: var(--status-critical);
  box-shadow: 0 0 8px var(--status-critical);
  animation: pulse-critical 1s ease-in-out infinite;
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 6. Stats Card

```css
.stats-card {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-xl) var(--space-lg);
  text-align: center;
  transition: all var(--transition-base);
}

.stats-card__icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.stats-card__value {
  font-family: var(--font-mono);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: var(--space-sm);
  font-variant-numeric: tabular-nums;
}

.stats-card__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: var(--space-md);
}

.stats-card__link {
  font-size: 0.75rem;
  color: var(--accent-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  transition: color var(--transition-fast);
}

.stats-card__link::before {
  content: '◆';
  font-size: 0.5rem;
}

.stats-card__link:hover {
  color: var(--text-primary);
}

/* Corner decoration */
.stats-card::before,
.stats-card::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--border-default);
  border-style: solid;
  opacity: 0.5;
  transition: all var(--transition-base);
}

.stats-card::before {
  top: 8px;
  right: 8px;
  border-width: 1px 1px 0 0;
}

.stats-card::after {
  bottom: 8px;
  left: 8px;
  border-width: 0 0 1px 1px;
}

.stats-card:hover::before,
.stats-card:hover::after {
  opacity: 1;
  border-color: var(--accent-primary);
}
```

### 7. Section Header

```css
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.section-header__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.section-header__title::before {
  content: '◆';
  color: var(--accent-primary);
}

.section-header__meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.section-header__meta::before {
  content: '—';
  color: var(--border-emphasis);
}
```

### 8. Feature Card (Arsenal Items)

```css
.feature-card {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  transition: all var(--transition-base);
}

.feature-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.feature-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.feature-card__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.feature-card__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Disabled/coming soon state */
.feature-card--disabled {
  opacity: 0.6;
}

.feature-card--disabled:hover {
  transform: none;
  border-color: var(--border-subtle);
}
```

### 9. Navigation

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: var(--bg-void);
  border-bottom: 1px solid var(--border-subtle);
}

.nav__logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.nav__logo-icon {
  width: 40px;
  height: 40px;
}

.nav__logo-text {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
  color: var(--text-primary);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.nav__link {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-sm) 0;
  position: relative;
  transition: color var(--transition-fast);
}

.nav__link:hover,
.nav__link--active {
  color: var(--accent-primary);
}

.nav__link--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-primary);
  box-shadow: var(--shadow-glow-sm);
}

.nav__user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nav__user-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.nav__signout {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--border-emphasis);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav__signout:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
```

### 10. Button Components

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-void);
}

.btn-primary:hover {
  background: var(--accent-primary-dim);
  box-shadow: var(--shadow-glow);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-secondary:hover {
  background: var(--accent-primary-muted);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
```

---

## Layout Patterns

### Container

```css
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
}

.container--narrow {
  max-width: 1000px;
}

.container--wide {
  max-width: 1600px;
}
```

### Grid Systems

```css
/* Stats grid - 4 columns */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Feature grid - 3 columns */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

@media (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
```

### Section Spacing

```css
.section {
  padding: var(--space-3xl) 0;
}

.section + .section {
  padding-top: 0;
}

.section--bordered {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
  background: linear-gradient(
    180deg,
    var(--bg-surface) 0%,
    var(--bg-void) 100%
  );
}
```

---

## Animations & Effects

### Glow Pulse

```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 8px var(--accent-primary-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--accent-primary-glow);
  }
}

.animate-glow-pulse {
  animation: glow-pulse 3s ease-in-out infinite;
}
```

### Fade In Up

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

/* Staggered children */
.stagger-children > * {
  opacity: 0;
  animation: fade-in-up 0.5s ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
```

### Scan Line (HUD Effect)

```css
@keyframes scan-line {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100vh);
  }
}

.scan-line-overlay::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-primary-glow),
    transparent
  );
  animation: scan-line 8s linear infinite;
  pointer-events: none;
  opacity: 0.3;
}
```

### Border Glow on Hover

```css
.hover-glow {
  transition: all var(--transition-base);
}

.hover-glow:hover {
  box-shadow: 
    0 0 0 1px var(--accent-primary),
    0 0 20px var(--accent-primary-glow);
}
```

---

## Utility Classes

```css
/* Text colors */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }
.text-accent { color: var(--accent-primary); }
.text-success { color: var(--status-operational); }

/* Backgrounds */
.bg-void { background: var(--bg-void); }
.bg-surface { background: var(--bg-surface); }
.bg-elevated { background: var(--bg-elevated); }

/* Flex utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }

/* Spacing */
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mb-sm { margin-bottom: var(--space-sm); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
```

---

## Icon Recommendations

For consistency with the HUD aesthetic, use:

- **Phosphor Icons** (outline style) — Clean, geometric, tech-forward
- **Lucide Icons** — Similar aesthetic, good React support
- **Custom SVG icons** — For unique elements like the shield/crown avatar frame

### Icon Styling

```css
.icon {
  width: 24px;
  height: 24px;
  stroke-width: 1.5;
  color: currentColor;
}

.icon-lg {
  width: 32px;
  height: 32px;
}

.icon-accent {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 4px var(--accent-primary-glow));
}
```

---

## Implementation Notes

### Recommended Tech Stack

- **CSS Framework**: Tailwind CSS (configured with custom theme) or vanilla CSS with PostCSS
- **Font Loading**: Use `@fontsource` packages or Google Fonts
- **Icons**: `phosphor-react` or `lucide-react`
- **Animations**: CSS animations for most, Framer Motion for complex sequences

### Key Implementation Tips

1. **Always use the CSS custom properties** — Makes theming consistent and maintainable
2. **Layer your backgrounds** — Use pseudo-elements for gradients and effects
3. **Subtle is powerful** — The glow effects should enhance, not overwhelm
4. **Performance** — Use `will-change` sparingly, prefer `transform` and `opacity` for animations
5. **Accessibility** — Ensure sufficient color contrast (the teal on dark passes WCAG AA)

### Font Loading Example

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
```

---

## Quick Start Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DDA Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-void">
  <nav class="nav">
    <!-- Navigation content -->
  </nav>
  
  <main class="container">
    <section class="section">
      <div class="hero-card jarvis-brackets">
        <!-- Hero content -->
      </div>
    </section>
    
    <section class="section">
      <div class="stats-grid stagger-children">
        <!-- Stats cards -->
      </div>
    </section>
  </main>
</body>
</html>
```

---

*Design system version 1.0 — Inspired by Trigona KL & JARVIS HUD*
