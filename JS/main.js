document.addEventListener("DOMContentLoaded", () => {
    const desktop = document.querySelector(".desktop");
    const icons = document.querySelectorAll(".desktop__icon");
    const windows = document.querySelectorAll(".window, video");

    /* -----------------------------
       ICON STACKING (TOP-LEFT)
    ----------------------------- */
    let startY = 20;
    const gapY = 120;

    icons.forEach((icon, index) => {
        icon.style.left = `20px`;
        icon.style.top = `${startY + index * gapY}px`;
    });

    /* -----------------------------
       ICON BEHAVIOUR
    ----------------------------- */
    icons.forEach(icon => {
        makeDraggableAndSelectable(icon, desktop);
    });

    /* -----------------------------
       DESELECT ICONS WHEN CLICKING DESKTOP
    ----------------------------- */
    desktop.addEventListener("mousedown", (e) => {
        if (!e.target.closest(".desktop__icon")) {
            icons.forEach(icon => icon.classList.remove("selected"));
        }
    });

    /* -----------------------------
       WINDOW CLOSE BUTTONS
    ----------------------------- */
    windows.forEach(win => {
        const closeBtn = win.querySelector(".title_bar__button");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                win.style.display = "none";

                if (win.tagName === "VIDEO") {
                    win.pause();
                    win.currentTime = 0;
                }
            });
        }
    });

    /* -----------------------------
       REAL-TIME CLOCK
    ----------------------------- */
    const clock = document.querySelector(".footer__clock");

    function updateClock() {
        const now = new Date();

        let hours = now.getHours();
        let minutes = now.getMinutes();

        hours = hours < 10 ? `0${hours}` : hours;
        minutes = minutes < 10 ? `0${minutes}` : minutes;

        clock.textContent = `${hours}:${minutes}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    /* -----------------------------
       INNER FOLDER DOUBLE CLICK
    ----------------------------- */

    const innerFolders = document.querySelectorAll(".window__folder");

    innerFolders.forEach(folder => {
        folder.addEventListener("dblclick", () => {
            const targetId = folder.dataset.window;

            if (!targetId) return;

            /* close all windows first */
            document.querySelectorAll(".window").forEach(win => {
                win.style.display = "none";
            });

            /* open clicked folder window */
            const targetWindow = document.getElementById(targetId);

            if (!targetWindow) return;

            targetWindow.style.display = "block";
            targetWindow.style.zIndex = 9999;
        });
    });

    /* ============================================================
       CD PLAYER
    ============================================================ */

    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const cdPlayer = document.getElementById("cd_player");

    if (playPauseBtn && audioPlayer) {
        playPauseBtn.addEventListener("click", () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playPauseBtn.textContent = "PAUSE";
            } else {
                audioPlayer.pause();
                playPauseBtn.textContent = "PLAY";
            }
        });
    }

    /* track_01.mp3 opens CD Player */
    const track = document.querySelector('[data-window="cd_player"]');

    if (track && cdPlayer && audioPlayer) {
        track.addEventListener("dblclick", () => {
            /* close all windows first */
            document.querySelectorAll(".window").forEach(win => {
                win.style.display = "none";
            });

            /* open CD player */
            cdPlayer.style.display = "block";
            cdPlayer.style.zIndex = 9999;

            /* autoplay song */
            audioPlayer.currentTime = 0;
            audioPlayer.play();

            if (playPauseBtn) {
                playPauseBtn.textContent = "PAUSE";
            }
        });
    }

    /* close CD player stops audio */
    if (cdPlayer) {
        const closeBtn = cdPlayer.querySelector(".title_bar__button");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                cdPlayer.style.display = "none";

                if (audioPlayer) {
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0;
                }

                if (playPauseBtn) {
                    playPauseBtn.textContent = "PLAY";
                }
            });
        }
    }
});


/* ============================================================
   DRAG + SELECT + DOUBLE CLICK OPEN (MATCHING ID)
============================================================ */

function makeDraggableAndSelectable(icon, container) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    icon.addEventListener("mousedown", (e) => {
        isDragging = true;

        const rect = icon.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        icon.style.zIndex = 999;
        icon.classList.add("selected");

        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const containerRect = container.getBoundingClientRect();

        let x = e.clientX - containerRect.left - offsetX;
        let y = e.clientY - containerRect.top - offsetY;

        x = Math.max(
            0,
            Math.min(x, containerRect.width - icon.offsetWidth)
        );

        y = Math.max(
            0,
            Math.min(y, containerRect.height - icon.offsetHeight)
        );

        icon.style.left = `${x}px`;
        icon.style.top = `${y}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;

        isDragging = false;
        icon.style.zIndex = "";
    });

    /* -----------------------------
       DOUBLE CLICK → OPEN MATCHING WINDOW / VIDEO
    ----------------------------- */

    icon.addEventListener("dblclick", () => {
        const windowId = icon.dataset.window || icon.id;

        if (!windowId) return;

        const win = document.getElementById(windowId);

        if (!win) return;

        /* close all other windows/videos */
        document.querySelectorAll(".window, video").forEach(el => {
            if (el !== win) {
                el.style.display = "none";

                if (el.tagName === "VIDEO") {
                    el.pause();
                    el.currentTime = 0;
                }
            }
        });

        /* open selected window/video */
        win.style.display = "block";
        win.style.zIndex = 9999;

        /* virus video autoplay */
        if (win.tagName === "VIDEO") {
            win.play().catch(err =>
                console.log("Video play error:", err)
            );

            win.onended = () => {
                win.style.display = "none";
                win.currentTime = 0;
            };
        }

        icon.classList.remove("selected");
    });
}