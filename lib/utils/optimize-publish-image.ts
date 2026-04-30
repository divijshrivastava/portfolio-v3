/**
 * Optimizes an image when publishing a project or blog
 * This should be called when status changes to 'published' and an image exists
 */
export async function optimizeImageOnPublish(
  imageUrl: string | null,
  bucket: 'project-images' | 'blog-images'
): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    // Extract the path from the URL
    // Supabase storage URLs are like: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(imageUrl);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    
    if (!pathMatch) {
      // If it's not a Supabase storage URL, we can't optimize it
      console.warn('Image URL is not from Supabase storage, skipping optimization:', imageUrl);
      return null;
    }

    const [, urlBucket, originalPath] = pathMatch;

    // Verify bucket matches
    if (urlBucket !== bucket) {
      console.warn(`Bucket mismatch: expected ${bucket}, got ${urlBucket}`);
      return null;
    }

    // Call the optimization API
    const response = await fetch('/api/optimize-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        bucket,
        originalPath,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Image optimization failed:', error);
      return null;
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return null;
  }
}

