import { useEffect } from 'react';
import { errors, getErrorByAction } from '../data/errorsData';

const RANDOM_MIN_MS = 45 * 1000;
const RANDOM_MAX_MS = 18 * 60 * 1000;

function randomDelay() {
  return RANDOM_MIN_MS + Math.random() * (RANDOM_MAX_MS - RANDOM_MIN_MS);
}

/**
 * Schedules time-based, random, and inactivity error dialogs for the session.
 * Action triggers (internet, rat race, log off) are handled by the caller via triggerErrorAction.
 */
export function useErrorTriggers(openErrorDialog) {
  useEffect(() => {
    if (!openErrorDialog) return undefined;

    const timers = [];

    for (const error of errors) {
      if (error.triggerType === 'time') {
        timers.push(window.setTimeout(() => openErrorDialog(error), error.delayMs));
      }

      if (error.triggerType === 'random') {
        timers.push(window.setTimeout(() => openErrorDialog(error), randomDelay()));
      }
    }

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [openErrorDialog]);

  useEffect(() => {
    if (!openErrorDialog) return undefined;

    const inactivityError = errors.find((error) => error.triggerType === 'inactivity');
    if (!inactivityError) return undefined;

    let timerId = null;

    function armTimer() {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        openErrorDialog(inactivityError);
      }, inactivityError.delayMs);
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];
    for (const eventName of events) {
      window.addEventListener(eventName, armTimer, { passive: true });
    }
    armTimer();

    return () => {
      window.clearTimeout(timerId);
      for (const eventName of events) {
        window.removeEventListener(eventName, armTimer);
      }
    };
  }, [openErrorDialog]);
}

export function triggerErrorAction(openErrorDialog, action) {
  const error = getErrorByAction(action);
  if (!error) return false;
  return openErrorDialog(error);
}
