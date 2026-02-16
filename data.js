/**
 * Edit this file to add your AI tools, knowledge items, and podcasts.
 * The site will automatically render all items from these arrays.
 *
 * Each item supports:
 *   title       — Name
 *   description — Short summary
 *   url         — Link (use "#" if none)
 *   tags        — Array of tags for search / filtering
 *   icon        — Emoji displayed on the poster cover
 *   color       — [from, to] hex pair for the poster gradient
 */

const siteData = {
  tools: [
    {
      title: "ChatGPT",
      description: "Conversational AI for writing, coding, and brainstorming.",
      url: "https://chat.openai.com",
      tags: ["LLM", "Writing", "Coding"],
      icon: "\u{1F4AC}",
      color: ["#10a37f", "#1a7f5a"],
    },
    {
      title: "Claude",
      description: "Anthropic's AI assistant for analysis and long-form content.",
      url: "https://claude.ai",
      tags: ["LLM", "Analysis", "Writing"],
      icon: "\u{1F9E0}",
      color: ["#cc785c", "#a0522d"],
    },
    {
      title: "Cursor",
      description: "AI-powered code editor for faster development.",
      url: "https://cursor.com",
      tags: ["Coding", "IDE", "Productivity"],
      icon: "\u{1F4BB}",
      color: ["#7c3aed", "#4f46e5"],
    },
    {
      title: "Midjourney",
      description: "Generate images from text prompts.",
      url: "https://midjourney.com",
      tags: ["Image", "Art", "Creative"],
      icon: "\u{1F3A8}",
      color: ["#e44d8a", "#b83280"],
    },
    {
      title: "Perplexity",
      description: "AI search engine with cited answers.",
      url: "https://perplexity.ai",
      tags: ["Search", "Research", "Citations"],
      icon: "\u{1F50D}",
      color: ["#20b2aa", "#2980b9"],
    },
  ],
  knowledge: [
    {
      title: "Prompt Engineering Basics",
      description: "How to write effective prompts for better AI responses.",
      url: "#",
      tags: ["Prompts", "Best Practices", "Getting Started"],
      icon: "\u{270F}\u{FE0F}",
      color: ["#f59e0b", "#d97706"],
    },
    {
      title: "AI Ethics & Safety",
      description: "Understanding bias, transparency, and responsible AI use.",
      url: "#",
      tags: ["Ethics", "Safety", "Responsible AI"],
      icon: "\u{1F6E1}\u{FE0F}",
      color: ["#ef4444", "#b91c1c"],
    },
    {
      title: "RAG Architecture Explained",
      description: "Retrieval-augmented generation for knowledge-grounded outputs.",
      url: "#",
      tags: ["RAG", "Architecture", "LLMs"],
      icon: "\u{1F9F1}",
      color: ["#6366f1", "#4338ca"],
    },
  ],
  podcasts: [
    {
      title: "The AI Podcast",
      description: "Conversations with AI researchers and industry leaders.",
      url: "#",
      feed: null,
      tags: ["Interviews", "Research", "Industry"],
      icon: "\u{1F3D9}\u{FE0F}",
      color: ["#06b6d4", "#0891b2"],
    },
    {
      title: "Lex Fridman Podcast",
      description: "Deep dives into AI, science, and philosophy.",
      url: "#",
      feed: null,
      tags: ["Interviews", "Philosophy", "AI"],
      icon: "\u{1F30C}",
      color: ["#8b5cf6", "#6d28d9"],
    },
    {
      title: "Practical AI",
      description: "Making AI practical, productive, and accessible.",
      url: "#",
      feed: null,
      tags: ["Practical", "Productivity", "Tutorials"],
      icon: "\u{1F527}",
      color: ["#22c55e", "#16a34a"],
    },
  ],
};
