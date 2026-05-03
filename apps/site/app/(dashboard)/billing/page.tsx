'use client';
import { CreditCard, Check, Zap, Crown, Loader2, Mail, Phone, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const plans = [
  { name: 'Starter', price: 'DA 2,900', period: '/month', features: ['Up to 100 orders/mo', 'Basic CRM', 'Email support', '1 user'], icon: Zap, color: '#94a3b8' },
  { name: 'Growth', price: 'DA 7,900', period: '/month', features: ['Unlimited orders', 'Full CRM + Analytics', 'AI Chatbot', 'Priority support', '5 users'], icon: CreditCard, color: '#60a5fa' },
  { name: 'Enterprise', price: 'DA 19,900', period: '/month', features: ['Everything in Growth', 'Custom integrations', 'Dedicated account manager', 'White-label options', 'Unlimited users'], icon: Crown, color: '#fbbf24' },
];

// Fallback WhatsApp business number
const ECOMATE_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '213XXXXXXXXX';

export default function BillingPage() {
  const supabase = createClient();
  const [currentPlan, setCurrentPlan] = useState('Starter');
  const [subEndDate, setSubEndDate] = useState<string | null>(null);
  const [billingSetting, setBillingSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();
          if (profile?.plan) setCurrentPlan(profile.plan);
          
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('end_date')
            .eq('merchant_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (sub?.end_date) setSubEndDate(sub.end_date);
        }

        // Fetch dynamic billing settings
        const res = await fetch('/api/billing-settings');
        const json = await res.json();
        if (json.data) setBillingSetting(json.data);
      } catch (err) {
        console.error('Failed to init billing:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [supabase]);

  const s = { 
    card: { background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 24, padding: 32, backdropFilter: 'blur(10px)' } as React.CSSProperties,
    badge: { padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 } as React.CSSProperties
  };

  const handleUpgrade = (planName: string) => {
    const message = encodeURIComponent(`Hi EcoMate Team! I'd like to update my account to the ${planName} plan. My current plan is ${currentPlan}.`);
    
    if (billingSetting?.custom_url) {
      window.open(billingSetting.custom_url, '_blank');
      return;
    }

    if (billingSetting?.platform) {
      const val = billingSetting.contact_value;
      switch (billingSetting.platform) {
        case 'whatsapp':
          window.open(`https://wa.me/${val.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
          break;
        case 'telegram':
          window.open(`https://t.me/${val.replace('@', '')}`, '_blank');
          break;
        case 'facebook':
        case 'instagram':
          window.open(val.startsWith('http') ? val : `https://${billingSetting.platform}.com/${val}`, '_blank');
          break;
        default:
          window.open(`https://wa.me/${ECOMATE_WHATSAPP}?text=${message}`, '_blank');
      }
    } else {
      window.open(`https://wa.me/${ECOMATE_WHATSAPP}?text=${message}`, '_blank');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 120 }}><Loader2 style={{ width: 40, height: 40, color: '#3b82f6', animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Billing & Expansion</h1>
          <p style={{ fontSize: 15, color: '#94a3b8', marginTop: 4 }}>Scale your business with Ecomate's premium power.</p>
        </div>
        <div style={{ ...s.card, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
           <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>System Active</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Current Plan Card */}
          <div style={{ ...s.card, background: 'linear-gradient(135deg, rgba(10,22,40,0.8), rgba(15,23,42,0.4))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Operational Level</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{currentPlan}</div>
                <div style={{ fontSize: 15, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {subEndDate ? (
                    <>Access valid until <span style={{ color: '#10b981', fontWeight: 800 }}>{new Date(subEndDate).toLocaleDateString()}</span></>
                  ) : (
                    <span style={{ color: '#f59e0b' }}>Awaiting initial activation</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: '#10b981' }}>{plans.find(p => p.name === currentPlan)?.price.split(' ')[1] || '--'} <span style={{ fontSize: 14, color: '#64748b' }}>DA</span></div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>per billing cycle</div>
              </div>
            </div>
          </div>

          {/* Plan Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {plans.map(plan => {
              const Icon = plan.icon;
              const isCurrent = plan.name === currentPlan;
              return (
                <div key={plan.name} style={{ ...s.card, padding: 24, border: isCurrent ? '2px solid #3b82f6' : '1px solid rgba(51,65,85,0.5)', background: isCurrent ? 'rgba(59,130,246,0.05)' : 'rgba(10,22,40,0.4)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon style={{ width: 20, height: 20, color: plan.color }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{plan.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: plan.color, marginTop: 4 }}>{plan.price}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                    {plan.features.slice(0, 4).map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                        <Check style={{ width: 14, height: 14, color: '#10b981' }} /> {f}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => !isCurrent && handleUpgrade(plan.name)}
                    disabled={isCurrent}
                    style={{ 
                      width: '100%', 
                      marginTop: 24, 
                      padding: '12px 0', 
                      borderRadius: 12, 
                      border: 'none', 
                      background: isCurrent ? '#1e293b' : `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`, 
                      color: isCurrent ? '#64748b' : '#fff', 
                      fontWeight: 800, 
                      fontSize: 13, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}>
                    {isCurrent ? 'Current' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Support Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...s.card, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap style={{ width: 16, height: 16, color: '#3b82f6' }} /> Billing Support
            </h3>
            
            {billingSetting?.notes && (
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
                {billingSetting.notes}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {billingSetting?.support_email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail style={{ width: 14, height: 14, color: '#3b82f6' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{billingSetting.support_email}</div>
                  </div>
                </div>
              )}

              {billingSetting?.support_phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone style={{ width: 14, height: 14, color: '#3b82f6' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{billingSetting.support_phone}</div>
                  </div>
                </div>
              )}

              {billingSetting?.support_whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare style={{ width: 14, height: 14, color: '#10b981' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>WhatsApp</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{billingSetting.support_whatsapp}</div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleUpgrade(currentPlan)}
              style={{ 
                width: '100%', 
                marginTop: 24, 
                padding: '14px 0', 
                borderRadius: 12, 
                background: '#fff', 
                color: '#0f172a', 
                fontWeight: 900, 
                fontSize: 12, 
                textTransform: 'uppercase', 
                letterSpacing: 1,
                cursor: 'pointer'
              }}>
              Contact Billing Dept
            </button>
          </div>

          <div style={{ ...s.card, padding: 24, background: 'transparent', border: '1px dashed rgba(51,65,85,0.5)' }}>
            <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
              By upgrading, you agree to our terms of service. Billing cycles are processed monthly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

