/**
 * Rewrite Medusa backend static URLs to use the local proxy path.
 * Next.js 16 blocks remote images that resolve to private IPs (localhost),
 * so we proxy them through a Next.js rewrite as local paths instead.
 */
export function rewriteImageUrl(url: string): string {
    const medusaBackend =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    if (url.startsWith(`${medusaBackend}/static/`)) {
        return url.replace(`${medusaBackend}/static/`, "/medusa-static/")
    }
    return url
}
