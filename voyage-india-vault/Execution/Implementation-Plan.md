---
title: Implementation Plan
type: plan
tags: [voyage-india, execution, build-order]
---

# Voyage India — Implementation Plan

⬅ [[Home]] · Related: [[PRD]] · [[TRD]] · [[User-Flow]] · [[AI-Guardrails]]

---

## 1. Pre-Build Setup
*(do before the clock starts, ~20–30 min)*

- [ ] Create Firebase project → enable Authentication (Google + Phone providers)
- [ ] Add a Firebase test phone number + fixed OTP under Authentication → Sign-in method → Phone → Phone numbers for testing
- [ ] Create Firestore database (test mode initially, tighten rules later)
- [ ] Create Razorpay account → grab **Test Mode** Key ID + Secret
- [ ] Enable Google Maps JavaScript API in Google Cloud Console, generate + restrict API key
- [ ] `npm create vite@latest voyage-india -- --template react`
- [ ] Install deps: `firebase`, `@react-google-maps/api`, `tailwindcss`, `razorpay` (for Cloud Function), `react-router-dom`
- [ ] `firebase init` → Hosting, Functions, Firestore
- [ ] Seed 2 package documents in Firestore manually (Tokyo/Kyoto + one more) — enough for the demo, expand later if time allows

## 2. Project Structure

```
voyage-india/
├── src/
│   ├── components/
│   │   ├── PackageCard.jsx
│   │   ├── ItineraryDay.jsx
│   │   ├── PackageMap.jsx
│   │   ├── TravelerSelector.jsx
│   │   ├── PriceSummary.jsx
│   │   ├── DateSelector.jsx
│   │   ├── AuthModal.jsx
│   │   └── AgreementsChecklist.jsx
│   ├── pages/
│   │   ├── Homepage.jsx
│   │   ├── PackageDetails.jsx
│   │   ├── Checkout.jsx
│   │   ├── Confirmation.jsx
│   │   └── MyTrips.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── BookingContext.jsx
│   ├── lib/
│   │   ├── firebase.js
│   │   └── pricing.js
│   └── App.jsx
├── functions/
│   ├── index.js          # createRazorpayOrder, verifyPayment
│   └── .env               # RAZORPAY_KEY_SECRET
└── firestore.rules
```

> [!warning] Don't add extra layers
> No `services/`, `repositories/`, or extra hooks beyond this list unless a 🟢 [[PRD]] requirement needs it — see [[AI-Guardrails#5. Anti-Overthinking Rules]].

## 3. Hour-by-Hour Plan
*(8-hour budget)*

### Hour 1 — Package Discovery (Priority 1)
- Firestore package seed data finalized (2–4 packages)
- Homepage: nav, hero slider, package card grid, basic search by name/destination
- Routing set up (`react-router-dom`)

### Hour 2–3 — Package Experience (Priority 2)
- Package Details page: gallery, description, inclusions/exclusions, land-only banner
- Itinerary accordion rendering from `package.itinerary[]`
- Google Map component: render all markers, `fitBounds`, day-click filters markers + opens InfoWindow
- Date selector with available/limited/sold-out states

**Checkpoint:** if running behind, cut the route-line-between-markers stretch item and multi-day filter animation — keep marker highlight functional only.

### Hour 4 — Booking Logic (Priority 3)
- Traveler selector (stepper component, min 1 adult enforced)
- `lib/pricing.js`: pure function computing subtotal/discount/total
- Promo code field wired to `promoCodes` collection lookup
- Sticky price summary panel

### Hour 5 — Authentication (Priority 4)
- Firebase Auth Google popup sign-in
- Phone OTP flow using the **test number** — build against it directly, don't leave OTP for last
- Auth modal gating: Book Now → check auth → check phone verified → proceed

### Hour 6 — Payment (Priority 5)
- Cloud Function `createRazorpayOrder` (reads booking total server-side)
- Cloud Function `verifyPayment` (HMAC signature check)
- Checkout page: traveler details form, dietary preference, agreements checklist
- Razorpay Checkout widget integration, success/failure/cancel handling
- Confirmation screen with generated booking ID

### Hour 7 — Post-Booking (Priority 6)
- My Trips dashboard reading bookings by `uid`
- Booking card with status badge
- (If time remains) trip countdown, arrival flight optional form

### Hour 8 — Buffer, Deploy, Demo Prep
- `firebase deploy`
- Walk the full demo script end-to-end at least twice
- Fix whatever breaks first — prioritize the payment and OTP steps since those are the highest-risk integrations

Full requirement priorities: [[PRD#6. Functional Requirements]].

## 4. Cut List
*(in order, if time runs out)*

1. Additional traveler detail rows beyond the primary traveler
2. Arrival flight info field
3. Trip countdown on My Trips
4. Route line on map, marker animation polish
5. Filters beyond basic search (budget/duration/theme)
6. Second/third seed package (ship with 2 packages minimum)

> [!danger] Never cut
> Phone OTP gating, server-side payment verification, sold-out date blocking, land-only disclaimer visibility — these are the [[PRD#12. Validation Rules|PRD's explicit validation rules]] and the parts of the demo that prove the product idea.

## 5. Demo Script
*(rehearse this exact path)*

1. Homepage → search "Japan"
2. Open Tokyo & Kyoto package → show gallery
3. Click Day 2 in itinerary → map highlights that day's markers
4. Select an available date
5. Set 2 adults, 1 child → show live price update
6. Apply `VOYAGE10` → show discount applied
7. Book Now → Google sign-in → phone OTP (test number) → verify
8. Enter traveler details → accept agreements
9. Razorpay Test Checkout → complete test payment
10. Confirmation screen shows booking ID
11. Open My Trips → show the confirmed trip

This mirrors the flow diagram in [[User-Flow#1. Primary Flow (Demo Path)]].

## 6. Risk Notes

- **Highest-risk items, build these first once core pages exist:** phone OTP + Razorpay, since they're the two integrations most likely to eat unexpected time. Don't leave them for hour 7.
- **Google Maps billing:** ensure the API key has a quota/budget alert set; the JS API requires billing enabled on the Google Cloud project even within free tier.
- **Firestore rules:** keep in test mode while building, switch to the rules in [[Backend-Schema#6. Firestore Security Rules]] before the demo so booking writes can't be forged client-side.

---

## Related Notes
- [[Home]]
- [[PRD]] — priorities behind this build order
- [[TRD]] — the stack and integrations this plan executes
- [[User-Flow]] — the flow the demo script walks
- [[Backend-Schema]] — schema and rules referenced in setup and risk notes
- [[AI-Guardrails]] — how to handle time pressure and ambiguity while executing this plan
