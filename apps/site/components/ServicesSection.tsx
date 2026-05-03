import { createClient } from '@supabase/supabase-js';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function ServicesSection() {
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
    <section id="features" className="py-32 px-5 relative bg-[#0a1628] rounded-b-[40px]">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[#2563EB] font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-2">
          <span className="w-4 h-[2px] bg-[#2563EB]"></span>
          Everything You Need
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight font-poppins">
          All tools. <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-200">One platform.</span><br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-300">Zero fragmentation.</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Stop juggling a dozen different tools. EcoMate brings every capability your Algerian business needs into one seamless, affordable system.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => {
          // Dynamically get the lucide icon or treat as emoji
          const hasValidIcon = service.icon && !!(LucideIcons as any)[service.icon];
          const isEmoji = service.icon && !hasValidIcon;
          const Icon = hasValidIcon ? (LucideIcons as any)[service.icon] : LucideIcons.CheckCircle2;
          
          // Make the first item span 2 columns to mimic the original Bento design if there are enough items
          const isFeatured = index === 0 && services.length > 3;
          const isFullWidth = index === services.length - 1 && services.length % 2 === 0;

          return (
            <div 
              key={service.id} 
              className={`relative group bg-[#0f1c33] border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 overflow-hidden shadow-xl ${isFeatured ? 'md:col-span-2' : ''} ${isFullWidth ? 'md:col-span-3 flex flex-col md:flex-row items-center gap-8' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {service.image_url ? (
                 <div className={`w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden ${isFullWidth ? 'w-16 h-16 shrink-0' : ''}`}>
                   <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                 </div>
              ) : (
                <div className={`w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 ${isFullWidth ? 'w-16 h-16 shrink-0' : ''}`}>
                  {isEmoji ? (
                    <span className="text-3xl">{service.icon}</span>
                  ) : (
                    <Icon className={`w-7 h-7 ${index % 2 === 0 ? 'text-blue-400' : 'text-emerald-400'} ${isFullWidth ? 'w-8 h-8' : ''}`} />
                  )}
                </div>
              )}
              
              <div className={isFullWidth ? 'flex-1' : ''}>
                <h3 className="text-xl font-bold text-white mb-3 font-poppins relative z-10">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">{service.description}</p>
                
                {isFeatured && (
                  <div className="mt-8 flex gap-3 flex-wrap relative z-10">
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">✓ Natural Language</span>
                    <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full">✓ Multi-Language</span>
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
