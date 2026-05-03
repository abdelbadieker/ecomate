'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Phone, Mail, MapPin, Users, Info, FileText, Link as LinkIcon, ExternalLink, Folder } from 'lucide-react';

type Customer = { id: string; name: string; email: string; phone: string; city: string; notes: string; total_orders: number; total_spent: number; created_at: string };
type CrmAsset = { id: string; type: 'file' | 'link'; title: string; file_url: string | null; external_url: string | null; created_at: string };

export default function CRMPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assets, setAssets] = useState<CrmAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'assets'>('customers');

  const fetch_ = async () => { 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const [custRes, assetsRes] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_assets').select('*').eq('client_id', user.id).order('created_at', { ascending: false })
    ]);
    
    setCustomers(custRes.data || []); 
    setAssets(assetsRes.data || []);
    setLoading(false); 
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetch_(); }, []);

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

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
          Shared Assets ({assets.length})
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(52,211,153,0.08))', borderColor: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
        <Info style={{ width: 18, height: 18, color: '#60a5fa', flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
          {activeTab === 'customers' ? 'Customer data is managed and imported by your EcoMate administrator. This data automatically syncs with your dashboard in real-time.' : 'These assets have been securely shared with you by your EcoMate administrator.'}
        </p>
      </div>

      {activeTab === 'customers' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', ...s.card, padding: '10px 16px', gap: 10 }}>
            <Search style={{ width: 16, height: 16, color: '#64748b' }} />
            <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: 0, background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: 13, outline: 'none' }} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ ...s.card, textAlign: 'center', padding: 48 }}>
              <Users style={{ width: 48, height: 48, color: '#334155', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>No customers found</p>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>Customer data will appear here once your admin imports it.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(c => (
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {assets.length === 0 ? (
            <div style={{ ...s.card, gridColumn: '1 / -1', textAlign: 'center', padding: 48 }}>
              <Folder style={{ width: 48, height: 48, color: '#334155', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>No shared assets yet</p>
            </div>
          ) : (
            assets.map(asset => (
              <div key={asset.id} style={{ ...s.card, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: asset.type === 'file' ? 'rgba(59,130,246,0.1)' : 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {asset.type === 'file' ? <FileText style={{ color: '#60a5fa', width: 20, height: 20 }} /> : <LinkIcon style={{ color: '#34d399', width: 20, height: 20 }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 4 }}>{asset.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textTransform: 'capitalize' }}>
                    {asset.type} • {new Date(asset.created_at).toLocaleDateString()}
                  </div>
                  <a 
                    href={asset.type === 'file' ? asset.file_url! : asset.external_url!} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: asset.type === 'file' ? '#60a5fa' : '#34d399', textDecoration: 'none', padding: '6px 12px', background: asset.type === 'file' ? 'rgba(59,130,246,0.1)' : 'rgba(52,211,153,0.1)', borderRadius: 6, transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = asset.type === 'file' ? 'rgba(59,130,246,0.2)' : 'rgba(52,211,153,0.2)'}
                    onMouseOut={e => e.currentTarget.style.background = asset.type === 'file' ? 'rgba(59,130,246,0.1)' : 'rgba(52,211,153,0.1)'}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    {asset.type === 'file' ? 'Download File' : 'Open Link'}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
