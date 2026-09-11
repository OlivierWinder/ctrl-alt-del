import { useRef } from 'react';
import { useWindowDrag } from '../hooks/useWindowDrag';

export default function Window({
  title,
  variant = 'default',
  zIndex,
  containerRef,
  windowStyle,
  recenterKey,
  stackOffset = 0,
  placement = 'center',
  onClose,
  onFocus,
  children,
}) {
  const windowRef = useRef(null);
  const { position, onTitleBarMouseDown } = useWindowDrag(
    containerRef,
    windowRef,
    recenterKey,
    stackOffset,
    placement,
  );

  const className = [
    'window',
    variant === 'documents' ? 'window--documents' : '',
    variant === 'cdplayer' ? 'window--cdplayer' : '',
    variant === 'pdf' ? 'window--pdf' : '',
    variant === 'image' ? 'window--image' : '',
    variant === 'error' ? 'window--error' : '',
    variant === 'notes' ? 'window--notes' : '',
    variant === 'email' ? 'window--email' : '',
    variant === 'email-reply' ? 'window--email-reply' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isFlexColumn = variant === 'documents'
    || variant === 'pdf'
    || variant === 'image'
    || variant === 'error'
    || variant === 'notes'
    || variant === 'cdplayer'
    || variant === 'email'
    || variant === 'email-reply';

  const style = {
    display: isFlexColumn ? 'flex' : 'block',
    flexDirection: isFlexColumn ? 'column' : undefined,
    visibility: position ? 'visible' : 'hidden',
    zIndex,
    left: position ? `${position.x}px` : 0,
    top: position ? `${position.y}px` : 0,
    ...windowStyle,
  };

  return (
    <div
      ref={windowRef}
      className={className}
      style={style}
      onMouseDown={() => onFocus?.()}
    >
      <div
        className="window__title_bar"
        onMouseDown={(event) => {
          onFocus?.();
          onTitleBarMouseDown(event);
        }}
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
