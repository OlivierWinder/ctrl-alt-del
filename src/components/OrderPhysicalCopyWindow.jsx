import Window from './Window';

export default function OrderPhysicalCopyWindow({
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onOpenCdRom,
}) {
  return (
    <Window
      title="ORDER PHYSICAL COPY"
      variant="order-copy"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      placement="center"
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="order-copy">
        <p className="order-copy__message">ORDER PHYSICAL COPY</p>
        <button
          type="button"
          className="order-copy__btn"
          onClick={() => onOpenCdRom?.()}
        >
          CD_ROM
        </button>
      </div>
    </Window>
  );
}
