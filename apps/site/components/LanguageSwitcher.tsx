'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * EN | ع language toggle. Persists choice in the `lang` cookie, flips the
 * document direction immediately (snappy), then refreshes server components
 * so all server-rendered copy re-renders in the chosen locale.
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)lang=(ar|en)/);
    setLang(m ? (m[1] as 'en' | 'ar') : 'en');
  }, []);

  const switchTo = (l: 'en' | 'ar') => {
    if (l === lang) return;
    document.cookie = `lang=${l};path=/;max-age=31536000`;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    setLang(l);
    router.refresh();
  };

  const base: React.CSSProperties = {
    padding: '5px 11px', fontSize: 12, fontWeight: 800, borderRadius: 8, border: 'none',
    cursor: 'pointer', background: 'transparent', color: 'var(--text-sub)', lineHeight: 1, transition: 'all .2s',
  };
  const active: React.CSSProperties = { background: 'var(--s)', color: '#fff' };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'var(--bg-card)', border: '1px solid var(--border-c)', borderRadius: 10, padding: 2 }}>
      <button onClick={() => switchTo('en')} style={{ ...base, ...(lang === 'en' ? active : {}) }} aria-label="English">EN</button>
      <button onClick={() => switchTo('ar')} style={{ ...base, ...(lang === 'ar' ? active : {}), fontSize: 15 }} aria-label="العربية">ع</button>
    </div>
  );
}
