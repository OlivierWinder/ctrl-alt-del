import Window from './Window';

export default function SimpleWindow({ title, zIndex, containerRef, onClose }) {
  return (
    <Window
      title={title}
      zIndex={zIndex}
      containerRef={containerRef}
      onClose={onClose}
    />
  );
}
