/**
 * Reorder AI tools by popularity
 * Run: node scripts/reorder-ai-tools.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'ai-tools.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Add default popularity score of 50 for entries without it
data.forEach(item => {
  if (!item.popularity) {
    item.popularity = 50;
  }
});

// Sort by popularity (descending), then by id
data.sort((a, b) => {
  if (b.popularity !== a.popularity) {
    return b.popularity - a.popularity;
  }
  return parseInt(a.id) - parseInt(b.id);
});

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`✅ Reordered ${data.length} AI tools by popularity`);
console.log(`Top 5: ${data.slice(0, 5).map(t => t.title).join(', ')}`);


