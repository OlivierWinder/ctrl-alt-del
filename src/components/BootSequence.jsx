import { useState } from 'react';
import RecoveryScreen from './RecoveryScreen';
import BootSplash from './BootSplash';
import Desktop from './Desktop';

// Set to true when you're ready to enable the boot sequence again
const BOOT_SEQUENCE_ENABLED = false;

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
