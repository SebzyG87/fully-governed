# EWISHAM CREATIVE SUITE — MASTER TODO LIST
## Compiled from Pre-Migration Audit & Handover Documents

> **⚠️ NO ACTIONS UNTIL ALL DOCUMENTS ARE REVIEWED AND FULL SCOPE IS MAPPED**

---

## Document 1: Pre-Migration Audit Report (10 March 2026)

### ✅ Verified Working (No Action Needed)
- [x] 93 page files — all present
- [x] 89 routes in App.tsx — all correct
- [x] 31 DB tables in migrations — all present
- [x] 3 Edge functions — all working
- [x] 19 Admin tabs — all present
- [x] 8 Navbar dropdowns — all correct routes
- [x] Supabase connections (Booking, Street Team, Clothing Designer, Community, Social Feed, Artist Profile, Dashboard, Profile, Contact, Help Centre, Finance)
- [x] Help Widget — bottom-left ✅
- [x] Catering — removed from Book.tsx ✅
- [x] Footer icons — all present ✅
- [x] Terms page — 7 sections ✅
- [x] Privacy page — 6 sections, GDPR ✅
- [x] Recording Studio pricing — correct ✅

---

### 🔴 ISSUE 1 — CRITICAL: Editing Suite hub broken links
- **File:** `src/pages/Editing.tsx` (lines 12–36)
- **Problem:** Hub page links to old `/editing/*` routes instead of `/editing-suite/*`
- **Verified:** ✅ Confirmed — 5 broken hrefs found
- [ ] Change `/editing/core` → `/editing-suite`
- [ ] Change `/editing/streaming` → `/editing-suite/streaming`
- [ ] Change `/editing/voiceover` → `/editing-suite/voiceover`
- [ ] Change `/editing/platform` → `/editing-suite/platform`
- [ ] Change `/editing/rental` → `/editing-suite/rental`

---

### 🔴 ISSUE 2 — CRITICAL: No artist music upload portal
- **Problem:** No page exists for artists to upload music. `music_tracks` table exists but nothing inserts into it.
- **Verified:** ✅ Confirmed — no `upload-music` reference anywhere in codebase
- [ ] Build `/dashboard/upload-music` — protected page with:
  - [ ] Track title, genre, price inputs
  - [ ] Cover image upload → Supabase Storage `covers/{user_id}/{filename}`
  - [ ] Audio file upload → Supabase Storage `tracks/{user_id}/{filename}`
  - [ ] Release type selector (Single / EP / Beat Lease / Producer Stems / USB Content)
  - [ ] Submit → INSERT into `music_tracks` with `status = 'pending_review'`
  - [ ] Admin approves → `status = 'published'` → appears in shop
- [ ] Update `src/pages/vinyl/Artists.tsx` line 120: change "START SELLING → /auth" to "START SELLING → /dashboard/upload-music" for logged-in users
- [ ] Add admin review queue in `AdminShop.tsx` for pending tracks

---

### 🔴 ISSUE 3 — CRITICAL: Shop Digital Vinyl is all placeholder cards
- **File:** `src/pages/shop/DigitalVinyl.tsx`
- **Problem:** 6 hardcoded fake "Release #1–#6" cards, zero Supabase connection
- **Verified:** ✅ Confirmed — lines 30–41 are hardcoded `[1,2,3,4,5,6].map()`
- [ ] Replace with real query from `music_tracks` where `status = 'published'`
- [ ] Show clean empty state if no tracks yet
- [ ] Remove all hardcoded fake cards

---

### 🟡 ISSUE 4 — MODERATE: Shop Clothing is a placeholder
- **File:** `src/pages/shop/Clothing.tsx`
- **Problem:** Shows "Clothing store coming soon" with just a single button
- **Verified:** ✅ Confirmed — entire component is 32 lines, pure placeholder
- [ ] Replace with real query from `clothing_products` joined with `profiles`
- [ ] Show product grid
- [ ] Show empty state if no live products

---

### 🟢 ISSUE 5 — MINOR: WhatsApp number is fake
- **File:** `src/components/Footer.tsx` line 55
- **Problem:** `wa.me/447000000000` is a placeholder
- **Verified:** ✅ Confirmed
- [ ] Replace `447000000000` with client's actual WhatsApp number (⚠️ need number from client)

---

### ⚙️ Known Gaps — Planned (NOT Bugs)
These require external services or are planned for later phases:

| Feature | Status | Blocked On |
|---|---|---|
| Email OTP login | Not yet built | Planned — auth overhaul prompt ready |
| Stripe payments | Wired up, not live | Live Stripe API keys from client |
| Email sending (Resend) | Wired up, not live | Resend API key + verified domain |
| Google OAuth | Works with dev creds | Client's Google Cloud project |
| Artist Social Hub OAuth | UI only | Approved developer apps per platform |
| Post scheduling | Placeholder | Future feature |
| Crypto wallet / NFT | Greyed out | Future phase |
| Music playback / audio player | Not built | Not in spec — future |

---

### 📋 Recommended Fix Order (from audit)
1. Fix Editing Suite hub routing (quick — 5 line changes)
2. Fix Shop Digital Vinyl (remove fake cards, connect to DB)
3. Fix Shop Clothing (connect to DB)
4. Build artist music upload portal (`/dashboard/upload-music`)
5. Auth overhaul — email OTP
6. Connect Stripe, Resend, Google OAuth (when client accounts ready)
7. Update WhatsApp number in Footer

---

## Document 2: Client Feature Specification (WhatsApp Handover Tables)

> Gap analysis: checked every feature from the client's spec against the codebase.

---

### 1. PWA (App) Framework
| Feature | Status | Notes |
|---|---|---|
| manifest.json | ✅ Exists | Basic — has name, theme_color, standalone display |
| PWA icons (192px, 512px) | ❌ Missing | Only favicon.ico listed; needs proper icon set |
| Service worker | ❌ Missing | No service-worker.js or registration anywhere |
| Offline support | ❌ Missing | No caching strategy, no offline page |
| "Add to Home Screen" prompt | ❌ Missing | No install prompt logic |
| "Studio Live Feed" notification | ❌ Missing | No push notification system |

---

### 2. Digital Vinyl Vault (Cloud Music Library)
| Feature | Status | Notes |
|---|---|---|
| Vault concept described | ✅ Exists | Info pages reference "Vault access" (vinyl/Fans, vinyl/Products) |
| "My Collection" tab for purchased music | ❌ Missing | No user-facing library/collection page |
| Cloud-hosted music streaming | ❌ Missing | No audio streaming or playback |
| Master-quality WAV delivery | ❌ Missing | No file delivery system |

---

### 3. 3D Record Player UI
| Feature | Status | Notes |
|---|---|---|
| Three.js or CSS3 3D turntable | ❌ Missing | No Three.js dependency, no 3D UI |
| Spinning vinyl disc with album art | ❌ Missing | No music player of any kind |
| "Needle Drop" sound effect | ❌ Missing | — |
| "Virtual Liner Notes" pull-up | ❌ Missing | — |
| Lock Screen / Media Session API | ❌ Missing | No navigator.mediaSession usage |

---

### 4. Artist Mini-Platforms (Profiles)
| Feature | Status | Notes |
|---|---|---|
| Artist profile page | ✅ Exists | `ArtistProfile.tsx` — bio, genre, social links |
| Follow / unfollow button | ✅ Exists | Working with follower count |
| "In the Building Now" green light | ✅ Exists | `in_building` toggle on Profile, shown on Community/SocialFeed/ArtistProfile |
| SynergyMatch AI widget | ✅ Exists | `SynergyMatchWidget.tsx` — uses `synergy-match` edge function |
| Mini-Storefront (Digital Vinyls grid) | ❌ Missing | Profile has no storefront/product listing for the artist |
| Producer Beat Store / Leasing | ❌ Missing | Listed in spec but no purchase/lease UI. "Beat Leases" only text on Artists page |

---

### 5. Direct-to-Fan (D2C) Store
| Feature | Status | Notes |
|---|---|---|
| Stripe referenced in pages | ✅ Exists | Mentioned in Privacy, Terms, Finance, Earnings, mixtapes/Buy |
| Stripe Connect live payments | ❌ Missing | No Stripe SDK integration, no API keys, no checkout flow |
| Apple Pay / Google Pay | ❌ Missing | No payment request API |
| 85/10/5 split logic | ⚠️ Partial | Described on vinyl/Artists page, not functional |
| "Limited Pressing" copy-limit logic | ❌ Missing | Described in vinyl/Products info page only |
| "Studio Certified" badge | ❌ Missing | Referenced on shop/NFTs page text only |

---

### 6. "Build" Loyalty System
| Feature | Status | Notes |
|---|---|---|
| loyalty_points in DB | ✅ Exists | `profiles.loyalty_points` column |
| Build Points display on Dashboard | ✅ Exists | Shows points, tier (Bronze/Silver/Gold/Platinum) |
| Build Points on Profile page | ✅ Exists | Shows tier emoji + points |
| Admin can adjust points | ✅ Exists | `AdminMembers.tsx` has +/- point controls |
| Tiered discounts unlocked by points | ❌ Missing | Tiers display but no discount logic |
| Fan-to-artist "Point Tipping" | ❌ Missing | No tipping mechanism |
| "Billboard Status" (top earners featured) | ❌ Missing | No leaderboard or display sync |
| Auto 1 point per £1 spent | ❌ Missing | Only manual admin adjustment exists |

---

### 7. Physical-to-Digital Bridge
| Feature | Status | Notes |
|---|---|---|
| NFC Card info page | ✅ Exists | Described in vinyl/Products and vinyl/Fans |
| QR Postcard info page | ✅ Exists | Described in vinyl/Products and vinyl/Fans |
| USB Card info page | ✅ Exists | Described in vinyl/Products |
| Functional NFC tap-to-Vault | ❌ Missing | No NDEF/NFC write logic |
| QR code → unlock music logic | ❌ Missing | No redemption system |
| "Scratch-Off Code" minting | ❌ Missing | — |

---

### 8. Editing Room Services
| Feature | Status | Notes |
|---|---|---|
| Editing Suite hub page | ✅ Exists | `Editing.tsx` (but links broken — Issue 1) |
| Sub-pages (Core, Streaming, Voiceover, Platform, Rental) | ✅ Exists | Both `/editing/` and `/editing-suite/` directories exist |
| Audio Editing, QR Code, Video, Animation pages | ✅ Exists | In `/editing-suite/` directory |
| Quote Request form | ✅ Exists | `QuoteRequestModal.tsx` with Supabase insert |
| "1-Hour Flip" guarantee | ❌ Missing | Not referenced or tracked |

---

### 9. Collabo Post Board
| Feature | Status | Notes |
|---|---|---|
| Collabo Board (Community page) | ✅ Exists | `Community.tsx` — posts to `collabo_posts` table, 30-day expiry |
| 3 post types, genre filter | ✅ Exists | Working with Supabase |
| "In the Building Now" green light | ✅ Exists | Shows on post cards via `in_building` field |
| Admin moderation | ✅ Exists | `AdminCollabo.tsx` |

---

### 10. Other Specified Features
| Feature | Status | Notes |
|---|---|---|
| **Our Story timeline page** | ✅ Exists | `Story.tsx` — scrolling timeline with build phases |
| **Quote Request / POA form** | ✅ Exists | `QuoteRequestModal.tsx` — saves to `quote_requests` |
| **Events RSVP with capacity** | ✅ Exists | `Events.tsx` — RSVP button, `event_rsvps` table, shows count/capacity |
| **Admin Sign-In Sheet (printable)** | ✅ Exists | `AdminSignIn.tsx` — daily sheet with Print button |
| **Amenities section** | ✅ Exists | `AmenitiesSection.tsx` — no catering/vending ✅ |
| **Beat Academy page** | ✅ Exists | `Academy.tsx` — 4 courses, pricing, school/youth inquiry form |
| **Strategy AI Generator** | ✅ Exists | `Strategy.tsx` — uses `generate-strategy` edge function, PDF download |
| **Virtual Tour** | ⚠️ Partial | `Tour.tsx` exists but is static images with feature lists — **no 360°, no interactive hotspots, no hover equipment info** |
| **Equipment list** | ✅ Exists | `Equipment.tsx` — categorised gear list from Supabase |
| **Credits balance in user accounts** | ❌ Missing | No credits/balance system |
| **Dropbox auto-link for Dry Hire** | ❌ Missing | Only listed as a text service in editing/Core |
| **CRM personalised messaging** | ❌ Missing | No Mailchimp/HubSpot integration |
| **Social share buttons on Artist Profile** | ❌ Missing | Social links exist (to artist's profiles) but no "share this page" buttons |
| **Self-service QR Generator in Dashboard** | ❌ Missing | QR Code Creation is a service page (editing-suite/QR) — not a self-service tool for artists |
| **Merchandise shop (standard grid)** | ⚠️ Partial | `shop/Merch.tsx` likely exists in shop directory, but shop/Clothing is a placeholder (Issue 4) |

---

### 📊 DOCUMENT 2 SUMMARY

| Category | ✅ Exists | ⚠️ Partial | ❌ Missing |
|---|---|---|---|
| PWA Framework | 1 | 0 | 5 |
| Digital Vinyl Vault | 1 | 0 | 3 |
| 3D Record Player | 0 | 0 | 5 |
| Artist Profiles | 3 | 0 | 2 |
| D2C Store | 1 | 1 | 4 |
| Loyalty System | 4 | 0 | 4 |
| Physical-to-Digital | 3 | 0 | 3 |
| Editing Services | 4 | 0 | 1 |
| Collabo Board | 4 | 0 | 0 |
| Other Features | 8 | 2 | 4 |
| **TOTAL** | **29** | **3** | **31** |

---

## Document 3: WhatsApp Chats (3 chats reviewed)

> The client sent extensive tables (many repeats of Document 2), plus site feedback, pricing tables, equipment specs, and specs for **2 completely separate projects**.

---

### 🗂️ SEPARATE PROJECTS (NOT THIS APP)

The client discussed 2 additional projects in the chats. **These are NOT part of Fully Governed Studios** and are confirmed by the client as separate paid work:

| # | Project Name | What It Is | Budget |
|---|---|---|---|
| **Project 2** | FGM Vault Messenger™️ ("Echo-Beats") | A stealth encrypted messaging app disguised as a music player. Flutter + Rust. Steganography, burst-mode transmission, optical/acoustic sync. | £10,000 |
| **Project 3** | V-Proof Social Ledger | A gaming wager/esports betting platform with AI video verification, 80/20 escrow splits, KYC, and social challenge feeds. | £3,500 each (2 partners) |

> **Action:** None for now. These are future projects after this app is complete.

---

### 📋 NEW ITEMS FOR THIS APP (from Site Feedback chat)

These are **new things mentioned in the chats** that are NOT already on the TODO from Documents 1 or 2:

| # | Feature / Feedback | Source | Status in App |
|---|---|---|---|
| 1 | **Food delivery menu** — daily menu, delivery only, £12 per meal | Chat 3 line 106 | ❌ Not built — client idea, may need a dedicated page |
| 2 | **3D avatar/animation character per user profile** — "people should get their own avatar and animation character for their profile so we can make cartoons with them" | Chat 3 line 491 | ❌ Not built |
| 3 | **Booking availability display** — show what's booked vs available in real-time | Chat 3 line 6 | ⚠️ Partially exists — booking system works but may not visually show availability |
| 4 | **Booking confirmation emails** — to the person booking AND everyone involved | Chat 3 line 7 | ❌ Blocked on Resend API key |
| 5 | **Upcoming sessions in Dashboard** — "welcome back section should show upcoming sessions" | Chat 3 line 9 | ✅ Already exists in Dashboard |
| 6 | **Vehicle registration** — on the "Getting Here" page | Chat 3 line 12-13 | ⚠️ Need to verify — `vehicle_registrations` table exists in DB |
| 7 | **Social media links on profiles** | Chat 3 line 11 | ✅ Already exists on Profile page |
| 8 | **Shop visibility** — client asked if "coming soon" items should be hidden or shown | Chat 3 line 14 | ⚠️ Design decision needed from client |
| 9 | **360° camera photos for virtual tour** — client has 360 cam, wants proper room shots | Chat 3 lines 17, 261 | ❌ Tour is static images — needs 360° photos from client |
| 10 | **Detailed Editing Suite pricing** — extensive pricing tables for every sub-service | Chat 2 lines 172-231 | ⚠️ Partially on site — may need updating with exact figures |

---

### 💰 PRICING DATA (from Chat 2 — for reference, may need updating on site)

The client provided extensive pricing tables. These are for reference when building/updating service pages:

- **Recording Studio:** £15/hr min 4hrs, £40/4hrs, £20/hr dry hire, £150/day in-house, £200/day dry hire
- **Video Editing:** £20–£50/reel, £40–£70/hr, £150–£500/video project
- **Animation:** £15–£30/sec, £200–£800 simple, £1k–£5k+ complex
- **Online Campaigns:** £500–£2k setup, £800–£5k/month management
- **Marketing Materials:** £30–£100/design, £50–£300 print, £200–£1k+ branding
- **Radio:** £50–£100/hr, £200–£500/series
- **Voiceover:** £40–£70/hr, £150–£400/project
- **Audiobooks:** £80–£150/finished hour, £500–£2k/book
- **Room Rentals:** £15–£50/hr, £100–£350/day, £800–£1.2k/week, £2.5k–£4k/month
- **Content Creation areas:** Gaming, Modeling/Portfolio, Show Production, Podcasting

---

### 🔧 EQUIPMENT DATA (from Chat 2 — for reference)

The client provided a full equipment budget (£6k–£12k) with exact specs for:
- High-performance desktops (i9, 32GB RAM, RTX 3070/3080)
- Reference monitors (27" 4K IPS)
- Audio interfaces (Focusrite Scarlett / Universal Audio Apollo)
- Studio monitors, headphones, microphones
- External storage, NAS, UPS
- Software: Adobe CC, DaVinci Resolve, Blender, Pro Tools

> **Action:** Only relevant if Equipment page needs updating with actual gear specs.

---

### 📊 OVERALL STATUS ACROSS ALL DOCUMENTS

| Document | Items Found | ✅ Done | ⚠️ Partial | ❌ Missing |
|---|---|---|---|---|
| 1. Pre-Migration Audit | 5 issues | 0 | 0 | 5 |
| 2. Feature Specification | 63 features | 29 | 3 | 31 |
| 3. WhatsApp Chats | 10 new items | 2 | 4 | 4 |
| **TOTAL** | **78** | **31** | **7** | **40** |

> **Next Step:** Create the full implementation plan once all documents are reviewed.
