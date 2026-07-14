import { useEffect } from 'react';
import startupLogo from '../assets/startup_logo.jpg';

const BOOT_DURATION_MS = 3500;

export default function BootSplash({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, BOOT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="boot-splash">
      <img
        src={startupLogo}
        alt="CTRL-ALT-DEL Operating System"
        className="boot-splash__logo"
      />
    </div>
  );
}
