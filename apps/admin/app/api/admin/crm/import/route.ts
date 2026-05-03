import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = cookies().get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, customers } = await req.json();

    if (!merchantId || !customers || !Array.isArray(customers)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (customers.length === 0) {
      return NextResponse.json({ error: 'No customer records provided' }, { status: 400 });
    }

    // Map parsed CSV fields to database column names.
    // The live customers table uses city; wilaya is accepted as an import label.
    const finalRows = customers.map((c: Record<string, string>) => ({
      name: c.name?.trim() || null,
      email: c.email?.trim() || null,
      phone: c.phone?.trim() || null,
      city: (c.city || c.wilaya || c.location)?.trim() || null,
      notes: c.notes?.trim() || null,
      total_orders: Math.max(0, parseInt(c.total_orders || '0') || 0),
      total_spent: Math.max(0, parseFloat(c.total_spent || '0') || 0),
      merchant_id: merchantId,
    }));

    // Insert in chunks of 100 to stay within Supabase request limits
    const CHUNK_SIZE = 100;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < finalRows.length; i += CHUNK_SIZE) {
      const chunk = finalRows.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseAdmin.from('customers').insert(chunk);
      if (error) {
        console.error(`[CRM Import] Chunk ${Math.floor(i / CHUNK_SIZE)} failed:`, error.message);
        errors.push(error.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    // Log the activity (non-blocking — don't fail the import if logging fails)
    await supabaseAdmin.from('activity_logs').insert({
      action: 'crm_bulk_import',
      details: `Imported ${totalInserted} customer record(s)`,
      entity_type: 'merchant',
      entity_id: merchantId,
    }).then(null, null);

    if (errors.length > 0 && totalInserted === 0) {
      return NextResponse.json({ error: errors[0], count: 0 }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: totalInserted,
      partial: errors.length > 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const message = (err as Error).message || 'Internal server error';
    console.error('[CRM Import] Fatal error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
