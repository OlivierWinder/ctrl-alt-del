// Flip to false to show LISTEN / CD-ROM / AI again after screen recording.
export const hideIconsForRecording = false;

export const desktopIcons = [
  {
    id: 'files',
    label: 'FILES',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'rat_race_revolution',
    label: 'RAT RACE EVOLUTION',
    icon: '/RESOURCES/rat_race_revolution_ICON_FR.png',
  },
  {
    id: 'notes',
    label: 'NOTES',
    icon: '/RESOURCES/notes_icon.png',
  },
  {
    id: 'bank_balance',
    label: 'BANK BALANCE',
    icon: '/RESOURCES/bank_balance_icon.png',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: '/RESOURCES/ai_icon.png',
    type: 'video',
    hidden: hideIconsForRecording,
  },
  {
    id: 'listen',
    label: 'LISTEN',
    icon: '/RESOURCES/cd_audio.png',
    hidden: hideIconsForRecording,
  },
  {
    id: 'email',
    label: 'E-MAIL',
    icon: '/RESOURCES/email_icon.png',
    position: { column: 'right', row: 0 },
  },
  {
    id: 'cd_rom',
    label: 'CD-ROM',
    icon: '/RESOURCES/cd_rom_icon.png',
    position: { column: 'right', row: 1 },
    hidden: hideIconsForRecording,
  },
  {
    id: 'internet',
    label: 'INTERNET',
    icon: '/RESOURCES/internet_icon.png',
    position: { column: 'right', row: 2 },
  },
];

export { folderWindows } from './filesStructure';

export const pdfWindows = {
  internet: {
    title: 'INTERNET',
    pdf: '/RESOURCES/internet.pdf',
  },
};

export const simpleWindows = {
  bank_balance: {
    title: 'BANK BALANCE',
    image: '/RESOURCES/bank_balance_window.png',
  },
  cd_rom: { title: 'CD-ROM' },
};

export const notesApp = {
  title: 'NOTES',
};

export const emailApp = {
  title: 'E-MAIL',
};

export const cdPlayerData = {
  title: 'LÈSSEN',
  subtitle: 'a tryer is a winner',
  cover: '/RESOURCES/ouroboros.jpeg',
  audio: '/RESOURCES/mantra.wav',
};

export const virusVideo = {
  src: '/RESOURCES/crash.mp4',
};
