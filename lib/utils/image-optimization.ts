import sharp from 'sharp';

/**
 * Optimizes an image for social media preview (OG image)
 * Resizes to 1200x630 (optimal for Open Graph) and converts to WebP for better compression
 * 
 * @param imageBuffer - The image buffer to optimize
 * @param format - Output format ('webp' or 'png'), defaults to 'webp'
 * @returns Optimized image buffer
 */
export async function optimizeImageForOG(
  imageBuffer: Buffer,
  format: 'webp' | 'png' = 'webp'
): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  let pipeline = sharp(imageBuffer)
    .resize(width, height, {
      fit: 'cover', // Cover the entire area, may crop
      position: 'center', // Center the image when cropping
    });

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality: 85 });
  } else {
    pipeline = pipeline.png({ quality: 90 });
  }

  return await pipeline.toBuffer();
}

/**
 * Downloads an image from a URL and returns it as a buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

