import ImageViewer from './ImageViewer';

export default function FakeAdOverlay({
  src,
  onClose,
  onFocus,
  containerRef,
  zIndex = 0,
}) {
  if (!src) return null;

  const title = src.split('/').pop() || 'Advertisement';

  return (
    <ImageViewer
      title={title}
      imageSrc={src}
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={0}
      onClose={onClose}
      onFocus={onFocus}
    />
  );
}
