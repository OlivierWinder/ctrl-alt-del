import { useEffect, useMemo, useRef, useState } from 'react';
import DesktopIcon from './DesktopIcon';
import FolderWindow from './FolderWindow';
import CDPlayer from './CDPlayer';
import PdfViewer from './PdfViewer';
import ImageViewer from './ImageViewer';
import ErrorDialog from './ErrorDialog';
import NotesApp from './NotesApp';
import EmailApp from './EmailApp';
import SimpleWindow from './SimpleWindow';
import VirusVideo from './VirusVideo';
import FakeAdOverlay from './FakeAdOverlay';
import AdDictionPrompt from './AdDictionPrompt';
import AdDictionWindow from './AdDictionWindow';
import SystemBlueScreen from './SystemBlueScreen';
import CreditsWindow from './CreditsWindow';
import RatRaceWindow from './RatRaceWindow';
import ListenWindow from './ListenWindow';
import Taskbar from './Taskbar';
import { desktopIcons, folderWindows } from '../data/content';
import { getListenTrack } from '../data/listenStructure';
import { useWindowManager } from '../hooks/useWindowManager';
import { useErrorTriggers, triggerErrorAction } from '../hooks/useErrorTriggers';
import { useFakeAds } from '../hooks/useFakeAds';
import { getFolderLabel, isFolderWindow } from '../utils/folderNavigation';

const ICON_START_Y = 18;
const ICON_GAP_Y = 108;
const ICON_LEFT_X = 18;
const ICON_RIGHT_PADDING = 22;
const ICON_WIDTH = 101;

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

export default function Desktop({ isActive = true }) {
  const desktopRef = useRef(null);
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [systemScreenId, setSystemScreenId] = useState(null);
  const {
    windows,
    focusedId,
    openWindow,
    openPdfView,
    openImageView,
    openAudioView,
    openAdDictionWindow,
    closeAdDictionWindow,
    openErrorDialog,
    navigateFolder,
    folderBack,
    folderForward,
    closeWindow,
    focusWindow,
    toggleMinimize,
    allocateZIndex,
  } = useWindowManager();

  useErrorTriggers(openErrorDialog, isActive);
  const {
    currentAd,
    dismissAd,
    showAdDiction,
    showOffGrid,
    setShowAdDiction,
    setShowOffGrid,
    handlePromptAction,
    stopAds,
    isInternetDisabledByAdBlocker,
  } = useFakeAds({ isActive, openAdDictionWindow, closeAdDictionWindow });

  const [adZIndex, setAdZIndex] = useState(0);

  useEffect(() => {
    if (!currentAd) {
      setAdZIndex(0);
      return;
    }
    setAdZIndex(allocateZIndex());
  }, [currentAd, allocateZIndex]);

  const iconPositions = useMemo(() => getIconPositions(), []);

  function openInternetRestriction() {
    // Already shut off through ad-diction — don't show again
    if (isInternetDisabledByAdBlocker()) return false;

    stopAds();
    return triggerErrorAction(openErrorDialog, 'internet');
  }

  function handleErrorAction(win, actionId) {
    closeWindow(win.instanceId);

    if (actionId === 'online') {
      openInternetRestriction();
    }
  }

  function handleAdPromptAction(actionId) {
    handlePromptAction(actionId);
  }

  function handleCloseAdDictionWindow(instanceId) {
    setShowOffGrid(false);
    closeWindow(instanceId);
  }

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

    if (id === 'internet') {
      openInternetRestriction();
      return;
    }

    if (id === 'rat_race_revolution') {
      openWindow('rat_race_revolution');
      return;
    }

    if (id === 'listen') {
      openWindow('listen');
      return;
    }

    if (isFolderWindow(id)) {
      navigateFolder(id, [getFolderLabel(id)]);
      return;
    }

    openWindow(id);
  }

  function handleOpenFolderItem(item, folderInstanceId) {
    if (item.errorAction) {
      triggerErrorAction(openErrorDialog, item.errorAction);
      return;
    }

    if (item.pdf) {
      openPdfView(item.label, item.pdf);
      return;
    }

    if (item.image) {
      openImageView(item.label, item.image);
      return;
    }

    if (item.audio || item.opens === 'cd_player') {
      openAudioView(
        {
          title: item.label.replace(/\.(mp3|wav)$/i, ''),
          artist: 'a tryer is a winner',
          audio: item.audio,
          cover: item.cover,
        },
        { autoplay: true },
      );
      return;
    }

    if (!item.opens) return;

    const folderWin = windows.find((win) => win.instanceId === folderInstanceId);
    const currentPath = folderWin?.folderNav?.path || [];

    if (isFolderWindow(item.opens)) {
      navigateFolder(
        item.opens,
        [...currentPath, getFolderLabel(item.opens)],
        { autoplay: item.autoplay },
        folderInstanceId,
      );
      return;
    }

    openWindow(item.opens);
  }

  const aiWindow = windows.find((win) => win.type === 'ai' && !win.minimized);

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

        {windows.map((win) => {
          if (win.minimized && win.type !== 'rat_race') return null;

          const shared = {
            key: win.instanceId,
            zIndex: win.zIndex,
            containerRef: desktopRef,
            stackOffset: win.stackIndex,
            onClose: () => closeWindow(win.instanceId),
            onFocus: () => focusWindow(win.instanceId),
          };

          if (win.type === 'rat_race') {
            return (
              <RatRaceWindow
                {...shared}
                title={win.title}
                minimized={Boolean(win.minimized)}
              />
            );
          }

          if (win.type === 'folder') {
            const config = folderWindows[win.appId];
            if (!config) return null;
            const nav = win.folderNav;
            return (
              <FolderWindow
                {...shared}
                config={config}
                folderPath={nav.path}
                canGoBack={nav.index > 0}
                canGoForward={nav.index < nav.history.length - 1}
                onBack={() => folderBack(win.instanceId)}
                onForward={() => folderForward(win.instanceId)}
                onOpenItem={(item) => handleOpenFolderItem(item, win.instanceId)}
              />
            );
          }

          if (win.type === 'image') {
            return (
              <ImageViewer
                {...shared}
                title={win.title}
                imageSrc={win.image}
              />
            );
          }

          if (win.type === 'pdf') {
            return (
              <PdfViewer
                {...shared}
                title={win.title}
                pdfSrc={win.pdf}
              />
            );
          }

          if (win.type === 'cd_player') {
            return (
              <CDPlayer
                {...shared}
                autoplay={win.autoplay}
                track={win.track}
                onEject={() => triggerErrorAction(openErrorDialog, 'cd_eject')}
              />
            );
          }

          if (win.type === 'notes') {
            return (
              <NotesApp
                {...shared}
                title={win.title}
              />
            );
          }

          if (win.type === 'credits') {
            return (
              <CreditsWindow
                {...shared}
                title={win.title}
              />
            );
          }

          if (win.type === 'listen') {
            return (
              <ListenWindow
                {...shared}
                title={win.title}
                onPlayTrack={(trackId) => {
                  const track = getListenTrack(trackId);
                  if (!track) return;
                  openAudioView(track, { autoplay: true });
                }}
              />
            );
          }

          if (win.type === 'email') {
            return (
              <EmailApp
                {...shared}
                title={win.title}
              />
            );
          }

          if (win.type === 'error') {
            return (
              <ErrorDialog
                {...shared}
                title={win.title}
                message={win.message}
                actions={win.actions}
                icon={win.icon}
                layout={win.layout}
                onAction={(actionId) => handleErrorAction(win, actionId)}
              />
            );
          }

          if (win.type === 'ad_diction') {
            return (
              <AdDictionWindow
                {...shared}
                adsShownCount={win.adsShownCount}
                attentionEuros={win.attentionEuros}
                onClose={() => handleCloseAdDictionWindow(win.instanceId)}
                onBlockAds={() => handleAdPromptAction('block_ads')}
              />
            );
          }

          if (win.type === 'simple') {
            if (win.image) {
              return (
                <ImageViewer
                  {...shared}
                  title={win.title}
                  imageSrc={win.image}
                />
              );
            }

            return (
              <SimpleWindow
                {...shared}
                title={win.title}
              />
            );
          }

          return null;
        })}

        <VirusVideo
          isOpen={Boolean(aiWindow)}
          onClose={() => aiWindow && closeWindow(aiWindow.instanceId)}
        />

        <FakeAdOverlay
          src={currentAd}
          zIndex={adZIndex}
          onClose={dismissAd}
          onFocus={() => setAdZIndex(allocateZIndex())}
          containerRef={desktopRef}
        />

        <AdDictionPrompt
          showAdDiction={showAdDiction}
          showOffGrid={showOffGrid}
          onAction={handleAdPromptAction}
          onCloseAdDiction={() => setShowAdDiction(false)}
          onCloseOffGrid={() => setShowOffGrid(false)}
        />
      </main>

      <Taskbar
        windows={windows}
        focusedId={focusedId}
        onTaskbarClick={toggleMinimize}
        onLogOff={() => triggerErrorAction(openErrorDialog, 'log_off')}
        onOpenSystemScreen={setSystemScreenId}
        onOpenCredits={() => openWindow('credits')}
      />

      <SystemBlueScreen
        screenId={systemScreenId}
        onClose={() => setSystemScreenId(null)}
      />
    </>
  );
}
