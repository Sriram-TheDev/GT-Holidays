---
title: Product Requirements Document
type: prd
tags: [voyage-india, product, scope]
---

# Voyage India — Product Requirements Document (Hackathon Build)

**Version:** 1.0 (Hackathon-scoped) · **Build window:** 6–8 hours, solo developer

> [!info] Scope tags used throughout this vault
> 🟢 **MVP** — must work for the demo · 🟡 **Stretch** — only if MVP is done early · ⚪ **Future** — explicitly out of scope

⬅ [[Home]] · Related: [[TRD]] · [[Backend-Schema]] · [[UI-Design-Spec]] · [[Implementation-Plan]] · [[AI-Guardrails]]

---

## 1. One-Line Description
Voyage India lets Indian travelers discover, explore, and book transparent international **land-only** holiday packages — with interactive itinerary maps, dynamic INR pricing, and Razorpay test-mode payments.

## 2. Problem Statement
Booking an international package today means chasing agents for prices, waiting on itinerary confirmation, and getting unclear inclusions/exclusions. Voyage India replaces that with a single self-serve flow: browse → understand → price → book.

## 3. Land-Only Business Model
Voyage India covers **destination-side services only**. This must be visible throughout the app:

> *"Flights and visas are not included. The package begins when the traveler arrives at the destination airport."*

| Included | Excluded |
|---|---|
| Hotels, airport pickup/drop, local transport | International flights |
| Sightseeing + listed entry tickets | Visa charges, passport services |
| Tour guide / local coordinator | Travel insurance (unless stated) |
| Meals listed in the package | Personal shopping, unlisted activities |

See visual treatment of the disclaimer in [[UI-Design-Spec#3. Screen-by-Screen Spec]].

## 4. Target Users
Indian travelers who want pre-planned international holidays, transparent INR pricing, and plan to arrange their own flights.

## 5. User Roles
- **Visitor** — browse, search, view itinerary/map, see pricing. Cannot book.
- **Verified User** — signed in via Google + phone OTP verified. Can complete checkout and payment.
- **Admin** — 🟡 not built; package data is seeded directly into Firestore. See [[Backend-Schema]].

## 6. Functional Requirements

### 6.1 Homepage 🟢
Logo/nav, hero slider, search bar, package cards, login button, My Trips link. Card shows: image, name, country, duration, theme, rating, starting price, "Land-only" badge, View Package button.

### 6.2 Search & Filter
- 🟢 Search by destination/package name
- 🟡 Filters: budget, duration, theme
- ⚪ AI recommendations

### 6.3 Package Details Page 🟢
Title, country, duration, rating, starting price, land-only notice, image gallery, description, available dates, day-wise itinerary, inclusions/exclusions, Google Map, traveler selector, price summary, Book Now.

### 6.4 Image Gallery 🟢
Simple slider/thumbnails. No video.

### 6.5 Day-Wise Itinerary 🟢
Each day: day number, title, city, activities, transport, hotel, meals, notes, map locations. Exact field shape: [[Backend-Schema#2. packages/{packageId}]].

### 6.6 Interactive Google Map 🟢
- All markers shown on load, numbered by day, `fitBounds` applied.
- Clicking a day filters/highlights that day's markers + info window.
- Clicking a marker activates the corresponding day.
- 🟡 Route line connecting markers.
- ⚪ Real directions, live traffic, navigation.

### 6.7 Travel Date Selection 🟢
Predefined dates with status: Available / Limited Seats / Sold Out. Sold-out dates are unselectable. Selected date shown in booking summary.

### 6.8 Traveler Selector 🟢
Adults (100% price, min 1 required), Children 2–11 (75% price), Infants (fixed/free). Live total update.

### 6.9 Dynamic Price Calculation 🟢
`(adults × base) + (children × 0.75 × base) + (infants × infantFee) − discount = total`, shown as a live breakdown, always in ₹.

### 6.10 Promo Code 🟡
One working code: `VOYAGE10` → 10% off. Invalid code shows inline error.

## 7. Authentication & Verification

### 7.1 Google Sign-In 🟢
Firebase Auth Google provider. Captures name, email, photo, UID.

### 7.2 Indian Mobile OTP 🟢
Firebase Auth Phone provider, `+91` enforced. **Use a Firebase test phone number + fixed test OTP** for the entire build — do not depend on live SMS delivery during a demo.
Booking (payment step) is blocked until phone is verified; browsing is not.

## 8. Checkout

### 8.1 Traveler Details 🟢
Primary traveler: name, age, email, verified phone, dietary preference.
Additional travelers: 🟡 (can default to primary traveler's info if time-constrained).
**Never collect passport/Aadhaar/visa documents.**

### 8.2 Arrival Flight Info 🟡
Optional field, editable later from My Trips.

### 8.3 Agreements 🟢
Checkbox block: flights/visa not included, passport responsibility, itinerary reviewed, cancellation terms. Required before payment.

## 9. Payment — Razorpay Test Mode 🟢
1. Review summary → 2. Backend creates order (Cloud Function) → 3. Razorpay Checkout opens → 4. Test payment completes → 5. Backend verifies signature → 6. Booking marked `confirmed` → 7. Booking ID generated → 8. Appears in My Trips.

Rules: never mark a booking confirmed before server-side verification; never expose the Razorpay key secret in the browser; failed payment → retry option; cancelled → return to checkout. Implementation: [[TRD#4. Third-Party Integrations]].

## 10. Booking Confirmation 🟢
Success message, booking ID (e.g. `VI-JP-10245`), payment ID, package name, destination, date, traveler count, amount paid, status, View My Trips button.

## 11. My Trips Dashboard 🟢
Package image, name, destination, booking ID, date, traveler count, amount paid, status.
🟡 Trip countdown, arrival flight form, view map/itinerary again.
⚪ Cancellation/refund workflow.

## 12. Validation Rules (must enforce)
- Must sign in before booking; must verify phone before payment.
- Phone must be valid Indian number with `+91`.
- At least 1 adult; traveler counts never negative.
- Sold-out dates blocked from selection.
- Travel date + required agreements mandatory before payment.
- Booking only confirmed after verified payment.

## 13. Out of Scope ⚪

> [!danger] Explicitly out of scope — do not build
> Multi-country booking, real hotel inventory, seat locking, flight booking, visa processing, vendor portal, full admin dashboard, refunds, reviews, email/WhatsApp notifications, PDF tickets, QR check-in, AI recommendations, currency conversion, production fraud detection.

## 14. Success Criteria
App is "done" when a user can: browse → open a package → explore itinerary + map → pick a date → set travelers → see live pricing → sign in with Google → verify phone via OTP → fill traveler details → accept agreements → pay via Razorpay test mode → get a confirmed booking with an ID → see it in My Trips. This exact path is the hackathon demo script — see [[Implementation-Plan#5. Demo Script]].

---

## Related Notes
- [[Home]]
- [[TRD]] — tech stack powering these requirements
- [[Backend-Schema]] — data model for bookings/packages/promo codes
- [[UI-Design-Spec]] — visual spec per screen
- [[User-Flow]] — screen sequence and gating rules
- [[Implementation-Plan]] — build order and cut list
- [[AI-Guardrails]] — rules for AI agents working from this doc
