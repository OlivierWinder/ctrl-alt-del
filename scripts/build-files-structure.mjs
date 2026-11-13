import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, 'CTRL-ALT-DEL-bestanden.csv');
const FILES_DIR = join(__dirname, '../public/RESOURCES/files');
const OUTPUT_PATH = join(__dirname, '../src/data/filesStructure.js');

const FOLDER_ICON = '/RESOURCES/folder.png';
const IMAGE_FILE_ICON = '/RESOURCES/image_file.png';
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp)$/i;
const PDF_EXTENSIONS = /\.pdf$/i;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/</g, 'lt')
    .replace(/>/g, 'gt')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'folder';
}

function normalizeKey(name) {
  return name.normalize('NFC').toLowerCase();
}

function displayTitle(name) {
  return name;
}

function publicPath(relativePath) {
  // Keep raw path segments; assetUrl() encodes them for the browser.
  return `/RESOURCES/files/${relativePath.split('\\').join('/')}`;
}

function walkDisk(dir, prefix = '') {
  const byExact = new Map();
  const byStem = new Map();

  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const stats = statSync(full);

    if (stats.isDirectory()) {
      const nested = walkDisk(full, rel);
      for (const [key, value] of nested.byExact) byExact.set(key, value);
      for (const [key, value] of nested.byStem) {
        if (!byStem.has(key)) byStem.set(key, value);
      }
      continue;
    }

    byExact.set(normalizeKey(rel), rel);
    byExact.set(normalizeKey(name), rel);
    const stem = normalizeKey(name).replace(/\.[^.]+$/, '');
    if (!byStem.has(stem)) byStem.set(stem, rel);
  }

  return { byExact, byStem };
}

function resolveDiskPath(label, folder, diskIndex) {
  const candidates = [];
  if (folder) candidates.push(`${folder}/${label}`);
  candidates.push(label);

  for (const candidate of candidates) {
    const found = diskIndex.byExact.get(normalizeKey(candidate));
    if (found) return found;
  }

  const stem = normalizeKey(label).replace(/\.[^.]+$/, '');
  const byStem = diskIndex.byStem.get(stem);
  if (byStem) return byStem;

  const swapped = label.replace(/\.jpg$/i, '.jpeg').replace(/\.jpeg$/i, '.jpg');
  if (swapped !== label) {
    for (const candidate of [folder ? `${folder}/${swapped}` : null, swapped].filter(Boolean)) {
      const found = diskIndex.byExact.get(normalizeKey(candidate));
      if (found) return found;
    }
  }

  return null;
}

function makeFileItem(label, folder, diskIndex) {
  const item = { label, icon: FOLDER_ICON };
  const diskPath = resolveDiskPath(label, folder, diskIndex);
  if (!diskPath) return item;

  const path = publicPath(diskPath);
  const lower = diskPath.toLowerCase();

  if (PDF_EXTENSIONS.test(lower)) {
    item.pdf = path;
  } else if (IMAGE_EXTENSIONS.test(lower)) {
    item.icon = IMAGE_FILE_ICON;
    item.image = path;
  }

  return item;
}

function makeFolderItem(label, id) {
  return { label, icon: FOLDER_ICON, opens: id };
}

function splitCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const folders = new Map();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = splitCsvLine(line);
    const [bestandsnaam, padOfUrl, type, map] = cells;

    if (i === 0 && /bestandsnaam/i.test(bestandsnaam)) continue;
    if (!bestandsnaam || !map) continue;

    if (!folders.has(map)) folders.set(map, []);
    folders.get(map).push({
      label: bestandsnaam,
      pathHint: padOfUrl || '',
      type: type || '',
    });
  }

  return folders;
}

function folderId(name) {
  return slugify(name);
}

function buildFolderWindows(folders, diskIndex) {
  const folderWindows = {};
  const rootItems = [];
  const missing = [];

  for (const [folderName, files] of folders.entries()) {
    const id = folderId(folderName);
    rootItems.push(makeFolderItem(displayTitle(folderName), id));

    const items = files.map((file) => {
      const item = makeFileItem(file.label, folderName, diskIndex);
      if (!item.pdf && !item.image) missing.push(`${folderName}/${file.label}`);
      return item;
    });

    folderWindows[id] = {
      title: displayTitle(folderName),
      address: displayTitle(folderName),
      items,
    };
  }

  folderWindows.files = {
    title: 'FILES',
    address: 'Files',
    items: rootItems,
  };

  return { folderWindows, missing };
}

const csv = readFileSync(CSV_PATH, 'utf8');
const folders = parseCsv(csv);
const diskIndex = walkDisk(FILES_DIR);
const { folderWindows, missing } = buildFolderWindows(folders, diskIndex);

const output = `// Auto-generated from CTRL-ALT-DEL-bestanden.csv — do not edit by hand.
// Regenerate: node scripts/build-files-structure.mjs

export const folderWindows = ${JSON.stringify(folderWindows, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'")};
`;

writeFileSync(OUTPUT_PATH, output);
console.log('Generated', OUTPUT_PATH);
console.log('Folders:', [...folders.keys()].join(', '));
if (missing.length) {
  console.log('Missing assets (listed but not openable):');
  for (const name of [...new Set(missing)]) console.log(' -', name);
} else {
  console.log('All CSV assets resolved.');
}
