import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { optimizeImageForOG, downloadImage } from '@/lib/utils/image-optimization';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating blog with data:', { ...body, content: '...(truncated)' });

    // Optimize image if publishing
    let ogImageUrl: string | null = null;
    if (body.status === 'published' && body.cover_image_url) {
      try {
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

    // Add og_image_url if we have it
    if (ogImageUrl) {
      body.og_image_url = ogImageUrl;
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('blogs')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating blog:', error);
      return NextResponse.json({
        error: error.message || 'Failed to create blog',
        details: error
      }, { status: 400 });
    }

    console.log('Blog created successfully:', data?.id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Exception in create blog API:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error',
      details: error.toString()
    }, { status: 500 });
  }
}
