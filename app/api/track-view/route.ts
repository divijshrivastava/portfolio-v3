import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * API Route: Track Page Views
 *
 * Tracks page visits for blog posts and project detail pages.
 * Uses atomic increment to prevent race conditions.
 *
 * POST /api/track-view
 * Body: { type: 'blog' | 'project', id: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, id } = body;

    // Validate input
    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: type and id' },
        { status: 400 }
      );
    }

    if (type !== 'blog' && type !== 'project') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "blog" or "project"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tableName = type === 'blog' ? 'blogs' : 'projects';

    // Try to use the atomic database function first
    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_view_count', {
      p_table_name: tableName,
      p_record_id: id,
    });

    if (!rpcError && rpcData !== null) {
      return NextResponse.json({
        success: true,
        view_count: rpcData,
      });
    }

    if (rpcError) {
      console.error('RPC increment_view_count failed, using fallback:', rpcError);
    }

    // Fallback: Manual increment if RPC function doesn't exist or fails
    const { data: current, error: fetchError } = await supabase
      .from(tableName)
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    const newCount = (current.view_count || 0) + 1;

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ view_count: newCount })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating view count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      view_count: newCount,
    });
  } catch (error: any) {
    console.error('Error in track-view API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
