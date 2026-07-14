import { useEffect, useState } from 'react';

export function useTypewriter(text, durationMs, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    setDisplayed('');
    setDone(false);

    if (!text.length) {
      setDone(true);
      return undefined;
    }

    const interval = durationMs / text.length;
    let index = 0;

    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [text, durationMs, active]);

  return { displayed, done };
}
