'use client'
import { useState, useTransition } from 'react'
import { Link, usePathname, useRouter } from '@/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, ChevronRight, Globe, Zap, Shield, Menu } from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', icon: '📊', labelKey: 'dashboard', plan: 'starter' },
  { href: '/dashboard/orders', icon: '📦', labelKey: 'orders', plan: 'starter' },
  { href: '/dashboard/products', icon: '🛍️', labelKey: 'products', plan: 'starter' },
  { href: '/dashboard/customers', icon: '👥', labelKey: 'customers', plan: 'growth' },
  { href: '/dashboard/ai-chatbot', icon: '🤖', labelKey: 'ai_chatbot', plan: 'starter' },
  { href: '/dashboard/analytics', icon: '📈', labelKey: 'analytics', plan: 'growth' },
  { href: '/dashboard/delivery', icon: '🚚', labelKey: 'delivery', plan: 'starter' },
  { href: '/dashboard/settings', icon: '⚙️', labelKey: 'settings', plan: 'starter' },
]

const planOrder = { starter: 0, growth: 1, business: 2, none: -1 }

interface SidebarProps {
  profile: any;
  userEmail?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ profile, userEmail, isOpen, setIsOpen }: SidebarProps) {
  const t = useTranslations('Sidebar')
  const commonT = useTranslations('Common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const rawPlan = profile?.plan || (profile?.is_admin ? 'business' : 'starter')
  const userPlan = rawPlan.toLowerCase()

  function canAccess(requiredPlan: string) {
    return (planOrder[userPlan as keyof typeof planOrder] ?? 0) >= (planOrder[requiredPlan as keyof typeof planOrder] ?? 0)
  }

  function toggleLocale() {
    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t('sign_out'))
    router.push('/')
    router.refresh()
  }

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: isRtl ? '100%' : '-100%', opacity: 0 }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={typeof window !== 'undefined' && window.innerWidth < 1024 ? (isOpen ? 'open' : 'closed') : 'open'}
        variants={sidebarVariants}
        className={`
          fixed lg:sticky top-0 inset-y-0 z-50
          ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}
          w-[280px] lg:w-[260px] flex-shrink-0
          bg-[var(--bg-section)] border-[var(--border-c)]
          flex flex-col h-screen overflow-y-auto
          transition-colors duration-300
        `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header & Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="font-extrabold text-2xl font-poppins tracking-tighter">
              <span className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">Eco</span>
              <span className="bg-gradient-to-br from-blue-500 to-emerald-500 bg-clip-text text-transparent">Mate</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-[var(--card-hover)] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-sub)]" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-c)] rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                {(profile?.full_name?.[0] || profile?.business_name?.[0] || '👤').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[var(--text-main)] truncate font-poppins">
                  {profile?.full_name || commonT('client')}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{profile?.business_name || commonT('store')}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                ${userPlan === 'starter' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                  userPlan === 'growth' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'}
              `}>
                {userPlan === 'starter' ? (
                  <><Zap className="w-3 h-3" /> {commonT('trial')}</>
                ) : userPlan === 'growth' ? (
                  <><Shield className="w-3 h-3" /> {commonT('growth')}</>
                ) : (
                  <><Shield className="w-3 h-3" /> {commonT('business')}</>
                )}
              </div>
              
              {/* Locale Switcher Button */}
              <button
                onClick={toggleLocale}
                disabled={isPending}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[var(--card-hover)] text-[10px] font-bold text-[var(--text-sub)] transition-all"
              >
                <Globe className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                <span className="uppercase">{locale === 'ar' ? 'EN' : 'AR'}</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map(item => {
          const active = pathname === item.href
          const locked = !canAccess(item.plan)
          return (
            <div key={item.href} className="relative">
              {locked ? (
                <button
                  type="button"
                  onClick={() => toast.error(`Upgrade to ${item.plan} plan to access ${t(item.labelKey)}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl opacity-40 cursor-not-allowed group transition-all"
                >
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium text-[var(--text-sub)] text-start">{t(item.labelKey)}</span>
                  <Shield className="w-3.5 h-3.5 opacity-50" />
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                    ${active ? 'bg-blue-600/10 text-blue-500' : 'text-[var(--text-sub)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)]'}
                  `}
                >
                  <span className={`text-xl ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{t(item.labelKey)}</span>
                  {active && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)]" 
                    />
                  )}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* Upgrade / Footer Section */}
      <div className="mt-8 space-y-4">
        {(userPlan === 'starter' || userPlan === 'growth') && (
          <Link href="/checkout" className="group block p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-emerald-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-1.5">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              {t('upgrade')}
            </div>
            <p className="text-[10px] text-[var(--text-sub)] leading-relaxed mb-3 opacity-80">
              {userPlan === 'starter' ? 'Unlock CRM & Analytics.' : 'Scale with custom priority support.'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-main)]">
                {userPlan === 'starter' ? '4,900 DA' : 'Contact Us'}
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </div>
          </Link>
        )}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-sub)] hover:bg-red-500/10 hover:text-red-500 transition-all font-semibold text-sm"
        >
          <LogOut className="w-4.5 h-4.5" />
          {t('sign_out')}
        </button>
      </div>
    </div>
  </motion.aside>
</>
  )
}
