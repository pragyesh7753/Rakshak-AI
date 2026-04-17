const fs = require('fs');
const path = require('path');

const replacements = {
  // Surfaces
  '#0B0F19': '#0f172a', // bg
  '#111827': '#1e293b', // card
  '#141c2e': '#273549', // hover card (for email panel)
  '#1F2937': '#334155', // border
  '#374151': '#475569', // border hover
  // Text
  '#4B5563': '#64748b',
  '#6B7280': '#94a3b8',
  '#9CA3AF': '#cbd5e1',
  '#D1D5DB': '#e2e8f0',
  '#F9FAFB': '#f8fafc',
  // Accents (soften)
  '#EF4444': '#f87171',
  '239,68,68': '248,113,113', // red rgba
  '#F59E0B': '#fbbf24',
  '245,158,11': '251,191,36', // amber rgba
  '#10B981': '#34d399',
  '16,185,129': '52,211,153', // emerald rgba
  '#3B82F6': '#60a5fa',
  '59,130,246': '96,165,250', // blue rgba
  '#06B6D4': '#22d3ee',
  '6,182,212': '34,211,238', // cyan rgba
};

// also lowercase versions just in case
const keys = Object.keys(replacements);
for (const k of keys) {
  if (k.startsWith('#')) {
    replacements[k.toLowerCase()] = replacements[k];
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith('.jsx') || full.endsWith('.js') || full.endsWith('.css')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [find, replace] of Object.entries(replacements)) {
        if (content.includes(find)) {
          content = content.split(find).join(replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, content);
        console.log('Updated', full);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
