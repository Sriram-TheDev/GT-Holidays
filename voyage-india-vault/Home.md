---
title: Voyage India — Project Vault
type: home
tags: [voyage-india, moc]
---

# 🧭 Voyage India — Project Vault

> [!important] If you are an AI agent working in this vault
> Read [[AI-Guardrails]] first. It exists so you don't over-engineer, re-litigate settled decisions, or wander into cut scope. Everything else in this vault assumes you've read it.

## One-Line Description
Voyage India lets Indian travelers discover, explore, and book transparent **land-only** international holiday packages — with interactive itinerary maps, dynamic INR pricing, and Razorpay test-mode payments.

**Build window:** 6–8 hours, solo developer, hackathon scope.

## Vault Map

| Note | Covers | Read this to answer... |
|---|---|---|
| [[PRD]] | Product scope, priority tags (🟢🟡⚪), validation rules | "Is this feature in scope?" |
| [[TRD]] | Tech stack, architecture, secrets, integrations | "What technology / pattern do I use?" |
| [[User-Flow]] | Screen sequence, gating rules, demo path | "What happens after X?" |
| [[UI-Design-Spec]] | Design tokens, screen-by-screen visual spec | "How should this look?" |
| [[Backend-Schema]] | Firestore collections, security rules, Cloud Functions | "What's the exact data shape?" |
| [[Implementation-Plan]] | Hour-by-hour build order, cut list, risk notes | "What do I build next, and what do I cut first?" |
| [[AI-Guardrails]] | Scope lock, decision defaults, anti-overthinking rules | "Am I allowed to do this, or should I stop and ask?" |

## Demo Path (at a glance)
Homepage → Package Details (gallery, itinerary, map) → Date → Travelers → Promo code → Book Now → Google Sign-in → Phone OTP → Traveler details → Agreements → Razorpay Test Checkout → Confirmation → My Trips.

Full flow and gating rules: [[User-Flow]].

## Status Legend
Used throughout every note in this vault:

- 🟢 **MVP** — must work for the demo
- 🟡 **Stretch** — build only if MVP is fully done early
- ⚪ **Future** — explicitly out of scope for this build

## Core Non-Negotiables
- Phone OTP verification is required before payment
- Payment is only confirmed after **server-side** Razorpay signature verification
- Sold-out travel dates are hard-blocked, not just greyed out
- The land-only disclaimer is always visible, never buried
- No passport/Aadhaar/visa documents are ever collected

Details: [[AI-Guardrails#3. Never Cut]]
