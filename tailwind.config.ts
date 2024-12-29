import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import scrollbar from 'tailwind-scrollbar';
import { nextui } from "@nextui-org/theme";
import plugin from 'tailwindcss/plugin'
import BreakpointConfig from "./src/configs/breakpoints.config";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm: `${BreakpointConfig.sm.minWidth}px`,
      md: `${BreakpointConfig.md.minWidth}px`,
      lg: `${BreakpointConfig.lg.minWidth}px`,
      xl: `${BreakpointConfig.xl.minWidth}px`,
      '2xl': `${BreakpointConfig["2xl"].minWidth}px`,
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2.5rem',
        xl: '5rem',
      },
    },
    extend: {
      animation: {
        'pulse-scale': 'pulse-scale 0.8s infinite',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.6)', opacity: '0.4' },
        },
      },
      colors: {
        red: colors.red,
        gray: colors.neutral,
        rose: colors.rose,
        while: colors.white,
        black: colors.black,
        primary: {
          DEFAULT: colors.rose[600],
          foreground: colors.white,
        },
      },
      textColor: {
        accent: colors.gray[500],
        primary: colors.rose["600"],
        secondary: colors.blue[600],
      },
      fontSize: {
        '2xl': "1.625rem"
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }: any) {
      addUtilities({
        '.text-description': {
          fontSize: '1rem',
          fontWeight: "400",
          '@screen md': {
            fontSize: '1.125rem',
          },
        },
        '.text-description-accent': {
          fontSize: '0.875rem',
          fontWeight: "400",
          lineHeight: "1.2rem",
        },
        '.text-title-accent': {
          fontSize: '1rem',
          fontWeight: "500",
          '@screen md': {
            fontSize: '1.125rem',
          },
        },
        '.text-subtitle': {
          fontSize: '1rem',
          fontWeight: "500",
          '@screen md': {
            fontSize: '1.375rem',
          },
        },
        '.text-title': {
          fontSize: '1.625rem',
          fontWeight: "500",
          lineHeight: "2rem",
          '@screen md': {
            fontSize: '2rem',
            lineHeight: "2.3rem",
          },
        },
        '.text-title-primary': {
          fontSize: '2.25rem',
          fontWeight: "600",
          lineHeight: "2.5rem",
          '@screen md': {
            fontSize: '3rem',
            lineHeight: "3.5rem",
          },
        }
      })
    }),
    scrollbar({ nocompatible: true }),
    nextui({
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {
            background: colors.white,
            foreground: colors.gray[950],
            secondary: {
              DEFAULT: colors.neutral[800],
              foreground: colors.white,
            },
          },
        },
        dark: {
          layout: {}, // dark theme layout tokens
          colors: {
            background: colors.neutral[800],
            foreground: colors.gray[200],
            secondary: {
              DEFAULT: colors.neutral[50],
              foreground: colors.gray[900],
            },
            content1: colors.neutral[800],
          },
        }, // dark theme colors
      },
    }),
  ],
};
export default config;
