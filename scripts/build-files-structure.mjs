import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, 'FILES - Blad1.csv');
const FILES_DIR = join(__dirname, '../public/RESOURCES/files');
const OUTPUT_PATH = join(__dirname, '../src/data/filesStructure.js');

const FOLDER_ICON = '/RESOURCES/folder.png';
const CD_AUDIO_ICON = '/RESOURCES/cd_audio.png';
const IMAGE_FILE_ICON = '/RESOURCES/image_file.png';
const FILE_EXTENSIONS = /\.(jpe?g|png|pdf|mp3|dmg|wav|gif|txt|doc|mp4|mov)$/i;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav)$/i;

/** CSV label → actual filename on disk when names differ */
const FILE_ALIASES = {
  'coverart_ver2.jpg': 'coverart_ver2.jpeg',
  'coverart_ver3.jpg': 'coverart_ver3.jpeg',
  'coverart_ver4.jpg': 'coverart_ver4.jpeg',
  'coverart_ver5.jpg': 'coverart_ver5.jpeg',
  'coverart_ver6s.jpg': 'coverart_ver6.jpeg',
  'aa59b6bd5b8f83bb39a0211d6c1c65cb.jpg': 'aa59b6bd5b8f83bb39a0211d6c1c65cb.jpeg',
  'cd.jpg': 'cd.jpeg',
  'LILĒ.pdf': 'LILĒ.pdf',
  'LILE.pdf': 'LILĒ.pdf',
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function normalizeKey(name) {
  return name.normalize('NFC').toLowerCase();
}

function stemKey(name) {
  return normalizeKey(name).replace(/\.[^.]+$/, '');
}

function isFile(name) {
  return FILE_EXTENSIONS.test(name.trim());
}

function buildDiskIndex() {
  const byExact = new Map();
  const byStem = new Map();

  for (const name of readdirSync(FILES_DIR)) {
    byExact.set(normalizeKey(name), name);
    const stem = stemKey(name);
    if (!byStem.has(stem)) byStem.set(stem, name);
  }

  return { byExact, byStem };
}

function resolveDiskName(label, diskIndex) {
  if (FILE_ALIASES[label]) {
    const found = diskIndex.byExact.get(normalizeKey(FILE_ALIASES[label]));
    if (found) return found;
  }

  const exact = diskIndex.byExact.get(normalizeKey(label));
  if (exact) return exact;

  const stem = diskIndex.byStem.get(stemKey(label));
  if (stem) return stem;

  const swapped = label.replace(/\.jpg$/i, '.jpeg').replace(/\.jpeg$/i, '.jpg');
  if (swapped !== label) {
    const swappedExact = diskIndex.byExact.get(normalizeKey(swapped));
    if (swappedExact) return swappedExact;
  }

  return null;
}

function publicPath(diskName) {
  return `/RESOURCES/files/${encodeURIComponent(diskName).replace(/%2F/gi, '/')}`;
}

function makeFileItem(label, diskIndex, { isFirstEpDemo = false } = {}) {
  const item = { label, icon: FOLDER_ICON };
  const diskName = resolveDiskName(label, diskIndex);

  if (!diskName) return item;

  const path = publicPath(diskName);
  const lower = diskName.toLowerCase();

  if (lower.endsWith('.pdf')) {
    item.pdf = path;
  } else if (IMAGE_EXTENSIONS.test(lower)) {
    item.icon = IMAGE_FILE_ICON;
    item.image = path;
  } else if (AUDIO_EXTENSIONS.test(lower)) {
    item.icon = CD_AUDIO_ICON;
    item.audio = path;
    item.opens = 'cd_player';
    if (isFirstEpDemo) item.autoplay = true;
  }

  return item;
}

function makeFolderItem(label, id) {
  return { label, icon: FOLDER_ICON, opens: id };
}

function ensureTop(name, topLevelFolders) {
  if (!topLevelFolders.has(name)) {
    topLevelFolders.set(name, { subfolders: new Map(), files: [], order: [] });
  }
  return topLevelFolders.get(name);
}

function ensureSub(bucket, name) {
  if (!bucket.subfolders.has(name)) {
    bucket.subfolders.set(name, []);
    bucket.order.push({ type: 'sub', name });
  }
  return bucket.subfolders.get(name);
}

function addTopFile(bucket, label) {
  bucket.files.push(label);
  bucket.order.push({ type: 'file', name: label });
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const topLevelFolders = new Map();
  let currentTop = null;
  let currentSub = null;

  function splitRow(line) {
    const first = line.indexOf(',');
    if (first === -1) {
      return [line.trim(), '', ''];
    }

    const cell1 = line.slice(0, first).trim();
    const rest = line.slice(first + 1);
    const second = rest.indexOf(',');

    if (second === -1) {
      return [cell1, rest.trim(), ''];
    }

    return [
      cell1,
      rest.slice(0, second).trim(),
      rest.slice(second + 1).trim().replace(/,$/, ''),
    ];
  }

  for (const line of lines) {
    if (!line.trim()) continue;

    const [cell1, cell2, cell3] = splitRow(line);

    if (cell1) {
      currentTop = cell1;
      currentSub = null;
      const bucket = ensureTop(currentTop, topLevelFolders);

      if (!cell2) continue;

      if (isFile(cell2)) {
        addTopFile(bucket, cell2);
      } else {
        currentSub = cell2;
        const subFiles = ensureSub(bucket, currentSub);
        if (cell3 && isFile(cell3)) subFiles.push(cell3);
      }
      continue;
    }

    if (!currentTop) continue;
    const bucket = ensureTop(currentTop, topLevelFolders);

    // ,,file → current subfolder
    if (!cell2 && cell3 && isFile(cell3)) {
      if (currentSub) ensureSub(bucket, currentSub).push(cell3);
      continue;
    }

    if (!cell2) continue;

    // ,SUB or ,SUB,file → start / switch subfolder
    if (!isFile(cell2)) {
      currentSub = cell2;
      const subFiles = ensureSub(bucket, currentSub);
      if (cell3 && isFile(cell3)) subFiles.push(cell3);
      continue;
    }

    // ,file → top-level file (leaves subfolder context)
    currentSub = null;
    addTopFile(bucket, cell2);
  }

  return topLevelFolders;
}

function displayTitle(name) {
  if (name === 'DOWNLOADS') return 'Downloads';
  if (name === 'RECENTS') return 'Recents';
  return name;
}

function topFolderId(name) {
  if (name === 'Documents') return 'files_documents';
  return slugify(name);
}

function buildFolderWindows(topLevelFolders, diskIndex) {
  const folderWindows = {};
  const rootItems = [];
  const missing = [];

  function fileItems(labels, options = {}) {
    return labels.map((label, index) => {
      const item = makeFileItem(label, diskIndex, {
        isFirstEpDemo: Boolean(options.epDemos && index === 0),
      });
      if (!item.pdf && !item.image && !item.audio) missing.push(label);
      return item;
    });
  }

  for (const [topName, bucket] of topLevelFolders.entries()) {
    const topId = topFolderId(topName);
    rootItems.push(makeFolderItem(displayTitle(topName), topId));

    const topItems = [];

    for (const entry of bucket.order) {
      if (entry.type === 'file') {
        topItems.push(...fileItems([entry.name]));
        continue;
      }

      const subName = entry.name;
      const subFiles = bucket.subfolders.get(subName) || [];
      const subId = slugify(`${topName}_${subName}`);
      folderWindows[subId] = {
        title: subName,
        address: subName,
        items: fileItems(subFiles, { epDemos: subName === 'EP_DEMOS' }),
      };
      topItems.push(makeFolderItem(subName, subId));
    }

    folderWindows[topId] = {
      title: displayTitle(topName),
      address: displayTitle(topName),
      items: topItems,
    };
  }

  folderWindows.files = {
    title: 'FILES',
    address: 'Files',
    items: rootItems,
  };

  return { folderWindows, missing };
}

const diskIndex = buildDiskIndex();
const csv = readFileSync(CSV_PATH, 'utf8');
const { folderWindows, missing } = buildFolderWindows(parseCsv(csv), diskIndex);

const output = `// Auto-generated from FILES - Blad1.csv — do not edit by hand.
// Regenerate: node scripts/build-files-structure.mjs

export const folderWindows = ${JSON.stringify(folderWindows, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/"/g, "'")};
`;

writeFileSync(OUTPUT_PATH, output);
console.log('Generated', OUTPUT_PATH);
if (missing.length) {
  console.log('Missing assets (listed but not openable):');
  for (const name of [...new Set(missing)]) console.log(' -', name);
}
