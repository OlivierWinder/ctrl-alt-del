import Window from './Window';
import { assetUrl } from '../utils/assetUrl';

export default function ImageViewer({
  title,
  imageSrc,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  return (
    <Window
      title={title}
      variant="image"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="image-viewer">
        <img src={assetUrl(imageSrc)} alt={title} className="image-viewer__img" draggable={false} />
      </div>
    </Window>
  );
}
