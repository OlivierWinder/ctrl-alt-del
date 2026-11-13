import Window from './Window';

export default function CreditsWindow({
  title = 'Credits',
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  return (
    <Window
      title={title}
      variant="credits"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="credits-window">
        <textarea
          className="credits-window__text"
          aria-label="Credits"
          spellCheck={false}
          defaultValue=""
        />
      </div>
    </Window>
  );
}
