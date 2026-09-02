import { useEffect, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

const INTRO_TEXT = `CTRL-ALT-DEL™ SYSTEM v3.8.4
Copyright (C) 2026 CTRL-ALT-DEL SOFTWARE

Initializing kernel...
Loading system modules...
Checking memory.................... OK
CPU: Detected
RAM: 32768 MB
Storage: Online

Mounting virtual filesystem... OK
Loading drivers...
Starting network services...
Verifying security certificates... OK

Loading interface...
Starting background processes...
Synchronizing core libraries...

STATUS: READY
`;

const PROMPT_TEXT = 'PRESS ANYWHERE TO BEGIN';
const INTRO_DURATION_MS = 1800;
const PROMPT_DURATION_MS = 700;
const CLEAR_DELAY_MS = 350;

export default function RecoveryScreen({ onContinue }) {
  const [stage, setStage] = useState('intro'); // intro | prompt
  const intro = useTypewriter(INTRO_TEXT, INTRO_DURATION_MS, stage === 'intro');
  const prompt = useTypewriter(PROMPT_TEXT, PROMPT_DURATION_MS, stage === 'prompt');

  useEffect(() => {
    if (stage !== 'intro' || !intro.done) return undefined;
    const timer = setTimeout(() => setStage('prompt'), CLEAR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [stage, intro.done]);

  useEffect(() => {
    if (stage !== 'prompt' || !prompt.done) return undefined;

    function handleContinue() {
      onContinue();
    }

    window.addEventListener('keydown', handleContinue);
    window.addEventListener('pointerdown', handleContinue);
    return () => {
      window.removeEventListener('keydown', handleContinue);
      window.removeEventListener('pointerdown', handleContinue);
    };
  }, [stage, prompt.done, onContinue]);

  if (stage === 'prompt') {
    return (
      <div
        className={`recovery-screen recovery-screen--centered${prompt.done ? ' recovery-screen--ready' : ''}`}
        role="button"
        tabIndex={0}
      >
        <span
          className={`recovery-screen__prompt${prompt.done ? ' recovery-screen__keys' : ''}`}
        >
          {prompt.displayed}
        </span>
      </div>
    );
  }

  return (
    <div className="recovery-screen">
      <div className="recovery-screen__content">
        <div className="recovery-screen__line">
          <span className="recovery-screen__text">{intro.displayed}</span>
        </div>
      </div>
    </div>
  );
}
