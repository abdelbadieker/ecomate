'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Shield, Zap, MessageSquare, Bot } from 'lucide-react';

interface ChatbotDemo {
  id: string;
  video_url: string;
}

export function ChatbotDemoSection() {
  const [demo, setDemo] = useState<ChatbotDemo | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('demo_videos')
      .select('*')
      .eq('section_name', 'homepage_showcase')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setDemo(data[0]);
      });
  }, [supabase]);

  return (
    <section className="py-24 bg-[#07101F] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Sales
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Watch your sales <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">happen on autopilot.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our AI Sales Chatbot isn&apos;t just a basic responder. It&apos;s trained to guide your customers from hello to checkout, handling questions in Algerian Darja, French, and English simultaneously.
            </p>

            <div className="space-y-6">
              {[
                { icon: MessageSquare, title: "Multi-Channel Sync", desc: "Facebook, Instagram, and WhatsApp — all connected instantly." },
                { icon: Zap, title: "Instant Conversion", desc: "Turns browser curiosity into completed orders in seconds." },
                { icon: Shield, title: "Zero Data Loss", desc: "Every lead and order is captured and synced to your dashboard." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 bg-[#0A1628] border border-slate-800 rounded-xl flex items-center justify-center text-blue-400">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video / Demo Content */}
          <div className="order-1 lg:order-2">
            <div className="relative group">
              {/* Decorative Frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              
              <div className="relative bg-[#0A1628] border border-slate-800 rounded-[30px] overflow-hidden shadow-2xl">
                {demo ? (
                  <div className="aspect-[16/9] w-full bg-black relative">
                    <video 
                      src={demo.video_url} 
                      controls 
                      className="w-full h-full object-cover"
                      poster=""
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full flex flex-col items-center justify-center p-12 text-center bg-[#07101F]">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                      <Bot className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <h3 className="text-white font-bold text-xl mb-2">Platform Showcase</h3>
                    <p className="text-slate-500 text-sm max-w-[280px]">Our team is preparing a live demo of the chatbot in action. Check back soon!</p>
                  </div>
                )}
                
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Live Preview</span>
                </div>
              </div>

              {/* Stats Chips */}
              <div className="absolute -bottom-6 -left-6 bg-[#0A1628] border border-slate-800 p-4 rounded-2xl shadow-xl hidden md:block">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Response Time</div>
                <div className="text-xl font-black text-emerald-400 tracking-tight">&lt; 1.5 Seconds</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-[#0A1628] border border-slate-800 p-4 rounded-2xl shadow-xl hidden md:block">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Customer Satisfaction</div>
                <div className="text-xl font-black text-blue-400 tracking-tight">99.2%</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
