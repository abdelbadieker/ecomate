'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, User, Phone, MapPin, ShoppingBag, CreditCard, Calendar } from 'lucide-react'

interface Customer {
  id: string
  full_name: string
  phone_number: string
  wilaya_name: string
  notes?: string
  created_at: string
  orders: any[]
}

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [search, setSearch] = useState('')
  const [wilayaFilter, setWilayaFilter] = useState('All')

  const processedCustomers = useMemo(() => {
    return initialCustomers.map(c => {
      const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total_price_dzd || 0), 0)
      const lastOrder = c.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      return {
        ...c,
        totalOrders: c.orders.length,
        totalSpent,
        lastOrderDate: lastOrder?.created_at || null
      }
    })
  }, [initialCustomers])

  const filteredCustomers = useMemo(() => {
    return processedCustomers.filter(c => {
      const matchesSearch = 
        c.full_name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone_number.includes(search)
      const matchesWilaya = wilayaFilter === 'All' || c.wilaya_name === wilayaFilter
      return matchesSearch && matchesWilaya
    })
  }, [processedCustomers, search, wilayaFilter])

  const wilayas = Array.from(new Set(initialCustomers.map(c => c.wilaya_name))).sort()

  const stats = {
    total: processedCustomers.length,
    revenue: processedCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    repeat: processedCustomers.filter(c => c.totalOrders > 1).length
  }

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Wilaya', 'Orders', 'Total Spent (DZD)', 'Last Order']
    const rows = filteredCustomers.map(c => [
      c.full_name,
      c.phone_number,
      c.wilaya_name,
      c.totalOrders,
      c.totalSpent,
      c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'N/A'
    ])
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ecomate_customers_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 font-poppins tracking-tight">Customer CRM 👥</h1>
          <p className="text-white/40 font-medium">Manage shopper history, loyalty, and high-value profiles.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[160px]">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Total Shoppers</div>
            <div className="text-2xl font-black text-white leading-none">{stats.total}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[200px]">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Total CRM Revenue</div>
            <div className="text-2xl font-black text-emerald-500 leading-none">{stats.revenue.toLocaleString()} <span className="text-xs">DZD</span></div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[160px]">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Repeat Buyers</div>
            <div className="text-2xl font-black text-blue-500 leading-none">{stats.repeat}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <select 
              value={wilayaFilter}
              onChange={e => setWilayaFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-all"
            >
              <option value="All">All Wilayas</option>
              {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          
          <button 
            onClick={exportCSV}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 flex items-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-[#0a1628] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Customer Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Contact</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Region</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Orders</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Total Spent</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredCustomers.map((customer) => (
                  <motion.tr 
                    key={customer.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-sm">
                          {customer.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm tracking-tight">{customer.full_name}</div>
                          <div className="text-[10px] font-black uppercase tracking-tighter text-white/20 group-hover:text-blue-500/50 transition-colors">ID: {customer.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                        <Phone className="w-3 h-3 text-white/20" />
                        {customer.phone_number}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-white/20" />
                        <span className="text-white/60 text-sm font-medium">{customer.wilaya_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500 text-xs font-black">
                          {customer.totalOrders}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-emerald-500 font-bold text-base tracking-tight">
                        {customer.totalSpent.toLocaleString()} <span className="text-[10px] text-emerald-500/50">DZD</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                        <Calendar className="w-3 h-3 text-white/10" />
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('fr-DZ') : 'No Orders'}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white/10" />
              </div>
              <h3 className="text-white font-black text-xl mb-2 font-poppins">No Shoppers Found</h3>
              <p className="text-white/40 text-sm max-w-xs mx-auto">Try adjusting your search criteria or filters to find specific customers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
