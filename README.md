# Srijan '26

## Running Locally

To get the project running on your local machine, follow these barebone steps:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd srijan26
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   Copy `.env.example` to a new file named `.env`, and fill in your keys:
   - `DATABASE_URL`: Add your MongoDB connection string.
   - `AUTH_*`, `GOOGLE_AUTH_*`: Required for authentication testing.
   - `SMTP_USER`, `SMTP_PASS` (Optional): To send functional emails locally.
   - `CASHFREE_*` (Optional): For processing/verifying payments.

4. **Sync Database Schema:**
   *(Ensure you have an active MongoDB instance running; e.g. via `docker-compose up -d`)*
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Your app will be live at http://localhost:3000.*

---

## Technical Architecture & Scaling Optimizations

This codebase is specifically tuned for high traffic and optimal UX. Here's a summary of what's working under the hood:

### ⚡ Edge Requests Optimization
To dramatically prevent unnecessary edge function execution limits being hit from high traffic, we dynamically deferred `prefetch` on deep navbar links, event listing cards, and dashboard routes. This means Next.js won't spam edge servers predicting where a hovering cursor *might* click, saving costs and server strain.

### 🌐 CDN Asset Serving (Vercel Blob)
Large aesthetic assets—such as the massive background `webm` hero videos—are deployed remotely into Vercel Blob (CDN) rather than bulking the source code or main server memory, achieving lightning-fast progressive streaming universally.

### 🖼️ Image / Media Caching
All images utilize the framework's native `next/image` pipelines. Coupled with strict `Cache-Control` headers for API/event listings (that reload only via explicit Superadmin UI invalidation), repeat visitors load almost everything directly from instantaneous cache.

### 🚀 Event Dynamic SEO (Next.js SSG)
Event pages located at `/events/[slug]` maintain highly customized OpenGraph and Twitter SEO tags. However, instead of executing Server-Side Rendering (SSR) uniquely on every visit, the engine pre-builds all exact event pages at build time using `generateStaticParams()`. This results in perfectly generated HTML documents capable of scoring a 100 on Lighthouse instantaneously.

### 🔐 Superadmin & Admin Privilege Management
Robust manual intervention requires comprehensive Role-Based Access Control (RBAC):
- **Admins:** Can view event metrics, manage subsets of registered users, or oversee specified event administration functionality.
- **Superadmins:** Wield God-mode control over the platform. Features built specifically for this include:
  - *Pending Orders Management:* Manually verifying or rejecting Cashfree operations that succeeded physically but failed to trigger webhook callbacks.
  - *Cache Cleansing APIs:* Re-triggering Next.js cache bypasses straight from the dashboard.
  - *Homepage Live Events:* Immediately dictating new banner/ticker events for the home route.
  - *Admin Handover:* Delegating "Admin" database roles to other authenticated emails.