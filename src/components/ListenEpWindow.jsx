import Window from './Window';

export default function ListenEpWindow({
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onOpenEp,
}) {
  return (
    <Window
      title="LISTEN TO EP"
      variant="order-copy"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      placement="center"
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="order-copy">
        <p className="order-copy__message">LISTEN TO EP</p>
        <button
          type="button"
          className="order-copy__btn"
          onClick={() => onOpenEp?.()}
        >
          EP
        </button>
      </div>
    </Window>
  );
}
