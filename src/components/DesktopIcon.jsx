import { useRef } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import PdfThumbIcon from './PdfThumbIcon';
import { pdfWindows } from '../data/content';
import { assetUrl } from '../utils/assetUrl';

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
  const pdfSrc = pdfWindows[icon.id]?.pdf;
  const usePdfThumb = Boolean(pdfSrc) && icon.icon.endsWith('folder.png');

  return (
    <div
      ref={iconRef}
      className={`desktop__icon${isSelected ? ' selected' : ''}${icon.hidden ? ' desktop__icon--hidden' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      aria-hidden={icon.hidden ? true : undefined}
      onMouseDown={(event) => {
        if (icon.hidden) return;
        onSelect(icon.id);
        onMouseDown(event);
      }}
      onDoubleClick={() => {
        if (icon.hidden) return;
        onOpen(icon.id, icon.type === 'video');
      }}
    >
      {usePdfThumb ? (
        <PdfThumbIcon pdfSrc={pdfSrc} className="desktop__icon__img pdf-thumb-icon" />
      ) : (
        <img src={assetUrl(icon.icon)} alt="" className="desktop__icon__img" />
      )}
      <span className="desktop__icon__span">{icon.label}</span>
    </div>
  );
}
