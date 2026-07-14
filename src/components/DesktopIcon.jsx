import { useRef } from 'react';
import { useDraggable } from '../hooks/useDraggable';

export default function DesktopIcon({
  icon,
  isSelected,
  initialPosition,
  containerRef,
  onSelect,
  onOpen,
}) {
  const iconRef = useRef(null);
  const { position, onMouseDown } = useDraggable(containerRef, iconRef, initialPosition);

  return (
    <div
      ref={iconRef}
      className={`desktop__icon${isSelected ? ' selected' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={(event) => {
        onSelect(icon.id);
        onMouseDown(event);
      }}
      onDoubleClick={() => onOpen(icon.id, icon.type === 'video')}
    >
      <img src={icon.icon} alt="" className="desktop__icon__img" />
      <span className="desktop__icon__span">{icon.label}</span>
    </div>
  );
}
