import { assetUrl } from '../utils/assetUrl';
import { adDictionPrompt, offGridPrompt } from '../data/adsData';

function PromptChrome({ title, onClose, className, children }) {
  return (
    <div className={className} role="dialog" aria-label={title}>
      <div className="ad-diction-prompt__title">
        <span>{title}</span>
        <button
          type="button"
          className="title_bar__button"
          onClick={onClose}
          aria-label="Close"
        >
          X
        </button>
      </div>
      {children}
    </div>
  );
}

/** Corner tip + off-grid overlay. Stats live in AdDictionWindow (taskbar app). */
export default function AdDictionPrompt({
  showAdDiction = false,
  showOffGrid = false,
  onAction,
  onCloseAdDiction,
  onCloseOffGrid,
}) {
  return (
    <>
      {showOffGrid && (
        <PromptChrome
          title={offGridPrompt.title}
          onClose={onCloseOffGrid}
          className="ad-diction-prompt ad-diction-prompt--off-grid"
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
        </PromptChrome>
      )}

      {showAdDiction && (
        <PromptChrome
          title={adDictionPrompt.title}
          onClose={onCloseAdDiction}
          className="ad-diction-prompt"
        >
          <div className="error-dialog">
            <div className="error-dialog__body">
              <img
                src={assetUrl(adDictionPrompt.icon)}
                alt=""
                className="error-dialog__icon"
              />
              <p className="error-dialog__message">{adDictionPrompt.message}</p>
            </div>

            <div className="error-dialog__actions">
              {adDictionPrompt.actions.map((action) => (
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
        </PromptChrome>
      )}
    </>
  );
}
