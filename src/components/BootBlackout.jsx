import { useEffect } from 'react';

const BLACKOUT_MS = 1000;

export default function BootBlackout({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, BLACKOUT_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <div className="boot-blackout" aria-hidden="true" />;
}
