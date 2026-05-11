const nodes = {
    title: document.getElementById("track-title"),
    artist: document.getElementById("track-artist"),
    status: document.getElementById("status-text"),
    helper: document.getElementById("helper-copy"),
    playToggle: document.getElementById("play-toggle"),
    playLabel: document.getElementById("play-label"),
    muteToggle: document.getElementById("mute-toggle"),
    progress: document.getElementById("progress"),
    currentTime: document.getElementById("current-time"),
    durationTime: document.getElementById("duration-time"),
    volume: document.getElementById("volume"),
    coverImage: document.getElementById("cover-image"),
    coverFallback: document.getElementById("cover-fallback"),
    coverFrame: document.querySelector(".cover-frame"),
};

const params = new URLSearchParams(window.location.search);
const state = {
    player: null,
    ready: false,
    duration: 0,
    timerId: null,
    lastState: -1,
    autoplay: params.get("autoplay") === "1",
};