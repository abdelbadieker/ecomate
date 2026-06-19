"use client";

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getPasswordResetUrl } from '@/lib/site-url';

export default function ForgotPassword() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetUrl(),
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: 'var(--bg-body)' }}>
        <div className="noise"></div>
        <div className="max-w-md w-full p-8 rounded-2xl relative z-10 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-c)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
           <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-blue-500">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
           <p style={{ color: 'var(--text-sub)' }}>We sent a password reset link to <strong>{email}</strong>. Click the link to securely choose a new password.</p>
           <button onClick={() => setSuccess(false)} className="mt-8 px-6 py-2 rounded-lg font-medium transition-colors hover:bg-slate-800" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-c)', color: 'var(--text-main)' }}>
              Back
           </button>
        </div>
      </div>
    );
  }

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
          <p className="mt-2" style={{ color: 'var(--text-sub)' }}>Reset your password</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleResetRequest}>
          {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-sub)' }}>Email address</label>
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all shadow-md mt-6 flex justify-center items-center gap-2"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--s), #1d4ed8)', color: 'white', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-sub)' }}>
          Remember your password?{' '}
          <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--s)' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
