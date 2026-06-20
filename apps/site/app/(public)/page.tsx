import Link from 'next/link';

import { Bot, Package, ShoppingBag, Users, BarChart3, Truck } from 'lucide-react';
import { PartnershipsMarquee } from '@/components/PartnershipsMarquee';
import { AuthNav } from '@/components/AuthNav';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ChatbotDemoSection } from '@/components/ChatbotDemoSection';
import { ContactSection } from '@/components/ContactSection';
import { ServicesSection } from '@/components/ServicesSection';
import { PricingSection } from '@/components/PricingSection';

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <nav id="nav">
        <div className="logo cursor-pointer">Eco<span>Mate</span></div>
        <ul className="nl">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
        <div className="nr">
          <AuthNav />
        </div>
      </nav>

      {/* PREMIUM SAAS HERO */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-[var(--bg-body)]">
        {/* Deep Background Glows */}
        {/* PERF: replaced 120-150px blur filters (very expensive to paint) with free radial gradients */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.16), transparent 70%)' }}></div>
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.14), transparent 70%)' }}></div>

        <div className="max-w-7xl mx-auto px-5 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* LEFT COLUMN: Content */}
          <div className="flex flex-col items-start text-left max-w-[600px] z-10 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--s)]/10 border border-[var(--s)]/20 text-[var(--s)] text-xs font-bold mb-8 backdrop-blur-sm tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[var(--s)] animate-pulse"></span>
              All-in-One SaaS Platform for Algerian Business
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight font-poppins">
              Build your <br/>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 italic overflow-visible pr-3 pb-2 -mr-3">Business</span><br/>
              <span className="text-slate-300 font-medium text-4xl md:text-5xl lg:text-6xl">without the complexity.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-sub)] leading-relaxed mb-10 max-w-[500px]">
              EcoMate centralizes every tool Algerian SMEs need into one platform — AI chatbot automation, order management, CRM. No technical knowledge required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="group px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 flex items-center justify-center gap-2">
                Start Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#features" className="group px-8 py-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-white font-bold rounded-2xl border border-[var(--border-c)] hover:border-[var(--s)]/50 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--g)] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                Discover Features
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm border-t border-[var(--border-c)] pt-8 w-full">
              <div className="flex flex-col"><span className="text-white font-black text-2xl font-poppins">6</span><span className="text-[var(--text-muted)] font-medium mt-1">Tools</span></div>
              <div className="flex flex-col"><span className="text-white font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-poppins">98%</span><span className="text-[var(--text-muted)] font-medium mt-1">AI Response</span></div>
              <div className="flex flex-col"><span className="text-white font-black text-2xl font-poppins">24/7</span><span className="text-[var(--text-muted)] font-medium mt-1">Automation</span></div>
              <div className="flex flex-col"><span className="text-white font-black text-2xl font-poppins">0</span><span className="text-[var(--text-muted)] font-medium mt-1">Missed Orders</span></div>
            </div>
          </div>

          {/* RIGHT COLUMN: Floating Glassmorphism Cards */}
          <div className="relative h-[600px] hidden lg:block perspective-[1200px] z-20">
            {/* Background Decorative Frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--s)]/10 to-transparent rounded-[40px] border border-white/5 transform rotate-3 scale-95 opacity-60 pointer-events-none"></div>
            
            {/* Floating Card 1: AI Chat Widget */}
            <div className="absolute top-10 right-10 w-[320px] bg-[var(--bg-body)]/60 backdrop-blur-xl border border-[var(--border-c)] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 z-30">
              <div className="flex items-center gap-3 mb-4 border-b border-[var(--border-c)] pb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--s)] to-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--s)]/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white font-poppins">EcoMate AI Agent</div>
                  <div className="text-[10px] text-[var(--g)] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--g)] shadow-[0_0_5px_#34d399]"></span> Always Active</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-[var(--bg-card)] rounded-xl rounded-tl-sm p-3 text-sm text-[var(--text-sub)] w-[85%] border border-[var(--border-c)]">
                  Hello! How can I help you today?
                </div>
                <div className="bg-[var(--s)] rounded-xl rounded-tr-sm p-3 text-sm text-white w-[85%] ml-auto shadow-lg shadow-[var(--s)]/20">
                  I want to track order #DZ-8492
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl rounded-tl-sm p-3 text-sm text-[var(--text-sub)] w-[95%] border border-[var(--border-c)]">
                  Your order is in transit to Oran. Expected delivery: Today. 📦
                </div>
              </div>
            </div>

            {/* Floating Card 2: Analytics Dashboard */}
            <div className="absolute top-52 -left-4 w-[340px] bg-[var(--bg-body)]/70 backdrop-blur-xl border border-[var(--border-c)] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float-slow hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 z-40">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-bold text-white flex items-center gap-2 font-poppins">
                  <div className="p-1.5 bg-[var(--g)]/20 rounded-md"><BarChart3 className="w-4 h-4 text-[var(--g)]" /></div> Revenue
                </div>
                <div className="text-xs font-bold text-[var(--g)] bg-[var(--g)]/10 border border-[var(--g)]/20 px-2 py-1 rounded-md">+24.5%</div>
              </div>
              <div className="text-3xl font-black text-white mb-6 tracking-tight font-poppins">124,500 <span className="text-lg text-[var(--text-muted)] font-medium">DZD</span></div>
              <div className="flex items-end gap-2 h-24">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-[var(--s)]/20 to-[var(--s)] rounded-t-sm relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h * 1000}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Card 3: New Order Notification */}
            <div className="absolute bottom-6 right-2 w-[300px] bg-[var(--bg-body)]/80 backdrop-blur-xl border border-[var(--border-c)] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float-fast hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 z-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--g)]/20 border border-[var(--g)]/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Package className="w-6 h-6 text-[var(--g)]" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-bold text-white font-poppins">New Order</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-medium">Just now</div>
                  </div>
                  <div className="text-xs text-[var(--text-sub)] font-medium mb-1">Airpods Pro - Algiers</div>
                  <div className="text-[10px] text-[var(--g)] font-bold bg-[var(--g)]/10 inline-block px-2 py-0.5 rounded-full border border-[var(--g)]/20">Pending Confirmation</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PartnershipsMarquee />

      {/* INTEGRATIONS */}
      <div className="integ-section">
        <div className="integ-inner">
          <span className="integ-label">Connects seamlessly with the platforms your customers already use</span>
          <div className="integ-grid">
            <div className="integ-col">
              <div className="integ-badge">All Social Platforms</div>
              <div className="integ-col-title">Where your customers message you</div>
              <div className="integ-logos">
                <span className="integ-pill"><span className="ip-dot blue"></span>Facebook</span>
                <span className="integ-pill"><span className="ip-dot pink"></span>Instagram</span>
                <span className="integ-pill"><span className="ip-dot green"></span>WhatsApp</span>
                <span className="integ-pill" style={{color:'var(--text-muted)', borderStyle:'dashed'}}>+ More</span>
              </div>
            </div>
            <div className="integ-divider"></div>
            <div className="integ-col">
              <div className="integ-badge">Algerian Delivery Network</div>
              <div className="integ-col-title">Shipping partners across all wilayas</div>
              <div className="integ-logos">
                <span className="integ-pill"><span className="ip-dot dz"></span>Home Delivery</span>
                <span className="integ-pill"><span className="ip-dot dz"></span>Office Pickup</span>
                <span className="integ-pill"><span className="ip-dot dz"></span>Express Delivery</span>
                <span className="integ-pill" style={{color:'var(--text-muted)', borderStyle:'dashed'}}>All 58 Wilayas</span>
              </div>
            </div>
            <div className="integ-divider"></div>
            <div className="integ-col">
              <div className="integ-badge">Business Tools</div>
              <div className="integ-col-title">Keep using the tools you love</div>
              <div className="integ-logos">
                <span className="integ-pill"><span className="ip-dot sheets"></span>Google Sheets</span>
                <span className="integ-pill"><span className="ip-dot gray"></span>Excel Export</span>
                <span className="integ-pill"><span className="ip-dot gray"></span>PDF Reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="powered-section">
        <div className="cap-header">
          <span className="cap-dot"></span>
          <span className="cap-label">What EcoMate delivers for your business — every single day</span>
          <span className="cap-dot"></span>
        </div>
        <div className="powered-track">
          <div className="pw-item"><span className="pw-chip">⚡&nbsp;<span className="pw-chip-val g">&#60; 2s</span>&nbsp;reply speed</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">💬&nbsp;<span className="pw-chip-val w">3</span>&nbsp;languages supported</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">🤖&nbsp;<span className="pw-chip-val g">98.7%</span>&nbsp;AI response rate</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">📦&nbsp;<span className="pw-chip-val g">24/7</span>&nbsp;orders automated</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">🌍&nbsp;<span className="pw-chip-val w">58</span>&nbsp;wilayas covered</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">🔄&nbsp;<span className="pw-chip-val g">0</span>&nbsp;missed messages</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">📊&nbsp;<span className="pw-chip-val g">Real-time</span>&nbsp;dashboard data</span></div><div className="pw-sep"></div>
          <div className="pw-item"><span className="pw-chip">🔒&nbsp;<span className="pw-chip-val w">End-to-end</span>&nbsp;data security</span></div><div className="pw-sep"></div>
        </div>
      </div>

      <ChatbotDemoSection />

      <ServicesSection />

      {/* REVIEWS — Real DB-backed reviews */}
      <ReviewsSection />

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="ctr">
          <p className="stag">Simple Process</p>
          <h2 className="st">From zero to selling <span>in 4 steps.</span></h2>
          <p className="sd">We handle the complexity so you can focus on what matters — growing your business.</p>
        </div>
        <div className="hwg">
          <div className="hwcon"></div>
          <div className="hws">
            <div className="hwb"><div className="hwbn">1</div>📋</div>
            <h3 className="hwt">Tell Us Your Business</h3>
            <p className="hwd">Sign up and describe your activity, products, and goals.</p>
          </div>
          <div className="hws">
            <div className="hwb"><div className="hwbn">2</div>⚙️</div>
            <h3 className="hwt">We Set Everything Up</h3>
            <p className="hwd">Our team configures your AI chatbot, product catalog, and dashboard.</p>
          </div>
          <div className="hws">
            <div className="hwb"><div className="hwbn">3</div>🔗</div>
            <h3 className="hwt">Connect Your Channels</h3>
            <p className="hwd">Link your social pages and your delivery partner effortlessly.</p>
          </div>
          <div className="hws">
            <div className="hwb"><div className="hwbn">4</div>🚀</div>
            <h3 className="hwt">Start Scaling</h3>
            <p className="hwd">Watch as AI answers questions and closes sales 24/7.</p>
          </div>
        </div>
      </section>

      {/* PRICING — DB-driven 3 revenue lines (Automation / Content Packs / Fulfillment), all managed from the admin dashboard */}
      <PricingSection />

      <ContactSection />

      {/* CTA */}
      <section id="cta">
        <div className="ctag2"></div>
        <h2 className="ct">Ready to automate your <span className="hi">Sales?</span></h2>
        <p className="csub">Join hundreds of merchants in Algeria who have centralized their operations and skyrocketed their revenue with EcoMate.</p>
        <div className="cacts">
          <Link href="/register" className="bcta">Get Started Now</Link>
          <Link href="/login" className="bctag">Sign In to Dashboard</Link>
        </div>
        <p className="cnote">Cancel anytime.</p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-c)] bg-[var(--bg-section)]">
        <div className="fg">
          <div className="fb">
            <span className="logo">Eco<span style={{background: 'linear-gradient(135deg,var(--s),var(--g))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Mate</span></span>
            <p className="text-[var(--text-sub)]">Empowering Algerian businesses with professional e-commerce automation tailored for the local market.</p>
          </div>
          <div className="fb">
            <h4 className="fc2h">Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#">Guides</a></li>
            </ul>
          </div>
          <div className="fb">
            <h4 className="fc2h">Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="fb">
            <h4 className="fc2h">Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="fbot border-t border-[var(--border-c)]">
          <p className="fcp text-[var(--text-muted)]">© 2026 EcoMate. Built for scale in <span className="text-white font-bold">Algeria</span>.</p>
          <div className="fbdgs">
            <span className="fbdg border-[var(--border-c)] text-[var(--text-muted)]">Secure</span>
            <span className="fbdg border-[var(--border-c)] text-[var(--text-muted)]">Lightning Fast</span>
          </div>
        </div>
      </footer>
    </>
  );
}
