# ACtoCash Session Log — April 5-6, 2026

## Session Summary
Full-stack deployment, Google Ads setup, and conversion tracking for the ACtoCash lead capture app.

---

## 1. Code Changes

### Expected Price Field Removed
- **Why:** Business psychology — removing price ranges gives the buyer (us) the anchoring advantage during phone negotiations. Sellers without a reference point accept lower offers.
- **Files changed:** `src/app/page.tsx`
- **What:** Removed `PRICES` array, `expectedPrice` from form state, and the ChipGroup for price selection.
- **Section label** changed from "Pickup & Price" to "Pickup Details".

### Google Ads Conversion Tracking Added
- **Tracking ID:** `AW-953195901`
- **Conversion label:** `CONVERSION_LABEL` (placeholder — needs to be updated with actual label from Google Ads)
- **Files changed:**
  - `src/app/layout.tsx` — Added inline Google tag (`gtag.js`) in `<head>` using `dangerouslySetInnerHTML` (standard `<script>` tags, not Next.js `Script` component, because Google's tag verifier can't detect `afterInteractive` strategy scripts).
  - `src/app/page.tsx` — Added `window.gtag("event", "conversion", ...)` call on successful form submission. Added `Window` type declaration for TypeScript.
- **Note:** Initially used Next.js `Script` component with `strategy="afterInteractive"` but Google's tag tester couldn't detect it. Switched to standard inline `<script>` tags.

### Platform-Specific Dependency Removed
- Removed `@next/swc-darwin-arm64` from `package.json` — was blocking `npm install` on Linux (EC2). Next.js auto-installs the correct SWC binary per platform.

---

## 2. Infrastructure & Deployment

### GitHub Repository
- **Repo:** https://github.com/AnasShaikh/ac-to-cash.git
- **Branch:** `main`
- Initialized git, pushed all code.

### DuckDNS Domain
- **Domain:** `actocash.duckdns.org`
- **Token:** `dcfab372-8f11-443c-a7af-2fd9760ef768`
- Updated DuckDNS to point to EC2 IP `13.60.37.12` (was pointing to local Mac IP `103.233.95.89`).

### EC2 Instance (AWS)
- **Instance ID:** `i-0c7b10f277f03f370`
- **Region:** `eu-north-1` (Stockholm)
- **OS:** Ubuntu 24.04 LTS
- **RAM:** 7.6 GB
- **Node.js:** v22.22.0
- **Security Group:** `launch-wizard-1` (`sg-04b22aa5675fc02b2`)
- **AWS Account:** `anasopenclaw (1536-5954-7627)`

### EC2 Setup Steps
1. Cloned repo from GitHub
2. Ran `npm install` (after removing darwin-arm64 SWC dep)
3. Created `.env` with `DATABASE_URL` and `ADMIN_SECRET`
4. Ran `npx prisma generate` and `npm run build`
5. Installed **PM2** globally — runs Next.js as `pm2 start npm --name actocash -- start`
6. Installed **Caddy** — reverse proxy with auto-HTTPS (Let's Encrypt)
7. Caddy config at `/etc/caddy/Caddyfile`:
   ```
   actocash.duckdns.org {
       reverse_proxy localhost:3000
   }
   ```
8. TLS certificate auto-provisioned by Caddy via Let's Encrypt ACME.

### EC2 Security Group Rules (Inbound)
| Type  | Port | Source       |
|-------|------|-------------|
| SSH   | 22   | Your IP/32  |
| HTTP  | 80   | 0.0.0.0/0   |
| HTTPS | 443  | 0.0.0.0/0   |

### Disk Space Issue
- EC2 root volume (6.8 GB) hit 100% full after build.
- Freed space by: `sudo apt-get clean`, `sudo journalctl --vacuum-size=10M`, `npm cache clean --force`.
- **Recommendation:** Consider expanding the EBS volume to 15-20 GB to avoid future issues.

### Deploy Process (for future reference)
```bash
ssh aws-openclaw "cd ~/ac-to-cash && git pull && npm run build && pm2 restart actocash"
```

---

## 3. Google Ads Campaign

### Account Details
- **Account ID:** 620-159-7412
- **Email:** mohdanas211@gmail.com
- **Payment:** Rs 1,500 via NetBanking (pending clearance, 3-5 business days)

### Campaign: AC-Buying-Search-1
- **Type:** Search
- **Objective:** Leads
- **Bidding:** Maximize conversions (no target CPA set)
- **Budget:** Rs 600/day
- **Status:** Not eligible (payment pending)
- **Start date:** April 5, 2026

### Targeting
- **Location:** Mumbai, Maharashtra, India (Presence only — people physically in Mumbai)
- **Languages:** English, Hindi, Marathi
- **Networks:** Google Search + Search Partners (Display Network disabled)

### Keywords (Phrase Match)
```
"sell old AC"          "sell used AC"           "old AC buyer"
"sell AC online"       "old AC buyer near me"   "sell second hand AC"
"purana AC bechna hai" "AC kharidne wale"       "scrap AC buyer"
"old AC price"         "used AC value"          "second hand AC rate"
"sell old AC Mumbai"   "old AC sell karna hai"  "junk AC buyer"
```

### Ad Copy
- **Display path:** actocash.duckdns.org/sell/old-AC
- **Headlines (7):**
  1. Sell Your Old AC — Get Cash
  2. Free Pickup in Mumbai
  3. Old AC Buyer Near You
  4. Get Cash for Used AC Today
  5. We Buy All AC Brands
  6. Working or Not — We Buy ACs
  7. Sell Old AC in 30 Seconds
- **Descriptions (2):**
  1. Quick form, fast quote, free doorstep pickup across Mumbai. Any brand, any condition accepted.
  2. Don't let your old AC collect dust. We buy Split, Window & Inverter ACs. No haggling, no hassle.

### Sitelinks
| Text                | URL                              |
|---------------------|----------------------------------|
| How It Works        | https://actocash.duckdns.org/    |
| All Brands Accepted | https://actocash.duckdns.org/    |
| Free Doorstep Pickup| https://actocash.duckdns.org/    |
| Sell Your AC Now    | https://actocash.duckdns.org/    |

---

## 4. Known Issues & Pending Items

### Critical
- [ ] **Conversion label missing** — `CONVERSION_LABEL` placeholder in `src/app/page.tsx:71` needs the actual label from Google Ads (Goals > Conversions > Summary > click conversion > tag setup). Without this, Google can't optimize for form submissions.

### Important
- [ ] **SSH access breaks frequently** — EC2 security group SSH rule is tied to a specific IP. When ISP changes your IP, SSH breaks. Consider using EC2 Instance Connect or setting SSH source to a broader CIDR range.
- [ ] **Disk space tight** — EC2 root volume is 6.8 GB with only ~300 MB free after cleanup. Should expand EBS volume.
- [ ] **Google tag verification spinning** — Tag was deployed but Google's "Test connection" may need time to detect it. Retry after a few hours.

### Future
- [ ] Add negative keywords to Google Ads campaign (buy, purchase, rent, repair, service, install, new AC, AC on EMI)
- [ ] Set up Google Ads conversion tracking once label is obtained
- [ ] Consider expanding to Meta (Facebook/Instagram) ads if Google performs well
- [ ] Photo upload feature for AC condition
- [ ] Multi-city support
- [ ] Email/WhatsApp notifications on new leads

---

## 5. Credentials & Access Reference

| Service       | Access                                          |
|---------------|-------------------------------------------------|
| App (Public)  | https://actocash.duckdns.org                    |
| Admin Panel   | https://actocash.duckdns.org/admin              |
| Admin Secret  | `coolcash-admin-2026`                           |
| EC2 SSH       | `ssh aws-openclaw`                              |
| GitHub        | https://github.com/AnasShaikh/ac-to-cash        |
| Google Ads    | ads.google.com (mohdanas211@gmail.com)           |
| DuckDNS       | duckdns.org (mohdanas211@gmail.com)              |
| Neon DB       | neon.tech (connection string in EC2 .env)        |

---

## 6. Git Commits This Session

| Hash      | Message                                              |
|-----------|------------------------------------------------------|
| 62d17d9   | Initial commit: ACtoCash lead capture app            |
| c5894db   | Remove platform-specific SWC dependency              |
| df147f1   | Add Google Ads conversion tracking (AW-953195901)    |
| cb3c72c   | Use inline script tags for Google tag to fix detection|
