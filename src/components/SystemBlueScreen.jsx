import { useEffect } from 'react';
import { systemScreens } from '../data/systemScreens';

export default function SystemBlueScreen({ screenId, onClose }) {
  const screen = systemScreens[screenId];

  useEffect(() => {
    if (!screen) return undefined;

    function onKeyDown(event) {
      if (
        event.key === 'Escape'
        || event.key === 'Enter'
        || event.key === ' '
        || event.code === 'Space'
      ) {
        event.preventDefault();
        onClose?.();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, onClose]);

  if (!screen) return null;

  return (
    <div
      className="system-blue-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-blue-screen-title"
      onClick={() => onClose?.()}
    >
      <div className="system-blue-screen__panel">
        <pre className="system-blue-screen__header" aria-hidden="true">
{`CTRL-ALT-DEL OS  v1.0.0
========================================
MODULE .......... ${screen.heading}
STATUS .......... LOADED
ACCESS .......... GRANTED
========================================`}
        </pre>

        <h1 id="system-blue-screen-title" className="system-blue-screen__title">
          {`> ${screen.heading}`}
        </h1>

        <div className="system-blue-screen__body">
          {screen.lines.map((line, index) => (
            <p key={`${screen.id}-${index}`} className="system-blue-screen__line">
              <span className="system-blue-screen__prompt" aria-hidden="true">{'> '}</span>
              {line}
            </p>
          ))}
        </div>

        <p className="system-blue-screen__footer">
          PRESS ANYWHERE TO EXIT
        </p>
      </div>
    </div>
  );
}
