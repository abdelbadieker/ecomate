'use client'
import { useState, useEffect, useTransition } from 'react'
import { Link, usePathname, useRouter } from '@/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLocale, useTranslations } from 'next-intl'
import { Menu, X, Globe, Moon, Sun, LayoutDashboard, LogIn, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const isRtl = locale === 'ar'

  useEffect(() => {
    const t = localStorage.getItem('em-theme') || 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)

    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('em-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const toggleLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar'
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const t = useTranslations('Landing.Nav')

  const navLinks = [
    { name: t('features'), href: '#features' },
    { name: t('ai'), href: '#ai-section' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('howItWorks'), href: '#how' },
  ]

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-[500] h-[68px] px-[5%]
      flex items-center justify-between transition-all duration-300
      ${scrolled 
        ? 'bg-[#050a14]/80 dark:bg-[#050a14]/80 backdrop-blur-[24px] border-b border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.12)]' 
        : 'bg-transparent border-b border-transparent'}
    `}>
      {/* Logo */}
      <Link href="/" className="font-poppins font-extrabold text-[22px] tracking-tighter flex items-center z-[510]">
        <span className="bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">Eco</span>
        <span className="bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent">Mate</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-[30px]">
        {navLinks.map((link) => (
          <a 
            key={link.href}
            href={link.href} 
            className="text-sm font-medium text-white/65 hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* Desktop Right */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Lang Switcher */}
        <button 
          onClick={toggleLocale} 
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-wider"
        >
          <Globe className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
          {locale === 'ar' ? 'EN' : 'AR'}
        </button>

        {/* Theme Toggle (Premium Design) */}
        <button 
          onClick={toggleTheme}
          className={`
            w-11 h-6 rounded-full relative transition-all duration-300 flex items-center px-1
            ${theme === 'light' ? 'bg-[#cbd5e1]' : 'bg-gradient-to-br from-[#1e3a8a] to-[#2563eb]'}
          `}
        >
          <div className={`
            w-4.5 h-4.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform duration-300
            ${theme === 'light' ? 'translate-x-5 !bg-[#0F172A]' : 'translate-x-0'}
          `} />
          <Moon className={`absolute left-1.5 w-2.5 h-2.5 transition-opacity ${theme === 'light' ? 'opacity-0' : 'opacity-100 text-white'}`} />
          <Sun className={`absolute right-1.5 w-2.5 h-2.5 transition-opacity ${theme === 'light' ? 'opacity-100 text-[#0F172A]' : 'opacity-0'}`} />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-2" />

        {user ? (
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-[13px] shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('dashboard')}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/?auth=login" 
              className="text-[13px] font-medium text-white/65 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-[18px] py-[8px] rounded-[8px] transition-all"
            >
              {t('login')}
            </Link>
            <Link 
              href="/?auth=register" 
              className="text-[13px] font-bold text-white bg-gradient-to-br from-blue-600 to-blue-800 px-[20px] py-[9px] rounded-[8px] shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 transition-all"
            >
              {t('register')}
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="lg:hidden flex items-center gap-4 z-[510]">
        <button onClick={toggleLocale} className="text-xs font-black text-white/50 uppercase">
          {locale === 'ar' ? 'EN' : 'AR'}
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 top-0 pt-24 px-6 bg-[#01050a] z-[500] lg:hidden flex flex-col gap-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold text-white"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="h-[1px] bg-white/10 w-full" />

            <div className="flex flex-col gap-4">
              {user ? (
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-bold"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t('dashboard')}
                </Link>
              ) : (
                <>
                  <Link 
                    href="/?auth=login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold"
                  >
                    <LogIn className="w-5 h-5" />
                    {t('login')}
                  </Link>
                  <Link 
                    href="/?auth=register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-black"
                  >
                    {t('register')}
                    <ChevronRight size={18} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
