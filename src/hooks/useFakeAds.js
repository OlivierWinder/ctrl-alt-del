import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FIRST_AD_DELAY_MS,
  fakeAds,
  randomNextAdDelay,
} from '../data/adsData';

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/**
 * Fake ads — only schedules once the desktop session is active.
 * First ad after FIRST_AD_DELAY_MS; later ads 30–60s after each dismissal
 * unless the user chooses Offline on the connection prompt.
 * The connection prompt overlays the first ad; the ad stays open until the user closes it.
 */
export function useFakeAds({ isActive }) {
  const [currentAd, setCurrentAd] = useState(null);
  const [showConnectionPrompt, setShowConnectionPrompt] = useState(false);
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const adsEnabledRef = useRef(true);
  const connectionPromptShownRef = useRef(false);
  const isActiveRef = useRef(isActive);

  isActiveRef.current = isActive;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const takeNextAd = useCallback(() => {
    if (queueRef.current.length === 0) {
      queueRef.current = shuffle(fakeAds);
    }
    return queueRef.current.shift() || null;
  }, []);

  const showAd = useCallback((src) => {
    setCurrentAd(src);
    if (!connectionPromptShownRef.current) {
      connectionPromptShownRef.current = true;
      setShowConnectionPrompt(true);
    }
  }, []);

  const scheduleAd = useCallback((delayMs) => {
    clearTimer();
    if (!adsEnabledRef.current) return;

    timerRef.current = window.setTimeout(() => {
      if (!isActiveRef.current || !adsEnabledRef.current) return;
      const src = takeNextAd();
      if (src) showAd(src);
    }, delayMs);
  }, [clearTimer, takeNextAd, showAd]);

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      setCurrentAd(null);
      setShowConnectionPrompt(false);
      return undefined;
    }

    adsEnabledRef.current = true;
    connectionPromptShownRef.current = false;
    queueRef.current = shuffle(fakeAds);
    scheduleAd(FIRST_AD_DELAY_MS);

    return () => clearTimer();
  }, [isActive, clearTimer, scheduleAd]);

  const dismissAd = useCallback(() => {
    if (!currentAd) return;

    setCurrentAd(null);
    setShowConnectionPrompt(false);

    if (isActiveRef.current && adsEnabledRef.current) {
      scheduleAd(randomNextAdDelay());
    }
  }, [currentAd, scheduleAd]);

  const handleConnectionChoice = useCallback((choice) => {
    setShowConnectionPrompt(false);

    if (choice === 'offline') {
      adsEnabledRef.current = false;
      clearTimer();
    }
  }, [clearTimer]);

  return {
    currentAd,
    dismissAd,
    showConnectionPrompt,
    handleConnectionChoice,
  };
}
