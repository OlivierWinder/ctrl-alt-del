import { useCallback, useState } from 'react';

const EMPTY_FOLDER_NAV = { path: [], history: [], index: -1 };

export function useWindowManager() {
  const [openWindowId, setOpenWindowId] = useState(null);
  const [zIndex, setZIndex] = useState(600);
  const [cdAutoplay, setCdAutoplay] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [folderNav, setFolderNav] = useState(EMPTY_FOLDER_NAV);

  const openWindow = useCallback((id, options = {}) => {
    setOpenWindowId(id);
    setZIndex((current) => current + 1);
    setCdAutoplay(Boolean(options.autoplay));
    setIsMinimized(false);
    setFolderNav(EMPTY_FOLDER_NAV);
  }, []);

  const navigateFolder = useCallback((windowId, path, options = {}) => {
    setOpenWindowId(windowId);
    setZIndex((current) => current + 1);
    setCdAutoplay(Boolean(options.autoplay));
    setIsMinimized(false);
    setFolderNav((prev) => {
      const history = prev.history.slice(0, prev.index + 1);
      history.push({ windowId, path });
      return { path, history, index: history.length - 1 };
    });
  }, []);

  const folderBack = useCallback(() => {
    setFolderNav((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      const entry = prev.history[newIndex];
      setOpenWindowId(entry.windowId);
      return { ...prev, path: entry.path, index: newIndex };
    });
  }, []);

  const folderForward = useCallback(() => {
    setFolderNav((prev) => {
      if (prev.index >= prev.history.length - 1) return prev;
      const newIndex = prev.index + 1;
      const entry = prev.history[newIndex];
      setOpenWindowId(entry.windowId);
      return { ...prev, path: entry.path, index: newIndex };
    });
  }, []);

  const closeWindow = useCallback(() => {
    setOpenWindowId(null);
    setCdAutoplay(false);
    setIsMinimized(false);
    setFolderNav(EMPTY_FOLDER_NAV);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((current) => !current);
  }, []);

  const canFolderBack = folderNav.index > 0;
  const canFolderForward = folderNav.index < folderNav.history.length - 1;

  return {
    openWindowId,
    zIndex,
    cdAutoplay,
    isMinimized,
    folderPath: folderNav.path,
    canFolderBack,
    canFolderForward,
    openWindow,
    navigateFolder,
    folderBack,
    folderForward,
    closeWindow,
    toggleMinimize,
  };
}
