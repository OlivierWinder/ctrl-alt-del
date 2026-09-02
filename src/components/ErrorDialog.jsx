import Window from './Window';
import { assetUrl } from '../utils/assetUrl';

export default function ErrorDialog({
  title = 'System Error',
  message,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  return (
    <Window
      title={title}
      variant="error"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="error-dialog">
        <div className="error-dialog__body">
          <img
            src={assetUrl('/RESOURCES/msg_warning.png')}
            alt=""
            className="error-dialog__icon"
          />
          <p className="error-dialog__message">{message}</p>
        </div>

        <div className="error-dialog__actions">
          <button
            type="button"
            className="error-dialog__cancel"
            onClick={onClose}
          >
            Ok
          </button>
        </div>
      </div>
    </Window>
  );
}
