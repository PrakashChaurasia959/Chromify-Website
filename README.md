# CHROMIFY — Premium Photo Frames & Decorative Wall Frames

> **"Frame Your Moments. Make Them Timeless."**  
> Official business website, product portfolio, and customer enquiry system for **Chromify**.

---

## 🌟 Overview & Highlights

- **Brand Name**: Chromify
- **Tagline**: Frame Your Moments. Make Them Timeless.
- **Primary Business Email**: `Chromify30@gmail.com`
- **Phone**: `9336333840` (`+91 93363 33840`)
- **Instagram**: [https://instagram.com/chromify.in](https://instagram.com/chromify.in)
- **Studio Address**: Sapaha, Kasia, Kushinagar, Uttar Pradesh 274402, India
- **All 17 Authentic Product Photographs**: Preserved and integrated into the interactive product collection and lightbox gallery.

---

## 🚀 Key Features

1. **Rich Colorful & Premium Visual Aesthetics**:
   - Modern color palette: Vibrant purple, electric blue, coral pink, warm orange, cream backdrop, and dark navy typography.
   - Glassmorphism, smooth micro-interactions, responsive mobile navigation, and modern typography (`Outfit` & `Plus Jakarta Sans`).
2. **Complete 17-Photograph Showcase Gallery**:
   - High-definition lightbox with keyboard arrows & Escape controls.
   - Category filtering (`Shadow Box Frames`, `Wooden Photo Frames`, `Decorative Frames`, `Gallery Sets`).
   - Sizing displays (6×8", 8×12", 12×18") and technical blueprints (recessed groove, slide-in glass).
3. **Customer Enquiry & Fast WhatsApp Ordering**:
   - "Enquire Now" modal on every product card with prefilled product context.
   - One-click WhatsApp button with prefilled product message.
   - Real-time form validation.
4. **Secure Admin Dashboard**:
   - Add new products and upload photos without touching the codebase.
   - Edit, delete, and toggle "Published" status.
   - View, mark read/unread, and delete customer enquiries.
   - Supabase Auth + Row Level Security (RLS) integration.
5. **Automatic Email Alert Engine**:
   - Supabase Edge Function (`supabase/functions/send-enquiry-email`).
   - Sends notification emails to `Chromify30@gmail.com` when customers submit enquiries.
6. **SEO & Social Sharing Ready**:
   - Meta title, description, keywords, Open Graph image preview, Twitter card.
   - `robots.txt`, `sitemap.xml`, and branded SVG favicon.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, JavaScript (ESM)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Tailored Design System with CSS variables and glassmorphism)
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth
- **File Storage**: Supabase Storage (`product-images` bucket)
- **Serverless Backend**: Supabase Edge Functions (Deno / TypeScript)
- **Hosting Compatibility**: Vercel, Netlify, Cloudflare Pages, GitHub Pages

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🗄️ Connecting Your Supabase Project

The website runs right away with all 17 initial products and full interactive features. To connect your cloud Supabase database:

1. Create a free account and new project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the entire script in [supabase/schema.sql](file:///supabase/schema.sql).
   - This sets up the `products` table, `enquiries` table, Row Level Security (RLS) policies, and the `product-images` storage bucket.
3. In Supabase Dashboard, go to **Project Settings** > **API**.
4. Copy your **Project URL** and **Project API Key (anon/public)**.
5. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. Restart your development server (`npm run dev`).

---

## 📧 Configuring Automatic Email Alerts

When customers submit an enquiry, notifications are sent to **Chromify30@gmail.com**.

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. In your terminal with the Supabase CLI installed:
   ```bash
   # Set the server-side email secret
   supabase secrets set RESEND_API_KEY=re_your_api_key_here

   # Deploy the edge function
   supabase functions deploy send-enquiry-email
   ```
3. Whenever a visitor submits an enquiry, Supabase saves the record and dispatches an HTML email to `Chromify30@gmail.com`.

---

## 🔐 Administrator Dashboard Access

1. Click the **Admin** button in the navbar or footer.
2. **In Live Supabase Mode**:
   - Create an admin user under **Authentication > Users** in Supabase (e.g. `Chromify30@gmail.com`).
   - Sign in using those credentials.
3. **In Preview / Demo Mode**:
   - Email: `Chromify30@gmail.com`
   - Password: `chromify2026`
4. Inside the dashboard you can:
   - Add new frames with photos, dimensions, and prices.
   - Edit descriptions and toggle published status.
   - View new customer enquiries and reply via WhatsApp or email.

---

## 🌐 Deploying Online (Vercel / Netlify)

### Deploy to Vercel:
1. Push this repository to GitHub.
2. Import the repository in [vercel.com](https://vercel.com).
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**.

### Deploy to Netlify:
1. Import repository on [netlify.com](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables and click **Deploy site**.

---

## 📱 Social Media & WhatsApp Promotion

- **Instagram**: Link your bio to your deployed URL. Highlight 3D shadow boxes and teak trio sets in your Instagram stories.
- **WhatsApp**: Share direct catalog links with the prefilled message:
  `https://wa.me/919336333840?text=Hi%20Chromify,%20I%20am%20interested%20in%20photo%20frames.`
