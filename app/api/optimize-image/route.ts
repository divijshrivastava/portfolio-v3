import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { optimizeImageForOG, downloadImage } from '@/lib/utils/image-optimization';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, bucket, originalPath } = body;

    if (!imageUrl || !bucket || !originalPath) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, bucket, originalPath' },
        { status: 400 }
      );
    }

    // Download the original image
    const originalImageBuffer = await downloadImage(imageUrl);

    // Optimize the image for OG (1200x630)
    const optimizedBuffer = await optimizeImageForOG(originalImageBuffer, 'webp');

    // Generate optimized image filename
    const pathParts = originalPath.split('.');
    const baseName = pathParts.slice(0, -1).join('.');
    const optimizedPath = `${baseName}-og.webp`;

    // Create admin client with service role key for upload (bypasses RLS)
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

    // Upload optimized image to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucket)
      .upload(optimizedPath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true // Overwrite if exists
      });

    if (uploadError) {
      console.error('Optimized image upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload optimized image', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = serviceClient.storage
      .from(bucket)
      .getPublicUrl(optimizedPath);

    return NextResponse.json({
      url: publicUrl,
      path: optimizedPath,
      success: true
    });
  } catch (error) {
    console.error('Image optimization error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

