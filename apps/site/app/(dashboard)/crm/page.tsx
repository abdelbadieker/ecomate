'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  Info, 
  FileText, 
  Link as LinkIcon, 
  ExternalLink, 
  Folder, 
  Download, 
  Eye, 
  FileSpreadsheet, 
  Image as ImageIcon,
  FileArchive,
  ChevronRight,
  Database,
  Briefcase
} from 'lucide-react';

type Customer = { 
  id: string; 
  name: string; 
  email: string; 
  phone: string; 
  city: string; 
  notes: string; 
  total_orders: number; 
  total_spent: number; 
  created_at: string 
};

type CrmAsset = { 
  id: string; 
  type: 'file' | 'link'; 
  title: string; 
  file_url: string | null; 
  external_url: string | null; 
  file_name: string | null;
  mime_type: string | null;
  created_at: string 
};

export default function CRMPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<CrmAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'assets'>('customers');

  useEffect(() => { 
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const [custRes, assetsRes] = await Promise.all([
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('crm_assets').select('*').eq('client_id', user.id).order('created_at', { ascending: false })
        ]);
        
        setCustomers(custRes.data || []); 
        setAssets(assetsRes.data || []);
      } catch (error) {
        console.error('Error fetching CRM data:', error);
      } finally {
        setLoading(false); 
      }
    };
    fetchData(); 
  }, [supabase]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const getFileIcon = (mime: string | null) => {
    if (!mime) return <FileText className="w-5 h-5 text-slate-400" />;
    const m = mime.toLowerCase();
    if (m.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (m.includes('word') || m.includes('officedocument')) return <FileText className="w-5 h-5 text-blue-400" />;
    if (m.includes('excel') || m.includes('sheet') || m.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (m.includes('image')) return <ImageIcon className="w-5 h-5 text-amber-400" />;
    if (m.includes('zip') || m.includes('archive')) return <FileArchive className="w-5 h-5 text-purple-400" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading CRM Ecosystem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <Database className="text-blue-500 w-10 h-10" />
            CRM Hub
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Manage your customer database and shared business assets.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#0A1628] border border-slate-800 rounded-2xl">
          <button 
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'customers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            Customers ({customers.length})
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            Asset Manager ({assets.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[500px]">
        {activeTab === 'customers' ? (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-[#0A1628] border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              <Search className="text-slate-500 ml-2" size={20} />
              <input 
                placeholder="Search customers by name, email or phone..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="bg-transparent border-none outline-none text-white w-full text-sm font-medium"
              />
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-[2rem] py-24 flex flex-col items-center text-center px-10">
                <Users size={48} className="text-slate-700 mb-6" />
                <h3 className="text-xl font-black text-white uppercase">No Customers Found</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium text-sm">Customer data will appear here once imported by your administrator.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map(c => (
                  <div key={c.id} className="group bg-[#0A1628] border border-slate-800 p-6 rounded-3xl hover:border-slate-600 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#07101F] to-[#1e293b] border border-slate-800 flex items-center justify-center font-black text-blue-500 text-lg shadow-inner">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-white text-base truncate">{c.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Registered {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {c.email && (
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                          <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                            <Mail size={12} className="text-slate-500" />
                          </div>
                          {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                          <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                            <Phone size={12} className="text-slate-500" />
                          </div>
                          {c.phone}
                        </div>
                      )}
                      {c.city && (
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                          <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
                            <MapPin size={12} className="text-slate-500" />
                          </div>
                          {c.city}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/50">
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Orders</p>
                        <p className="text-xl font-black text-white">{c.total_orders}</p>
                      </div>
                      <div className="bg-blue-600/5 p-3 rounded-2xl border border-blue-500/10">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Spent</p>
                        <p className="text-xl font-black text-blue-400">{c.total_spent?.toLocaleString()} <span className="text-[10px] ml-0.5">DA</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Info Banner */}
            <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                <Info size={20} />
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                These documents and assets have been securely shared with you by your EcoMate administrator. 
                They are specific to your organization and can be downloaded or viewed at any time.
              </p>
            </div>

            {assets.length === 0 ? (
              <div className="bg-[#0A1628]/50 border border-dashed border-slate-800 rounded-[2rem] py-24 flex flex-col items-center text-center px-10">
                <Folder size={48} className="text-slate-700 mb-6" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">No Shared Assets</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium text-sm">Your administrator hasn't shared any documents or links with you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map(asset => (
                  <div key={asset.id} className="group bg-[#0A1628] border border-slate-800 p-6 rounded-3xl hover:border-slate-600 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[#07101F] rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner shrink-0">
                        {asset.type === 'link' ? <LinkIcon className="text-blue-400 w-6 h-6" /> : getFileIcon(asset.mime_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border ${asset.type === 'link' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {asset.type}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-white truncate leading-tight group-hover:text-blue-400 transition-colors">
                          {asset.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-600 uppercase mt-1">Shared {new Date(asset.created_at).toLocaleDateString()}</p>
                        
                        <div className="mt-6">
                          {asset.type === 'link' ? (
                            <a 
                              href={asset.external_url || '#'} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-full flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                              <ExternalLink size={14} /> Open Link
                            </a>
                          ) : (
                            <a 
                              href={asset.file_url || '#'} 
                              target="_blank" 
                              rel="noreferrer"
                              download={asset.file_name}
                              className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                              <Download size={14} /> Download File
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
