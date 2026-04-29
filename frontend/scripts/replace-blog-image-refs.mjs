import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import process from 'node:process';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOTS = ['src', 'scripts', 'public'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.html', '.xml', '.md', '.json']);
const IMAGE_REF_RE = /\/blog-images\/([^'"\s)]+?)\.(jpg|jpeg|png)(?=[?'"\s)])/gi;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      files.push(...await walk(full));
    } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const files = (await Promise.all(ROOTS.map((root) => walk(root).catch(() => [])))).flat();
  const changes = [];

  for (const file of files) {
    const original = await readFile(file, 'utf8');
    let updated = original;
    const seen = new Set();

    updated = updated.replace(IMAGE_REF_RE, (match, name) => {
      const webpPublicPath = `/blog-images/${name}.webp`;
      const webpDiskPath = join('public', 'blog-images', `${name}.webp`);
      const key = `${file}:${match}`;
      seen.add({ key, match, webpPublicPath, webpDiskPath });
      return match;
    });

    // Replace asynchronously by scanning matches so we can check file existence.
    const matches = [...original.matchAll(IMAGE_REF_RE)];
    if (matches.length === 0) continue;

    let fileChanged = false;
    for (const match of matches) {
      const fullMatch = match[0];
      const name = match[1];
      const webpPublicPath = `/blog-images/${name}.webp`;
      const webpDiskPath = join('public', 'blog-images', `${name}.webp`);
      if (await exists(webpDiskPath)) {
        updated = updated.split(fullMatch).join(webpPublicPath);
        fileChanged = true;
        changes.push({ file, from: fullMatch, to: webpPublicPath });
      }
    }

    if (fileChanged && !DRY_RUN) {
      await writeFile(file, updated, 'utf8');
    }
  }

  console.log(`\nBlog image reference replacement ${DRY_RUN ? '(dry run)' : ''}`);
  if (changes.length === 0) {
    console.log('No references replaced. Run npm run optimize:images first so .webp files exist.');
    return;
  }

  for (const change of changes) {
    console.log(`${DRY_RUN ? 'WOULD ' : ''}REPLACE ${change.file}: ${change.from} -> ${change.to}`);
  }
  console.log(`\nTotal replacements: ${changes.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
