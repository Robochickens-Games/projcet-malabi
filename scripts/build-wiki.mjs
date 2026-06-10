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

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAIN = join(ROOT, "brain");
const OUT_DIR = join(ROOT, "site");

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

const WIKILINK = /\[\[([a-z0-9-]+)\]\]/g;
function extractLinks(body) {
  const links = new Set();
  let m;
  while ((m = WIKILINK.exec(body)) !== null) links.add(m[1]);
  return [...links];
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
    body,
    links: extractLinks(body),
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
  });
}
decisions.sort((a, b) => a.num - b.num);

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
  members.push({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    role: role ? role.description.replace(/^.*role[^—-]*[—-]\s*/i, "").trim() : "",
    description: role ? role.description : "",
    memoryName: role ? role.name : null,
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
const statusBody = readDoc("brain/memory/shared/project-status.md");

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
const statusSections = splitSections(statusBody);

// ---- git history (the "news feed": what changed, when, by whom) ------------

const repoUrl = "https://github.com/Robochickens-Games/projcet-malabi";

// Map a conventional-commit-ish prefix to a newspaper "desk".
function deskFor(subject) {
  const p = (subject.split(":")[0] || "").toLowerCase().trim();
  if (p.startsWith("decision") || p.startsWith("adr")) return "Decisions";
  if (p.startsWith("research")) return "Research";
  if (p.startsWith("status")) return "Status";
  if (p.startsWith("feat")) return "Features";
  if (p.startsWith("brain")) return "Brain";
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

// Strip a trailing "(... 2026 ...)" parenthetical and dangling dashes from a headline.
function cleanHead(h) {
  return h
    .replace(/\s*\([^)]*\d{4}[^)]*\)\s*$/, "")
    .replace(/\s*[—–-]\s*$/, "")
    .trim();
}

// Turn a commit into a natural-language sentence: who did what, and the gist.
const DESK_VERB = {
  Decisions: "recorded a decision",
  Research: "ran a round of research",
  Status: "refreshed where the project stands",
  Features: "shipped a change",
  Brain: "updated the brain",
  Fixes: "fixed an issue",
  Docs: "updated the docs",
  Updates: "pushed an update",
};
// Git author → the team's first-name slug.
function displayAuthor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("dor")) return "Dor";
  if (n.includes("gid")) return "Gidi";
  if (n.includes("ohad")) return "Ohad";
  return (name || "Someone").split(/\s+/)[0];
}

function narrate(c) {
  const lead = `${c.author} ${DESK_VERB[c.desk] || "pushed an update"}`;
  if (c.desk === "Status") return lead + ".";
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
  return `${lead}. ${detail}`;
}

const history = [];
try {
  const SEP = "\x1f";
  const raw = execSync(
    `git log --no-merges -n 80 --date=format:'%Y-%m-%d' ` +
      `--pretty=format:'@@COMMIT@@%H${SEP}%an${SEP}%ad${SEP}%s' --name-only -- brain`,
    { cwd: ROOT, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
  );
  for (const block of raw.split("@@COMMIT@@")) {
    if (!block.trim()) continue;
    const lines = block.split("\n");
    const [hash, author, date, subject] = lines[0].split(SEP);
    const files = lines
      .slice(1)
      .map((l) => l.trim())
      .filter((l) => l && l.startsWith("brain/"));
    if (!subject) continue;
    const item = {
      hash: hash.slice(0, 7),
      author: displayAuthor(author),
      date,
      subject,
      headline: headline(subject),
      desk: deskFor(subject),
      files,
      url: `${repoUrl}/commit/${hash}`,
    };
    item.summary = narrate(item);
    history.push(item);
  }
} catch (e) {
  console.warn("git history unavailable:", e.message);
}
const buildDate = history[0]?.date || "";

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
  members,
  history,
  graph: { nodes: graphNodes, links: graphLinks },
  stats: {
    memories: memories.length,
    decisions: decisions.length,
    members: members.length,
    links: graphLinks.length,
    changes: history.length,
  },
};

// ---- render ----------------------------------------------------------------

const json = JSON.stringify(payload).replace(/</g, "\\u003c");
const html = renderHtml(json);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.html"), html);
writeFileSync(join(OUT_DIR, ".nojekyll"), "");
console.log(
  `Built site/index.html — ${payload.stats.memories} memories, ` +
    `${payload.stats.decisions} decisions, ${payload.stats.members} members, ` +
    `${payload.stats.changes} changes, ${payload.stats.links} links.`
);

function renderHtml(dataJson) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>The Malabi Brain — Project Gazette</title>
<meta name="description" content="A newspaper-style, always-current record of the Malabi team's shared knowledge: what changed, when, and why." />
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
    font-family: var(--serif);
    font-size: 17px; line-height: 1.6;
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
  .mast-rule { border: 0; border-top: 2px solid var(--rule); border-bottom: 1px solid var(--rule); height: 4px; margin: 10px 0 0; }
  .mast-sub { font-family: var(--sans); font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--muted); display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; padding: 9px 0; border-bottom: 1px solid var(--rule); }
  .mast-sub b { color: var(--ink); }

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
  .kcard { background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--kc); border-radius: 9px; padding: 10px 12px; margin-bottom: 9px;
    font-size: 13.5px; line-height: 1.5; color: var(--muted); box-shadow: 0 1px 2px rgba(28,25,23,.04); }
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
  .hero h3 a:hover { text-decoration: underline; }

  .deskpill { display: inline-flex; align-items: center; gap: 5px; font-family: var(--sans); font-size: 10.5px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; color: #fff; }
  .summary { font-family: var(--serif); font-size: 16px; line-height: 1.5; color: var(--ink2); margin: 7px 0 9px; }
  .byline { font-family: var(--sans); font-size: 12px; color: var(--faint); }
  .byline code { font-family: ui-monospace, Menlo, monospace; font-size: 11px; }
  .files { font-family: var(--sans); font-size: 11.5px; margin-top: 9px; display: flex; flex-wrap: wrap; gap: 6px; }
  .file { background: var(--tint); border: 1px solid var(--line); border-radius: 6px; padding: 1px 8px; color: var(--muted); cursor: pointer; }
  .file:hover { border-color: var(--line2); color: var(--ink); }
  .file.nolink { cursor: default; opacity: .65; }

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
  .markdown { font-size: 17px; }
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
    font-family: var(--display); font-size: 28px; font-weight: 700; color: var(--paper); }
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
    <div class="mast-title">The Malabi Brain</div>
    <hr class="mast-rule" />
    <div class="mast-sub">
      <span>“<b>Make us money. Make it fun.</b>” 🌟</span>
      <span><a id="repo-link" href="#">All the knowledge that's fit to commit</a></span>
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
    <div class="standfirst" id="standfirst"></div>
    <div class="index-bar" id="index-bar"></div>

    <div class="band"><span class="band-emoji">🧭</span><h2 class="band-title">Where things stand</h2><span class="band-rule"></span></div>
    <p class="tldr" id="tldr"></p>
    <div class="kanban" id="board"></div>

    <div class="band"><span class="band-emoji">📰</span><h2 class="band-title">What's been happening</h2><span class="band-rule"></span></div>
    <div id="hero"></div>
    <div class="timeline" id="feed"></div>
  </section>

  <section class="view" id="status">
    <div class="card columns-2 markdown" id="status-md"></div>
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
    The Malabi Brain · auto-typeset by <code>scripts/build-wiki.mjs</code> from <code>brain/**</code> ·
    new editions print on every commit.
  </footer>
</div>

<div class="drawer-bg" id="drawer-bg"></div>
<aside class="drawer" id="drawer"><div class="drawer-inner">
  <button class="close" id="drawer-close">×</button>
  <div class="dpath" id="drawer-path"></div>
  <div class="markdown" id="drawer-body"></div>
</div></aside>

<script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script>
const DATA = ${dataJson};
const byName = {};
DATA.memories.forEach(m => byName[m.name] = m);
DATA.decisions.forEach(d => byName[d.slug] = d);
const fileToEntry = {};
DATA.memories.forEach(m => fileToEntry[m.path] = m.name);
DATA.decisions.forEach(d => fileToEntry[d.path] = d.slug);

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
  Decisions: { emoji: '⚖️', color: '#9d4664' },
  Research:  { emoji: '🔬', color: '#3f5a8a' },
  Status:    { emoji: '📊', color: '#b07219' },
  Features:  { emoji: '✨', color: '#4d7c2f' },
  Brain:     { emoji: '🧠', color: '#7a5a44' },
  Fixes:     { emoji: '🔧', color: '#b4531f' },
  Docs:      { emoji: '📄', color: '#6b6660' },
  Updates:   { emoji: '📌', color: '#8a8076' },
};
const desk = (n)=> DESK[n] || DESK.Updates;

// ---- index bar ----
const idx = [
  ['changes','Dispatches'], ['memories','Memories'], ['decisions','Decisions'], ['members','Team'], ['links','Links']
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
function filesHtml(c){
  if(!c.files.length) return '';
  const files = c.files.slice(0,4).map(f=>{
    const id=fileToEntry[f]; const name=f.split('/').pop().replace(/\\.md$/,'');
    return '<span class="file'+(id?'':' nolink')+'" data-file="'+escapeHtml(f)+'">'+escapeHtml(name)+'</span>';
  }).join('');
  const more = c.files.length>4 ? '<span class="file nolink">+'+(c.files.length-4)+'</span>' : '';
  return '<div class="files">'+files+more+'</div>';
}

if(lastChange){
  const k = desk(lastChange.desk);
  document.getElementById('hero').innerHTML =
    '<div class="hero" style="--hero:'+k.color+'"><div class="hero-emoji">'+k.emoji+'</div><div class="hero-main">'+
    pill(lastChange)+
    '<h3><a href="'+lastChange.url+'" target="_blank" rel="noopener">'+escapeHtml(lastChange.headline)+'</a></h3>'+
    '<p class="summary">'+escapeHtml(lastChange.summary)+'</p>'+
    '<div class="byline">'+relDay(lastChange.date)+' · '+longDate(lastChange.date)+' · <code>'+lastChange.hash+'</code></div>'+
    filesHtml(lastChange)+'</div></div>';
}

const groups=[]; let cur=null;
for(const c of DATA.history.slice(1)){
  if(!cur || cur.date!==c.date){ cur={date:c.date, items:[]}; groups.push(cur); }
  cur.items.push(c);
}
document.getElementById('feed').innerHTML = groups.map(g=>{
  const rel = relDay(g.date);
  return '<div class="tl-day"><div class="tl-daterow">'+
    (rel?'<span class="tl-rel">'+rel+'</span>':'')+'<span class="tl-abs">'+longDate(g.date)+'</span></div>'+
    '<div class="tl-items">'+ g.items.map(c=>{
      const k=desk(c.desk);
      return '<div class="tl-item" style="--ti:'+k.color+'">'+pill(c)+
        '<h3><a href="'+c.url+'" target="_blank" rel="noopener">'+escapeHtml(c.headline)+'</a></h3>'+
        '<p class="summary">'+escapeHtml(c.summary)+'</p>'+
        '<div class="byline">by '+escapeHtml(c.author)+' · <code>'+c.hash+'</code></div>'+
        filesHtml(c)+'</div>';
    }).join('') +'</div></div>';
}).join('');

document.querySelectorAll('#front .file').forEach(el=>
  el.addEventListener('click', ()=>{ const id=fileToEntry[el.getAttribute('data-file')]; if(id) openEntry(id); }));

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
  '<div class="avatar" style="background:'+swatch[i%swatch.length]+'">'+m.name.charAt(0)+'</div>'+
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

// ---- drawer ----
const drawer = document.getElementById('drawer'), dbg = document.getElementById('drawer-bg');
function openEntry(id){
  const e = byName[id]; if(!e) return;
  document.getElementById('drawer-path').textContent = e.path;
  const bodyEl = document.getElementById('drawer-body');
  bodyEl.innerHTML = renderMd(e.body);
  wireWikilinks(bodyEl);
  drawer.scrollTop = 0;
  drawer.classList.add('open'); dbg.classList.add('open');
}
function closeDrawer(){ drawer.classList.remove('open'); dbg.classList.remove('open'); }
document.getElementById('drawer-close').addEventListener('click', closeDrawer);
dbg.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });

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
