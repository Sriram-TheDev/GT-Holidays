---
title: Backend Schema
type: schema
tags: [voyage-india, engineering, firestore, data-model]
---

# Voyage India — Backend Schema (Cloud Firestore)

⬅ [[Home]] · Related: [[TRD]] · [[PRD]] · [[AI-Guardrails]]

---

## 1. Collections Overview

```
/packages/{packageId}
/users/{uid}
/bookings/{bookingId}
/promoCodes/{code}
```

Firestore is document-based — itinerary days and map locations are stored as **arrays of objects inside the package document** rather than subcollections, since the data is small, predefined, and always read together.

> [!warning] Don't normalize this or add subcollections
> This shape is deliberate for a 4–6 package hackathon dataset. See [[AI-Guardrails#4. Decision Defaults]].

## 2. packages/{packageId}

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
  "images": [
    "https://.../tokyo-1.jpg",
    "https://.../kyoto-1.jpg"
  ],
  "description": "5 days across Tokyo and Kyoto covering shrines, city icons, and local culture.",
  "inclusions": [
    "Hotel accommodation",
    "Airport pickup and drop",
    "Local transportation",
    "Sightseeing and listed entry tickets",
    "Tour guide"
  ],
  "exclusions": [
    "International flights",
    "Visa charges",
    "Personal shopping",
    "Meals not listed"
  ],
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
      "activities": ["Airport pickup", "Hotel check-in", "Evening leisure"],
      "transport": "Private transfer",
      "hotel": "Shinjuku City Hotel",
      "meals": "Dinner",
      "notes": "Meet guide at arrivals gate, Exit 3.",
      "mapLocations": [
        { "name": "Narita Airport", "lat": 35.7720, "lng": 140.3929, "description": "Arrival point" },
        { "name": "Shinjuku City Hotel", "lat": 35.6938, "lng": 139.7034, "description": "Check-in" }
      ]
    },
    {
      "dayNumber": 2,
      "title": "Tokyo City Tour",
      "city": "Tokyo",
      "activities": ["Meiji Shrine", "Shibuya Crossing", "Tokyo Tower"],
      "transport": "Coach + walking",
      "hotel": "Shinjuku City Hotel",
      "meals": "Breakfast",
      "notes": "",
      "mapLocations": [
        { "name": "Meiji Shrine", "lat": 35.6764, "lng": 139.6993, "description": "Morning visit" },
        { "name": "Shibuya Crossing", "lat": 35.6595, "lng": 139.7005, "description": "Midday" },
        { "name": "Tokyo Tower", "lat": 35.6586, "lng": 139.7454, "description": "Evening" }
      ]
    }
  ],
  "createdAt": "2026-01-01T00:00:00Z"
}
```

## 3. users/{uid}

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

## 4. bookings/{bookingId}

Booking IDs are human-readable, e.g. `VI-JP-10245` (prefix + destination code + random/timestamp suffix), used as the document ID directly.

```json
{
  "bookingId": "VI-JP-10245",
  "uid": "firebase_auth_uid",
  "packageId": "pkg_tokyo_kyoto_5d",
  "travelDate": "2026-09-10",
  "travelers": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "travelerDetails": [
    { "name": "Ananya Sharma", "age": 32, "category": "adult", "dietary": "vegetarian" },
    { "name": "Rohan Sharma", "age": 34, "category": "adult", "dietary": "no_preference" },
    { "name": "Myra Sharma", "age": 8, "category": "child", "dietary": "vegetarian" }
  ],
  "primaryContact": {
    "email": "ananya@example.com",
    "phone": "+919999999999"
  },
  "arrivalFlight": {
    "flightNumber": null,
    "airport": null,
    "arrivalDate": null,
    "arrivalTime": null
  },
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

**Status lifecycle:** `pending` → (`confirmed` | `payment_failed` | `cancelled`). Only the Cloud Function (via Admin SDK, after signature verification) may set `status: "confirmed"` and populate `payment.razorpayPaymentId` / `confirmedAt`. See [[TRD#4. Third-Party Integrations|Razorpay Test Mode flow]].

## 5. promoCodes/{code}

```json
{
  "code": "VOYAGE10",
  "discountPercent": 10,
  "active": true
}
```

## 6. Firestore Security Rules (baseline)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /packages/{packageId} {
      allow read: if true;
      allow write: if false; // seeded manually / via admin SDK only
    }

    match /promoCodes/{code} {
      allow read: if true;
      allow write: if false;
    }

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /bookings/{bookingId} {
      allow create: if request.auth != null
                     && request.resource.data.uid == request.auth.uid
                     && request.resource.data.status == "pending";
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      // Updates to status/payment fields only allowed via Admin SDK (Cloud Functions),
      // which bypasses these rules — client-side updates to booking status are blocked:
      allow update: if false;
    }
  }
}
```

> [!danger] Never weaken this
> Client-side writes to `status`/`payment` on a booking must stay blocked. Only the Cloud Function (Admin SDK) may confirm a booking. This is a [[PRD#12. Validation Rules|PRD validation rule]], not a style choice.

## 7. Cloud Function Endpoints

| Function | Trigger | Purpose |
|---|---|---|
| `createRazorpayOrder` | HTTPS callable | Takes `bookingId`, reads booking total from Firestore (never trusts client-sent amount), creates Razorpay order, returns `order_id` |
| `verifyPayment` | HTTPS callable | Takes `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` — verifies HMAC with `RAZORPAY_KEY_SECRET`, then updates booking to `confirmed` |

---

## Related Notes
- [[Home]]
- [[TRD]] — architecture and Cloud Function integration details
- [[PRD]] — the product rules this schema encodes
- [[AI-Guardrails]] — why this schema shouldn't be redesigned mid-build
