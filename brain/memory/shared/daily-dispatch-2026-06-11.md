---
name: daily-dispatch-2026-06-11
description: Special edition — what the team did on 2026-06-11: dinosaurs confirmed, Science Museum Mystery direction, 15 dino mechanics, first playable prototype, and a gazette glow-up
owner: team
scope: shared
created: 2026-06-11
tags: [dispatch, daily, roundup, gazette, editorial]
---

# 🦕 The Malabi Daily — Special Edition, June 11

**EDITORIAL DESK · WEDNESDAY · ALL TIMES LOCAL** — If yesterday the brain was
mostly plumbing, today it grew a spine. In a single morning-to-afternoon sprint
the team went from "we think it's dinosaurs" to a named product, a wall of
mechanics, and — the headline — *something you can actually play with your
thumb.* Here's the dispatch.

---

## 🏆 Front page: we have a playable

**13:55 — The first feel-prototype is real.** Dor shipped a playable parallax
slice of the museum: you walk into the lobby, **find a tooth**, step into the
**dino hall**, then **match the herbivore diorama** using the catalog. It runs
on **Vite + Pixi.js + GSAP** and lives in `product/prototypes/museum-parallax/`
(`npm i && npm run dev`). This is the first time the concept stopped being words
and started being a *feel*. The ask to the team is simple: **play it, then tell
us if it's fun.** That's the whole job of this slice. ([[prototype-parallax-first-slice]])

---

## 🧭 Decisions & direction

**10:03 — The product has a name: _Science Museum Mystery._** A tap-and-explore
adventure across **three wings — Dinosaurs, Space, Inventions** — no ads, aimed
at **ages 5–10**, with the design bar set at "Apple-feature-worthy." The first
concept image landed alongside it and the **art direction** was captured straight
off the canvas: warm illustrated museum, **Art Deco**, amber/gold meets teal/space,
a back-facing kid with a magnifying glass. ([[game-concepts]], [[art-direction]])
The call is written up as **ADR 0003** and is now **waiting on Ohad** to review,
push back, or accept.

---

## 🔬 Findings

**09:52 — Dinosaurs, confirmed.** ASO keyword research (rounds 1 + 2) came back
and settled the debate: the **museum umbrella with a dinosaur wing as the lead
hook** is the strongest launch play. The projection on the table — **6k–10k
downloads in six months on $8k–$12k of UA.** That's the "make us money" half of
the north star getting some actual numbers under it. ([[aso-research-findings]])

---

## 🧪 Explorations

**13:27 — Fifteen ways to play a dinosaur.** A proposal landed with 15 mechanic
ideas for the dino wing, narrowing to a recommended **core trio**: a **Time Lens**
(swipe between bones and the living beast), a **Fossil Detective Board** (connect
clues to crack a case), and a **Living Diorama** (a habitat that reacts to your
taps). A spin-off puzzle — **"brush away the dust"** to reveal an out-of-place
ammonite — is already queued behind it. ([[dinosaur-section-mechanics]],
[[puzzle-brush-away-the-dust]])

**13:33 — Naming our eyes.** The team logged its **visual-language references** —
illustrated adventure, premium-tactile, hidden-object, kids-explorable — and,
crucially, *what to steal from each*. ([[visual-language-references]])

---

## 🗞️ Meanwhile, at the newspaper

The Malabi Daily spent the afternoon getting a glow-up of its own:

- **Letters to the Editor went live** — anyone can now attach a note to *any*
  piece of info in the paper; it pings Telegram instantly and the brain ingests
  it at the next sync. ([[daily-notes]])
- **Articles now open in a drawer**, proposals got indexed, and the prose got a
  haircut — **less jargon, more readable.**
- **A real front page emerged** — a varied newspaper grid, **5 Art Deco covers**
  wired to the article desks, concept art doing duty as cover images, and a final
  pass for an **airier, borderless layout** with an asset lightbox and cleaner
  deks.
- Under the hood, two quality-of-life wins: a **`version-manager` skill** that
  auto-pushes the brain when work is shareable, and a **`paleontologist` skill**
  to fact-check the dino content before it embarrasses us in front of a five-year-old.

---

## 📌 Where it leaves us

By close of play: a **named product**, a **decision awaiting one sign-off**, a
**research-backed launch theme**, a **menu of mechanics**, and — for the first
time — **a thing you can poke.** The single thing standing between "concept" and
"first initiative" is **Ohad's nod on ADR 0003**.

Tomorrow's headline writes itself once someone plays the prototype and says
either "yes" or "not yet." Either answer moves us.

_Filed to the brain · aligned to the north star: make us money 💰 · make it fun 🎉
([[north-star]], [[project-status]])_
