'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Paintbrush, Send, Clock, CheckCircle, Loader, Link as LinkIcon, Upload, Video, X, ExternalLink, Share2 } from 'lucide-react';
import { uploadFile } from '@/lib/storage-utils';

type Brief = { id: string; video_type: string; duration: string; description: string; reference_url: string; reference_description: string; status: string; admin_notes: string; delivery_url: string; created_at: string };
type PLink = { id: string; service: string; partner_name: string; url: string; description: string };

export default function CreativeStudioPage() {
  const supabase = createClient();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [partners, setPartners] = useState<PLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [form, setForm] = useState({
    video_type: 'Short (TikTok/Reels)',
    duration: '30s',
    description: '',
    reference_url: '',
    reference_description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [referenceMode, setReferenceMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitAbortRef = useRef<AbortController | null>(null);

  const fetchBriefs = useCallback(async () => {
    const res = await fetch('/api/briefs');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load creative briefs');
    setBriefs(json.data || []);
  }, []);

  const fetchPartners = useCallback(async () => {
    const { data } = await supabase.from('partner_links').select('*').order('created_at', { ascending: false });
    setPartners(data || []);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setUserEmail(data.session.user.email);
    });
    Promise.all([fetchBriefs(), fetchPartners()])
      .catch((err) => console.error('[creative-studio] load failed:', err))
      .finally(() => setLoading(false));
  }, [supabase.auth, fetchBriefs, fetchPartners]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      setReferencePreview(URL.createObjectURL(file));
    }
  };

  const uploadReferenceVideo = async (file: File, signal: AbortSignal): Promise<string | null> => {
    const { url, error } = await uploadFile(supabase, file, {
      bucket: 'creative-references',
      path: `references/${userEmail || 'unknown'}`,
      maxSizeMB: 100,
      signal,
    });

    if (error) {
      console.error('Core Transmission Error:', error);
      if (error !== 'Upload cancelled') alert(`Critical: ${error}.`);
      return null;
    }

    return url;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const controller = new AbortController();
    submitAbortRef.current = controller;

    try {
      let refUrl = form.reference_url;

      if (referenceMode === 'upload' && referenceFile) {
        const uploadedUrl = await uploadReferenceVideo(referenceFile, controller.signal);
        if (!uploadedUrl) {
          setSubmitting(false);
          return;
        }
        refUrl = uploadedUrl;
      }

      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          video_type: form.video_type,
          duration: form.duration,
          description: form.description,
          reference_url: refUrl,
          reference_description: form.reference_description,
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Submission failed');

      setShowForm(false);
      setForm({ video_type: 'Short (TikTok/Reels)', duration: '30s', description: '', reference_url: '', reference_description: '' });
      setReferenceFile(null);
      setReferencePreview(null);
      fetchBriefs().catch((err) => console.error('[creative-studio] refresh failed:', err));
    } catch (err: unknown) {
       const error = err as Error;
       if (error.name !== 'AbortError') alert(`Submission failed: ${error.message}`);
    } finally {
      submitAbortRef.current = null;
      setSubmitting(false);
    }
  };

  const cancelSubmission = () => {
    submitAbortRef.current?.abort();
  };

  const trackClick = async (partner: PLink) => {
    if (!userEmail) return;
    await supabase.from('partner_clicks').insert({
      service: partner.service,
      user_email: userEmail
    });
  };

  const statusIcon = (s: string) => {
    if (s === 'Completed') return <CheckCircle style={{ width: 16, height: 16, color: '#34d399' }} />;
    if (s === 'In Progress') return <Loader style={{ width: 16, height: 16, color: '#60a5fa' }} />;
    return <Clock style={{ width: 16, height: 16, color: '#fbbf24' }} />;
  };
  const statusColor = (s: string) => s === 'Completed' ? '#34d399' : s === 'In Progress' ? '#60a5fa' : '#fbbf24';

  const st = {
    card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 16, padding: 20 } as React.CSSProperties,
    input: { width: '100%', padding: '10px 14px', background: 'rgba(7,16,31,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 10, color: '#e2e8f0', fontSize: 13, outline: 'none' } as React.CSSProperties,
    btn: { padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div style={{ width: 32, height: 32, border: '3px solid #1e293b', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>Creative Studio</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Request custom video content from our creative team</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ ...st.btn, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff' }}>
          <Paintbrush style={{ width: 16, height: 16 }} /> New Creative Brief
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Info Card */}
          <div style={{ ...st.card, background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(59,130,246,0.08))', borderColor: 'rgba(167,139,250,0.2)' }}>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
              📹 Submit a creative brief and our team will produce professional video content for your brand. 
              You can request short-form (TikTok, Reels), marketing ads, or long-form content. 
            </p>
          </div>

          {/* Brief Form */}
          {showForm && (
            <div style={{ ...st.card, position: 'relative', border: '1px solid #7c3aed44' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Submit Creative Brief</h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Video Type</label>
                    <select value={form.video_type} onChange={e => setForm({ ...form, video_type: e.target.value })} style={{ ...st.input, cursor: 'pointer' }}>
                      <option>Short (TikTok/Reels)</option>
                      <option>Marketing Ad</option>
                      <option>Product Showcase</option>
                      <option>Long-form (YouTube)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Duration</label>
                    <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={{ ...st.input, cursor: 'pointer' }}>
                      <option>15s</option>
                      <option>30s</option>
                      <option>60s</option>
                      <option>2 minutes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Description / Brief *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...st.input, minHeight: 100, resize: 'vertical' }} placeholder="Describe what you want: style, message, target audience..." />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Reference Material
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button type="button" onClick={() => setReferenceMode('url')} style={{ ...st.btn, padding: '6px 14px', fontSize: 12, background: referenceMode === 'url' ? 'rgba(167,139,250,0.15)' : 'rgba(51,65,85,0.2)', color: referenceMode === 'url' ? '#a78bfa' : '#64748b' }}>
                      <LinkIcon style={{ width: 12, height: 12 }} /> URL Link
                    </button>
                    <button type="button" onClick={() => setReferenceMode('upload')} style={{ ...st.btn, padding: '6px 14px', fontSize: 12, background: referenceMode === 'upload' ? 'rgba(167,139,250,0.15)' : 'rgba(51,65,85,0.2)', color: referenceMode === 'upload' ? '#a78bfa' : '#64748b' }}>
                      <Upload style={{ width: 12, height: 12 }} /> Upload Video
                    </button>
                  </div>

                  {referenceMode === 'url' ? (
                     <div style={{ position: 'relative' }}>
                       <input value={form.reference_url} onChange={e => setForm({ ...form, reference_url: e.target.value })} style={{ ...st.input, paddingRight: 40 }} placeholder="Paste a link to a reference video (YouTube, TikTok...)" />
                       {form.reference_url && <button onClick={() => setForm({ ...form, reference_url: '' })} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><X size={14} /></button>}
                     </div>
                  ) : (
                    <div>
                      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                      {referenceFile ? (
                        <div style={{ border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12, padding: 12, background: 'rgba(167,139,250,0.05)', position: 'relative' }}>
                          <button onClick={() => { setReferenceFile(null); setReferencePreview(null); }} style={{ position: 'absolute', top: -10, right: -10, width: 24, height: 24, background: '#ef4444', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', zIndex: 10 }}><X size={14} /></button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Video style={{ width: 20, height: 20, color: '#a78bfa' }} />
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{referenceFile.name} ({(referenceFile.size / (1024 * 1024)).toFixed(1)} MB)</div>
                          </div>
                          {referencePreview && <video src={referencePreview} controls style={{ width: '100%', maxHeight: 150, borderRadius: 8, marginTop: 10 }} />}
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(51,65,85,0.5)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer' }}>
                          <Upload style={{ width: 24, height: 24, color: '#475569', marginBottom: 8 }} />
                          <p style={{ fontSize: 12, color: '#64748b' }}>Click to upload reference video (Max 100MB)</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={handleSubmit} disabled={submitting || !form.description.trim()} style={{ ...st.btn, flex: 1, background: submitting || !form.description.trim() ? '#1e293b' : 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff' }}>
                  <Send style={{ width: 14, height: 14 }} />{submitting ? 'Sending...' : 'Confirm Request'}
                </button>
                {submitting && (
                  <button onClick={cancelSubmission} style={{ ...st.btn, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <X style={{ width: 14, height: 14 }} /> Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Delivered Assets Quick Access */}
          {briefs.some(b => b.status === 'Completed') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} /> Delivered Assets
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {briefs.filter(b => b.status === 'Completed').map(b => (
                  <div key={`delivered-${b.id}`} style={{ ...st.card, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.05)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>{b.video_type}</div>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{b.description}</p>
                    <a 
                      href={b.delivery_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ ...st.btn, width: '100%', justifyContent: 'center', background: '#34d399', color: '#fff', boxShadow: '0 4px 12px rgba(52,211,153,0.2)' }}
                    >
                      <Video size={14} /> Open Cloud Drive / Video
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Briefs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Production Pipeline</h2>
            {briefs.length === 0 ? (
              <div style={{ ...st.card, textAlign: 'center', padding: 100, borderStyle: 'dashed' }}>
                <p style={{ color: '#64748b', fontSize: 13 }}>No production history found.</p>
              </div>
            ) : briefs.filter(b => b.status !== 'Completed').map(b => (
              <div key={b.id} style={{ ...st.card, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {statusIcon(b.status)}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{b.video_type} — {b.duration}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: `${statusColor(b.status)}15`, color: statusColor(b.status), fontSize: 10, fontWeight: 800 }}>{b.status}</span>
                </div>
                {b.admin_notes && <div style={{ fontSize: 12, color: '#94a3b8', padding: 12, background: 'rgba(96,165,250,0.05)', borderRadius: 10, borderLeft: '3px solid #60a5fa' }}>{b.admin_notes}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Partners Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Share2 size={18} className="text-blue-400" />
             Expert Partners
           </h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {partners.map(p => (
               <div key={p.id} style={{ ...st.card, padding: 16, background: 'rgba(59,130,246,0.05)' }}>
                 <div style={{ fontSize: 10, fontWeight: '900', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{p.service.replace('-', ' ')}</div>
                 <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{p.partner_name}</h4>
                 <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>{p.description}</p>
                 <a 
                   href={p.url} 
                   target="_blank" 
                   rel="noreferrer" 
                   onClick={() => trackClick(p)}
                   style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                 >
                   Connect to Partner <ExternalLink size={12} />
                 </a>
               </div>
             ))}
             {partners.length === 0 && (
               <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', fontStyle: 'italic' }}>No partners listed yet.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
