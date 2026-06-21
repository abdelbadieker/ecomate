import { createClient } from '@supabase/supabase-js';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { dictionaries } from '@/lib/i18n';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function ServicesSection() {
  const tt = dictionaries[cookies().get('lang')?.value === 'ar' ? 'ar' : 'en'].services;
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (!services || services.length === 0) {
    return null; // Don't render anything if there are no active services
  }

  // The first service can be highlighted (col-span-2) if desired, but let's just make it a clean grid
  // We'll mimic the Bento box style
  return (
    <section id="features" className="py-32 px-5 relative bg-[var(--bg-section)] rounded-b-[40px]">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[var(--s)] font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-2">
          <span className="w-4 h-[2px] bg-[var(--s)]"></span>
          {tt.tag}
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight font-poppins">
          {tt.title1} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-200">{tt.titleHi}</span><br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-300">{tt.title2}</span>
        </h2>
        <p className="text-[var(--text-sub)] text-lg max-w-2xl mx-auto leading-relaxed">
          {tt.sub}
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => {
          // Make the first item span 2 columns to mimic the original Bento design if there are enough items
          const isFeatured = index === 0 && services.length > 3;
          const isFullWidth = index === services.length - 1 && services.length % 2 === 0;

          const renderIcon = () => {
            if (service.icon_type === 'image' && service.icon_value) {
              return <img src={service.icon_value} alt={service.title} className="w-full h-full object-cover" />;
            }
            if (service.icon_type === 'emoji') {
              return <span className="text-3xl leading-none flex items-center justify-center">{service.icon_value}</span>;
            }
            if (service.icon_type === 'icon') {
              const Icon = service.icon_value && (LucideIcons as any)[service.icon_value] 
                ? (LucideIcons as any)[service.icon_value] 
                : LucideIcons.CheckCircle2;
              return <Icon className={`w-7 h-7 ${index % 2 === 0 ? 'text-[var(--s)]' : 'text-[var(--g)]'} ${isFullWidth ? 'w-8 h-8' : ''}`} />;
            }
            return null;
          };

          return (
            <div 
              key={service.id} 
              className={`relative group bg-[var(--bg-card)] border border-[var(--border-c)] rounded-3xl p-8 hover:border-[var(--s)]/30 transition-all duration-300 overflow-hidden shadow-xl ${isFeatured ? 'md:col-span-2' : ''} ${isFullWidth ? 'md:col-span-3 flex flex-col md:flex-row items-center gap-8' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--s)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={`w-14 h-14 bg-[var(--s)]/10 border border-[var(--s)]/20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative z-10 ${isFullWidth ? 'w-16 h-16 shrink-0' : ''}`}>
                {renderIcon()}
              </div>
              
              <div className={isFullWidth ? 'flex-1' : ''}>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins relative z-10">{service.title}</h3>
                <p className="text-[var(--text-sub)] leading-relaxed relative z-10">{service.description}</p>
                
                {isFeatured && (
                  <div className="mt-8 flex gap-3 flex-wrap relative z-10">
                    <span className="px-3 py-1.5 bg-[var(--g)]/10 border border-[var(--g)]/20 text-[var(--g)] text-xs font-bold rounded-full">✓ Natural Language</span>
                    <span className="px-3 py-1.5 bg-[var(--s)]/10 border border-[var(--s)]/20 text-[var(--s)] text-xs font-bold rounded-full">✓ Multi-Language</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
