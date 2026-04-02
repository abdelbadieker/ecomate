import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/webhooks/make-order
 * Catch JSON from Make.com to upsert customer and create order.
 * Validates Authorization: Bearer <API_SECRET_KEY>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.API_SECRET_KEY

  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid Bearer token' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const { 
      clientId, 
      fullName, 
      phoneNumber, 
      wilayaName, 
      productId, 
      quantity = 1,
      deliveryType = 'Home',
      orderNotes = ''
    } = payload

    if (!clientId || !fullName || !phoneNumber || !wilayaName || !productId) {
      return NextResponse.json({ error: 'Missing required payload fields' }, { status: 400 })
    }

    // 1. Basic Sanitization for Wilaya
    const sanitizedWilaya = wilayaName.trim().replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())

    const supabase = await createAdminClient()

    // 2. Upsert Customer in public.customers_crm (By client_id and phone_number)
    // First, check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers_crm')
      .upsert({
        client_id: clientId,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        wilaya_name: sanitizedWilaya,
        notes: orderNotes
      }, { onConflict: 'client_id,phone_number' })
      .select()
      .single()

    if (customerError) {
      console.error('Customer Upsert Error:', customerError)
      return NextResponse.json({ error: 'Failed to record customer' }, { status: 500 })
    }

    // 3. Create Row in public.orders
    // We need the product price for total_price_dzd
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price_dzd')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: clientId,
        customer_id: customer.id,
        product_id: productId,
        quantity: quantity,
        delivery_type: deliveryType,
        status: 'Pending',
        total_price_dzd: product.price_dzd * quantity,
        tracking_provider_link: 'https://yalidine.com/track/' // Default tracking
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order Creation Error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      orderNumber: order.order_number, 
      message: 'Order created successfully' 
    })

  } catch (err) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 })
  }
}
