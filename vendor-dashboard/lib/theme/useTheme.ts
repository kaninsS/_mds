"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

export type UseThemeReturn = {
    /** Current resolved theme ("light" or "dark") — accounts for system */
    resolvedTheme: "light" | "dark" | undefined
    /** Raw theme value including "system" */
    theme: Theme
    /** Set the theme explicitly */
    setTheme: (theme: Theme) => void
    /** Toggle between light and dark (ignores system) */
    toggleTheme: () => void
    /** True while theme hasn't resolved on the client yet */
    isLoading: boolean
}

/**
 * useTheme — wraps next-themes with type safety and a conveniance toggleTheme helper.
 *
 * @example
 * const { resolvedTheme, setTheme, toggleTheme } = useTheme()
 */
export function useTheme(): UseThemeReturn {
    const { theme, setTheme, resolvedTheme } = useNextTheme()
    const [isLoading, setIsLoading] = useState(true)

    // next-themes resolves on-client only — avoid hydration mismatch
    useEffect(() => {
        setIsLoading(false)
    }, [])

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    return {
        resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
        theme: (theme ?? "system") as Theme,
        setTheme: (t: Theme) => setTheme(t),
        toggleTheme,
        isLoading,
    }
}
