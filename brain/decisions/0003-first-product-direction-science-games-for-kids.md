---
name: 0003-first-product-direction-science-games-for-kids
description: First product direction — science games for kids, topic via ASO research, design bar = Apple feature-worthy
owner: team
status: proposed
created: 2026-06-10
supersedes: -
tags: [decision, product, direction]
---

# 0003. First product direction — science games for kids

## Status
Proposed — 2026-06-10 (Dor + Gidi; Ohad review pending)

## Context
The project has no product direction yet — it's the one open question blocking
forward motion. Dor put up three linked proposals (2026-06-09) covering the niche,
how to pick the exact topic, and the quality bar. Gidi (product) has reviewed and
agrees; Ohad (tech feasibility) review is pending.

## Decision
1. **Niche:** build in the **kids' science games** space on the App Store.
2. **Launch theme (data-driven):** **dinosaurs** — the strongest child-interest +
   science overlap found in ASO research (search proxy 42–55; 5M+ downloads on
   comparable titles). First app = a science mystery with dinosaurs in the front window.
   Franchise expands: space (chapter 2) → Leonardo's workshop (prestige chapter).
3. **Franchise structure:** series brand = *Science Quest*; launch app title =
   *Dino Time Lab* or *Dinosaur Mystery Quest* (demand hook carries discoverability).
4. **Design bar:** aim for **Apple feature-worthy** (App of the Year / Month). Design
   is a first-class pillar, not a layer added at the end.
5. **Compliance:** build for Apple Kids Category + Google Families Policy + Teacher
   Approved eligibility from day one — required for store trust with parents.
6. **Gameplay:** exploration-driven, click-to-play core loop ([[design-inspirations]])
   held to six engagement principles — every tap rewards, a steady drip of "aha",
   tappable-is-obvious, no dead ends/fail states, a collection/progression layer,
   soft guidance when idle. These are design constraints on every scene, not
   nice-to-haves. See [[gameplay-principles]] (engagement → retention → "make money").

## Consequences
- **Makes it easier:** clear niche to research and build toward; data-driven topic
  reduces guessing risk; Apple featuring = large free distribution (money + fun both served).
- **Commits us to:** a high design bar that costs time; iOS as primary platform.
- **Tradeoff to name:** craft-first quality vs. speed — acceptable because our constraint
  is infra cost (free), not hours. See [[north-star]].

## Alternatives considered
- **No niche / build whatever** — rejected; without a direction we can't research or prioritize.
- **Guess the topic** — rejected; ASO research is cheap and reduces launch risk.
- **Ship-fast, polish later** — rejected; an Apple feature requires polish from the start,
  and we're not time-constrained in the same way we're money-constrained.

## Research
- **Gidi — 2026-06-10:** ASO keyword research completed via ChatGPT deep research.
  Full report: `brain/research/aso-keyword-research-2026-06-10.md`.
  Summary: [[aso-research-findings]].
  Result: dinosaurs confirmed as strongest launch theme; decision updated above.

## Pending
- **Ohad:** review and sign off → move status to accepted. Note the gameplay
  principles ([[gameplay-principles]]) — flag any that are technically costly to
  guarantee (esp. "every tap rewards" and "no dead ends") so we size them early.
