import Window from './Window';
import { assetUrl } from '../utils/assetUrl';
import { adDictionPrompt } from '../data/adsData';

export default function AdDictionWindow({
  adsShownCount = 0,
  attentionEuros = 0,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onBlockAds,
}) {
  return (
    <Window
      title="ad-diction"
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
            src={assetUrl(adDictionPrompt.icon)}
            alt=""
            className="error-dialog__icon"
          />
          <div className="ad-diction-prompt__stats-text">
            <p>Number of ads shown today: {adsShownCount}</p>
            <p>
              The attention economy has made €{attentionEuros} by spiking your
              dopamine.
            </p>
            <p>Ads that have been relevant to your quality of life: 0</p>
          </div>
        </div>

        <div className="error-dialog__actions">
          <button
            type="button"
            className="error-dialog__cancel ad-diction-prompt__block"
            onClick={onBlockAds}
          >
            Block all ads now
          </button>
        </div>
      </div>
    </Window>
  );
}
