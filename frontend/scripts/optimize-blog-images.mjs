import { readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import process from 'node:process';

const BLOG_IMAGES_DIR = 'public/blog-images';
const QUALITY = Number(process.env.IMAGE_QUALITY || 80);
const MAX_WIDTH = Number(process.env.IMAGE_MAX_WIDTH || 1600);
const MIN_BYTES_TO_OPTIMIZE = Number(process.env.IMAGE_MIN_BYTES || 100 * 1024);
const DRY_RUN = process.argv.includes('--dry-run');
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function getSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    console.error('\nMissing dependency: sharp');
    console.error('Run: npm install -D sharp');
    console.error('Then run: npm run optimize:images\n');
    process.exit(1);
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (SUPPORTED.has(extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

async function optimizeFile(sharp, file) {
  const before = await stat(file);
  if (before.size < MIN_BYTES_TO_OPTIMIZE) {
    return { file, skipped: true, reason: 'small', before: before.size, after: before.size };
  }

  const ext = extname(file).toLowerCase();
  const out = file.replace(new RegExp(`${ext}$`, 'i'), '.webp');
  const temp = `${out}.tmp`;

  if (DRY_RUN) {
    const metadata = await sharp(file).metadata();
    return { file, out, skipped: false, dryRun: true, before: before.size, width: metadata.width, height: metadata.height };
  }

  await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(temp);

  const after = await stat(temp);

  if (after.size >= before.size && ext === '.webp') {
    await import('node:fs/promises').then(({ rm }) => rm(temp, { force: true }));
    return { file, out, skipped: true, reason: 'not-smaller', before: before.size, after: before.size };
  }

  await import('node:fs/promises').then(({ rename }) => rename(temp, out));
  return { file, out, skipped: false, before: before.size, after: after.size };
}

async function main() {
  const sharp = await getSharp();
  const files = await walk(BLOG_IMAGES_DIR);
  const results = [];

  for (const file of files) {
    results.push(await optimizeFile(sharp, file));
  }

  let optimized = 0;
  let saved = 0;

  console.log(`\nBlog image optimization ${DRY_RUN ? '(dry run)' : ''}`);
  console.log(`Directory: ${BLOG_IMAGES_DIR}`);
  console.log(`Quality: ${QUALITY}`);
  console.log(`Max width: ${MAX_WIDTH}px`);
  console.log(`Min size: ${formatKb(MIN_BYTES_TO_OPTIMIZE)}\n`);

  for (const result of results) {
    if (result.skipped) {
      console.log(`SKIP  ${result.file} (${result.reason}, ${formatKb(result.before)})`);
      continue;
    }

    optimized += 1;
    if (!result.dryRun) saved += result.before - result.after;
    const target = result.out ? ` -> ${result.out}` : '';
    const size = result.dryRun
      ? `${formatKb(result.before)}${result.width ? `, ${result.width}x${result.height}` : ''}`
      : `${formatKb(result.before)} -> ${formatKb(result.after)}`;
    console.log(`WEBP  ${result.file}${target} (${size})`);
  }

  console.log(`\nOptimized: ${optimized}`);
  if (!DRY_RUN) console.log(`Saved: ${formatKb(saved)}`);
  console.log('Done. Review image references before deleting original jpg/png files.\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
