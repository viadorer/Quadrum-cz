const fs = require('fs');
const path = require('path');

const R2_PUBLIC_URL = 'https://pub-73649d5be63240648a58ace4d4c57318.r2.dev';

function updateHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update blog images
  const blogRegex = /images\/blog\/clanek(\d+)\.png/g;
  if (content.match(blogRegex)) {
    content = content.replace(blogRegex, `${R2_PUBLIC_URL}/quadrum/blog/clanek$1.jpg`);
    updated = true;
  }

  // Update hero images
  const heroRegex = /images\/hero\/hero(\d+)\.png/g;
  if (content.match(heroRegex)) {
    content = content.replace(heroRegex, `${R2_PUBLIC_URL}/quadrum/hero/hero$1.jpg`);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (item.endsWith('.html')) {
      updateHtmlFile(fullPath);
    }
  }
}

console.log('🔄 Aktualizuji cesty k obrázkům...\n');
updateHtmlFile('index.html');
processDirectory('blog');
console.log('\n✅ Všechny cesty aktualizovány!');
