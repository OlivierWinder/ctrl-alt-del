import { useRef } from 'react';
import { useWindowDrag } from '../hooks/useWindowDrag';

export default function Window({
  title,
  variant = 'default',
  zIndex,
  containerRef,
  windowStyle,
  recenterKey,
  onClose,
  children,
}) {
  const windowRef = useRef(null);
  const { position, onTitleBarMouseDown } = useWindowDrag(containerRef, windowRef, recenterKey);

  const className = [
    'window',
    variant === 'documents' ? 'window--documents' : '',
    variant === 'cdplayer' ? 'window--cdplayer' : '',
    variant === 'pdf' ? 'window--pdf' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style = {
    display: 'block',
    visibility: position ? 'visible' : 'hidden',
    zIndex,
    left: position ? `${position.x}px` : 0,
    top: position ? `${position.y}px` : 0,
    ...windowStyle,
  };

  return (
    <div ref={windowRef} className={className} style={style}>
      <div
        className="window__title_bar"
        onMouseDown={onTitleBarMouseDown}
      >
        {title}
        <button type="button" className="title_bar__button" onClick={onClose}>
          X
        </button>
      </div>
      {children}
    </div>
  );
}
