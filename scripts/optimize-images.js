#!/usr/bin/env node
/**
 * Quadrum.cz – image optimization pipeline.
 *
 * Vstup:  images/**\/*.{jpg,jpeg,png}
 * Výstup: images-optimized/<jméno>.{avif,webp,jpg} ve více velikostech
 *
 * Použití:
 *   npm i -D sharp glob
 *   node scripts/optimize-images.js
 *
 * Volby:
 *   --src=<dir>      vstupní složka (default: images)
 *   --out=<dir>      výstupní složka (default: images-optimized)
 *   --widths=W,W,W   šířky (default: 640,1280,1920)
 *   --quality=N      kvalita 0-100 (default: 78)
 *   --skip-existing  přeskočit už existující výstupy
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).reduce((acc, a) => {
  const m = a.match(/^--([^=]+)(=(.*))?$/);
  if (m) acc[m[1]] = m[3] ?? true;
  return acc;
}, {});

const SRC_DIR = path.resolve(args.src || 'images');
const OUT_DIR = path.resolve(args.out || 'images-optimized');
const WIDTHS = (args.widths || '640,1280,1920').split(',').map(Number);
const QUALITY = Number(args.quality || 78);
const SKIP_EXISTING = !!args['skip-existing'];

const VALID_EXT = new Set(['.jpg', '.jpeg', '.png']);

function walk(dir) {
  const entries = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) entries.push(...walk(full));
    else if (VALID_EXT.has(path.extname(name).toLowerCase())) entries.push(full);
  }
  return entries;
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.error('❌ Modul "sharp" není nainstalovaný. Spusť: npm i -D sharp');
    process.exit(1);
  }

  if (!fs.existsSync(SRC_DIR)) {
    console.error(`❌ Vstupní složka neexistuje: ${SRC_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = walk(SRC_DIR);
  console.log(`🖼  Nalezeno ${files.length} obrázků v ${SRC_DIR}`);
  console.log(`📐 Šířky: ${WIDTHS.join(', ')} px, kvalita: ${QUALITY}`);
  console.log(`📂 Výstup: ${OUT_DIR}\n`);

  let processed = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const inFile of files) {
    const rel = path.relative(SRC_DIR, inFile);
    const baseName = path.basename(rel, path.extname(rel));
    const subDir = path.dirname(rel);
    const outSubDir = path.join(OUT_DIR, subDir);
    fs.mkdirSync(outSubDir, { recursive: true });

    const srcSize = fs.statSync(inFile).size;
    totalBefore += srcSize;

    let img;
    try {
      img = sharp(inFile);
      const meta = await img.metadata();
      const maxW = meta.width || Math.max(...WIDTHS);

      for (const w of WIDTHS) {
        if (w > maxW) continue;

        for (const fmt of ['avif', 'webp', 'jpg']) {
          const outName = `${baseName}-${w}.${fmt}`;
          const outPath = path.join(outSubDir, outName);

          if (SKIP_EXISTING && fs.existsSync(outPath)) {
            skipped++;
            continue;
          }

          let pipeline = sharp(inFile).resize({ width: w, withoutEnlargement: true });
          if (fmt === 'avif') pipeline = pipeline.avif({ quality: QUALITY, effort: 6 });
          else if (fmt === 'webp') pipeline = pipeline.webp({ quality: QUALITY });
          else pipeline = pipeline.jpeg({ quality: QUALITY, progressive: true, mozjpeg: true });

          await pipeline.toFile(outPath);
          totalAfter += fs.statSync(outPath).size;
          processed++;
        }
      }
      console.log(`✓ ${rel}`);
    } catch (err) {
      console.error(`✗ ${rel}: ${err.message}`);
    }
  }

  const saved = totalBefore - totalAfter;
  const savedPct = totalBefore ? Math.round((saved / totalBefore) * 100) : 0;
  console.log(`\n🎉 Hotovo. Zpracováno ${processed} výstupů, přeskočeno ${skipped}.`);
  console.log(`📊 Velikost před: ${fmt(totalBefore)} → po: ${fmt(totalAfter)}`);
  console.log(`💾 Úspora ${fmt(saved)} (${savedPct} %)`);
  console.log(`\nPříklad použití v HTML:`);
  console.log(`  <picture>`);
  console.log(`    <source type="image/avif" srcset="images-optimized/Obr1-640.avif 640w, images-optimized/Obr1-1280.avif 1280w">`);
  console.log(`    <source type="image/webp" srcset="images-optimized/Obr1-640.webp 640w, images-optimized/Obr1-1280.webp 1280w">`);
  console.log(`    <img src="images-optimized/Obr1-1280.jpg" alt="…" loading="lazy">`);
  console.log(`  </picture>`);
}

function fmt(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
