const COLUMNS = 5;

/**
 * Pack folder items into a 5-column grid, left-to-right / top-to-bottom.
 * Only the last row may be short — same as a classic Win98 folder.
 */
export function layoutFolderItems(items) {
  if (!items.length) return [];

  const cells = items.map((item) => ({
    type: 'item',
    item,
    key: `item-${item.label}`,
  }));

  const remainder = items.length % COLUMNS;
  if (remainder === 0) return cells;

  const emptyCount = COLUMNS - remainder;
  for (let i = 0; i < emptyCount; i += 1) {
    cells.push({ type: 'spacer', key: `spacer-last-${i}` });
  }

  return cells;
}
