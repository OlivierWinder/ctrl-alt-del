import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import { cdPlayerData } from '../data/content';
import { assetUrl } from '../utils/assetUrl';

function audioMimeType(src) {
  if (!src) return 'audio/mpeg';
  if (src.toLowerCase().includes('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PLAYLIST_URL =
  'https://open.spotify.com/album/7uk1aaKzZp5c3qsKmWKy73?si=GCWwhVivQ2u26sNnRE0NWw';

export default function CDPlayer({
  zIndex,
  containerRef,
  autoplay,
  track = null,
  stackOffset = 0,
  onClose,
  onFocus,
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const artist = track?.artist || cdPlayerData.title;
  const title = track?.title || cdPlayerData.subtitle;
  const cover = assetUrl(track?.cover || cdPlayerData.cover);
  const audioSrc = assetUrl(track?.audio || cdPlayerData.audio);
  const mimeType = audioMimeType(audioSrc);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return undefined;

    element.pause();
    element.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);

    if (!autoplay) return undefined;

    element.play().catch(() => {});

    return undefined;
  }, [autoplay, audioSrc]);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return undefined;

    function onTimeUpdate() {
      setCurrentTime(element.currentTime || 0);
    }

    function onLoadedMetadata() {
      setDuration(element.duration || 0);
    }

    function onEnded() {
      setCurrentTime(0);
    }

    element.addEventListener('timeupdate', onTimeUpdate);
    element.addEventListener('loadedmetadata', onLoadedMetadata);
    element.addEventListener('ended', onEnded);

    return () => {
      element.removeEventListener('timeupdate', onTimeUpdate);
      element.removeEventListener('loadedmetadata', onLoadedMetadata);
      element.removeEventListener('ended', onEnded);
    };
  }, [audioSrc]);

  function handleClose() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  }

  function play() {
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => {});
  }

  function pause() {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }

  function stop() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  }

  function openPlaylist() {
    window.open(PLAYLIST_URL, '_blank', 'noopener,noreferrer');
  }

  const remaining = Math.max(0, duration - currentTime);

  return (
    <Window
      title="CD Player"
      variant="cdplayer"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={handleClose}
      onFocus={onFocus}
    >
      <div className="cd_player">
        <div className="cd_player__main">
          <div className="cd_player__display">
            <img src={cover} alt="" className="cd_player__cover-img" />
            <div className="cd_player__timer" aria-live="polite">
              {formatTime(remaining)}
            </div>
          </div>

          <div className="cd_player__controls-col">
            <div className="cd_player__controls">
              <button
                type="button"
                className="cd_player__btn cd_player__btn--play"
                onClick={play}
                aria-label="Play"
                title="Play"
              >
                <span className="cd_player__symbol cd_player__symbol--play" />
              </button>
              <button
                type="button"
                className="cd_player__btn"
                onClick={pause}
                aria-label="Pause"
                title="Pause"
              >
                <span className="cd_player__symbol cd_player__symbol--pause" />
              </button>
              <button
                type="button"
                className="cd_player__btn"
                onClick={stop}
                aria-label="Stop"
                title="Stop"
              >
                <span className="cd_player__symbol cd_player__symbol--stop" />
              </button>
            </div>

            <button
              type="button"
              className="cd_player__playlist-btn"
              onClick={openPlaylist}
            >
              Open track
            </button>
          </div>
        </div>

        <div className="cd_player__fields">
          <div className="cd_player__field">
            <span className="cd_player__field-label">Artist:</span>
            <div className="cd_player__field-box">
              <span className="cd_player__field-value">{artist}</span>
            </div>
          </div>

          <div className="cd_player__field">
            <span className="cd_player__field-label">Title:</span>
            <div className="cd_player__field-box">
              <span className="cd_player__field-value">{title}</span>
            </div>
          </div>
        </div>

        <div className="cd_player__status">
          <div className="cd_player__status-cell">
            Total Play: {formatTime(currentTime)} m:s
          </div>
          <div className="cd_player__status-cell">
            Track: {formatTime(remaining)} m:s
          </div>
        </div>

        <audio ref={audioRef} key={audioSrc} preload="metadata">
          <source src={audioSrc} type={mimeType} />
        </audio>
      </div>
    </Window>
  );
}
