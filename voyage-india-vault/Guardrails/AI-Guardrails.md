---
title: AI Agent Guardrails
type: guardrail
tags: [voyage-india, guardrails, ai-agent]
---

# 🛑 AI Agent Guardrails — Voyage India

⬅ [[Home]] · Related: [[PRD]] · [[TRD]] · [[Implementation-Plan]]

> [!important] Read this before writing code, proposing designs, or answering questions about this project.
> This vault documents a **6–8 hour, solo-developer hackathon build**. Its biggest risk is not "missing a feature" — it's an AI agent over-engineering, re-litigating settled decisions, or wandering into scope that was deliberately cut. This note exists to prevent that.

---

## 1. Source of Truth Hierarchy
When two notes seem to disagree, resolve in this order:

1. [[PRD]] — decides *what* is in scope and at what priority (🟢/🟡/⚪)
2. [[TRD]] — decides *how* it's built technically (stack, architecture, secrets)
3. [[Backend-Schema]] — decides the *exact* data shape — don't invent fields
4. [[UI-Design-Spec]] — decides the *exact* visual language — don't restyle
5. [[User-Flow]] — decides *screen order and gating rules*
6. [[Implementation-Plan]] — decides *build order*, and what to cut first

Never resolve a conflict by reasoning from general best practice alone. Check the doc first.

## 2. Scope Is Locked
- Everything tagged 🟢 in [[PRD]] is required. Build it as specified — don't redesign it.
- Everything tagged 🟡 is optional and only happens if 🟢 is fully done. Don't build 🟡 before 🟢 is complete, even if it looks easy.
- Everything tagged ⚪ is **explicitly out of scope**. Do not build it, scaffold it, or leave a `TODO` for it.

> [!danger] Never add, even if it seems like an obvious improvement
> Multi-country booking, real hotel inventory, seat locking, flight booking, visa processing, vendor/admin portal, refunds, reviews, notifications (email/WhatsApp), PDF tickets, QR check-in, AI recommendations, currency conversion, production fraud detection, automated tests/CI, load balancing, multi-region deployment, live Razorpay keys, passport/Aadhaar collection.

## 3. Never Cut
*(non-negotiable, even under time pressure)*

- Phone OTP gating before payment
- Server-side Razorpay payment verification (HMAC signature)
- Sold-out date blocking
- Land-only disclaimer visibility

These are the [[PRD#12. Validation Rules|PRD's explicit validation rules]] and the parts of the demo that prove the product idea. If time runs out, cut from [[Implementation-Plan#4. Cut List]] first, in the order given there — nothing else.

## 4. Decision Defaults
*(stop deliberating — do this instead)*

| Situation | Default | Don't |
|---|---|---|
| Choosing a library/framework | Use exactly what's in [[TRD#1. Tech Stack]] | Propose alternatives ("have you considered Next.js / Supabase / Stripe?") |
| Data model question | Use [[Backend-Schema]] as-is | Add subcollections, normalize, or add fields "for future flexibility" |
| Visual/styling question | Use the tokens in [[UI-Design-Spec#2. Design Tokens]] | Introduce new colors, shadows, rounded pills, or a different type scale |
| A requirement is ambiguous or unstated | Pick the simplest option that satisfies the 🟢 requirement, implement it, move on | Pause to present three options or ask for a spec that doesn't exist |
| Tempted to add error handling / edge cases beyond what's described | Add the minimal handling in [[User-Flow#3. Secondary Flows]] (failure/cancel/retry) | Build a generic error-boundary/retry framework |
| Tempted to add tests, CI, or monitoring | Don't — explicitly out of scope, see [[TRD#7. Out of Scope (Technical)]] | — |

## 5. Anti-Overthinking Rules
- **Cite, don't re-derive.** If a note already answers the question, quote or link it instead of reasoning the answer out from first principles.
- **No speculative abstraction.** Follow the structure in [[Implementation-Plan#2. Project Structure]] exactly. Don't add extra layers (`services/`, `repositories/`, extra hooks) unless a 🟢 requirement needs it.
- **Time-box everything.** This is an 8-hour build ([[Implementation-Plan#3. Hour-by-Hour Plan]]). If a task would blow its hour, stop, ship the simplest working version, and flag the polish as 🟡.
- **"Good enough for demo" beats "production-grade."** Optimizing for scale, hardening beyond the stated security rules, or code elegance is not the goal — a working walkthrough of [[User-Flow#1. Primary Flow (Demo Path)]] is.
- **Don't restate the whole vault before acting.** Look up only the note you need, apply it, and move on.

## 6. When to Actually Stop and Ask a Human
Only escalate for:

- Changing the priority order, or cutting something from the [[#3. Never Cut]] list
- Changing the tech stack in [[TRD]]
- Anything touching real money (switching Razorpay out of Test Mode)
- Any request to collect passport/Aadhaar/visa documents — explicitly forbidden by [[PRD]]
- A genuine conflict between two notes that [[#1. Source of Truth Hierarchy]] doesn't resolve

Everything else: use [[#4. Decision Defaults]] and proceed without asking.

## 7. Definition of Done
A user can browse → open a package → explore itinerary + map → pick a date → set travelers → see live pricing → sign in with Google → verify phone via OTP → fill traveler details → accept agreements → pay via Razorpay test mode → get a confirmed booking with an ID → see it in My Trips. Nothing beyond this path is required for "done." Full detail: [[PRD#14. Success Criteria]].

---

## Related Notes
- [[Home]]
- [[PRD]]
- [[TRD]]
- [[Backend-Schema]]
- [[UI-Design-Spec]]
- [[User-Flow]]
- [[Implementation-Plan]]
