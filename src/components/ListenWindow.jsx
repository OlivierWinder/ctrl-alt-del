import Window from './Window';
import { listenAlbum } from '../data/listenStructure';
import { assetUrl } from '../utils/assetUrl';

export default function ListenWindow({
  title = listenAlbum.title,
  zIndex,
  containerRef,
  stackOffset = 0,
  onClose,
  onFocus,
  onPlayTrack,
}) {
  return (
    <Window
      title={title}
      variant="listen"
      zIndex={zIndex}
      containerRef={containerRef}
      stackOffset={stackOffset}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div className="listen-window">
        <div className="listen-window__header">
          <img
            className="listen-window__cover"
            src={assetUrl(listenAlbum.cover)}
            alt=""
            draggable={false}
          />
          <div className="listen-window__meta">
            <div className="listen-window__artist">{listenAlbum.artist}</div>
            <div className="listen-window__album">{listenAlbum.album}</div>
            <div className="listen-window__type">{listenAlbum.type}</div>
          </div>
        </div>

        <div className="listen-window__list" role="list">
          <div className="listen-window__list-head" aria-hidden="true">
            <span className="listen-window__col-num">#</span>
            <span className="listen-window__col-track">Track</span>
          </div>
          {listenAlbum.tracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              className="listen-window__track"
              role="listitem"
              onClick={() => onPlayTrack?.(track.id)}
            >
              <span className="listen-window__col-num">{index + 1}</span>
              <span className="listen-window__col-track">{track.label}</span>
            </button>
          ))}
        </div>
      </div>
    </Window>
  );
}
