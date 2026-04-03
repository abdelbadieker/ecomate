'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  Chrome, 
  Rocket, 
  ShieldCheck, 
  ChevronRight,
  User
} from 'lucide-react'

function AuthModalsContent() {
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })

  useEffect(() => {
    const authType = searchParams.get('auth')
    if (authType === 'login' || authType === 'register') {
      setView(authType)
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [searchParams])

  const close = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('auth')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const toggleView = () => {
    const nextView = view === 'login' ? 'register' : 'login'
    const params = new URLSearchParams(searchParams)
    params.set('auth', nextView)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (!isOpen) return null

  return (
    <div className={`auth-overlay ${isOpen ? 'open' : ''}`} onClick={close}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="auth-box" 
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side (Decorative) */}
        <div className="auth-left text-white overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-blue-600/20">E</div>
              <span className="font-poppins font-black text-2xl tracking-tighter">ECOMATE</span>
            </div>
            
            <h2 className="font-poppins font-black text-4xl leading-tight mb-6">
              {view === 'login' ? t('welcomeBack') : t('startJourney')}
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed font-light">
              {view === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 glass">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                  <Rocket size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t('benefit1Title')}</h4>
                  <p className="text-xs text-white/40">{t('benefit1Desc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 glass">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t('benefit2Title')}</h4>
                  <p className="text-xs text-white/40">{t('benefit2Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract blobs */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/30 blur-[100px] rounded-full" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 blur-[80px] rounded-full" />
        </div>

        {/* Right Side (Forms) */}
        <div className="auth-right flex flex-col justify-between">
          <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>

          <div className="mt-8">
            <h3 className="font-poppins font-black text-3xl mb-2">
              {view === 'login' ? t('loginTitle') : t('registerTitle')}
            </h3>
            <p className="text-black/50 dark:text-white/50 text-sm mb-10">
              {view === 'login' ? t('noAccount') : t('haveAccount')}{' '}
              <button onClick={toggleView} className="text-blue-600 font-bold hover:underline">
                {view === 'login' ? t('signUp') : t('signIn')}
              </button>
            </p>

            <div className="space-y-4">
              {view === 'register' && (
                <div className="auth-field">
                  <label>{t('labelName')}</label>
                  <div className="auth-input-wrap">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder={t('placeholderName')} 
                      className="auth-input"
                    />
                  </div>
                </div>
              )}
              
              <div className="auth-field">
                <label>{t('labelEmail')}</label>
                <div className="auth-input-wrap">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="flex justify-between items-center mb-1">
                  <label className="mb-0">{t('labelPassword')}</label>
                  {view === 'login' && (
                    <button className="text-[11px] font-bold text-blue-600 hover:underline">
                      {t('forgot')}
                    </button>
                  )}
                </div>
                <div className="auth-input-wrap">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="auth-input"
                  />
                </div>
              </div>

              <button className="w-full bh1 mt-2 flex justify-center group">
                <span>{view === 'login' ? t('btnIn') : t('btnUp')}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 uppercase">
                  <span className="bg-white dark:bg-[#07101f] px-4 font-bold">{t('orContinue')}</span>
                </div>
              </div>

              <button className="w-full border-1.5 border-gray-200 dark:border-white/10 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-semibold text-sm">
                <Chrome size={18} />
                {t('logGoogle')}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center text-gray-400 mt-10">
            {t('termsPrefix')}{' '}
            <a href="#" className="underline">{t('termsLink')}</a> &{' '}
            <a href="#" className="underline">{t('privacyLink')}</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthModals() {
  return (
    <Suspense fallback={null}>
      <AuthModalsContent />
    </Suspense>
  )
}
