import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Window from './Window';
import { assetUrl } from '../utils/assetUrl';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_PAGE_WIDTH = 470;
const PAGE_GAP = 20;
const PAGE_PEEK = 32;
const THUMB_HEIGHT = 100;
const SCROLLBAR_WIDTH = 16;
const PAGE_MARGIN = 16;

const EMPTY_LAYOUT = {
  pages: [],
  viewportHeight: 320,
  windowWidth: 560,
  hasMultiplePages: false,
};

function getScale(baseViewport) {
  return MAX_PAGE_WIDTH / baseViewport.width;
}

export default function PdfViewer({
  title,
  pdfSrc,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  const scrollRef = useRef(null);
  const [layout, setLayout] = useState(EMPTY_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  const dragState = useRef(null);

  const { pages, viewportHeight, windowWidth, hasMultiplePages } = layout;

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setLayout(EMPTY_LAYOUT);

      try {
        const response = await fetch(assetUrl(pdfSrc));
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF (${response.status})`);
        }

        const data = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const renderedPages = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = getScale(baseViewport);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const context = canvas.getContext('2d');
          await page.render({ canvasContext: context, viewport }).promise;

          renderedPages.push({
            src: canvas.toDataURL('image/png'),
            width: Math.round(viewport.width),
            height: Math.round(viewport.height),
          });
        }

        if (cancelled || renderedPages.length === 0) return;

        const firstPageHeight = renderedPages[0].height;
        const contentWidth = Math.max(...renderedPages.map((page) => page.width));
        const multiPage = pdf.numPages > 1;
        const nextViewportHeight = firstPageHeight
          + (multiPage ? PAGE_PEEK : 0)
          + PAGE_MARGIN * 2;

        setLayout({
          pages: renderedPages,
          viewportHeight: nextViewportHeight,
          windowWidth: contentWidth + PAGE_MARGIN * 2 + (multiPage ? SCROLLBAR_WIDTH : 0),
          hasMultiplePages: multiPage,
        });
        setLoading(false);
      } catch (error) {
        console.error('PDF load error:', error);
        if (!cancelled) {
          setLayout(EMPTY_LAYOUT);
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfSrc]);

  const updateMetrics = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    setMetrics({
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    });
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    element.addEventListener('scroll', updateMetrics);
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(element);
    updateMetrics();

    return () => {
      element.removeEventListener('scroll', updateMetrics);
      resizeObserver.disconnect();
    };
  }, [pages, loading, viewportHeight, updateMetrics]);

  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
  const showScrollbar = hasMultiplePages && maxScroll > 2;
  const trackHeight = metrics.clientHeight;
  const thumbHeight = showScrollbar ? THUMB_HEIGHT : 0;
  const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = showScrollbar ? (metrics.scrollTop / maxScroll) * maxThumbTravel : 0;

  const scrollByThumbDelta = useCallback((deltaY) => {
    const element = scrollRef.current;
    if (!element || maxThumbTravel <= 0) return;

    const scrollRatio = maxScroll / maxThumbTravel;
    element.scrollTop = Math.max(0, Math.min(maxScroll, element.scrollTop + deltaY * scrollRatio));
  }, [maxScroll, maxThumbTravel]);

  useEffect(() => {
    function onMouseMove(event) {
      if (!dragState.current) return;
      scrollByThumbDelta(event.clientY - dragState.current.startY);
      dragState.current.startY = event.clientY;
    }

    function onMouseUp() {
      dragState.current = null;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [scrollByThumbDelta]);

  function handleThumbMouseDown(event) {
    event.preventDefault();
    dragState.current = { startY: event.clientY };
  }

  function handleTrackClick(event) {
    if (event.target !== event.currentTarget) return;
    const element = scrollRef.current;
    if (!element || maxScroll <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const targetThumbTop = clickY - thumbHeight / 2;
    const clampedThumbTop = Math.max(0, Math.min(maxThumbTravel, targetThumbTop));
    element.scrollTop = (clampedThumbTop / maxThumbTravel) * maxScroll;
  }

  function handleWheel(event) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop += event.deltaY;
  }

  return (
    <Window
      title={title}
      variant="pdf"
      zIndex={zIndex}
      containerRef={containerRef}
      windowStyle={{ width: windowWidth }}
      recenterKey={`${viewportHeight}-${windowWidth}-${pages.length}`}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="pdf-viewer">
        <div
          className="pdf-viewer__viewport"
          style={{ height: viewportHeight }}
          onWheel={handleWheel}
        >
          <div
            ref={scrollRef}
            className={`pdf-viewer__scroll${hasMultiplePages ? '' : ' pdf-viewer__scroll--locked'}`}
            style={{ height: viewportHeight }}
          >
            <div className="pdf-viewer__pages">
              {loading && <p className="pdf-viewer__status">Loading...</p>}
              {!loading && pages.length === 0 && (
                <p className="pdf-viewer__status">Could not load PDF.</p>
              )}
              {pages.map((page, index) => (
                <img
                  key={`page-${index + 1}`}
                  src={page.src}
                  alt={`Page ${index + 1}`}
                  className="pdf-viewer__page"
                  style={{ width: page.width, height: page.height }}
                  draggable={false}
                />
              ))}
            </div>
          </div>

          {showScrollbar && (
            <div
              className="pdf-viewer__track"
              onClick={handleTrackClick}
              role="presentation"
            >
              <div
                className="pdf-viewer__thumb"
                style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
                onMouseDown={handleThumbMouseDown}
                role="presentation"
              />
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}
