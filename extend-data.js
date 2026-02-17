/**
 * Script to extend each section in data.js to 500 resources.
 * Run: node extend-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.js');
const TARGET_PER_SECTION = 500;

const ICONS = ['💬', '🧠', '✨', '🔍', '📚', '🎙️', '📄', '🔧', '⚡', '🎨', '🖼️', '🎬', '📊', '🤖', '💻', '📝', '🎯', '🔬', '🌐', '📱', '🛠️', '📈', '🎓', '🌟', '💡', '🔗', '📋', '🦾', '☁️', '🎵'];
const COLORS = [
  ['#10a37f', '#1a7f5a'], ['#6366f1', '#4f46e5'], ['#0ea5e9', '#0284c7'], ['#22c55e', '#16a34a'],
  ['#f59e0b', '#d97706'], ['#ef4444', '#dc2626'], ['#8b5cf6', '#7c3aed'], ['#ec4899', '#db2777'],
  ['#14b8a6', '#0d9488'], ['#4285f4', '#1a73e8'], ['#ff6f00', '#e65100'], ['#1e40af', '#1e3a8a'],
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function level() { return Math.floor(Math.random() * 9) + 1; }

function genTools(count, offset = 0) {
  const names = ['Nexus', 'Synth', 'Lumina', 'Cortex', 'Prism', 'Vector', 'Pulse', 'Flux', 'Apex', 'Nova', 'Spark', 'Forge', 'Echo', 'Atlas', 'Zenith', 'Horizon', 'Meridian', 'Vertex', 'Orbit', 'Helix'];
  const types = ['AI assistant', 'automation platform', 'content generator', 'research tool', 'writing copilot', 'analytics engine', 'code helper', 'design assistant', 'data processor', 'workflow builder'];
  const tags = ['LLM', 'Writing', 'Coding', 'Image', 'Video', 'Audio', 'Productivity', 'Research', 'Automation', 'Design', 'API', 'Analysis'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} AI ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const t = pick(types);
    items.push(`    { title: "${name}", description: "${name}'s ${t} for professionals and creators.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: [${[pick(tags), pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${level()}, freq: "Continuous" }`);
  }
  return items;
}

function genKnowledge(count, offset = 0) {
  const names = ['AI Digest', 'ML Weekly', 'Neural Notes', 'Deep Insights', 'AI Briefing', 'Tech Pulse', 'Research Roundup', 'Model Watch', 'AI Horizons'];
  const types = ['newsletter', 'blog', 'documentation', 'paper repository', 'tutorial site', 'community forum', 'course platform', 'research hub'];
  const tags = ['Research', 'Newsletter', 'Documentation', 'Papers', 'Tutorial', 'Community', 'Blog', 'Education'];
  const freqs = ['Daily', 'Weekly', 'Monthly', 'Reference'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const t = pick(types);
    items.push(`    { title: "${name}", description: "Curated ${t} for AI and machine learning practitioners.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: [${[pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${level()}, freq: "${pick(freqs)}" }`);
  }
  return items;
}

function genPodcasts(count, offset = 0) {
  const names = ['AI Talk', 'ML Minds', 'Data Deep Dive', 'Neural Net Chat', 'Future AI', 'Code & Cognition', 'The AI Show', 'Smart Machines', 'Deep Learning Daily'];
  const tags = ['AI', 'Machine Learning', 'Data Science', 'Research', 'Interviews', 'Industry'];
  const freqs = ['Weekly', 'Biweekly', 'Monthly', 'Daily'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    items.push(`    { title: "${name}", description: "Podcast exploring AI, ML, and data science with industry experts.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: [${[pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${level()}, freq: "${pick(freqs)}" }`);
  }
  return items;
}

function genYouTube(count, offset = 0) {
  const names = ['AI Explained', 'ML Tutorials', 'Data Science Daily', 'Neural Net Lab', 'Code with AI', 'Research Breakdown', 'Tech Deep Dive'];
  const tags = ['AI', 'Tutorials', 'Research', 'Education', 'Coding', 'Paper Reviews'];
  const freqs = ['Weekly', '2-3x Weekly', 'Monthly', 'Daily'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    items.push(`    { title: "${name}", description: "YouTube channel covering AI, machine learning, and practical tutorials.", url: "https://www.youtube.com/@${name.toLowerCase().replace(/\s/g, '')}", tags: [${[pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${level()}, freq: "${pick(freqs)}" }`);
  }
  return items;
}

function genTraining(count, offset = 0) {
  const names = ['ML Fundamentals', 'Deep Learning Pro', 'AI for Beginners', 'NLP Mastery', 'Computer Vision', 'RL Workshop', 'MLOps Essentials'];
  const types = ['course', 'specialization', 'certification', 'tutorial series', 'bootcamp', 'nanodegree'];
  const tags = ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Coursera', 'Self-Paced'];
  const freqs = ['Self-Paced', 'Weekly', 'Monthly'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const t = pick(types);
    items.push(`    { title: "${name}", description: "Comprehensive ${t} covering AI and machine learning concepts.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: [${[pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${level()}, freq: "${pick(freqs)}" }`);
  }
  return items;
}

function genDailyWatch(count, offset = 0) {
  const names = ['ToolHunt', 'AI Launches', 'Product Daily', 'Startup Radar', 'Tech Releases', 'AI Directory', 'Innovation Watch', 'Launch Pad'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    items.push(`    { title: "${name}", description: "Daily updated directory of new AI tools and product launches.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: ["Discovery", "AI Tools", "Daily"], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: 1, freq: "Daily" }`);
  }
  return items;
}

function genBleedingEdge(count, offset = 0) {
  const names = ['Nexus Agent', 'Cortex Autonomy', 'Reactor AI', 'Forge Agent', 'Pulse Reasoning', 'Vector Orchestrator', 'Flux Framework', 'Apex Autonomy', 'Synth Reasoning', 'Helix Agent'];
  const types = ['agent framework', 'autonomous system', 'reasoning model', 'multi-agent orchestrator', 'tool-use platform', 'memory layer', 'agentic workflow'];
  const tags = ['Agent', 'Autonomous', 'Reasoning', 'Framework', 'Multi-Agent', 'Tool Use', 'API', 'Research'];
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(names)} ${offset + i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const t = pick(types);
    items.push(`    { title: "${name}", description: "Cutting-edge ${t} for agentic AI and autonomous task execution.", url: "https://example.com/${name.toLowerCase().replace(/\s/g, '-')}", tags: [${[pick(tags), pick(tags), pick(tags)].map(t => `"${t}"`).join(', ')}], icon: "${pick(ICONS)}", color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}], level: ${Math.min(9, level() + 2)}, freq: "Continuous" }`);
  }
  return items;
}

function countInArray(str, arrayStart, arrayEnd) {
  const start = str.indexOf(arrayStart);
  if (start === -1) return 0;
  const slice = str.substring(start);
  const matches = slice.match(/\{\s*title:/g);
  return matches ? matches.length : 0;
}

function findArrayBounds(content, sectionName) {
  const re = new RegExp(`(\\s+${sectionName}:\\s*\\[)([\\s\\S]*?)(\\n\\s+\\],)`, 'm');
  const m = content.match(re);
  return m ? { full: m[0], prefix: m[1], body: m[2], suffix: m[3], index: content.indexOf(m[0]) } : null;
}

function main() {
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  const sections = [
    { name: 'tools', gen: genTools },
    { name: 'knowledge', gen: genKnowledge },
    { name: 'podcasts', gen: genPodcasts },
    { name: 'youtube', gen: genYouTube },
    { name: 'training', gen: genTraining },
    { name: 'dailyWatch', gen: genDailyWatch },
    { name: 'bleedingEdge', gen: genBleedingEdge },
  ];

  for (const { name, gen } of sections) {
    const bounds = findArrayBounds(content, name);
    if (!bounds) {
      console.warn(`Section ${name} not found`);
      continue;
    }
    const currentCount = (bounds.body.match(/\{\s*title:/g) || []).length;
    const need = TARGET_PER_SECTION - currentCount;
    if (need <= 0) {
      console.log(`${name}: already has ${currentCount} (target ${TARGET_PER_SECTION})`);
      continue;
    }
    const newItems = gen(need, currentCount);
    const insert = '\n' + newItems.join(',\n') + ',';
    const newBody = bounds.body.trimEnd() + insert;
    const newSection = bounds.prefix + newBody + '\n' + bounds.suffix;
    content = content.replace(bounds.full, newSection);
    console.log(`${name}: added ${need} (${currentCount} → ${currentCount + need})`);
  }

  fs.writeFileSync(DATA_FILE, content, 'utf8');
  console.log('\nDone. data.js updated.');
}

main();
