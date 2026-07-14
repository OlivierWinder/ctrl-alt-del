import { useClock } from '../hooks/useClock';
import { getWindowMeta } from '../utils/getWindowMeta';

export default function Taskbar({ openWindowId, isMinimized, onTaskbarClick }) {
  const time = useClock();
  const windowMeta = getWindowMeta(openWindowId);

  return (
    <footer className="footer">
      <button type="button" className="footer__start_btn">
        <img src="/RESOURCES/windows_icon.png" alt="" className="footer__start_btn__img" />
        Start
      </button>

      <div className="footer__items">
        {windowMeta && (
          <button
            type="button"
            className={`footer__app-btn${!isMinimized ? ' footer__app-btn--active' : ''}`}
            onClick={onTaskbarClick}
          >
            <img
              src={windowMeta.icon}
              alt=""
              className="footer__app-btn__icon"
            />
            <span className="footer__app-btn__label">{windowMeta.title}</span>
          </button>
        )}
      </div>

      <div className="footer__clock">{time}</div>
    </footer>
  );
}
