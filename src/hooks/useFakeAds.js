import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FIRST_AD_DELAY_MS,
  fakeAds,
  randomEuroPerAd,
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
 * more info / block-ads open real overlay windows (draggable, raise on focus).
 */
export function useFakeAds({
  isActive,
  openAdDictionWindow,
  closeAdDictionWindow,
  openOffGridWindow,
  closeOffGridWindow,
}) {
  const [currentAd, setCurrentAd] = useState(null);
  const [showAdDiction, setShowAdDiction] = useState(false);
  const [adsShownCount, setAdsShownCount] = useState(0);
  const [attentionEuros, setAttentionEuros] = useState(0);
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const adsEnabledRef = useRef(true);
  const adsShownRef = useRef(0);
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
    adsShownRef.current += 1;
    setAdsShownCount(adsShownRef.current);
    setCurrentAd(src);
    setShowAdDiction(true);
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
      setShowAdDiction(false);
      setAdsShownCount(0);
      setAttentionEuros(0);
      adsShownRef.current = 0;
      closeAdDictionWindow?.();
      closeOffGridWindow?.();
      return undefined;
    }

    adsEnabledRef.current = true;
    adsShownRef.current = 0;
    setAdsShownCount(0);
    setAttentionEuros(0);
    setShowAdDiction(false);
    queueRef.current = shuffle(fakeAds);
    scheduleAd(FIRST_AD_DELAY_MS);

    return () => clearTimer();
  }, [isActive, clearTimer, scheduleAd, closeAdDictionWindow, closeOffGridWindow]);

  const dismissAd = useCallback(() => {
    if (!currentAd) return;

    setCurrentAd(null);

    if (isActiveRef.current && adsEnabledRef.current) {
      scheduleAd(randomNextAdDelay());
    }
  }, [currentAd, scheduleAd]);

  const stopAds = useCallback(() => {
    adsEnabledRef.current = false;
    clearTimer();
  }, [clearTimer]);

  const internetDisabledByAdBlockerRef = useRef(false);

  const disableInternetViaAdBlocker = useCallback(() => {
    internetDisabledByAdBlockerRef.current = true;
    stopAds();
  }, [stopAds]);

  const handlePromptAction = useCallback((actionId) => {
    if (actionId === 'more_info') {
      const count = adsShownRef.current;
      const euros = count * randomEuroPerAd();
      setAttentionEuros(euros);
      setShowAdDiction(false);
      openAdDictionWindow?.({ adsShownCount: count, attentionEuros: euros });
      return undefined;
    }

    if (actionId === 'block_ads') {
      setShowAdDiction(false);
      closeAdDictionWindow?.();
      openOffGridWindow?.();
      return undefined;
    }

    if (actionId === 'yes') {
      closeOffGridWindow?.();
      closeAdDictionWindow?.();
      disableInternetViaAdBlocker();
      return { wentOffGrid: true };
    }

    if (actionId === 'no') {
      closeOffGridWindow?.();
      return { wentOffGrid: false };
    }

    return undefined;
  }, [
    openAdDictionWindow,
    closeAdDictionWindow,
    openOffGridWindow,
    closeOffGridWindow,
    disableInternetViaAdBlocker,
  ]);

  useEffect(() => {
    if (!isActive) {
      internetDisabledByAdBlockerRef.current = false;
    }
  }, [isActive]);

  return {
    currentAd,
    dismissAd,
    showAdDiction,
    adsShownCount,
    attentionEuros,
    setShowAdDiction,
    handlePromptAction,
    stopAds,
    isInternetDisabledByAdBlocker: () => internetDisabledByAdBlockerRef.current,
  };
}
