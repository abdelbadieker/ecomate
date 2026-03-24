import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Partners from '@/components/landing/Partners'
import Reviews from '@/components/landing/Reviews'
import { Integrations, Features, HowItWorks, DashboardPreview, AISection, Pricing, CTA, Footer } from '@/components/landing/Sections'
import LandingEffects from '@/components/landing/LandingEffects'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const FALLBACK_PARTNERS = [
  { id: 'p1',  logo: '🚚', name: 'Delivery Partner',    category: 'Logistics',      row_num: 1, is_live: false, sort_order: 1 },
  { id: 'p2',  logo: '🏦', name: 'Banking Partner',     category: 'Payments',        row_num: 1, is_live: false, sort_order: 2 },
  { id: 'p3',  logo: '📱', name: 'Telecom Partner',     category: 'Connectivity',    row_num: 1, is_live: false, sort_order: 3 },
  { id: 'p4',  logo: '🏪', name: 'Commerce Partner',    category: 'E-commerce',      row_num: 1, is_live: false, sort_order: 4 },
  { id: 'p5',  logo: '🏛️', name: 'Incubator Partner',   category: 'Institutional',   row_num: 1, is_live: false, sort_order: 5 },
  { id: 'p6',  logo: '☁️', name: 'Cloud Partner',       category: 'Infrastructure',  row_num: 1, is_live: false, sort_order: 6 },
  { id: 'p7',  logo: '🤝', name: 'Reseller Partner',    category: 'Distribution',    row_num: 1, is_live: false, sort_order: 7 },
  { id: 'p8',  logo: '📦', name: 'Fulfillment Partner', category: 'COD & Shipping',  row_num: 1, is_live: false, sort_order: 8 },
  { id: 'p9',  logo: '🎓', name: 'University Partner',  category: 'Research',        row_num: 2, is_live: false, sort_order: 1 },
  { id: 'p10', logo: '📡', name: 'Media Partner',       category: 'Marketing',       row_num: 2, is_live: false, sort_order: 2 },
  { id: 'p11', logo: '🔐', name: 'Security Partner',    category: 'Compliance',      row_num: 2, is_live: false, sort_order: 3 },
  { id: 'p12', logo: '📊', name: 'Analytics Partner',   category: 'Data Intel',      row_num: 2, is_live: false, sort_order: 4 },
  { id: 'p13', logo: '🛒', name: 'Marketplace Partner', category: 'Sales Channel',   row_num: 2, is_live: false, sort_order: 5 },
  { id: 'p14', logo: '🌍', name: 'Gov & Public Partner',category: 'Public Sector',   row_num: 2, is_live: false, sort_order: 6 },
  { id: 'p15', logo: '💳', name: 'Fintech Partner',     category: 'Digital Pay',     row_num: 2, is_live: false, sort_order: 7 },
  { id: 'p16', logo: '🤖', name: 'AI Tech Partner',     category: 'Technology',      row_num: 2, is_live: false, sort_order: 8 },
]

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: reviews }, 
    { data: dbPartners }, 
    { data: services }, 
    { data: plans }
  ] = await Promise.all([
    supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(9),
    supabase.from('partners').select('*').order('row_num').order('sort_order'),
    supabase.from('services').select('*').eq('is_active', true).order('created_at', { ascending: true }),
    supabase.from('plans').select('*').order('sort_order', { ascending: true })
  ])

  const partners = dbPartners && dbPartners.length > 0 ? dbPartners : FALLBACK_PARTNERS

  return (
    <main>
      <LandingEffects />
      <Nav />
      <Hero />
      <Integrations />
      <Partners partners={partners} />
      <Features services={services || []} />
      <HowItWorks />
      <DashboardPreview />
      <AISection />
      <Pricing plans={plans || []} />
      <Reviews reviews={reviews || []} />
      <CTA />
      <Footer />
    </main>
  )
}
