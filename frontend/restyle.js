const fs = require('fs');
const path = require('path');

function replaceTokens(content) {
  return content
    .replace(/bg-gray-950/g, 'bg-paper')
    .replace(/bg-gray-900/g, 'bg-surface')
    .replace(/border-gray-800/g, 'border-border')
    .replace(/border-gray-700/g, 'border-border')
    .replace(/text-white/g, 'text-ink')
    .replace(/text-gray-400/g, 'text-ink-muted')
    .replace(/text-gray-500/g, 'text-ink-muted')
    .replace(/text-gray-300/g, 'text-ink')
    .replace(/text-gray-200/g, 'text-ink')
    .replace(/hover:text-white/g, 'hover:text-ink')
    .replace(/hover:text-gray-200/g, 'hover:text-ink')
    .replace(/hover:bg-gray-800\/50/g, 'hover:bg-border/30')
    .replace(/hover:bg-gray-800\/20/g, 'hover:bg-border/30')
    .replace(/hover:bg-gray-800/g, 'hover:bg-border/30')
    .replace(/bg-gray-800\/50/g, 'bg-border/20')
    .replace(/divide-gray-800/g, 'divide-border')
    .replace(/bg-gray-900\/50/g, 'bg-surface')
    .replace(/bg-gray-800/g, 'bg-border');
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = replaceTokens(content);
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('c:/Users/88019/Desktop/Assignment/frontend/src/app');
