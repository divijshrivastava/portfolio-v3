import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, reason: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { ok: false as const, reason: 'Not authorized' };
  }

  return { ok: true as const, userId: user.id };
}

export async function POST(req: Request) {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const body = await req.json();
    const tables = body.tables as string[] | undefined;

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ error: 'tables array is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const exportData: Record<string, any> = {
      exported_at: new Date().toISOString(),
      exported_by: auth.userId,
      tables: {},
    };

    // Define available tables and their schemas
    const availableTables = [
      'blogs',
      'projects',
      'newsletters',
      'newsletter_subscribers',
      'newsletter_sends',
      'newsletter_deliveries',
      'messages',
      'user_activity',
      'profiles',
    ];

    // Only export requested tables
    for (const table of tables) {
      if (!availableTables.includes(table)) {
        continue;
      }

      try {
        const { data, error } = await admin
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Failed to export ${table}:`, error);
          exportData.tables[table] = { error: error.message };
        } else {
          exportData.tables[table] = {
            count: data?.length || 0,
            data: data || [],
          };
        }
      } catch (err: any) {
        console.error(`Exception exporting ${table}:`, err);
        exportData.tables[table] = { error: String(err?.message || err) };
      }
    }

    // Return as JSON download
    const fileName = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (e: any) {
    console.error('[Export] Error:', e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

