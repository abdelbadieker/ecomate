# EcoMate — Full-Stack SaaS Platform 🇩🇿

The complete e-commerce SaaS platform for Algerian businesses. Built with Next.js 14, Supabase, and TypeScript.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS + Custom CSS Variables |
| Language | TypeScript |
| Fonts | Poppins + Inter (Google Fonts) |
| Notifications | react-hot-toast |
| Charts | Recharts |

---

## 🚀 Quick Setup (Local Development)

### 1. Clone / Copy the project

```bash
cd /path/to/your/projects
# The project files are in /home/claude/ecomate/
# Copy them to your machine
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it **EcoMate**
3. Choose a strong database password
4. Select **Frankfurt** or closest region to Algeria

### 3. Run the Database Migration

In your Supabase dashboard → **SQL Editor** → paste and run:
```sql
-- Copy contents of: supabase/migrations/001_initial.sql
```

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Find these in: Supabase Dashboard → Project Settings → API

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Create Admin Account

1. Go to [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
2. Sign up with:
   - **Email:** `abdelbadie.kertimi1212@gmail.com`
   - **Password:** `12345678`
3. Confirm your email (check inbox)
4. In Supabase SQL Editor, run:
   ```sql
   -- From: supabase/migrations/002_create_admin.sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (
     SELECT id FROM auth.users
     WHERE email = 'abdelbadie.kertimi1212@gmail.com'
   );
   ```
5. Access the admin panel at: [http://localhost:3000/admin-xm9k2](http://localhost:3000/admin-xm9k2)

---

## 📧 Configure Email (Password Reset)

In Supabase Dashboard → **Authentication** → **SMTP Settings**:

Configure with Gmail or any SMTP provider:
- **Host:** smtp.gmail.com
- **Port:** 587
- **Username:** your-email@gmail.com
- **Password:** your-app-password (Google App Password)

Password reset emails are handled automatically by Supabase.

---

## 📁 Project Structure

```
ecomate/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design system CSS
│   ├── auth/
│   │   ├── login/page.tsx          # Sign in
│   │   ├── register/page.tsx       # 3-step signup
│   │   ├── forgot-password/        # Request reset
│   │   ├── reset-password/         # Set new password
│   │   └── callback/route.ts       # Supabase auth callback
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard with sidebar
│   │   ├── page.tsx                # Overview + stats
│   │   ├── orders/                 # Full order management
│   │   ├── products/               # Product catalog CRUD
│   │   ├── customers/              # CRM (Growth plan)
│   │   ├── analytics/              # Analytics (Growth plan)
│   │   ├── ai-chatbot/             # AI chatbot config
│   │   ├── delivery/               # Delivery tracking
│   │   └── settings/               # Profile + password + plan
│   ├── checkout/
│   │   └── page.tsx                # Plan selection + payment
│   └── admin-xm9k2/               # 🔐 SECRET ADMIN URL
│       ├── login/page.tsx          # Admin sign in
│       └── dashboard/
│           ├── page.tsx            # Admin overview
│           ├── clients/            # View all clients
│           ├── reviews/            # Approve/reject reviews
│           ├── partners/           # Manage landing page partners
│           ├── services/           # Manage service features
│           └── settings/           # Admin password change
├── components/
│   ├── landing/                    # All landing page sections
│   │   ├── Nav.tsx                 # Navbar with theme toggle
│   │   ├── Hero.tsx                # Hero section
│   │   ├── Partners.tsx            # Scrolling partners marquee
│   │   ├── Reviews.tsx             # Reviews + submit form
│   │   └── Sections.tsx            # All other sections
│   ├── dashboard/
│   │   └── Sidebar.tsx             # Dashboard sidebar (plan-aware)
│   └── admin/
│       └── AdminSidebar.tsx        # Admin sidebar
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser client
│       └── server.ts               # Server client + admin client
├── middleware.ts                   # Route protection
└── supabase/
    └── migrations/
        ├── 001_initial.sql         # Full DB schema
        └── 002_create_admin.sql    # Admin account setup
```

---

## 🔐 Access URLs

| URL | Access |
|---|---|
| `/` | Public landing page |
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/auth/forgot-password` | Request password reset |
| `/dashboard` | Client dashboard (auth required) |
| `/checkout` | Plan upgrade (auth required) |
| `/admin-xm9k2` | 🔐 Admin panel (admin role required) |

---

## 💳 Plans & Features

| Feature | Starter | Growth | Business |
|---|---|---|---|
| AI Chatbot | ✓ Basic | ✓ Full | ✓ Full |
| Orders/month | 50 | Unlimited | Unlimited |
| Social channels | 1 | All | All |
| CRM | ✗ | ✓ | ✓ |
| Analytics | ✗ | ✓ | ✓ |
| AI Growth Agent | ✗ | ✓ | ✓ Advanced |
| Dedicated manager | ✗ | ✗ | ✓ |
| **Price** | **Free (14 days)** | **4,900 DA/mo** | **Custom** |

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `profiles` | User accounts + plan + role |
| `orders` | Customer orders with status |
| `products` | Product catalog |
| `crm_customers` | Customer relationship data |
| `subscriptions` | Plan subscriptions + payment tracking |
| `reviews` | User reviews (approved by admin) |
| `partners` | Landing page partner logos |
| `services` | Service definitions |
| `plans` | Plan definitions |

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# NEXT_PUBLIC_APP_URL (set to your vercel URL)
```

In Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

---

## 🚀 Professional "Fresh Start" Migration

If you are migrating from a previous version to resolve production issues:

1. **Clean Git History:**
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "EcoMate: Professional v1.0 Production Release"
   ```

2. **Create & Link New Repository:**
   - Create a fresh repo on GitHub (e.g., `ecomate-pro`).
   - `git remote add origin https://github.com/abdelbadie-kertimi/ecomate-pro.git`
   - `git push -u origin main`

3. **Deploy to Fresh Vercel Project:**
   - Connect the new repository in Vercel to bypass old build caches.
   - Ensure Env Vars are identical to your Supabase settings.

---

## 👤 Founder

**Abdelbadie Kertimi** — EcoMate Founder  
University of Bouira Startup Incubator — 🇩🇿 Made in Algeria

---

*EcoMate SaaS · 2025 · CONFIDENTIAL*
