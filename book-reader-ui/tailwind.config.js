/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'book': ['Crimson Text', 'serif'],
        'heading': ['Playfair Display', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom book theme colors
        parchment: {
          50: '#fdfcf0',
          100: '#faf6d9',
          200: '#f4ebb3',
          300: '#ecdc82',
          400: '#e1c754',
          500: '#d4b132',
          600: '#b89228',
          700: '#926f25',
          800: '#795826',
          900: '#694a26',
        },
        leather: {
          50: '#f7f3f0',
          100: '#ede4db',
          200: '#dcc8b8',
          300: '#c7a68f',
          400: '#b5846c',
          500: '#a66d56',
          600: '#935d4a',
          700: '#7a4d40',
          800: '#644138',
          900: '#533830',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "page-turn": {
          "0%": { transform: "perspective(1000px) rotateY(0deg)" },
          "50%": { transform: "perspective(1000px) rotateY(-90deg)" },
          "100%": { transform: "perspective(1000px) rotateY(-180deg)" },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "page-turn": "page-turn 0.8s ease-in-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      backgroundImage: {
        'paper': "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23f5f1e8\" fill-opacity=\"0.05\"><circle cx=\"7\" cy=\"7\" r=\"3\"/><circle cx=\"53\" cy=\"53\" r=\"3\"/><circle cx=\"7\" cy=\"53\" r=\"3\"/><circle cx=\"53\" cy=\"7\" r=\"3\"/></g></svg>')",
      }
    },
  },
  plugins: [],
}