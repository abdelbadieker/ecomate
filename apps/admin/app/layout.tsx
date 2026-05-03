'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';
import './globals.css';
import {
  LayoutDashboard,
  Users,
  Palette,
  Share2,
  Database,
  Settings,
  PackageCheck,
  Contact,
  History,
  Star,
  LifeBuoy,
  CreditCard,
  MessageSquare,
  DollarSign
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Merchants & Users', href: '/merchants', icon: <Users size={20} /> },
  { name: 'Subscriptions', href: '/subscriptions', icon: <CreditCard size={20} /> },
  { name: 'Creative Studio', href: '/creative-studio', icon: <Palette size={20} /> },
  { name: 'Partner Links', href: '/partner-links', icon: <Share2 size={20} /> },
  { name: 'Support Tickets', href: '/tickets', icon: <LifeBuoy size={20} /> },
  { name: 'Messaging', href: '/messaging', icon: <MessageSquare size={20} /> },
  { name: 'Pricing Plans', href: '/pricing', icon: <DollarSign size={20} /> },
  { name: 'CRM Hub', href: '/crm-import', icon: <Database size={20} /> },
  { name: 'Reviews', href: '/reviews', icon: <Star size={20} /> },
  { name: 'Module Locker', href: '/module-locker', icon: <Settings size={20} /> },
  { name: 'Fulfillment', href: '/fulfillment-engine', icon: <PackageCheck size={20} /> },
  { name: 'Platform Contacts', href: '/platform-contacts', icon: <Contact size={20} /> },
  { name: 'Activity Logs', href: '/activity-logs', icon: <History size={20} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body className="antialiased font-sans selection:bg-blue-500/30">
        <div className="flex h-screen bg-[#07101F] text-white overflow-hidden">
          {!isLoginPage && (
            <aside className="w-72 flex-shrink-0 bg-[#0A1628] border-r border-slate-800 flex flex-col shadow-2xl relative z-30">
              <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">E</div>
                  <span className="text-xl font-black tracking-tight text-white">
                    EcoMate <span className="text-blue-500 italic">Admin</span>
                  </span>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <Link 
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                          isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                          {item.icon}
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                      </Link>
                      
                    </div>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-slate-800/50 bg-slate-900/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center font-black text-white shadow-xl">
                    AK
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Abdelbadie</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Master Admin</div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1 flex flex-col min-w-0 relative">
            {!isLoginPage && (
              <header className="h-20 flex items-center justify-between px-10 bg-[#0A1628]/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-20">
                <div className="flex items-center gap-8">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    {navItems.find(n => n.href === pathname)?.name || 'Dashboard'}
                  </h1>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black tracking-[0.2em] text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Primary Core Alpha
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <LogoutButton />
                </div>
              </header>
            )}

            <main className={`flex-1 overflow-y-auto custom-scrollbar ${isLoginPage ? '' : 'p-10'}`}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
