// ═══════════════════════════════════════════════════════════
// EcoMate — Supabase Shared Configuration
// ⚠️  Replace SUPABASE_URL and SUPABASE_ANON_KEY with yours
//     from: https://app.supabase.com → Project Settings → API
// ═══════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://dkoxruaonaedhqixgbud.supabase.co';
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';  // ⚠️ replace this

// Admin credentials (set is_admin=true in Supabase after signup)
const ADMIN_EMAIL   = 'abdelbadie.kertimi1212@gmail.com';

// Secret admin path (keep this private)
const ADMIN_PATH    = 'em-admin-x9k7.html';

// ── Supabase client ──────────────────────────────────────────
let _sb = null;
function getSB() {
  if (!_sb) {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return _sb;
}

// ── Auth helpers ──────────────────────────────────────────────
async function getSession() {
  const { data: { session } } = await getSB().auth.getSession();
  return session;
}
async function getUser() {
  const s = await getSession();
  return s?.user ?? null;
}
async function getProfile(uid) {
  const { data } = await getSB().from('profiles').select('*').eq('id', uid).single();
  return data;
}
async function requireAuth(redirect = 'auth.html') {
  const u = await getUser();
  if (!u) { window.location.href = redirect; return null; }
  return u;
}
async function requireAdmin(redirect = 'auth.html') {
  const u = await getUser();
  if (!u) { window.location.href = redirect; return null; }
  const p = await getProfile(u.id);
  if (!p?.is_admin) { window.location.href = redirect; return null; }
  return { user: u, profile: p };
}
async function signOut() {
  await getSB().auth.signOut();
  window.location.href = 'index.html';
}

// ── Subscription helpers ──────────────────────────────────────
async function getSubscription(uid) {
  const { data } = await getSB()
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', uid)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}
async function hasFeature(uid, feature) {
  const sub = await getSubscription(uid);
  if (!sub) return false;
  const features = sub.plans?.features || [];
  return features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}
async function getPlanSlug(uid) {
  const sub = await getSubscription(uid);
  return sub?.plans?.slug || null;
}

// ── UI helpers ────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let toast = document.getElementById('em-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'em-toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;right:28px;z-index:99999;
      padding:13px 22px;border-radius:11px;
      font-family:'Inter',sans-serif;font-size:13.5px;font-weight:500;
      box-shadow:0 8px 32px rgba(0,0,0,.25);
      transition:all .35s cubic-bezier(.34,1.56,.64,1);
      transform:translateY(80px);opacity:0;pointer-events:none;
      display:flex;align-items:center;gap:9px;max-width:340px;
    `;
    document.body.appendChild(toast);
  }
  const colors = {
    success: 'background:#0a1628;border:1px solid rgba(16,185,129,.3);color:#10b981',
    error:   'background:#0a1628;border:1px solid rgba(239,68,68,.3);color:#fca5a5',
    info:    'background:#0a1628;border:1px solid rgba(37,99,235,.3);color:#93c5fd',
  };
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  toast.setAttribute('style', toast.style.cssText + ';' + colors[type]);
  toast.innerHTML = `${icons[type]} ${msg}`;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
  }, 3800);
}

function setLoading(btn, loading) {
  if (loading) {
    btn._origText = btn.innerHTML;
    btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span>';
    btn.disabled = true;
    btn.style.opacity = '.75';
  } else {
    btn.innerHTML = btn._origText || btn.innerHTML;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function formatDA(n) {
  return Number(n || 0).toLocaleString('fr-DZ') + ' DA';
}
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}
