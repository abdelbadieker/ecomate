import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bot, Package, ShoppingBag, Users, BarChart3, Truck } from 'lucide-react';
import { PartnershipsMarquee } from '@/components/PartnershipsMarquee';
import { AuthNav } from '@/components/AuthNav';
import { ReviewsSection } from '@/components/ReviewsSection';
import { ChatbotDemoSection } from '@/components/ChatbotDemoSection';
import { ContactSection } from '@/components/ContactSection';
import { ServicesSection } from '@/components/ServicesSection';

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
          <ThemeToggle />
          <AuthNav />
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hg1"></div>
        <div className="hg2"></div>
        <div id="hcanvas" style={{ opacity: 0.6 }}></div>
        <div className="hi-wrap">
          <div className="hbadge"><span className="hbdot"></span>All-in-One SaaS Platform for Algerian Business</div>
          <h1 className="hhline">
            <span className="hh1">Build your</span>
            <span className="hh2">Business</span>
            <span className="hh3">without the <span className="hh3c">complexity.</span></span>
          </h1>
          <p className="hsub">EcoMate centralizes every tool Algerian SMEs need into one platform — AI chatbot automation, order management, CRM. No technical knowledge required.</p>
          <div className="hact">
            <Link href="/register" className="bh1">
              Start Now
              <svg className="arri" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#features" className="bh2-live">
              <span className="live-dot"></span>Discover Features
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="hstats">
            <div className="hs"><span className="hsn"><span className="hsg">6</span></span><span className="hsl">Tools in one platform</span></div>
            <div className="hs"><span className="hsn">98<span className="hsg">%</span></span><span className="hsl">AI response rate</span></div>
            <div className="hs"><span className="hsn">24<span className="hsg">/7</span></span><span className="hsl">Always-on automation</span></div>
            <div className="hs"><span className="hsn"><span className="hsg">0</span></span><span className="hsl">Missed orders</span></div>
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
                <span className="integ-pill" style={{color:'rgba(255,255,255,.25)', borderStyle:'dashed'}}>+ More</span>
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
                <span className="integ-pill" style={{color:'rgba(255,255,255,.25)', borderStyle:'dashed'}}>All 58 Wilayas</span>
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

      {/* PRICING */}
      <section id="pricing">
        <div className="ctr">
          <p className="stag">Clear Pricing</p>
          <h2 className="st">Simple, transparent pricing.</h2>
          <p className="sd">Join EcoMate today. Upgrade when you are ready to scale.</p>
        </div>
        <div className="pgrid">
          <div className="pc">
            <div className="pn">Starter</div>
            <div className="pp">2,500<sup>DA</sup></div>
            <span className="ppr">/month</span>
            <ul className="pfl">
              <li>1 Store</li>
              <li>Basic AI Chatbot</li>
              <li>Order Management</li>
              <li>Email Support</li>
            </ul>
            <Link href="/register"><button className="pb">Get Started</button></Link>
          </div>
          <div className="pc pop">
            <div className="pbdg">Most Popular</div>
            <div className="pn">Growth</div>
            <div className="pp">5,900<sup>DA</sup></div>
            <span className="ppr">/month</span>
            <ul className="pfl">
              <li>Up to 3 Stores</li>
              <li>Advanced AI Chatbot (Multi-language)</li>
              <li>CRM & Analytics</li>
              <li>Delivery Integration</li>
              <li>Priority Support</li>
            </ul>
            <Link href="/register"><button className="pb">Get Started</button></Link>
          </div>
          <div className="pc">
            <div className="pn">Enterprise</div>
            <div className="pp">14,900<sup>DA</sup></div>
            <span className="ppr">/month</span>
            <ul className="pfl">
              <li>Unlimited Stores</li>
              <li>Custom AI Training</li>
              <li>Dedicated Account Manager</li>
              <li>API Access</li>
            </ul>
            <Link href="/register"><button className="pb">Contact Sales</button></Link>
          </div>
        </div>
      </section>

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
      <footer>
        <div className="fg">
          <div className="fb">
            <span className="logo">Eco<span style={{background: 'linear-gradient(135deg,var(--s),var(--g))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Mate</span></span>
            <p>Empowering Algerian businesses with professional e-commerce automation tailored for the local market.</p>
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
        <div className="fbot">
          <p className="fcp">© 2026 EcoMate. Built for scale in <span>Algeria</span>.</p>
          <div className="fbdgs">
            <span className="fbdg">Secure</span>
            <span className="fbdg">Lightning Fast</span>
          </div>
        </div>
      </footer>
    </>
  );
}
