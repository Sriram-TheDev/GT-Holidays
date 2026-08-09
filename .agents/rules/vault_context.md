# Voyage India — Workspace Rules & Vault Context

> **Source vault:** `D:\Applications\memory\voyage-india-vault`
> This file is the permanent AI-agent context for the Voyage India project.
> It is distilled from all seven vault notes and must be consulted before any code change, architecture decision, or design choice.

---

## 1. One-Line Product Description

Voyage India lets **Indian travelers** discover, explore, and book transparent **land-only** international holiday packages — with interactive itinerary maps, dynamic INR pricing, and Razorpay test-mode payments.

- **Build window:** 6–8 hours, solo developer, hackathon scope.
- **Demo success criteria:** browse → package details → itinerary/map → date → travelers → sign in (Google) → OTP → traveler form → agreements → Razorpay test pay → confirmation → My Trips. That full path must work.

---

## 2. Tech Stack (FIXED — do not propose alternatives)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React 18 (Vite)** | `npm create vite@latest` |
| Styling | **Tailwind CSS** | Utility classes only — design tokens in §5 |
| Routing | **react-router-dom** | SPA, no SSR |
| Auth | **Firebase Auth** — Google + Phone providers | Phone uses test number (§8) |
| Database | **Cloud Firestore** | Document-model; no subcollections; no extra normalization |
| Backend logic | **Firebase Cloud Functions (Node.js)** | Only `createRazorpayOrder` + `verifyPayment` |
| Payments | **Razorpay Checkout (Test Mode)** | Client SDK + server-side HMAC verification |
| Maps | **Google Maps JS API** via `@react-google-maps/api` | Markers, `fitBounds`, InfoWindow |
| Hosting | **Firebase Hosting** | Single `firebase deploy` |
| State | **React Context + `useReducer`** | No Redux |

> ⛔ **Never propose:** Next.js, Supabase, Stripe, Redux, server-side rendering, separate backend server, PostgreSQL, or any alternative to the above.

---

## 3. Project Directory Structure

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
│   └── .env              # RAZORPAY_KEY_SECRET (server-only, never shipped)
└── firestore.rules
```

> ⛔ **Do not add:** `services/`, `repositories/`, extra hooks folders, or extra abstraction layers beyond this list.

---

## 4. Environment Variables

### Client (`.env`, `VITE_` prefix, safe to expose)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_RAZORPAY_KEY_ID=        # public key ID only
```

### Server (`functions/.env`, NEVER in client bundle)
```
RAZORPAY_KEY_SECRET=
```

---

## 5. Firestore Data Models

### 5.1 `packages/{packageId}`
```json
{
  "packageId": "pkg_tokyo_kyoto_5d",
  "title": "Tokyo and Kyoto Explorer",
  "country": "Japan",
  "destinationCities": ["Tokyo", "Kyoto"],
  "durationDays": 5,
  "durationNights": 4,
  "theme": "Culture",
  "rating": 4.8,
  "landOnly": true,
  "basePriceAdult": 45000,
  "childPricePercent": 75,
  "infantFee": 2000,
  "images": ["https://..."],
  "description": "...",
  "inclusions": ["Hotel accommodation", "Airport pickup/drop", "..."],
  "exclusions": ["International flights", "Visa charges", "..."],
  "availableDates": [
    { "date": "2026-09-10", "status": "available" },
    { "date": "2026-09-17", "status": "limited" },
    { "date": "2026-09-24", "status": "sold_out" }
  ],
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Arrival in Tokyo",
      "city": "Tokyo",
      "activities": ["Airport pickup", "Hotel check-in"],
      "transport": "Private transfer",
      "hotel": "Shinjuku City Hotel",
      "meals": "Dinner",
      "notes": "Meet guide at arrivals gate, Exit 3.",
      "mapLocations": [
        { "name": "Narita Airport", "lat": 35.7720, "lng": 140.3929, "description": "Arrival point" }
      ]
    }
  ],
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### 5.2 `users/{uid}`
```json
{
  "uid": "firebase_auth_uid",
  "name": "Ananya Sharma",
  "email": "ananya@example.com",
  "photoURL": "https://...",
  "phone": "+919999999999",
  "phoneVerified": true,
  "createdAt": "2026-08-01T00:00:00Z"
}
```

### 5.3 `bookings/{bookingId}`

Booking ID format: `VI-JP-10245` (prefix + destination code + random suffix).

```json
{
  "bookingId": "VI-JP-10245",
  "uid": "firebase_auth_uid",
  "packageId": "pkg_tokyo_kyoto_5d",
  "travelDate": "2026-09-10",
  "travelers": { "adults": 2, "children": 1, "infants": 0 },
  "travelerDetails": [
    { "name": "Ananya Sharma", "age": 32, "category": "adult", "dietary": "vegetarian" }
  ],
  "primaryContact": { "email": "ananya@example.com", "phone": "+919999999999" },
  "arrivalFlight": { "flightNumber": null, "airport": null, "arrivalDate": null, "arrivalTime": null },
  "priceBreakdown": {
    "adultCharge": 90000,
    "childCharge": 33750,
    "infantCharge": 0,
    "subtotal": 123750,
    "promoCode": "VOYAGE10",
    "discount": 12375,
    "total": 111375
  },
  "agreementsAccepted": true,
  "payment": {
    "status": "pending",
    "razorpayOrderId": null,
    "razorpayPaymentId": null
  },
  "status": "pending",
  "createdAt": "2026-08-02T10:00:00Z",
  "confirmedAt": null
}
```

**Status lifecycle:** `pending` → `confirmed` | `payment_failed` | `cancelled`
> ⛔ Only the Cloud Function (Admin SDK) may flip `status` to `confirmed`. Client writes to `status`/`payment` fields are blocked by security rules.

### 5.4 `promoCodes/{code}`
```json
{ "code": "VOYAGE10", "discountPercent": 10, "active": true }
```

---

## 6. Cloud Function Contracts

| Function | Trigger | Input | Action |
|---|---|---|---|
| `createRazorpayOrder` | HTTPS callable | `{ bookingId }` | Server reads total from Firestore (never trusts client amount), calls Razorpay Orders API, returns `{ orderId }` |
| `verifyPayment` | HTTPS callable | `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` | HMAC verify against `RAZORPAY_KEY_SECRET` → update booking to `confirmed` |

---

## 7. Firestore Security Rules (baseline — never weaken)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /packages/{packageId}  { allow read: if true; allow write: if false; }
    match /promoCodes/{code}     { allow read: if true; allow write: if false; }
    match /users/{uid}           { allow read, write: if request.auth != null && request.auth.uid == uid; }
    match /bookings/{bookingId} {
      allow create: if request.auth != null
                   && request.resource.data.uid == request.auth.uid
                   && request.resource.data.status == "pending";
      allow read:   if request.auth != null && resource.data.uid == request.auth.uid;
      allow update: if false;   // Admin SDK (Cloud Functions) only
    }
  }
}
```

---

## 8. Authentication Rules

- **Google Sign-In:** Firebase Auth Google provider, standard popup.
- **Phone OTP:** Firebase Auth Phone provider, `+91` enforced. Use a **Firebase test phone number** (e.g. `+91 9999999999` → OTP `123456`). Demo must never depend on live SMS delivery.
- **Gating:** Booking (payment step) is blocked until phone is verified. Browsing is unauthenticated.

---

## 9. Pricing Formula

```
total = (adults × basePriceAdult)
      + (children × basePriceAdult × 0.75)
      + (infants × infantFee)
      − discount
```

Promo code `VOYAGE10` → 10% off subtotal. One active code total.

---

## 10. Design Tokens (FIXED — do not restyle)

### Colors
| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#1B2A4A` | Primary text, headers, nav |
| `marigold-500` | `#F2A93B` | CTAs, active states, price highlights |
| `monsoon-600` | `#1F7A6C` | Success / confirmed / Available badge |
| `stamp-600` | `#C0392B` | Sold out, errors, required markers |
| `paper-50` | `#FBF7EF` | Page background |
| `slate-500` | `#5B6472` | Body text, secondary labels |
| `line-200` | `#E4DCC8` | Dividers, perforation lines, card borders |

### Typography
| Role | Typeface |
|---|---|
| Display | **Space Grotesk** — bold, slightly wide tracking |
| Body | **IBM Plex Sans** |
| Mono | **IBM Plex Mono** — prices, booking IDs, dates, OTP |

### Layout
- 12-col grid, 24px gutter, max-width 1200px.
- Cards: 1px `line-200` border, **flat** (no heavy shadows), 4px border-radius only.
- **Perforation motif:** `border-top: 1px dashed line-200` between identity block and detail block inside cards.
- Motion: minimal — map marker highlight ~150ms. No page-load animations.

### Signature Visual: Ticket-Stub Cards
Itinerary day cards and booking summaries are styled like torn ticket stubs: dashed perforation line separating identity (day number / booking ID) from details. Booking IDs and prices always in monospace.

---

## 11. User Flow & Gating Rules

```
Homepage → Package Details → Date → Travelers → [Book Now]
  → [if not signed in] Google Sign-In
  → [if phone not verified] Phone OTP
  → Traveler Details → Agreements → Razorpay Checkout
  → [Cloud Function verifies] → Confirmation → My Trips
```

| Gate | Rule |
|---|---|
| Book Now | Requires Google sign-in |
| Payment | Requires phone OTP verified |
| Date selection | Sold-out dates are disabled (not just greyed) |
| Traveler selector | Adults ≥ 1; no field negative |
| Pay Now button | Disabled until all agreement checkboxes checked |
| Booking confirmation | Only after Cloud Function HMAC verification |

---

## 12. Scope Lock

### 🟢 MVP — Must Build
Homepage with package cards, search by name/destination, Package Details page (gallery, itinerary accordion, Google Map, date selector, traveler selector, live price), Auth modal (Google + Phone OTP), Checkout (traveler details + agreements), Razorpay Test payment + server verification, Confirmation screen, My Trips dashboard.

### 🟡 Stretch — Only if MVP Done Early
Promo code `VOYAGE10`, additional traveler detail rows, arrival flight info field, trip countdown, budget/duration/theme filters, route line on map.

### ⚪ Out of Scope — Never Build
Multi-country booking, real hotel inventory, seat locking, flight booking, visa processing, admin dashboard, refunds, email/WhatsApp notifications, PDF tickets, QR codes, AI recommendations, currency conversion, production fraud detection, automated tests/CI, live Razorpay keys, passport/Aadhaar collection.

---

## 13. Non-Negotiables (Never Cut)

1. Phone OTP gating before payment
2. Server-side Razorpay signature verification (HMAC)
3. Sold-out date hard-blocking
4. Land-only disclaimer always visible

---

## 14. Cut List (priority order if time runs out)

1. Additional traveler detail rows beyond primary traveler
2. Arrival flight info field
3. Trip countdown on My Trips
4. Route line on map + marker animation polish
5. Filters beyond basic search
6. Third/fourth seed package (ship with 2 minimum)

---

## 15. Source of Truth Hierarchy

1. **PRD** — what is in scope and at what priority
2. **TRD** — how it is built technically
3. **Backend-Schema** — exact data shape
4. **UI-Design-Spec** — exact visual language
5. **User-Flow** — screen order and gating rules
6. **Implementation-Plan** — build order and cut list
