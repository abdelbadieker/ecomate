import type { Metadata } from 'next'
import { Poppins, Inter, Almarai } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
})

export const metadata: Metadata = {
  title: 'EcoMate — The All-in-One SaaS for Algerian Business',
  description: 'EcoMate centralizes every tool Algerian SMEs need — AI chatbot, order management, CRM, and AI-powered client acquisition.',
  keywords: 'ecomate, algerie, saas, ecommerce, chatbot, ia',
}

export default async function RootLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await (params instanceof Promise ? params : Promise.resolve(params));
  const messages = await getMessages()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const fontClass = locale === 'ar' ? almarai.variable : `${poppins.variable} ${inter.variable}`
  const fontBody = locale === 'ar' ? 'font-almarai' : 'font-inter'

  return (
    <html lang={locale} dir={direction} data-theme="dark" suppressHydrationWarning>
      <body className={`${fontClass} ${fontBody}`}>
        <NextIntlClientProvider messages={messages}>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0a1628',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            }}
          />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
