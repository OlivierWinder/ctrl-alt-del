import { assetUrl } from '../utils/assetUrl';
import { adDictionPrompt } from '../data/adsData';

/** Corner tip only. Stats + off-grid live as real Window overlays. */
export default function AdDictionPrompt({
  showAdDiction = false,
  zIndex = 1,
  onAction,
  onCloseAdDiction,
  onFocus,
}) {
  if (!showAdDiction) return null;

  return (
    <div
      className="ad-diction-prompt"
      role="dialog"
      aria-label={adDictionPrompt.title}
      style={{ zIndex }}
      onMouseDown={() => onFocus?.()}
    >
      <div className="ad-diction-prompt__title">
        <span>{adDictionPrompt.title}</span>
        <button
          type="button"
          className="title_bar__button"
          onClick={onCloseAdDiction}
          aria-label="Close"
        >
          X
        </button>
      </div>
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
    </div>
  );
}
