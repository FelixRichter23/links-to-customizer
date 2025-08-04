// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"], // Wichtig für den Dark Mode von shadcn/ui
    content: [
      './pages/**/*.{ts,tsx}', // Falls du den Pages Router nutzt
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}', // Wichtig für den App Router
      './src/**/*.{ts,tsx}', // Falls du ein src-Verzeichnis nutzt
    ],
    prefix: "", // Kein Prefix für Klassen
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        // HIER KOMMEN DIE FARBEN UND ANDEREN THEME-ERWEITERUNGEN HIN
        colors: {
          border: "hsl(var(--border))", // Mapping für border-border
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))", // Mapping für bg-background etc.
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
          // Füge hier ggf. die sidebar- und chart-Farben hinzu, wenn du sie brauchst
        },
        borderRadius: {
          lg: "var(--radius)", // Mapping für rounded-lg etc.
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: { // Standard Keyframes von shadcn/ui
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
        },
        animation: { // Standard Animationen von shadcn/ui
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate")], // Wichtiges Plugin für shadcn/ui
  }
  