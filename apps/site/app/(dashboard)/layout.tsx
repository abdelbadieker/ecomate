'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, ShoppingBag, Package, Users, MapPin,
  Mail, Sparkles, Paintbrush, Globe, Store,
  PieChart, CreditCard, HelpCircle, Search, Bell, LogOut,
  ChevronRight, ChevronDown, Menu, X, User, MessageSquare, Lock
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/overview', icon: LayoutDashboard, feature: 'overview' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, feature: 'orders' },
  { name: 'Products', href: '/products', icon: Package, feature: 'products' },
  { name: 'CRM', href: '/crm', icon: Users, feature: 'crm' },
  { name: 'Ecotrack', href: '/ecotrack', icon: MapPin, feature: 'ecotrack' },
  { name: 'Fulfillment', href: '/fulfillment', icon: Mail, feature: 'fulfillment' },
  { name: 'AI Chatbot', href: '/ai-chatbot', icon: Sparkles, feature: 'chatbot' },
  { name: 'Creative Studio', href: '/creative-studio', icon: Paintbrush, feature: 'creative' },
  { name: 'Web Creation', href: '/web-creation', icon: Globe, feature: 'web' },
  { name: 'E-Store', href: '/estore', icon: Store, feature: 'estore' },
  { name: 'Analytics', href: '/analytics', icon: PieChart, feature: 'analytics' },
  { name: 'Billing', href: '/billing', icon: CreditCard, feature: 'billing' },
  { name: 'Messages', href: '/messages', icon: MessageSquare, feature: 'messages' },
  { name: 'Support', href: '/support', icon: HelpCircle, feature: 'support' },
];

type Notif = { id: string; title: string; desc: string; time: string };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function LockedModuleNotice({ moduleName }: { moduleName: string }) {
  return (
    <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, textAlign: 'center', padding: 32, border: '1px solid rgba(248,113,113,0.22)', borderRadius: 24, background: 'rgba(127,29,29,0.12)' }}>
        <div style={{ width: 56, height: 56, margin: '0 auto 18px', borderRadius: 18, background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
          <Lock style={{ width: 26, height: 26 }} />
        </div>
        <h2 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{moduleName} is locked</h2>
        <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
          This module is currently disabled for your account.
        </p>
      </div>
    </div>
  );
}

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [navOpen, setNavOpen] = useState(true);
  const [userPlan, setUserPlan] = useState('Free');
  const [lockedSections, setLockedSections] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Fetch user and redirect to login if not authenticated
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }
      if (data.user) {
        // maybeSingle() so a missing profile row (e.g. brand-new Google signup
        // whose trigger race hasn't landed yet) does NOT error out or lock
        // the whole dashboard. Fall back to "all unlocked" in that case and
        // let the realtime/visibility refetches catch up once the row exists.
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, is_banned, features, plan, locked_sections')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.plan) setUserPlan(profile.plan);
        // Explicitly default to [] when profile is missing so sections render.
        setLockedSections(Array.isArray(profile?.locked_sections) ? profile!.locked_sections : []);

        if (profile?.is_banned) {
          alert('Your account has been restricted by the administrator.');
          await supabase.auth.signOut();
          window.location.href = '/';
          return;
        }

        const meta = data.user.user_metadata;
        const name = profile?.full_name || meta?.full_name || meta?.name || data.user.email?.split('@')[0] || 'User';
        setUserName(name);
        setUserEmail(data.user.email || '');

        // If the profile row wasn't there, backfill it client-side so the
        // admin panel sees the merchant and realtime channel has a row to
        // broadcast UPDATEs for. Uses upsert so it's safe under the
        // handle_new_user trigger race.
        if (!profile) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            avatar_url: meta?.avatar_url || meta?.picture || null,
            plan: 'Starter',
            features: { crm: true, orders: true, support: true, chatbot: false, analytics: false },
            locked_sections: [],
          }, { onConflict: 'id' });
        }

        // NEW: Realtime Subscription for live updates
        const channel = supabase
          .channel(`profile-updates-${data.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${data.user.id}`
            },
            (payload) => {
              interface ProfileUpdate {
                locked_sections?: string[];
                plan?: string;
                full_name?: string;
                is_banned?: boolean;
              }
              const updatedProfile = payload.new as ProfileUpdate;
              if ('locked_sections' in updatedProfile) setLockedSections(updatedProfile.locked_sections ?? []);
              if (updatedProfile.plan) setUserPlan(updatedProfile.plan);
              if (updatedProfile.full_name) setUserName(updatedProfile.full_name);
              
              // If banned, logout immediately
              if (updatedProfile.is_banned) {
                supabase.auth.signOut().then(() => {
                  window.location.href = '/';
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });

    // Refetch profile when tab regains focus — fallback if realtime is not enabled
    const refetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, is_banned, features, plan, locked_sections')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (!profile) return;
      setLockedSections(Array.isArray(profile.locked_sections) ? profile.locked_sections : []);
      if (profile.plan) setUserPlan(profile.plan);
      if (profile.full_name) setUserName(profile.full_name);
      if (profile.is_banned) {
        await supabase.auth.signOut();
        window.location.href = '/';
      }
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') refetchProfile(); };
    document.addEventListener('visibilitychange', onVisibility);

    // Fetch notifications
    const fetchNotifs = async () => {
      const items: Notif[] = [];
      const { data: orders } = await supabase.from('orders').select('id, customer_name, tracking_code, total, created_at').order('created_at', { ascending: false }).limit(3);
      if (orders) orders.forEach(o => items.push({ id: 'order-' + o.id, title: 'Order from ' + o.customer_name, desc: `${o.tracking_code} — DA ${o.total?.toLocaleString()}`, time: timeAgo(o.created_at) }));
      const { data: lowStock } = await supabase.from('products').select('id, name, stock').lt('stock', 20).order('stock', { ascending: true }).limit(2);
      if (lowStock) lowStock.forEach(p => items.push({ id: 'stock-' + p.id, title: 'Low stock alert', desc: `${p.name} — ${p.stock} units left`, time: 'Now' }));
      const { data: tickets } = await supabase.from('support_tickets').select('id, subject, created_at').eq('status', 'Open').order('created_at', { ascending: false }).limit(2);
      if (tickets) tickets.forEach(t => items.push({ id: 'ticket-' + t.id, title: 'Open ticket', desc: t.subject, time: timeAgo(t.created_at) }));
      setNotifications(items);
    };
    fetchNotifs();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadPermissions = async () => {
      try {
        const res = await fetch('/api/permissions', { cache: 'no-store' });
        const json = await res.json();
        if (mounted && res.ok && Array.isArray(json.lockedModules)) {
          setLockedSections(json.lockedModules);
        }
      } catch (error) {
        console.error('[permissions] Failed to refresh permissions:', error);
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !mounted) return;
      loadPermissions();
      channel = supabase
        .channel(`client-permissions-${data.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'client_permissions',
            filter: `client_id=eq.${data.user.id}`,
          },
          loadPermissions,
        )
        .subscribe();
    });

    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadPermissions();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const currentItem = navItems.find((item) => item.href === pathname);
  const lockedSet = new Set(lockedSections);
  const currentModuleLocked = currentItem ? lockedSet.has(currentItem.feature) : false;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07101F', overflow: 'hidden', color: '#cbd5e1', position: 'relative' }}>
      
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} 
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260,
        flexShrink: 0,
        background: '#0b1a30',
        borderRight: '1px solid rgba(51,65,85,0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        position: mobileOpen ? 'fixed' as const : 'relative' as const,
        top: 0,
        left: mobileOpen ? 0 : undefined,
        bottom: 0,
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{ height: 72, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid rgba(51,65,85,0.4)', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #34d399, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>E</span>
          </div>
          <Link href="/" style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #34d399, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            EcoMate
          </Link>
        </div>

        {/* User Profile + Nav + Logout — all scroll together */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* User Section Header */}
          <button
            onClick={() => setNavOpen(!navOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(52,211,153,0.06)',
              border: '1px solid rgba(52,211,153,0.12)',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              marginBottom: 8,
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              border: '2px solid rgba(52,211,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <User style={{ width: 18, height: 18, color: '#34d399' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName || 'Loading...'}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </div>
              <div style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0, marginTop: 2 }}>
                {userPlan}
              </div>
            </div>
            <ChevronDown style={{
              width: 16, height: 16, color: '#64748b', flexShrink: 0,
              transform: navOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }} />
          </button>

          {/* Nav Items */}
            {navOpen && navItems.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = lockedSet.has(item.feature);
              const Icon = item.icon;

              if (isLocked) {
                return (
                  <div
                    key={item.name}
                    aria-disabled="true"
                    title={`${item.name} is locked`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '9px 14px',
                      paddingLeft: 24,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      background: isActive ? 'rgba(239,68,68,0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(239,68,68,0.16)' : '1px solid transparent',
                      opacity: 0.72,
                      cursor: 'not-allowed',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color: '#475569' }} />
                    <span>{item.name}</span>
                    <Lock style={{ width: 13, height: 13, marginLeft: 'auto', color: '#64748b' }} />
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 14px',
                    paddingLeft: 24,
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#34d399' : '#94a3b8',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(59,130,246,0.15)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    opacity: 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <Icon style={{ width: 16, height: 16, color: isActive ? '#34d399' : '#64748b' }} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto', opacity: 0.5 }} />}
                </Link>
              );
            })}

          {/* Logout — directly after nav items */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(51,65,85,0.4)' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 14px', borderRadius: 10, border: 'none',
                background: 'rgba(239,68,68,0.06)',
                color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Topbar */}
        <header style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: '#0a1628', borderBottom: '1px solid rgba(51,65,85,0.35)', position: 'sticky', top: 0, zIndex: 30 }}>
          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#94a3b8', padding: 4 }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(7,16,31,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 999, padding: '9px 16px', width: 340, maxWidth: '50vw' }}>
            <Search style={{ width: 16, height: 16, color: '#64748b', flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Search orders, products, customers..." 
              style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: 10, fontSize: 13, color: '#e2e8f0', width: '100%' }} 
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotif(!showNotif)}
                style={{ position: 'relative', color: '#94a3b8', background: showNotif ? 'rgba(51,65,85,0.4)' : 'none', border: 'none', padding: 8, borderRadius: 999, transition: 'all 0.2s', cursor: 'pointer' }}
              >
                <Bell style={{ width: 20, height: 20 }} />
                {notifications.length > 0 && <span style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.7)' }} />}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 340,
                  background: '#0b1a30',
                  border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 16,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  zIndex: 100,
                  animation: 'fadeInDown 0.2s ease',
                }}>
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(51,65,85,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Notifications</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '28px 18px', textAlign: 'center', color: '#475569', fontSize: 13 }}>No new notifications</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51,65,85,0.2)', display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(59,130,246,0.04)', transition: 'background 0.2s' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.desc}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ width: 1, height: 24, background: '#1e293b' }} />

            {/* User info in topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{userName?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{userName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {currentModuleLocked && currentItem ? (
              <LockedModuleNotice moduleName={currentItem.name} />
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
