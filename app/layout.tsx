import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'EcoMate — The All-in-One SaaS for Algerian Business',
  description: 'EcoMate centralizes every tool Algerian SMEs need — AI chatbot, order management, CRM, and AI-powered client acquisition.',
  keywords: 'ecomate, algerie, saas, ecommerce, chatbot, ia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${poppins.variable} ${inter.variable} font-inter`}>
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
      </body>
    </html>
  )
}
