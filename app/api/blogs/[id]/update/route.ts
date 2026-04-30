import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { optimizeImageForOG, downloadImage } from '@/lib/utils/image-optimization';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Check if we're publishing and need to optimize image
    let ogImageUrl: string | null = null;
    if (body.status === 'published' && body.cover_image_url) {
      // Get current blog to check if it was draft
      const { data: currentBlog } = await supabase
        .from('blogs')
        .select('status, cover_image_url')
        .eq('id', resolvedParams.id)
        .single();

      const isPublishing = currentBlog?.status !== 'published';
      
      if (isPublishing) {
        try {
          // Extract path from URL
          const imageUrl = body.cover_image_url;
          const urlObj = new URL(imageUrl);
          const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
          
          if (pathMatch) {
            const [, bucket, originalPath] = pathMatch;
            
            // Download and optimize
            const originalImageBuffer = await downloadImage(imageUrl);
            const optimizedBuffer = await optimizeImageForOG(originalImageBuffer, 'webp');
            
            // Generate optimized filename
            const pathParts = originalPath.split('.');
            const baseName = pathParts.slice(0, -1).join('.');
            const optimizedPath = `${baseName}-og.webp`;
            
            // Upload optimized image
            const { createClient: createServiceClient } = await import('@supabase/supabase-js');
            const serviceClient = createServiceClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              {
                auth: {
                  autoRefreshToken: false,
                  persistSession: false
                }
              }
            );
            
            const { error: uploadError } = await serviceClient.storage
              .from(bucket)
              .upload(optimizedPath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
              });
            
            if (!uploadError) {
              const { data: { publicUrl } } = serviceClient.storage
                .from(bucket)
                .getPublicUrl(optimizedPath);
              ogImageUrl = publicUrl;
            }
          }
        } catch (error) {
          console.error('Error optimizing blog image:', error);
          // Continue without optimized image
        }
      }
    }

    // Add og_image_url to update if we have it
    if (ogImageUrl) {
      body.og_image_url = ogImageUrl;
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(body)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error in update blog API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
