#!/usr/bin/env node
// Regenerates the repo table in profile/README.md (what github.com/DisplayXR renders)
// from the live list of public, non-archived repos in the org.
//
// Design note — this script is deliberately intolerant. Every failure path exits
// non-zero and prints why. It never warns-and-continues, because a sync job that
// reports success while doing nothing is worse than no sync job at all: the page
// rots for months and the green check says otherwise.
//
//   node scripts/gen-profile-readme.mjs           # rewrite profile/README.md
//   node scripts/gen-profile-readme.mjs --check   # exit 1 on any diff, write nothing
//
// Auth: GITHUB_TOKEN (optional for reads, but avoids anonymous rate limits).

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORG = "DisplayXR";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "profile", "repos.config.json");
const README_PATH = join(ROOT, "profile", "README.md");
const BEGIN = "<!-- BEGIN:repos -->";
const END = "<!-- END:repos -->";

const CHECK_ONLY = process.argv.includes("--check");

function die(msg, detail) {
  console.error(`\n✖ ${msg}`);
  if (detail) console.error(detail.replace(/^/gm, "    "));
  console.error("");
  process.exit(1);
}

async function apiAllPages(path) {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": `${ORG}-profile-generator`,
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://api.github.com${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      die(`GitHub API ${res.status} ${res.statusText} for ${url}`, await res.text());
    }
    const batch = await res.json();
    out.push(...batch);
    if (batch.length < 100) return out;
  }
  die("Pagination did not terminate after 20 pages — refusing to guess.");
}

// ---------------------------------------------------------------- fetch + assert

// `type=public` already excludes private repos. We assert it anyway: this runs with
// a token that *could* see private repos, and a private repo leaking onto the org's
// public shopfront is the one failure mode worth being paranoid about.
const fetched = await apiAllPages(`/orgs/${ORG}/repos?type=public`);

const leaked = fetched.filter((r) => r.private === true || r.visibility !== "public");
if (leaked.length) {
  die(
    `GitHub returned ${leaked.length} non-public repo(s) from a ?type=public query. Refusing to write.`,
    leaked.map((r) => `${r.name} (private=${r.private}, visibility=${r.visibility})`).join("\n"),
  );
}

const live = new Map(fetched.filter((r) => !r.archived).map((r) => [r.name, r]));
const archived = new Set(fetched.filter((r) => r.archived).map((r) => r.name));

// ---------------------------------------------------------------- load config

let config;
try {
  config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
} catch (err) {
  die(`Could not parse ${CONFIG_PATH}`, String(err));
}

const sections = config.sections ?? [];
const exclude = config.exclude ?? {};

const classified = new Map(); // repo name -> where it was classified
for (const section of sections) {
  for (const entry of section.repos ?? []) {
    if (classified.has(entry.repo)) {
      die(`"${entry.repo}" is listed twice in repos.config.json.`);
    }
    classified.set(entry.repo, `section "${section.title}"`);
  }
}
for (const name of Object.keys(exclude)) {
  if (classified.has(name)) {
    die(`"${name}" is in both a section and \`exclude\` in repos.config.json.`);
  }
  classified.set(name, "exclude");
}

// ---------------------------------------------------------------- reconcile

// (a) A live public repo nobody classified. This is THE check — it turns the daily
//     workflow red until a human decides where a new repo belongs.
const unclassified = [...live.keys()].filter((n) => !classified.has(n));
if (unclassified.length) {
  die(
    `${unclassified.length} public repo(s) in the org are not classified in profile/repos.config.json.`,
    `${unclassified.join("\n")}\n\n` +
      "Add each to a section (to show it on github.com/DisplayXR) or to `exclude`\n" +
      "with a reason (to keep it off). Do not delete this check to make it pass.",
  );
}

// (b) A config entry that no longer matches a live public repo. Distinguish the three
//     causes, because "went private" and "was deleted" want different reactions.
const stale = [];
for (const [name, where] of classified) {
  if (live.has(name)) continue;
  if (archived.has(name)) {
    stale.push(`${name} — now ARCHIVED (listed in ${where}); remove the entry.`);
  } else if (fetched.some((r) => r.name === name)) {
    stale.push(`${name} — no longer public (listed in ${where}); remove the entry.`);
  } else {
    stale.push(
      `${name} — not visible as a public repo (listed in ${where}). It was deleted, ` +
        "renamed, or made PRIVATE. Remove the entry; never list a private repo here.",
    );
  }
}
if (stale.length) {
  die(`${stale.length} entr(ies) in profile/repos.config.json no longer match a live public repo.`, stale.join("\n"));
}

// ---------------------------------------------------------------- render

const rows = [];
for (const section of sections) {
  rows.push(`| **${section.title}** | |`);
  for (const entry of section.repos ?? []) {
    const meta = live.get(entry.repo);
    const description = entry.description ?? meta.description ?? "";
    if (!description) {
      die(
        `"${entry.repo}" has no description in repos.config.json and none on GitHub.`,
        "Add a `description` override, or set the repo description on GitHub.",
      );
    }
    const prefix = entry.indent ? "&nbsp;&nbsp;↳ " : "";
    rows.push(`| ${prefix}[${entry.repo}](https://github.com/${ORG}/${entry.repo}) | ${description} |`);
  }
}

const table = ["| | |", "|---|---|", ...rows].join("\n");
const generated = [
  BEGIN,
  "<!-- Generated by scripts/gen-profile-readme.mjs from profile/repos.config.json.",
  "     Do not hand-edit: edit the config and re-run, or let sync-profile.yml do it. -->",
  table,
  END,
].join("\n");

const readme = readFileSync(README_PATH, "utf8");
const start = readme.indexOf(BEGIN);
const finish = readme.indexOf(END);
if (start === -1 || finish === -1 || finish < start) {
  die(`profile/README.md is missing the ${BEGIN} / ${END} markers.`);
}

const next = readme.slice(0, start) + generated + readme.slice(finish + END.length);

if (next === readme) {
  console.log(`✓ profile/README.md is up to date (${live.size} public repos, ${rows.length} rows).`);
  process.exit(0);
}

if (CHECK_ONLY) {
  die(
    "profile/README.md is out of date with the live org.",
    "Run `node scripts/gen-profile-readme.mjs` and commit the result.",
  );
}

writeFileSync(README_PATH, next);
console.log(`✓ Rewrote profile/README.md (${live.size} public repos, ${rows.length} rows).`);
