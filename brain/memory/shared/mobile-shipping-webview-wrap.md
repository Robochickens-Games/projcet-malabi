---
name: mobile-shipping-webview-wrap
description: Path to App Store / Google Play for our web prototypes is a WebView wrapper (Capacitor / Expo-webview), not a native rewrite — so keep building web-first
owner: team
scope: shared
created: 2026-06-15
tags: [mobile, shipping, architecture, prototypes, expo, capacitor]
---

The realistic way to ship our prototypes (museum-parallax and its mini-games) to
the App Store and Google Play is a **WebView wrapper** — bundle the existing web
build inside a native shell using **Capacitor** (preferred for pure web content)
or **Expo + react-native-webview**. This reuses **~95% of the code as-is**: Pixi.js,
Three.js, Web Audio, DOM, and drag-drop all keep working because the game still
runs in a browser engine.

A **native React Native port is NOT the path** — it would only salvage game
*logic* (state machines, scene/hotspot config, puzzle rules), not the rendering:
Pixi.js has no RN equivalent, Three.js is only partial via `expo-three`, Web Audio
becomes `expo-av`, and DOM/fullscreen/orientation are all different APIs.

**Why:** our four prototypes are vanilla-JS browser apps with zero React. That
sounds like a mobile blocker but isn't, because the WebView path doesn't care
about React. We are not painting ourselves into a corner by building in web.

**How to apply:** keep building web-first (Vite + Pixi/Three). To keep the future
wrap smooth, stay disciplined now: touch-first input (no hover/right-click/
keyboard-only), mobile viewport + safe areas baked in (continue the recent
fullscreen/landscape work), and watch WebGL/asset perf on real phones (Pixi +
Three together is heavy). When we actually wrap, compare Capacitor vs Expo-webview
— Capacitor is usually less friction for pure web content.

Related: [[north-star]], [[prototype-parallax-first-slice]],
[[prototype-brachio-endless-runner-minigame]], [[budget-constraint]].
