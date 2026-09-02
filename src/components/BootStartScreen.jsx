import { useEffect } from 'react';
import { assetUrl } from '../utils/assetUrl';

export default function BootStartScreen({ onContinue }) {
  useEffect(() => {
    function handleContinue() {
      onContinue();
    }

    window.addEventListener('keydown', handleContinue);
    window.addEventListener('pointerdown', handleContinue);

    return () => {
      window.removeEventListener('keydown', handleContinue);
      window.removeEventListener('pointerdown', handleContinue);
    };
  }, [onContinue]);

  return (
    <div className="boot-start" role="button" tabIndex={0}>
      <div className="boot-start__panel">
        <div className="boot-start__brand">
          <h1 className="boot-start__title">
            <img
              src={assetUrl('/RESOURCES/boot_logo.png')}
              alt="ctrl-alt-del"
              className="boot-start__logo"
              draggable={false}
            />
          </h1>
          <p className="boot-start__meta">
            ©1994 ctrl-alt-del corp. v1.0.0 operating system
          </p>
        </div>

        <p className="boot-start__prompt">PRESS ANYWHERE TO START</p>
      </div>
    </div>
  );
}
