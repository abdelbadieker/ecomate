import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/bot/catalog?clientId=...
 * Fetches active products for a specific client and formats them for ManyChat Dynamic Content Gallery (v2).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price_dzd, image_url')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(10) // ManyChat gallery limit is 10 items

  if (error) {
    console.error('Supabase Error:', error)
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
  }

  // Format for ManyChat Dynamic Content Gallery (v2)
  const response = {
    version: 'v2',
    content: {
      type: 'gallery',
      image_aspect_ratio: 'horizontal', // 'horizontal' or 'square'
      elements: products.map((product) => ({
        title: product.name,
        subtitle: `${product.price_dzd.toLocaleString()} DZD - ${product.description || ''}`,
        image_url: product.image_url || 'https://via.placeholder.com/600x315?text=EcoMate+Product',
        action_url: '', // Optional: link to a product page
        buttons: [
          {
            type: 'node',
            caption: '🛒 Buy Now',
            node: 'Order Processing Flow', // This node name should exist in ManyChat flow
            set_field_values: [
              {
                field: 'selected_product_id', // Target User Field in ManyChat
                value: product.id
              }
            ]
          }
        ]
      }))
    }
  }

  return NextResponse.json(response)
}
