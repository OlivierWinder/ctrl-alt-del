import { useCallback, useEffect, useRef, useState } from 'react';
import Window from './Window';
import { notes } from '../data/notesData';

const DASH_RULE = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -';
const THUMB_HEIGHT = 100;

export default function NotesApp({
  title = 'NOTES',
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? null);
  const selectedNote = notes.find((note) => note.id === selectedId) || notes[0] || null;

  const scrollRef = useRef(null);
  const dragState = useRef(null);
  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

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

    element.scrollTop = 0;
    element.addEventListener('scroll', updateMetrics);
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(element);
    if (element.firstElementChild) {
      resizeObserver.observe(element.firstElementChild);
    }
    updateMetrics();

    return () => {
      element.removeEventListener('scroll', updateMetrics);
      resizeObserver.disconnect();
    };
  }, [selectedId, updateMetrics]);

  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
  const showScrollbar = maxScroll > 2;
  const trackHeight = metrics.clientHeight;
  const thumbHeight = showScrollbar ? THUMB_HEIGHT : 0;
  const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = showScrollbar && maxScroll > 0
    ? (metrics.scrollTop / maxScroll) * maxThumbTravel
    : 0;

  const scrollByThumbDelta = useCallback((deltaY) => {
    const element = scrollRef.current;
    if (!element || maxThumbTravel <= 0) return;

    const scrollRatio = maxScroll / maxThumbTravel;
    element.scrollTop = Math.max(
      0,
      Math.min(maxScroll, element.scrollTop + deltaY * scrollRatio),
    );
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

  return (
    <Window
      title={title}
      variant="notes"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="notes-app">
        <aside className="notes-app__list" aria-label="Notes">
          {notes.map((note) => {
            const isActive = selectedNote?.id === note.id;

            return (
              <button
                key={note.id}
                type="button"
                className={`notes-app__list-item${isActive ? ' notes-app__list-item--active' : ''}`}
                onClick={() => setSelectedId(note.id)}
              >
                <span className="notes-app__list-title">{note.title}</span>
                {note.date ? (
                  <span className="notes-app__list-date">{note.date}</span>
                ) : null}
              </button>
            );
          })}
        </aside>

        <section className="notes-app__viewer" aria-label="Selected note">
          <div ref={scrollRef} className="notes-app__scroll">
            {selectedNote ? (
              <div className="notes-app__viewer-panel">
                <div className="notes-app__viewer-header">
                  <h2 className="notes-app__viewer-title">{selectedNote.title}</h2>
                  {selectedNote.date ? (
                    <div className="notes-app__viewer-date">{selectedNote.date}</div>
                  ) : null}
                  <div className="notes-app__viewer-rule" aria-hidden="true">
                    {DASH_RULE}
                  </div>
                </div>
                <div className="notes-app__viewer-body">{selectedNote.body}</div>
              </div>
            ) : (
              <p className="notes-app__empty">No notes.</p>
            )}
          </div>

          {showScrollbar ? (
            <div
              className="notes-app__track"
              onClick={handleTrackClick}
              role="presentation"
            >
              <div
                className="notes-app__thumb"
                style={{ height: thumbHeight, transform: `translateY(${thumbTop}px)` }}
                onMouseDown={handleThumbMouseDown}
                role="presentation"
              />
            </div>
          ) : null}
        </section>
      </div>
    </Window>
  );
}
