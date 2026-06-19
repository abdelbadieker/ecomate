"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthCallbackUrl } from '@/lib/site-url';

export default function MerchantLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/overview');
    });
    // Surface OAuth errors bounced back from /auth/callback
    const e = search?.get('error');
    const d = search?.get('error_description');
    if (e || d) setError(d || e || '');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email, password
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.push('/overview');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl()
      }
    });
    if (oauthError) {
      setError(`Google sign-in failed: ${oauthError.message}`);
      setGoogleLoading(false);
    }
    // On success Supabase redirects the window; no further action here.
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--bg-body)' }}>
      <div className="noise"></div>
      <div className="max-w-md w-full p-8 rounded-2xl relative z-10" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-c)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent inline-block" style={{ backgroundImage: 'linear-gradient(135deg, var(--s), var(--g))' }}>
              EcoMate
            </h1>
          </Link>
          <p className="mt-2" style={{ color: 'var(--text-sub)' }}>Log in to your merchant dashboard</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleLogin}>
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-sub)' }}>Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-1 transition-all"
              style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-c)', color: 'var(--text-main)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-sub)' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-1 transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-c)', color: 'var(--text-main)' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded" style={{ accentColor: 'var(--s)' }} />
              <span className="ml-2 text-sm" style={{ color: 'var(--text-sub)' }}>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-medium hover:underline" style={{ color: 'var(--s)' }}>
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all shadow-md mt-6 flex justify-center items-center gap-2"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--s), #1d4ed8)', color: 'white', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-slate-700/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
               <span className="px-2" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>Or continue with</span>
            </div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={googleLoading}
            className="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-c)', color: 'var(--text-main)' }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting...' : ''}
            Google
          </button>
        </div>
        
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-sub)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--s)' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
