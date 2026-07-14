import { useEffect, useRef } from 'react';
import { virusVideo } from '../data/content';

export default function VirusVideo({ isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <video
      ref={videoRef}
      className="virus_video"
      autoPlay
      onEnded={onClose}
    >
      <source src={virusVideo.src} type="video/mp4" />
    </video>
  );
}
