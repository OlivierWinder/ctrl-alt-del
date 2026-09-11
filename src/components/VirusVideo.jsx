import { useEffect, useRef } from 'react';
import { virusVideo } from '../data/content';
import { assetUrl } from '../utils/assetUrl';

export default function VirusVideo({ isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function stopPlayback() {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onClose();
    }

    function onKeyDown(event) {
      if (event.key === 'Escape' || event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        stopPlayback();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <video
      ref={videoRef}
      className="virus_video"
      autoPlay
      onEnded={onClose}
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        onClose();
      }}
    >
      <source src={assetUrl(virusVideo.src)} type="video/mp4" />
    </video>
  );
}
