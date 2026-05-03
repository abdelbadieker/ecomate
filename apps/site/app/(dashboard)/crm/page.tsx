'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Phone, Mail, MapPin, Users, Info, FileText, Link as LinkIcon, ExternalLink, Folder, Download, Eye, FileDigit, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';

type Customer = { id: string; name: string; email: string; phone: string; city: string; notes: string; total_orders: number; total_spent: number; created_at: string };
type CrmAsset = { id: string; type: 'file' | 'link'; title: string; file_url: string | null; external_url: string | null; created_at: string };
type CrmFile = { id: string; file_name: string; file_url: string; file_type: string; file_size: number; created_at: string };

export default function CRMPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<CrmAsset[]>([]);
  const [files, setFiles] = useState<CrmFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'assets'>('customers');

  const fetch_ = async () => { 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const [custRes, assetsRes, filesRes] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_assets').select('*').eq('client_id', user.id).order('created_at', { ascending: false }),
      supabase.from('crm_files').select('*').eq('client_id', user.id).order('created_at', { ascending: false })
    ]);
    
    setCustomers(custRes.data || []); 
    setAssets(assetsRes.data || []);
    setFiles(filesRes.data || []);
    setLoading(false); 
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch_(); }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (type.includes('word') || type.includes('officedocument')) return <FileDigit className="w-5 h-5 text-blue-400" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const s = {
    card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 16, padding: 20 } as React.CSSProperties,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div style={{ width: 32, height: 32, border: '3px solid #1e293b', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>CRM Hub</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Manage customers and shared assets</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
        <button 
          onClick={() => setActiveTab('customers')}
          style={{ padding: '0 12px 12px', fontSize: 14, fontWeight: 700, color: activeTab === 'customers' ? '#34d399' : '#64748b', borderBottom: activeTab === 'customers' ? '2px solid #34d399' : '2px solid transparent', transition: 'all 0.2s', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
        >
          Customers ({customers.length})
        </button>
        <button 
          onClick={() => setActiveTab('assets')}
          style={{ padding: '0 12px 12px', fontSize: 14, fontWeight: 700, color: activeTab === 'assets' ? '#60a5fa' : '#64748b', borderBottom: activeTab === 'assets' ? '2px solid #60a5fa' : '2px solid transparent', transition: 'all 0.2s', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer' }}
        >
          Documents & Assets ({assets.length + files.length})
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(52,211,153,0.08))', borderColor: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
        <Info style={{ width: 18, height: 18, color: '#60a5fa', flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
          {activeTab === 'customers' ? 'Customer data is managed and imported by your EcoMate administrator. This data automatically syncs with your dashboard in real-time.' : 'These documents and assets have been securely shared with you by your EcoMate administrator.'}
        </p>
      </div>

      {activeTab === 'customers' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', ...s.card, padding: '10px 16px', gap: 10 }}>
            <Search style={{ width: 16, height: 16, color: '#64748b' }} />
            <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: 0, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          </div>

          {filteredCustomers.length === 0 ? (
            <div style={{ ...s.card, textAlign: 'center', padding: 48 }}>
              <Users style={{ width: 48, height: 48, color: '#334155', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>No customers found</p>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>Customer data will appear here once your admin imports it.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filteredCustomers.map(c => (
                <div key={c.id} style={{ ...s.card, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{c.name.charAt(0)}</div>
                      <div><div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>{c.name}</div><div style={{ fontSize: 11, color: '#64748b' }}>Since {new Date(c.created_at).toLocaleDateString()}</div></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                    {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><Mail style={{ width: 13, height: 13, color: '#64748b' }} />{c.email}</div>}
                    {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><Phone style={{ width: 13, height: 13, color: '#64748b' }} />{c.phone}</div>}
                    {c.city && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}><MapPin style={{ width: 13, height: 13, color: '#64748b' }} />{c.city}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(51,65,85,0.4)' }}>
                    <div><div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{c.total_orders}</div><div style={{ fontSize: 10, color: '#64748b' }}>Orders</div></div>
                    <div><div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>DA {c.total_spent?.toLocaleString()}</div><div style={{ fontSize: 10, color: '#64748b' }}>Total Spent</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Files Grid */}
          {files.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Folder style={{ width: 18, height: 18, color: '#60a5fa' }} />
                Shared Documents
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {files.map(file => (
                  <div key={file.id} style={{ ...s.card, display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {getFileIcon(file.file_type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.file_name}>{file.file_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}</div>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      download={file.file_name}
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', transition: 'all 0.2s', flexShrink: 0 }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(52,211,153,0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(52,211,153,0.1)'}
                    >
                      <Download style={{ width: 16, height: 16 }} />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Assets Grid */}
          {assets.length > 0 && (
            <section>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <LinkIcon style={{ width: 18, height: 18, color: '#34d399' }} />
                External Assets
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {assets.map(asset => (
                  <div key={asset.id} style={{ ...s.card, display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: asset.type === 'file' ? 'rgba(59,130,246,0.1)' : 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {asset.type === 'file' ? <FileText style={{ color: '#60a5fa', width: 20, height: 20 }} /> : <LinkIcon style={{ color: '#34d399', width: 20, height: 20 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14, marginBottom: 2 }}>{asset.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(asset.created_at).toLocaleDateString()}</div>
                    </div>
                    <a 
                      href={asset.type === 'file' ? asset.file_url! : asset.external_url!} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', transition: 'all 0.2s', flexShrink: 0 }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(96,165,250,0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(96,165,250,0.1)'}
                    >
                      <ExternalLink style={{ width: 16, height: 16 }} />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {assets.length === 0 && files.length === 0 && (
            <div style={{ ...s.card, textAlign: 'center', padding: 64 }}>
              <Folder style={{ width: 64, height: 64, color: '#1e293b', margin: '0 auto 24px' }} />
              <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Shared Items</h3>
              <p style={{ color: '#64748b', fontSize: 14, maxWidth: 300, margin: '0 auto' }}>Your administrator hasn't shared any documents or assets with you yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

