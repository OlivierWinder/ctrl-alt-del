// LISTEN album window — EP tracklist for the desktop icon.

export const listenAlbum = {
  title: 'Listen',
  artist: 'CTRL-ALT-DEL',
  album: 'lëssen',
  type: 'EP',
  cover: '/RESOURCES/ep_cover.jpg',
  tracks: [
    { id: 'mantra', label: 'mantra', file: 'mantra.wav' },
    { id: 'a-tryer-is-a-winner', label: 'a tryer is a winner', file: 'a tryer is a winner.wav' },
    { id: 'no-hate', label: 'no hate', file: 'no hate.wav' },
    { id: 'gimme-a-mf-break', label: 'gimme a mf break', file: 'gimme a mf break.wav' },
    { id: '5-1', label: '5-1', file: '5-1.wav' },
    { id: '5special', label: '5special', file: 'skit 1.wav' },
    { id: 'slow', label: 'slow', file: 'slowly.wav' },
  ],
};

export function getListenTrack(trackId) {
  const track = listenAlbum.tracks.find((item) => item.id === trackId);
  if (!track) return null;
  return {
    title: track.label,
    artist: listenAlbum.album,
    audio: `/RESOURCES/listen/${track.file}`,
    cover: listenAlbum.cover,
  };
}

// Kept empty so FILES merge stays clean (LISTEN is its own window now).
export const listenFolderWindows = {};
