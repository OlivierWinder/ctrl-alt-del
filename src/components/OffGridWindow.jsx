import Window from './Window';
import { assetUrl } from '../utils/assetUrl';
import { offGridPrompt } from '../data/adsData';

export default function OffGridWindow({
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onAction,
}) {
  return (
    <Window
      title={offGridPrompt.title}
      variant="error"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      placement="center"
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="error-dialog">
        <div className="error-dialog__body">
          <img
            src={assetUrl(offGridPrompt.icon)}
            alt=""
            className="error-dialog__icon"
          />
          <p className="error-dialog__message">{offGridPrompt.message}</p>
        </div>

        <div className="error-dialog__actions">
          {offGridPrompt.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="error-dialog__cancel"
              onClick={() => onAction?.(action.id)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </Window>
  );
}
