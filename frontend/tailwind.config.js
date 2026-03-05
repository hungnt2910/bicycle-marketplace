/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ===============================
           🎨 LUXURY PRIMARY PALETTE
        =============================== */
        primary: {
          900: '#052E2B', // Dark Forest
          800: '#064E3B', // Deep Emerald
          700: '#065F46',
          600: '#047857',
          500: '#059669',
        },

        gold: {
          DEFAULT: '#C6A75E', // Matte Gold Accent
          light: '#E7D3A3', // Champagne Gold
        },

        neutral: {
          offwhite: '#F8F8F6',
          charcoal: '#111111',
        },

        /* ===============================
           ⚙ Functional (Muted)
        =============================== */
        success: '#1B5E20',
        danger: '#7F1D1D',
        warning: '#92400E',
        info: '#1E3A8A',

        /* ===============================
           🩶 Warm Gray Scale (Luxury)
        =============================== */
        warmgray: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },

      /* ===============================
         🔤 Typography
      =============================== */
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },

      fontSize: {
        h1: ['40px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        h2: ['28px', { lineHeight: '1.3', letterSpacing: '0.01em' }],
        h3: ['22px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.6' }],
        small: ['14px', { lineHeight: '1.5' }],
        caption: ['12px', { lineHeight: '1.4' }],
      },

      /* ===============================
         📏 Spacing System
      =============================== */
      spacing: {
        3: '12px',
        6: '24px',
        10: '40px',
      },

      /* ===============================
         🔘 Border Radius
      =============================== */
      borderRadius: {
        md: '16px',
        lg: '20px',
        xl: '24px',
      },

      /* ===============================
         🌫 Shadows (Soft Luxury)
      =============================== */
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.04)',
        elevated: '0 10px 30px rgba(0, 0, 0, 0.08)',
        card: '0 20px 40px rgba(0, 0, 0, 0.06)',
        goldGlow: '0 0 0 1px rgba(198,167,94,0.4)',
      },

      /* ===============================
         🎞 Animations (Calm & Premium)
      =============================== */
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleSoft: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.02)' },
        },
      },

      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        scaleSoft: 'scaleSoft 0.25s ease-in-out forwards',
      },

      /* ===============================
         🌈 Background Gradients
      =============================== */
      backgroundImage: {
        luxuryGradient: 'linear-gradient(135deg, #064E3B 0%, #052E2B 100%)',
        glassOverlay:
          'linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
