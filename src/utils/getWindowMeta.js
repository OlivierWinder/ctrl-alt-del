import { desktopIcons, folderWindows, pdfWindows, simpleWindows } from '../data/content';

const DEFAULT_ICON = '/RESOURCES/folder.png';

export function getWindowMeta(windowId) {
  if (!windowId) return null;

  if (windowId === 'cd_player') {
    return { title: 'CD Player', icon: DEFAULT_ICON };
  }

  if (folderWindows[windowId]) {
    return { title: folderWindows[windowId].title, icon: DEFAULT_ICON };
  }

  if (pdfWindows[windowId]) {
    return { title: pdfWindows[windowId].title, icon: DEFAULT_ICON };
  }

  if (simpleWindows[windowId]) {
    return { title: simpleWindows[windowId].title, icon: DEFAULT_ICON };
  }

  const desktopIcon = desktopIcons.find((icon) => icon.id === windowId);
  if (desktopIcon) {
    return { title: desktopIcon.label, icon: desktopIcon.icon };
  }

  return { title: windowId, icon: DEFAULT_ICON };
}
