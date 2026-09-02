const LABEL_WIDTH = 91;
const LABEL_FONT = '14px "MS Sans Serif", Tahoma, Arial, sans-serif';
const LINE_HEIGHT = 1.2;
const MAX_LINES = 2;
const FONT_SIZE = 14;
const ELLIPSIS = '...';

let measureEl = null;

function getMeasureEl() {
  if (measureEl && document.body.contains(measureEl)) {
    measureEl.style.width = `${LABEL_WIDTH}px`;
    measureEl.style.font = LABEL_FONT;
    return measureEl;
  }

  measureEl = document.createElement('div');
  measureEl.setAttribute('aria-hidden', 'true');
  measureEl.style.cssText = [
    'position:absolute',
    'left:-9999px',
    'top:0',
    `width:${LABEL_WIDTH}px`,
    `font:${LABEL_FONT}`,
    `line-height:${LINE_HEIGHT}`,
    'word-break:break-all',
    'white-space:normal',
    'visibility:hidden',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(measureEl);
  return measureEl;
}

function measureHeight(text) {
  const el = getMeasureEl();
  el.textContent = text;
  return el.offsetHeight;
}

function fitsTwoLines(text) {
  const maxHeight = FONT_SIZE * LINE_HEIGHT * MAX_LINES + 1;
  return measureHeight(text) <= maxHeight;
}

function preferredEnd(label) {
  const withParen = label.match(/\(\d+\)\.[^.]+$/);
  if (withParen) return withParen[0];

  const extension = label.match(/\.[^.]+$/);
  if (extension && extension[0].length <= 8) return extension[0];

  return label.slice(-Math.min(8, Math.floor(label.length / 2)));
}

/**
 * Truncate folder labels that would wrap past 2 lines.
 * Example: "Meeting in _General_  (2).docx" → "Meeting in _Genera...(2).docx"
 */
export function truncateFolderLabel(label) {
  if (!label || fitsTwoLines(label)) return label;

  const end = preferredEnd(label);
  const startBudget = label.length - end.length;

  if (startBudget <= 0) {
    let cut = label;
    while (cut.length > 1 && !fitsTwoLines(ELLIPSIS + cut.slice(1))) {
      cut = cut.slice(1);
    }
    return ELLIPSIS + cut.slice(1);
  }

  let low = 0;
  let high = startBudget;
  let best = ELLIPSIS + end;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = label.slice(0, mid) + ELLIPSIS + end;

    if (fitsTwoLines(candidate)) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}
