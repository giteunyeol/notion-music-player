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

const themes = {
  sunset: {
    bg1: "#f5d8b3",
    bg2: "#ce6d53",
    surface: "rgba(36, 25, 28, 0.78)",
    accent: "#ffd36e",
    accent2: "#ff8e53",
  },
  ocean: {
    bg1: "#b5ecff",
    bg2: "#2266b2",
    surface: "rgba(13, 28, 48, 0.8)",
    accent: "#95f0ff",
    accent2: "#76c3ff",
  },
  moss: {
    bg1: "#dce8b6",
    bg2: "#5d8d5d",
    surface: "rgba(25, 36, 28, 0.8)",
    accent: "#f3f3a7",
    accent2: "#bed27f",
  },
  noir: {
    bg1: "#adadb6",
    bg2: "#343744",
    surface: "rgba(18, 18, 23, 0.86)",
    accent: "#f1e4ba",
    accent2: "#d8b46c",
  },
  blush: {
    bg1: "#ffd9e2",
    bg2: "#d98293",
    surface: "rgba(49, 28, 35, 0.78)",
    accent: "#ffe6ad",
    accent2: "#ff9bb1",
  },
  latte: {
    bg1: "#ead7bc",
    bg2: "#9b6a4d",
    surface: "rgba(46, 32, 24, 0.78)",
    accent: "#f7dfb2",
    accent2: "#c99a6b",
  },
  mint: {
    bg1: "#d7f5e6",
    bg2: "#3e9a84",
    surface: "rgba(17, 48, 43, 0.78)",
    accent: "#c8ffe8",
    accent2: "#6ad7bc",
  },
  midnight: {
    bg1: "#89a7d9",
    bg2: "#17244a",
    surface: "rgba(9, 15, 35, 0.86)",
    accent: "#d7e7ff",
    accent2: "#8daeff",
  },
  butter: {
    bg1: "#fff1a8",
    bg2: "#e7a64d",
    surface: "rgba(61, 40, 18, 0.76)",
    accent: "#fff9ce",
    accent2: "#ffc35a",
  },
  steel: {
    bg1: "#dbe4ec",
    bg2: "#64748b",
    surface: "rgba(28, 35, 45, 0.78)",
    accent: "#e9f2ff",
    accent2: "#9bb4d1",
  },
  cherry: {
    bg1: "#ffd3d7",
    bg2: "#8f1d2c",
    surface: "rgba(45, 14, 23, 0.82)",
    accent: "#ffe1a8",
    accent2: "#ff6b80",
  },
  paper: {
    bg1: "#f8f1e3",
    bg2: "#b7b1a5",
    surface: "rgba(43, 39, 34, 0.72)",
    accent: "#fff7d7",
    accent2: "#d7c5a5",
  },
};

const coverGenres = {
  pop: "pop",
  kpop: "kpop",
  jpop: "jpop",
  jazz: "jazz",
  lofi: "lofi",
  rock: "rock",
  hiphop: "hiphop",
  rnb: "rnb",
  electronic: "electronic",
  citypop: "citypop",
  classic: "classic",
  indie: "indie",
  ballad: "ballad",
};

const genreCoverImages = {
  pop: "/covers/pop-current.jpg",
  kpop: "/covers/kpop.jpg",
  jpop: "/covers/jpop.jpg",
  jazz: "/covers/jazz.jpg",
  lofi: "/covers/lofi.jpg",
  rock: "/covers/rock.jpg",
  hiphop: "/covers/hiphop.jpg",
  rnb: "/covers/rnb.jpg",
  electronic: "/covers/electronic.jpg",
  citypop: "/covers/citypop.jpg",
  classic: "/covers/classic.jpg",
  indie: "/covers/indie.jpg",
  ballad: "/covers/ballad.jpg",
};

init();

function init() {
  applyLayout();
  applyTheme();
  hydrateMeta();
  bindEvents();
  paintRange(nodes.progress);
  paintRange(nodes.volume);

  const videoConfig = parseYoutubeInput(params.get("video"));

  if (videoConfig.error) {
    showError(videoConfig.error);
    return;
  }

  nodes.status.textContent = "Connecting";
  injectYoutubeApi(videoConfig);
}

function applyLayout() {
  const layout = (params.get("layout") || "horizontal").trim().toLowerCase();

  if (["vertical", "portrait", "세로"].includes(layout)) {
    document.body.classList.add("layout-vertical");
  }
}

function bindEvents() {
  nodes.playToggle.addEventListener("click", togglePlayback);
  nodes.muteToggle.addEventListener("click", toggleMute);
  nodes.coverImage.addEventListener("error", () => {
    nodes.coverFrame.classList.remove("is-image-cover");
    nodes.coverImage.classList.add("hidden");
    nodes.coverFallback.classList.remove("hidden");
  });

  nodes.progress.addEventListener("input", () => {
    paintRange(nodes.progress);

    if (!state.duration) {
      return;
    }

    const previewSeconds = (Number(nodes.progress.value) / 100) * state.duration;
    nodes.currentTime.textContent = formatTime(previewSeconds);
  });

  nodes.progress.addEventListener("change", () => {
    if (!state.ready || !state.duration) {
      return;
    }

    const nextTime = (Number(nodes.progress.value) / 100) * state.duration;
    state.player.seekTo(nextTime, true);
    updateProgress();
  });

  nodes.volume.addEventListener("input", () => {
    paintRange(nodes.volume);

    if (!state.ready) {
      return;
    }

    const volume = Number(nodes.volume.value);
    state.player.setVolume(volume);

    if (volume === 0) {
      state.player.mute();
      nodes.muteToggle.textContent = "Unmute";
      return;
    }

    state.player.unMute();
    nodes.muteToggle.textContent = "Mute";
  });
}

function hydrateMeta() {
  const title = getParam("title", "Untitled Track");
  const artist = getParam("artist", "Unknown Artist");
  const cover = params.get("cover");

  nodes.title.textContent = title;
  nodes.artist.textContent = artist;
  nodes.coverFallback.textContent = (title[0] || artist[0] || "N")
    .toUpperCase()
    .slice(0, 1);

  if (cover && isImageCover(cover)) {
    nodes.coverImage.src = cover;
    nodes.coverFrame.classList.add("is-image-cover");
    nodes.coverImage.classList.remove("hidden");
    nodes.coverFallback.classList.add("hidden");
  } else if (cover) {
    applyGenreCover(cover);
  }

  nodes.helper.textContent = "";
}

function applyGenreCover(input) {
  const genre = normalizeCoverGenre(input);

  if (!genre) {
    return;
  }

  nodes.coverFrame.dataset.coverGenre = genre;

  if (!genreCoverImages[genre]) {
    return;
  }

  nodes.coverImage.src = genreCoverImages[genre];
  nodes.coverFrame.classList.add("is-image-cover");
  nodes.coverImage.classList.remove("hidden");
  nodes.coverFallback.classList.add("hidden");
}

function normalizeCoverGenre(input) {
  const key = input.trim().toLowerCase();

  return coverGenres[key] || "";
}

function isImageCover(input) {
  return /^(https?:\/\/|\/)/i.test(input.trim());
}

function applyTheme() {
  const themeName = params.get("theme") || "sunset";
  const theme = themes[themeName] || themes.sunset;
  const root = document.documentElement;

  root.style.setProperty("--bg-1", theme.bg1);
  root.style.setProperty("--bg-2", theme.bg2);
  root.style.setProperty("--surface", theme.surface);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-2", theme.accent2);
}

function injectYoutubeApi(videoConfig) {
  window.onYouTubeIframeAPIReady = () => {
    createPlayer(videoConfig);
  };

  if (window.YT && window.YT.Player) {
    createPlayer(videoConfig);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  script.async = true;
  document.head.appendChild(script);
}

function createPlayer(videoConfig) {
  if (state.player) {
    return;
  }

  state.player = new window.YT.Player("youtube-player", {
    width: "200",
    height: "200",
    videoId: videoConfig.videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      start: videoConfig.startSeconds,
    },
    events: {
      onReady: handleReady,
      onStateChange: handleStateChange,
      onError: handleError,
    },
  });
}

function handleReady(event) {
  state.ready = true;
  state.duration = event.target.getDuration() || 0;
  startTicker();

  nodes.playToggle.disabled = false;
  nodes.muteToggle.disabled = false;
  nodes.volume.disabled = false;

  event.target.setVolume(Number(nodes.volume.value));
  nodes.status.textContent = "Ready to play";

  if (state.autoplay) {
    event.target.playVideo();
  }
}

function handleStateChange(event) {
  state.lastState = event.data;

  if (event.data === window.YT.PlayerState.PLAYING) {
    document.body.classList.add("is-playing");
    nodes.playLabel.textContent = "Pause";
    nodes.status.textContent = "Now playing";
  } else if (event.data === window.YT.PlayerState.PAUSED) {
    document.body.classList.remove("is-playing");
    nodes.playLabel.textContent = "Play";
    nodes.status.textContent = "Paused";
  } else if (event.data === window.YT.PlayerState.BUFFERING) {
    nodes.status.textContent = "Buffering";
  } else if (event.data === window.YT.PlayerState.ENDED) {
    state.player.seekTo(0, true);
    state.player.playVideo();
  }

  updateProgress();
}

function handleError(event) {
  const messageMap = {
    2: "The video link looks invalid.",
    5: "The browser could not play this YouTube video.",
    100: "This video is unavailable or private.",
    101: "The video owner blocked embedding.",
    150: "The video owner blocked embedding.",
  };

  showError(messageMap[event.data] || "The player could not load this video.");
}

function togglePlayback() {
  if (!state.ready) {
    return;
  }

  if (state.lastState === window.YT.PlayerState.PLAYING) {
    state.player.pauseVideo();
    return;
  }

  state.player.playVideo();
}

function toggleMute() {
  if (!state.ready) {
    return;
  }

  if (state.player.isMuted()) {
    state.player.unMute();
    if (Number(nodes.volume.value) === 0) {
      nodes.volume.value = "65";
      state.player.setVolume(65);
      paintRange(nodes.volume);
    }
    nodes.muteToggle.textContent = "Mute";
    return;
  }

  state.player.mute();
  nodes.muteToggle.textContent = "Unmute";
}

function startTicker() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
  }

  state.timerId = window.setInterval(updateProgress, 250);
}

function updateProgress() {
  if (!state.ready || !state.player || typeof state.player.getCurrentTime !== "function") {
    return;
  }

  const current = state.player.getCurrentTime() || 0;
  const duration = state.player.getDuration() || state.duration || 0;

  state.duration = duration;
  nodes.currentTime.textContent = formatTime(current);
  nodes.durationTime.textContent = formatTime(duration);

  if (!duration) {
    return;
  }

  const progressValue = (current / duration) * 100;
  nodes.progress.value = String(progressValue);
  paintRange(nodes.progress);
}

function parseYoutubeInput(input) {
  if (!input) {
    return {
      error:
        "Missing a YouTube link. Add ?video=https://www.youtube.com/watch?v=VIDEO_ID to the widget URL.",
    };
  }

  const cleaned = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) {
    return { videoId: cleaned, startSeconds: 0 };
  }

  try {
    const url = new URL(cleaned);
    const host = url.hostname.replace(/^www\./, "");
    const startSeconds = parseStartTime(
      url.searchParams.get("t") || url.searchParams.get("start") || "0"
    );

    if (host === "youtu.be") {
      return {
        videoId: url.pathname.replace("/", "").slice(0, 11),
        startSeconds,
      };
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        return {
          videoId: (url.searchParams.get("v") || "").slice(0, 11),
          startSeconds,
        };
      }

      if (url.pathname.startsWith("/shorts/")) {
        return {
          videoId: url.pathname.split("/")[2].slice(0, 11),
          startSeconds,
        };
      }

      if (url.pathname.startsWith("/embed/")) {
        return {
          videoId: url.pathname.split("/")[2].slice(0, 11),
          startSeconds,
        };
      }
    }
  } catch (error) {
    return {
      error:
        "Unable to parse the YouTube link. Use a watch URL, shorts URL, youtu.be URL, or a plain video id.",
    };
  }

  return {
    error:
      "That link is not a supported YouTube format yet. Try a normal watch URL like https://www.youtube.com/watch?v=VIDEO_ID.",
  };
}

function parseStartTime(value) {
  if (!value) {
    return 0;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const hours = Number((value.match(/(\d+)h/) || [0, 0])[1]);
  const minutes = Number((value.match(/(\d+)m/) || [0, 0])[1]);
  const seconds = Number((value.match(/(\d+)s/) || [0, 0])[1]);

  return hours * 3600 + minutes * 60 + seconds;
}

function paintRange(element) {
  const min = Number(element.min || 0);
  const max = Number(element.max || 100);
  const value = Number(element.value || 0);
  const ratio = ((value - min) / (max - min)) * 100;
  element.style.setProperty("--range-value", ratio + "%");
}

function getParam(name, fallback) {
  const value = params.get(name);
  return value && value.trim() ? value.trim() : fallback;
}

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(value || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return (
      String(hours) +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainder).padStart(2, "0")
    );
  }

  return String(minutes) + ":" + String(remainder).padStart(2, "0");
}

function showError(message) {
  document.body.classList.remove("is-playing");
  nodes.status.textContent = "Unable to load player";
  nodes.helper.textContent = message;
  nodes.helper.classList.remove("hidden");
  nodes.playLabel.textContent = "Play";
  nodes.playToggle.disabled = true;
  nodes.muteToggle.disabled = true;
  nodes.volume.disabled = true;
}

function will_be(){
  
}