import { useMemo, useRef, useState } from 'react';
import DesktopIcon from './DesktopIcon';
import FolderWindow from './FolderWindow';
import CDPlayer from './CDPlayer';
import PdfViewer from './PdfViewer';
import SimpleWindow from './SimpleWindow';
import VirusVideo from './VirusVideo';
import Taskbar from './Taskbar';
import { desktopIcons, folderWindows, pdfWindows, simpleWindows } from '../data/content';
import { useWindowManager } from '../hooks/useWindowManager';
import { getFolderLabel, isFolderWindow } from '../utils/folderNavigation';

const ICON_START_Y = 20;
const ICON_GAP_Y = 120;
const ICON_LEFT_X = 20;
const ICON_RIGHT_PADDING = 24;
const ICON_WIDTH = 90;

function getIconPositions() {
  const rightX = window.innerWidth - ICON_WIDTH - ICON_RIGHT_PADDING;
  let leftIndex = 0;

  return desktopIcons.reduce((positions, icon) => {
    if (icon.position?.column === 'right') {
      const row = icon.position.row ?? 0;
      positions[icon.id] = {
        x: rightX,
        y: ICON_START_Y + row * ICON_GAP_Y,
      };
    } else {
      positions[icon.id] = {
        x: ICON_LEFT_X,
        y: ICON_START_Y + leftIndex * ICON_GAP_Y,
      };
      leftIndex += 1;
    }
    return positions;
  }, {});
}

export default function Desktop() {
  const desktopRef = useRef(null);
  const [selectedIconId, setSelectedIconId] = useState(null);
  const {
    openWindowId,
    zIndex,
    cdAutoplay,
    isMinimized,
    folderPath,
    canFolderBack,
    canFolderForward,
    openWindow,
    navigateFolder,
    folderBack,
    folderForward,
    closeWindow,
    toggleMinimize,
  } = useWindowManager();

  const iconPositions = useMemo(() => getIconPositions(), []);

  function handleDesktopMouseDown(event) {
    if (!event.target.closest('.desktop__icon')) {
      setSelectedIconId(null);
    }
  }

  function handleOpenWindow(id, isVideo = false) {
    setSelectedIconId(null);

    if (isVideo) {
      openWindow('ai');
      return;
    }

    if (isFolderWindow(id)) {
      navigateFolder(id, [getFolderLabel(id)]);
      return;
    }

    openWindow(id);
  }

  function handleOpenFolderItem(id, options = {}) {
    if (isFolderWindow(id)) {
      navigateFolder(id, [...folderPath, getFolderLabel(id)], options);
      return;
    }

    openWindow(id, options);
  }

  const isAiOpen = openWindowId === 'ai';
  const folderConfig = folderWindows[openWindowId];
  const simpleConfig = simpleWindows[openWindowId];
  const pdfConfig = pdfWindows[openWindowId];
  const isCdPlayerOpen = openWindowId === 'cd_player';

  return (
    <>
      <main className="desktop" ref={desktopRef} onMouseDown={handleDesktopMouseDown}>
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            isSelected={selectedIconId === icon.id}
            initialPosition={iconPositions[icon.id]}
            containerRef={desktopRef}
            onSelect={setSelectedIconId}
            onOpen={handleOpenWindow}
          />
        ))}

        {folderConfig && !isMinimized && (
          <FolderWindow
            key={openWindowId}
            config={folderConfig}
            zIndex={zIndex}
            containerRef={desktopRef}
            folderPath={folderPath}
            canGoBack={canFolderBack}
            canGoForward={canFolderForward}
            onBack={folderBack}
            onForward={folderForward}
            onClose={closeWindow}
            onOpenItem={handleOpenFolderItem}
          />
        )}

        {isCdPlayerOpen && !isMinimized && (
          <CDPlayer
            key="cd_player"
            zIndex={zIndex}
            containerRef={desktopRef}
            autoplay={cdAutoplay}
            onClose={closeWindow}
          />
        )}

        {pdfConfig && !isMinimized && (
          <PdfViewer
            key={openWindowId}
            title={pdfConfig.title}
            pdfSrc={pdfConfig.pdf}
            zIndex={zIndex}
            containerRef={desktopRef}
            onClose={closeWindow}
          />
        )}

        {simpleConfig && !isMinimized && (
          <SimpleWindow
            key={openWindowId}
            title={simpleConfig.title}
            zIndex={zIndex}
            containerRef={desktopRef}
            onClose={closeWindow}
          />
        )}

        <VirusVideo isOpen={isAiOpen && !isMinimized} onClose={closeWindow} />
      </main>

      <Taskbar
        openWindowId={openWindowId}
        isMinimized={isMinimized}
        onTaskbarClick={toggleMinimize}
      />
    </>
  );
}
