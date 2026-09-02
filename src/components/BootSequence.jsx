import { useState } from 'react';
import BootStartScreen from './BootStartScreen';
import BootBlackout from './BootBlackout';
import Desktop from './Desktop';

const BOOT_SEQUENCE_ENABLED = true;

export default function BootSequence() {
  const [phase, setPhase] = useState('start'); // start | blackout | desktop

  if (!BOOT_SEQUENCE_ENABLED) {
    return <Desktop />;
  }

  return (
    <>
      <div className={phase === 'desktop' ? 'boot-desktop' : 'boot-preload'}>
        <Desktop />
      </div>

      {phase === 'start' && (
        <BootStartScreen onContinue={() => setPhase('blackout')} />
      )}

      {phase === 'blackout' && (
        <BootBlackout onComplete={() => setPhase('desktop')} />
      )}
    </>
  );
}
