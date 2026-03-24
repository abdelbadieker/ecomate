import Nav from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Sections'
import LandingEffects from '@/components/landing/LandingEffects'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const supabase = createClient()
  const { data: contactSettings } = await supabase.from('contact_settings').select('*').single()

  const salesEmail = contactSettings?.sales_email || 'sales@ecomate.dz'
  const supportEmail = contactSettings?.support_email || 'support@ecomate.dz'
  const salesPhone = contactSettings?.sales_phone || '+213 (0) 555 000 000'
  const supportPhone = contactSettings?.support_phone || '+213 (0) 555 111 111'
  const address = contactSettings?.office_address || 'Algiers, Algeria'

  return (
    <main style={{ background: '#050a14', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LandingEffects />
      <Nav />
      
      <div style={{ flex: 1, padding: '160px 20px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, width: '100%', position: 'relative' }}>
          
          {/* Main Glow */}
          <div style={{
            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)',
            pointerEvents: 'none', zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 60 }}>
            <h1 className="hero-h1 sr-el sr-vis" style={{
              fontFamily: 'var(--font-poppins)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
              background: 'linear-gradient(to bottom right, #fff, rgba(255,255,255,.7))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 16
            }}>Get in <span style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Touch</span></h1>
            <p className="hero-h2 sr-el sr-d1 sr-vis" style={{ fontSize: 'clamp(16px, 2vw, 18px)', color: 'rgba(255,255,255,.6)', maxWidth: 600, margin: '0 auto' }}>
              Whether you're looking for an enterprise solution or need support with your current store, our team is here for you.
            </p>
          </div>

          <div className="sr-el sr-d2 sr-vis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {/* Sales Contact */}
            <div className="bc-glow" style={{
              background: 'linear-gradient(145deg, rgba(30,58,138,.3), rgba(10,20,38,.5))',
              border: '1px solid rgba(37,99,235,.2)', borderRadius: 24, padding: 40,
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🤝</div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Contact Sales</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>Ready to scale your e-commerce? Let's talk about custom plans.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', background: 'rgba(0,0,0,.3)', padding: 20, borderRadius: 16 }}>
                <a href={`mailto:${salesEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#60a5fa', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  <span>✉️</span> {salesEmail}
                </a>
                <a href={`tel:${salesPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  <span>☎️</span> {salesPhone}
                </a>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bc-glow" style={{
              background: 'linear-gradient(145deg, rgba(16,185,129,.15), rgba(10,38,20,.3))',
              border: '1px solid rgba(16,185,129,.2)', borderRadius: 24, padding: 40,
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🛠️</div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Technical Support</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>Need help with your Dashboard, AI, or CRM? Our team is live.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', background: 'rgba(0,0,0,.3)', padding: 20, borderRadius: 16 }}>
                <a href={`mailto:${supportEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#34d399', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  <span>✉️</span> {supportEmail}
                </a>
                <a href={`tel:${supportPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  <span>☎️</span> {supportPhone}
                </a>
              </div>
            </div>
          </div>

          <div className="sr-el sr-d3 sr-vis" style={{
            marginTop: 24, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,.05)',
            borderRadius: 24, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16
          }}>
            <span style={{ fontSize: 24 }}>📍</span>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>
              <strong>HQ Office:</strong> {address}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}
