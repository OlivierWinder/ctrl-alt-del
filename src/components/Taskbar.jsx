import { useEffect, useRef, useState } from 'react';
import { useClock } from '../hooks/useClock';
import { getWindowMeta } from '../utils/getWindowMeta';
import { assetUrl } from '../utils/assetUrl';

export default function Taskbar({
  windows,
  focusedId,
  onTaskbarClick,
  onLogOff,
  onOpenSystemScreen,
  onOpenCredits,
}) {
  const time = useClock();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const startAreaRef = useRef(null);

  useEffect(() => {
    if (!isStartOpen) return undefined;

    function handlePointerDown(event) {
      if (!startAreaRef.current?.contains(event.target)) {
        setIsStartOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsStartOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStartOpen]);

  return (
    <footer className="footer">
      <div className="footer__start-area" ref={startAreaRef}>
        <button
          type="button"
          className={`footer__start_btn${isStartOpen ? ' footer__start_btn--active' : ''}`}
          aria-expanded={isStartOpen}
          aria-haspopup="menu"
          onClick={() => setIsStartOpen((open) => !open)}
        >
          <img src={assetUrl('/RESOURCES/windows_icon.png')} alt="" className="footer__start_btn__img" />
          Start
        </button>

        {isStartOpen && (
          <div className="start-menu" role="menu">
            <div className="start-menu__sidebar" aria-hidden="true" />

            <div className="start-menu__list">
              <button
                type="button"
                className="start-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsStartOpen(false);
                  onOpenSystemScreen?.('system_information');
                }}
              >
                <img
                  src={assetUrl('/RESOURCES/internet_icon.png')}
                  alt=""
                  className="start-menu__item-icon"
                />
                <span className="start-menu__item-label">System Information</span>
              </button>

              <button
                type="button"
                className="start-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsStartOpen(false);
                  onOpenSystemScreen?.('profile');
                }}
              >
                <img
                  src={assetUrl('/RESOURCES/notes_icon.png')}
                  alt=""
                  className="start-menu__item-icon"
                />
                <span className="start-menu__item-label">Profile</span>
              </button>

              <button
                type="button"
                className="start-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsStartOpen(false);
                  onOpenCredits?.();
                }}
              >
                <img
                  src={assetUrl('/RESOURCES/notes_icon.png')}
                  alt=""
                  className="start-menu__item-icon"
                />
                <span className="start-menu__item-label">Credits</span>
              </button>

              <div className="start-menu__separator" role="separator" />

              <button
                type="button"
                className="start-menu__item"
                role="menuitem"
                onClick={() => {
                  setIsStartOpen(false);
                  onLogOff?.();
                }}
              >
                <img
                  src={assetUrl('/RESOURCES/log_off.png')}
                  alt=""
                  className="start-menu__item-icon"
                />
                <span className="start-menu__item-label">Log Off...</span>
              </button>

              <button
                type="button"
                className="start-menu__item"
                role="menuitem"
                onClick={() => setIsStartOpen(false)}
              >
                <img
                  src={assetUrl('/RESOURCES/shut_down.png')}
                  alt=""
                  className="start-menu__item-icon"
                />
                <span className="start-menu__item-label">Restart...</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="footer__items">
        {windows.map((win) => {
          const windowMeta = getWindowMeta(win);
          const isActive = focusedId === win.instanceId && !win.minimized;

          return (
            <button
              key={win.instanceId}
              type="button"
              className={`footer__app-btn${isActive ? ' footer__app-btn--active' : ''}`}
              onClick={() => onTaskbarClick(win.instanceId)}
              title={windowMeta.title}
            >
              <img
                src={assetUrl(windowMeta.icon)}
                alt=""
                className="footer__app-btn__icon"
              />
              <span className="footer__app-btn__label">{windowMeta.title}</span>
            </button>
          );
        })}
      </div>

      <div className="footer__clock">{time}</div>
    </footer>
  );
}
