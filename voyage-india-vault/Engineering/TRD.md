---
title: Technical Requirements Document
type: trd
tags: [voyage-india, engineering, architecture]
---

# Voyage India — Technical Requirements Document

⬅ [[Home]] · Related: [[PRD]] · [[Backend-Schema]] · [[Implementation-Plan]] · [[AI-Guardrails]]

---

## 1. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS | Fast local dev, no config overhead |
| Auth | Firebase Authentication (Google + Phone providers) | Phone provider supports **test numbers** — see §4.1 |
| Database | Cloud Firestore | Document model matches package/booking shape directly — see [[Backend-Schema]] |
| Backend logic | Firebase Cloud Functions (Node.js) | Only for Razorpay order creation + signature verification |
| Payments | Razorpay Checkout (Test Mode) | Client SDK + server-side verification |
| Maps | Google Maps JavaScript API via `@react-google-maps/api` | Markers, `fitBounds`, InfoWindow |
| Hosting | Firebase Hosting | Single `firebase deploy` for frontend |
| State | React Context + `useReducer` (booking/cart state) | No Redux needed at this scale |

> [!warning] Don't propose alternatives to this table
> This stack is fixed for the build. See [[AI-Guardrails#4. Decision Defaults]].

## 2. Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────┐
│   React SPA (Vite)  │───────▶│  Firebase Auth        │  Google + Phone OTP
│   Firebase Hosting   │        └──────────────────────┘
│                      │        ┌──────────────────────┐
│  - Homepage          │───────▶│  Firestore             │  packages, bookings,
│  - Package Details    │        │                        │  users, promoCodes
│  - Checkout           │        └──────────────────────┘
│  - My Trips           │        ┌──────────────────────┐
│                      │───────▶│  Cloud Functions       │  createOrder,
└──────────┬───────────┘        │  (Node.js)             │  verifyPayment
           │                     └──────────┬───────────┘
           │                                │
           ▼                                ▼
   Google Maps JS API              Razorpay Orders API
   (client-side, public key)       (server-side, secret key)
```

> [!important] Key principle
> Anything that needs a secret (Razorpay key secret) lives in a Cloud Function — never in the client bundle.

## 3. Environment Variables & Secrets

Client (`.env`, safe to expose, prefix `VITE_`):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_RAZORPAY_KEY_ID=        # public key ID only
```

Server (Cloud Functions config / `functions/.env`, never shipped to client):
```
RAZORPAY_KEY_SECRET=
```

## 4. Third-Party Integrations

### 4.1 Firebase Authentication
- Google provider: standard popup sign-in, no extra setup beyond enabling in console.
- Phone provider: enable in Firebase Console → Authentication → Sign-in method → Phone → add a **test phone number with a fixed 6-digit code** (e.g. `+91 9999999999` → `123456`). This removes dependency on real SMS delivery for the entire demo — treat it as the primary flow, not a fallback.

### 4.2 Cloud Firestore
- Client reads packages directly (public read).
- Client writes bookings only through the validated flow (booking doc created client-side as `pending`, flipped to `confirmed` only by the Cloud Function after payment verification).
- Full collection structure and security rules: [[Backend-Schema]].

### 4.3 Google Maps JavaScript API
- Enable "Maps JavaScript API" in Google Cloud Console, restrict key to your domain.
- Marker data comes from `package.itinerary[].mapLocations[]` (lat/lng predefined in seed data — no geocoding needed).
- Day click → filter markers by `dayNumber`, call `map.fitBounds()` on the filtered set.

### 4.4 Razorpay Test Mode
- Use Test Mode Key ID/Secret from the Razorpay dashboard (no live KYC needed).
- Flow: client requests order → Cloud Function calls Razorpay Orders API → returns `order_id` → client opens Razorpay Checkout with that `order_id` → on success, client sends `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to a second Cloud Function → function verifies HMAC signature against `RAZORPAY_KEY_SECRET` → updates booking to `confirmed`.
- Never trust a "success" callback from the client alone to confirm a booking — signature verification is mandatory (already a [[PRD|PRD]] rule).

## 5. Non-Functional Requirements
- **Responsive:** desktop-first for the demo, usable down to mobile (cards stack, forms full-width, nav collapses).
- **Performance:** package list and details should render from cached Firestore reads; no need for pagination at 4–6 packages.
- **Security:** Firestore security rules restrict booking writes to the authenticated user's own UID; payment confirmation only via Cloud Function (Admin SDK bypasses client rules safely).
- **Reliability for demo:** phone OTP uses Firebase test number (§4.1); Razorpay uses Test Mode — nothing in the demo path depends on external delivery services (SMS/email).

## 6. Deployment

```
firebase init          # Hosting + Functions + Firestore
firebase deploy
```
Single project, single deploy command — no separate backend server to stand up.

## 7. Out of Scope (Technical)

> [!danger] Not part of this build
> Real-time inventory locking, server-side rendering, CI/CD pipeline, automated testing suite, load balancing, multi-region deployment, production KYC/live Razorpay keys.

---

## Related Notes
- [[Home]]
- [[PRD]] — what these technical decisions are in service of
- [[Backend-Schema]] — full Firestore schema and security rules
- [[Implementation-Plan]] — hour-by-hour build order using this stack
- [[AI-Guardrails]] — why this stack shouldn't be reconsidered mid-build
