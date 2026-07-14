import { useCallback, useEffect, useRef, useState } from 'react';

export function useDraggable(containerRef, elementRef, initialPosition) {
  const [position, setPosition] = useState(initialPosition);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((event) => {
    if (!containerRef.current) return;

    isDragging.current = true;
    const rect = event.currentTarget.getBoundingClientRect();
    offset.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    event.preventDefault();
  }, [containerRef]);

  useEffect(() => {
    function onMouseMove(event) {
      if (!isDragging.current || !containerRef.current || !elementRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const iconWidth = elementRef.current.offsetWidth;
      const iconHeight = elementRef.current.offsetHeight;

      let x = event.clientX - containerRect.left - offset.current.x;
      let y = event.clientY - containerRect.top - offset.current.y;

      x = Math.max(0, Math.min(x, containerRect.width - iconWidth));
      y = Math.max(0, Math.min(y, containerRect.height - iconHeight));

      setPosition({ x, y });
    }

    function onMouseUp() {
      isDragging.current = false;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerRef, elementRef]);

  return { position, onMouseDown };
}
