import { useEffect, useRef } from 'react';
import Window from './Window';
import { assetUrl } from '../utils/assetUrl';

export default function RatRaceWindow({
  title = 'RatRaceRevolution',
  zIndex,
  containerRef,
  stackOffset = 0,
  minimized = false,
  onClose,
  onFocus,
}) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(
      { type: minimized ? 'rrr-pause' : 'rrr-resume' },
      '*',
    );
  }, [minimized]);

  return (
    <Window
      title={title}
      variant="ratrace"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      windowStyle={minimized ? { display: 'none' } : undefined}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="ratrace-window">
        <iframe
          ref={iframeRef}
          className="ratrace-window__frame"
          title="RatRaceRevolution"
          src={assetUrl('/ratracerevolution.html')}
          tabIndex={0}
        />
      </div>
    </Window>
  );
}
