"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ComponentProps } from "react"

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * ThemeProvider wraps next-themes' ThemeProvider.
 * - attribute="class" → adds/removes `dark` class on <html>
 * - defaultTheme="system" → respects OS preference on first visit
 * - enableSystem → keeps system preference sync
 * - disableTransitionOnChange → prevents flash of wrong theme on navigation
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
