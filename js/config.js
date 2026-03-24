// ═══════════════════════════════════════════════════════════
// ECOMATE — Supabase Config & Shared Utilities
// ═══════════════════════════════════════════════════════════
// SETUP: Replace these values from your Supabase Dashboard
//        Settings → API → Project URL & anon/public key

const SUPABASE_URL  = 'https://dkoxruaonaedhqixgbud.supabase.co';
const SUPABASE_KEY  = 'YOUR_SUPABASE_ANON_KEY'; // Dashboard → Settings → API

const PLAN_FEATURES = {
  none:     [],
  starter:  ['chatbot','orders','catalog'],
  growth:   ['chatbot','orders','catalog','crm','growth_agent','analytics','delivery'],
  business: ['chatbot','orders','catalog','crm','growth_agent','analytics','delivery','priority']
};

const PLAN_PRICES = { starter: 0, growth: 4900, business: null };

// Initialise Supabase client (supabase-js v2 must be loaded before this file)
let sb;
try {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
} catch(e) {
  console.error('Supabase init failed — check config.js credentials', e);
}

// ── Auth Helpers ────────────────────────────────────────────
async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getProfile(userId) {
  const { data } = await sb.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function requireAuth(redirectTo = 'auth.html') {
  const user = await getUser();
  if (!user) { window.location.href = redirectTo; return null; }
  return user;
}

async function requireAdmin(redirectTo = '../auth.html') {
  const user = await getUser();
  if (!user) { window.location.href = redirectTo; return null; }
  const { data } = await sb.from('admin_users').select('*').eq('user_id', user.id).single();
  if (!data) { window.location.href = redirectTo; return null; }
  return { user, admin: data };
}

function hasFeature(plan, feature) {
  return (PLAN_FEATURES[plan] || []).includes(feature);
}

function signOut(redirectTo = 'index.html') {
  sb.auth.signOut().then(() => window.location.href = redirectTo);
}

// ── UI Helpers ──────────────────────────────────────────────
function toast(msg, type = 'info', duration = 3500) {
  const t = document.createElement('div');
  const colors = { info: '#2563EB', success: '#10B981', error: '#EF4444', warn: '#F59E0B' };
  t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;
    padding:14px 22px;border-radius:12px;font-family:'Inter',sans-serif;
    font-size:14px;font-weight:500;color:#fff;max-width:340px;
    background:${colors[type]||colors.info};
    box-shadow:0 8px 32px rgba(0,0,0,.25);
    animation:slideIn .3s ease;pointer-events:none;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, duration);
}

const css_toast = `@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`;
const styleEl = document.createElement('style');
styleEl.textContent = css_toast;
document.head.appendChild(styleEl);
