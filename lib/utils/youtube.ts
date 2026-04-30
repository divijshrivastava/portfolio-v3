/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    // For youtu.be short URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    // For youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Check for /watch?v= format
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;

      // Check for /embed/ or /v/ format
      const pathMatch = urlObj.pathname.match(/\/(embed|v)\/([^/?]+)/);
      if (pathMatch) return pathMatch[2];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gets YouTube thumbnail URL from video URL
 * Returns high quality thumbnail (hqdefault.jpg)
 */
export function getYouTubeThumbnail(youtubeUrl: string): string | null {
  const videoId = getYouTubeVideoId(youtubeUrl);
  if (!videoId) return null;

  // Using hqdefault for good balance between quality and availability
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Gets the display image URL for a project
 * Returns uploaded image if available, otherwise YouTube thumbnail if available
 */
export function getProjectImageUrl(imageUrl: string | null, youtubeUrl: string | null): string | null {
  // Handle empty strings as null
  const validImageUrl = imageUrl && imageUrl.trim() ? imageUrl.trim() : null;
  const validYoutubeUrl = youtubeUrl && youtubeUrl.trim() ? youtubeUrl.trim() : null;

  if (validImageUrl) return validImageUrl;
  if (validYoutubeUrl) return getYouTubeThumbnail(validYoutubeUrl);
  return null;
}
