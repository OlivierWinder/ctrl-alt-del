import { desktopIcons, emailApp, notesApp, pdfWindows, simpleWindows } from '../data/content';
import { folderWindows } from '../data/filesStructure';

const DEFAULT_ICON = '/RESOURCES/folder.png';

export function getWindowMeta(win) {
  if (!win) return null;

  const desktopIcon = desktopIcons.find((icon) => icon.id === win.appId);

  if (win.type === 'cd_player') {
    return {
      title: win.track?.title || 'CD Player',
      icon: desktopIcon?.icon || '/RESOURCES/cd_rom_icon.png',
    };
  }

  if (win.type === 'pdf') {
    return {
      title: win.title || pdfWindows[win.appId]?.title || 'PDF',
      icon: desktopIcon?.icon || DEFAULT_ICON,
    };
  }

  if (win.type === 'image') {
    return {
      title: win.title || 'Image',
      icon: desktopIcon?.icon || '/RESOURCES/image_file.png',
    };
  }

  if (win.type === 'notes') {
    return {
      title: win.title || notesApp.title || 'NOTES',
      icon: desktopIcon?.icon || '/RESOURCES/notes_icon.png',
    };
  }

  if (win.type === 'email') {
    return {
      title: win.title || emailApp.title || 'E-MAIL',
      icon: desktopIcon?.icon || '/RESOURCES/email_icon.png',
    };
  }

  if (win.type === 'error') {
    return {
      title: win.title || 'System Error',
      icon: '/RESOURCES/msg_warning.png',
    };
  }

  if (win.type === 'folder') {
    return {
      title: folderWindows[win.appId]?.title || win.title || 'FILES',
      icon: desktopIcon?.icon || DEFAULT_ICON,
    };
  }

  if (win.type === 'simple' || simpleWindows[win.appId]) {
    return {
      title: simpleWindows[win.appId]?.title || win.title || win.appId,
      icon: desktopIcon?.icon || DEFAULT_ICON,
    };
  }

  if (win.type === 'ai') {
    return {
      title: 'AI',
      icon: desktopIcon?.icon || '/RESOURCES/ai_icon.png',
    };
  }

  if (desktopIcon) {
    return { title: desktopIcon.label, icon: desktopIcon.icon };
  }

  return { title: win.title || win.appId || 'Window', icon: DEFAULT_ICON };
}
