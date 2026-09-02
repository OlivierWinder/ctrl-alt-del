import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Window from './Window';
import PdfThumbIcon from './PdfThumbIcon';
import { buildAddressPath } from '../utils/folderNavigation';
import { layoutFolderItems } from '../utils/layoutFolderItems';
import { truncateFolderLabel } from '../utils/truncateFolderLabel';
import { assetUrl } from '../utils/assetUrl';
import navArrow from '../assets/nav_arrow.png';

const THUMB_HEIGHT = 100;

export default function FolderWindow({
  config,
  zIndex,
  containerRef,
  folderPath,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onClose,
  onOpenItem,
  onFocus,
  stackOffset = 0,
}) {
  const scrollRef = useRef(null);
  const dragState = useRef(null);
  const [metrics, setMetrics] = useState({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });

  const layoutCells = useMemo(
    () => layoutFolderItems(config.items),
    [config.items],
  );

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
  }, [layoutCells, updateMetrics]);

  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
  const showScrollbar = maxScroll > 2;
  const trackHeight = metrics.clientHeight;
  const thumbHeight = showScrollbar ? THUMB_HEIGHT : 0;
  const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = maxScroll > 0 ? (metrics.scrollTop / maxScroll) * maxThumbTravel : 0;

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
      title={`Exploring - ${config.title}`}
      variant="documents"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="window__address">
        <div className="window__nav_btns">
          <button
            type="button"
            className={`window__nav_btn${canGoBack ? ' window__nav_btn--active' : ''}`}
            disabled={!canGoBack}
            onClick={onBack}
            aria-label="Back"
          >
            <img src={navArrow} alt="" className="window__nav_btn__icon" />
          </button>
          <button
            type="button"
            className={`window__nav_btn${canGoForward ? ' window__nav_btn--active' : ''}`}
            disabled={!canGoForward}
            onClick={onForward}
            aria-label="Forward"
          >
            <img
              src={navArrow}
              alt=""
              className="window__nav_btn__icon window__nav_btn__icon--forward"
            />
          </button>
        </div>
        <div className="window__address_bar">{buildAddressPath(folderPath)}</div>
      </div>

      <div className="window__folder-body" onWheel={handleWheel}>
        <div ref={scrollRef} className="window__content">
          {layoutCells.map((cell) => {
            if (cell.type === 'spacer') {
              return (
                <div
                  key={cell.key}
                  className="window__folder window__folder--spacer"
                  aria-hidden="true"
                />
              );
            }

            const { item } = cell;
            return (
              <div
                key={cell.key}
                className="window__folder"
                title={item.label}
              onDoubleClick={() => {
                if (item.opens || item.pdf || item.image || item.audio) {
                  onOpenItem(item);
                }
              }}
              >
                {item.pdf ? (
                  <PdfThumbIcon pdfSrc={item.pdf} />
                ) : (
                  <img src={assetUrl(item.icon)} alt="" />
                )}
                <span>{truncateFolderLabel(item.label)}</span>
              </div>
            );
          })}
        </div>

        {showScrollbar && (
          <div
            className="window__folder-track"
            onClick={handleTrackClick}
            role="presentation"
          >
            <div
              className="window__folder-thumb"
              style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
              onMouseDown={handleThumbMouseDown}
              role="presentation"
            />
          </div>
        )}
      </div>
    </Window>
  );
}
