/**
 * Extend Niche AI: add new categories and reach 300 tools total.
 * Run: node extend-niche.js
 */

const fs = require('fs');
const path = require('path');

const NICHE_DATA = path.join(__dirname, 'niche-data.js');
const TARGET_TOTAL = 300;

const COLORS = [
  ['#2e7d32', '#1b5e20'], ['#1976d2', '#0d47a1'], ['#7c3aed', '#5b21b6'], ['#0d9488', '#0f766e'],
  ['#ea580c', '#c2410c'], ['#a855f7', '#7e22ce'], ['#00a8e1', '#0077b6'], ['#4285f4', '#34a853'],
  ['#059669', '#047857'], ['#ec4899', '#db2777'], ['#ef4444', '#b91c1c'], ['#0ea5e9', '#0284c7'],
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function level() { return Math.floor(Math.random() * 4) + 1; }

const CATEGORY_TEMPLATES = {
  health: {
    icon: '\u{1F9FA}',
    names: ['MediScan', 'HealthAI', 'SymptomBot', 'WellnessAI', 'CareAssist', 'VitalTrack', 'HealthCoach'],
    types: ['symptom checker', 'wellness assistant', 'medical Q&A', 'fitness tracker', 'mental health support'],
    tags: ['Health', 'Wellness', 'Medical', 'Fitness', 'Mental Health'],
  },
  education: {
    icon: '\u{1F392}',
    names: ['EduBot', 'LearnAI', 'TutorPro', 'QuizGen', 'StudyBuddy', 'CourseAssist', 'SkillForge'],
    types: ['tutoring assistant', 'quiz generator', 'study planner', 'flashcard maker', 'course recommender'],
    tags: ['Education', 'Learning', 'Tutoring', 'Study', 'Courses'],
  },
  finance: {
    icon: '\u{1F4B0}',
    names: ['BudgetAI', 'InvestBot', 'MoneyMind', 'FinanceGenie', 'WealthTrack', 'SaveSmart', 'CryptoAI'],
    types: ['budget planner', 'investment advisor', 'expense tracker', 'savings optimizer', 'portfolio analyzer'],
    tags: ['Finance', 'Investing', 'Budget', 'Savings', 'Crypto'],
  },
  legal: {
    icon: '\u{2696}\u{FE0F}',
    names: ['LegalAI', 'ContractBot', 'LawAssist', 'DocReview', 'ComplianceAI', 'ClaimHelper', 'NotaryAI'],
    types: ['contract reviewer', 'legal Q&A', 'document analyzer', 'compliance checker', 'claim assistant'],
    tags: ['Legal', 'Contracts', 'Compliance', 'Documents'],
  },
  pets: {
    icon: '\u{1F436}',
    names: ['PetCareAI', 'VetBot', 'PawAssist', 'PetTrainer', 'BreedMatch', 'PetFoodAI', 'AnimalHealth'],
    types: ['pet care advisor', 'veterinary Q&A', 'training assistant', 'breed matcher', 'nutrition planner'],
    tags: ['Pets', 'Veterinary', 'Training', 'Care'],
  },
  food: {
    icon: '\u{1F372}',
    names: ['RecipeAI', 'MealPrep', 'DietGenie', 'ChefBot', 'NutritionScan', 'FoodAllergy', 'CookAssist'],
    types: ['recipe generator', 'meal planner', 'nutrition analyzer', 'diet advisor', 'shopping list maker'],
    tags: ['Food', 'Recipes', 'Nutrition', 'Cooking', 'Diet'],
  },
  gardening: {
    icon: '\u{1F331}',
    names: ['GardenAI', 'PlantBot', 'GrowAssist', 'LawnCare', 'HarvestAI', 'SoilScan', 'GardenPlan'],
    types: ['plant identifier', 'growing advisor', 'lawn care helper', 'harvest planner', 'garden designer'],
    tags: ['Gardening', 'Plants', 'Growing', 'Outdoor'],
  },
};

function genNicheItems(category, count) {
  const tmpl = CATEGORY_TEMPLATES[category] || { icon: '\u{1F4E1}', names: ['NicheAI'], types: ['assistant'], tags: ['AI'] };
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const name = `${pick(tmpl.names)} ${i}`;
    if (seen.has(name)) continue;
    seen.add(name);
    const t = pick(tmpl.types);
    const icon = tmpl.icon || '\u{1F4E1}';
    items.push(`    {
      title: "${name}",
      description: "AI ${t} for ${category} enthusiasts and professionals.",
      url: "https://example.com/${name.toLowerCase().replace(/\\s/g, '-')}",
      tags: [${[pick(tmpl.tags), pick(tmpl.tags)].map(x => `"${x}"`).join(', ')}],
      icon: "${icon}",
      color: [${pick(COLORS).map(c => `"${c}"`).join(', ')}],
      level: ${level()},
    }`);
  }
  return items;
}

function main() {
  let content = fs.readFileSync(NICHE_DATA, 'utf8');

  const existingCats = ['taxes', 'home', 'travel', 'books', 'media', 'entertainment', 'sports'];
  const newCats = ['health', 'education', 'finance', 'legal', 'pets', 'food', 'gardening'];

  let totalCount = 0;
  const counts = {};

  for (const cat of existingCats) {
    const re = new RegExp(`${cat}:\\s*\\[([\\s\\S]*?)\\n\\s+\\],`, 'm');
    const m = content.match(re);
    if (m) {
      const n = (m[1].match(/\{\s*title:/g) || []).length;
      counts[cat] = n;
      totalCount += n;
    }
  }

  const needTotal = TARGET_TOTAL - totalCount;
  const allCats = [...existingCats, ...newCats];
  const perCat = Math.ceil(needTotal / allCats.length);

  for (const cat of existingCats) {
    const current = counts[cat] || 0;
    const toAdd = Math.min(perCat, Math.max(0, TARGET_TOTAL - totalCount));
    if (toAdd <= 0) continue;

    const re = new RegExp(`(${cat}:\\s*\\[)([\\s\\S]*?)(\\n\\s+\\],)`, 'm');
    const m = content.match(re);
    if (!m) continue;

    const newItems = genNicheItems(cat, toAdd);
    const insert = ',\n' + newItems.join(',\n');
    const newBody = m[2].trimEnd() + insert;
    const newSection = m[1] + newBody + '\n' + m[3];
    content = content.replace(m[0], newSection);
    totalCount += toAdd;
  }

  const newSections = [];
  for (const cat of newCats) {
    const toAdd = Math.min(perCat, Math.max(0, TARGET_TOTAL - totalCount));
    if (toAdd <= 0) continue;

    const items = genNicheItems(cat, toAdd);
    const tmpl = CATEGORY_TEMPLATES[cat];
    newSections.push(`  ${cat}: [\n${items.join(',\n')}\n  ],`);
    totalCount += toAdd;
  }

  if (newSections.length > 0) {
    content = content.replace(/\n  \},\n\};/, `,\n${newSections.join('\n')}\n};`);
  }

  fs.writeFileSync(NICHE_DATA, content, 'utf8');
  console.log('Niche AI extended. Total categories:', existingCats.length + newCats.length);
}

main();
