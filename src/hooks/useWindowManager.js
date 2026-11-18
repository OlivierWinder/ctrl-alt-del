import { useCallback, useRef, useState } from 'react';
import { emailApp, folderWindows, notesApp, pdfWindows, simpleWindows } from '../data/content';

function createFolderNav(windowId, path) {
  return {
    path,
    history: [{ windowId, path }],
    index: 0,
  };
}

// Popup layer (ads / errors / ad-detected) stays below priority media apps.
const POPUP_Z_MIN = 1000;
const POPUP_Z_MAX = 7999;
const NORMAL_Z_MIN = 8000;
const NORMAL_Z_MAX = 19999;
const PRIORITY_Z_MIN = 20000;

function isPopupWindow(win) {
  return win?.type === 'error' || win?.type === 'ad_diction';
}

function isPriorityWindow(win) {
  return (
    win?.type === 'listen'
    || win?.type === 'rat_race'
    || win?.type === 'cd_player'
    || win?.type === 'ai'
    || win?.appId === 'cd_rom'
  );
}

export function useWindowManager() {
  const nextIdRef = useRef(1);
  const nextPopupZRef = useRef(POPUP_Z_MIN);
  const nextZRef = useRef(NORMAL_Z_MIN);
  const nextPriorityZRef = useRef(PRIORITY_Z_MIN);
  const shownErrorsRef = useRef(new Set());
  const [windows, setWindows] = useState([]);
  const [focusedId, setFocusedId] = useState(null);

  const allocId = useCallback(() => {
    const id = `win-${nextIdRef.current}`;
    nextIdRef.current += 1;
    return id;
  }, []);

  const allocPopupZ = useCallback(() => {
    nextPopupZRef.current += 1;
    if (nextPopupZRef.current > POPUP_Z_MAX) nextPopupZRef.current = POPUP_Z_MIN + 1;
    return nextPopupZRef.current;
  }, []);

  const allocZ = useCallback(() => {
    nextZRef.current += 1;
    if (nextZRef.current > NORMAL_Z_MAX) nextZRef.current = NORMAL_Z_MIN + 1;
    return nextZRef.current;
  }, []);

  const allocPriorityZ = useCallback(() => {
    nextPriorityZRef.current += 1;
    return nextPriorityZRef.current;
  }, []);

  const allocForWindow = useCallback((win) => {
    if (isPopupWindow(win)) return allocPopupZ();
    if (isPriorityWindow(win)) return allocPriorityZ();
    return allocZ();
  }, [allocPopupZ, allocPriorityZ, allocZ]);

  const focusWindow = useCallback((instanceId) => {
    setWindows((current) => {
      const target = current.find((win) => win.instanceId === instanceId);
      if (!target) return current;
      const zIndex = allocForWindow(target);
      return current.map((win) => (
        win.instanceId === instanceId
          ? { ...win, zIndex, minimized: false }
          : win
      ));
    });
    setFocusedId(instanceId);
  }, [allocForWindow]);

  const closeWindow = useCallback((instanceId) => {
    setWindows((current) => {
      const remaining = current.filter((win) => win.instanceId !== instanceId);
      setFocusedId((focused) => {
        if (focused !== instanceId) return focused;
        if (!remaining.length) return null;
        return remaining.reduce((top, win) => (win.zIndex > top.zIndex ? win : top)).instanceId;
      });
      return remaining;
    });
  }, []);

  const toggleMinimize = useCallback((instanceId) => {
    setFocusedId((currentFocused) => {
      setWindows((current) => {
        const target = current.find((win) => win.instanceId === instanceId);
        if (!target) return current;
        const nextZ = allocForWindow(target);

        if (target.minimized) {
          return current.map((win) => (
            win.instanceId === instanceId
              ? { ...win, minimized: false, zIndex: nextZ }
              : win
          ));
        }

        if (currentFocused === instanceId) {
          return current.map((win) => (
            win.instanceId === instanceId ? { ...win, minimized: true } : win
          ));
        }

        return current.map((win) => (
          win.instanceId === instanceId
            ? { ...win, minimized: false, zIndex: nextZ }
            : win
        ));
      });

      return instanceId;
    });
  }, [allocForWindow]);

  const openImageView = useCallback((title, image) => {
    const instanceId = allocId();
    const zIndex = allocZ();
    setWindows((current) => [
      ...current,
      {
        instanceId,
        type: 'image',
        appId: 'image_view',
        title,
        image,
        zIndex,
        stackIndex: current.length,
        minimized: false,
      },
    ]);
    setFocusedId(instanceId);
  }, [allocId, allocZ]);

  const openPdfView = useCallback((title, pdf) => {
    const instanceId = allocId();
    const zIndex = allocZ();
    setWindows((current) => [
      ...current,
      {
        instanceId,
        type: 'pdf',
        appId: 'pdf_view',
        title,
        pdf,
        zIndex,
        stackIndex: current.length,
        minimized: false,
      },
    ]);
    setFocusedId(instanceId);
  }, [allocId, allocZ]);

  const openAudioView = useCallback((track, options = {}) => {
    const zIndex = allocPriorityZ();
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'cd_player');
      const withoutPlayers = current.filter((win) => win.type !== 'cd_player');

      if (existing) {
        setFocusedId(existing.instanceId);
        return [
          ...withoutPlayers,
          {
            ...existing,
            track,
            autoplay: options.autoplay !== false,
            zIndex,
            minimized: false,
          },
        ];
      }

      const instanceId = allocId();
      setFocusedId(instanceId);
      return [
        ...withoutPlayers,
        {
          instanceId,
          type: 'cd_player',
          appId: 'cd_player',
          title: 'CD Player',
          track,
          autoplay: options.autoplay !== false,
          zIndex,
          stackIndex: current.length,
          minimized: false,
        },
      ];
    });
  }, [allocId, allocPriorityZ]);

  const openAdDictionWindow = useCallback(({ adsShownCount = 0, attentionEuros = 0 } = {}) => {
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'ad_diction');

      if (existing) {
        const zIndex = allocPopupZ();
        setFocusedId(existing.instanceId);
        return current.map((win) => (
          win.instanceId === existing.instanceId
            ? {
              ...win,
              adsShownCount,
              attentionEuros,
              zIndex,
              minimized: false,
            }
            : win
        ));
      }

      const instanceId = allocId();
      const zIndex = allocPopupZ();
      setFocusedId(instanceId);
      return [
        ...current,
        {
          instanceId,
          type: 'ad_diction',
          appId: 'ad_diction',
          title: 'ad-diction',
          adsShownCount,
          attentionEuros,
          zIndex,
          stackIndex: current.length,
          minimized: false,
        },
      ];
    });
  }, [allocId, allocPopupZ]);

  const closeAdDictionWindow = useCallback(() => {
    setWindows((current) => {
      const remaining = current.filter((win) => win.type !== 'ad_diction');
      setFocusedId((focused) => {
        const closed = current.find((win) => win.type === 'ad_diction');
        if (!closed || focused !== closed.instanceId) return focused;
        if (!remaining.length) return null;
        return remaining.reduce((top, win) => (win.zIndex > top.zIndex ? win : top)).instanceId;
      });
      return remaining;
    });
  }, []);

  const openErrorDialog = useCallback((error) => {
    if (!error) return false;
    if (error.once && shownErrorsRef.current.has(error.id)) return false;

    setWindows((current) => {
      const existing = current.find((win) => win.type === 'error' && win.appId === error.id);

      if (existing) {
        const zIndex = allocPopupZ();
        setFocusedId(existing.instanceId);
        return current.map((win) => (
          win.instanceId === existing.instanceId
            ? {
              ...win,
              title: error.title,
              message: error.message,
              actions: error.actions || null,
              icon: error.icon || null,
              layout: error.layout || null,
              zIndex,
              minimized: false,
            }
            : win
        ));
      }

      const instanceId = allocId();
      const zIndex = allocPopupZ();
      setFocusedId(instanceId);
      return [
        ...current,
        {
          instanceId,
          type: 'error',
          appId: error.id,
          title: error.title,
          message: error.message,
          actions: error.actions || null,
          icon: error.icon || null,
          layout: error.layout || null,
          zIndex,
          stackIndex: current.length,
          minimized: false,
        },
      ];
    });

    if (error.once) shownErrorsRef.current.add(error.id);
    return true;
  }, [allocId, allocPopupZ]);

  const openWindow = useCallback((appId) => {
    setWindows((current) => {
      const reusable = current.find((win) => (
        win.appId === appId
        && (
          win.type === 'simple'
          || win.type === 'notes'
          || win.type === 'credits'
          || win.type === 'listen'
          || win.type === 'rat_race'
          || win.type === 'email'
          || win.type === 'ai'
          || (win.type === 'pdf' && pdfWindows[appId])
        )
      ));

      if (reusable) {
        const zIndex = allocForWindow(reusable);
        setFocusedId(reusable.instanceId);
        return current.map((win) => (
          win.instanceId === reusable.instanceId
            ? { ...win, zIndex, minimized: false }
            : win
        ));
      }

      const instanceId = allocId();
      setFocusedId(instanceId);

      let nextWin = {
        instanceId,
        appId,
        zIndex: 0,
        stackIndex: current.length,
        minimized: false,
        title: appId,
        type: 'simple',
      };

      if (appId === 'ai') {
        nextWin = { ...nextWin, type: 'ai', title: 'AI' };
      } else if (appId === 'notes') {
        nextWin = {
          ...nextWin,
          type: 'notes',
          title: notesApp.title || 'NOTES',
        };
      } else if (appId === 'credits') {
        nextWin = {
          ...nextWin,
          type: 'credits',
          title: 'Credits',
        };
      } else if (appId === 'listen') {
        nextWin = {
          ...nextWin,
          type: 'listen',
          title: 'Listen',
        };
      } else if (appId === 'rat_race_revolution') {
        nextWin = {
          ...nextWin,
          type: 'rat_race',
          title: 'RatRaceRevolution',
        };
      } else if (appId === 'email') {
        nextWin = {
          ...nextWin,
          type: 'email',
          title: emailApp.title || 'E-MAIL',
        };
      } else if (pdfWindows[appId]) {
        nextWin = {
          ...nextWin,
          type: 'pdf',
          title: pdfWindows[appId].title,
          pdf: pdfWindows[appId].pdf,
        };
      } else if (simpleWindows[appId]) {
        nextWin = {
          ...nextWin,
          type: 'simple',
          title: simpleWindows[appId].title,
          image: simpleWindows[appId].image,
        };
      } else if (folderWindows[appId]) {
        nextWin = {
          ...nextWin,
          type: 'folder',
          title: folderWindows[appId].title,
          folderNav: createFolderNav(appId, [folderWindows[appId].title]),
        };
      }

      nextWin = { ...nextWin, zIndex: allocForWindow(nextWin) };
      return [...current, nextWin];
    });
  }, [allocId, allocForWindow]);

  const navigateFolder = useCallback((folderId, path, _options = {}, sourceInstanceId = null) => {
    setWindows((current) => {
      const existing = sourceInstanceId
        ? current.find((win) => win.instanceId === sourceInstanceId && win.type === 'folder')
        : current.find((win) => win.type === 'folder');

      const zIndex = allocZ();

      if (existing) {
        const history = existing.folderNav.history.slice(0, existing.folderNav.index + 1);
        history.push({ windowId: folderId, path });
        const folderNav = { path, history, index: history.length - 1 };
        setFocusedId(existing.instanceId);

        return current.map((win) => (
          win.instanceId === existing.instanceId
            ? {
              ...win,
              appId: folderId,
              title: folderWindows[folderId]?.title || folderId,
              folderNav,
              zIndex,
              minimized: false,
            }
            : win
        ));
      }

      const instanceId = allocId();
      setFocusedId(instanceId);
      return [
        ...current,
        {
          instanceId,
          type: 'folder',
          appId: folderId,
          title: folderWindows[folderId]?.title || folderId,
          folderNav: createFolderNav(folderId, path),
          zIndex,
          stackIndex: current.length,
          minimized: false,
        },
      ];
    });
  }, [allocId, allocZ]);

  const folderBack = useCallback((instanceId) => {
    setWindows((current) => current.map((win) => {
      if (win.instanceId !== instanceId || win.type !== 'folder') return win;
      if (win.folderNav.index <= 0) return win;

      const newIndex = win.folderNav.index - 1;
      const entry = win.folderNav.history[newIndex];
      return {
        ...win,
        appId: entry.windowId,
        title: folderWindows[entry.windowId]?.title || entry.windowId,
        folderNav: { ...win.folderNav, path: entry.path, index: newIndex },
        minimized: false,
        zIndex: allocZ(),
      };
    }));
    setFocusedId(instanceId);
  }, [allocZ]);

  const folderForward = useCallback((instanceId) => {
    setWindows((current) => current.map((win) => {
      if (win.instanceId !== instanceId || win.type !== 'folder') return win;
      if (win.folderNav.index >= win.folderNav.history.length - 1) return win;

      const newIndex = win.folderNav.index + 1;
      const entry = win.folderNav.history[newIndex];
      return {
        ...win,
        appId: entry.windowId,
        title: folderWindows[entry.windowId]?.title || entry.windowId,
        folderNav: { ...win.folderNav, path: entry.path, index: newIndex },
        minimized: false,
        zIndex: allocZ(),
      };
    }));
    setFocusedId(instanceId);
  }, [allocZ]);

  return {
    windows,
    focusedId,
    openWindow,
    openPdfView,
    openImageView,
    openAudioView,
    openAdDictionWindow,
    closeAdDictionWindow,
    openErrorDialog,
    navigateFolder,
    folderBack,
    folderForward,
    closeWindow,
    focusWindow,
    toggleMinimize,
    allocatePopupZIndex: allocPopupZ,
  };
}
