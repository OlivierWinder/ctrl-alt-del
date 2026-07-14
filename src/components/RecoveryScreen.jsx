import { useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

const RECOVERY_TEXT = `SYSTEM RECOVERY
Last active: 2020
Human connection could not be restored.
Press `;

const TYPE_DURATION_MS = 3000;

export default function RecoveryScreen({ onContinue }) {
  const { displayed, done } = useTypewriter(RECOVERY_TEXT, TYPE_DURATION_MS);

  useEffect(() => {
    if (!done) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Enter') {
        onContinue();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [done, onContinue]);

  return (
    <div className="recovery-screen">
      <div className="recovery-screen__content">
        <div className="recovery-screen__line">
          <span className="recovery-screen__text">{displayed}</span>
          {done && (
            <>
              <button
                type="button"
                className="recovery-screen__keys"
                onClick={onContinue}
              >
                ENTER
              </button>
              <span className="recovery-screen__suffix"> to continue</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
