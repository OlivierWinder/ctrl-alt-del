import Window from './Window';
import { assetUrl } from '../utils/assetUrl';
import { onlineOfflinePrompt } from '../data/adsData';

export default function FakeAdOverlay({
  src,
  onClose,
  containerRef,
  zIndex = 11000,
  showConnectionPrompt = false,
  onConnectionChoice,
}) {
  if (!src) return null;

  const title = src.split('/').pop() || 'Advertisement';

  return (
    <Window
      title={title}
      variant="image"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={0}
      onClose={onClose}
      onFocus={() => {}}
    >
      <div className="image-viewer image-viewer--ad">
        <img
          src={assetUrl(src)}
          alt={title}
          className="image-viewer__img"
          draggable={false}
        />

        {showConnectionPrompt && (
          <div className="ad-connection-prompt" role="dialog" aria-label={onlineOfflinePrompt.title}>
            <div className="ad-connection-prompt__title">
              <span>{onlineOfflinePrompt.title}</span>
              <button
                type="button"
                className="title_bar__button"
                onClick={() => onConnectionChoice?.('dismiss')}
                aria-label="Close"
              >
                X
              </button>
            </div>

            <div className="ad-connection-prompt__body">
              <img
                src={assetUrl(onlineOfflinePrompt.icon)}
                alt=""
                className="ad-connection-prompt__icon"
              />
              <p className="ad-connection-prompt__message">{onlineOfflinePrompt.message}</p>
            </div>

            <div className="ad-connection-prompt__actions">
              {onlineOfflinePrompt.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="error-dialog__cancel"
                  onClick={() => onConnectionChoice?.(action.id)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Window>
  );
}
