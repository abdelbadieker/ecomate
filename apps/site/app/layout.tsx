import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: "EcoMate — The All-in-One SaaS for Algerian Business",
  description: "Centralize your business into one seamless platform.",
};

// Ensure every page is rendered fresh and clients always get the
// latest HTML — no Vercel edge cache, no Next.js data cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Providers>
          <div className="noise"></div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
