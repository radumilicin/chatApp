import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      screens: {
        'xsw': '500px',
        'xss': '400px',
        'xsss': '300px',
      },
    },
  },
  plugins: [
    // require('tailwind-scrollbar-hide')
  ],
} satisfies Config;
