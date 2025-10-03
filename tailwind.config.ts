import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary EV Colors - Blue to Green theme
        primary: {
          DEFAULT: "#3b82f6", // Blue-500
          25: "#f8faff",
          50: "#eff6ff",
          100: "#dbeafe", 
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", 
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          light: "#60a5fa", // Blue-400
          dark: "#1d4ed8",  // Blue-700
        },
        
        // Success/Green Colors
        success: {
          DEFAULT: "#22c55e", // Green-500
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          light: "#86efac", // Green-300
          dark: "#15803d",  // Green-700
        },
        
        // Warning Colors
        warning: {
          DEFAULT: "#f59e0b", // Amber-500
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          light: "#fcd34d", // Amber-300
          dark: "#b45309",  // Amber-700
        },
        
        // Secondary Colors
        secondary: {
          DEFAULT: "#8b5cf6", // Violet-500
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          light: "#c084fc", // Violet-400
          dark: "#7c3aed",  // Violet-700
        },
        
        // Danger/Error Colors
        danger: {
          DEFAULT: "#ef4444", // Red-500
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        
        // Battery Status Colors - Simplified
        battery: {
          high: "#22c55e",    // Green-500 for 80%+
          medium: "#eab308",  // Yellow-500 for 50-79%
          low: "#ef4444",     // Red-500 for <50%
        },
        
        // Station Status Colors
        station: {
          available: "#22c55e",   // Green
          busy: "#f59e0b",        // Amber
          maintenance: "#ef4444", // Red
          offline: "#6b7280",     // Gray
        },
      },
      
      // Custom Gradients
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)',
        'electric-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
        'battery-gradient': 'linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)',
      },
      
      // Custom Shadows with Electric theme
      boxShadow: {
        'electric': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow': '0 0 30px rgba(14, 165, 233, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
      
      // EV-themed animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-electric': 'pulseElectric 2s ease-in-out infinite',
        'bounce-light': 'bounceLight 1s ease-in-out infinite',
        'charge': 'charge 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseElectric: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        charge: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
} satisfies Config;