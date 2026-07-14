import Window from './Window';
import { buildAddressPath } from '../utils/folderNavigation';
import navArrow from '../assets/nav_arrow.png';

export default function FolderWindow({
  config,
  zIndex,
  containerRef,
  folderPath,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onClose,
  onOpenItem,
}) {
  return (
    <Window
      title={`Exploring - ${config.title}`}
      variant="documents"
      zIndex={zIndex}
      containerRef={containerRef}
      onClose={onClose}
    >
      <div className="window__address">
        <div className="window__nav_btns">
          <button
            type="button"
            className={`window__nav_btn${canGoBack ? ' window__nav_btn--active' : ''}`}
            disabled={!canGoBack}
            onClick={onBack}
            aria-label="Back"
          >
            <img src={navArrow} alt="" className="window__nav_btn__icon" />
          </button>
          <button
            type="button"
            className={`window__nav_btn${canGoForward ? ' window__nav_btn--active' : ''}`}
            disabled={!canGoForward}
            onClick={onForward}
            aria-label="Forward"
          >
            <img
              src={navArrow}
              alt=""
              className="window__nav_btn__icon window__nav_btn__icon--forward"
            />
          </button>
        </div>
        <div className="window__address_bar">{buildAddressPath(folderPath)}</div>
      </div>

      <div className="window__content">
        {config.items.map((item) => (
          <div
            key={item.label}
            className="window__folder"
            onDoubleClick={() => {
              if (item.opens) {
                onOpenItem(item.opens, { autoplay: item.autoplay });
              }
            }}
          >
            <img src={item.icon} alt="" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}
