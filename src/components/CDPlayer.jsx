import { useEffect, useRef, useState } from 'react';
import Window from './Window';
import { cdPlayerData } from '../data/content';

export default function CDPlayer({ zIndex, containerRef, autoplay, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!autoplay || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [autoplay]);

  function handleClose() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onClose();
  }

  function togglePlay() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  return (
    <Window
      title="CD Player"
      variant="cdplayer"
      zIndex={zIndex}
      containerRef={containerRef}
      onClose={handleClose}
    >
      <div className="cd_player">
        <div className="cd_player__cover">
          <img src={cdPlayerData.cover} alt="" />
        </div>

        <div className="cd_player__info">
          <h2>{cdPlayerData.title}</h2>
          <p>{cdPlayerData.subtitle}</p>
        </div>

        <button type="button" className="cd_player__play" onClick={togglePlay}>
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>

        <audio ref={audioRef}>
          <source src={cdPlayerData.audio} type="audio/wav" />
        </audio>
      </div>
    </Window>
  );
}
