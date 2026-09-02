import { folderWindows } from '../data/filesStructure';

export function buildAddressPath(pathSegments) {
  if (!pathSegments.length) return 'C:/Desktop';
  return `C:/Desktop/${pathSegments.join('/')}`;
}

export function getFolderLabel(windowId) {
  return folderWindows[windowId]?.title ?? windowId;
}

export function isFolderWindow(windowId) {
  return Boolean(folderWindows[windowId]);
}
