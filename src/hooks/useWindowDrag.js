import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const TASKBAR_HEIGHT = 46;

function getCenteredPosition(container, windowEl, stackOffset = 0) {
  const winWidth = windowEl.offsetWidth;
  const winHeight = windowEl.offsetHeight;
  const step = 28;

  return {
    x: Math.max(0, (container.clientWidth - winWidth) / 2 + stackOffset * step),
    y: Math.max(0, (container.clientHeight - winHeight) / 2 + stackOffset * step),
  };
}

export function useWindowDrag(containerRef, windowRef, recenterKey, stackOffset = 0) {
  const [position, setPosition] = useState(null);
  const isDragging = useRef(false);
  const hasBeenDragged = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const centerWindow = useCallback(() => {
    if (!windowRef.current || !containerRef.current || hasBeenDragged.current) return;
    setPosition(getCenteredPosition(containerRef.current, windowRef.current, stackOffset));
  }, [containerRef, windowRef, stackOffset]);

  useLayoutEffect(() => {
    hasBeenDragged.current = false;
    centerWindow();
  }, [centerWindow, recenterKey]);

  useEffect(() => {
    const win = windowRef.current;
    if (!win) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      centerWindow();
    });

    resizeObserver.observe(win);

    return () => resizeObserver.disconnect();
  }, [centerWindow, recenterKey]);

  const onTitleBarMouseDown = useCallback((event) => {
    if (event.target.closest('.title_bar__button')) return;
    if (!windowRef.current || !containerRef.current || !position) return;

    isDragging.current = true;
    const winRect = windowRef.current.getBoundingClientRect();
    offset.current = {
      x: event.clientX - winRect.left,
      y: event.clientY - winRect.top,
    };
    event.preventDefault();
  }, [containerRef, windowRef, position]);

  useEffect(() => {
    function onMouseMove(event) {
      if (!isDragging.current || !windowRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const winWidth = windowRef.current.offsetWidth;
      const winHeight = windowRef.current.offsetHeight;
      const maxY = containerRect.height - TASKBAR_HEIGHT - winHeight;

      let x = event.clientX - containerRect.left - offset.current.x;
      let y = event.clientY - containerRect.top - offset.current.y;

      x = Math.max(0, Math.min(x, containerRect.width - winWidth));
      y = Math.max(0, Math.min(y, maxY));

      setPosition({ x, y });
    }

    function onMouseUp() {
      if (isDragging.current) {
        hasBeenDragged.current = true;
      }
      isDragging.current = false;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerRef, windowRef]);

  return { position, onTitleBarMouseDown };
}
