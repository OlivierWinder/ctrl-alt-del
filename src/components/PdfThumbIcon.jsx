import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { assetUrl } from '../utils/assetUrl';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ICON_SIZE = 70;
const PLACEHOLDER = assetUrl('/RESOURCES/folder.png');
const thumbCache = new Map();
const inflight = new Map();

async function renderPdfThumb(pdfSrc) {
  const resolvedSrc = assetUrl(pdfSrc);
  if (thumbCache.has(resolvedSrc)) return thumbCache.get(resolvedSrc);
  if (inflight.has(resolvedSrc)) return inflight.get(resolvedSrc);

  const task = (async () => {
    const response = await fetch(resolvedSrc);
    if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status})`);

    const data = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = (ICON_SIZE * 2) / baseViewport.height;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise;

    const thumb = canvas.toDataURL('image/jpeg', 0.72);
    thumbCache.set(resolvedSrc, thumb);
    return thumb;
  })();

  inflight.set(resolvedSrc, task);

  try {
    return await task;
  } finally {
    inflight.delete(resolvedSrc);
  }
}

export default function PdfThumbIcon({ pdfSrc, className = '', alt = '' }) {
  const resolvedSrc = assetUrl(pdfSrc);
  const [src, setSrc] = useState(() => thumbCache.get(resolvedSrc) || PLACEHOLDER);

  useEffect(() => {
    let cancelled = false;

    if (thumbCache.has(resolvedSrc)) {
      setSrc(thumbCache.get(resolvedSrc));
      return undefined;
    }

    setSrc(PLACEHOLDER);

    renderPdfThumb(pdfSrc)
      .then((thumb) => {
        if (!cancelled) setSrc(thumb);
      })
      .catch(() => {
        if (!cancelled) setSrc(PLACEHOLDER);
      });

    return () => {
      cancelled = true;
    };
  }, [pdfSrc, resolvedSrc]);

  return (
    <img
      src={src}
      alt={alt}
      className={`pdf-thumb-icon${className ? ` ${className}` : ''}`}
      draggable={false}
    />
  );
}
