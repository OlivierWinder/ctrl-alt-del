import { useState } from 'react';
import RecoveryScreen from './RecoveryScreen';
import BootSplash from './BootSplash';
import Desktop from './Desktop';

const BOOT_SEQUENCE_ENABLED = true;

export default function BootSequence() {
  const [phase, setPhase] = useState('recovery');

  if (!BOOT_SEQUENCE_ENABLED) {
    return <Desktop />;
  }

  if (phase === 'recovery') {
    return <RecoveryScreen onContinue={() => setPhase('boot')} />;
  }

  if (phase === 'boot') {
    return <BootSplash onComplete={() => setPhase('desktop')} />;
  }

  return <Desktop />;
}
