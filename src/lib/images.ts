/**
 * Normalizes image URLs to ensure they work correctly
 * - Absolute URLs (http/https) are returned as-is
 * - Relative URLs starting with / are returned as-is (for Next.js public folder)
 * - Empty strings return null
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === '') {
        return null
    }

    const trimmed = url.trim()

    // If it's already an absolute URL, return as-is
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed
    }

    // If it starts with /, it's a relative path to public folder - return as-is
    if (trimmed.startsWith('/')) {
        return trimmed
    }

    // If it doesn't start with /, assume it should be relative to public folder
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

