# Voyage India — Master Implementation Plan

> **Context file:** `.agents/rules/vault_context.md` — read this first before any execution session.
> **Vault source:** `D:\Applications\memory\voyage-india-vault`
> **Build window:** 6–8 hours, solo developer, hackathon scope.

---

## Milestone Overview

| # | Milestone | Deliverable | Prerequisite |
|---|---|---|---|
| M1 | Project Scaffolding & Config | Running Vite dev server + Firebase init | External accounts ready |
| M2 | Database Schemas & Seed Data | Firestore seeded + security rules deployed | M1 |
| M3 | Core Cloud Functions & Backend Logic | `createRazorpayOrder` + `verifyPayment` callable + pricing util | M2 |
| M4 | Frontend UI Components & Pages | All 5 pages + all 8 components wired to Firestore | M1, M2, M3 |
| M5 | E2E Demo Validation & Polish | Full demo path passes end-to-end; deployed to Firebase Hosting | M4 |

---

## Pre-Build Checklist (do before any milestone clock starts)

> [!important] These require browser/console actions — complete them manually before running any code.

- [ ] Create **Firebase project** → enable Firestore (start in test mode)
- [ ] Enable **Firebase Auth** → Google provider + Phone provider
- [ ] Add **test phone number** under Auth → Sign-in method → Phone → Phone numbers for testing (e.g. `+91 9999999999` / OTP `123456`)
- [ ] Create **Razorpay account** → copy Test Mode **Key ID** + **Key Secret**
- [ ] Enable **Google Maps JavaScript API** in Google Cloud Console → generate + domain-restrict API key
- [ ] Have all six `.env` values ready (see `vault_context.md §4`)

---

## Milestone 1 — Project Scaffolding & Config

**Goal:** A running Vite + React dev server with Firebase initialized, all dependencies installed, routing skeleton, and environment wired up. No UI, no data, no logic — just the scaffolding runs clean.

### Tasks

#### 1.1 Scaffold the Vite project
```bash
npm create vite@latest . -- --template react
```
- Initialize in the project root (`D:\PROJECTS\Voyage India`)

#### 1.2 Install all dependencies
```bash
npm install firebase @react-google-maps/api react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

#### 1.3 Configure Tailwind CSS
- Add `@tailwindcss/vite` plugin to `vite.config.js`
- Add `@import "tailwindcss"` to `src/index.css`
- Add custom design tokens to `tailwind.config.js`:
  - Colors: `ink-900`, `marigold-500`, `monsoon-600`, `stamp-600`, `paper-50`, `slate-500`, `line-200` (exact hex values from `vault_context.md §10`)
  - Font families: `Space Grotesk`, `IBM Plex Sans`, `IBM Plex Mono` (loaded from Google Fonts in `index.html`)

#### 1.4 Add Google Fonts to `index.html`
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono&display=swap" rel="stylesheet">
```

#### 1.5 Create `.env` file
- Add all six `VITE_` prefixed environment variables (leave values blank as placeholders for now; fill from pre-build checklist)

#### 1.6 Initialize Firebase
```bash
firebase init
```
- Select: **Hosting**, **Functions**, **Firestore**
- Hosting public dir: `dist`
- Functions runtime: **Node.js 20**, language: **JavaScript**

#### 1.7 Install Cloud Functions dependencies
```bash
cd functions && npm install razorpay
```
- Create `functions/.env` with `RAZORPAY_KEY_SECRET=` placeholder

#### 1.8 Set up `src/lib/firebase.js`
- Initialize Firebase app from `import.meta.env.VITE_*` vars
- Export: `auth`, `db` (Firestore), `functions` app

#### 1.9 Set up React Router skeleton in `App.jsx`
- `BrowserRouter` wrapping 5 routes:
  - `/` → `Homepage`
  - `/package/:packageId` → `PackageDetails`
  - `/checkout` → `Checkout`
  - `/confirmation/:bookingId` → `Confirmation`
  - `/my-trips` → `MyTrips`
- Create empty placeholder page components for all 5 pages

#### 1.10 Set up Context providers
- `AuthContext.jsx` — wraps app, provides `currentUser`, `phoneVerified` state; listens to `onAuthStateChanged`
- `BookingContext.jsx` — wraps app, provides booking state (selected package, date, travelers, priceBreakdown) via `useReducer`

### Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] All 5 routes render placeholder text
- [ ] Firebase config connects (no console auth errors)
- [ ] Tailwind design tokens resolve (`text-ink-900`, `bg-paper-50`, etc.)

---

## Milestone 2 — Database Schemas & Seed Data

**Goal:** Firestore has real seed data for 2–3 packages, security rules are deployed, and the app can read from Firestore at the package list endpoint.

### Tasks

#### 2.1 Write `firestore.rules`
- Copy the exact baseline rules from `vault_context.md §7`
- Deploy: `firebase deploy --only firestore:rules`

#### 2.2 Seed Package 1 — Tokyo & Kyoto Explorer (5D/4N, Japan)
Manually create document in Firebase Console or via a one-time seed script at `src/lib/seed.js`:
- `packageId`: `pkg_tokyo_kyoto_5d`
- All fields per the schema in `vault_context.md §5.1`
- 5-day itinerary with `mapLocations` (lat/lng predefined — no geocoding)
- 3 available dates: 1 available, 1 limited, 1 sold_out

#### 2.3 Seed Package 2 — Paris City Break (4D/3N, France)
- `packageId`: `pkg_paris_4d`
- Similar structure; at least 2 available dates

#### 2.4 Seed Package 3 *(🟡 stretch — only if MVP is done early)*
- A third destination (e.g. Bali, Dubai, or Singapore)

#### 2.5 Seed Promo Code
- Collection: `promoCodes`, document ID: `VOYAGE10`
- `{ "code": "VOYAGE10", "discountPercent": 10, "active": true }`

#### 2.6 Verify Firestore reads from the app
- Temporary debug call: `getDocs(collection(db, 'packages'))` → `console.log`
- Confirm security rules allow unauthenticated reads on `/packages` and `/promoCodes`
- Remove debug code after verification

### Acceptance Criteria
- [ ] `/packages` collection has ≥ 2 documents with correct schema shape
- [ ] `/promoCodes/VOYAGE10` exists
- [ ] App can read package list from Firestore without auth
- [ ] `firestore.rules` deployed: client writes to packages/promoCodes blocked

---

## Milestone 3 — Core Cloud Functions & Backend Logic

**Goal:** Both Cloud Functions are deployed and callable; the `pricing.js` pure function is implemented and verified.

### Tasks

#### 3.1 Implement `src/lib/pricing.js`
Pure function — no Firebase dependency:
```js
export function calculatePrice({ basePriceAdult, childPricePercent, infantFee,
                                  adults, children, infants, promoDiscountPct }) {
  const adultCharge  = adults   * basePriceAdult;
  const childCharge  = children * basePriceAdult * (childPricePercent / 100);
  const infantCharge = infants  * infantFee;
  const subtotal     = adultCharge + childCharge + infantCharge;
  const discount     = promoDiscountPct ? Math.round(subtotal * promoDiscountPct / 100) : 0;
  return { adultCharge, childCharge, infantCharge, subtotal, discount, total: subtotal - discount };
}
```

#### 3.2 Implement `functions/index.js` — `createRazorpayOrder`
- HTTPS callable
- Input: `{ bookingId }`
- Server reads booking doc → gets `priceBreakdown.total` (never trusts client-sent amount)
- Creates Razorpay order: `razorpay.orders.create({ amount: total * 100, currency: 'INR', receipt: bookingId })`
- Returns `{ orderId: order.id }`

#### 3.3 Implement `functions/index.js` — `verifyPayment`
- HTTPS callable
- Input: `{ razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId }`
- HMAC-SHA256: verify `razorpay_order_id + "|" + razorpay_payment_id` against `RAZORPAY_KEY_SECRET`
- If valid → Admin SDK updates booking: `status: "confirmed"`, `confirmedAt`, `payment.razorpayPaymentId`
- If invalid → throw `HttpsError('unauthenticated', 'Invalid signature')`

#### 3.4 Deploy Cloud Functions
```bash
firebase deploy --only functions
```
- Verify both functions appear in Firebase Console

#### 3.5 Implement `src/lib/bookingId.js`
```js
export function generateBookingId(destinationCode) {
  return `VI-${destinationCode.toUpperCase()}-${Date.now().toString().slice(-5)}`;
}
```

### Acceptance Criteria
- [ ] `calculatePrice()` returns correct values (manual browser console test)
- [ ] `createRazorpayOrder` deployed and returns a valid Razorpay `order_id`
- [ ] `verifyPayment` deployed and correctly rejects an invalid signature
- [ ] `generateBookingId('JP')` returns `VI-JP-XXXXX` format

---

## Milestone 4 — Frontend UI Components & Pages

**Goal:** All 8 components and 5 pages built, wired to real Firestore data, full user flow navigable in browser.

> Build order: Phase A components first (no page dependency), then Phase B pages.

### Phase A: Shared Components

#### 4.A.1 `PackageCard.jsx`
- Props: `{ package }`
- Ticket-stub card style (1px `line-200` border, 4px radius, dashed perforation divider)
- "Land-only" badge in `monsoon-600`; View Package button in `marigold-500`
- Navigates to `/package/:packageId`

#### 4.A.2 `DateSelector.jsx`
- Props: `{ availableDates, selectedDate, onSelect }`
- Color-coded chips: available (green), limited (amber), sold_out (red + `pointer-events-none`)

#### 4.A.3 `TravelerSelector.jsx`
- Stepper rows: Adults (min 1), Children 2–11, Infants
- Live price triggers `calculatePrice()` → updates BookingContext

#### 4.A.4 `PriceSummary.jsx`
- Receipt layout in `IBM Plex Mono`, dashed perforation before total
- Total in `marigold-500` bold; promo code line shown only when discount > 0

#### 4.A.5 `ItineraryDay.jsx`
- Accordion: day number in mono (left of perforation), details on right
- Click: expand + emit `onActivate(dayNumber)` to drive map filter

#### 4.A.6 `PackageMap.jsx`
- `@react-google-maps/api` — all markers on load, `fitBounds`
- `activeDayNumber` prop: re-filter markers + InfoWindow + `fitBounds`

#### 4.A.7 `AgreementsChecklist.jsx`
- 4 independent checkbox rows (not a single grouped checkbox)
- Emits `onChange(allChecked: boolean)`

#### 4.A.8 `AuthModal.jsx`
- Two-step modal: Step 1 = Google Sign-In, Step 2 = Phone/OTP
- Two ticket-stub dots as progress indicator
- 6-box mono OTP input with auto-advance
- Uses Firebase test phone number

### Phase B: Pages

#### 4.B.1 `Homepage.jsx`
- Reads packages from Firestore on mount
- Hero slider, category rail (scrollable chips), 3-up package card grid
- Client-side search filter (name/country)

#### 4.B.2 `PackageDetails.jsx`
- Reads single package doc by URL param
- Gallery slider + land-only banner (always visible, directly under title)
- Two-column layout: itinerary accordion (left) + sticky booking panel (right)
- Day click syncs `activeDayNumber` → `PackageMap`
- Book Now gating logic: → AuthModal if not signed in or phone unverified → `/checkout` if verified

#### 4.B.3 `Checkout.jsx`
- Primary traveler form (name, age, email pre-filled, phone pre-filled + read-only, dietary)
- `AgreementsChecklist` + disabled Pay Now until all checked
- On submit: create `pending` booking in Firestore → call `createRazorpayOrder` → open Razorpay widget → on success call `verifyPayment` → navigate to `/confirmation/:bookingId`
- On failure/dismiss: show retry option; stay on checkout page

#### 4.B.4 `Confirmation.jsx`
- Reads booking doc by param; full ticket-stub layout
- Booking ID in large mono type, perforation, trip details, status badge

#### 4.B.5 `MyTrips.jsx`
- Auth-gated (redirect if not signed in)
- Queries bookings by `uid == currentUser.uid`
- One ticket-stub card per booking with status badge + View Itinerary button

### Acceptance Criteria
- [ ] Homepage loads package cards from Firestore; search filters work
- [ ] Package Details: itinerary accordion, map markers, date/traveler selectors all functional
- [ ] Day-click in itinerary filters map markers correctly
- [ ] Sold-out dates unselectable
- [ ] Adults cannot go below 1; price updates live
- [ ] Book Now → AuthModal if not verified
- [ ] Google Sign-In + Phone OTP (test number) work
- [ ] Checkout: Pay Now disabled until all 4 agreements checked
- [ ] Razorpay Test Checkout completes; booking confirmed in Firestore via Cloud Function
- [ ] Confirmation screen shows ticket-stub layout with booking ID
- [ ] My Trips shows confirmed booking card

---

## Milestone 5 — E2E Demo Validation & Polish

**Goal:** Full 11-step demo script passes end-to-end; app deployed to Firebase Hosting; design tokens consistently applied.

### Tasks

#### 5.1 Full demo script run (twice minimum)
```
1.  Homepage → search "Japan"
2.  Open Tokyo & Kyoto package → show gallery
3.  Click Day 2 → map highlights that day's markers
4.  Select an available date
5.  Set 2 adults, 1 child → see live price update
6.  Apply VOYAGE10 → see discount applied   (🟡 skip if time-constrained)
7.  Book Now → Google Sign-in → +91 9999999999 / OTP 123456 → verify
8.  Enter traveler details → accept all 4 agreements
9.  Razorpay Test Checkout → complete payment
10. Confirmation screen shows booking ID (VI-JP-XXXXX)
11. My Trips → confirmed trip card
```

#### 5.2 Breakage priority order
1. Phone OTP flow
2. Razorpay payment + Cloud Function verification
3. Firestore security rules blocking checkout writes
4. Map markers / `fitBounds`
5. Sold-out date blocking
6. Live pricing
7. Confirmation screen data
8. My Trips query

#### 5.3 Design token audit
- All primary text: `ink-900` (`#1B2A4A`)
- All CTAs: `marigold-500` (`#F2A93B`)
- Confirmed/available: `monsoon-600` (`#1F7A6C`)
- Errors/sold-out: `stamp-600` (`#C0392B`)
- Prices/IDs/dates: `IBM Plex Mono`
- Headings: `Space Grotesk`
- No heavy shadows; 4px radius only; dashed perforation inside cards

#### 5.4 Responsive check
- 1200px: 3-up grid, two-column details, sticky booking panel
- 768px: 2-up grid, booking panel below itinerary
- 375px: 1-up grid, sticky bottom price bar, full-width forms

#### 5.5 Tighten Firestore rules (before deploy)
- Apply production rules from `vault_context.md §7`
- Verify client cannot set `status: "confirmed"` directly
- `firebase deploy --only firestore:rules`

#### 5.6 Build + deploy
```bash
npm run build
firebase deploy
```
- Walk demo script once more on the live deployed URL

#### 5.7 Land-only disclaimer audit
- Disclaimer banner visible on Package Details (under title, not buried)
- "Land-only" badge on every package card

### Stretch Tasks (🟡 — only if all above complete)
- [ ] Promo code `VOYAGE10` in Checkout
- [ ] Route line connecting map markers
- [ ] Trip countdown on My Trips
- [ ] Arrival flight info field in Checkout
- [ ] Third seed package

### Acceptance Criteria
- [ ] Full 11-step demo script completes without error on deployed Firebase Hosting URL
- [ ] Firestore shows `status: "confirmed"` after payment
- [ ] Client cannot set `status: "confirmed"` (rules block it)
- [ ] Land-only disclaimer always visible; badge on every package card
- [ ] OTP demo works with test number (no live SMS dependency)
- [ ] All design tokens consistent across all 5 screens
- [ ] Responsive at 375 / 768 / 1200px

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Phone OTP — live SMS not delivered | High | Always use Firebase test phone number; set this up in Pre-Build |
| Razorpay signature verification fails | Medium | HMAC string format: `orderId|paymentId` hashed with secret |
| Google Maps API key unauthorized | Medium | Enable billing on GCP project; restrict key to localhost + hosting domain |
| Firestore rules too strict in dev | Low | Keep test mode during M1–M3; apply real rules in M5.5 |
| Cloud Functions over time budget | Medium | Build in M3 early — highest-risk integration |

---

## Definition of Done

> A user can browse → open a package → explore itinerary + map → pick a date → set travelers → see live pricing → sign in with Google → verify phone via OTP → fill traveler details → accept agreements → pay via Razorpay test mode → get a confirmed booking with an ID → see it in My Trips.

*(Source: AI-Guardrails §7 + PRD §14)*
