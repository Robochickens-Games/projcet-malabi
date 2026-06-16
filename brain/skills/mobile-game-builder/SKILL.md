---
name: mobile-game-builder
description: Best-practices playbook for building mobile games — how to structure mechanics, the core loop, onboarding, progression/retention, graphics & art budgets, economy/monetization, touch UX, performance, and launch. Tuned for our web-first, kids' science game. Anyone can use.
---

# Mobile Game Builder — the build playbook

The team's **how-to-build-a-good-mobile-game** reference. Use it when shaping a mechanic,
a screen, the economy, the art budget, or the launch — so what we build is fun, performs on
a phone, and earns. Tool-agnostic; it codifies industry best practice and adapts it to **our**
game.

**Our context (don't re-derive it):** a tap-and-explore **kids' science museum mystery**, ages
5–10, **mobile, web-first** (Vite + Pixi.js / Three.js), shipped to the stores via a **WebView
wrapper** ([[mobile-shipping-webview-wrap]]), **no ads** for kids — premium / one-time / parental
IAP only. Align to the north star: *make us money, make it fun* ([[north-star]]). We already have
six [[gameplay-principles]] (every tap rewards · drip of aha · obvious-tappable · no dead ends ·
collection layer · soft guidance) and a [[click-to-play-engagement-concern]] open — **this skill
extends those, it doesn't replace them.** When a best practice below was written for adult F2P,
say so and adapt it for kids/premium rather than copying the number.

## Before you start
- Read `brain/memory/shared/project-status.md`, [[game-concepts]], [[gameplay-principles]],
  [[art-direction]], and any relevant ADR so the advice serves the current direction.
- Be clear what you're building (a mechanic? a screen? the economy? the art pipeline?) and which
  of the principles below actually bite for it. Don't dump the whole playbook on a one-button fix.

---

## 1. Core loop & mechanics
The single most important thing. Polish, content, and progression can't save a loop that isn't fun.
- **Keep the core action short and tight** — the repeatable beat should resolve in **under ~10s**;
  longer beats deflate motivation on a small screen. Tap → instant, legible feedback → reward.
- **Three nested loops:** *core* (the second-to-second action), *session* (what a 3–5 min sitting
  achieves), *meta* (why you come back tomorrow — collection, progress, the next aha). Design all
  three; most games only design the first.
- **Variable, not fixed, rewards.** A drip of surprise (which fossil? what's revealed?) beats
  predictable payouts for engagement — but for kids keep it **delight, never gambling** (no loot
  boxes, no paid randomness). Our "drip of aha" *is* the variable reward.
- **Give meaningful choice.** Even small branching ("which exhibit first?") builds ownership.
- **Embody the real thing.** Our best mechanics make the *trait* the verb (Brachio weaves its neck
  through the canopy; Fish Run flaps) — [[prototype-brachio-endless-runner-minigame]],
  [[prototype-ptero-fish-run-minigame]]. Mechanic = the science, felt.
- **No dead ends, obvious-tappable** — keep every state recoverable and every interactive object
  legibly tappable (our principles). Clues should make the player *deduce*, never name the answer
  ([[clue-design-deduction-not-naming]], [[puzzle-challenge-match-the-reference]]).

## 2. Onboarding / first-time experience (FTUE)
D1 retention is mostly decided here.
- **Into gameplay within ~60 seconds** — not into menus, settings, or account creation. For kids,
  the first tap should *do something delightful*.
- **Teach by playing, not by telling.** No walls of text. Introduce **one mechanic at a time**,
  with visual cues; let the first puzzle teach itself. "Show, don't tell" — our soft-guidance
  principle.
- **Engineer an early win.** Decide the one thing a new player does in session one that makes them
  feel *competent and excited* — that's the onboarding's north star.
- **Micro-interactions / "juice"** — tiny satisfying animations, sound, and feedback on every
  action make the game feel alive and the FTUE delightful. Cheap to add, huge on feel.

## 3. Progression & retention
- **Retention is the health metric.** F2P benchmarks (adapt for our premium/kids case, don't copy):
  **D1 ≥ ~40–45%**, **D7 ≥ ~20%**, **D30 ≥ ~10%**. D1 = "is it desirable?", D7 = "are there clear
  goals & systems?", D30 = "does the core loop scale / is there enough content?". D30 best predicts
  lifetime value.
- **Don't worship the metric.** Retention numbers diagnose; they don't design. Chasing them with
  manipulative hooks is doubly wrong for kids — build the game players *want* to return to.
- **Progress + the tease of progress to come** is the retention engine. Show what's done and dangle
  what's next (our collection layer, completion seals — [[prototype-completion-states]]).
- **Healthy return hooks for kids:** new content, a collection to complete, a daily delight — *not*
  streak-anxiety, energy timers, or FOMO pressure.

## 4. Graphics & art
- **Art is most of your memory budget** — graphics assets are typically **70–80% of game memory**.
  Set a **memory budget per device tier** and hold to it; this governs load times too.
- **Optimize aggressively:** atlas/spritesheet 2D art; for 3D keep poly counts low, use LODs, merge
  meshes, keep shaders mobile-friendly, compress textures, stream/lazy-load by scene to kill loading
  screens. We can produce 3D dino assets headless in Blender ([[blender-3d-asset-pipeline]]) — but
  validate every generated asset against the art bar before trusting it ([[blender-asset-experiment-flop]]).
- **Readability beats fidelity** on a small screen, doubly so for kids: high contrast, clear
  silhouettes, obvious affordances. Stay on our warm painterly museum direction ([[art-direction]])
  and our realism rule — subjects are real and accurate ([[scientific-realism-rule]]).
- **Design at the right density** and test on real devices; what reads on a monitor can be mush on
  a 5" screen.

## 5. Economy & monetization (kids-ethical)
- **For kids' games: no ads, no pay-to-win, no manipulative patterns.** Monetize via **premium /
  one-time purchase, expansions, or parent-gated IAP**. This is both the ethical bar *and* our
  decided path (no ads).
- **COPPA / GDPR-K:** under-13 means **collect the minimum data, no behavioral ad targeting,
  parental consent before any data sharing.** Build for it from day one — it's a launch gate, not
  a polish item. (Our [[budget-constraint]] already pushes us free/minimal on infra.)
- **No dark patterns — ever.** No disguising ads/shop links as gameplay, no nagging, no
  exploiting that kids don't grasp money. Purchases behind a clear **parent gate**; transparent
  pricing; easy refunds.
- **Earn by being worth paying for.** A premium kids' science game competes on trust and quality
  (the accuracy moat + polish), not on extraction. That serves "make us money" *sustainably*.

## 6. UX & touch (mobile + kids)
- **Touch targets:** **≥ 44×44 px** baseline; for **young children use ~2 cm × 2 cm** (≈4× the
  adult minimum) with generous spacing so fat-finger and developing motor skills still hit.
- **Thumb zone:** put primary controls in the easy-reach lower-center; avoid top corners for
  anything important. (Our prototypes use a bottom dock — [[prototype-game-ui-3d]].)
- **Kids' motor skills:** tap and swipe big targets are easy; **precise drag, tiny targets, and
  fine gestures are hard** for young kids — design around tap/swipe, make any drag forgiving.
- **Feedback states** must stay visible under the thumb; every tap gets a visible/audible response
  (our "every tap rewards").
- Match our museum-placard UI system ([[prototype-game-ui-3d]]) for consistency.

## 7. Performance (web-first reality)
- **Target 60 FPS, fast first load.** We ship a web build in a WebView, so we live with browser/JS
  perf: budget draw calls, avoid GC churn in the loop, lazy-load scenes, keep the initial bundle
  small. Slow load = lost D1.
- **Test on a real mid-range phone in a WebView**, not just desktop Chrome — that's the actual
  runtime ([[mobile-shipping-webview-wrap]]).

## 8. Playtest, measure, launch
- **Watch real kids play, early.** The [[click-to-play-engagement-concern]] is exactly the kind of
  question only observation answers — does the explore loop hold a child's attention?
- **Instrument lightly:** funnel through FTUE, where players drop, what they tap. Privacy-minimal
  for kids. Use data to find problems; use design to fix them.
- **Launch / ASO:** dinosaurs are our strongest hook ([[aso-research-findings]]); the Kids category
  has stricter store rules — plan compliance before submission, not after rejection.

---

## Best resources (curated from the web)
**Core loop & mechanics:** [GameAnalytics — Perfect your core loop](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop) · [Mobile Free To Play — Crafting a strong core loop](https://mobilefreetoplay.com/bible/crafting-strong-core-loop/)
**Retention & metrics:** [Solsten — True drivers of D1/D7/D30](https://solsten.io/blog/d1-d7-d30-retention-in-gaming) · [MAF — Retention benchmarks vs monetization](https://maf.ad/en/blog/mobile-game-retention-benchmarks/) · [Mobile Free To Play — Obsessing over retention can kill your game](https://mobilefreetoplay.com/obsessing-retention-metrics-risks-killing-game/)
**Onboarding / FTUE:** [Udonis — FTUE in mobile games](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience) · [Adrian Crook — Best practices for onboarding](https://adriancrook.com/best-practices-for-mobile-game-onboarding/) · [Keewano — 5 FTUE tips](https://keewano.com/blog/first-time-user-experience-ftue-mobile-games/)
**Art & performance:** [Innovecs — Optimizing art rendering for mobile](https://www.innovecsgames.com/blog/optimizing-art-rendering-for-mobile-gaming-best-practices/) · [Unity LevelUp (Amir Dori) — Art production best practices](https://medium.com/ironsource-levelup/art-production-for-games-best-practices-and-optimization-5b651a167be8) · [Linden Reid — Art asset budgeting for mobile](https://lindenreidblog.com/2022/05/27/optimization-strategies-for-mobile/)
**Kids, ethics & compliance:** [Designing for Kids — an ethical framework (Stephens)](https://matthewlarn.medium.com/designing-for-kids-creating-an-ethical-framework-for-digital-play-2fb83088c19b) · [Monetization for kids apps & COPPA (Openback)](https://openback.com/blog/monetization-for-kids-apps-how-to-be-profitable-and-coppa-compliant/) · [COPPA & GDPR-K for children's games (Fish in a Bottle)](https://www.fishinabottle.com/blog/what-does-coppa-and-gdpr-k-compliance-mean-for-childrens-games-fish-in-a-bottle)
**Touch & kids UX:** [NN/g — Design for kids by physical development](https://www.nngroup.com/articles/children-ux-physical-development/) · [Smashing Magazine — The thumb zone](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)

## Capture decisions
When this skill settles a directional call (a monetization model, an art/perf budget, a retention
target), record it: a settled fact → memory; a directional call → an ADR
(`brain/processes/decision-record.md`). Keep the brain the source of truth so the team stays in sync.
