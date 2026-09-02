import Window from './Window';

export default function SimpleWindow({
  title,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  return (
    <Window
      title={title}
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    />
  );
}
