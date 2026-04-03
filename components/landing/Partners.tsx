'use client'
import { useTranslations, useLocale } from 'next-intl'

export default function Partners({ partners }: { partners: any[] }) {
  const t = useTranslations('Landing.Partners')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const row1 = partners.filter(p => p.row_num === 1)
  const row2 = partners.filter(p => p.row_num === 2)

  function PartnerCard(p: any) {
    return (
      <div key={p.id} className="inline-flex items-center gap-3.5 px-6 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl whitespace-nowrap flex-shrink-0 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all group">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
          {p.logo?.startsWith('http') ? (
            <img src={p.logo} alt={p.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
          ) : (
            <span className="text-xl">{p.logo}</span>
          )}
        </div>
        <div>
          <span className="block text-[14px] font-bold text-white/90 font-poppins leading-tight">{p.name}</span>
          <span className="block text-[10px] font-bold text-white/30 uppercase tracking-wider mt-0.5">{p.category}</span>
        </div>
        {!p.is_live && (
          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-500/80 uppercase tracking-tighter">Soon</span>
        )}
      </div>
    )
  }

  return (
    <section className="py-20 border-y border-white/5 bg-[#01050a] overflow-hidden relative">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-12">
        <div className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">
          <span className="w-10 h-[1.5px] bg-blue-500/30" />
          {t('subtitle')}
          <span className="w-10 h-[1.5px] bg-blue-500/30" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-poppins tracking-tighter text-white mb-4 leading-tight">
          {t.rich('title', {
            spanTag: (chunks) => <span className="bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">{chunks}</span>
          })}
        </h2>
        <p className="text-white/40 text-sm font-medium">{t('desc')}</p>
      </div>

      {/* Marquee Tracks */}
      <div className="relative">
        {/* Gradient Fades */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-60 bg-gradient-to-r from-[#01050a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-60 bg-gradient-to-l from-[#01050a] to-transparent z-10 pointer-events-none" />

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="marquee-container">
            <div className="marquee-content ptn-row-1">
              {row1.map(p => <PartnerCard key={p.id} {...p} />)}
              {row1.map(p => <PartnerCard key={`${p.id}-dup`} {...p} />)}
            </div>
          </div>

          {/* Row 2 */}
          <div className="marquee-container">
            <div className="marquee-content ptn-row-2">
              {row2.map(p => <PartnerCard key={p.id} {...p} />)}
              {row2.map(p => <PartnerCard key={`${p.id}-dup`} {...p} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
