'use client'
import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import { Menu } from 'lucide-react'

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  profile: any;
  userEmail?: string;
}

export default function DashboardLayoutClient({ children, profile, userEmail }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-body)]">
      <DashboardSidebar 
        profile={profile} 
        userEmail={userEmail} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-[var(--border-c)] bg-[var(--bg-section)] sticky top-0 z-40">
          <div className="font-black text-xl font-poppins tracking-tight">
            <span className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">Eco</span>
            <span className="bg-gradient-to-br from-blue-500 to-emerald-500 bg-clip-text text-transparent">Mate</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-[var(--text-main)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
