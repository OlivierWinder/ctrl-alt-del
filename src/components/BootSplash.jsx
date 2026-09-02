import { useEffect } from 'react';
import { assetUrl } from '../utils/assetUrl';

const BOOT_DURATION_MS = 3500;

export default function BootSplash({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, BOOT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="boot-splash">
      <img
        src={assetUrl('/RESOURCES/startup_logo_new.png')}
        alt="CTRL-ALT-DEL Operating System"
        className="boot-splash__logo"
      />
    </div>
  );
}
