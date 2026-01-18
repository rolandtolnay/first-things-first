/** @type {import('tailwindcss').Config} */

/**
 * DDA Design System - Tailwind CSS Configuration
 * "Trigona JARVIS" Theme
 * 
 * This config extends Tailwind with the custom design tokens
 * from the DDA design system.
 * 
 * Usage:
 * 1. npm install tailwindcss
 * 2. Copy this file to your project root as tailwind.config.js
 * 3. Create a CSS file with the Tailwind directives:
 *    @tailwind base;
 *    @tailwind components;
 *    @tailwind utilities;
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {
      // Custom Colors
      colors: {
        // Backgrounds
        'void': '#0a0d0f',
        'surface': '#0d1214',
        'elevated': '#111619',
        
        // Primary Accent - Teal/Cyan
        'accent': {
          DEFAULT: '#2dd4bf',
          dim: '#14b8a6',
          muted: 'rgba(45, 212, 191, 0.15)',
          glow: 'rgba(45, 212, 191, 0.4)',
        },
        
        // Secondary Accent - Emerald/Green
        'accent-secondary': {
          DEFAULT: '#22c55e',
          dim: '#16a34a',
          muted: 'rgba(34, 197, 94, 0.15)',
          glow: 'rgba(34, 197, 94, 0.4)',
        },
        
        // Status Colors
        'status': {
          operational: '#22c55e',
          warning: '#eab308',
          critical: '#ef4444',
          info: '#3b82f6',
        },
        
        // Text Colors
        'text': {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          tertiary: '#64748b',
          muted: '#475569',
        },
        
        // Border Colors
        'border': {
          subtle: 'rgba(148, 163, 184, 0.08)',
          DEFAULT: 'rgba(148, 163, 184, 0.12)',
          emphasis: 'rgba(148, 163, 184, 0.2)',
        },
      },
      
      // Custom Font Families
      fontFamily: {
        'display': ['Exo 2', 'Rajdhani', 'Orbitron', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      
      // Custom Font Sizes
      fontSize: {
        'display-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        'heading-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'data': ['2rem', { lineHeight: '1', fontWeight: '600' }],
      },
      
      // Custom Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      
      // Custom Border Radius
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      
      // Custom Box Shadows
      boxShadow: {
        'glow': '0 0 20px rgba(45, 212, 191, 0.4)',
        'glow-sm': '0 0 10px rgba(45, 212, 191, 0.4)',
        'glow-lg': '0 0 30px rgba(45, 212, 191, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'dark-md': '0 4px 12px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      
      // Custom Background Gradients
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, rgba(45, 212, 191, 0.03) 0%, transparent 50%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(45, 212, 191, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%)',
        'gradient-section': 'linear-gradient(180deg, #0d1214 0%, #0a0d0f 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
      },
      
      // Custom Animations
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-critical': 'pulse-critical 1s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'scan-line': 'scan-line 8s linear infinite',
      },
      
      // Custom Keyframes
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 8px currentColor',
          },
          '50%': {
            opacity: '0.7',
            boxShadow: '0 0 16px currentColor',
          },
        },
        'pulse-critical': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      
      // Custom Transitions
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '400ms',
      },
    },
  },
  plugins: [
    // Custom plugin for JARVIS bracket styles
    function({ addComponents }) {
      addComponents({
        '.jarvis-brackets': {
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: '24px',
            height: '24px',
            borderColor: '#2dd4bf',
            borderStyle: 'solid',
            opacity: '0.5',
            transition: 'all 250ms ease',
            pointerEvents: 'none',
          },
          '&::before': {
            top: '-1px',
            left: '-1px',
            borderWidth: '2px 0 0 2px',
          },
          '&::after': {
            top: '-1px',
            right: '-1px',
            borderWidth: '2px 2px 0 0',
          },
          '&:hover::before, &:hover::after': {
            opacity: '1',
            filter: 'drop-shadow(0 0 4px rgba(45, 212, 191, 0.4))',
          },
        },
        '.bracket-bl': {
          content: '""',
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderColor: '#2dd4bf',
          borderStyle: 'solid',
          opacity: '0.5',
          transition: 'all 250ms ease',
          pointerEvents: 'none',
          bottom: '-1px',
          left: '-1px',
          borderWidth: '0 0 2px 2px',
        },
        '.bracket-br': {
          content: '""',
          position: 'absolute',
          width: '24px',
          height: '24px',
          borderColor: '#2dd4bf',
          borderStyle: 'solid',
          opacity: '0.5',
          transition: 'all 250ms ease',
          pointerEvents: 'none',
          bottom: '-1px',
          right: '-1px',
          borderWidth: '0 2px 2px 0',
        },
      })
    },
    
    // Custom plugin for status dots
    function({ addComponents }) {
      addComponents({
        '.status-dot': {
          width: '8px',
          height: '8px',
          borderRadius: '9999px',
          flexShrink: '0',
        },
        '.status-dot-operational': {
          backgroundColor: '#22c55e',
          boxShadow: '0 0 8px #22c55e',
          animation: 'pulse-glow 2s ease-in-out infinite',
        },
        '.status-dot-warning': {
          backgroundColor: '#eab308',
          boxShadow: '0 0 8px #eab308',
          animation: 'pulse-glow 2s ease-in-out infinite',
        },
        '.status-dot-critical': {
          backgroundColor: '#ef4444',
          boxShadow: '0 0 8px #ef4444',
          animation: 'pulse-critical 1s ease-in-out infinite',
        },
      })
    },
  ],
}
