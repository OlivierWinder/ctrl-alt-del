import Window from './Window';
import { assetUrl } from '../utils/assetUrl';

export default function ErrorDialog({
  title = 'System Error',
  message,
  actions,
  icon = '/RESOURCES/msg_warning.png',
  layout = null,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onAction,
}) {
  const isIconOnly = layout === 'icon';
  const buttons = actions?.length
    ? actions
    : [{ id: 'ok', label: 'Ok' }];

  function handleAction(actionId) {
    if (onAction) {
      onAction(actionId);
      return;
    }
    onClose?.();
  }

  return (
    <Window
      title={title || (isIconOnly ? ' ' : 'System Error')}
      variant="error"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      placement="random"
      windowStyle={isIconOnly ? { width: '120px' } : undefined}
      onClose={onClose}
      onFocus={onFocus}
    >
      {isIconOnly ? (
        <button
          type="button"
          className="error-dialog error-dialog--icon"
          onClick={onClose}
          aria-label="Close"
        >
          <img
            src={assetUrl(icon || '/RESOURCES/msg_warning.png')}
            alt=""
            className="error-dialog__icon error-dialog__icon--solo"
          />
        </button>
      ) : (
        <div className="error-dialog">
          <div className="error-dialog__body">
            <img
              src={assetUrl(icon || '/RESOURCES/msg_warning.png')}
              alt=""
              className="error-dialog__icon"
            />
            <p className="error-dialog__message">{message}</p>
          </div>

          <div className="error-dialog__actions">
            {buttons.map((action) => (
              <button
                key={action.id}
                type="button"
                className="error-dialog__cancel"
                onClick={() => handleAction(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Window>
  );
}
