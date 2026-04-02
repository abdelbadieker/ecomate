import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function WarehousePage() {
  const supabase = await createClient()
  
  // Fetch all products across all clients
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      clients:client_id (
        agency_name,
        email
      )
    `)
    .order('stock_quantity', { ascending: true })

  if (error) {
    console.error('Error fetching warehouse data:', error)
  }

  return (
    <div style={{ color: '#fff' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📦 Master Warehouse</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Unified inventory management across all Ecomate merchants.
        </p>
      </header>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Product</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Owned By</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Price (DZD)</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Stock Status</th>
              <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>Visibility</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((product: any) => {
              const isLowStock = product.stock_quantity <= 5
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>ID: {product.id.slice(0, 8)}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 14 }}>{product.clients?.agency_name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'rgba(16, 185, 129, 0.6)' }}>{product.clients?.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                    {product.price_dzd.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8,
                      padding: '4px 12px',
                      borderRadius: 100,
                      background: isLowStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: isLowStock ? '#ef4444' : '#10b981',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      <div style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: isLowStock ? '#ef4444' : '#10b981' 
                      }} />
                      {product.stock_quantity} units {isLowStock && '(REPLENISH)'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {product.is_active ? (
                      <span style={{ color: '#10b981', fontSize: 12 }}>Active on Chatbot</span>
                    ) : (
                      <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 12 }}>Inactive</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
