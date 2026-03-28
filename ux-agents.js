/**
 * AI Knowledge Hub — UX Agents Runner
 * Automated checks for content freshness, accessibility, and performance.
 * Run via: node ux-agents.js [agent] [--verbose]
 *
 * Agents:
 *   freshness   — Scan data.js and niche-data.js for schema issues, duplicates, staleness
 *   a11y        — Check HTML files for common accessibility issues
 *   performance — Check asset sizes against budgets
 *   all         — Run all agents
 *
 * Examples:
 *   node ux-agents.js freshness
 *   node ux-agents.js all --verbose
 */

const fs = require("fs");
const path = require("path");

const VERBOSE = process.argv.includes("--verbose");
const agent = process.argv[2] || "all";

// ─── Utilities ───────────────────────────────────────────────

function log(msg) {
  console.log(msg);
}

function warn(msg) {
  console.log(`  ⚠  ${msg}`);
}

function pass(msg) {
  console.log(`  ✓  ${msg}`);
}

function fail(msg) {
  console.log(`  ✗  ${msg}`);
}

function heading(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

function subheading(title) {
  console.log(`\n  --- ${title} ---`);
}

function fileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// ─── Content Freshness Agent ─────────────────────────────────

function runFreshnessAgent() {
  heading("Content Freshness Agent");
  let issues = 0;

  // Load data files as text and extract the object
  const dataFiles = [
    { name: "data.js", varName: "siteData" },
    { name: "niche-data.js", varName: "nicheData" },
  ];

  for (const df of dataFiles) {
    const filePath = path.join(__dirname, df.name);
    if (!fs.existsSync(filePath)) {
      warn(`${df.name} not found — skipping`);
      continue;
    }

    subheading(`Scanning ${df.name}`);
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract data by evaluating in a sandboxed scope
    let data;
    try {
      const fn = new Function(`${content}\nreturn ${df.varName};`);
      data = fn();
    } catch (e) {
      fail(`Could not parse ${df.name}: ${e.message}`);
      issues++;
      continue;
    }

    let totalItems = 0;
    const categories = Object.keys(data);

    for (const category of categories) {
      const items = data[category];
      if (!Array.isArray(items)) continue;

      totalItems += items.length;
      const seen = new Map();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Schema validation
        if (!item.title) {
          fail(`[${category}][${i}] Missing title`);
          issues++;
        }
        if (!item.description) {
          fail(`[${category}][${i}] ${item.title || "?"} — Missing description`);
          issues++;
        }
        if (!item.url) {
          fail(`[${category}][${i}] ${item.title || "?"} — Missing url`);
          issues++;
        }
        if (!Array.isArray(item.tags) || item.tags.length === 0) {
          warn(`[${category}][${i}] ${item.title || "?"} — Missing or empty tags`);
          issues++;
        }
        if (!Array.isArray(item.color) || item.color.length !== 2) {
          warn(`[${category}][${i}] ${item.title || "?"} — Invalid color (need [from, to])`);
          issues++;
        }
        if (!item.icon) {
          warn(`[${category}][${i}] ${item.title || "?"} — Missing icon`);
          issues++;
        }

        // Duplicate check
        const key = (item.title || "").toLowerCase().trim();
        if (seen.has(key)) {
          warn(
            `[${category}] Duplicate title: "${item.title}" at indices ${seen.get(key)} and ${i}`
          );
          issues++;
        } else {
          seen.set(key, i);
        }

        // Staleness signals
        const currentYear = new Date().getFullYear();
        const oldYearPattern = new RegExp(`\\b(20[0-1]\\d|202[0-4])\\b`);
        if (oldYearPattern.test(item.title) || oldYearPattern.test(item.description)) {
          warn(
            `[${category}][${i}] ${item.title} — Contains old year reference, may be outdated`
          );
          issues++;
        }
      }

      if (VERBOSE || items.length > 0) {
        pass(`${category}: ${items.length} items`);
      }
    }

    log(`\n  Total: ${totalItems} items across ${categories.length} categories`);
  }

  return issues;
}

// ─── Accessibility Agent ─────────────────────────────────────

function runA11yAgent() {
  heading("Accessibility Agent");
  let issues = 0;

  const htmlFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(__dirname, f));

  for (const filePath of htmlFiles) {
    const name = path.basename(filePath);
    const html = fs.readFileSync(filePath, "utf-8");

    if (VERBOSE) subheading(name);

    // Check for lang attribute
    if (!/<html[^>]+lang=/.test(html)) {
      fail(`${name}: <html> missing lang attribute`);
      issues++;
    }

    // Check for skip link
    if (!html.includes("skip-link") && !html.includes("Skip to")) {
      warn(`${name}: No skip link found`);
      issues++;
    }

    // Check heading hierarchy
    const headingMatches = [...html.matchAll(/<h([1-6])\b/g)].map((m) => parseInt(m[1]));
    let lastLevel = 0;
    for (const level of headingMatches) {
      if (level > lastLevel + 1 && lastLevel > 0) {
        warn(`${name}: Heading skip h${lastLevel} → h${level}`);
        issues++;
      }
      lastLevel = level;
    }

    // Check h1 count
    const h1Count = (html.match(/<h1\b/g) || []).length;
    if (h1Count === 0 && !html.includes("id=\"header-root\"")) {
      warn(`${name}: No <h1> found`);
      issues++;
    } else if (h1Count > 1) {
      warn(`${name}: Multiple <h1> tags (${h1Count})`);
      issues++;
    }

    // Check images for alt
    const imgs = [...html.matchAll(/<img\b([^>]*)>/g)];
    for (const img of imgs) {
      if (!img[1].includes("alt")) {
        fail(`${name}: <img> without alt attribute`);
        issues++;
      }
    }

    // Check buttons for accessible names
    const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    for (const btn of buttons) {
      const attrs = btn[1];
      const content = btn[2].replace(/<[^>]+>/g, "").trim();
      if (!content && !attrs.includes("aria-label")) {
        warn(`${name}: Button without accessible name`);
        issues++;
      }
    }

    // Check for aria-expanded on toggle elements
    if (html.includes('id="nav-toggle"') && !html.includes("nav-toggle") === false) {
      // nav-toggle checked in header.js dynamically — skip static check
    }

    // Check for main content landmark
    if (!html.includes("<main") && !html.includes('id="main-content"')) {
      if (!html.includes("id=\"header-root\"")) {
        warn(`${name}: No <main> landmark or #main-content`);
        issues++;
      }
    }

    // Check meta viewport
    if (!html.includes('name="viewport"')) {
      warn(`${name}: Missing viewport meta tag`);
      issues++;
    }

    if (VERBOSE && issues === 0) {
      pass(`${name}: All checks passed`);
    }
  }

  return issues;
}

// ─── Performance Agent ───────────────────────────────────────

function runPerformanceAgent() {
  heading("Performance Agent — Asset Budget Check");
  let issues = 0;

  // Non-shipped files excluded from code budget (dev tools, data payloads, config)
  const NON_SHIPPED_JS = new Set([
    "ux-agents.js",
    "playwright.config.js",
    "data.js",
    "niche-data.js",
    "data.example.js",
  ]);

  const budgets = {
    jsCode: { limit: 400 * 1024, label: "Shipped JS (code)" },
    jsData: { limit: 300 * 1024, label: "Data payloads" },
    css: { limit: 150 * 1024, label: "Total CSS" },
    dataJs: { limit: 250 * 1024, label: "data.js" },
  };

  // Measure JS files
  subheading("JavaScript Files (shipped code)");
  const jsFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith(".js"))
    .filter((f) => !f.startsWith("playwright"));

  let totalJsCode = 0;
  let totalJsData = 0;
  const jsCodeDetails = [];
  const jsDataDetails = [];
  for (const f of jsFiles) {
    const size = fileSize(path.join(__dirname, f));
    if (NON_SHIPPED_JS.has(f)) {
      if (f === "data.js" || f === "niche-data.js") {
        totalJsData += size;
        jsDataDetails.push({ name: f, size });
      }
      // Dev tools excluded entirely
    } else {
      totalJsCode += size;
      jsCodeDetails.push({ name: f, size });
    }
  }

  // Test files are not shipped — report separately
  const testsDir = path.join(__dirname, "tests");
  if (fs.existsSync(testsDir)) {
    const testFiles = fs.readdirSync(testsDir).filter((f) => f.endsWith(".js"));
    for (const f of testFiles) {
      const size = fileSize(path.join(testsDir, f));
      if (VERBOSE) log(`    (test) ${("tests/" + f).padEnd(30)} ${formatBytes(size)}`);
    }
  }

  jsCodeDetails.sort((a, b) => b.size - a.size);
  for (const d of jsCodeDetails.slice(0, 10)) {
    const marker = d.size > 50 * 1024 ? "⚠ " : "  ";
    log(`${marker} ${d.name.padEnd(30)} ${formatBytes(d.size)}`);
  }
  if (jsCodeDetails.length > 10) {
    log(`    ... and ${jsCodeDetails.length - 10} more files`);
  }

  log(`\n  Shipped JS code: ${formatBytes(totalJsCode)}`);
  if (totalJsCode > budgets.jsCode.limit) {
    fail(`JS code budget exceeded: ${formatBytes(totalJsCode)} > ${formatBytes(budgets.jsCode.limit)}`);
    issues++;
  } else {
    pass(`JS code within budget: ${formatBytes(totalJsCode)} < ${formatBytes(budgets.jsCode.limit)}`);
  }

  log(`  Data payloads: ${formatBytes(totalJsData)}`);
  if (totalJsData > budgets.jsData.limit) {
    fail(`Data budget exceeded: ${formatBytes(totalJsData)} > ${formatBytes(budgets.jsData.limit)}`);
    issues++;
  } else {
    pass(`Data within budget: ${formatBytes(totalJsData)} < ${formatBytes(budgets.jsData.limit)}`);
  }

  // Measure CSS files
  subheading("CSS Files");
  const cssFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".css"));
  let totalCss = 0;
  for (const f of cssFiles) {
    const size = fileSize(path.join(__dirname, f));
    totalCss += size;
    log(`    ${f.padEnd(30)} ${formatBytes(size)}`);
  }

  log(`\n  Total CSS: ${formatBytes(totalCss)}`);
  if (totalCss > budgets.css.limit) {
    fail(`CSS budget exceeded: ${formatBytes(totalCss)} > ${formatBytes(budgets.css.limit)}`);
    issues++;
  } else {
    pass(`CSS within budget: ${formatBytes(totalCss)} < ${formatBytes(budgets.css.limit)}`);
  }

  // Measure data files
  subheading("Data Files");
  const dataJsSize = fileSize(path.join(__dirname, "data.js"));
  const nicheDataSize = fileSize(path.join(__dirname, "niche-data.js"));
  log(`    data.js${" ".repeat(20)} ${formatBytes(dataJsSize)}`);
  log(`    niche-data.js${" ".repeat(14)} ${formatBytes(nicheDataSize)}`);

  if (dataJsSize > budgets.dataJs.limit) {
    fail(
      `data.js budget exceeded: ${formatBytes(dataJsSize)} > ${formatBytes(budgets.dataJs.limit)}`
    );
    issues++;
  } else {
    pass(
      `data.js within budget: ${formatBytes(dataJsSize)} < ${formatBytes(budgets.dataJs.limit)}`
    );
  }

  // Count HTML pages and DOM complexity estimate
  subheading("HTML Pages");
  const htmlFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".html"));
  log(`    ${htmlFiles.length} HTML pages`);

  // Script loading analysis
  // Scripts that must remain synchronous (called immediately by inline scripts)
  const SYNC_ALLOWED = new Set(["header.js", "theme.js"]);

  subheading("Script Loading");
  let renderBlocking = 0;
  for (const f of htmlFiles) {
    const html = fs.readFileSync(path.join(__dirname, f), "utf-8");
    const scripts = [...html.matchAll(/<script\b([^>]*)src="([^"]+)"([^>]*)>/g)];
    for (const s of scripts) {
      const attrs = s[1] + s[3];
      const src = s[2];
      const basename = src.split("/").pop();
      if (SYNC_ALLOWED.has(basename)) continue; // Must stay sync
      if (src.startsWith("http")) continue; // External scripts managed separately
      if (!attrs.includes("defer") && !attrs.includes("async") && !attrs.includes("type=\"module\"")) {
        if (VERBOSE) warn(`${f}: Render-blocking script: ${src}`);
        renderBlocking++;
      }
    }
  }

  if (renderBlocking > 0) {
    warn(`${renderBlocking} render-blocking scripts across all pages (consider defer/async)`);
    issues++;
  } else {
    pass("No unnecessary render-blocking scripts");
  }

  return issues;
}

// ─── Main ────────────────────────────────────────────────────

function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║         AI Knowledge Hub — UX Agents Runner              ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(`  Date: ${new Date().toISOString().split("T")[0]}`);
  console.log(`  Agent: ${agent}`);
  console.log(`  Verbose: ${VERBOSE}`);

  let totalIssues = 0;

  if (agent === "freshness" || agent === "all") {
    totalIssues += runFreshnessAgent();
  }
  if (agent === "a11y" || agent === "all") {
    totalIssues += runA11yAgent();
  }
  if (agent === "performance" || agent === "all") {
    totalIssues += runPerformanceAgent();
  }

  if (!["freshness", "a11y", "performance", "all"].includes(agent)) {
    console.log(`\nUnknown agent: "${agent}"`);
    console.log("Available: freshness, a11y, performance, all");
    process.exit(1);
  }

  heading("Summary");
  if (totalIssues === 0) {
    pass("All checks passed — no issues found");
  } else {
    warn(`${totalIssues} issue(s) found — review above for details`);
  }

  console.log("");
  process.exit(totalIssues > 0 ? 1 : 0);
}

main();
