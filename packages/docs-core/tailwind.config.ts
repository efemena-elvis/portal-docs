import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{vue,ts}",
  ],
  // No safelist needed — content scanning covers everything authored in the CMS,
  // and the Tailwind CDN is loaded in admin mode for real-time class generation.
  safelist: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        brand: {
          navy: "#011A27",
          dark: "#043B56",
          blue: "#0B618F",
          sky: "#24ACEE",
          green: "#3AB75D",
        },
        surface: {
          "off-white": "#F1F7F6",
          "pale-blue": "#EEF9FD",
          sage: "#E5EDEB",
          "sage-dark": "#D1D9D7",
        },
        ink: {
          primary: "#171918",
          secondary: "#525857",
          muted: "#696F6E",
        },
        dark: {
          bg: "#161b22",
          sidebar: "#161b22",
          surface: "#21262d",
          border: "#30363d",
          text: "#e6edf3",
          muted: "#8b949e",
          subtle: "#6e7681",
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.333" }],
        sm: ["0.875rem", { lineHeight: "1.429" }],
        base: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.556" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.333" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.111" }],
      },
      borderRadius: {
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        pill: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
