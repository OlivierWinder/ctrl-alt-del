import { useCallback, useRef, useState } from 'react';
import { emailApp, folderWindows, notesApp, pdfWindows, simpleWindows } from '../data/content';

function createFolderNav(windowId, path) {
  return {
    path,
    history: [{ windowId, path }],
    index: 0,
  };
}

// One shared stack. Click always rises to the top.
// New popups open under Listen / CD player / game / AI / CD_ROM, over everything else.
const Z_MIN = 1000;
const Z_MAX = 49999;

function isPriorityWindow(win) {
  return (
    win?.type === 'listen'
    || win?.type === 'cd_player'
    || win?.type === 'rat_race'
    || win?.type === 'ai'
    || win?.type === 'cd_rom'
  );
}

export function useWindowManager() {
  const nextIdRef = useRef(1);
  const nextZRef = useRef(Z_MIN);
  const shownErrorsRef = useRef(new Set());
  const [windows, setWindows] = useState([]);
  const [focusedId, setFocusedId] = useState(null);
  const externalPopupZRef = useRef(0);

  const allocId = useCallback(() => {
    const id = `win-${nextIdRef.current}`;
    nextIdRef.current += 1;
    return id;
  }, []);

  const allocZ = useCallback(() => {
    nextZRef.current += 1;
    if (nextZRef.current > Z_MAX) nextZRef.current = Z_MIN + 1;
    const zIndex = nextZRef.current;
    externalPopupZRef.current = Math.max(externalPopupZRef.current, zIndex);
    return zIndex;
  }, []);

  const syncZCeiling = useCallback((list) => {
    const maxZ = list.reduce((max, win) => Math.max(max, win.zIndex || 0), nextZRef.current);
    nextZRef.current = maxZ;
  }, []);

  /**
   * Open under priority media apps, above all other windows / prior popups.
   * Priority windows are bumped up when needed so the new popup fits underneath.
   */
  const placePopupOpen = useCallback((current, extraZs = []) => {
    const priority = current.filter((win) => isPriorityWindow(win) && !win.minimized);
    const nonPriorityZs = current
      .filter((win) => !isPriorityWindow(win))
      .map((win) => win.zIndex);
    const maxNon = Math.max(
      Z_MIN - 1,
      ...nonPriorityZs,
      ...extraZs.filter((z) => z > 0),
      externalPopupZRef.current,
    );
    const popupZ = maxNon + 1;

    if (!priority.length) {
      const zIndex = allocZ();
      externalPopupZRef.current = Math.max(externalPopupZRef.current, zIndex);
      return { zIndex, windows: current };
    }

    let nextWindows = current;
    const minPri = Math.min(...priority.map((win) => win.zIndex));
    if (popupZ >= minPri) {
      const bump = (popupZ + 1) - minPri;
      nextWindows = current.map((win) => (
        isPriorityWindow(win) ? { ...win, zIndex: win.zIndex + bump } : win
      ));
      syncZCeiling(nextWindows);
    }

    nextZRef.current = Math.max(nextZRef.current, popupZ);
    externalPopupZRef.current = Math.max(externalPopupZRef.current, popupZ);
    return { zIndex: popupZ, windows: nextWindows };
  }, [allocZ, syncZCeiling]);

  const allocatePopupOpenZIndex = useCallback(() => {
    let assigned = 0;
    setWindows((current) => {
      const placed = placePopupOpen(current);
      assigned = placed.zIndex;
      return placed.windows;
    });
    if (!assigned) {
      assigned = allocZ();
      externalPopupZRef.current = Math.max(externalPopupZRef.current, assigned);
    }
    return assigned;
  }, [allocZ, placePopupOpen]);

  const allocForWindow = useCallback(() => allocZ(), [allocZ]);

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
    const zIndex = allocZ();
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'cd_player');
      const withoutPlayers = current.filter((win) => win.type !== 'cd_player');
      // New instance + bumped cascade so replacing a track looks like a fresh open.
      const instanceId = allocId();
      const stackIndex = existing
        ? ((existing.stackIndex ?? 0) + 1) % 8
        : current.length;

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
          stackIndex,
          minimized: false,
        },
      ];
    });
  }, [allocId, allocZ]);

  const openAdDictionWindow = useCallback(({ adsShownCount = 0, attentionEuros = 0 } = {}) => {
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'ad_diction');
      const without = current.filter((win) => (
        win.type !== 'ad_diction' && win.type !== 'off_grid'
      ));
      const placed = placePopupOpen(without);
      const instanceId = allocId();
      const stackIndex = existing
        ? ((existing.stackIndex ?? 0) + 1) % 8
        : placed.windows.length;
      setFocusedId(instanceId);
      return [
        ...placed.windows,
        {
          instanceId,
          type: 'ad_diction',
          appId: 'ad_diction',
          title: 'ad-diction',
          adsShownCount,
          attentionEuros,
          zIndex: placed.zIndex,
          stackIndex,
          minimized: false,
        },
      ];
    });
  }, [allocId, placePopupOpen]);

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

  const openOffGridWindow = useCallback(() => {
    setWindows((current) => {
      const withoutStats = current.filter((win) => win.type !== 'ad_diction');
      const existing = withoutStats.find((win) => win.type === 'off_grid');
      const without = withoutStats.filter((win) => win.type !== 'off_grid');
      const placed = placePopupOpen(without);
      const stackIndex = existing
        ? ((existing.stackIndex ?? 0) + 1) % 8
        : placed.windows.length;
      const instanceId = existing?.instanceId || allocId();
      setFocusedId(instanceId);
      return [
        ...placed.windows,
        {
          instanceId,
          type: 'off_grid',
          appId: 'off_grid',
          title: 'ad-diction',
          zIndex: placed.zIndex,
          stackIndex,
          minimized: false,
        },
      ];
    });
  }, [allocId, placePopupOpen]);

  const closeOffGridWindow = useCallback(() => {
    setWindows((current) => {
      const remaining = current.filter((win) => win.type !== 'off_grid');
      setFocusedId((focused) => {
        const closed = current.find((win) => win.type === 'off_grid');
        if (!closed || focused !== closed.instanceId) return focused;
        if (!remaining.length) return null;
        return remaining.reduce((top, win) => (win.zIndex > top.zIndex ? win : top)).instanceId;
      });
      return remaining;
    });
  }, []);

  const openOrderPhysicalCopy = useCallback(() => {
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'order_physical');
      const without = current.filter((win) => (
        win.type !== 'order_physical' && win.type !== 'listen_ep'
      ));
      const zIndex = allocZ();
      const instanceId = existing?.instanceId || allocId();
      const stackIndex = existing
        ? ((existing.stackIndex ?? 0) + 1) % 8
        : without.length;
      setFocusedId(instanceId);
      return [
        ...without,
        {
          instanceId,
          type: 'order_physical',
          appId: 'order_physical',
          title: 'ORDER PHYSICAL COPY',
          zIndex,
          stackIndex,
          minimized: false,
        },
      ];
    });
  }, [allocId, allocZ]);

  const openListenEpPrompt = useCallback(() => {
    setWindows((current) => {
      const existing = current.find((win) => win.type === 'listen_ep');
      const without = current.filter((win) => (
        win.type !== 'listen_ep' && win.type !== 'order_physical'
      ));
      const placed = placePopupOpen(without);
      const instanceId = existing?.instanceId || allocId();
      const stackIndex = existing
        ? ((existing.stackIndex ?? 0) + 1) % 8
        : placed.windows.length;
      setFocusedId(instanceId);
      return [
        ...placed.windows,
        {
          instanceId,
          type: 'listen_ep',
          appId: 'listen_ep',
          title: 'LISTEN TO EP',
          zIndex: placed.zIndex,
          stackIndex,
          minimized: false,
        },
      ];
    });
  }, [allocId, placePopupOpen]);

  const openErrorDialog = useCallback((error) => {
    if (!error) return false;
    if (error.once && shownErrorsRef.current.has(error.id)) return false;

    setWindows((current) => {
      const existing = current.find((win) => win.type === 'error' && win.appId === error.id);

      if (existing) {
        const without = current.filter((win) => win.instanceId !== existing.instanceId);
        const placed = placePopupOpen(without);
        setFocusedId(existing.instanceId);
        return [
          ...placed.windows,
          {
            ...existing,
            title: error.title,
            message: error.message,
            actions: error.actions || null,
            icon: error.icon || null,
            layout: error.layout || null,
            zIndex: placed.zIndex,
            minimized: false,
          },
        ];
      }

      const placed = placePopupOpen(current);
      const instanceId = allocId();
      setFocusedId(instanceId);
      return [
        ...placed.windows,
        {
          instanceId,
          type: 'error',
          appId: error.id,
          title: error.title,
          message: error.message,
          actions: error.actions || null,
          icon: error.icon || null,
          layout: error.layout || null,
          zIndex: placed.zIndex,
          stackIndex: current.length,
          minimized: false,
        },
      ];
    });

    if (error.once) shownErrorsRef.current.add(error.id);
    return true;
  }, [allocId, placePopupOpen]);

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
          || win.type === 'cd_rom'
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
      } else if (appId === 'cd_rom') {
        nextWin = {
          ...nextWin,
          type: 'cd_rom',
          title: 'CD_ROM',
          quantity: 1,
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

  const patchWindow = useCallback((instanceId, patch) => {
    setWindows((current) => current.map((win) => (
      win.instanceId === instanceId ? { ...win, ...patch } : win
    )));
  }, []);

  return {
    windows,
    focusedId,
    openWindow,
    openPdfView,
    openImageView,
    openAudioView,
    patchWindow,
    openAdDictionWindow,
    closeAdDictionWindow,
    openOffGridWindow,
    closeOffGridWindow,
    openOrderPhysicalCopy,
    openListenEpPrompt,
    openErrorDialog,
    navigateFolder,
    folderBack,
    folderForward,
    closeWindow,
    focusWindow,
    toggleMinimize,
    allocateZIndex: allocZ,
    allocatePopupOpenZIndex,
  };
}
