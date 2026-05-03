'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Play, Sparkles, Video, MessageSquarePlus, Clock, CheckCircle2 } from 'lucide-react';

type Demo = { id: string; video_url: string; title: string; description: string };
type RequestStatus = { id: string; status: 'pending' | 'scheduled' | 'completed'; notes: string | null };

export default function AIChatbotPage() {
  const supabase = createClient();
  const [demo, setDemo] = useState<Demo | null>(null);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const [demoRes, reqRes] = await Promise.all([
      supabase.from('chatbot_demo').select('*').order('created_at', { ascending: false }).limit(1),
      user ? supabase.from('chatbot_requests').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(1) : { data: null }
    ]);
    
    setDemo(demoRes.data?.[0] || null);
    setRequestStatus(reqRes.data?.[0] || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleRequestSetup = async () => {
    try {
      setSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('chatbot_requests').insert({
        client_id: user.id,
        notes: notes.trim() || null,
        status: 'pending'
      });

      if (error) throw error;
      await fetchData();
      setShowRequestForm(false);
    } catch (err: any) {
      alert('Error requesting setup: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 16, padding: 24 } as React.CSSProperties,
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div style={{ width: 32, height: 32, border: '3px solid #1e293b', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>AI Sales Chatbot</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>See how your automated sales chatbot works across your channels</p>
        </div>
        
        {!requestStatus ? (
          <button 
            onClick={() => setShowRequestForm(!showRequestForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #34d399, #059669)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}
          >
            <MessageSquarePlus style={{ width: 18, height: 18 }} />
            Request Setup
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(51,65,85,0.8)', padding: '10px 16px', borderRadius: 8 }}>
            {requestStatus.status === 'pending' && <Clock style={{ width: 16, height: 16, color: '#fbbf24' }} />}
            {requestStatus.status === 'scheduled' && <Clock style={{ width: 16, height: 16, color: '#60a5fa' }} />}
            {requestStatus.status === 'completed' && <CheckCircle2 style={{ width: 16, height: 16, color: '#34d399' }} />}
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>Setup Status</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: requestStatus.status === 'pending' ? '#fbbf24' : requestStatus.status === 'scheduled' ? '#60a5fa' : '#34d399', textTransform: 'capitalize' }}>
                {requestStatus.status}
              </div>
            </div>
          </div>
        )}
      </div>

      {showRequestForm && !requestStatus && (
        <div style={{ ...s.card, background: 'linear-gradient(135deg, rgba(52,211,153,0.05), rgba(10,22,40,0.8))', borderColor: 'rgba(52,211,153,0.3)', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Request AI Chatbot Setup</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
            Our team will configure your custom AI chatbot and integrate it with your social channels. Let us know if you have any specific requirements.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Additional Notes (Optional)</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Focus on answering delivery questions..."
                style={{ width: '100%', minHeight: 80, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: 8, padding: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowRequestForm(false)}
                disabled={submitting}
                style={{ background: 'transparent', border: '1px solid rgba(51,65,85,0.8)', color: '#cbd5e1', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRequestSetup}
                disabled={submitting}
                style={{ background: '#34d399', color: '#022c22', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(59,130,246,0.08))', borderColor: 'rgba(52,211,153,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ padding: 10, borderRadius: 12, background: 'rgba(52,211,153,0.1)' }}>
            <Sparkles style={{ width: 22, height: 22, color: '#34d399' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Your AI Sales Chatbot</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Automated across Facebook Messenger, Instagram, Telegram, TikTok & more</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
          Our team sets up a custom AI-powered sales chatbot for your business. Once configured, the bot handles customer conversations, 
          answers questions, and closes sales 24/7 across all your social channels. Below is a demo showing how real customer conversations 
          look after setup.
        </p>
      </div>

      {/* Demo Video */}
      {demo ? (
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Play style={{ width: 20, height: 20, color: '#60a5fa' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{demo.title}</h2>
          </div>
          {demo.description && (
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>{demo.description}</p>
          )}
          <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' }}>
            <video
              src={demo.video_url}
              controls
              style={{ width: '100%', maxHeight: 500, display: 'block' }}
              poster=""
            />
          </div>
        </div>
      ) : (
        <div style={{ ...s.card, textAlign: 'center', padding: 60 }}>
          <Video style={{ width: 48, height: 48, color: '#334155', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Demo Video Coming Soon</h3>
          <p style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
            Our team is preparing your chatbot showcase video. Once ready, you&apos;ll see a real demo of how customer conversations look after setup.
          </p>
        </div>
      )}

      {/* Channels Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {['Facebook Messenger', 'Instagram DM', 'Telegram', 'TikTok', 'WhatsApp'].map(ch => (
          <div key={ch} style={{ ...s.card, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{ch}</div>
            <div style={{ fontSize: 11, color: '#34d399', marginTop: 4, fontWeight: 600 }}>✓ Supported</div>
          </div>
        ))}
      </div>
    </div>
  );
}
