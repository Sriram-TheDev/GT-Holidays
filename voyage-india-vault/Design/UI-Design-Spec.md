---
title: UI Design Specification
type: design
tags: [voyage-india, design, ui, tokens]
---

# Voyage India — UI Design Specification

⬅ [[Home]] · Related: [[User-Flow]] · [[PRD]] · [[AI-Guardrails]]

---

## 1. Design Direction

**Concept:** Voyage India's whole value prop is *transparency* — clear inclusions, clear pricing, clear dates. The visual language leans into the artifacts of travel documentation itself: boarding passes, luggage tags, passport stamps, ticket stubs. That's where the distinctive choices come from, rather than a generic "travel app" look (palm trees, sunset gradients, rounded blue cards).

**Signature element:** the itinerary and booking summary are styled like a **torn ticket stub** — a dashed perforation line separates the day number / booking ID from the details, with a small notch cut on the card edge. Booking IDs and prices are set in monospace, like a boarding-pass code.

## 2. Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `ink-900` | `#1B2A4A` | Primary text, headers, nav bar |
| `marigold-500` | `#F2A93B` | Primary accent — CTAs, active states, price highlights |
| `monsoon-600` | `#1F7A6C` | Success / confirmed status, "Available" date badge |
| `stamp-600` | `#C0392B` | Sold out, errors, required-field markers |
| `paper-50` | `#FBF7EF` | Page background |
| `slate-500` | `#5B6472` | Body text, secondary labels |
| `line-200` | `#E4DCC8` | Dividers, perforation lines, card borders |

> [!warning] Avoid
> The generic AI-default cream+terracotta pairing (`#F4F1EA` + `#D97757`) — `marigold-500` is deliberately more golden/saturated to read as festival-marigold, not that default.

### Type
| Role | Typeface | Use |
|---|---|---|
| Display | **Space Grotesk**, bold, slightly wide tracking | H1/H2, package titles, hero headline |
| Body | **IBM Plex Sans** | Paragraphs, form labels, nav |
| Utility/Mono | **IBM Plex Mono** | Prices, booking IDs, dates, OTP input, flight-style codes |

Type scale: 40/28/20/16/14px, 1.4 line-height for body.

### Layout
- 12-column grid, 24px gutter, max content width 1200px.
- Cards: 1px `line-200` border, **no heavy shadows** — flat, document-like, not glossy.
- Border radius: 4px only (ticket-corner feel, not app-bubble feel). No fully rounded pills except status badges.
- Perforation motif: `border-top: 1px dashed line-200` between a card's "identity" block (day number / booking ID) and its "detail" block.

### Motion
- Minimal. Map marker highlight on day-click is the one animated moment (marker scale + info window fade, ~150ms). No page-load animation sequences — keep it fast and document-plain.

> [!important] Don't restyle
> These tokens are fixed. No new colors, shadows, rounded pills, or type scale — see [[AI-Guardrails#4. Decision Defaults]].

## 3. Screen-by-Screen Spec

### Homepage
- Nav: logo left, search bar center, Login/Profile + My Trips right.
- Hero: full-width slider of 3–4 destination images with a stamped-style headline overlay ("Land-only. Transparent. Yours to explore.").
- Category rail: Trending / Budget / Family / Beach / Culture as horizontally scrollable chips.
- Package cards (grid, 3-up desktop / 1-up mobile): image top, ticket-stub divider, then name/country/duration/theme/rating/price, "Land-only" badge in `monsoon-600`, View Package button in `marigold-500`.

### Package Details
- Gallery: full-width slider, thumbnail strip below.
- Two-column below the fold (desktop): left = itinerary (accordion by day) + inclusions/exclusions; right = sticky booking panel (map preview, date selector, traveler selector, price summary, Book Now).
- Land-only disclaimer banner sits directly under the title — always visible, not buried.
- Itinerary day card: day number in mono type on the left of the perforation, activities/hotel/meals on the right. Clicking a day both expands it and re-centers the map.
- Map: right panel or full-width below itinerary on mobile. Numbered markers matching day numbers exactly.

### Traveler Selector & Price Summary
- Stepper controls (BookMyShow-style: − count +) for Adults/Children/Infants, each with the age rule as a small caption under the label.
- Price summary styled as a receipt: line items in mono type, dashed perforation before the total, total in `marigold-500` bold.

### Auth Modal
- Single modal, two steps in sequence (Google → Phone/OTP), progress shown as two small ticket-stub dots, not a percentage bar.
- OTP input: 6 boxed mono-type digits, auto-advance.

### Checkout
- Traveler details form: full-width fields on mobile, two-column on desktop.
- Agreements block: each declaration as its own checkbox row (not one paragraph with one checkbox) so each is scannable.
- Pay Now button disabled (visually greyed, not hidden) until all agreements are checked.

### Confirmation Screen
- Full ticket-stub visual: booking ID in large mono type, perforation, then trip details below — reinforces the "here's your document" feeling.

### My Trips
- Card per booking, same ticket-stub visual language as confirmation, status badge (`monsoon-600` = Confirmed), View Itinerary button re-opens the package details in read mode.

## 4. Responsive Rules
- Breakpoints: 375 / 768 / 1200.
- Package cards: 3-up → 2-up → 1-up.
- Booking panel: sticky sidebar on desktop → moves below itinerary and becomes a sticky bottom price bar on mobile (price + Book Now always visible while scrolling).
- Map: fixed height 320px on mobile, still shows all markers with `fitBounds`.

## 5. Reusable AI Build Prompt

If generating this UI with an AI frontend tool, this prompt captures the direction:

> Design a travel booking web app called "Voyage India" for Indian travelers booking land-only international holiday packages. Visual language: travel-document motifs — boarding passes, ticket stubs, luggage tags, passport stamps — not generic sunset/palm-tree travel-app clichés. Palette: deep indigo-ink (#1B2A4A) text, golden marigold (#F2A93B) accent, monsoon teal (#1F7A6C) for confirmed/success states, warm paper (#FBF7EF) background, muted stamp-red (#C0392B) for sold-out/errors. Typography: Space Grotesk for display headings, IBM Plex Sans for body, IBM Plex Mono for prices/booking IDs/dates. Flat cards with 1px borders and a dashed "perforation" divider inside cards separating an identity block (day number, booking ID) from detail content — no heavy shadows, 4px border radius only. Screens needed: homepage with hero slider and package cards, package details page with day-wise itinerary accordion and an interactive map panel, a receipt-style price summary, a two-step auth modal (Google then phone OTP), a checkout form, and a boarding-pass-style booking confirmation.

---

## Related Notes
- [[Home]]
- [[User-Flow]] — screen order these tokens get applied across
- [[PRD]] — the transparency positioning behind this design direction
- [[AI-Guardrails]] — why these tokens shouldn't be reconsidered mid-build
