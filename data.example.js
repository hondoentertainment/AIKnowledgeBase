/**
 * Example data schema for AI Knowledge Hub
 * Copy to data.js and populate with your items, or use as reference.
 *
 * Each item supports:
 *   title       — Name (required)
 *   description — Short summary (required)
 *   url         — Link (use "#" if none)
 *   tags        — Array of tags for search / filtering
 *   icon        — Emoji displayed on the card cover
 *   color       — [from, to] hex pair for the gradient
 *   level       — Difficulty 1-10 (1 = beginner, 10 = world-class expert)
 *   freq        — Content output frequency (e.g. "Daily", "Weekly", "Continuous")
 */

const siteData = {
  tools: [
    { title: "Example Tool", description: "Short description of the tool.", url: "https://example.com", tags: ["LLM", "Writing"], icon: "💬", color: ["#10a37f", "#1a7f5a"], level: 1, freq: "Continuous" },
  ],
  knowledge: [
    { title: "Example Article", description: "Short description of the article.", url: "https://example.com", tags: ["Guide", "Docs"], icon: "📚", color: ["#4285f4", "#1a73e8"], level: 2, freq: "Monthly" },
  ],
  podcasts: [
    { title: "Example Podcast", description: "Short description of the podcast.", url: "https://example.com", tags: ["AI", "News"], icon: "🎙️", color: ["#7c3aed", "#5b21b6"], level: 1, freq: "Weekly" },
  ],
  youtube: [],
  training: [],
  dailyWatch: [],
  bleedingEdge: [],
};
