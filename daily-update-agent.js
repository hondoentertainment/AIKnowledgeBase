#!/usr/bin/env node
/**
 * AI Knowledge Hub — Daily Update Agent
 *
 * Enhances the content update process by:
 * 1. Scanning existing data for staleness and gaps
 * 2. Generating a structured update report with research prompts
 * 3. Validating and deduplicating new entries before insertion
 * 4. Adding freshness metadata (dateAdded, lastVerified) to entries
 * 5. Producing a commit-ready diff for review
 *
 * Usage:
 *   node daily-update-agent.js scan          — Analyze current data, report gaps
 *   node daily-update-agent.js prompts       — Generate research prompts for finding new content
 *   node daily-update-agent.js add <file>    — Merge validated entries from a JSON file into data.js
 *   node daily-update-agent.js verify        — Check all URLs for broken links (slow)
 *   node daily-update-agent.js report        — Full daily report (scan + prompts + staleness)
 *   node daily-update-agent.js freshen       — Update lastVerified timestamps on all entries
 *
 * Designed to be invoked by Claude Code, GitHub Actions, or manually.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const DATA_FILE = path.join(__dirname, "data.js");
const NICHE_FILE = path.join(__dirname, "niche-data.js");
const SOURCES_FILE = path.join(__dirname, "update-sources.json");
const REPORT_DIR = path.join(__dirname, "update-reports");

// ─── Data Parsing ────────────────────────────────────────────

function loadSiteData() {
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  const fn = new Function(`${content}\nreturn siteData;`);
  return fn();
}

function loadNicheData() {
  const content = fs.readFileSync(NICHE_FILE, "utf-8");
  const fn = new Function(`${content}\nreturn nicheData;`);
  return fn();
}

function loadSources() {
  return JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"));
}

// ─── Utilities ───────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0];
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function heading(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

function log(msg) {
  console.log(msg);
}

function warn(msg) {
  console.log(`  ⚠  ${msg}`);
}

function pass(msg) {
  console.log(`  ✓  ${msg}`);
}

function checkUrl(url, timeout = 8000) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout, headers: { "User-Agent": "AIKnowledgeHub/1.0 LinkChecker" } }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on("error", () => resolve({ url, status: 0, ok: false }));
    req.on("timeout", () => { req.destroy(); resolve({ url, status: 0, ok: false }); });
  });
}

// ─── Scan Command ────────────────────────────────────────────

function cmdScan() {
  heading("Content Scan Report");
  log(`  Date: ${today()}`);

  const data = loadSiteData();
  const niche = loadNicheData();
  const sources = loadSources();

  // Category stats
  log("\n  --- Category Stats ---");
  const stats = {};
  let totalItems = 0;
  for (const [cat, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    stats[cat] = {
      count: items.length,
      withDate: items.filter((i) => i.dateAdded).length,
      withVerified: items.filter((i) => i.lastVerified).length,
      stale: items.filter((i) => i.lastVerified && daysSince(i.lastVerified) > 90).length,
      noUrl: items.filter((i) => !i.url).length,
    };
    totalItems += items.length;
    log(`    ${cat.padEnd(16)} ${String(items.length).padStart(4)} items   ${stats[cat].withDate} dated   ${stats[cat].stale} stale`);
  }

  // Niche stats
  let nicheTotal = 0;
  for (const [cat, items] of Object.entries(niche)) {
    if (!Array.isArray(items)) continue;
    nicheTotal += items.length;
  }
  log(`    ${"niche (all)".padEnd(16)} ${String(nicheTotal).padStart(4)} items across ${Object.keys(niche).length} categories`);
  log(`\n  Total: ${totalItems + nicheTotal} items`);

  // Coverage analysis
  log("\n  --- Coverage Gaps ---");
  const sourceCfg = sources.categories;
  for (const [cat, cfg] of Object.entries(sourceCfg)) {
    const items = data[cat] || [];
    const existingUrls = new Set(items.map((i) => i.url?.replace(/\/$/, "").toLowerCase()));
    const missingSources = cfg.sources.filter((s) => !existingUrls.has(s.url.replace(/\/$/, "").toLowerCase()));
    if (missingSources.length > 0) {
      log(`    ${cat}: ${missingSources.length} tracked sources not in catalog:`);
      missingSources.forEach((s) => log(`      - ${s.name} (${s.url})`));
    }
  }

  // Freshness analysis
  log("\n  --- Freshness Status ---");
  let totalMissingDates = 0;
  for (const [cat, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    const missing = items.filter((i) => !i.dateAdded).length;
    totalMissingDates += missing;
    if (missing > 0) {
      log(`    ${cat}: ${missing}/${items.length} items missing dateAdded`);
    }
  }
  if (totalMissingDates === 0) {
    pass("All items have dateAdded metadata");
  } else {
    warn(`${totalMissingDates} items missing dateAdded — run 'freshen' to backfill`);
  }

  // Duplicate check (within same category only — cross-category overlap is expected)
  log("\n  --- Duplicate URLs (within same category) ---");
  let dupeCount = 0;
  for (const [cat, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    const catUrls = new Map();
    for (const item of items) {
      const u = item.url?.replace(/\/$/, "").toLowerCase();
      if (!u) continue;
      if (catUrls.has(u)) {
        warn(`[${cat}] Duplicate URL: "${item.title}" and "${catUrls.get(u)}"`);
        dupeCount++;
      } else {
        catUrls.set(u, item.title);
      }
    }
  }
  if (dupeCount === 0) pass("No within-category duplicate URLs found");

  return stats;
}

// ─── Prompts Command ─────────────────────────────────────────

function cmdPrompts() {
  heading("Research Prompts for Content Update");
  log(`  Date: ${today()}\n`);
  log("  Use these prompts with Claude Code, web search, or manual research");
  log("  to discover new items for each category.\n");

  const sources = loadSources();
  const data = loadSiteData();

  for (const [cat, cfg] of Object.entries(sources.categories)) {
    const items = data[cat] || [];
    const existingTitles = new Set(items.map((i) => i.title.toLowerCase()));

    log(`\n  ┌─── ${cat.toUpperCase()} (${items.length} current items) ───`);
    log(`  │`);
    log(`  │  Sources to check:`);
    cfg.sources.forEach((s) => {
      log(`  │    → ${s.name}: ${s.url}`);
    });
    log(`  │`);
    log(`  │  Search queries:`);
    cfg.searchQueries.forEach((q) => {
      log(`  │    → "${q}"`);
    });
    log(`  │`);
    log(`  │  Prompt for Claude Code / AI assistant:`);
    log(`  │`);
    log(`  │    "Research the latest ${cfg.description} that launched or were updated`);
    log(`  │     in the past 7 days. Check these sources: ${cfg.sources.map((s) => s.name).join(", ")}.`);
    log(`  │     Exclude items already in the catalog: ${Array.from(existingTitles).slice(0, 5).join(", ")}...`);
    log(`  │     For each new item, provide: title, one-sentence description, URL,`);
    log(`  │     3 tags, emoji icon, difficulty level (1-10), update frequency.`);
    log(`  │     Format as JSON matching this schema:`);
    log(`  │     { title, description, url, tags: [], icon, color: ['#hex1', '#hex2'],`);
    log(`  │       level: N, freq: 'Daily|Weekly|Monthly|Continuous|Self-Paced',`);
    log(`  │       dateAdded: '${today()}' }"`);
    log(`  │`);
    log(`  └${"─".repeat(50)}`);
  }

  // Niche prompt
  log(`\n  ┌─── NICHE CATEGORIES ───`);
  log(`  │`);
  const niche = loadNicheData();
  const smallCategories = Object.entries(niche)
    .filter(([, items]) => Array.isArray(items) && items.length < 6)
    .map(([cat, items]) => `${cat} (${items.length})`);
  if (smallCategories.length > 0) {
    log(`  │  Underfilled categories (< 6 items):`);
    smallCategories.forEach((c) => log(`  │    → ${c}`));
  }
  log(`  │`);
  log(`  │  Prompt: "Find the best AI tools for {category} that are new or updated`);
  log(`  │           in 2026. Provide title, description, URL, tags, icon, colors, level."`);
  log(`  └${"─".repeat(50)}`);
}

// ─── Add Command ─────────────────────────────────────────────

function cmdAdd(filePath) {
  heading("Add New Entries");

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`  Error: File not found: ${filePath}`);
    console.error("  Usage: node daily-update-agent.js add <path-to-new-entries.json>");
    console.error('  File should contain: { "tools": [...], "dailyWatch": [...], ... }');
    process.exit(1);
  }

  const newData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const content = fs.readFileSync(DATA_FILE, "utf-8");
  const existingData = loadSiteData();
  let updatedContent = content;
  let totalAdded = 0;

  for (const [cat, newItems] of Object.entries(newData)) {
    if (!Array.isArray(newItems) || newItems.length === 0) continue;
    const existing = existingData[cat] || [];
    const existingUrls = new Set(existing.map((i) => i.url?.replace(/\/$/, "").toLowerCase()));
    const existingTitles = new Set(existing.map((i) => i.title.toLowerCase().trim()));

    const validated = [];
    const skipped = [];

    for (const item of newItems) {
      // Validate required fields
      if (!item.title || !item.description || !item.url) {
        skipped.push({ item: item.title || "unknown", reason: "missing required fields" });
        continue;
      }

      // Check duplicates
      const urlKey = item.url.replace(/\/$/, "").toLowerCase();
      const titleKey = item.title.toLowerCase().trim();
      if (existingUrls.has(urlKey)) {
        skipped.push({ item: item.title, reason: "duplicate URL" });
        continue;
      }
      if (existingTitles.has(titleKey)) {
        skipped.push({ item: item.title, reason: "duplicate title" });
        continue;
      }

      // Ensure schema compliance
      const entry = {
        title: item.title,
        description: item.description,
        url: item.url,
        tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ["AI"],
        icon: item.icon || "🔹",
        color: Array.isArray(item.color) && item.color.length === 2 ? item.color : ["#6366f1", "#4f46e5"],
        level: typeof item.level === "number" ? Math.min(10, Math.max(1, item.level)) : 3,
        freq: item.freq || "Continuous",
        dateAdded: item.dateAdded || today(),
        lastVerified: today(),
      };

      validated.push(entry);
      existingUrls.add(urlKey);
      existingTitles.add(titleKey);
    }

    if (validated.length > 0) {
      // Insert into data.js
      const insertLines = validated
        .map((e) => `    ${JSON.stringify(e)}`)
        .join(",\n");

      // Find the closing bracket of the category array
      const re = new RegExp(`(${cat}:\\s*\\[[\\s\\S]*?)(\\n\\s+\\],)`, "m");
      const match = updatedContent.match(re);
      if (match) {
        const insertPoint = match.index + match[1].length;
        const before = updatedContent.slice(0, insertPoint).trimEnd();
        const after = updatedContent.slice(insertPoint);
        updatedContent = before + ",\n" + insertLines + after;
        totalAdded += validated.length;
        pass(`${cat}: added ${validated.length} new entries`);
      } else {
        warn(`${cat}: section not found in data.js — skipped`);
      }
    }

    if (skipped.length > 0) {
      skipped.forEach((s) => warn(`${cat}: skipped "${s.item}" (${s.reason})`));
    }
  }

  if (totalAdded > 0) {
    fs.writeFileSync(DATA_FILE, updatedContent, "utf-8");
    pass(`Total: ${totalAdded} entries added to data.js`);
  } else {
    log("  No new entries to add (all duplicates or invalid).");
  }
}

// ─── Verify Command ──────────────────────────────────────────

async function cmdVerify() {
  heading("URL Verification");
  log(`  Date: ${today()}\n`);

  const data = loadSiteData();
  const broken = [];
  let checked = 0;

  for (const [cat, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    log(`  Checking ${cat} (${items.length} URLs)...`);

    // Check in batches of 5 to avoid overwhelming
    for (let i = 0; i < items.length; i += 5) {
      const batch = items.slice(i, i + 5);
      const results = await Promise.all(batch.map((item) => checkUrl(item.url)));
      for (let j = 0; j < results.length; j++) {
        checked++;
        if (!results[j].ok) {
          broken.push({
            category: cat,
            title: batch[j].title,
            url: batch[j].url,
            status: results[j].status,
          });
        }
      }
    }
  }

  heading("Verification Results");
  log(`  Checked: ${checked} URLs`);
  log(`  Broken: ${broken.length}`);

  if (broken.length > 0) {
    log("\n  Broken URLs:");
    broken.forEach((b) => {
      warn(`[${b.category}] ${b.title} → ${b.url} (HTTP ${b.status})`);
    });
  } else {
    pass("All URLs are reachable");
  }

  // Save report
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `verify-${today()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ date: today(), checked, broken }, null, 2));
  log(`\n  Report saved: ${reportPath}`);
}

// ─── Freshen Command ─────────────────────────────────────────

function cmdFreshen() {
  heading("Freshness Metadata Update");

  let content = fs.readFileSync(DATA_FILE, "utf-8");
  const todayStr = today();
  let updated = 0;

  // Add dateAdded to items that don't have it
  // Match items without dateAdded field
  content = content.replace(
    /(\{\s*title:\s*"[^"]+",\s*description:\s*"[^"]*",\s*url:\s*"[^"]*",\s*tags:\s*\[[^\]]*\],\s*icon:\s*"[^"]*",\s*color:\s*\[[^\]]*\],\s*level:\s*\d+,\s*freq:\s*"[^"]*")(\s*\})/g,
    (match, before, after) => {
      if (match.includes("dateAdded")) return match;
      updated++;
      return `${before}, dateAdded: "${todayStr}", lastVerified: "${todayStr}"${after}`;
    }
  );

  if (updated > 0) {
    fs.writeFileSync(DATA_FILE, content, "utf-8");
    pass(`Added dateAdded + lastVerified to ${updated} entries`);
  } else {
    pass("All entries already have freshness metadata");
  }

  // Also update niche-data.js
  let nicheContent = fs.readFileSync(NICHE_FILE, "utf-8");
  let nicheUpdated = 0;
  nicheContent = nicheContent.replace(
    /(\{\s*title:\s*"[^"]+",\s*description:\s*"[^"]*",\s*url:\s*"[^"]*",\s*tags:\s*\[[^\]]*\],\s*icon:\s*"[^"]*",\s*color:\s*\[[^\]]*\],\s*level:\s*\d+)(\s*\})/g,
    (match, before, after) => {
      if (match.includes("dateAdded")) return match;
      nicheUpdated++;
      return `${before}, dateAdded: "${todayStr}", lastVerified: "${todayStr}"${after}`;
    }
  );

  if (nicheUpdated > 0) {
    fs.writeFileSync(NICHE_FILE, nicheContent, "utf-8");
    pass(`Added metadata to ${nicheUpdated} niche entries`);
  }
}

// ─── Report Command ──────────────────────────────────────────

function cmdReport() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       AI Knowledge Hub — Daily Update Report             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`  Date: ${today()}\n`);

  const stats = cmdScan();
  cmdPrompts();

  heading("Next Steps");
  log("  1. Use the research prompts above with Claude Code or web search");
  log("  2. Save new entries to a JSON file (e.g., new-entries.json)");
  log("  3. Run: node daily-update-agent.js add new-entries.json");
  log("  4. Run: node daily-update-agent.js freshen");
  log("  5. Review changes: git diff data.js");
  log("  6. Commit: git add data.js && git commit -m 'Daily content update'");
  log("");
  log("  For automated CI: see .github/workflows/daily-update.yml");
}

// ─── Main ────────────────────────────────────────────────────

const cmd = process.argv[2] || "report";
const arg = process.argv[3];

switch (cmd) {
  case "scan":
    cmdScan();
    break;
  case "prompts":
    cmdPrompts();
    break;
  case "add":
    cmdAdd(arg);
    break;
  case "verify":
    cmdVerify();
    break;
  case "freshen":
    cmdFreshen();
    break;
  case "report":
    cmdReport();
    break;
  default:
    console.log("Usage: node daily-update-agent.js <command>");
    console.log("");
    console.log("Commands:");
    console.log("  scan      Analyze current data, report gaps and staleness");
    console.log("  prompts   Generate research prompts for finding new content");
    console.log("  add       Merge validated entries from a JSON file into data.js");
    console.log("  verify    Check all URLs for broken links");
    console.log("  freshen   Add dateAdded/lastVerified metadata to entries");
    console.log("  report    Full daily report (scan + prompts)");
    process.exit(1);
}
