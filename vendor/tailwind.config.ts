import type { Config } from "tailwindcss";
const medusa = require("@medusajs/ui-preset");

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    presets: [medusa],
    plugins: [],
};
export default config;
