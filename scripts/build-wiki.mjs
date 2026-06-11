#!/usr/bin/env node
// Build the Malabi project wiki — a newspaper-style, always-current view of the
// shared brain. Editorial "front page" of what changed and when (from git history),
// plus a knowledge map, decisions ledger, team masthead, and full memory archive.
//
// Reads brain/** (memories, decisions, status, north-star, members) and git log,
// then emits a single self-contained site/index.html. No npm dependencies:
// markdown renders client-side via marked (CDN); the knowledge graph uses d3 (CDN).
//
// Run: node scripts/build-wiki.mjs   (output: site/index.html)
// The build-wiki GitHub Action runs this on every push to main touching brain/**.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAIN = join(ROOT, "brain");
const OUT_DIR = join(ROOT, "site");
// Committed cache of news images pulled from Wikipedia (so the published page has
// no runtime dependency, and we don't re-download on every build).
const NEWS_CACHE = join(ROOT, "wiki-assets", "news");

// ---- helpers ---------------------------------------------------------------

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

// Minimal frontmatter parser: handles scalars and [a, b, c] arrays.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      data[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      data[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: m[2].trim() };
}

// Reconcile markers (`<!-- resolved-when: ... -->` and the explanatory block that
// documents them) are build bookkeeping — strip them from any body before it is
// rendered or serialized. They are only meaningful to reconcileStatus, which reads
// the status doc separately and consumes them there.
function stripReconcileMarkers(body) {
  return (body || "")
    .replace(/[ \t]*<!--\s*resolved-when:[\s\S]*?-->\n?/gi, "")
    .replace(/[ \t]*<!--\s*Reconcile markers:[\s\S]*?-->\n?/i, "")
    .trim();
}

const WIKILINK = /\[\[([a-z0-9-]+)\]\]/g;
function extractLinks(body) {
  const links = new Set();
  let m;
  while ((m = WIKILINK.exec(body)) !== null) links.add(m[1]);
  return [...links];
}

// A project image that belongs to a memory/decision, if one exists: either a
// frontmatter `image:` (repo- or file-relative) or a sibling file with the same
// basename (foo.md → foo.jpg). Returns a repo-relative path or null.
const IMG_EXT = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
function localImageFor(mdFile, data) {
  if (data.image) {
    for (const c of [join(ROOT, data.image), join(dirname(mdFile), data.image)])
      if (existsSync(c)) return relative(ROOT, c);
  }
  const base = mdFile.replace(/\.md$/, "");
  for (const ext of IMG_EXT) if (existsSync(`${base}.${ext}`)) return relative(ROOT, `${base}.${ext}`);
  return null;
}

// ---- collect memories ------------------------------------------------------

const memories = [];
for (const file of walk(join(BRAIN, "memory"))) {
  const rel = relative(ROOT, file);
  if (rel.endsWith("index.md") || rel.toLowerCase().endsWith("readme.md")) continue;
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const name = data.name || rel.split("/").pop().replace(/\.md$/, "");
  memories.push({
    name,
    description: data.description || "",
    owner: data.owner || "team",
    scope: data.scope || "shared",
    tags: data.tags || [],
    created: data.created || "",
    path: rel,
    body: stripReconcileMarkers(body),
    links: extractLinks(body),
    image: localImageFor(file, data),
  });
}

// ---- collect decisions (ADRs) ----------------------------------------------

const decisions = [];
for (const file of walk(join(BRAIN, "decisions"))) {
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const slug = file.split("/").pop().replace(/\.md$/, "");
  const numMatch = slug.match(/^(\d+)/);
  const titleMatch = body.match(/^#\s+(.+)$/m);
  decisions.push({
    slug,
    num: numMatch ? parseInt(numMatch[1], 10) : 999,
    title: titleMatch ? titleMatch[1].trim() : slug,
    description: data.description || "",
    status: (data.status || "unknown").toLowerCase(),
    created: data.created || "",
    tags: data.tags || [],
    path: relative(ROOT, file),
    body,
    links: extractLinks(body),
    image: localImageFor(file, data),
  });
}
decisions.sort((a, b) => a.num - b.num);

// ---- collect proposals -----------------------------------------------------

const proposals = [];
for (const file of walk(join(BRAIN, "proposals"))) {
  if (file.toLowerCase().endsWith("readme.md")) continue;
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const name = data.name || file.split("/").pop().replace(/\.md$/, "");
  proposals.push({
    name,
    description: data.description || "",
    owner: data.owner || "team",
    scope: "proposal",
    status: (data.status || "under-review").toLowerCase(),
    area: data.area || "",
    tags: data.tags || [],
    created: data.created || "",
    path: relative(ROOT, file),
    body,
    links: extractLinks(body),
    image: localImageFor(file, data),
  });
}

// ---- collect research docs -------------------------------------------------

const researchDocs = [];
for (const file of walk(join(BRAIN, "research"))) {
  if (file.toLowerCase().endsWith("readme.md")) continue;
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const name = data.name || file.split("/").pop().replace(/\.md$/, "");
  researchDocs.push({
    name,
    description: data.description || data.title || name,
    owner: data.author || data.owner || "team",
    scope: "research",
    tags: data.tags || [],
    created: data.date || data.created || "",
    path: relative(ROOT, file),
    body,
    links: extractLinks(body),
    image: localImageFor(file, data),
  });
}

// ---- members ---------------------------------------------------------------

const memberDir = join(BRAIN, "memory", "members");
const members = [];
let memberSlugs = [];
try {
  memberSlugs = readdirSync(memberDir).filter((n) =>
    statSync(join(memberDir, n)).isDirectory()
  );
} catch {}
for (const slug of memberSlugs) {
  const role = memories.find((m) => m.name === `${slug}-role`);
  // A member photo lives beside their memories as avatar.jpg; the build copies
  // it into site/people/<slug>.jpg and the masthead renders it.
  let avatar = null;
  try {
    statSync(join(memberDir, slug, "avatar.jpg"));
    avatar = `people/${slug}.jpg`;
  } catch {}
  members.push({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    role: role ? role.description.replace(/^.*role[^—-]*[—-]\s*/i, "").trim() : "",
    description: role ? role.description : "",
    memoryName: role ? role.name : null,
    avatar,
  });
}

// ---- special docs ----------------------------------------------------------

function readDoc(relPath) {
  try {
    const raw = readFileSync(join(ROOT, relPath), "utf8");
    return parseFrontmatter(raw).body;
  } catch {
    return "";
  }
}
const northStarBody = readDoc("brain/memory/shared/north-star.md");
let statusBody = readDoc("brain/memory/shared/project-status.md");

// Split the status doc into ## sections so the front page can show a
// "where things stand" board (TL;DR, Done, In progress, Parked, Next…).
function splitSections(md) {
  const out = [];
  const parts = md.split(/^##\s+/m);
  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    const nl = seg.indexOf("\n");
    const heading = (nl === -1 ? seg : seg.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : seg.slice(nl + 1)).trim();
    out.push({ heading, body });
  }
  return out;
}
// Drop the explanatory reconcile-markers block before sectioning so it can't fold
// into a kanban card. Inline `resolved-when:` markers stay — reconcileStatus needs them.
const statusForBoard = statusBody.replace(/[ \t]*<!--\s*Reconcile markers:[\s\S]*?-->\n?/i, "");
let statusSections = splitSections(statusForBoard);

// ---- status reconcile: keep the board honest against ground truth ----------
// The "where things stand" board renders project-status.md verbatim, so finished
// work lingers until a human deletes the bullet. To self-correct, any actionable
// bullet may carry a marker `<!-- resolved-when: <check> -->`; at build time we
// evaluate the check against the real repo and, when it passes, move that bullet
// into Done with a "✓ auto-verified" badge. Done bullets whose check regressed get
// flagged. No network needed — everything is checked against the working tree.
const RECONCILE_CHECKS = {
  // done once the file/dir exists in the repo
  "path-exists": (arg) => { try { return !!arg && existsSync(join(ROOT, arg)); } catch { return false; } },
  // done once CODEOWNERS has no @*-gh placeholder handles left
  "codeowners-filled": () => {
    try { return !/@\w+-gh\b/.test(readFileSync(join(ROOT, ".github/CODEOWNERS"), "utf8")); }
    catch { return false; }
  },
};
function evalCheck(spec) {
  const [id, ...rest] = (spec || "").trim().split(":");
  const fn = RECONCILE_CHECKS[id];
  if (!fn) return { known: false, done: false };
  return { known: true, done: !!fn(rest.join(":").trim()) };
}
function reconcileStatus(sections) {
  const MARKER = /<!--\s*resolved-when:\s*([^>]*?)\s*-->/i;
  const moved = []; // resolved bullets, hoisted into Done
  const log = [];
  const sectByHeading = (re) => sections.find((s) => re.test(s.heading));
  const doneSec = sectByHeading(/done/i);
  for (const sec of sections) {
    const isActionable = /next|progress|open/i.test(sec.heading);
    const isDone = /done/i.test(sec.heading);
    if (!isActionable && !isDone) continue;
    const kept = [];
    for (const line of sec.body.split("\n")) {
      const m = line.match(MARKER);
      if (!m) { kept.push(line); continue; }
      const { known, done } = evalCheck(m[1]);
      const clean = line.replace(MARKER, "").replace(/\s+$/, "");
      if (!known) { kept.push(clean); log.push(`? unknown check "${m[1].trim()}" — left in place`); continue; }
      if (isActionable && done) {
        moved.push(clean.replace(/^([-*]\s+)/, "$1**✓ auto-verified —** "));
        log.push(`✓ resolved (${m[1].trim()}) → moved to Done`);
      } else if (isDone && !done) {
        kept.push(clean.replace(/^([-*]\s+)/, "$1**⚠ regressed —** "));
        log.push(`⚠ regressed (${m[1].trim()}) — flagged in Done`);
      } else {
        kept.push(clean); // actionable & not done, or done & still true: leave as-is
      }
    }
    sec.body = kept.join("\n").trim();
  }
  if (moved.length && doneSec) doneSec.body = (doneSec.body + "\n" + moved.join("\n")).trim();
  if (log.length) console.log("[reconcile] status board:\n  " + log.join("\n  "));
  return sections;
}
statusSections = reconcileStatus(statusSections);
// Keep the verbatim "full status notes" render free of reconcile bookkeeping.
statusBody = stripReconcileMarkers(statusBody);

// ---- git history (the "news feed": what changed, when, by whom) ------------

const repoUrl = "https://github.com/Robochickens-Games/projcet-malabi";

// Map a conventional-commit-ish prefix to a newspaper "desk".
function deskFor(subject) {
  const p = (subject.split(":")[0] || "").toLowerCase().trim();
  if (p.startsWith("decision") || p.startsWith("adr")) return "Decisions";
  if (p.startsWith("research")) return "Research";
  if (p.startsWith("proposal")) return "Proposals";
  if (p.startsWith("direction")) return "Direction";
  if (p.startsWith("status")) return "Status";
  if (p.startsWith("feat")) return "Features";
  if (p.startsWith("asset")) return "Assets";
  if (p.startsWith("brain") || p.startsWith("memory")) return "Brain";
  if (p.startsWith("fix")) return "Fixes";
  if (p.startsWith("docs")) return "Docs";
  return "Updates";
}
// Strip the conventional prefix for a cleaner headline.
function headline(subject) {
  const i = subject.indexOf(":");
  return (i > -1 && i < 16 ? subject.slice(i + 1) : subject).trim();
}

// Map each changed file to a human one-liner, so dispatches can describe themselves.
const fileDesc = {};
for (const m of memories) if (m.description) fileDesc[m.path] = m.description;
for (const d of decisions) if (d.description) fileDesc[d.path] = d.description;
for (const p of proposals) if (p.description) fileDesc[p.path] = p.description;
for (const r of researchDocs) if (r.description) fileDesc[r.path] = r.description;

// Map each changed file to a linkable "asset" (a memory, decision, proposal, or research doc).
const pathMeta = {};
for (const m of memories)
  pathMeta[m.path] = { name: m.name, kind: "memory", label: m.name, scope: m.scope, desc: m.description, body: m.body, image: m.image };
for (const d of decisions)
  pathMeta[d.path] = {
    name: d.slug,
    kind: "decision",
    label: `ADR ${String(d.num).padStart(2, "0")}`,
    desc: d.description,
    body: d.body,
    image: d.image,
  };
for (const p of proposals)
  pathMeta[p.path] = { name: p.name, kind: "proposal", label: p.name, scope: "proposal", desc: p.description, body: p.body, image: p.image };
for (const r of researchDocs)
  pathMeta[r.path] = { name: r.name, kind: "research", label: r.name, scope: "research", desc: r.description, body: r.body, image: r.image };

// The main assets a commit touched — the memories/decisions worth linking to.
function assetsFor(files) {
  const seen = new Set();
  const out = [];
  for (const f of files) {
    const meta = pathMeta[f];
    if (meta && !seen.has(meta.name)) {
      seen.add(meta.name);
      out.push(meta);
    }
  }
  return out.slice(0, 4);
}

// Bold the "punchline" — the clause after the first colon / dash in a description.
function boldPunchline(s) {
  const idx = s.search(/[:—–]\s/);
  if (idx > 0 && idx < 52) {
    const head = s.slice(0, idx + 2);
    const tail = s.slice(idx + 2).trim().replace(/[.]$/, "");
    if (tail) return `${head}**${tail}**.`;
  }
  return s;
}

// The substantive memory/decision a commit is "about" (mirrors narrate's pick).
function primaryAsset(c) {
  let cands = c.files.filter((f) => pathMeta[f] && !f.endsWith("project-status.md"));
  if (c.desk !== "Decisions") {
    const mem = cands.filter((f) => f.includes("/memory/"));
    if (mem.length) cands = mem;
  }
  return cands.length ? pathMeta[cands[0]] : null;
}

// A paragraph that's mostly file paths / asset bookkeeping (e.g. "brain/images/
// foo.png — …") reads as noise in a dek — the reader wants prose, not a manifest.
function looksTechnical(text) {
  const files = (text.match(/[\w./-]+\.(png|jpe?g|webp|gif|svg|md|mjs|js|json|css|html)\b/gi) || []).length;
  if (files >= 2) return true;                                    // a list of files
  if (files >= 1 && /\b(brain|src|assets|images|product|scripts)\/[\w./-]+/i.test(text)) return true;
  return false;
}
// The most substantive *prose* paragraph near the top of a markdown body:
// skips headings/quotes, the short "Status: proposed" lines, and file-path
// manifests, so a dek reads like a sentence — an ADR yields its Context, not
// its one-word status, and an asset note yields its description, not its paths.
function bestParagraph(body) {
  const paras = [];
  for (const block of (body || "").split(/\n\s*\n/)) {
    const text = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^#{1,6}\s/.test(l) && !/^>/.test(l))
      .map((l) => l.replace(/^[-*]\s+/, ""))
      .join(" ")
      .trim();
    if (text) paras.push(text);
  }
  // How much real prose survives once wikilinks / links / code are stripped — a
  // "Informs [[a]] and [[b]]." line has almost none, and reads poorly as a dek.
  const proseLen = (t) => t
    .replace(/\[\[[^\]]+\]\]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`[^`]+`/g, "")
    .replace(/[^A-Za-z0-9]+/g, " ").trim().length;
  const good = paras.filter((p) => !looksTechnical(p) && proseLen(p) >= 45);
  return good.find((p) => p.length >= 80) || good.find(Boolean)
    || paras.filter((p) => !looksTechnical(p)).find(Boolean) || "";
}

function clampSentences(s, maxSent, maxChars) {
  s = (s || "").replace(/\s+/g, " ").trim();
  // Cut after the Nth sentence terminator that's followed by a space/end —
  // so "file-2026-06-10.md" and "v1.2" stay intact and no text is dropped.
  let count = 0, end = s.length;
  for (let i = 0; i < s.length; i++) {
    if (/[.!?]/.test(s[i]) && (i + 1 >= s.length || s[i + 1] === " ")) {
      if (++count >= maxSent) { end = i + 1; break; }
    }
  }
  let out = s.slice(0, end).trim();
  if (out.length > maxChars) out = out.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
  return out;
}

// A short "article intro" excerpt from the asset the dispatch is about.
function articleIntro(c) {
  const a = primaryAsset(c);
  if (!a || !a.body) return "";
  const para = clampSentences(bestParagraph(a.body), 2, 300);
  // Skip if it just restates the one-line description we already show.
  if (!para || (a.desc && para.slice(0, 28).toLowerCase() === a.desc.slice(0, 28).toLowerCase()))
    return "";
  return para;
}

// Strip a trailing "(... 2026 ...)" parenthetical and dangling dashes from a headline.
function cleanHead(h) {
  return h
    .replace(/\s*\([^)]*\d{4}[^)]*\)\s*$/, "")
    .replace(/\s*[—–-]\s*$/, "")
    .trim();
}

// Turn a commit into a natural-language sentence: who did what, and the gist.
const DESK_VERB = {
  Decisions:  "recorded a decision",
  Research:   "completed a research round",
  Proposals:  "put up a proposal",
  Direction:  "set a direction",
  Status:     "updated where things stand",
  Features:   "shipped something new",
  Assets:     "added an asset",
  Brain:      "updated the brain",
  Fixes:      "fixed something",
  Docs:       "updated the docs",
  Updates:    "added to the brain",
};
// Git author → the team's first-name slug.
function displayAuthor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("dor")) return "Dor";
  if (n.includes("gid")) return "Gidi";
  if (n.includes("ohad")) return "Ohad";
  return (name || "Someone").split(/\s+/)[0];
}

// A news-flash sentence in markdown: bold byline + styled, punchy detail.
function narrate(c) {
  const lead = `**${c.author}** ${DESK_VERB[c.desk] || "pushed an update"}`;
  if (c.desk === "Status")
    return `${lead} — the latest snapshot of where the project stands.`;
  // Prefer the description of a substantive memory/decision the commit touched.
  let candidates = c.files.filter((f) => fileDesc[f] && !f.endsWith("project-status.md"));
  // For non-decision dispatches, favour a memory file over the decision file.
  if (c.desk !== "Decisions") {
    const mem = candidates.filter((f) => f.includes("/memory/"));
    if (mem.length) candidates = mem;
  }
  let detail = candidates.length ? fileDesc[candidates[0]] : "";
  if (!detail) detail = cleanHead(c.headline);
  detail = detail.trim();
  detail = detail.charAt(0).toUpperCase() + detail.slice(1);
  if (!/[.!?]$/.test(detail)) detail += ".";
  return `${lead}. ${boldPunchline(detail)}`;
}

// ---- news images: project-local first, else relevant photo from Wikipedia ----

// Candidate search topics for a dispatch, most specific first, desk as fallback.
function imageQueriesFor(c) {
  const hay = `${c.headline} ${c.summary || ""} ${(c.assets || []).map((a) => a.name).join(" ")} ${c.intro || ""}`.toLowerCase();
  const q = [];
  const add = (...xs) => xs.forEach((x) => { if (!q.includes(x)) q.push(x); });
  const has = (...ks) => ks.some((k) => hay.includes(k));
  // Prefer concrete, photographic subjects (museum mounts, real objects) over
  // logos/diagrams, which read flat in a newspaper. Most specific topic wins.
  if (has("dinosaur", "science game", "product direction", "paleo")) add("Tyrannosaurus");
  if (has("science", "experiment")) add("Microscope");
  if (has("malabi", "pudding", "dessert")) add("Muhallebi");
  if (has("telegram")) add("Telegram (software)");
  if (has("monkey island", "loom", "leisure suit larry", "adventure", "inspiration")) add("Monkey Island", "Point-and-click adventure game");
  if (has("design", "ux", "visual")) add("Graphic design");
  if (has("dudu", "whatsapp")) add("WhatsApp");
  if (has("gazette", "wiki", "newspaper", "digest", "daily", "publish")) add("Newspaper");
  if (has("brain", "architecture", "sync", "memory", "knowledge")) add("Library");
  if (has("aso", "keyword research", "app store", "discoverab")) add("Smartphone");
  if (has("north star", "vision", "goal")) add("Compass");
  if (has("budget", "money", "cost", "free")) add("Piggy bank");
  const deskQ = {
    Research: ["Microscope", "Laboratory"], Decisions: ["Chess", "Crossroads"],
    Features: ["Rocket launch", "Printing press"], Brain: ["Library"],
    Status: ["Dashboard"], Fixes: ["Toolbox"], Docs: ["Newspaper"], Updates: ["Newspaper"],
  };
  add(...(deskQ[c.desk] || ["Newspaper"]));
  add("Newspaper");
  return q;
}

// Top Wikipedia search hit that has an image; returns thumb URL + page + title.
async function wikiSearchImage(query) {
  const url =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query", format: "json", generator: "search", gsrsearch: query,
      gsrlimit: "6", prop: "pageimages", piprop: "thumbnail|name", pithumbsize: "900", origin: "*",
    });
  const res = await fetch(url, { headers: { "User-Agent": "MalabiDaily/1.0 (gazette build; github.com/Robochickens-Games/projcet-malabi)" } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {}).sort((a, b) => (a.index || 99) - (b.index || 99));
  const hit = pages.find((p) => p.thumbnail?.source);
  if (!hit) return null;
  return { thumb: hit.thumbnail.source, title: hit.title, page: "https://en.wikipedia.org/wiki/" + encodeURIComponent(hit.title.replace(/ /g, "_")) };
}

const manifestPath = join(NEWS_CACHE, "manifest.json");
function loadManifest() {
  try { return JSON.parse(readFileSync(manifestPath, "utf8")); } catch { return {}; }
}
// Resolve a query to a cached image file (downloading from Wikipedia if needed).
async function ensureImage(query, manifest) {
  const key = createHash("sha1").update(query).digest("hex").slice(0, 16);
  if (manifest[key] && existsSync(join(NEWS_CACHE, manifest[key].file))) return manifest[key];
  try {
    const found = await wikiSearchImage(query);
    if (!found) return null;
    const ext = (found.thumb.match(/\.(jpe?g|png|gif|webp)(?:$|\?)/i)?.[1] || "jpg").toLowerCase().replace("jpeg", "jpg");
    const file = `${key}.${ext}`;
    const img = await fetch(found.thumb, { headers: { "User-Agent": "MalabiDaily/1.0 (gazette build)" } });
    if (!img.ok) return null;
    mkdirSync(NEWS_CACHE, { recursive: true });
    writeFileSync(join(NEWS_CACHE, file), Buffer.from(await img.arrayBuffer()));
    manifest[key] = { file, title: found.title, page: found.page, query };
    return manifest[key];
  } catch {
    return null;
  }
}

const history = [];
try {
  const SEP = "\x1f";
  const raw = execSync(
    `git log --no-merges -n 80 --date=format:'%Y-%m-%d' ` +
      `--pretty=format:'@@COMMIT@@%H${SEP}%an${SEP}%ad${SEP}%aI${SEP}%s' --name-only -- brain`,
    { cwd: ROOT, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
  );
  for (const block of raw.split("@@COMMIT@@")) {
    if (!block.trim()) continue;
    const lines = block.split("\n");
    const [hash, author, date, isoDate, subject] = lines[0].split(SEP);
    const time = (isoDate.match(/T(\d{2}:\d{2})/) || [])[1] || "";
    const files = lines
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l && l.startsWith("brain/"));
    if (!subject) continue;
    const item = {
      hash: hash.slice(0, 7),
      author: displayAuthor(author),
      date,
      time,
      subject,
      headline: cleanHead(headline(subject)),
      desk: deskFor(subject),
      files,
      url: `${repoUrl}/commit/${hash}`,
    };
    item.summary = narrate(item);
    item.assets = assetsFor(files);
    item.intro = articleIntro(item);
    const prim = primaryAsset(item);
    item.introAsset = prim ? prim.name : null;
    history.push(item);
  }
} catch (e) {
  console.warn("git history unavailable:", e.message);
}
const buildDate = history[0]?.date || "";

// ---- gazette filter: not every commit deserves an article -------------------
//
// Score each commit. Commits scoring < 1 are suppressed. Duplicates (same
// primary asset already published at a lower score) are also suppressed.
//
// To force any commit into the gazette, add [gazette] or [team] to the message.
//
function gazetteScore(item) {
  const sub = item.subject.toLowerCase();

  // Explicit force-include markers
  if (/\[gazette\]|\[team\]|\[notify\]/.test(sub)) return 100;

  // Maintenance prefixes — never newsworthy
  if (/^(fix|style|chore|refactor|tweak|wip|temp|build|ci|test|lint):/.test(sub)) return -10;

  // Minor-signal keywords
  if (/\b(minor|typo|cleanup|whitespace|small tweak|reformat)\b/.test(sub)) return -5;

  let score = 0;
  const prefix = (sub.split(":")[0] || "").trim();
  const hasPrimary = primaryAsset(item) !== null;

  // High-value content types
  if (item.files.some((f) => f.startsWith("brain/decisions/"))) score += 4;
  if (item.files.some((f) => f.startsWith("brain/proposals/"))) score += 3;
  if (item.files.some((f) => f.startsWith("brain/research/"))) score += 3;

  // Real project images (not desk covers)
  if (item.files.some((f) => f.startsWith("brain/images/") && !/\/cover-/.test(f))) score += 2;

  // Commit prefix value
  if (["decision", "adr", "research", "proposal", "direction"].includes(prefix)) score += 3;
  if (["feat", "feature", "asset"].includes(prefix)) score += 2;
  if (["brain", "memory", "status", "sync"].includes(prefix)) score -= 1;
  if (["update", "refresh"].includes(prefix)) score -= 2;

  // No substantive asset → housekeeping
  if (!hasPrimary) score -= 2;

  // Only touching cover/meta images → not news
  const onlyCoverImages =
    item.files.length > 0 && item.files.every((f) => f.startsWith("brain/images/cover-"));
  if (onlyCoverImages) score -= 4;

  // Volume bonus: multiple substantive files = bigger change
  const contentFiles = item.files.filter(
    (f) => !f.startsWith("brain/images/cover-") && !f.endsWith("index.md")
  );
  if (contentFiles.length >= 3) score += 1;

  return score;
}

// Deduplicate: if the same primary asset was already published and this update
// isn't a significant enough change (score < 4), suppress it.
const publishedAssets = new Map();
const gazetteHistory = [];
for (const item of history) {
  const score = gazetteScore(item);
  if (score < 1) {
    console.log(`[gazette] skip  (${score}): ${item.subject.slice(0, 72)}`);
    continue;
  }
  const a = primaryAsset(item);
  const key = a?.name;
  if (key && publishedAssets.has(key) && score < 4) {
    console.log(`[gazette] dedup "${key}" (${score}): ${item.subject.slice(0, 72)}`);
    continue;
  }
  if (key) publishedAssets.set(key, score);
  gazetteHistory.push(item);
}
console.log(`[gazette] ${gazetteHistory.length}/${history.length} commits become articles`);

// Resolve a news image for each dispatch: a project image if the asset has one,
// otherwise a relevant photo from Wikipedia. siteImages = [absSource, destName].
const siteImages = [];
const seenLocal = new Map();
// Register a repo image for copying into site/news; returns its image descriptor.
const useLocal = (relPath, title, asset) => {
  const ext = relPath.split(".").pop();
  let dest = seenLocal.get(relPath);
  if (!dest) {
    dest = `local-${createHash("sha1").update(relPath).digest("hex").slice(0, 12)}.${ext}`;
    seenLocal.set(relPath, dest);
    siteImages.push([join(ROOT, relPath), dest]);
  }
  return { src: `news/${dest}`, title, credit: "From the brain", local: true, asset };
};
const IMG_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
mkdirSync(NEWS_CACHE, { recursive: true });
const imgManifest = loadManifest();
for (const item of gazetteHistory) {
  // Always prefer the project's own images, in order of relevance:
  // 1) an image the commit itself added/changed (e.g. team avatars, a screenshot)
  //    — skip desk-cover files (they're meta-assets, not article content)
  const touched = item.files.find((f) =>
    IMG_RE.test(f) &&
    existsSync(join(ROOT, f)) &&
    !/\/cover-/.test(f) &&           // skip desk cover images
    !/gazetCovers/.test(f)           // skip the source folder if it ever reappears
  );
  if (touched) {
    const mm = touched.match(/members\/([^/]+)\//);
    const title = mm ? mm[1][0].toUpperCase() + mm[1].slice(1) : primaryAsset(item)?.label || "From the brain";
    item.image = useLocal(touched, title);
    continue;
  }
  // 2) an image attached to the memory/decision the dispatch is about
  const a = primaryAsset(item);
  if (a && a.image) {
    item.image = useLocal(a.image, a.label, a.name);
    continue;
  }
  // 2b) desk/keyword-based fallback to project concept art (before Wikipedia)
  {
    const hay = `${item.headline} ${item.summary || ""} ${item.intro || ""} ${item.desk}`.toLowerCase();
    const hasDino    = /dinosaur|dino|fossil|paleo|prehistoric|t.rex|triceratop|specimen|bone/.test(hay);
    const hasMuseum  = /museum|game concept|art.?direction|science game|wing|launch|exhibit/.test(hay);
    // Keyword overrides: use the most evocative project image first
    if (hasDino) {
      item.image = useLocal("brain/images/landscape dino.png", "Dinosaur wing");
      continue;
    }
    if (hasMuseum) {
      item.image = useLocal("brain/images/Science Museum Mystery.png", "Science Museum Mystery");
      continue;
    }
    // Desk covers: every desk has a bespoke illustrated cover.
    // For desks with a rotation pool, pick deterministically by commit hash
    // so the same article always gets the same cover but adjacent articles differ.
    const h = parseInt(item.hash.slice(0, 6), 16);
    const rotPick = (pool) => pool[h % pool.length];
    const coverMap = {
      Decisions: "brain/images/cover-decisions.png",
      Direction: "brain/images/cover-decisions.png",
      Proposals: "brain/images/cover-proposals.png",
      Research:  "brain/images/cover-research.png",
      Updates:   rotPick(["brain/images/cover-status.png", "brain/images/cover-research.png"]),
      Brain:     rotPick(["brain/images/cover-status.png", "brain/images/cover-decisions.png"]),
      Features:  rotPick(["brain/images/cover-team.png", "brain/images/cover-status.png", "brain/images/cover-research.png"]),
      Assets:    rotPick(["brain/images/cover-team.png", "brain/images/Science Museum Mystery.png", "brain/images/cover-proposals.png"]),
    };
    const deskCover = coverMap[item.desk];
    if (deskCover && existsSync(join(ROOT, deskCover))) {
      item.image = useLocal(deskCover, item.desk);
      continue;
    }
  }
  // 3) otherwise, a relevant photo from Wikipedia
  for (const q of imageQueriesFor(item)) {
    const img = await ensureImage(q, imgManifest);
    if (img) {
      siteImages.push([join(NEWS_CACHE, img.file), img.file]);
      item.image = { src: `news/${img.file}`, title: img.title, credit: img.title, page: img.page };
      break;
    }
  }
}
writeFileSync(manifestPath, JSON.stringify(imgManifest, null, 2));

// Attach wide variants: for every item whose image came from a local cover file,
// check whether a -wide counterpart exists and set item.imageWide if so.
// niCoverHtml uses imageWide on s8 (feature) slots, image on s6/s4.
const seenLocalReverse = new Map([...seenLocal.entries()].map(([rel, dest]) => [dest, rel]));
for (const item of gazetteHistory) {
  if (!item.image?.local) continue;
  const dest = item.image.src.replace(/^news\//, "");
  const relPath = seenLocalReverse.get(dest);
  if (!relPath) continue;
  const widePath = relPath.replace(/(\.[^.]+)$/, "-wide$1");
  if (existsSync(join(ROOT, widePath))) {
    item.imageWide = useLocal(widePath, item.image.title);
  }
}

// ---- graph -----------------------------------------------------------------

const graphNodes = [
  ...memories.map((m) => ({
    id: m.name,
    label: m.name,
    kind: "memory",
    scope: m.scope,
    group: m.scope,
  })),
  ...decisions.map((d) => ({
    id: d.slug,
    label: `ADR ${String(d.num).padStart(2, "0")}`,
    kind: "decision",
    scope: "decision",
    group: "decision",
  })),
];
const nodeIds = new Set(graphNodes.map((n) => n.id));
const graphLinks = [];
const seen = new Set();
function addEdge(a, b) {
  if (a === b || !nodeIds.has(a) || !nodeIds.has(b)) return;
  const key = [a, b].sort().join("::");
  if (seen.has(key)) return;
  seen.add(key);
  graphLinks.push({ source: a, target: b });
}
for (const m of memories) for (const l of m.links) addEdge(m.name, l);
for (const d of decisions) for (const l of d.links) addEdge(d.slug, l);

// ---- data payload ----------------------------------------------------------

const payload = {
  repoUrl,
  buildDate,
  northStarBody,
  statusBody,
  statusSections,
  memories,
  decisions,
  proposals,
  researchDocs,
  members,
  history: gazetteHistory,
  graph: { nodes: graphNodes, links: graphLinks },
  stats: {
    memories: memories.length,
    decisions: decisions.length,
    proposals: proposals.length,
    members: members.length,
    links: graphLinks.length,
    changes: history.length,       // total commits, not just gazette articles
    articles: gazetteHistory.length,
  },
};

// ---- render ----------------------------------------------------------------

const json = JSON.stringify(payload).replace(/</g, "\\u003c");
const html = renderHtml(json);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.html"), html);
writeFileSync(join(OUT_DIR, ".nojekyll"), "");

// Copy member photos into the published site (site/ is gitignored and rebuilt
// fresh by the Action, so the source of truth lives in each member's brain dir).
mkdirSync(join(OUT_DIR, "people"), { recursive: true });
for (const m of members) {
  if (!m.avatar) continue;
  copyFileSync(join(memberDir, m.slug, "avatar.jpg"), join(OUT_DIR, "people", `${m.slug}.jpg`));
}

// News images (project-local + cached Wikipedia photos) into site/news.
mkdirSync(join(OUT_DIR, "news"), { recursive: true });
let copiedImages = 0;
for (const [src, dest] of siteImages) {
  try { copyFileSync(src, join(OUT_DIR, "news", dest)); copiedImages++; } catch {}
}
console.log(
  `Built site/index.html — ${payload.stats.memories} memories, ` +
    `${payload.stats.decisions} decisions, ${payload.stats.members} members, ` +
    `${payload.stats.changes} changes, ${payload.stats.links} links, ${copiedImages} images.`
);

function renderHtml(dataJson) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>The Malabi Daily</title>
<meta name="description" content="A newspaper-style, always-current record of the Malabi team's shared knowledge: what changed, when, and why." />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8D%AE%3C/text%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  /* shadcn "stone" — warm grey. Scoped to this gazette only. */
  :root {
    --paper: #faf9f7;            /* warm off-white page */
    --card: #ffffff;
    --ink: #1c1917;             /* stone-900 */
    --ink2: #292524;            /* stone-800 */
    --muted: #57534e;           /* stone-600 */
    --faint: #78716c;           /* stone-500 */
    --line: #e7e5e4;            /* stone-200 */
    --line2: #d6d3d1;           /* stone-300 */
    --rule: #1c1917;
    --tint: #f5f5f4;            /* stone-100 */
    --accent: #44403c;          /* stone-700 */
    --serif: "Source Serif 4", Georgia, "Times New Roman", serif;
    --display: "Playfair Display", Georgia, serif;
    --sans: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --green: #3f6212; --amber: #854d0e; --gray: #78716c;
    --s-shared: #44403c; --s-member: #854d0e; --s-project: #3f4a6b; --s-decision: #7a3b53;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 15.5px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  a { color: var(--ink); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px 90px; }
  .sans { font-family: var(--sans); }

  /* ---- masthead ---- */
  .masthead { text-align: center; padding: 26px 0 12px; }
  .mast-top { display: flex; justify-content: space-between; align-items: center;
    font-family: var(--sans); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--faint);
    border-bottom: 1px solid var(--line); padding-bottom: 8px; }
  .mast-title { font-family: var(--display); font-weight: 900; letter-spacing: -1px;
    font-size: clamp(40px, 7vw, 72px); line-height: 1; margin: 16px 0 8px; }
  .mast-icon { font-size: .62em; vertical-align: 6%; margin-right: .22em; -webkit-text-stroke: 0; }
  .mast-rule { border: 0; border-top: 2px solid var(--rule); border-bottom: 1px solid var(--rule); height: 4px; margin: 10px 0 0; }
  .mast-sub { font-family: var(--sans); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--muted); display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; padding: 9px 0; border-bottom: 1px solid var(--rule); }
  .mast-sub b { color: var(--ink); }
  .play-link { display: inline-flex; align-items: center; gap: .4em; font-weight: 700; color: var(--paper) !important;
    background: var(--ink); border: 1px solid var(--ink); border-radius: 999px; padding: 3px 13px; letter-spacing: .08em;
    text-decoration: none; transition: opacity .15s; }
  .play-link:hover { opacity: .82; }
  .play-link .play-tri { font-size: .9em; }

  /* ---- nav ---- */
  nav.tabs { display: flex; justify-content: center; gap: 2px; flex-wrap: wrap; padding: 8px 0; border-bottom: 1px solid var(--line); margin-bottom: 26px; position: sticky; top: 0; background: var(--paper); z-index: 20; }
  nav.tabs button { font-family: var(--sans); font-weight: 700; font-size: 12.5px; letter-spacing: .08em; text-transform: uppercase;
    background: none; border: 0; color: var(--muted); padding: 8px 14px; cursor: pointer; border-bottom: 2px solid transparent; }
  nav.tabs button:hover { color: var(--ink); }
  nav.tabs button.active { color: var(--ink); border-bottom-color: var(--rule); }

  section.view { display: none; }
  section.view.active { display: block; animation: fade .25s ease; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }

  .kicker { font-family: var(--sans); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
  .section-head { font-family: var(--display); font-weight: 700; font-size: 15px; letter-spacing: .04em; text-transform: uppercase;
    border-bottom: 2px solid var(--rule); padding-bottom: 6px; margin: 0 0 18px; }

  /* ---- front page ---- */
  .standfirst { text-align: center; font-family: var(--sans); font-size: 13px; letter-spacing: .04em; color: var(--muted); margin: 0 auto 18px; }
  .standfirst b { color: var(--ink); }

  .index-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 6px; }
  .index-bar .box { text-align: center; padding: 12px 6px; border-right: 1px solid var(--line); }
  .index-bar .box:last-child { border-right: 0; }
  .index-bar .n { font-family: var(--display); font-weight: 700; font-size: 30px; line-height: 1; }
  .index-bar .l { font-family: var(--sans); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); margin-top: 5px; }
  @media (max-width: 720px) { .index-bar { grid-template-columns: repeat(2, 1fr); } .index-bar .box:nth-child(2){border-right:0;} }

  /* ---- edition toggle: two-state pill in the masthead, beside "Play" ---- */
  .edition-toggle { display: inline-flex; align-items: center; gap: .4em; font-family: var(--sans); font-weight: 700;
    font-size: 12px; line-height: 1.6; letter-spacing: .08em; text-transform: uppercase; color: var(--ink);
    background: var(--card); border: 1px solid var(--line2); border-radius: 999px; padding: 3px 13px; cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
  .edition-toggle:hover { border-color: var(--ink); }
  .edition-toggle[aria-pressed="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .edition-toggle .et-icon { font-size: .95em; }

  /* ---- "Newspaper" front (NYT-style) ---- */
  #front-times .nyt-top { display: grid; grid-template-columns: 1fr 1.55fr 1fr; gap: 0; border-top: 2px solid var(--rule); }
  #front-times .nyt-col { padding: 20px 22px 8px; min-width: 0; }
  #front-times .nyt-col.left { padding-left: 0; border-right: 1px solid var(--line2); }
  #front-times .nyt-col.right { padding-right: 0; border-left: 1px solid var(--line2); }
  #front-times .nyt-art { padding: 15px 0; border-bottom: 1px solid var(--line); }
  #front-times .nyt-col .nyt-art:first-child { padding-top: 0; }
  #front-times .nyt-col .nyt-art:last-child { border-bottom: 0; }
  #front-times .nyt-kicker { font-family: var(--sans); font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); margin-bottom: 7px; }
  #front-times .nyt-kicker.live { color: #b91c1c; }
  #front-times .nyt-kicker .live-dot { font-size: .85em; margin-right: 3px; }
  #front-times .nyt-hl { font-family: var(--display); font-weight: 700; line-height: 1.13; letter-spacing: -.3px; margin: 0 0 8px; font-size: 20px; }
  #front-times .nyt-hl a:hover { text-decoration: underline; }
  #front-times .nyt-lead .nyt-hl { font-size: 29px; }
  #front-times .nyt-center .nyt-hl { font-size: 33px; }
  #front-times .nyt-feature .nyt-hl { font-size: 22px; }
  #front-times .nyt-sum { font-family: var(--serif); font-size: 15px; line-height: 1.5; color: var(--ink2); margin: 0; }
  #front-times .nyt-byline { display: flex; align-items: baseline; gap: 8px; margin-top: 9px;
    font-family: var(--sans); font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--faint); }
  #front-times .nyt-author { font-weight: 700; color: var(--muted); }
  #front-times .nyt-time { color: var(--faint); }
  #front-times .nyt-time::before { content: "·"; margin-right: 8px; }
  #front-times .nyt-commit { color: var(--faint); text-decoration: none; margin-left: auto; }
  #front-times .nyt-commit:hover { color: var(--ink); }
  #front-times .nyt-center .nyt-sum, #front-times .nyt-lead .nyt-sum { font-size: 16px; }
  #front-times .nyt-figure { margin: 0 0 11px; }
  #front-times .nyt-figure img { width: 100%; display: block; object-fit: cover; filter: saturate(.94) contrast(1.02); cursor: zoom-in; }
  #front-times .nyt-center .nyt-figure img { aspect-ratio: 16/10; }
  #front-times .nyt-feature .nyt-figure img { aspect-ratio: 4/3; }
  #front-times .nyt-figure figcaption { font-family: var(--sans); font-size: 11px; color: var(--faint); margin-top: 5px; }
  #front-times .nyt-more-rule { border-top: 2px solid var(--rule); margin: 6px 0 0; }
  #front-times .nyt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
  #front-times .nyt-grid .nyt-art { padding: 16px 20px; border-bottom: 0; border-right: 1px solid var(--line2); border-top: 1px solid var(--line); }
  #front-times .nyt-grid .nyt-art:nth-child(4n) { border-right: 0; padding-right: 0; }
  #front-times .nyt-grid .nyt-art:first-child { padding-left: 0; }
  #front-times .nyt-grid .nyt-hl { font-size: 18px; }
  @media (max-width: 860px) {
    #front-times .nyt-top { grid-template-columns: 1fr; }
    #front-times .nyt-col { padding: 16px 0 4px; border: 0 !important; border-top: 1px solid var(--line) !important; }
    #front-times .nyt-col.left { border-top: 0 !important; }
    #front-times .nyt-grid { grid-template-columns: 1fr 1fr; }
    #front-times .nyt-grid .nyt-art { padding: 14px 14px; }
    #front-times .nyt-grid .nyt-art:nth-child(4n) { border-right: 1px solid var(--line2); }
    #front-times .nyt-grid .nyt-art:nth-child(2n) { border-right: 0; padding-right: 0; }
    #front-times .nyt-grid .nyt-art:nth-child(-n+2) { border-top: 0; }
  }
  @media (max-width: 560px) {
    #front-times .nyt-grid { grid-template-columns: 1fr; }
    #front-times .nyt-grid .nyt-art { border-right: 0 !important; padding: 14px 0; }
  }

  /* section bands give clear hierarchy between "stands" and "happened" */
  .band { display: flex; align-items: center; gap: 12px; margin: 38px 0 16px; }
  .band-emoji { font-size: 22px; }
  .band-title { font-family: var(--display); font-weight: 700; font-size: 25px; margin: 0; letter-spacing: -.3px; }
  .band-rule { flex: 1; height: 0; border-top: 2px solid var(--rule); }

  .tldr { font-size: 18px; line-height: 1.55; color: var(--ink2); max-width: 780px; margin: 0 0 22px; }
  .tldr :is(p):first-child { margin-top: 0; }
  .tldr strong, .tldr b { color: var(--ink); }

  /* kanban "where things stand" board */
  .kanban { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; align-items: start; }
  @media (max-width: 860px) { .kanban { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; }
    .kcol { flex: 0 0 76%; scroll-snap-align: start; } }
  .kcol { background: var(--tint); border: 1px solid var(--line); border-radius: 12px; padding: 10px 10px 12px; }
  .kcol-head { display: flex; align-items: center; gap: 8px; font-family: var(--sans); font-size: 12px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase; color: var(--ink); padding: 4px 6px 9px; margin-bottom: 10px; border-bottom: 2px solid var(--kc); }
  .kcol-head .kc-emoji { font-size: 16px; }
  .kcol-head .count { margin-left: auto; background: var(--kc); color: #fff; border-radius: 999px; font-size: 11px; font-weight: 700; padding: 1px 9px; }
  .kcard { background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--kc); border-radius: 9px; padding: 12px 14px; margin-bottom: 10px;
    font-size: 14px; line-height: 1.55; color: var(--muted); box-shadow: 0 1px 2px rgba(28,25,23,.04); }
  .kcard:last-child { margin-bottom: 0; }
  .kcard strong { color: var(--ink); font-weight: 700; }
  .kcard code { background: var(--paper); font-size: 12px; padding: 0 5px; }
  .kcard.empty { color: var(--faint); text-align: center; border-left-color: var(--line2); }

  /* hero = latest dispatch */
  .hero { display: flex; gap: 16px; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 20px 24px 22px; position: relative; overflow: hidden; box-shadow: 0 2px 14px rgba(28,25,23,.05); }
  .hero::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--hero); }
  .hero-emoji { font-size: 30px; line-height: 1.2; }
  .hero-main { flex: 1; min-width: 0; }
  .hero h3 { font-family: var(--display); font-weight: 700; font-size: 27px; line-height: 1.16; margin: 9px 0 6px; letter-spacing: -.3px; }
  .hero h3 a { cursor: pointer; }
  .hero h3 a:hover { text-decoration: underline; }

  .deskpill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--sans); font-size: 10.5px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; color: #fff; }
  .flash-meta { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; font-family: var(--sans); font-size: 11.5px; color: var(--faint); }
  .flash-meta .who { font-weight: 700; color: var(--muted); }
  .flash-meta .commit { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: var(--faint); margin-left: auto; }
  .flash-meta .commit:hover { color: var(--ink); }

  .summary { font-size: 15px; line-height: 1.55; color: var(--ink2); margin: 8px 0 9px; }
  .summary strong { color: var(--ink); font-weight: 700; }
  .summary a.wikilink { color: var(--s-decision); border-bottom: 1px dotted var(--s-decision); cursor: pointer; }
  .hero .summary { font-size: 16px; }

  .intro { font-size: 14px; line-height: 1.62; color: var(--muted); margin: 0 0 9px; }
  .intro .more { font-weight: 700; color: var(--s-decision); white-space: nowrap; cursor: pointer; }
  .intro .more:hover { text-decoration: underline; }
  .hero .intro { font-size: 14.5px; }

  /* news images — gazette style */
  figure { margin: 0; }
  figure img { display: block; width: 100%; background: var(--tint); }
  figcaption { font-family: var(--sans); font-size: 10px; letter-spacing: .02em; color: var(--faint); margin-top: 4px; }
  figcaption a { color: var(--faint); }
  figcaption a:hover { color: var(--ink); }
  .hero-photo { margin: 4px 0 14px; }
  .hero-photo img { height: 240px; object-fit: cover; object-position: center 30%; border: 1px solid var(--line2); filter: saturate(.92) contrast(1.02); cursor: zoom-in; }

  /* ---- newspaper article grid (below hero) ---- */
  .news-day { margin: 0; }
  .news-dayband { display: flex; align-items: center; gap: 12px; padding: 58px 0 4px; }
  .news-dayband .nd-rule { flex: 1; border-top: 2px solid var(--rule); height: 0; }
  .news-dayband .nd-label { font-family: var(--sans); font-size: 10.5px; font-weight: 700; letter-spacing: .13em;
    text-transform: uppercase; color: var(--faint); white-space: nowrap; }
  /* card grid — gaps + borders give the card feel */
  .news-row { display: grid; grid-template-columns: repeat(12, 1fr); column-gap: 16px; row-gap: 18px; margin-top: 28px; align-items: start; }
  .ni { min-width: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 5px;
    background: var(--card); padding: 0 18px 18px;
    box-shadow: 0 1px 5px rgba(28,25,23,.07); }
  .ni.s8 { grid-column: span 8; }
  .ni.s6 { grid-column: span 6; }
  .ni.s4 { grid-column: span 4; }
  .ni.s12 { grid-column: span 12; }
  .ni.strip { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap;
    padding: 10px 16px; border-radius: 4px; }
  @media (max-width: 800px) { .ni { grid-column: span 12 !important; } .news-row { column-gap: 0; row-gap: 14px; margin-top: 20px; } }
  /* cover image — bleeds to card edges (negative horizontal margin to cancel card padding) */
  .ni-cover { margin: 0 -18px 16px; overflow: hidden; border-radius: 4px 4px 0 0; }
  .ni.s8 .ni-cover img { height: 230px; }
  .ni.s6 .ni-cover img { height: 184px; }
  .ni.s4 .ni-cover img { height: 132px; }
  .ni-cover img { width: 100%; object-fit: cover; object-position: center 30%; display: block; filter: saturate(.9) contrast(1.02); cursor: zoom-in; }
  .ni-cover figcaption { padding: 6px 18px 0; }
  /* headlines */
  .ni-head { font-family: var(--display); font-weight: 700; line-height: 1.22; margin: 10px 0 10px; }
  .ni.s8 .ni-head { font-size: 24px; letter-spacing: -.2px; }
  .ni.s6 .ni-head { font-size: 20px; }
  .ni.s4 .ni-head { font-size: 16px; }
  .ni.strip .ni-head { font-size: 14px; font-family: var(--sans); flex: 1; margin: 0; }
  .ni-head a { cursor: pointer; }
  .ni-head a:hover { text-decoration: underline; }
  /* body text — hidden for briefs */
  .ni-body { font-size: 14px; line-height: 1.65; color: var(--muted); margin: 2px 0 13px; }
  .ni.s8 .ni-body { font-size: 14.5px; color: var(--ink2); }
  .ni.s4 .ni-body, .ni.strip .ni-body { display: none; }
  /* read link */
  .ni-read { font-family: var(--sans); font-size: 12px; font-weight: 700; color: var(--s-decision); cursor: pointer; display: inline-block; }
  .ni-read:hover { text-decoration: underline; }
  .ni.s4 .ni-read, .ni.strip .ni-read { display: none; }

  .assets, .related { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .assets-label { font-family: var(--sans); font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); margin-right: 1px; }
  .asset { font-family: var(--sans); font-size: 12px; padding: 2px 9px; border-radius: 7px; background: var(--tint); border: 1px solid var(--line2);
    color: var(--ink2); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
  .asset:hover { background: #fff; border-color: var(--ink); text-decoration: none; }
  .asset-decision { border-color: #d9a8bb; color: #7a3b53; }
  .asset-proposal { border-color: #c4b5e8; color: #6b5c9e; }
  .asset-research { border-color: #a8c5e8; color: #3f5a8a; }
  .flash-meta .commit { font-size: 14px; color: var(--faint); margin-left: auto; }
  .related a.wikilink { font-family: var(--sans); font-size: 12px; padding: 2px 8px; border-radius: 7px; background: transparent; border: 1px dotted var(--line2);
    color: var(--muted); cursor: pointer; }
  .related a.wikilink:hover { border-style: solid; border-color: var(--s-decision); color: var(--s-decision); text-decoration: none; }

  .catchup { font-size: 16px; line-height: 1.6; color: var(--ink2); border-left: 3px solid var(--line2); padding: 2px 0 2px 16px; }
  .status-full { margin-top: 28px; }
  .status-full summary { font-family: var(--sans); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; padding: 8px 0; }
  .status-full summary:hover { color: var(--ink); }
  .status-full .card { margin-top: 12px; }

  /* timeline = the rest, grouped by day */
  .tl-day { margin-top: 22px; }
  .tl-daterow { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .tl-rel { font-family: var(--sans); font-weight: 700; font-size: 13px; letter-spacing: .03em; color: var(--ink); }
  .tl-abs { font-family: var(--sans); font-size: 12px; color: var(--faint); }
  .tl-items { position: relative; padding-left: 26px; margin-left: 6px; border-left: 2px solid var(--line2); }
  .tl-item { position: relative; padding-bottom: 22px; }
  .tl-item:last-child { padding-bottom: 4px; }
  .tl-item::before { content: ""; position: absolute; left: -33px; top: 4px; width: 13px; height: 13px; border-radius: 50%;
    background: var(--ti); box-shadow: 0 0 0 4px var(--paper); }
  .tl-item h3 { font-family: var(--display); font-weight: 700; font-size: 19px; line-height: 1.2; margin: 7px 0 4px; }
  .tl-item h3 a:hover { text-decoration: underline; }

  /* ---- markdown ---- */
  .markdown { font-size: 15px; }
  .markdown h1 { font-family: var(--display); font-size: 28px; margin: 4px 0 14px; }
  .markdown h2 { font-family: var(--display); font-size: 20px; margin: 24px 0 8px; }
  .markdown h3 { font-family: var(--sans); font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--faint); margin: 18px 0 6px; }
  .markdown ul { padding-left: 20px; }
  .markdown li { margin: 5px 0; }
  .markdown code { background: var(--tint); padding: 1px 6px; border-radius: 4px; font-size: 13px; font-family: ui-monospace, Menlo, monospace; }
  .markdown blockquote { border-left: 3px solid var(--line2); margin: 14px 0; padding: 2px 16px; color: var(--muted); font-style: italic; }
  .markdown table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 15px; }
  .markdown th, .markdown td { border: 1px solid var(--line); padding: 8px 11px; text-align: left; }
  .markdown th { background: var(--tint); font-family: var(--sans); font-size: 12px; letter-spacing: .05em; text-transform: uppercase; }
  .markdown img { max-width: 100%; height: auto; display: block; margin: 14px 0; border: 1px solid var(--line2); cursor: zoom-in; }
  .markdown a.wikilink { color: var(--s-decision); border-bottom: 1px dotted var(--s-decision); cursor: pointer; }
  .markdown a.wikilink:hover { text-decoration: none; background: var(--tint); }

  .card { background: var(--card); border: 1px solid var(--line); padding: 28px 34px; }
  .columns-2 { columns: 2; column-gap: 38px; }
  @media (max-width: 720px) { .columns-2 { columns: 1; } }

  /* ---- knowledge map ---- */
  .graph-wrap { position: relative; background: var(--card); border: 1px solid var(--line); overflow: hidden; }
  #graph { width: 100%; height: 580px; display: block; cursor: grab; }
  .legend { position: absolute; top: 14px; left: 14px; display: flex; flex-direction: column; gap: 7px;
    background: rgba(255,255,255,.85); padding: 12px 14px; border: 1px solid var(--line); backdrop-filter: blur(4px);
    font-family: var(--sans); }
  .legend .row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
  .dot { width: 11px; height: 11px; border-radius: 50%; flex: none; }
  .graph-hint { position: absolute; bottom: 12px; right: 16px; font-family: var(--sans); font-size: 11px; color: var(--faint); }
  .node-label { font-family: var(--sans); font-size: 10px; fill: var(--muted); pointer-events: none; }
  .node circle { stroke: var(--paper); stroke-width: 1.5px; cursor: pointer; }
  .link { stroke: var(--line2); stroke-opacity: .9; }

  /* ---- decisions ledger ---- */
  .ledger { border-top: 2px solid var(--rule); }
  .adr { display: grid; grid-template-columns: 64px 1fr auto; gap: 18px; align-items: baseline;
    padding: 18px 6px; border-bottom: 1px solid var(--line); cursor: pointer; }
  .adr:hover { background: var(--tint); }
  .adr .num { font-family: var(--display); font-weight: 900; font-size: 30px; color: var(--line2); }
  .adr h3 { font-family: var(--display); font-weight: 700; font-size: 20px; margin: 0 0 3px; line-height: 1.2; }
  .adr .sub { font-family: var(--sans); font-size: 12.5px; color: var(--faint); }
  .badge { font-family: var(--sans); font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
    padding: 3px 10px; border: 1px solid currentColor; border-radius: 2px; white-space: nowrap; }
  .badge.accepted { color: var(--green); }
  .badge.proposed { color: var(--amber); }
  .badge.unknown, .badge.abandoned, .badge.superseded { color: var(--gray); }

  /* ---- team masthead ---- */
  .members { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 22px; }
  .member { text-align: center; padding: 24px 18px; border: 1px solid var(--line); background: var(--card); }
  .avatar { width: 66px; height: 66px; border-radius: 50%; margin: 0 auto 12px; display: grid; place-items: center;
    font-family: var(--display); font-size: 28px; font-weight: 700; color: var(--paper); overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.18); }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .member h3 { font-family: var(--display); margin: 0 0 2px; font-size: 22px; }
  .member .role { font-family: var(--sans); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
  .member .bio { color: var(--muted); font-size: 14px; margin-top: 10px; }
  .member .open { font-family: var(--sans); font-size: 12px; margin-top: 12px; display: inline-block; cursor: pointer; color: var(--s-decision); border-bottom: 1px dotted; }

  /* ---- archive grid ---- */
  .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; font-family: var(--sans); }
  .filters button { background: var(--card); border: 1px solid var(--line2); color: var(--muted); padding: 5px 14px; font: inherit;
    font-size: 12px; letter-spacing: .05em; text-transform: uppercase; cursor: pointer; }
  .filters button.active { color: var(--paper); background: var(--ink); border-color: var(--ink); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 0; border-top: 1px solid var(--line); }
  .mcard { padding: 16px 18px; border-bottom: 1px solid var(--line); border-right: 1px solid var(--line); cursor: pointer; }
  .mcard:hover { background: var(--tint); }
  .mcard .mname { font-family: var(--display); font-weight: 700; font-size: 17px; margin-bottom: 4px; word-break: break-word; }
  .mcard .mdesc { color: var(--muted); font-size: 14px; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; font-family: var(--sans); }
  .chip { font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; padding: 2px 8px; border: 1px solid var(--line2); color: var(--faint); }
  .chip.scope-shared { color: var(--s-shared); } .chip.scope-member { color: var(--s-member); } .chip.scope-project { color: var(--s-project); }

  /* ---- drawer ---- */
  .drawer-bg { position: fixed; inset: 0; background: rgba(28,25,23,.4); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 40; }
  .drawer-bg.open { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; right: 0; height: 100%; width: min(620px, 94vw); background: var(--paper);
    border-left: 1px solid var(--line2); box-shadow: -16px 0 40px rgba(28,25,23,.12);
    transform: translateX(100%); transition: transform .25s ease; z-index: 50; overflow-y: auto; }
  .drawer.open { transform: none; }
  .drawer-inner { padding: 28px 38px 70px; }
  .drawer .close { position: sticky; top: 0; float: right; background: var(--card); border: 1px solid var(--line2); color: var(--muted);
    width: 36px; height: 36px; cursor: pointer; font-size: 20px; font-family: var(--sans); }
  .drawer .dpath { font-family: ui-monospace, Menlo, monospace; font-size: 11.5px; color: var(--faint); margin-bottom: 16px; word-break: break-all; }

  /* ---- letters to the editor (notes via GitHub issues) ---- */
  .letters-blurb { font-size: 14px; color: var(--muted); max-width: 720px; margin: 0 0 16px; }
  .letter { background: var(--card); border: 1px solid var(--line); border-left: 3px solid #b07219; border-radius: 10px;
    padding: 14px 18px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(28,25,23,.04); }
  .letter.addressed { opacity: .65; border-left-color: #4d7c2f; }
  .letter-meta { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; font-family: var(--sans); font-size: 12px; color: var(--faint); margin-bottom: 7px; }
  .letter-meta img { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line2); }
  .letter-meta .who { font-weight: 700; color: var(--muted); }
  .letter-meta .thread { margin-left: auto; font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: var(--faint); }
  .letter-meta .thread:hover { color: var(--ink); }
  .letter-subject { font-family: var(--display); font-weight: 700; font-size: 16.5px; margin-bottom: 4px; }
  .letter-body { font-size: 14px; color: var(--ink2); }
  .letter-body > :first-child { margin-top: 0; } .letter-body > :last-child { margin-bottom: 0; }
  .letters-empty { color: var(--faint); font-size: 14px; font-style: italic; }
  .letters-hint { font-family: var(--sans); font-size: 12.5px; color: var(--faint); }
  .write-note { display: inline-flex; align-items: center; gap: 7px; font-family: var(--sans); font-weight: 700; font-size: 12.5px;
    letter-spacing: .03em; border: 1px solid var(--ink); border-radius: 8px; padding: 7px 14px; background: var(--card); color: var(--ink); }
  .write-note:hover { background: var(--ink); color: var(--paper); text-decoration: none; }
  .drawer-letters { margin-top: 30px; border-top: 2px solid var(--rule); padding-top: 14px; }
  .drawer-letters h3 { font-family: var(--display); font-size: 17px; margin: 0 0 12px; }

  /* ---- image lightbox: tap any cover/photo to see the asset full-size ---- */
  .lightbox { position: fixed; inset: 0; z-index: 60; display: none; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; padding: 4vmin; background: rgba(20,18,16,.92); cursor: zoom-out; backdrop-filter: blur(3px); }
  .lightbox.open { display: flex; animation: fade .18s ease; }
  .lightbox img { max-width: 94vw; max-height: 84vh; object-fit: contain; background: #fff;
    box-shadow: 0 14px 60px rgba(0,0,0,.55); border-radius: 3px; }
  .lightbox-cap { font-family: var(--sans); font-size: 13px; letter-spacing: .02em; color: rgba(255,255,255,.82);
    text-align: center; max-width: 80ch; }
  .lightbox-cap a { color: rgba(255,255,255,.82); text-decoration: underline; }
  .lightbox-hint { font-family: var(--sans); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.5); }

  footer { font-family: var(--sans); color: var(--faint); font-size: 12px; text-align: center; margin-top: 56px; border-top: 1px solid var(--line); padding-top: 18px; }
</style>
</head>
<body>
<div class="wrap">
  <header class="masthead">
    <div class="mast-top">
      <span id="mt-left">Malabi · Shared Brain</span>
      <span>Vol. I</span>
      <span id="mt-date"></span>
    </div>
    <div class="mast-title"><span class="mast-icon">🍮</span>The Malabi Daily</div>
    <hr class="mast-rule" />
    <div class="mast-sub">
      <span>“<b>Make us money. Make it fun.</b>” 🌟</span>
      <span><a id="repo-link" href="#">All the knowledge that's fit to commit</a></span>
      <span><a class="play-link" href="https://malabi-museum-parallax.vercel.app" target="_blank" rel="noopener"><span class="play-tri">▶</span> Play the prototype</a></span>
      <span><button class="edition-toggle" id="layout-toggle" aria-pressed="false" title="Switch front-page layout"><span class="et-icon">⇄</span> <span id="et-label">Classic</span></button></span>
    </div>
  </header>

  <nav class="tabs">
    <button data-tab="front" class="active">Front Page</button>
    <button data-tab="status">Status</button>
    <button data-tab="map">Knowledge Map</button>
    <button data-tab="decisions">Decisions</button>
    <button data-tab="team">The Team</button>
    <button data-tab="archive">Archive</button>
  </nav>

  <section class="view active" id="front">
    <div id="front-classic">
      <div class="standfirst" id="standfirst"></div>
      <div class="index-bar" id="index-bar"></div>
      <p class="tldr catchup" id="tldr"></p>
      <div class="band"><span class="band-emoji">📰</span><h2 class="band-title">The latest</h2><span class="band-rule"></span></div>
      <div id="hero"></div>
      <div class="timeline" id="feed"></div>
    </div>
    <div id="front-times" hidden></div>
    <div class="band"><span class="band-emoji">✉️</span><h2 class="band-title">Letters to the Editor</h2><span class="band-rule"></span></div>
    <p class="letters-blurb">Notes from the team on any piece of info — extra context, corrections, new content,
      questions. The brain reads every open letter at the next sync, folds it into the right memory, and marks it addressed.</p>
    <div id="letters"></div>
  </section>

  <section class="view" id="status">
    <h2 class="section-head">🧭 Where things stand</h2>
    <div class="kanban" id="board"></div>
    <details class="status-full"><summary>Full status notes &amp; constraints</summary>
      <div class="card markdown" id="status-md"></div>
    </details>
  </section>

  <section class="view" id="map">
    <h2 class="section-head">The Knowledge Map</h2>
    <div class="graph-wrap">
      <svg id="graph"></svg>
      <div class="legend">
        <div class="row"><span class="dot" style="background:var(--s-shared)"></span> Shared</div>
        <div class="row"><span class="dot" style="background:var(--s-member)"></span> Member</div>
        <div class="row"><span class="dot" style="background:var(--s-project)"></span> Project</div>
        <div class="row"><span class="dot" style="background:var(--s-decision)"></span> Decision</div>
      </div>
      <div class="graph-hint">drag · click to read · scroll to zoom</div>
    </div>
  </section>

  <section class="view" id="decisions">
    <h2 class="section-head">The Decisions Ledger</h2>
    <div class="ledger" id="adr-list"></div>
  </section>

  <section class="view" id="team">
    <h2 class="section-head">The Masthead — Who We Are</h2>
    <div class="members" id="member-list"></div>
  </section>

  <section class="view" id="archive">
    <h2 class="section-head">The Memory Archive</h2>
    <div class="filters" id="mem-filters"></div>
    <div class="grid" id="mem-grid"></div>
  </section>

  <footer>
    The Malabi Daily · auto-typeset by <code>scripts/build-wiki.mjs</code> from <code>brain/**</code> ·
    new editions print on every commit.
  </footer>
</div>

<div class="lightbox" id="lightbox">
  <img id="lightbox-img" alt="" />
  <div class="lightbox-cap" id="lightbox-cap"></div>
  <div class="lightbox-hint">click anywhere or press Esc to close</div>
</div>

<div class="drawer-bg" id="drawer-bg"></div>
<aside class="drawer" id="drawer"><div class="drawer-inner">
  <button class="close" id="drawer-close">×</button>
  <div class="dpath" id="drawer-path"></div>
  <div class="markdown" id="drawer-body"></div>
  <div class="drawer-letters" id="drawer-letters"></div>
</div></aside>

<script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script>
const DATA = ${dataJson};
const byName = {};
DATA.memories.forEach(m => byName[m.name] = m);
DATA.decisions.forEach(d => byName[d.slug] = d);
(DATA.proposals||[]).forEach(p => byName[p.name] = p);
(DATA.researchDocs||[]).forEach(r => byName[r.name] = r);
const fileToEntry = {};
DATA.memories.forEach(m => fileToEntry[m.path] = m.name);
DATA.decisions.forEach(d => fileToEntry[d.path] = d.slug);
(DATA.proposals||[]).forEach(p => fileToEntry[p.path] = p.name);
(DATA.researchDocs||[]).forEach(r => fileToEntry[r.path] = r.name);

const scopeColor = { shared: getCss('--s-shared'), member: getCss('--s-member'), project: getCss('--s-project'), decision: getCss('--s-decision') };
function getCss(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// ---- markdown + wikilinks ----
function renderMd(text){
  const withLinks = (text||'').replace(/\\[\\[([a-z0-9-]+)\\]\\]/g, (m,slug)=>
    byName[slug] ? '<a class="wikilink" data-open="'+slug+'">'+slug+'</a>' : '<code>'+slug+'</code>');
  return marked.parse(withLinks);
}
function wireWikilinks(container){
  container.querySelectorAll('[data-open]').forEach(a=>
    a.addEventListener('click', e=>{ e.preventDefault(); openEntry(a.getAttribute('data-open')); }));
}

// ---- masthead / index ----
const longDate = (d)=>{ if(!d) return ''; const [y,m,day]=d.split('-').map(Number);
  const M=['January','February','March','April','May','June','July','August','September','October','November','December'];
  return M[m-1]+' '+day+', '+y; };
document.getElementById('mt-date').textContent = longDate(DATA.buildDate);
document.getElementById('mt-left').textContent = 'Malabi · Shared Brain';
document.getElementById('repo-link').href = DATA.repoUrl;

// desk → emoji + colour (warm, readable on the stone paper)
const DESK = {
  Decisions:  { emoji: '⚖️',  color: '#9d4664' },
  Research:   { emoji: '🔬',  color: '#3f5a8a' },
  Proposals:  { emoji: '💡',  color: '#6b5c9e' },
  Direction:  { emoji: '🧭',  color: '#2d6a4f' },
  Status:     { emoji: '📊',  color: '#b07219' },
  Features:   { emoji: '✨',  color: '#4d7c2f' },
  Assets:     { emoji: '🖼️', color: '#7a5a44' },
  Brain:      { emoji: '🧠',  color: '#7a5a44' },
  Fixes:      { emoji: '🔧',  color: '#b4531f' },
  Docs:       { emoji: '📄',  color: '#6b6660' },
  Updates:    { emoji: '📌',  color: '#8a8076' },
};
const desk = (n)=> DESK[n] || DESK.Updates;

// ---- index bar ----
const idx = [
  ['changes','Updates'], ['memories','Memories'], ['decisions','Decisions'], ['proposals','Proposals'], ['members','Team']
];
document.getElementById('index-bar').innerHTML = idx.map(([k,l])=>
  '<div class="box"><div class="n">'+DATA.stats[k]+'</div><div class="l">'+l+'</div></div>').join('');

const lastChange = DATA.history[0];
document.getElementById('standfirst').innerHTML =
  (lastChange ? 'Latest dispatch <b>'+longDate(lastChange.date)+'</b> · by <b>'+escapeHtml(lastChange.author)+'</b> · '+DATA.stats.changes+' on record' : "The team's shared brain");

// ---- where things stand: TL;DR + status board ----
const findSec = (re)=> DATA.statusSections.find(s=> re.test(s.heading));
const tldr = findSec(/tl;dr/i);
const tldrEl = document.getElementById('tldr');
tldrEl.innerHTML = tldr ? renderMd(tldr.body) : '';
wireWikilinks(tldrEl);

// Split a status section's markdown into its top-level bullets (one kanban card each).
function bulletItems(md){
  const items=[]; let cur=null;
  for(const raw of (md||'').split('\\n')){
    const m = raw.match(/^[-*]\\s+(.+)$/); // top-level bullet only (no indent)
    if(m){ if(cur!==null) items.push(cur); cur = m[1]; }
    else if(cur!==null && raw.trim()){ cur += ' ' + raw.trim(); } // fold wrapped/nested lines in
  }
  if(cur!==null) items.push(cur);
  return items.map(t=> t.trim()).filter(Boolean);
}
// Inline markdown (bold/links/code) + wikilinks, no surrounding <p>.
function renderInline(text){
  const withLinks = (text||'').replace(/\\[\\[([a-z0-9-]+)\\]\\]/g, (m,slug)=>
    byName[slug] ? '<a class="wikilink" data-open="'+slug+'">'+slug+'</a>' : '<code>'+slug+'</code>');
  return marked.parseInline(withLinks);
}

// Kanban columns, left→right as work flows.
const boardDefs = [
  { re:/next/i,         emoji:'👉', color:'#9d4664', label:'Next up' },
  { re:/progress|open/i,emoji:'⏳', color:'#b07219', label:'In progress' },
  { re:/done/i,         emoji:'✅', color:'#4d7c2f', label:'Done' },
  { re:/parked/i,       emoji:'🅿️', color:'#8a8076', label:'Parked' },
];
const boardEl = document.getElementById('board');
boardEl.innerHTML = boardDefs.map(d=>{
  const sec = findSec(d.re); if(!sec) return '';
  const items = bulletItems(sec.body);
  const cards = items.length
    ? items.map(t=> '<div class="kcard">'+renderInline(t)+'</div>').join('')
    : '<div class="kcard empty">—</div>';
  return '<div class="kcol" style="--kc:'+d.color+'">'+
    '<div class="kcol-head"><span class="kc-emoji">'+d.emoji+'</span>'+d.label+
    '<span class="count">'+items.length+'</span></div>'+
    '<div class="kcol-body">'+cards+'</div></div>';
}).join('');
wireWikilinks(boardEl);

// ---- what happened: hero + narrated timeline ----
function relDay(d){
  if(!d) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const [y,m,day] = d.split('-').map(Number);
  const diff = Math.round((today - new Date(y,m-1,day)) / 86400000);
  if(diff<=0) return 'Today'; if(diff===1) return 'Yesterday';
  if(diff<7) return diff+' days ago'; if(diff<14) return 'Last week';
  if(diff<31) return Math.round(diff/7)+' weeks ago'; return '';
}
function pill(c){ const k=desk(c.desk); return '<span class="deskpill" style="background:'+k.color+'">'+k.emoji+' '+c.desk+'</span>'; }
function flashMeta(c){
  return '<div class="flash-meta">'+pill(c)+
    '<span class="when">'+relDay(c.date)+' · '+longDate(c.date)+'</span>'+
    '<span class="who">'+escapeHtml(c.author)+'</span>'+
    '<a class="commit" href="'+c.url+'" target="_blank" rel="noopener" title="View commit '+c.hash+'">↗</a></div>';
}
function assetChip(a){
  const emo = a.kind==='decision' ? '⚖️' : a.kind==='proposal' ? '💡' : a.kind==='research' ? '🔬' : '📄';
  return '<a class="asset asset-'+a.kind+'" data-open="'+a.name+'">'+emo+' '+escapeHtml(a.label)+'</a>';
}
function assetsHtml(c){
  let html='';
  if(c.assets && c.assets.length)
    html += '<div class="assets"><span class="assets-label">📎 Assets</span>'+ c.assets.map(assetChip).join('') +'</div>';
  // wiki-style cross-links: what the primary memory asset connects to
  const prim = (c.assets||[]).find(a=> a.kind==='memory');
  if(prim && byName[prim.name]){
    const shown = new Set((c.assets||[]).map(a=> a.name));
    const rel = (byName[prim.name].links||[]).filter(s=> byName[s] && !shown.has(s)).slice(0,3);
    if(rel.length)
      html += '<div class="related"><span class="assets-label">🔗 Related</span>'+
        rel.map(s=> '<a class="wikilink" data-open="'+s+'">'+s+'</a>').join('') +'</div>';
  }
  return html;
}
// The most content-rich asset a commit touches — prefer proposals/research over index files.
function primaryReadable(c){
  const ranked = (c.assets||[]).filter(a => byName[a.name] && (byName[a.name].body||'').length > 120);
  // Prefer proposal/research (rich content) over terse memory files.
  return ranked.find(a => ['proposal','research'].includes(a.kind || byName[a.name]?.scope))
    || ranked[0] || null;
}
function introHtml(c){
  const readable = primaryReadable(c);
  const link = readable ? ' <a class="more" data-open="'+readable.name+'">Read full article →</a>' : '';
  if(!c.intro) return link ? '<p class="intro">'+link+'</p>' : '';
  return '<p class="intro">'+renderInline(c.intro)+link+'</p>';
}
function figureHtml(c, cls){
  if(!c.image) return '';
  const cap = c.image.page
    ? '<a href="'+c.image.page+'" target="_blank" rel="noopener">'+escapeHtml(c.image.credit||c.image.title||'Wikipedia')+'</a>'
    : escapeHtml(c.image.credit||c.image.title||'');
  return '<figure class="'+cls+'"><img loading="lazy" src="'+c.image.src+'" alt="'+escapeHtml(c.image.title||'')+'">'+
    '<figcaption>'+(c.image.local?'🗂 ':'📷 ')+cap+'</figcaption></figure>';
}
function flashCard(c, cls, style){
  const hero = cls==='hero';
  const readable = primaryReadable(c);
  // Headline opens the drawer when there's rich content to read; falls back to commit link.
  const titleLink = readable
    ? '<a data-open="'+readable.name+'">'+escapeHtml(c.headline)+'</a>'
    : '<a href="'+c.url+'" target="_blank" rel="noopener">'+escapeHtml(c.headline)+'</a>';
  return '<div class="'+cls+'" style="'+style+'">'+
    '<div class="'+(hero?'hero-main':'')+'">'+
    (hero ? figureHtml(c,'hero-photo') : figureHtml(c,'thumb'))+
    flashMeta(c)+
    '<h3>'+titleLink+'</h3>'+
    '<div class="summary">'+renderInline(c.summary)+'</div>'+
    introHtml(c)+
    assetsHtml(c)+'</div></div>';
}

if(lastChange)
  document.getElementById('hero').innerHTML = flashCard(lastChange, 'hero', '--hero:'+desk(lastChange.desk).color);

// ---- newspaper layout engine ----
function sizeFor(c){
  if(['Proposals','Research','Direction','Decisions'].includes(c.desk)) return 'lg';
  if(['Features','Assets'].includes(c.desk)) return 'md';
  return 'sm';
}
function packRows(items){
  const rows=[], n=items.length; let i=0;
  while(i<n){
    const c=items[i], sz=sizeFor(c);
    if(sz==='lg'){
      const nxt=items[i+1];
      rows.push(nxt?[{c,span:8},{c:nxt,span:4}]:[{c,span:8}]); i+=nxt?2:1;
    } else if(sz==='md'){
      const nxt=items[i+1];
      if(nxt&&sizeFor(nxt)!=='lg'){rows.push([{c,span:6},{c:nxt,span:6}]);i+=2;}
      else{rows.push([{c,span:6}]);i++;}
    } else {
      const batch=[];
      while(i<n&&sizeFor(items[i])==='sm'&&batch.length<3){batch.push(items[i]);i++;}
      const bn=batch.length;
      if(bn===1) rows.push([{c:batch[0],span:12,strip:true}]);
      else if(bn===2) rows.push([{c:batch[0],span:6},{c:batch[1],span:6}]);
      else rows.push([{c:batch[0],span:4},{c:batch[1],span:4},{c:batch[2],span:4}]);
    }
  }
  return rows;
}
function niCoverHtml(c,span){
  if(!c.image||span===12) return '';
  const img=(span>=8&&c.imageWide)?c.imageWide:c.image;
  const cap=img.page
    ?'<figcaption><a href="'+img.page+'" target="_blank" rel="noopener">'+escapeHtml(img.title||'')+'</a></figcaption>'
    :(img.title?'<figcaption>'+escapeHtml(img.title)+'</figcaption>':'');
  return '<figure class="ni-cover"><img loading="lazy" src="'+img.src+'" alt="'+escapeHtml(img.title||'')+'">'+cap+'</figure>';
}
function newsItemHtml({c,span,strip}){
  const readable=primaryReadable(c);
  const titleLink=readable
    ?'<a data-open="'+readable.name+'">'+escapeHtml(c.headline)+'</a>'
    :'<a href="'+c.url+'" target="_blank" rel="noopener">'+escapeHtml(c.headline)+'</a>';
  const cls='ni s'+span+(strip?' strip':'');
  const readLink=readable?'<a class="ni-read" data-open="'+readable.name+'">Read full article →</a>':'';
  return '<div class="'+cls+'">'+
    niCoverHtml(c,span)+
    flashMeta(c)+
    '<div class="ni-head">'+titleLink+'</div>'+
    (c.summary&&!strip?'<div class="ni-body">'+renderInline(c.summary)+'</div>':'')+
    (!strip?readLink:'')+
    '</div>';
}

const groups=[]; let cur=null;
for(const c of DATA.history.slice(1)){
  if(!cur||cur.date!==c.date){cur={date:c.date,items:[]};groups.push(cur);}
  cur.items.push(c);
}
document.getElementById('feed').innerHTML = groups.map(g=>{
  const rel=relDay(g.date), rows=packRows(g.items);
  return '<div class="news-day">'+
    '<div class="news-dayband"><span class="nd-rule"></span>'+
    '<span class="nd-label">'+(rel?rel+' · ':'')+longDate(g.date)+'</span>'+
    '<span class="nd-rule"></span></div>'+
    rows.map(row=>'<div class="news-row">'+row.map(item=>newsItemHtml(item)).join('')+'</div>').join('')+
    '</div>';
}).join('');

wireWikilinks(document.getElementById('hero'));
wireWikilinks(document.getElementById('feed'));

// ---- "Newspaper" front: a NYT-style three-column front page over the same
// dispatches, offered as an alternate edition behind the Classic/Newspaper switch. ----
function nytHeadLink(c){
  const readable = primaryReadable(c);
  return readable
    ? '<a data-open="'+readable.name+'">'+escapeHtml(c.headline)+'</a>'
    : '<a href="'+c.url+'" target="_blank" rel="noopener">'+escapeHtml(c.headline)+'</a>';
}
function nytKicker(c, live){
  if(live){
    const when = relDay(c.date) || longDate(c.date);
    return '<div class="nyt-kicker live"><span class="live-dot">●</span> Latest · '+escapeHtml(when)+'</div>';
  }
  return '<div class="nyt-kicker">'+escapeHtml(c.desk)+'</div>';
}
function nytFigure(c, wide){
  if(!c.image) return '';
  const img = (wide && c.imageWide) ? c.imageWide : c.image;
  const cap = img.page
    ? '<figcaption><a href="'+img.page+'" target="_blank" rel="noopener">'+escapeHtml(img.credit||img.title||'')+'</a></figcaption>'
    : (img.credit||img.title ? '<figcaption>'+escapeHtml(img.credit||img.title)+'</figcaption>' : '');
  return '<figure class="nyt-figure"><img loading="lazy" src="'+img.src+'" alt="'+escapeHtml(img.title||'')+'">'+cap+'</figure>';
}
function nytByline(c){
  const day = relDay(c.date) || longDate(c.date);
  const when = c.time ? day+', '+c.time : day;
  return '<div class="nyt-byline">By <span class="nyt-author">'+escapeHtml(c.author)+'</span>'+
    '<span class="nyt-time">'+escapeHtml(when)+'</span>'+
    '<a class="nyt-commit" href="'+c.url+'" target="_blank" rel="noopener" title="View commit '+c.hash+'">↗</a></div>';
}
function nytArt(c, cls, opts){
  opts = opts || {};
  return '<article class="nyt-art '+(cls||'')+'">'+
    (opts.image ? nytFigure(c, opts.wide) : '')+
    nytKicker(c, opts.live)+
    '<h3 class="nyt-hl">'+nytHeadLink(c)+'</h3>'+
    (opts.sum !== false && c.summary ? '<p class="nyt-sum">'+renderInline(c.summary)+'</p>' : '')+
    nytByline(c)+
    '</article>';
}
function buildTimesFront(){
  const ft = document.getElementById('front-times');
  const used = new Set();
  const take = c => { if(c) used.add(c.hash); return c; };
  const all = DATA.history.slice();
  if(!all.length){ ft.innerHTML = '<p class="standfirst">No dispatches yet.</p>'; return; }
  const nextImg = () => all.find(c => c.image && !used.has(c.hash));
  // Center = the strongest image-led dispatch; right feature = the next one.
  const center  = take(nextImg() || all[0]);
  const feature = take(nextImg());
  const rest    = all.filter(c => !used.has(c.hash));
  const lead     = rest.shift();          // big text lead, top-left
  const leftMore = rest.splice(0, 3);     // stacked under the lead
  const rightMore= rest.splice(0, 2);     // under the feature
  const bottom   = rest.slice(0, 8);      // lower-fold grid

  const left = '<div class="nyt-col left">'+
    (lead ? nytArt(lead, 'nyt-lead', {live:true}) : '')+
    leftMore.map(c => nytArt(c, '')).join('')+'</div>';
  const mid = '<div class="nyt-col center">'+
    nytArt(center, 'nyt-center', {image:true, wide:true})+'</div>';
  const right = '<div class="nyt-col right">'+
    (feature ? nytArt(feature, 'nyt-feature', {image:true}) : '')+
    rightMore.map(c => nytArt(c, '')).join('')+'</div>';
  const grid = bottom.length
    ? '<div class="nyt-more-rule"></div><div class="nyt-grid">'+bottom.map(c => nytArt(c, '', {sum:false})).join('')+'</div>'
    : '';
  ft.innerHTML = '<div class="nyt-top">'+left+mid+right+'</div>'+grid;
  wireWikilinks(ft);
}

// ---- edition toggle (two-state, persisted in localStorage) ----
(function(){
  const btn = document.getElementById('layout-toggle');
  const label = document.getElementById('et-label');
  const classic = document.getElementById('front-classic');
  const times = document.getElementById('front-times');
  const NAME = { classic: 'Classic', times: 'Paper' };
  let built = false, mode = 'classic';
  function apply(m){
    mode = m;
    const isTimes = m === 'times';
    if(isTimes && !built){ buildTimesFront(); built = true; }
    classic.hidden = isTimes;
    times.hidden = !isTimes;
    label.textContent = NAME[m];
    btn.setAttribute('aria-pressed', String(isTimes));
    try { localStorage.setItem('malabi-front-layout', m); } catch(e){}
  }
  btn.addEventListener('click', () => apply(mode === 'times' ? 'classic' : 'times'));
  let saved = 'classic';
  try { saved = localStorage.getItem('malabi-front-layout') || 'classic'; } catch(e){}
  apply(saved);
})();

// ---- image lightbox: tap any cover / hero photo / in-article image to see it
// large and clear (concept art, screenshots) — covers are cropped, this isn't. ----
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCap = document.getElementById('lightbox-cap');
function openLightbox(src, cap){ lbImg.src = src; lbCap.textContent = cap || ''; lb.classList.add('open'); }
function closeLightbox(){ lb.classList.remove('open'); lbImg.removeAttribute('src'); }
lb.addEventListener('click', closeLightbox);
document.addEventListener('click', (e)=>{
  const img = e.target.closest('.ni-cover img, .hero-photo img, .nyt-figure img, .markdown img');
  if(!img || lb.contains(img)) return;
  e.preventDefault();
  openLightbox(img.currentSrc || img.src, img.getAttribute('alt'));
});
// Esc closes the lightbox first (capture phase) without also closing the drawer.
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape' && lb.classList.contains('open')){ e.stopPropagation(); closeLightbox(); }
}, true);

// ---- status ----
const statusEl = document.getElementById('status-md');
statusEl.innerHTML = renderMd(DATA.statusBody);
wireWikilinks(statusEl);

// ---- decisions ----
document.getElementById('adr-list').innerHTML = DATA.decisions.map(d=>
  '<div class="adr" data-open="'+d.slug+'">'+
  '<div class="num">'+String(d.num).padStart(2,'0')+'</div>'+
  '<div><h3>'+escapeHtml(d.title.replace(/^\\d+\\.?\\s*/,''))+'</h3><div class="sub">'+(d.created||'')+'</div></div>'+
  '<span class="badge '+d.status+'">'+d.status+'</span></div>').join('');
document.querySelectorAll('#adr-list .adr').forEach(el=>
  el.addEventListener('click', ()=> openEntry(el.getAttribute('data-open'))));

// ---- team ----
const swatch = [getCss('--s-shared'), getCss('--s-member'), getCss('--s-project'), getCss('--s-decision')];
document.getElementById('member-list').innerHTML = DATA.members.map((m,i)=>
  '<div class="member">'+
  (m.avatar
    ? '<div class="avatar"><img src="'+m.avatar+'" alt="'+escapeHtml(m.name)+'" loading="lazy"></div>'
    : '<div class="avatar" style="background:'+swatch[i%swatch.length]+'">'+m.name.charAt(0)+'</div>')+
  '<h3>'+m.name+'</h3><div class="role">'+escapeHtml(m.role||'')+'</div>'+
  '<div class="bio">'+escapeHtml(m.description||'')+'</div>'+
  (m.memoryName?'<div class="open" data-open="'+m.memoryName+'">read dossier →</div>':'')+
  '</div>').join('');
document.querySelectorAll('#member-list [data-open]').forEach(el=>
  el.addEventListener('click', ()=> openEntry(el.getAttribute('data-open'))));

// ---- archive ----
const scopes = ['all', ...new Set(DATA.memories.map(m=>m.scope))];
let activeScope = 'all';
document.getElementById('mem-filters').innerHTML = scopes.map(s=>
  '<button data-scope="'+s+'" class="'+(s==='all'?'active':'')+'">'+s+'</button>').join('');
function renderGrid(){
  const items = DATA.memories.filter(m=> activeScope==='all' || m.scope===activeScope)
    .sort((a,b)=> a.name.localeCompare(b.name));
  document.getElementById('mem-grid').innerHTML = items.map(m=>
    '<div class="mcard" data-open="'+m.name+'"><div class="mname">'+escapeHtml(m.name)+'</div>'+
    '<div class="mdesc">'+escapeHtml(m.description)+'</div>'+
    '<div class="chips"><span class="chip scope-'+m.scope+'">'+m.scope+'</span><span class="chip">@'+m.owner+'</span></div></div>').join('');
  document.querySelectorAll('#mem-grid .mcard').forEach(el=>
    el.addEventListener('click', ()=> openEntry(el.getAttribute('data-open'))));
}
document.querySelectorAll('#mem-filters button').forEach(b=>
  b.addEventListener('click', ()=>{ activeScope=b.getAttribute('data-scope');
    document.querySelectorAll('#mem-filters button').forEach(x=>x.classList.toggle('active', x===b)); renderGrid(); }));
renderGrid();

// ---- letters to the editor (utterances: post in-page, no backend) ----
// Notes live as GitHub issues + comments, written straight from the page via the
// utterances widget (GitHub login handled by the utterances app — no token, no
// infra). One issue per piece, titled "[note] <slug>" (slug = the memory/decision,
// or "general"); each comment is a note. The brain ingests these at sync and an
// on-issue Action pings Telegram the moment one is posted. The mailbag below polls
// the public API gently (unauthenticated = 60 req/hr/IP, so ~every 90s, one call).
const REPO = DATA.repoUrl.replace('https://github.com/', '').replace(/\\/$/, '');
const API = DATA.repoUrl.replace('https://github.com/', 'https://api.github.com/repos/').replace(/\\/$/, '');
const NOTE_RE = /^\\[note\\]\\s*([a-z0-9-]+)/i; // tolerant: "[note] slug" or "[note] slug: subject"

// Mount the utterances comment box (read existing notes + post a new one in place).
function mountUtterances(container, term){
  container.innerHTML = '';
  const s = document.createElement('script');
  s.src = 'https://utteranc.es/client.js';
  s.async = true; s.crossOrigin = 'anonymous';
  s.setAttribute('repo', REPO);
  s.setAttribute('issue-term', term);   // literal term → find/create issue titled exactly this
  s.setAttribute('label', 'daily-note');
  s.setAttribute('theme', 'github-light');
  container.appendChild(s);
}
const noteTerm = (slug) => '[note] ' + slug;

// The mailbag = note threads (one per piece), newest activity first. One API call.
function loadThreads(){
  return fetch(API + '/issues?labels=daily-note&state=all&per_page=100&sort=updated&direction=desc')
    .then(r => r.ok ? r.json() : [])
    .then(list => (Array.isArray(list) ? list : [])
      .filter(i => !i.pull_request && NOTE_RE.test(i.title || ''))
      .map(i => {
        const m = (i.title || '').match(NOTE_RE);
        const slug = (m ? m[1] : 'general').toLowerCase();
        const subj = (i.title || '').replace(/^\\[note\\]\\s*[a-z0-9-]+\\s*:?\\s*/i, '').trim();
        return { slug, subject: subj, author: i.user ? i.user.login : 'someone',
          avatar: i.user ? i.user.avatar_url : '', url: i.html_url, n: i.number,
          open: i.state === 'open', notes: i.comments || 0,
          date: (i.updated_at || i.created_at || '').slice(0, 10) };
      }))
    .catch(() => []);
}
function threadCard(t){
  const onArticle = t.slug !== 'general' && byName[t.slug];
  const title = t.subject || (onArticle ? 'Notes on ' + t.slug : 'General notes');
  const openArt = onArticle
    ? ' data-open="' + t.slug + '"'
    : '';
  return '<div class="letter' + (t.open ? '' : ' addressed') + '"' + openArt +
    ' style="cursor:' + (onArticle ? 'pointer' : 'default') + '">' +
    '<div class="letter-meta">' +
    (t.avatar ? '<img src="' + t.avatar + '" alt="" loading="lazy">' : '') +
    '<span class="who">' + escapeHtml(t.author) + '</span>' +
    '<span>updated ' + longDate(t.date) + '</span>' +
    (t.open ? '' : '<span class="badge accepted">✓ addressed</span>') +
    (onArticle ? '<a class="asset" data-open="' + t.slug + '">📄 ' + escapeHtml(t.slug) + '</a>' : '') +
    '<a class="thread" href="' + t.url + '" target="_blank" rel="noopener">#' + t.n +
    ' · ' + t.notes + ' note' + (t.notes === 1 ? '' : 's') + ' ↗</a></div>' +
    '<div class="letter-subject">' + escapeHtml(title) + '</div>' +
    (onArticle ? '<div class="letters-hint">Open the article to read every note and add yours in place →</div>' : '') +
    '</div>';
}
// Static shell, mounted once: a thread list that refreshes + a general write box
// that does NOT (so it never resets while someone's mid-note).
const lettersEl = document.getElementById('letters');
lettersEl.innerHTML =
  '<div id="thread-list"><p class="letters-empty">Checking the mailbag…</p></div>' +
  '<div class="letters-general"><div class="letters-hint" style="margin:18px 0 8px">' +
  '✍️ Write to the editor — a general note (sign in with GitHub, post right here):</div>' +
  '<div id="utter-general"></div></div>';
mountUtterances(document.getElementById('utter-general'), noteTerm('general'));
const threadListEl = document.getElementById('thread-list');
function refreshMailbag(){
  loadThreads().then(threads => {
    const open = threads.filter(t => t.open);
    const addressed = threads.filter(t => !t.open).slice(0, 4);
    let html = '';
    if(open.length) html += open.map(threadCard).join('');
    else html += '<p class="letters-empty">No open letters right now — add a note on any piece, or write a general one below.</p>';
    if(addressed.length)
      html += '<div class="letters-hint" style="margin:14px 0 6px">Recently addressed</div>' +
        addressed.map(threadCard).join('');
    threadListEl.innerHTML = html;
    wireWikilinks(threadListEl);
    threadListEl.querySelectorAll('.letter[data-open]').forEach(el =>
      el.addEventListener('click', e => { if(e.target.closest('a')) return; openEntry(el.getAttribute('data-open')); }));
  });
}
refreshMailbag();
// Near-real-time: refresh the thread list on a gentle timer + when the tab refocuses.
function frontIsActive(){ const f = document.getElementById('front'); return f && f.classList.contains('active'); }
setInterval(() => { if(!document.hidden && frontIsActive()) refreshMailbag(); }, 90000);
document.addEventListener('visibilitychange', () => { if(!document.hidden && frontIsActive()) refreshMailbag(); });

// ---- drawer ----
const drawer = document.getElementById('drawer'), dbg = document.getElementById('drawer-bg');
function renderDrawerLetters(id){
  const lt = document.getElementById('drawer-letters');
  lt.innerHTML = '<h3>✉️ Letters on this piece</h3>' +
    '<p class="letters-hint" style="margin:-4px 0 10px">Sign in with GitHub and add a note right here — ' +
    'extra context, a correction, new content, a question. The team gets pinged instantly; the brain folds it in at the next sync.</p>' +
    '<div id="utter-drawer"></div>';
  mountUtterances(document.getElementById('utter-drawer'), noteTerm(id));
}
function openEntry(id){
  const e = byName[id]; if(!e) return;
  document.getElementById('drawer-path').textContent = e.path;
  const bodyEl = document.getElementById('drawer-body');
  bodyEl.innerHTML = renderMd(e.body);
  wireWikilinks(bodyEl);
  renderDrawerLetters(id);
  drawer.scrollTop = 0;
  drawer.classList.add('open'); dbg.classList.add('open');
  // Reflect the open article in the URL so it can be linked to / shared.
  history.replaceState(null, '', '#/' + encodeURIComponent(id));
}
function closeDrawer(){
  drawer.classList.remove('open'); dbg.classList.remove('open');
  if(location.hash) history.replaceState(null, '', location.pathname + location.search);
}
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
dbg.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });

// ---- deep links: open a specific article straight from a URL (#/<slug>) ----
// Lets the Telegram digest (and any shared link) point at the relevant article.
function applyHash(){
  const m = (location.hash || '').match(/^#\\/(.+)$/);
  if(!m) return;
  const slug = decodeURIComponent(m[1]);
  if(byName[slug]) openEntry(slug);
}
window.addEventListener('hashchange', applyHash);
applyHash();

// ---- tabs ----
document.querySelectorAll('nav.tabs button').forEach(b=>
  b.addEventListener('click', ()=>{ const tab=b.getAttribute('data-tab');
    document.querySelectorAll('nav.tabs button').forEach(x=>x.classList.toggle('active', x===b));
    document.querySelectorAll('section.view').forEach(s=>s.classList.toggle('active', s.id===tab));
    window.scrollTo({top:0}); if(tab==='map') drawGraph(); }));

// ---- knowledge graph (d3 force) ----
let graphDrawn = false;
function drawGraph(){
  if(graphDrawn) return; graphDrawn = true;
  const svg = d3.select('#graph'), el = document.getElementById('graph');
  const W = el.clientWidth, H = el.clientHeight;
  svg.attr('viewBox', [0,0,W,H]);
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3,3]).on('zoom', ev=> g.attr('transform', ev.transform)));
  const nodes = DATA.graph.nodes.map(n=>({...n})), links = DATA.graph.links.map(l=>({...l}));
  const degree = {}; links.forEach(l=>{ degree[l.source]=(degree[l.source]||0)+1; degree[l.target]=(degree[l.target]||0)+1; });
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d=>d.id).distance(72).strength(.55))
    .force('charge', d3.forceManyBody().strength(-230))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collide', d3.forceCollide(22));
  const link = g.append('g').selectAll('line').data(links).join('line').attr('class','link');
  const node = g.append('g').selectAll('g').data(nodes).join('g').attr('class','node')
    .call(d3.drag()
      .on('start',(ev,d)=>{ if(!ev.active) sim.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag',(ev,d)=>{ d.fx=ev.x; d.fy=ev.y; })
      .on('end',(ev,d)=>{ if(!ev.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }));
  node.append('circle').attr('r', d=> 7 + Math.min(8,(degree[d.id]||0)*1.6))
    .attr('fill', d=> scopeColor[d.group] || scopeColor.shared).on('click',(ev,d)=> openEntry(d.id));
  node.append('title').text(d=>d.id);
  node.append('text').attr('class','node-label').attr('x',12).attr('y',4).text(d=>d.label);
  sim.on('tick', ()=>{
    link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    node.attr('transform', d=> 'translate('+d.x+','+d.y+')');
  });
}
</script>
</body>
</html>`;
}
