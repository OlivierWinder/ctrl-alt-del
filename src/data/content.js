export const desktopIcons = [
  {
    id: 'documents',
    label: 'FILES',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'rat_race_revolution',
    label: 'RAT RACE EVOLUTION',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'notes',
    label: 'NOTES',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'bank_balance',
    label: 'BANK BALANCE',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'inspo',
    label: 'INSPO.img',
    icon: '/RESOURCES/folder.png',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: '/RESOURCES/folder.png',
    type: 'video',
  },
  {
    id: 'email',
    label: 'E-MAIL',
    icon: '/RESOURCES/folder.png',
    position: { column: 'right', row: 0 },
  },
  {
    id: 'cd_rom',
    label: 'CD-ROM',
    icon: '/RESOURCES/folder.png',
    position: { column: 'right', row: 1 },
  },
  {
    id: 'internet',
    label: 'INTERNET',
    icon: '/RESOURCES/folder.png',
    position: { column: 'right', row: 2 },
  },
  {
    id: 'daily_afirm',
    label: 'DAILY_AFIRM',
    icon: '/RESOURCES/folder.png',
    position: { column: 'right', row: 3 },
  },
];

export const folderWindows = {
  documents: {
    title: 'FILES',
    address: 'Files',
    items: [
      { label: 'Recent', icon: '/RESOURCES/recent_icon.png', opens: 'recent' },
      { label: 'Desktop', icon: '/RESOURCES/folder.png', opens: 'desktop_folder' },
      { label: 'Documents', icon: '/RESOURCES/folder.png', opens: 'documents_inner' },
      { label: 'Downloads', icon: '/RESOURCES/folder.png', opens: 'downloads' },
      { label: 'EP DEMOS', icon: '/RESOURCES/folder.png', opens: 'ep_demos' },
      { label: 'This Computer', icon: '/RESOURCES/folder_thiscomputer.png', opens: 'this_computer' },
    ],
  },
  recent: {
    title: 'Recent',
    address: 'Recent',
    items: [
      { label: 'session_01', icon: '/RESOURCES/folder.png' },
      { label: 'drafts', icon: '/RESOURCES/folder.png' },
      { label: 'archive', icon: '/RESOURCES/folder.png' },
    ],
  },
  desktop_folder: {
    title: 'Desktop',
    address: 'Desktop',
    items: [
      { label: 'ideas', icon: '/RESOURCES/folder.png' },
      { label: 'renders', icon: '/RESOURCES/folder.png' },
      { label: 'tests', icon: '/RESOURCES/folder.png' },
    ],
  },
  documents_inner: {
    title: 'Documents',
    address: 'Documents',
    items: [
      { label: 'lyrics', icon: '/RESOURCES/folder.png' },
      { label: 'references', icon: '/RESOURCES/folder.png' },
      { label: 'mix_notes', icon: '/RESOURCES/folder.png' },
    ],
  },
  downloads: {
    title: 'Downloads',
    address: 'Downloads',
    items: [
      { label: 'samples', icon: '/RESOURCES/folder.png' },
      { label: 'textures', icon: '/RESOURCES/folder.png' },
      { label: 'plugins', icon: '/RESOURCES/folder.png' },
    ],
  },
  ep_demos: {
    title: 'EP DEMOS',
    address: 'EP DEMOS',
    items: [
      { label: 'track_01.mp3', icon: '/RESOURCES/folder.png', opens: 'cd_player', autoplay: true },
      { label: 'track_02.mp3', icon: '/RESOURCES/folder.png' },
      { label: 'track_03.mp3', icon: '/RESOURCES/folder.png' },
    ],
  },
  this_computer: {
    title: 'This Computer',
    address: 'This Computer',
    items: [
      { label: 'Local Disk (C:)', icon: '/RESOURCES/folder_thiscomputer.png' },
      { label: 'Drive (D:)', icon: '/RESOURCES/folder_thiscomputer.png' },
      { label: 'Backup', icon: '/RESOURCES/folder_thiscomputer.png' },
    ],
  },
};

export const pdfWindows = {
  daily_afirm: {
    title: 'DAILY_AFIRM',
    pdf: '/RESOURCES/daily_afirm.pdf',
  },
  internet: {
    title: 'INTERNET',
    pdf: '/RESOURCES/internet.pdf',
  },
};

export const simpleWindows = {
  rat_race_revolution: { title: 'RAT RACE REVOLUTION' },
  notes: { title: 'NOTES' },
  bank_balance: { title: 'BANK BALANCE' },
  inspo: { title: 'INSPO' },
  email: { title: 'E-MAIL' },
  cd_rom: { title: 'CD-ROM' },
};

export const cdPlayerData = {
  title: 'LÈSSEN',
  subtitle: 'a tryer is a winner',
  cover: '/RESOURCES/ouroboros.jpeg',
  audio: '/RESOURCES/mantra.wav',
};

export const virusVideo = {
  src: '/RESOURCES/crash.mov',
};
