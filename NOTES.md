# NOTES — Fully Governed Site

Things Seb needs to provide before the site is fully production-ready.

---

## 1. Room Photos (Gallery modals)
**Where:** `/recording-radio/studio`, `/recording-radio/radio`, `/editing-suite/rental`
**What's needed:** Hi-res photos of each room for the "View Gallery" modal.
- Room 1B — Recording Studio (gold/black aesthetic, cloud ceiling)
- Room 2 — Content Creation Centre / Radio Room (green screen, lighting, camera)
- Multi-Use Room (editing suite / rental space)
**Format:** JPEG, min 1200×800px. 4–6 photos per room ideal.
**Current state:** Gallery modal shows a placeholder with slot count (6 photos). Just drop in the real images and update the `GalleryModal` component.

---

## 2. Marble Studio Labs 3D Room Files
**Where:** Same room pages — "View in 3D" button
**What's needed:** 3D model files from Marble Studio Labs for each room.
**Current state:** 3D button shows "3D view coming soon — files being prepared" message.
**When ready:** Integrate the files into a Three.js viewer component on each room page.

---

## 3. Stripe Secret Key
**Where:** Supabase Edge Function env vars → `create-checkout`
**What's needed:** Your Stripe Secret Key (`sk_live_...` for production, `sk_test_...` for testing)
**How to add:** Supabase Dashboard → Edge Functions → Environment Variables → Add `STRIPE_SECRET_KEY`
**Also needed:** `VITE_STRIPE_PUBLISHABLE_KEY` in `.env` for the frontend (publishable key `pk_...`)
**Current state:** Booking checkout and shop checkout are fully wired — payment flow will work the moment the keys are added.

---

## 4. Real Contact Information (Footer review)
**Current state:** Footer has `musicfullygoverned@gmail.com`, WhatsApp `+44 7506 224965`, and address `174–178 V22 Building, Unit 1B–1C, Lewisham`.
**Action needed:** Verify all details are correct and live before launch. Update in `src/components/Footer.tsx`.

---

## 5. Exclusive Vault Tracks
**Where:** `/dashboard/my-vault` → Exclusive Vault tab
**What's needed:** Artists (via the upload portal at `/dashboard/upload-music`) need to mark tracks as `is_exclusive = true` and set a `tier_required` level.
**Migration:** `supabase/migrations/20260319000002_music_tracks_vault.sql` — run this in Supabase dashboard.

---

## 6. Loyalty Points Table
**Where:** `/dashboard/build-points`
**Migration:** `supabase/migrations/20260319000001_fg_loyalty_points.sql` — run this in Supabase dashboard before the points system will work.

---

## 7. Collabo Posts — role field
The `collabo_posts` table may need a `role` column added if not present. Check the table schema and add `role text` if missing, for the Collabo Board role filter to work.

---

## 8. 360-Degree Room Images
**Status:** Do not build yet — integrate after main site is complete.
**What's needed:** Equirectangular 360° images of each room.
