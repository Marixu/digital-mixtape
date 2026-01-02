import * as React from "react";
import './style.css';
import confetti from "canvas-confetti";
import { supabase } from "./supabase";

/* ---------- MAX 5 SONGS ---------- */

const MAX_TRACKS = 5;

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* ---------- MAIN APP ---------- */
export default function App() {

  /* ---------- MOBILE ---------- */
// ✅ GOOD - Use state and useEffect for client-side detection
const [deviceInfo, setDeviceInfo] = React.useState({
  isMobile: false,
  isTablet: false,
  isIOS: false,
  isAndroid: false,
  isSafari: false,
  isMacDesktop: false,
});

// Run device detection only on client-side after mount
React.useEffect(() => {
  const checkDevice = () => {
    const width = window.innerWidth;
    const isTouchDevice = navigator.maxTouchPoints > 1;
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    setDeviceInfo({
      isMobile: width <= 768,
      isTablet: (width > 768 && width <= 1366) || 
        (platform === 'MacIntel' && isTouchDevice && width <= 1366),
      isIOS: /iPad|iPhone|iPod/.test(userAgent) || 
        (platform === 'MacIntel' && isTouchDevice),
      isAndroid: /Android/.test(userAgent),
      isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
      isMacDesktop: platform === 'MacIntel' && !isTouchDevice,
    });
  };

  checkDevice();
  window.addEventListener('resize', checkDevice);
  return () => window.removeEventListener('resize', checkDevice);
}, []);

const { isMobile, isTablet, isIOS, isAndroid, isSafari, isMacDesktop } = deviceInfo;


  const [isLoadingSharedMixtape, setIsLoadingSharedMixtape] = React.useState(false);
  const [tab, setTab] = React.useState("songs");
  const [coverColor, setCoverColor] = React.useState("#E6CDEB");
  const [appMode, setAppMode] = React.useState("editor");
  // "editor" | "preview" | "receiver"
  const [errorPopup, setErrorPopup] = React.useState(null);
  const [labelColor, setLabelColor] = React.useState("#FFFFFF");
  const [labelMessage, setLabelMessage] = React.useState("");
  const [labelMessagePos, setLabelMessagePos] = React.useState({ x: 50, y: 30 });
  const [siteBackground, setSiteBackground] = React.useState(null);
  const [glowEnabled, setGlowEnabled] = React.useState(false);
  const [glowColor, setGlowColor] = React.useState("#f1aedc");
  const [isDarkBg, setIsDarkBg] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState(null);
// possible values: "rewind" | "stop" | "play" | "pause" | "ff" | "next"
  const [labelImageTexture, setLabelImageTexture] = React.useState(null);
  const [labelOverlay, setLabelOverlay] = React.useState(null);
  const [labelImageRotation, setLabelImageRotation] = React.useState(0);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [tracks, setTracks] = React.useState([]);
  const [shareLink, setShareLink] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const [showVoiceRecorder, setShowVoiceRecorder] = React.useState(false);
const [isRecording, setIsRecording] = React.useState(false);
const [recordingTime, setRecordingTime] = React.useState(0);
const mediaRecorderRef = React.useRef(null);
const audioChunksRef = React.useRef([]);
const recordingIntervalRef = React.useRef(null);


  const [currentTime, setCurrentTime] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [textFont, setTextFont] = React.useState("Chubbo");
  const [textColor, setTextColor] = React.useState("#252525ff");
  const [note, setNote] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [mixtapeImage, setMixtapeImage] = React.useState("/transnotape.png");
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const current = tracks[currentTrackIndex];
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [mixtapeFinished, setMixtapeFinished] = React.useState(false);
  const [uploadedLabelImage, setUploadedLabelImage] = React.useState(null);
  const [labelImageScale, setLabelImageScale] = React.useState(1);
  const [pendingUrl, setPendingUrl] = React.useState("");
  const [showRollerVideo, setShowRollerVideo] = React.useState(false);  
  const [labelImagePos, setLabelImagePos] = React.useState({ x: 50, y: 50 });
  const [hoverControl, setHoverControl] = React.useState(null);
  const [pinchData, setPinchData] = React.useState(null);
  const [stickersOnTape, setStickersOnTape] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState("home");
  const isMP3 = current?.type === "mp3" || current?.type === "audio";
  const [tapeVideoReady, setTapeVideoReady] = React.useState(false);
  const [rollerVideoReady, setRollerVideoReady] = React.useState(false);

  const [activeObject, setActiveObject] = React.useState(null);
  const [isReceiverReady, setIsReceiverReady] = React.useState(false);

const [tapeFrames, setTapeFrames] = React.useState([]);
const [rollerFrames, setRollerFrames] = React.useState([]);
const tapeCanvasRef = React.useRef(null);
const rollerCanvasRef = React.useRef(null);
const tapeFrameIndex = React.useRef(0);
const rollerFrameIndex = React.useRef(0);
const animationRef = React.useRef(null);

// ✅ NEW - safe default, then adjust after mount
const [textSize, setTextSize] = React.useState(24);

// Add this useEffect AFTER your device detection useEffect:
React.useEffect(() => {
  if (isMobile) {
    setTextSize(16);
  }
}, [isMobile]);

// Preload images and videos
React.useEffect(() => {
  const images = [
    "/label1.png", "/label2.png", "/label3.png", "/label4.png",
    "/pinkntape.png", "/greennotape.png", "/transnotape.png",
    "/whitenotape.png", "/blacknotape1.png", "/purplenotape1.png", 
    "/bluenotape.png", "/crop.png"
  ];
  
  images.forEach(src => {
    const img = new Image();
    img.loading = "eager";
    img.decoding = "async";
    img.src = src;
  });

  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  const videos = ["/tapeprores.mov", "/smallrollersprores.mov", "/tapenew.webm", "/smallrollers.webm"];
  videos.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);
  });
}, []);

// Computed value for checking if there's a next track
const hasNextTrack = currentTrackIndex < tracks.length - 1;

/* ---------- FONT OPTIONS FOR MIXTAPE MESSAGE ---------- */
const FONT_OPTIONS = [
  { label: "Chubbo", fontFamily: "'Chubbo', serif" },
  { label: "Dancing Script", fontFamily: "'Dancing Script', cursive" },
  { label: "Kalam", fontFamily: "'Kalam', cursive" },
  { label: "Quicksand", fontFamily: "'Quicksand', sans-serif" },
  { label: "Aktura", fontFamily: "'Aktura', cursive" },
  { label: "Comico", fontFamily: "'Comico', cursive" },
  { label: "Melodrama", fontFamily: "'Melodrama', serif" },
  { label: "JetBrains Mono", fontFamily: "'JetBrains Mono', sans-serif" },
];

// Load PNG frames for iOS on mount
React.useEffect(() => {
  if (!isIOS) {
    console.log('Not iOS, skipping frame loading');
    return;
  }

  console.log('🎬 iOS detected, starting frame loading...');

  const loadFrames = async (folder, count) => {
    const frames = [];
    for (let i = 1; i <= count; i++) {
      const img = new Image();
      const src = `/${folder}/${String(i).padStart(4, '0')}.png`;
      img.src = src;
      
      if (i === 1) {
        console.log(`Loading first frame: ${src}`);
      }
      
      await new Promise((resolve) => {
        img.onload = () => {
          frames.push(img);
          if (i === 1) {
            console.log(`✅ First frame loaded! Size: ${img.naturalWidth}x${img.naturalHeight}`);
          }
          resolve();
        };
        img.onerror = () => {
          console.error(`❌ Failed to load: ${src}`);
          resolve();
        };
      });
    }
    return frames;
  };

  loadFrames('tapeframes', 100).then((frames) => {
    console.log(`✅ Loaded ${frames.length} tape frames`);
    setTapeFrames(frames);
  });

  loadFrames('rollerframes', 100).then((frames) => {
    console.log(`✅ Loaded ${frames.length} roller frames`);
    setRollerFrames(frames);
  });
}, [isIOS]);

// Draw first frame as static image when not playing
React.useEffect(() => {
  console.log('Static frame effect running:', { isIOS, tapeFramesCount: tapeFrames.length, rollerFramesCount: rollerFrames.length, isPlaying });
  
  if (!isIOS) return;
  if (tapeFrames.length === 0 || rollerFrames.length === 0) return;

  const tapeCanvas = tapeCanvasRef.current;
  const rollerCanvas = rollerCanvasRef.current;
  
  console.log('Canvas refs:', { tapeCanvas: !!tapeCanvas, rollerCanvas: !!rollerCanvas });
  
  if (!tapeCanvas || !rollerCanvas) return;

  // Set canvas size to match first frame dimensions
  const tapeImg = tapeFrames[0];
  const rollerImg = rollerFrames[0];

  tapeCanvas.width = tapeImg.naturalWidth || tapeImg.width;
  tapeCanvas.height = tapeImg.naturalHeight || tapeImg.height;
  
  rollerCanvas.width = rollerImg.naturalWidth || rollerImg.width;
  rollerCanvas.height = rollerImg.naturalHeight || rollerImg.height;

  console.log('Canvas sizes set:', { 
    tape: `${tapeCanvas.width}x${tapeCanvas.height}`,
    roller: `${rollerCanvas.width}x${rollerCanvas.height}`
  });

  const tapeCtx = tapeCanvas.getContext('2d');
  const rollerCtx = rollerCanvas.getContext('2d');

  // Only draw when NOT playing
 // Draw static frame ONLY in editor mode
if (!isPlaying && appMode === "editor") {
  tapeCtx.clearRect(0, 0, tapeCanvas.width, tapeCanvas.height);
  rollerCtx.clearRect(0, 0, rollerCanvas.width, rollerCanvas.height);

  tapeCtx.drawImage(tapeFrames[0], 0, 0);
  rollerCtx.drawImage(rollerFrames[0], 0, 0);

  tapeFrameIndex.current = 0;
  rollerFrameIndex.current = 0;
  }
}, [isIOS, tapeFrames, rollerFrames, isPlaying, appMode]);


// ✅ Draw first frame when entering preview / receiver
const isViewingMode = appMode === "preview" || appMode === "receiver";

React.useEffect(() => {
  if (!isIOS) return;
  if (!isViewingMode) return;
  if (!tapeFrames.length || !rollerFrames.length) return;

  const tapeCanvas = tapeCanvasRef.current;
  const rollerCanvas = rollerCanvasRef.current;
  if (!tapeCanvas || !rollerCanvas) return;

  const tapeImg = tapeFrames[0];
  const rollerImg = rollerFrames[0];

  // fallback in case naturalWidth is 0 for any reason
  const tw = tapeImg.naturalWidth || tapeImg.width;
  const th = tapeImg.naturalHeight || tapeImg.height;
  const rw = rollerImg.naturalWidth || rollerImg.width;
  const rh = rollerImg.naturalHeight || rollerImg.height;

  tapeCanvas.width = tw;
  tapeCanvas.height = th;
  rollerCanvas.width = rw;
  rollerCanvas.height = rh;

  const tapeCtx = tapeCanvas.getContext("2d");
  const rollerCtx = rollerCanvas.getContext("2d");

  tapeCtx.clearRect(0, 0, tw, th);
  rollerCtx.clearRect(0, 0, rw, rh);

  tapeCtx.drawImage(tapeImg, 0, 0);
  rollerCtx.drawImage(rollerImg, 0, 0);

  tapeFrameIndex.current = 0;
  rollerFrameIndex.current = 0;
}, [appMode, isIOS, tapeFrames, rollerFrames]);




// Animation loop when playing
React.useEffect(() => {
  if (!isIOS) return;
  if (tapeFrames.length === 0 || rollerFrames.length === 0) return;
  
  if (!isPlaying) {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    return;
  }

  const tapeCanvas = tapeCanvasRef.current;
  const rollerCanvas = rollerCanvasRef.current;
  if (!tapeCanvas || !rollerCanvas) return;

  const tapeCtx = tapeCanvas.getContext('2d');
  const rollerCtx = rollerCanvas.getContext('2d');

  const fps = 30;
  const frameDuration = 1000 / fps;
  let lastTime = 0;

  const animate = (timestamp) => {
    if (timestamp - lastTime >= frameDuration) {
      tapeCtx.clearRect(0, 0, tapeCanvas.width, tapeCanvas.height);
      tapeCtx.drawImage(tapeFrames[tapeFrameIndex.current], 0, 0, tapeCanvas.width, tapeCanvas.height);
      tapeFrameIndex.current = (tapeFrameIndex.current + 1) % tapeFrames.length;

      rollerCtx.clearRect(0, 0, rollerCanvas.width, rollerCanvas.height);
      rollerCtx.drawImage(rollerFrames[rollerFrameIndex.current], 0, 0, rollerCanvas.width, rollerCanvas.height);
      rollerFrameIndex.current = (rollerFrameIndex.current + 1) % rollerFrames.length;

      lastTime = timestamp;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  animationRef.current = requestAnimationFrame(animate);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [isIOS, isPlaying, tapeFrames, rollerFrames]);


// Pinch-to-zoom for label image on mobile
React.useEffect(() => {
  if (!isMobile) return;
  
  const handleTouchStart = (e) => {
    if (e.touches.length === 2 && activeObject === "label-image") {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
      
      setPinchData({
        initialDistance: distance,
        initialScale: labelImageScale,
        initialAngle: angle,
        initialRotation: labelImageRotation,
      });
    }
  };
  
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchData) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const angle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI);
      
      // Scale
      const scaleChange = distance / pinchData.initialDistance;
      const newScale = Math.max(0.4, Math.min(3, pinchData.initialScale * scaleChange));
      setLabelImageScale(newScale);
      
      // Rotation
      const rotationChange = angle - pinchData.initialAngle;
      setLabelImageRotation((pinchData.initialRotation + rotationChange) % 360);
    }
  };
  
  const handleTouchEnd = () => {
    setPinchData(null);
  };
  
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
  
  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
}, [isMobile, activeObject, pinchData, labelImageScale, labelImageRotation]);
/* ---------- CALCULATE TOTAL MIXTAPE LENGHT + SONG MARKERS ---------- */
const totalMixtapeDuration = tracks.reduce(
  (sum, t) => sum + (t.duration || 0),
  0
);

let accumulated = 0;
const songMarkers = tracks.map((t, i) => {
  const start = accumulated;
  accumulated += t.duration || 0;
  return { index: i, time: start };
});


// 🔹 offset = duration of all tracks before the current one
const currentTrackOffset = tracks
  .slice(0, currentTrackIndex)
  .reduce((sum, t) => sum + (t.duration || 0), 0);

// 🧠 if finished, force timeline to end
const mixtapeTime = mixtapeFinished
  ? totalMixtapeDuration
  : currentTrackOffset + currentTime;



/* ---------- TIME FORMATTING ---------- */
const formatTime = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* ---------- STICKERS ---------- */
const STICKERS = Array.from({ length: 20 }, (_, i) => {
  const num = String(i + 2).padStart(2, "0");
  return `/stickers/stickers-${num}.png`;
});


  const audioRef = React.useRef(new Audio());


  const dragRef = React.useRef(null);
  const tapeRef = React.useRef(null);
  const mixtapeImageRef = React.useRef(null);
  const labelTextRef = React.useRef(null);

// 🚀 OPTIMIZED: Smooth dragging for both desktop and mobile
React.useEffect(() => {
  let rafId = null;

  const onMove = (e) => {
  if (!dragRef.current) return;
  
  // Prevent page scrolling while dragging
  if (dragRef.current && e.cancelable) {
  e.preventDefault();
}
    
    // Get clientX/clientY from touch or mouse event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Cancel any pending frame and request a new one
    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      const drag = dragRef.current;
      if (!drag) return;

      const tapeRect = tapeRef.current?.getBoundingClientRect();
      if (!tapeRect) return;

      if (drag.type === 'move') {
  const deltaX = ((clientX - drag.startMouseX) / tapeRect.width) * 100;
  const deltaY = ((clientY - drag.startMouseY) / tapeRect.height) * 100;

  setStickersOnTape((prev) =>
    prev.map((s) =>
      s.id === drag.id
        ? {
            ...s,
            x: Math.max(10, Math.min(90, drag.startX + deltaX)),  // -10 to 110 = slight overflow allowed
            y: Math.max(15, Math.min(85, drag.startY + deltaY)),      // 5 to 95 = stay mostly inside vertically
          }
        : s
          )
        );

      } else if (drag.type === "move-text") {
        const containerRect = tapeRef.current.getBoundingClientRect();
        const imageRect = mixtapeImageRef.current?.getBoundingClientRect();
        const textRect = labelTextRef.current?.getBoundingClientRect();
        
        if (!imageRect || !textRect) return;

        const deltaX = ((clientX - drag.startMouseX) / containerRect.width) * 100;
        const deltaY = ((clientY - drag.startMouseY) / containerRect.height) * 100;

        const halfTextW = (textRect.width / 2 / containerRect.width) * 100;
        const halfTextH = (textRect.height / 2 / containerRect.height) * 100;

        const imageLeft = ((imageRect.left - containerRect.left) / containerRect.width) * 100;
        const imageTop = ((imageRect.top - containerRect.top) / containerRect.height) * 100;
        const imageRight = imageLeft + (imageRect.width / containerRect.width) * 100;
        const imageBottom = imageTop + (imageRect.height / containerRect.height) * 100;

        const newX = drag.startX + deltaX;
        const newY = drag.startY + deltaY;

        setLabelMessagePos({
          x: Math.max(imageLeft + halfTextW, Math.min(imageRight - halfTextW, newX)),
          y: Math.max(imageTop + halfTextH, Math.min(imageBottom - halfTextH, newY)),
        });

      } else if (drag.type === 'scale') {
        const dx = clientX - drag.startMouseX;
        const scaleChange = dx / 100;
        
        setStickersOnTape((prev) =>
          prev.map((s) =>
            s.id === drag.id
              ? { ...s, scale: Math.max(0.3, Math.min(3, drag.startScale + scaleChange)) }
              : s
          )
        );
      } else if (drag.type === 'rotate') {
        const dy = clientY - drag.startMouseY;
        
        setStickersOnTape((prev) =>
          prev.map((s) =>
            s.id === drag.id
              ? { ...s, rotation: (drag.startRotation + dy) % 360 }
              : s
          )
        );
      } else if (drag.type === "move-label") {
        const dx = ((clientX - drag.startMouseX) / tapeRect.width) * 100;
        const dy = ((clientY - drag.startMouseY) / tapeRect.height) * 100;

        setLabelImagePos({
          x: Math.max(0, Math.min(100, drag.startX + dx)),
          y: Math.max(0, Math.min(100, drag.startY + dy)),
        });
      } else if (drag.type === "scale-label") {
        const dx = clientX - drag.startMouseX;
        setLabelImageScale(
          Math.max(0.4, Math.min(3, drag.startScale + dx / 120))
        );
      } else if (drag.type === "rotate-label") {
        const dy = clientY - drag.startMouseY;
        setLabelImageRotation((drag.startRotation + dy) % 360);
      }
    });
  };

  const onUp = () => {
    if (rafId) cancelAnimationFrame(rafId);
    dragRef.current = null;
  };

  // Mouse events
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  
  // Touch events for mobile - these are more responsive
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
  };
}, []);

const [previewEntering, setPreviewEntering] = React.useState(false);
const prevPreviewRef = React.useRef(isPreviewMode);

React.useEffect(() => {
  // only animate when YOU click into preview (editor -> preview)
  if (appMode === "editor" && !prevPreviewRef.current && isPreviewMode) {
    setPreviewEntering(true);
    const t = setTimeout(() => setPreviewEntering(false), 450);
    return () => clearTimeout(t);
  }
  prevPreviewRef.current = isPreviewMode;
}, [isPreviewMode, appMode]);




const isEditable = appMode === "editor" && !isPreviewMode;

 React.useEffect(() => {
  if (!isEditable) {
    setActiveObject(null);
    dragRef.current = null;
  }
}, [isEditable]);

// Global click handler to deselect when clicking outside
React.useEffect(() => {
  const handleGlobalClick = (e) => {
    if (!isEditable) return;
    
    // Check if click is outside any selectable element
    const clickedSelectable = e.target.closest('[data-selectable]');
    if (!clickedSelectable) {
      setActiveObject(null);
    }
  };

  document.addEventListener('pointerdown', handleGlobalClick);
  return () => document.removeEventListener('pointerdown', handleGlobalClick);
}, [isEditable]);

//---------------------- AUDIO TIME STAMP ------------------------------
React.useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const updateTime = () => {
    setCurrentTime(audio.currentTime || 0);
    setTotalDuration(audio.duration || 0);
  };

  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("loadedmetadata", updateTime);

  return () => {
    audio.removeEventListener("timeupdate", updateTime);
    audio.removeEventListener("loadedmetadata", updateTime);
  };
}, []);


React.useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  // only handle mp3 tracks
  if (!current || (current.type !== "mp3" && current.type !== "audio") || !current.src) return; 

  // set src when track changes
  if (audio.src !== current.src) {
    audio.src = current.src;
    audio.load(); // Force load for iOS
    audio.currentTime = 0;
  }

  // only autoplay if user is already "playing"
  if (!isPlaying) return;

  // Small delay for iOS to ensure audio is ready
  const playTimeout = setTimeout(() => {
    audio.play().catch((err) => {
      console.warn("audio.play() blocked:", err);
    });
  }, 50);
  
  return () => clearTimeout(playTimeout);
}, [currentTrackIndex, current?.src, isPlaying]);


//------------------SHARE LINK ----------------------------------
async function generateShareLink() {
  try {
    setIsSaving(true);

const payload = {
  tracks,
  note,

  state: {
    coverColor,
    mixtapeImage,
    labelOverlay,
    uploadedLabelImage,
    siteBackground,
    glowEnabled,
    glowColor,
    isDarkBg,

    stickersOnTape,
    labelMessage,
    labelMessagePos,
    labelImagePos,
    labelImageScale,
    labelImageRotation,
    textFont,
    textSize,
    textColor,
  },

  created_at: new Date().toISOString(),
};


    const { data, error } = await supabase
      .from("Mixtapes")
      .insert([payload])
      .select("id")
      .single();

    if (error) throw error;

    const link = `${window.location.origin}/?mixtape=${data.id}`;
    setShareLink(link);

    // auto-copy (with fallback for mobile)
try {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(link);
  }
} catch (e) {
  console.log("Clipboard not available");
}
  } catch (err) {
    console.error("GENERATE LINK ERROR:", err);
  alert(err?.message || JSON.stringify(err));
  } finally {
    setIsSaving(false);
  }
}



React.useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const mixtapeId = params.get("mixtape");

  if (!mixtapeId) return;

  // 👇 IMPORTANT: lock mode BEFORE render settles
  setAppMode("receiver");
  setIsPreviewMode(true);
  setIsLoadingSharedMixtape(true);

  (async () => {
    const { data, error } = await supabase
      .from("Mixtapes")
      .select("*")
      .eq("id", mixtapeId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setTracks(data.tracks || []);
    setNote(data.note || "");
    
    const s = data.state || {};

setCoverColor(s.coverColor || "#E6CDEB");
setMixtapeImage(s.mixtapeImage || "/transnotape.png");
setLabelOverlay(s.labelOverlay || null);
setUploadedLabelImage(s.uploadedLabelImage || null);

setSiteBackground(s.siteBackground || null);
setGlowEnabled(s.glowEnabled || false);
setGlowColor(s.glowColor || "#f1aedcff");
setIsDarkBg(s.isDarkBg || false);

setStickersOnTape(s.stickersOnTape || []);
setLabelMessage(s.labelMessage || "");
setLabelMessagePos(s.labelMessagePos || { x: 50, y: 30 });
setLabelImagePos(s.labelImagePos || { x: 50, y: 50 });
setLabelImageScale(s.labelImageScale || 1);
setLabelImageRotation(s.labelImageRotation || 0);

setTextFont(s.textFont || "Chubbo");
setTextSize(s.textSize || 24);
setTextColor(s.textColor || "#000");


    setIsPreviewMode(true);
    setIsLoadingSharedMixtape(false);

    setIsReceiverReady(true);

    setIsHydrated(true);
  })();
}, []);



//----------------------------------------------------------------
React.useEffect(() => {
  if (showConfetti) {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
    });
  }
}, [showConfetti]);


React.useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "1";
  const data = params.get("data");

  if (isPreview && data) {
    try {
      const decoded = JSON.parse(
        decodeURIComponent(atob(data))
      );

      setCoverColor(decoded.coverColor);
      setMixtapeImage(decoded.mixtapeImage);
      setLabelOverlay(decoded.labelOverlay);
      setUploadedLabelImage(decoded.uploadedLabelImage);
      setLabelImageScale(decoded.labelImageScale);
      setLabelImagePos(decoded.labelImagePos);
      setLabelMessage(decoded.labelMessage);
      setLabelMessagePos(decoded.labelMessagePos);
      setTextFont(decoded.textFont);
      setTextSize(decoded.textSize);
      setTextColor(decoded.textColor);
      setStickersOnTape(decoded.stickersOnTape || []);
      setTracks(decoded.tracks || []);
      setNote(decoded.note);
      setSiteBackground(decoded.siteBackground);
      setGlowEnabled(decoded.glowEnabled);
      setGlowColor(decoded.glowColor);
      setIsDarkBg(decoded.isDarkBg);

      setIsPreviewMode(true);
    } catch (e) {
      console.error("Invalid share link", e);
    }
  }
}, []);


function ReceiverLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily: "'Hoover', sans-serif",
        fontSize: 18,
        letterSpacing: 1,
        opacity: 0.6,
      }}
    >
      Loading mixtape…
    </div>
  );
}

  /* ---------- Upload label image ---------- */
  const handleLabelUpload = (file) => {
  const imageUrl = URL.createObjectURL(file);
  setUploadedLabelImage(imageUrl);
};


  /* --------------------------------------------
     MP3 FILE UPLOAD HANDLER — PLACE IT HERE
  -------------------------------------------- */

const safeUUID = () =>
  (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const getDurationSafe = (url) =>
  new Promise((resolve) => {
    const a = new Audio();
    a.preload = "metadata";

    const done = (val) => {
      cleanup();
      resolve(val);
    };

    const cleanup = () => {
      a.onloadedmetadata = null;
      a.onerror = null;
      clearTimeout(t);
    };

    a.onloadedmetadata = () => {
      const d = Number.isFinite(a.duration) ? a.duration : 0;
      done(d);
    };

    a.onerror = () => done(0);

    const t = setTimeout(() => done(0), 4000);
    a.src = url;
  });


// isSupportedMediaFile function
const isSupportedMediaFile = (file) => {
  const name = file.name.toLowerCase();
  const allowedExt = ['.mp3', '.m4a', '.aac', '.ogg', '.webm'];
  return allowedExt.some(ext => name.endsWith(ext));
};

// MIME type fixer for Supabase upload
const getUploadMimeType = (file) => {
  const name = file.name.toLowerCase();
  
  if (name.endsWith('.mp3')) return 'audio/mpeg';
  if (name.endsWith('.m4a') || name.endsWith('.aac')) return 'audio/mp4';
  if (name.endsWith('.ogg')) return 'audio/ogg';
  if (name.endsWith('.webm')) return 'audio/webm';
  
  return 'audio/mpeg'; // fallback
};
const isPlayableAudio = (file) =>
  new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.src = url;

    const cleanup = () => URL.revokeObjectURL(url);
    
    // Timeout for slow mobile files
    const timeout = setTimeout(() => {
      cleanup();
      resolve(true); // Assume playable if it takes too long
    }, 5000);

    audio.onloadedmetadata = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(true);
    };

    audio.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve(false);
    };
  });

const handleSongFiles = async (fileList) => {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  // make sure you stay in the editor + songs tab
  setCurrentPage("home");
  setIsPreviewMode(false);
  setTab("songs");

  const remaining = MAX_TRACKS - tracks.length;
  for (const file of files.slice(0, remaining)) {
    try {
      // First check if it's a supported file type
      if (!isSupportedMediaFile(file)) {
        setErrorPopup(`Sorry, we only accept audio files: .mp3, .m4a, .aac, .ogg, .webm`);
        continue;
      }

      const playable = await isPlayableAudio(file);

      if (!playable) {
        alert(`"${file.name}" cannot be played. Try a different format.`);
        continue;
      }

      // Get the correct MIME type for Supabase
const uploadContentType = getUploadMimeType(file);

// Convert file to blob with corrected MIME type (fixes iOS voice memo issue)
const blob = new Blob([await file.arrayBuffer()], { type: uploadContentType });

const uploadFileName = `${safeUUID()}`;

const { error: uploadError } = await supabase.storage
  .from("Mixtape")
  .upload(uploadFileName, blob, {
    contentType: uploadContentType,
    cacheControl: "3600",
    upsert: false,
  });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert(`Upload failed: ${uploadError.message || "unknown error"}`);
        continue;
      }

      const { data: pub } = supabase.storage.from("Mixtape").getPublicUrl(uploadFileName);
      const audioUrl = pub?.publicUrl;

      if (!audioUrl) {
        alert("Upload succeeded but could not get public URL (bucket not public?)");
        continue;
      }

      const duration = await getDurationSafe(audioUrl);

      setTracks((prev) => [
        ...prev,
        {
          name: file.name,
          src: audioUrl,
          embedUrl: null,
          duration,
          type: "audio",
        },
      ]);
    } catch (e) {
      console.error(e);
      alert("Upload crashed. Check console.");
    }
  }

  // allow selecting the same file again later
  const input = document.getElementById("songFiles");
  if (input) input.value = "";
};

const startRecording = async () => {
  try {
    // Request microphone permission - this must happen on user gesture (button click)
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      } 
    });
    
    // Determine the best supported MIME type for this device
    let mimeType = 'audio/webm';
    let fileExtension = 'webm';
    
    // iOS Safari prefers mp4/aac
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
      fileExtension = 'm4a';
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
      fileExtension = 'webm';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
      fileExtension = 'webm';
    } else if (MediaRecorder.isTypeSupported('audio/aac')) {
      mimeType = 'audio/aac';
      fileExtension = 'aac';
    }
    
    // Store file extension for later use
    audioChunksRef.current = [];
    audioChunksRef.current.fileExtension = fileExtension;
    
    const options = { mimeType };
    
    try {
      mediaRecorderRef.current = new MediaRecorder(stream, options);
    } catch (e) {
      // Fallback: let browser choose format
      console.log('Using default MediaRecorder format');
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current.fileExtension = 'm4a'; // iOS default
    }
    
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };
    
    mediaRecorderRef.current.onstop = async () => {
      const ext = audioChunksRef.current.fileExtension || 'm4a';
      
      if (audioChunksRef.current.length === 0 || 
          (audioChunksRef.current.length === 1 && audioChunksRef.current[0].size === 0)) {
        alert('No audio recorded. Please try again.');
        stream.getTracks().forEach(track => track.stop());
        setShowVoiceRecorder(false);
        setRecordingTime(0);
        return;
      }
      
      const recordedMimeType = mediaRecorderRef.current.mimeType || mimeType;
      const audioBlob = new Blob(audioChunksRef.current.filter(c => c.size > 0), { type: recordedMimeType });
      
      const fileName = `voice-memo-${Date.now()}.${ext}`;
      const file = new File([audioBlob], fileName, { type: recordedMimeType });
      
      stream.getTracks().forEach(track => track.stop());
      
      await handleSongFiles([file]);
      
      setShowVoiceRecorder(false);
      setRecordingTime(0);
    };
    
    // Start recording - use timeslice for iOS compatibility
    mediaRecorderRef.current.start(1000); // Collect data every second
    setIsRecording(true);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(t => t + 1);
    }, 1000);
    
  } catch (err) {
    console.error("Recording error:", err);
    
    let errorMessage = "Could not start recording.";
    if (err.name === 'NotAllowedError') {
      errorMessage = "Microphone access denied. Please allow microphone access in your browser/device settings.";
    } else if (err.name === 'NotFoundError') {
      errorMessage = "No microphone found on this device.";
    } else if (err.name === 'NotReadableError') {
      errorMessage = "Microphone is being used by another app. Please close other apps and try again.";
    }
    
    alert(errorMessage);
    setShowVoiceRecorder(false);
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  }
};

const cancelRecording = () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    if (isRecording) {
      mediaRecorderRef.current.stop();
    }
  }
  setIsRecording(false);
  setShowVoiceRecorder(false);
  setRecordingTime(0);
  clearInterval(recordingIntervalRef.current);
  audioChunksRef.current = [];
};

const formatRecordingTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};


  /* ---------- CHANGE LATER? If wrong link i need an error message ---------- */
  
// Check if URL points to an MP3 file
function isMP3Url(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return pathname.endsWith('.mp3');
  } catch {
    return false;
  }
}

const addTrackByUrl = async () => {
  if (tracks.length >= MAX_TRACKS) return;

  const rawUrl = pendingUrl.trim();
  if (!rawUrl) return;

  if (!isValidUrl(rawUrl)) {
    alert("Please enter a valid URL");
    return;
  }

  // Only accept MP3 links
  if (!isMP3Url(rawUrl)) {
    alert("Sorry, I only accept direct MP3 links! The URL must end with .mp3");
    setPendingUrl("");
    return;
  }

  const duration = await getDurationSafe(rawUrl);
  const urlParts = rawUrl.split('/');
  const fileName = urlParts[urlParts.length - 1] || "MP3 Track";

  setTracks((prev) => [
    ...prev,
    {
      name: decodeURIComponent(fileName),
      src: rawUrl,
      embedUrl: null,
      duration,
      type: "audio",
    },
  ]);

  setPendingUrl("");
};
  /* ---------- Audio controls ---------- */
React.useEffect(() => {
  const audio = audioRef.current;
  
  const onEnded = () => {
    // Make sure we're actually at the end (iOS sometimes fires early)
    if (audio.currentTime < audio.duration - 0.5) {
      return; // Ignore false "ended" events
    }
    
    if (currentTrackIndex < tracks.length - 1) {
      // Go to next track
      const nextIndex = currentTrackIndex + 1;
      audio.pause();
      audio.currentTime = 0;
      setCurrentTrackIndex(nextIndex);
      
      // Small delay for iOS before playing next track
      setTimeout(() => {
        if (isPlaying) {
          audio.play().catch(e => console.log('Auto-play next failed:', e));
        }
      }, 100);
    } else {
      finishMixtape();
    }
  };
  
  audio.addEventListener("ended", onEnded);
  return () => audio.removeEventListener("ended", onEnded);
}, [currentTrackIndex, tracks.length, isPlaying]);

  const play = () => {
  if (!current || (current.type !== "mp3" && current.type !== "audio") || !current.src) return;

  const audio = audioRef.current;

  // set source if new track
  if (audio.src !== current.src) {
    audio.src = current.src;
    audio.load(); // Force load on mobile
  }

  // Mobile requires play() to be called directly from user interaction
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn("audio.play() blocked:", err);
        // Try again after a small delay
        setTimeout(() => {
          audio.play().catch(e => console.warn("Retry failed:", e));
        }, 100);
      });
  }
  
  setIsPlaying(true);
};

const pause = () => {
  audioRef.current.pause();
  setIsPlaying(false);
};

const stopPlayback = () => {
  const audio = audioRef.current;
  audio.pause();
  audio.currentTime = 0;
  setIsPlaying(false);
};

const skipToNextTrack = () => {
  playClick();
  setActiveButton("next");
  
  const audio = audioRef.current;

  // 🟢 If there IS a next track → normal skip
  if (currentTrackIndex < tracks.length - 1) {
    audio.pause();
    audio.currentTime = 0;
    setCurrentTrackIndex(i => i + 1);
    return;
  }

  // 🟣 If this is the LAST track → jump to end & finish
  if (currentTrackIndex === tracks.length - 1) {
    audio.pause();
    audio.currentTime = audio.duration || 0;

    finishMixtape(); // 🎉 confetti
  }
};


 const tapeVideoRef = React.useRef(null);
const rollerVideoRef = React.useRef(null);

React.useEffect(() => {
  const tapeVideo = tapeVideoRef.current;
  const rollerVideo = rollerVideoRef.current;
  
  // Only allow videos to play in preview/receiver mode AND when isPlaying is true
  const canPlay = (isPreviewMode || appMode === "receiver") && isPlaying;
  
  if (canPlay) {
    // Force load and play on mobile
    if (isMobile && tapeVideo) {
      tapeVideo.load();
      tapeVideo.play().catch(e => console.log('Tape video play failed:', e));
    } else {
      tapeVideo?.play();
    }
    
    if (isMobile && rollerVideo) {
      rollerVideo.load();
      rollerVideo.play().catch(e => console.log('Roller video play failed:', e));
    } else {
      rollerVideo?.play();
    }
  } else {
    tapeVideo?.pause();
    rollerVideo?.pause();
  }
}, [isPlaying, isPreviewMode, appMode, isMobile]);

// Force video load on mobile after component mounts
React.useEffect(() => {
  if (isMobile && (isPreviewMode || appMode === "receiver")) {
    setTimeout(() => {
      const tapeVideo = tapeVideoRef.current;
      const rollerVideo = rollerVideoRef.current;
      
      if (tapeVideo) {
        tapeVideo.load();
      }
      if (rollerVideo) {
        rollerVideo.load();
      }
    }, 100);
  }
}, [isMobile, isPreviewMode, appMode]);

// Also pause when exiting preview mode
React.useEffect(() => {
  if (!isPreviewMode && appMode === "editor") {
    const tapeVideo = tapeVideoRef.current;
    const rollerVideo = rollerVideoRef.current;
    const audio = audioRef.current;
    
    tapeVideo?.pause();
    rollerVideo?.pause();
    audio?.pause();
    
    setIsPlaying(false);
    setActiveButton(null);
  }
}, [isPreviewMode, appMode]);


const clickRef = React.useRef(null);

  // BUTTON CLICKS SOUND
React.useEffect(() => {
  clickRef.current = new Audio("/click.mp3");
}, []);

const playClick = () => {
  if (!clickRef.current) return;
  clickRef.current.currentTime = 0;
  clickRef.current.play();
};


const playCassette = () => {
  playClick();

  const audio = audioRef.current;

  // 🔁 If mixtape was finished → RESET EVERYTHING
  if (mixtapeFinished) {
    setMixtapeFinished(false);
    setShowConfetti(false);

    setCurrentTrackIndex(0);
    setCurrentTime(0);

    audio.pause();
    audio.currentTime = 0;

    setIsPlaying(true);
    setActiveButton("play");
    return;
  }

  // ▶ Normal play
  play();
  setActiveButton("play");
};




const pauseCassette = () => {
  playClick();
  pause(); // your existing pause()
  setActiveButton("pause");
};


const canSkipForward =
  tracks.length > 0 && !mixtapeFinished;

const nextTrack = () => {
  if (!hasNextTrack) return;

  playClick();

  const audio = audioRef.current;
  audio.pause();
  audio.currentTime = 0;

  setActiveButton("next");
  setCurrentTrackIndex(i => i + 1);
};


const rewind = () => {
  playClick();

  const audio = audioRef.current;
  const wasPlaying = isPlaying;

  // 🔁 If mixtape was finished → go to last song start
  if (mixtapeFinished) {
    setMixtapeFinished(false);
    setShowConfetti(false);

    const lastIndex = Math.max(0, tracks.length - 1);
    setCurrentTrackIndex(lastIndex);

    audio.pause();
    audio.currentTime = 0;

    if (wasPlaying) {
      setIsPlaying(true);
    }

    setActiveButton("rewind");
    return;
  }

  // ⏮ If we're more than ~2s into the song → restart current song
  if (audio.currentTime > 2) {
    audio.currentTime = 0;
    setActiveButton("rewind");
    return;
  }

  // ⏮ If near the start → go to previous song (if exists)
  if (currentTrackIndex > 0) {
    audio.pause();
    audio.currentTime = 0;

    setCurrentTrackIndex(i => i - 1);

    setActiveButton("rewind");
    return;
  }

  // ⏮ At first song & already at start → just ensure we're at 0
  audio.currentTime = 0;
  setActiveButton("rewind");
};


const fastForward = (seconds = 10) => {
   playClick();
  const audio = audioRef.current;
  audio.currentTime = Math.min(
    audio.duration || audio.currentTime,
    audio.currentTime + 10
  );
  setActiveButton("ff");
};

const finishMixtape = () => {
  stopPlayback();
  setMixtapeFinished(true);
  setShowConfetti(true);

  // auto-hide confetti after 5s (optional but nice)
  setTimeout(() => {
    setShowConfetti(false);
  }, 5000);
};

  const palette = [
    "#FF6FA9", "#AFC8C7", "#C9D3DA", "#E5A0A7", "#B7FF33",
    "#8D78C5", "#53EDFF", "#5B6B8E", "#F46C96", "#F9D76B",
  ];


if (isMobile) {
  // Show loading screen for receivers until mixtape is loaded
  if (appMode === "receiver" && !isReceiverReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "'Hoover', sans-serif",
          fontSize: 18,
          letterSpacing: 1,
          color: "#888",
        }}
      >
        Loading mixtape…
      </div>
    );
  }

  return (
    <div 
      className="mobile-shell"
      style={{
        backgroundColor: "#ffffff",
    backgroundImage: siteBackground ? `url(${siteBackground})` : "none",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    minHeight: "100dvh",
      }}
    >
    <div className="mobile-header" style={{ padding: isTablet ? "8px 40px" : undefined }}>
   <div className="mobile-header-top">
    <button
      className="mobile-header-link"
      onClick={() => setCurrentPage("home")}
      style={{
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        fontSize: isTablet ? 14 : undefined,
      }}
    >
     <a
      href="https://www.instagram.com/softparticle/"
      target="_blank"
      rel="noopener noreferrer"
    >
      @Softparticle
    </a>
    </button>

    <button
      className="mobile-header-link"
      onClick={() => {
        if (currentPage === "about") {
          setCurrentPage("home");
        } else {
          setCurrentPage("about");
        }
      }}
      style={{
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        fontSize: isTablet ? 14 : undefined,
      }}
    >
      {currentPage === "about" ? "Digital Mixtape" : "About"}
    </button>
  </div>
</div>

{/* Only show "Digital Mixtape" title on home page */}
{currentPage === "home" && (
  <div 
    className="mobile-header-title"
    onClick={() => setCurrentPage("home")}
    style={{
      color: isDarkBg ? "#fff" : "#000",
      textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
      fontSize: isTablet ? 24 : undefined,
      marginTop: isTablet ? 10 : undefined,
    }}
  >
    Digital Mixtape
  </div>
)}

  


{/* ================= MIXTAPE (NON-SCROLLING) ================= */}

{/* MIXTAPE MOBILE */}
{currentPage === "home" && (
    <div 
  className={`mobile-mixtape-area ${isPreviewMode ? "preview" : ""}`}
  style={{ overflow: "visible" }}
>
  <div className="mixtape-wrapper" style={{ 
  background: "transparent", 
  width: isTablet ? "450px" : "calc(100vw - 20px)",
  maxWidth: "500px",
  margin: "0 auto",
  transform: isTablet ? "scale(1)" : "scale(1.1)",
  transformOrigin: "center top",
  overflow: "visible",
}}>
<div
  ref={tapeRef}
  style={{
    position: "relative",
    width: "100%",
    height: "100%",
    pointerEvents: "auto",
    overflow: isPreviewMode || appMode === "receiver" ? "visible" : "visible",
  }}
>
{/* Hidden preloaded labels for instant switching */}
<div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}>
  <img src="/label1.png" alt="" />
  <img src="/label2.png" alt="" />
  <img src="/label3.png" alt="" />
  <img src="/label4.png" alt="" />
</div>

{glowEnabled && (
  <>
    {/* iOS/Safari: box-shadow glow - better positioned */}
    {(isIOS || isSafari) && (
      <div
        style={{
          position: "absolute",
          top: "19%",
          left: "15%",
          width: "74%",
          height: "62%",
          borderRadius: "10px",
          background: "transparent",
          boxShadow: `
            0 0 4px 0px ${glowColor},
            0 0 25px 0px ${glowColor},
            0 0 16px 0px ${glowColor}
          `,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    )}
    {/* Non-iOS: Original drop-shadow */}
    {!(isIOS || isSafari) && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 15px ${glowColor})`,
        }}
      >
        <img
          src={mixtapeImage}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    )}
  </>
)}


{/* TAPE LAYER */}
{isIOS ? (
  // iOS: Show static image in editor, canvas animation in preview
  isPreviewMode || appMode === "receiver" ? (
    <canvas
      ref={tapeCanvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  ) : (
    // Editor mode: just show first frame as static image
    <img
      src="/tapeframes/0001.png"
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  )
) : (
  <video
    ref={tapeVideoRef}
    loop
    preload="auto"
    muted
    playsInline
    webkit-playsinline="true"
    x5-playsinline="true"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      zIndex: 1,
      pointerEvents: "none",
    }}
  >
    <source src="/tapenew.webm" type="video/webm" />
  </video>
)}


{/* 2️⃣ Cover image (NO tape graphics) */}
<img ref={mixtapeImageRef}
  src={mixtapeImage} // pinknotape.png etc
  alt="Mixtape cover"
  style={{ zindex: 5,
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: 2,
    pointerEvents: "none",

  }}
/>



{/* ROLLER LAYER */}
{isIOS ? (
  // iOS: Show static image in editor, canvas animation in preview
  isPreviewMode || appMode === "receiver" ? (
    <canvas
      ref={rollerCanvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        zIndex: 3,
        pointerEvents: "none",
      }}
    />
  ) : (
    // Editor mode: just show first frame as static image
    <img
      src="/rollerframes/0001.png"
      alt=""
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        zIndex: 3,
        pointerEvents: "none",
      }}
    />
  )
) : (
  <video
    ref={rollerVideoRef}
    loop
    preload="auto"
    muted
    playsInline
    webkit-playsinline="true"
    x5-playsinline="true"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      zIndex: 3,
      pointerEvents: "none",
    }}
  >
    <source src="/smallrollers.webm" type="video/webm" />
  </video>
)}

{/* Label overlay (1, 2, 3, 4 buttons) */}
{labelOverlay && (
  <img
    src={labelOverlay}
    alt="Label"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      pointerEvents: "none",
      zIndex: 4,
    }}
  />
)}

{/* Uploaded image clipped to crop.png shape */}
{uploadedLabelImage && (
  <div
    data-selectable
    style={{
      position: "absolute",
      inset: 0,
      zIndex: activeObject === "label-image" ? 90 : 40,

      /* 🔒 MASK LIVES HERE (FIXED) */
      WebkitMaskImage: "url(/crop.png)",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      WebkitMaskSize: "contain",

      maskImage: "url(/crop.png)",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      maskSize: "contain",

      pointerEvents: "auto",
    }}
  >
    {/* IMAGE (MOVES INSIDE MASK) */}
    <img
      data-selectable
      src={uploadedLabelImage}
      draggable={false}
      onPointerDown={(e) => {
        if (!isEditable) return;
        e.stopPropagation();
        e.preventDefault();
        setActiveObject("label-image");
        dragRef.current = {
          type: "move-label",
          startX: labelImagePos.x,
          startY: labelImagePos.y,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
        };
      }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "140%",
        height: "140%",
        objectFit: "cover",
        transform: `
          translate(-50%, -50%)
          translate(${labelImagePos.x - 50}%, ${labelImagePos.y - 50}%)
          scale(${labelImageScale})
          rotate(${labelImageRotation}deg)
        `,
        cursor: isEditable ? "move" : "default",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    />

    {/* Pinch hint for mobile */}
    {isEditable && activeObject === "label-image" && (
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 200,
        }}
      >
        👆 Drag to move · 🤏 Pinch to scale & rotate
      </div>
    )}
  </div>
)}





{/* 3️⃣ Mixtape text overlay */}
{labelMessage && (
  <div ref={labelTextRef}
  onPointerDown={(e) => {
    if (!isEditable) return;

    e.stopPropagation();
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      type: 'move-text',
      startX: labelMessagePos.x,
      startY: labelMessagePos.y,
      startMouseX: clientX,
      startMouseY: clientY,
    };
  }}
  onTouchStart={(e) => {
    if (!isEditable) return;

    e.stopPropagation();
    
    const touch = e.touches[0];
    dragRef.current = {
      type: 'move-text',
      startX: labelMessagePos.x,
      startY: labelMessagePos.y,
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
    };
  }}
    style={{
      position: "absolute",
      top: `${labelMessagePos.y + (isPreviewMode ? 2 : 0)}%`,
      left: `${labelMessagePos.x}%`,
      transform: "translate(-50%, -50%)",
      fontFamily: textFont,
      fontSize: textSize,
      textAlign: "center",
      color: textColor,
      whiteSpace: "pre",
      wordBreak: "keep-all",
      overflowWrap: "normal",
      maxWidth: "80%",
      overflow: "visible",
      lineHeight: "1.3",
      cursor: isEditable ? "move": "default",
      userSelect: "none",
      pointerEvents: "auto",
      zIndex: 4,
      zIndex: 60,
      willChange: "transform",
      backfaceVisibility: "hidden",
    }}
  >
    {labelMessage}
  </div>
)}


{stickersOnTape.map((s) => (
  <div
    key={s.id}
    onPointerDown={(e) => {
      if (!isEditable) return;
      e.stopPropagation();
      setActiveObject(s.id);
    }}
    style={{
      position: "absolute",
      left: `${s.x}%`,
      top: `${s.y}%`,
      transform: "translate(-50%, -50%)",
      zIndex: activeObject === s.id ? 100 : 50,
      pointerEvents: "auto",
    }}
  >

    <div
      style={{
        transform: `scale(${s.scale}) rotate(${s.rotation}deg)`,
        transformOrigin: "center",
        position: "relative",
      }}
    >
      {/* Selection box and controls */}
      {isEditable && activeObject === s.id && (
        <>
          {/* Bounding box */}
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              right: 3,
              bottom: 3,
              border: "1px solid #3b82f6",
              background: "rgba(59, 130, 246, 0.05)",
              pointerEvents: "none",
            }}
          />

          {/* Corner anchors - positioned relative to the 80px image */}
          <div style={{ position: "absolute", width: "8%", minWidth: 6, height: "8%", minHeight: 6, background: "#fff", border: "1px solid #3b82f6", left: 3, top: 3, transform: "translate(-50%, -50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "8%", minWidth: 6, height: "8%", minHeight: 6, background: "#fff", border: "1px solid #3b82f6", right: 3, top: 3, transform: "translate(50%, -50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "8%", minWidth: 6, height: "8%", minHeight: 6, background: "#fff", border: "1px solid #3b82f6", left: 3, bottom: 3, transform: "translate(-50%, 50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "8%", minWidth: 6, height: "8%", minHeight: 6, background: "#fff", border: "1px solid #3b82f6", right: 3, bottom: 3, transform: "translate(50%, 50%)", pointerEvents: "none" }} />

          {/* Scale control (right arrow) */}
          <div
            onPointerDown={(e) => {
              if (!isEditable) return;
              e.stopPropagation();
              e.preventDefault();
              dragRef.current = {
                id: s.id,
                type: 'scale',
                startScale: s.scale,
                startMouseX: e.clientX,
              };
            }}
            style={{
              position: "absolute",
              right: -28,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: isEditable ? "ew-resize": "default",
              padding: "3px 8px",
              color: "#202020ff",
              fontSize: 19,
              fontWeight: 800,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
           <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M9.5 13.09l1.41 1.41-4.5 4.5H10v2H3v-7h2v3.59l4.5-4.5zm1.41-3.59L9.5 10.91 5 6.41V10H3V3h7v2H6.41l4.5 4.5zm3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5 1.41-1.41zM14.5 10.91l-1.41-1.41 4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5z"/>
</svg>
          </div>

          {/* Rotate control (top arrow) */}
          <div
            onPointerDown={(e) => {
              if (!isEditable) return;
              e.stopPropagation();
              e.preventDefault();
              dragRef.current = {
                id: s.id,
                type: 'rotate',
                startRotation: s.rotation,
                startMouseY: e.clientY,
              };
            }}
            style={{
              position: "absolute",
              left: "-5%",
              top: "-30%",
              transform: "translateX(-50%) rotate(-220deg)",
              cursor: isEditable ? "grab": "default",
              padding: "3px 8px",
              color: "#202020ff",
              fontSize: 18,
              fontWeight: 700,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
</svg>
          </div>

          {/* Delete button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setStickersOnTape(prev => prev.filter(st => st.id !== s.id));
              setActiveObject(null);
            }}
            style={{
              position: "absolute",
              right: -20,
              top: -20,
              cursor: isEditable ? "pointer": "default",
              width: 19,
              height: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ef4444",
              borderRadius: 6,
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            ×
          </div>
        </>
      )}

      {/* Sticker image */}
<img
  onPointerDown={(e) => {
    if (!isEditable) return;

    e.stopPropagation();
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setActiveObject(s.id);
    dragRef.current = {
      id: s.id,
      type: "move",
      startX: s.x,
      startY: s.y,
      startMouseX: clientX,
      startMouseY: clientY,
    };
  }}
  onTouchStart={(e) => {
    if (!isEditable) return;

    e.stopPropagation();
    
    const touch = e.touches[0];
    setActiveObject(s.id);
    dragRef.current = {
      id: s.id,
      type: "move",
      startX: s.x,
      startY: s.y,
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
    };
  }}


        src={s.src}
        alt=""
        draggable={false}
        style={{
          width: "20vw",
          right: "-35%",
          top: "-30%",
          height: "auto",
          display: "block",
          cursor: activeObject === s.id ? "move" : "pointer",
          userSelect: "none",
          pointerEvents: "auto",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      />

      
    </div>
  
  </div>

))}
</div>

</div>

 </div> 
)}

{/* ---------- PREVIEW NOTE (between mixtape and scroll) ---------- */}
{isPreviewMode && note && (
  <div 
    style={{
      margin: "-10px auto 6px",
      padding: "8px 12px",
      width: "65%",
      maxWidth: 260,
      boxSizing: "border-box",
      textAlign: "center",
      fontFamily: "'Hoover', sans serif",
      fontSize: 11,
      lineHeight: 1.4,
      color: isDarkBg ? "#fff" : "#000",
      border: `1px dashed ${isDarkBg ? "#fff" : "#000"}`,
      borderRadius: 8,
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
      background: "transparent",
    }}
  >
    {note}
  </div>
)}


{/* ================= PLAYER CONTROLS (RIGHT UNDER NOTE) ================= */}
{currentPage === "home" && isPreviewMode && isMP3 && (
  <div style={{ padding: "10px 0 20px", marginTop: -25 }}>
    {/* Timeline */}
    <div
      style={{
        width: "85%",
        maxWidth: 340,
        margin: "0 auto 12px",
        fontFamily: "'Hoover', sans serif",
        color: isDarkBg ? "#fff" : "#000",
      }}
    >
      {/* Time stamps */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          marginBottom: 4,
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(totalMixtapeDuration)}</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          height: 6,
          borderRadius: 3,
          background: isDarkBg ? "#444" : "#ddd",
          overflow: "hidden",
        }}
      >
        {/* Filled */}
        <div
          style={{
            height: "100%",
            width: `${(mixtapeTime / totalMixtapeDuration) * 100 || 0}%`,
            background: isDarkBg ? "#9ae6b4" : "#3a2d3f",
            transition: "width 100ms linear",
          }}
        />

        {/* Song markers */}
        {songMarkers.map((m, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(m.time / totalMixtapeDuration) * 100}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: isDarkBg ? "#aaa" : "#666",
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>

    {/* Player buttons */}
<div
  style={{
    display: "flex",
    gap: 8,
    justifyContent: "center",
    width: "85%",
    maxWidth: 340,
    margin: "0 auto",
  }}
>
  <button
    onClick={rewind}
    style={{
      flex: 1,
      height: 40,
      borderRadius: 6,
      border: "1px solid #8a8a8a",
      background: activeButton === "rewind" ? "#8e8e8e" : "#cfcfcf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
    </svg>
  </button>
  <button
    onClick={pauseCassette}
    style={{
      flex: 1,
      height: 40,
      borderRadius: 6,
      border: "1px solid #8a8a8a",
      background: activeButton === "pause" ? "#8e8e8e" : "#cfcfcf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  </button>
  <button
    onClick={playCassette}
    style={{
      flex: 1,
      height: 40,
      borderRadius: 6,
      border: "1px solid #8a8a8a",
      background: activeButton === "play" ? "#8e8e8e" : "#cfcfcf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M8 5v14l11-7z"/>
    </svg>
  </button>
  <button
    onClick={fastForward}
    style={{
      flex: 1,
      height: 40,
      borderRadius: 6,
      border: "1px solid #8a8a8a",
      background: activeButton === "ff" ? "#8e8e8e" : "#cfcfcf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
    </svg>
  </button>
  <button
    onClick={skipToNextTrack}
    disabled={!canSkipForward}
    style={{
      flex: 1,
      height: 40,
      borderRadius: 6,
      border: "1px solid #8a8a8a",
      background: !canSkipForward ? "#d6d6d6" : activeButton === "next" ? "#8e8e8e" : "#cfcfcf",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: !canSkipForward ? "not-allowed" : "pointer",
      opacity: !canSkipForward ? 0.5 : 1,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill={!canSkipForward ? "#999" : "#fff"}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
  </button>
</div>
{/* Congratulations message */}
{mixtapeFinished && (
  <div
    style={{
      marginTop: 10,
      marginBottom: 10,
      padding: "16px 20px",
      textAlign: "center",
      fontFamily: "'Hoover', sans-serif",
      fontSize: 15,
      fontWeight: 700,
      color: isDarkBg ? "#fff" : "#000",
      textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
      lineHeight: 1.6,
      position: "relative",
      zIndex: 10,
      borderRadius: 12,
      maxWidth: 280,
      marginLeft: "auto",
      marginRight: "auto",
    }}
  >
    🎉 Congratulations!
    <br />
    You finished the mixtape!
  </div>
)}
 {/* Back button (editor only) */}
    {appMode === "editor" && (
       <div style={{ textAlign: "center", marginTop: mixtapeFinished ? 0 : 40, paddingTop: mixtapeFinished ? 0 : 0 }}>
        <button
          onClick={() => {
            setIsPreviewMode(false);
            setMixtapeFinished(false);
            setShowConfetti(false);
          }}
          style={{
            padding: "10px 24px",
            background: "transparent",
            border: `1px solid ${isDarkBg ? "#fff" : "#565656"}`,
            borderRadius: 20,
            fontFamily: "'Hoover', sans serif",
            fontSize: 13,
            fontWeight: 500,
            color: isDarkBg ? "#fff" : "#000",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        </div>
        )}
      
      </div>
      
)}

  {/* ================= SCROLL AREA (ONLY THIS SCROLLS) ================= */}
  {currentPage === "home" && (
  <div className="mobile-scroll" style={{  }}>
   {/* ---------- EDITOR ---------- */}
{appMode === "editor" && !isPreviewMode && (
  <div className="mobile-editor">
  <div className="mobile-card">
    {/* LEFT PANEL */}
{!isPreviewMode && !isLoadingSharedMixtape && (
<div style={styles.leftColumn} className="left-column">
        <div style={styles.tabs}>
    <Tab label="Add Songs" active={tab === "songs"} onClick={() => setTab("songs")} />
    <Tab label="Decorate" active={tab === "decorate"} onClick={() => setTab("decorate")} />
    <Tab label="Cover" active={tab === "preview"} onClick={() => setTab("preview")} />
</div>
        <div style={{ ...styles.card, borderRadius: "0 20px 20px 20px" }}>
          <div style={styles.panel}>

         {/* SONGS TAB */}
{tab === "songs" && (
  <div>
     <label style={{ ...styles.label, marginTop: 8 }}>Upload Music</label>
<p style={styles.helperText}>
      Add MP3 files or record a voice message 
      <br />
      (Max 8 MB per track)
    </p>
    {/* Upload dropzone */}
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => document.getElementById("songFilesMobile").click()}
        style={styles.dropzone}
      >
        Click to upload audio files
        <input
          id="songFilesMobile"
          type="file"
          accept=".mp3,.m4a,.aac,.ogg,.webm"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleSongFiles(e.target.files)}
        />
      </div>
    </div>

  
{/* Voice Recorder Button */}
<button
  onClick={() => {

    // Check if max tracks reached
    if (tracks.length >= MAX_TRACKS) {
      alert("Maximum of 5 tracks reached!");
      return;
    }

    // Stop all media first - iOS only allows one media stream at a time
    const tapeVideo = tapeVideoRef.current;
    const rollerVideo = rollerVideoRef.current;
    const audio = audioRef.current;
    
    if (tapeVideo) tapeVideo.pause();
    if (rollerVideo) rollerVideo.pause();
    if (audio) audio.pause();
    setIsPlaying(false);
    
    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      alert("Voice recording is not supported on this browser. Please use Chrome, Safari, or Firefox.");
      return;
    }
    
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Voice recording is not supported on this device/browser.");
      return;
    }
    
    // Just show the modal - let startRecording handle the permission request
    // This is important for iOS which has strict requirements about user gesture timing
    setShowVoiceRecorder(true);
  }}
  style={{
    marginBottom: 20,
    width: "100%",
    padding: "14px 16px",
    background: "#f6f6fa",
    border: "1px solid #e4e4e7",
    borderRadius: 14,
    fontFamily: "'Hoover', 'sans serif'",
    fontSize: 14,
    fontWeight: 600,
    color: "#444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }}
>
  🎙️ Record Voice Memo
</button>


    {/* Track list */}
    <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
      {tracks.length >= MAX_TRACKS && (
        <p style={{ fontSize: 12, color: "#d62424", marginTop: -8 }}>
          MAXIMUM OF 5 SONGS
        </p>
      )}
      {tracks.map((t, i) => (
        <div key={i} style={styles.trackRow}>
          <div style={styles.trackBadge}>{i + 1}</div>
          <div style={styles.trackName}>{t.name}</div>
          <button
            title="Remove"
            onClick={() =>
              setTracks((arr) => arr.filter((_, idx) => idx !== i))
            }
            style={styles.trash}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
      <button style={styles.cta} onClick={() => setTab("decorate")}>
        Next →
      </button>
    </div>
  </div>
)}

            {/* DECORATE TAB */}
            {tab === "decorate" && (
              <div>
                <label style={{ ...styles.label, marginTop: 8 }}>Mixtape Color</label>
<div style={{ 
  display: "grid", 
  gridTemplateColumns: "repeat(5, 1fr)", 
  gap: 8,
  marginBottom: 10,
}}>
  {[
    { color: "#FF6FA9", image: "/pinkntape.png" },
    { color: "#B7FF33", image: "/greennotape.png" },
    { color: "#C9D3DA", image: "/transnotape.png" },
    { color: "#FFFFFF", image: "/whitenotape.png" },
    { color: "#3F3F3F", image: "/blacknotape1.png" },
    { color: "#AF96E6", image: "/purplenotape1.png" },
    { color: "#86E3FD", image: "/bluenotape.png" },
  ].map((item, i) => (
    <button
      key={i}
      onClick={() => {
        setCoverColor(item.color);
        setMixtapeImage(item.image);
      }}
      style={{
        aspectRatio: "1",
        width: "100%",
        borderRadius: 10,
        border: coverColor === item.color ? "2px solid #3a2d3f" : "2px solid #e4e4e7",
        background: item.color,
        cursor: "pointer",
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  ))}
</div>

                <label style={{ ...styles.label, marginTop: 18 }}>Label</label>

{/* ─────────────────────────────
    LABEL BUTTONS ROW
   ───────────────────────────── */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    maxWidth: "100%",
  }}
>
  {/* 1 */}
  <button
    onClick={() => setLabelOverlay("/label1.png")}
    style={styles.labelButton}
  >
    1
  </button>

  {/* 2 */}
  <button
    onClick={() => setLabelOverlay("/label2.png")
  }
    style={styles.labelButton}
  >
    2
  </button>

  {/* 3 */}
  <button
    onClick={() =>
     setLabelOverlay("/label3.png")
  }
    style={styles.labelButton}
  >
    3
  </button>

  {/* 4 */}
  <button
    onClick={() =>
   setLabelOverlay("/label4.png")
  }
    style={styles.labelButton}
  >
    4
  </button>

  {/* X */}
  <button
    onClick={() => {
      setLabelOverlay(null);
      setUploadedLabelImage(null);
      setLabelImageScale(1);
      setLabelImagePos({ x: 50, y: 50 });
    }}
    style={styles.labelButton}
  >
    ✕
  </button>
</div>

{/* ─────────────────────────────
    UPLOAD IMAGE ROW
   ───────────────────────────── */}
<div style={{ marginTop: 10 }}>
  <label
    style={{
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      background: "#f6f6fa",
      border: "1px solid #e4e4e7",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      color: "#444",
    }}
  >
    Upload Image
    <input
      type="file"
      accept="image/png, image/jpeg"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) handleLabelUpload(f);
      }}
      style={{ display: "none" }}
    />
  </label>
</div>





               <label style={styles.label}>Font</label>

                 <div style={{ display: "flex", flexWrap: "wrap", gap: 10, width: "100%" }}>
  <select
    value={textFont}
    onChange={(e) => setTextFont(e.target.value)}
    style={{ ...styles.select, flex: "1 1 100px", minWidth: 0 }}
  >
    {FONT_OPTIONS.map(f => (
      <option key={f.value} value={f.value}>
        {f.label}
      </option>
    ))}
  </select>

  <select
    value={textSize}
    onChange={(e) => setTextSize(Number(e.target.value))}
    style={{ ...styles.select, flex: "0 1 70px", minWidth: 60 }}
  >
    {[20, 24, 32, 36, 40].map(size => (
      <option key={size} value={size}>{size}px</option>
    ))}
  </select>

  <label
    style={{
      width: 36,
      height: 36,
      flexShrink: 0,
      borderRadius: 10,
      border: "1px solid #e4e4e7",
      background: "linear-gradient(135deg, #ff6b9d 0%, #ffa726 25%, #c4e86b 50%, #64d8cb 75%, #ba8fdb 100%)",
      cursor: isEditable ? "pointer" : "default",
      position: "relative",
      display: "block",
    }}
  >
    <input
      type="color"
      value={textColor}
      onChange={(e) => setTextColor(e.target.value)}
      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
    />
  </label>
</div>


                <label style={styles.label}>Mixtape Message</label>

<div style={{ position: "relative" }}>
  <textarea
    style={styles.messageTextarea}
    placeholder="Type a message..."
    value={labelMessage}
    maxLength={90}              // ← adjust if you want
    rows={3}                    // ← 3 rows max visually
    onChange={(e) => setLabelMessage(e.target.value)}
  />

  {/* character counter */}
  <div
    style={{
      position: "absolute",
      bottom: 6,
      right: 10,
      fontSize: 11,
      color: "#aaa",
      pointerEvents: "none",
    }}
  >
    {labelMessage.length}/90
  </div>
</div>

  {/*STICKERS */}
<label style={styles.label}>Stickers</label>

<div style={styles.stickerPanel}>
  {STICKERS.map((src, i) => (
    <img
      key={i}
      src={src}
      alt=""
      style={styles.stickerThumb}
      onClick={() =>
  setStickersOnTape((prev) => [
    ...prev,
    {
      id: Date.now() + Math.random(),
      src,
      x: 27,
      y: 35,
      scale: 0.9,
      rotation: 0,
    },
  ])
}

    />
  ))}
</div>


                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    style={{ ...styles.cta, background: "#fff", color: "#222", border: "1px solid #ddd" }}
                    onClick={() => setTab("songs")}
                  >
                    ← Back
                  </button>
                  <button style={styles.cta} onClick={() => setTab("preview")}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* COVER TAB */}
            {tab === "preview" && (
              <div>
                <label style={{ ...styles.label, marginTop: 18 }}>Tracks</label>

                {tracks.length === 0 && <div style={{ color: "#777" }}>No tracks yet.</div>}

                {tracks.map((t, i) => (
                  <div key={i} style={styles.trackRow}>
                    <div style={styles.trackBadge}>{i + 1}.</div>
                    <div style={styles.trackName}>{t.name}</div>
                    <button
                      style={styles.trash}
                      onClick={() => setTracks((arr) => arr.filter((_, idx) => idx !== i))}
                    >
                     <svg
                         width="14"
                         height="14"
                         viewBox="0 0 24 24"
                          fill="none"
                           stroke="currentColor"
                           strokeWidth="3"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           >
                         <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                  </div>
                ))}

                <label style={{ ...styles.label, marginTop: 18 }}>Choose a Background</label>

<div style={{ 
  display: "grid", 
  gridTemplateColumns: "repeat(5, 1fr)", 
  gap: 8,
  marginBottom: 10,
}}>
  {[
    { bg: "#FF6FA9", img: "/bgpink.jpg", dark: false },
    { bg: "#B7FF33", img: "/bggreen2.jpg", dark: false },
    { bg: "#C9D3DA", img: "/bggray.jpg", dark: false },
    { bg: "#FFFFFF", img: "/bgwhite.jpg", dark: false },
    { bg: "#000000", img: "/bgblack.jpg", dark: true },
    { bg: "#AF96E6", img: "/bgpurple.jpg", dark: false },
    { bg: "#86E3FD", img: "/bgblu.jpg", dark: false },
  ].map((item, i) => (
    <button
      key={i}
      onClick={() => {
        setSiteBackground(item.img);
        setIsDarkBg(item.dark);
      }}
      style={{
        aspectRatio: "1",
        width: "100%",
        borderRadius: 10,
        border: siteBackground === item.img ? "2px solid #3a2d3f" : "1px solid #ccc",
        background: item.bg,
        cursor: "pointer",
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  ))}
</div>

<label style={{ ...styles.label, marginTop: 18 }}>Glow</label>

<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
  <button
    onClick={() => { setGlowEnabled(true); console.log("Glow ON"); }}
    style={{
      padding: "10px 14px",
      background: glowEnabled ? "#3a2d3f" : "#ddd",
      color: glowEnabled ? "#fff" : "#000",
      borderRadius: 10,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    On
  </button>

  <button
    onClick={() => { setGlowEnabled(false); console.log("Glow OFF"); }}
    style={{
      padding: "10px 14px",
      background: !glowEnabled ? "#3a2d3f" : "#ddd",
      color: !glowEnabled ? "#fff" : "#000",
      borderRadius: 10,
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Off
  </button>

  <label
    style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "linear-gradient(135deg, #ff6b9d 0%, #ffa726 25%, #c4e86b 50%, #64d8cb 75%, #ba8fdb 100%)",
      cursor: "pointer",
    }}
  >
    <input
      type="color"
      value={glowColor}
      onChange={(e) => setGlowColor(e.target.value)}
      style={{ opacity: 0, width: "100%", height: "100%" }}
    />
  </label>
</div>


<label style={{ ...styles.label, marginTop: 18 }}>
  Share link
</label>

<p style={{ fontSize: 13, color: "#777", marginBottom: 6 }}>
  Send this link to share your mixtape
</p>

<div style={{ display: "flex", gap: 10 }}>
  <input
    type="text"
    value={shareLink}
    readOnly
    placeholder="Generate a link to share…"
    style={{
      ...styles.input,
      fontFamily: "'Hoover', sans serif",
      fontSize: 13,
      color: "#555",
      cursor: "text",
    }}
    onClick={(e) => e.target.select()}
  />

  <button
  disabled={isSaving}
  onClick={generateShareLink}
  style={{
    padding: "10px 16px",
    background: shareLink ? "#3a2d3f" : "transparent",
    color: shareLink ? "#fff" : "#3a2d3f",
    border: "1px solid #3a2d3f",
    borderRadius: 10,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: isSaving ? "not-allowed" : "pointer",
    opacity: isSaving ? 0.6 : 1,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  }}
>
  {isSaving ? "Saving…" : shareLink ? "✓ Copy" : "Generate"}
</button>
</div>


                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <button
                      style={{ ...styles.cta, background: "#fff", color: "#222", border: "1px solid #ddd" }}
                      onClick={() => setTab("songs")}
                   >
                    ← Back
                    </button>
                  </div>

                  {tracks.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -43
                   }}>
                    <button 
                    style={styles.cta} 
                    onClick={() => {
                      setCurrentTrackIndex(0); 
                      setIsPreviewMode(true);
                    
                    }}
                  >
                    Start preview →
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div> 
  </div>   
)}


   {/* ---------- FOOTER ---------- */}
   
   {(isPreviewMode || appMode === "editor") && (
  <div 
    className={`mobile-footer ${isPreviewMode ? "preview" : "editor"}`}
    style={{ marginTop: isPreviewMode ? 50: 30 }}
  >
  <div className="mobile-footer-line">
    Created by{" "}
    <a
      href="https://www.instagram.com/softparticle/"
      target="_blank"
      rel="noopener noreferrer"
    >
      @softparticle
    </a>
  </div>

  <div className="mobile-footer-line">
    Copyright © 2025 Softparticle
  </div>

  <div className="mobile-footer-legal">
    <button onClick={() => setCurrentPage("terms")}>Terms of Use</button>
    <span>·</span>
    <button onClick={() => setCurrentPage("privacy")}>Privacy Policy</button>
  </div>
</div>

)}

  </div>
)} {/* ✅ END mobile-scroll */}


{/* Voice Recorder Modal - Mobile */}
{showVoiceRecorder && isMobile && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      height: "100dvh",
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      WebkitTransform: "translate3d(0,0,0)",
      transform: "translate3d(0,0,0)",
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        cancelRecording();
      }
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "30px 25px",
        textAlign: "center",
        width: "85%",
        maxWidth: 300,
        fontFamily: "'Hoover', sans serif",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        position: "relative",
        WebkitTransform: "translate3d(0,0,0)",
        transform: "translate3d(0,0,0)",
      }}
    >
      <div style={{ 
        fontSize: 28, 
        marginBottom: 15,
      }}>
        🎙️
      </div>
      
      <h3 style={{ 
        margin: "0 0 20px", 
        color: "#000", 
        fontSize: 18,
        fontWeight: 700,
      }}>
        Voice Recorder
      </h3>
      
      <div
        style={{
          fontSize: 42,
          fontFamily: "'Hoover', sans serif",
          color: isRecording ? "#ff69b4" : "#1a1a1a",
          marginBottom: 20,
          fontWeight: 700,
        }}
      >
        {formatRecordingTime(recordingTime)}
      </div>
      
      {isRecording && (
        <div
          style={{
            width: 12,
            height: 12,
            background: "#ff69b4",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
      
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: 10,
      }}>
        {!isRecording ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startRecording();
            }}
            style={{
              padding: "16px 20px",
              background: "#ff69b4",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Hoover', sans serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopRecording();
            }}
            style={{
              padding: "16px 20px",
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Hoover', sans serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Stop & Save
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelRecording();
          }}
          style={{
            padding: "16px 20px",
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
            fontFamily: "'Hoover', sans serif",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

 {/* ================= LEGAL PAGES (SEPARATE SCROLL) ================= */}
{currentPage === "terms" && (
  <div className="mobile-scroll">
    <div className="mobile-legal">
      
      <h2>Terms of Use</h2>
      
      <h3>1. About Digital Mixtape</h3>
      <p>
        Digital Mixtape is a tool for creating and sharing music as virtual gifts through customizing cassette tapes.
      </p>
      
      <h3>2. User Content & Ownership</h3>
      <p>
        All content added by users remains the property of its respective owners. Digital Mixtape does not claim ownership of user content.
      </p>
      <p>
        By using the service, you confirm that you own the rights to the content you upload or have permission to use it.
      </p>
      
      <h3>3. Copyright Responsibility</h3>
      <p>
        Users are responsible for ensuring their content does not infringe on copyright or other rights.
      </p>
      <p>
        We encourage the use of original or royalty-free music. Digital Mixtape does not sell or monetize uploaded music.
      </p>
      
      <h3>4. Content Removal & Contact</h3>
      <p>
        We may remove content that violates these Terms or applicable laws.
      </p>
      <p>
        If you believe your copyrighted work has been used improperly, please contact us.
      </p>
      
      <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}

{currentPage === "privacy" && (
  <div className="mobile-scroll">
    <div className="mobile-legal">
      <h2>Privacy Policy</h2>
      
      <p>We respect your privacy.</p>
      
      <p>
        The only data we store is user-generated content, including uploaded audio files, music links, images, and mixtape configuration data.
      </p>
      
      <p>
        This data is used solely to provide the Digital Mixtape service.
      </p>
      
      <p>
        We do not sell or share user data.<br />
        Content is stored securely using third-party infrastructure providers for hosting and storage.
      </p>
      
      <p>
        Users may request deletion of their content at any time by contacting us.
      </p>
      
      <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}
  {/* ================= ABOUT MOBILE ================= */}
{currentPage === "about" && (
  <div className="mobile-scroll">
    <div className="mobile-about">
      <h2>About</h2>
      
      <div className="mobile-about-image">
  <img 
    src="/me2.png" 
    alt="Maria"
    style={{
      width: 150,
      height: 150,
      objectFit: "cover",
    }}
  />
</div>
      
      <div className="mobile-about-text">
        <p>
          Hello! I'm Maria, an interaction designer who builds experimental human-computer driven experiences.
        </p>
        
        <p>
          I created this website with a wish to make the internet a more fun and magical place, through sharing personal, intentional and special music, like the times of cassette tapes! 
          
        </p>
        
        
        <p>
          If you're interested in my journey of exploring creative technology, find me at{" "}
          <a 
            href="https://instagram.com/softparticle" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: "#ff69b4", textDecoration: "none" }}
          >
            @softparticle
          </a>
        </p>
        
        <p>
          I hope you have fun making mixtapes &lt;3
      
        </p>
      </div>
    
    <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}


      </div>
  );

}
/* 👇 DESKTOP LAYOUT (UNCHANGED) */
    return (
  <div
    style={{
      ...styles.page,
      background: siteBackground
        ? `url(${siteBackground}) center / cover no-repeat fixed`
        : "#ffffff",
    }}
  >
    {appMode === "receiver" && !isReceiverReady ? (
      <ReceiverLoading />
    ) : (
      <>
      <div style={{ flex: 1 }}>
{/* ================= DESKTOP HEADER (MATCH MOBILE) ================= */}
<div
  className="desktop-header"
  style={{
    width: "100%",
    margin: "0 auto",
    padding: "8px 0 0",
  }}
>
  {/* top row */}
  <div
    className="desktop-header-top"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%", 
      maxWidth: "none", 
      margin: "0 auto",
      padding: "0 10px",
    }}
  >
    <button
      onClick={() => setCurrentPage("home")}
      style={{
        background: "none",
        border: "none",
        fontFamily: "'Hoover', sans-serif",
        fontSize: isTablet ? 14 : 14,
        fontWeight: 600,
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      @Softparticle
    </button>

    <button
      onClick={() => {
        if (currentPage === "about") setCurrentPage("home");
        else setCurrentPage("about");
      }}
      style={{
        background: "none",
        border: "none",
        fontFamily: "'Hoover', sans-serif",
        fontSize: isTablet ? 14 : 14,
        fontWeight: 600,
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {currentPage === "about" ? "Digital Mixtape" : "About"}
    </button>
  </div>

 <div className="center-column-desktop">

  {/* title under (home only) */}
  {currentPage === "home" && (
    <div
      onClick={() => setCurrentPage("home")}
      style={{
    marginTop: 15,
    marginBottom: isTablet ? 20 : -5,
    textAlign: "center",
    fontFamily: "'Array', sans-serif",
    fontSize: "40px",
    letterSpacing: "0.03em",
    color: isDarkBg ? "#fff" : "#000",
    textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
    cursor: "pointer",
    userSelect: "none",
    paddingLeft: isTablet ? 100 : 0,
    visibility: currentPage === "home" ? "visible" : "hidden",
  }}
    >
      Digital Mixtape
    </div>
  )}
</div>


{currentPage === "home" && (
  <div style={{ width: "85%", display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}> 
  <div
  style={{
    ...styles.main,
    gridTemplateColumns: isPreviewMode || appMode === "receiver"
      ? "1fr"
      : isTablet
        ? "minmax(200px, 320px) minmax(350px, 500px)"
        : "minmax(220px, 380px) minmax(400px, 600px)",
    width: isTablet ? "95%" : "min(1500px, 80vw)",
    padding: isTablet ? "0 15px" : 0,
    boxSizing: "border-box",
    justifyContent: "flex-start",
    justifyItems: "center",
    alignSelf: "flex-start",
    marginLeft: "auto",
    marginRight: "auto",
    gap: isTablet ? 40 : 70,
  }}
  className={isPreviewMode ? "preview-mode" : ""}
>

      {isPreviewMode && appMode === "editor" && (
  <button
    className="exit-preview"
    onClick={() => {
      setIsPreviewMode(false);
      setMixtapeFinished(false);
      setShowConfetti(false);
    }}
  >
    ← Back
  </button>
)}


      
        
        {/* LEFT PANEL */}
{!isPreviewMode && !isLoadingSharedMixtape && (
<div style={styles.leftColumn} className="left-column">
        <div style={styles.tabs}>
    <Tab label="Add Songs" active={tab === "songs"} onClick={() => setTab("songs")} />
    <Tab label="Decorate" active={tab === "decorate"} onClick={() => setTab("decorate")} />
    <Tab label="Cover" active={tab === "preview"} onClick={() => setTab("preview")} />

</div>
        <div style={{ ...styles.card, borderRadius: "0 20px 20px 20px" }}>
          <div style={styles.panel}>
    {/* SONGS TAB */}
{tab === "songs" && (
  <div>
    <h3 style={styles.h3}>Upload Music</h3>
    <p style={styles.helperText}>
      Add MP3 files or record a voice message 
      <br />
      (Max 8 MB per track)
    </p>

    <div style={{ marginTop: 10 }}>
  <div
    onClick={() => document.getElementById("songFiles").click()}
    style={styles.dropzone}
  >
    Click to upload audio files
    <input
      id="songFiles"
      type="file"
      accept=".mp3,.m4a,.aac,.ogg,.webm"
      multiple
      style={{ display: "none" }}
      onChange={(e) => handleSongFiles(e.target.files)}
    />
  </div>
  
  {/* Voice Recorder Button */}
  <button
    onClick={() => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setShowVoiceRecorder(true);
      } else {
        alert("Voice recording is not supported on this device/browser.");
      }
    }}
    style={{
      marginTop: 25,
      width: "100%",
      padding: "14px 16px",
      background: "#f6f6fa",
      border: "1px solid #e4e4e7",
      borderRadius: 14,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "'Hoover', sans serif",
      color: "#444",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}
  >
     Record Voice Message
  </button>
</div>

                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                  {tracks.length >= MAX_TRACKS && (
                       <p style={{ fontSize: 12, color: "#d62424ff", marginTop: -8 }}>
                         MAXIMUM OF 5 SONGS
                         </p>
                        )}
                  {tracks.map((t, i) => (
                    <div key={i} style={styles.trackRow}>
                      <div style={styles.trackBadge}>{i + 1}</div>
                      <div style={styles.trackName}>{t.name}</div>
                      <button
                        title="Remove"
                         onClick={() =>
                           setTracks((arr) => arr.filter((_, idx) => idx !== i))
                         }
                         style={styles.trash}
                        >
                         <svg
                         width="14"
                         height="14"
                         viewBox="0 0 24 24"
                          fill="none"
                           stroke="currentColor"
                           strokeWidth="3"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           >
                         <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        </button>

                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <button style={styles.cta} onClick={() => setTab("decorate")}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* DECORATE TAB */}
            {tab === "decorate" && (
              <div>
                <label style={{ ...styles.label, marginTop: 18 }}>Mixtape Color</label>
<div style={{ 
  display: "flex", 
  flexWrap: "wrap",
  gap: 8,
  maxWidth: "100%",
}}>
  {[
    { color: "#FF6FA9", image: "/pinkntape.png" },
    { color: "#B7FF33", image: "/greennotape.png" },
    { color: "#C9D3DA", image: "/transnotape.png" },
    { color: "#FFFFFF", image: "/whitenotape.png" },
    { color: "#3F3F3F", image: "/blacknotape1.png" },
    { color: "#AF96E6", image: "/purplenotape1.png" },
    { color: "#86E3FD", image: "/bluenotape.png" },
  ].map((item, i) => (
    <button
      key={i}
      onClick={() => {
        setCoverColor(item.color);
        setMixtapeImage(item.image);
      }}
      style={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: 10,
        border: coverColor === item.color ? "2px solid #3a2d3f" : "2px solid #e4e4e7",
        background: item.color,
        cursor: "pointer",
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  ))}
</div>
                <label style={{ ...styles.label, marginTop: 18 }}>Label</label>

<div
  style={{
    display: "grid",
    gridTemplateColumns: isTablet ? "repeat(5, 1fr)" : "repeat(5, 40px) auto",
    gap: isTablet ? 8 : 10,
    alignItems: "center",
    maxWidth: "100%",
  }}
>
  {/* 1 */}
  <button
    onClick={() => setLabelOverlay("/label1.png")}
    style={styles.labelButton}
  >
    1
  </button>

  {/* 2 */}
  <button
    onClick={() => setLabelOverlay("/label2.png")}
    style={styles.labelButton}
  >
    2
  </button>

  {/* 3 */}
  <button
    onClick={() => setLabelOverlay("/label3.png")}
    style={styles.labelButton}
  >
    3
  </button>

  {/* 4 */}
  <button
    onClick={() => setLabelOverlay("/label4.png")}
    style={styles.labelButton}
  >
    4
  </button>

  {/* X */}
  <button
    onClick={() => {
      setLabelOverlay(null);
      setUploadedLabelImage(null);
      setLabelImageScale(1);
      setLabelImagePos({ x: 50, y: 50 });
    }}
    style={styles.labelButton}
  >
    ✕
  </button>

  {/* Upload Image - only show inline on desktop, not tablet */}
  {!isTablet && (
    <label
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        padding: "0 9px",
        borderRadius: 10,
        border: "1px solid #e4e4e7",
        cursor: isEditable ? "pointer" : "default",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        background: "#f6f6fa",
        color: "#444",
      }}
      onPointerEnter={(e) => {
        e.currentTarget.style.background = "#ededf4";
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.background = "#f7f7fb";
      }}
    >
      Upload Image
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLabelUpload(f);
        }}
        style={{ display: "none" }}
      />
    </label>
  )}
</div>

{/* Upload Image - separate row for tablet */}
{isTablet && (
  <div style={{ marginTop: 10 }}>
    <label
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        background: "#f6f6fa",
        border: "1px solid #e4e4e7",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        color: "#444",
      }}
    >
      Upload Image
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleLabelUpload(f);
        }}
        style={{ display: "none" }}
      />
    </label>
  </div>
)}




               <label style={styles.label}>Font</label>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
  <select
    value={textFont}
    onChange={(e) => setTextFont(e.target.value)}
    style={{ ...styles.select, flex: "1 1 120px", minWidth: 100 }}
  >
    {FONT_OPTIONS.map(f => (
      <option key={f.value} value={f.value}>
        {f.label}
      </option>
    ))}
  </select>

  <select
    value={textSize}
    onChange={(e) => setTextSize(Number(e.target.value))}
    style={{ ...styles.select, flex: "0 1 70px", minWidth: 60 }}
  >
    {[20, 24, 32, 36, 40].map(size => (
      <option key={size} value={size}>{size}px</option>
    ))}
  </select>

  <label
    style={{
      width: 36,
      height: 36,
      flexShrink: 0,
      borderRadius: 10,
      border: "1px solid #e4e4e7",
      background: "linear-gradient(135deg, #ff6b9d 0%, #ffa726 25%, #c4e86b 50%, #64d8cb 75%, #ba8fdb 100%)",
      cursor: "pointer",
      position: "relative",
      display: "block",
    }}
  >
    <input
      type="color"
      value={textColor}
      onChange={(e) => setTextColor(e.target.value)}
      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
    />
  </label>
</div>


                <label style={styles.label}>Mixtape Message</label>

<div style={{ position: "relative" }}>
  <textarea
    style={styles.messageTextarea}
    placeholder="Type a message..."
    value={labelMessage}
    maxLength={90}              // ← adjust if you want
    rows={3}                    // ← 3 rows max visually
    onChange={(e) => setLabelMessage(e.target.value)}
  />

  {/* character counter */}
  <div
    style={{
      position: "absolute",
      bottom: 6,
      right: 10,
      fontSize: 11,
      color: "#aaa",
      pointerEvents: "none",
    }}
  >
    {labelMessage.length}/90
  </div>
</div>

  {/*STICKERS */}
<label style={styles.label}>Stickers</label>

<div style={styles.stickerPanel}>
  {STICKERS.map((src, i) => (
    <img
      key={i}
      src={src}
      alt=""
      style={styles.stickerThumb}
      onClick={() =>
  setStickersOnTape((prev) => [
    ...prev,
    {
      id: Date.now() + Math.random(),
      src,
      x: 27,
      y: 35,
      scale: 1.4,
      rotation: 0,
    },
  ])
}

    />
  ))}
</div>


                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    style={{ ...styles.cta, background: "#fff", color: "#222", border: "1px solid #ddd" }}
                    onClick={() => setTab("songs")}
                  >
                    ← Back
                  </button>
                  <button style={styles.cta} onClick={() => setTab("preview")}>
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* COVER TAB */}
            {tab === "preview" && (
              <div>
                <h3 style={styles.h3}>Tracks</h3>

                {tracks.length === 0 && <div style={{ color: "#777" }}>No tracks yet.</div>}

                {tracks.map((t, i) => (
                  <div key={i} style={styles.trackRow}>
                    <div style={styles.trackBadge}>{i + 1}.</div>
                    <div style={styles.trackName}>{t.name}</div>
                    <button
                      style={styles.trash}
                      onClick={() => setTracks((arr) => arr.filter((_, idx) => idx !== i))}
                    >
                     <svg
                         width="14"
                         height="14"
                         viewBox="0 0 24 24"
                          fill="none"
                           stroke="currentColor"
                           strokeWidth="3"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           >
                         <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                  </div>
                ))}

                <h3 style={styles.h3}>Choose a Background</h3>

                <div style={{ 
  display: "grid", 
  gridTemplateColumns: isTablet ? "repeat(7, 1fr)" : "repeat(7, 36px)", 
  gap: isTablet ? 8 : 10,
  maxWidth: "100%",
}}>
  {[
    { bg: "#FF6FA9", img: "/bgpink.jpg", dark: false },
    { bg: "#B7FF33", img: "/bggreen2.jpg", dark: false },
    { bg: "#C9D3DA", img: "/bggray.jpg", dark: false },
    { bg: "#FFFFFF", img: "/bgwhite.jpg", dark: false },
    { bg: "#000000", img: "/bgblack.jpg", dark: true },
    { bg: "#AF96E6", img: "/bgpurple.jpg", dark: false },
    { bg: "#86E3FD", img: "/bgblu.jpg", dark: true },
  ].map((item, i) => (
    <button
      key={i}
      onClick={() => {
        setSiteBackground(item.img);
        setIsDarkBg(item.dark);
      }}
      style={{
        aspectRatio: "1",
        width: isTablet ? "100%" : 36,
        height: isTablet ? "auto" : 36,
        borderRadius: 8,
        border: siteBackground === item.img ? "2px solid #3a2d3f" : "1px solid #ccc",
        background: item.bg,
        cursor: "pointer",
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  ))}
</div>

<label style={{ ...styles.label, marginTop: 18 }}>Glow</label>

<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
  <button
    onClick={() => setGlowEnabled(true)}
    style={{
      ...styles.cta,
      background: glowEnabled ? "#3a2d3f" : "#ddd",
      color: glowEnabled ? "#fff" : "#000",
    }}
  >
    On
  </button>

  <button
    onClick={() => setGlowEnabled(false)}
    style={{
      ...styles.cta,
      background: !glowEnabled ? "#3a2d3f" : "#ddd",
      color: !glowEnabled ? "#fff" : "#000",
    }}
  >
    Off
  </button>

  <label
    style={{
      width: 40,
      height: 40,
      borderRadius: 10,
       background: "linear-gradient(135deg, #ff6b9d 0%, #ffa726 25%, #c4e86b 50%, #64d8cb 75%, #ba8fdb 100%)",
      cursor: "pointer",
    }}
  >
    <input
      type="color"
      value={glowColor}
      onChange={(e) => setGlowColor(e.target.value)}
      style={{ opacity: 0, width: "100%", height: "100%" }}
    />
  </label>
</div>


<label style={{ ...styles.label, marginTop: 18 }}>
  Share link
</label>

<p style={{ fontSize: 13, color: "#777", marginBottom: 6 }}>
  Send this link to share your mixtape
</p>

<div style={{ display: "flex", gap: 10 }}>
  <input
    type="text"
    value={shareLink}
    readOnly
    placeholder="Generate a link to share…"
    style={{
      ...styles.input,
      fontFamily: "'Hoover', sans serif",
      fontSize: 13,
      color: "#555",
      cursor: "text",
    }}
    onClick={(e) => e.target.select()}
  />

  <button
    style={{
      ...styles.cta,
      whiteSpace: "nowrap",
      opacity: isSaving ? 0.6 : 1,
      cursor: isSaving ? "not-allowed" : "pointer",
    }}
    disabled={isSaving}
    onClick={generateShareLink}
  >
    {isSaving ? "Saving…" : shareLink ? "Copy" : "Generate"}
  </button>
</div>


                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <button
                      style={{ ...styles.cta, background: "#fff", color: "#222", border: "1px solid #ddd" }}
                      onClick={() => setTab("songs")}
                   >
                    ← Back
                    </button>
                  </div>

                  {tracks.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -43
                   }}>
                    <button 
                    style={styles.cta} 
                    onClick={() => {
                      setCurrentTrackIndex(0); 
                      setIsPreviewMode(true);
                    
                    }}
                  >
                    Start preview →
                  </button>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* RIGHT PANEL: 3D CANVAS + CONTROLS */}
        
{appMode !== "receiver" || (!isLoadingSharedMixtape && isHydrated) ? (
<div
  className="mixtape-panel"
  style={{
    display: "flex",
    justifyContent: isPreviewMode ? "flex-start" : "center",
    width: "100%",
  }}
  >
    {/* ===================== PREVIEW STACK START ===================== */}
<div
  className={`preview-stack ${previewEntering ? "preview-enter" : ""}`}
  style={{
    width: "100%",
    maxWidth: 650,
    margin: "0 auto",
    marginLeft: isPreviewMode ? "auto" : undefined,
    marginRight: isPreviewMode ? "auto" : undefined,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: isTablet ? 30 : 70,
    gap: 20,
  }}
>
  <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", width: "100%"
 }}>
    {/* MIXTAPE */}
<div className="mixtape-wrapper"
    style={{
      width: "100%",
      maxWidth: isPreviewMode || appMode === "receiver" ? "650px" : isTablet ? "500px" : "550px",
      aspectRatio: "4 / 3",
      position: "relative", // This MUST stay relative - it's the container for absolute children
      background: "transparent",
      overflow: "visible",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: isTablet ? 10 : 20,
    }}
>
     <div
  ref={tapeRef}
  style={{
    position: "relative",
    width: "100%",
    height: "100%",
  }}
>
{/* Hidden preloaded labels for instant switching */}
<div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}>
  <img src="/label1.png" alt="" />
  <img src="/label2.png" alt="" />
  <img src="/label3.png" alt="" />
  <img src="/label4.png" alt="" />
</div>

{glowEnabled && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      ...(isIOS || isSafari
        ? {
            WebkitFilter: isTablet
              ? `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 30px ${glowColor})`
              : `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 60px ${glowColor})`,
          }
        : {
            filter: isTablet
              ? `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor})`
              : `drop-shadow(0 0 14px ${glowColor}) drop-shadow(0 0 28px ${glowColor})`,
          }
      ),
    }}
  >
    <img
      src={mixtapeImage}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  </div>
)}



<video
  ref={tapeVideoRef}
  src={isSafari ? "/tapeprores.mov" : "/tapenew.webm"}
  preload="auto"
  loop
  muted
  playsInline
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: 1,
    pointerEvents: "none",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
  }}
/>


{/* 2️⃣ Cover image (NO tape graphics) */}
<img ref={mixtapeImageRef}
  src={mixtapeImage} // pinknotape.png etc
  alt="Mixtape cover"
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: 2,
    pointerEvents: "none",

  }}
/>

<video
  ref={rollerVideoRef}
  src={isSafari ? "/smallrollersprores.mov" : "/smallrollers.webm"}
  preload="auto"
  loop
  muted
  playsInline
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    zIndex: 3,
    pointerEvents: "none",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden",
  }}
/>



  {/* Label overlay */}
  {labelOverlay && (
  <img
    src={labelOverlay}
    alt="Label"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      pointerEvents: "none",
      zIndex: 2,
    }}
  />
)}


{/* Uploaded image clipped to crop.png shape */}
{uploadedLabelImage && (
  <div
  style={{
    position: "absolute",
    inset: 0,
    zIndex: activeObject === "label-image" ? 90 : 40,
    pointerEvents: "none",
  }}
>

{uploadedLabelImage && (
  <div
  data-selectable
    style={{
      position: "absolute",
      inset: 0,
      zIndex: activeObject === "label-image" ? 90 : 40,

      /* 🔒 MASK LIVES HERE (FIXED) */
      WebkitMaskImage: "url(/crop.png)",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      WebkitMaskSize: "contain",

      maskImage: "url(/crop.png)",
      maskRepeat: "no-repeat",
      maskPosition: "center",
      maskSize: "contain",

      pointerEvents: "auto",
    }}
  >
    {/* IMAGE (MOVES INSIDE MASK) */}
    <img
       data-selectable
      src={uploadedLabelImage}
      draggable={false}
      onPointerDown={(e) => {
        if (!isEditable) return;
        e.stopPropagation();
        e.preventDefault();
        setActiveObject("label-image");
        dragRef.current = {
          type: "move-label",
          startX: labelImagePos.x,
          startY: labelImagePos.y,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
        };
      }}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",

        /* 🧠 image is larger than mask */
        width: "140%",
        height: "140%",
        objectFit: "cover",

        transform: `
          translate(-50%, -50%)
          translate(${labelImagePos.x - 50}%, ${labelImagePos.y - 50}%)
          scale(${labelImageScale})
          rotate(${labelImageRotation}deg)
        `,
        cursor: isEditable ? "move": "default",
        userSelect: "none",
        pointerEvents: "auto",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    />

    {/* UI */}
    {isEditable && activeObject === "label-image" && (
      <>
        <div
          style={{
          }}
        />
      </>
    )}
  </div>
)}



    {isEditable && activeObject === "label-image" && (
      <>
        {/* bounding box */}
        <div
          style={{
          }}
        />

        {/* scale */}
        <div
          onPointerDown={(e) => {
            if (!isEditable) return;

            e.stopPropagation();
            dragRef.current = {
              type: "scale-label",
              startScale: labelImageScale,
              startMouseX: e.clientX,
            };
          }}
          style={{
            position: "absolute",
            right: 20,
            top: "46%",
            cursor: isEditable ? "ew-resize": "default",
            fontSize: 22,
            userSelect: "none",
            pointerEvents: "auto",
            zIndex: 200,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M9.5 13.09l1.41 1.41-4.5 4.5H10v2H3v-7h2v3.59l4.5-4.5zm1.41-3.59L9.5 10.91 5 6.41V10H3V3h7v2H6.41l4.5 4.5zm3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5 1.41-1.41zM14.5 10.91l-1.41-1.41 4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5z"/>
</svg>
        </div>

        {/* rotate */}
        <div
          onPointerDown={(e) => {
            if (!isEditable) return;

            e.stopPropagation();
            dragRef.current = {
              type: "rotate-label",
              startRotation: labelImageRotation,
              startMouseY: e.clientY,
            };
          }}
          style={{
            position: "absolute",
            top: 46,
            left: "50%",
            transform: "translateX(-50%)",
            cursor: isEditable ? "grab": "default",
            fontSize: 20,
            userSelect: "none",
            pointerEvents: "auto",
            zIndex: 200,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
</svg>
        </div>
      </>
    )}
  </div>
)}




{/* 3️⃣ Mixtape text overlay */}
{labelMessage && (
  <div ref={labelTextRef}
    onPointerDown={(e) => {
      if (!isEditable) return;

      e.stopPropagation();
      e.preventDefault();
      dragRef.current = {
        type: 'move-text',
        startX: labelMessagePos.x,
        startY: labelMessagePos.y,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
      };
    }}
    style={{
      position: "absolute",
      top: `${labelMessagePos.y}%`,
      left: `${labelMessagePos.x}%`,
      transform: "translate(-50%, -50%)",
      fontFamily: textFont,
      fontSize: textSize,
      textAlign: "center",
      color: textColor,
      whiteSpace: "pre",
      wordBreak: "keep-all",
      overflowWrap: "normal",
      maxWidth: "80%",
      lineHeight: "1.3",
      cursor: isEditable ? "move": "default",
      userSelect: "none",
      pointerEvents: "auto",
      zIndex: 4,
      zIndex: 60,
    }}
  >
    {labelMessage}
  </div>
)}


{stickersOnTape.map((s) => (
  <div
    key={s.id}
    onPointerDown={(e) => {
      if (!isEditable) return;
      e.stopPropagation();
      setActiveObject(s.id);
    }}
    style={{
      position: "absolute",
      left: `${s.x}%`,
      top: `${s.y}%`,
      transform: "translate(-50%, -50%)",
      zIndex: activeObject === s.id ? 100 : 50,
      pointerEvents: "auto",
    }}
  >

    <div
      style={{
        transform: `scale(${s.scale}) rotate(${s.rotation}deg)`,
        transformOrigin: "center",
        position: "relative",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      {/* Selection box and controls */}
      {isEditable && activeObject === s.id && (
        <>
          {/* Bounding box */}
          <div
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              right: 3,
              bottom: 3,
              border: "1px solid #3b82f6",
              background: "rgba(59, 130, 246, 0.05)",
              pointerEvents: "none",
            }}
          />

          {/* Corner anchors - positioned relative to the 80px image */}
          <div style={{ position: "absolute", width: 6, height: 6, background: "#fff", border: "1px solid #3b82f6", left: 3, top: 3, transform: "translate(-50%, -50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 6, height: 6, background: "#fff", border: "1px solid #3b82f6", right: 3, top: 3, transform: "translate(50%, -50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 6, height: 6, background: "#fff", border: "1px solid #3b82f6", left: 3, bottom: 3, transform: "translate(-50%, 50%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 6, height: 6, background: "#fff", border: "1px solid #3b82f6", right: 3, bottom: 3, transform: "translate(50%, 50%)", pointerEvents: "none" }} />

          {/* Scale control (right arrow) */}
          <div
            onPointerDown={(e) => {
              if (!isEditable) return;
              e.stopPropagation();
              e.preventDefault();
              dragRef.current = {
                id: s.id,
                type: 'scale',
                startScale: s.scale,
                startMouseX: e.clientX,
              };
            }}
            style={{
              position: "absolute",
              right: "-35%",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: isEditable ? "ew-resize": "default",
              padding: "3px 8px",
              color: "#202020",
              fontSize: 19,
              fontWeight: 800,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M9.5 13.09l1.41 1.41-4.5 4.5H10v2H3v-7h2v3.59l4.5-4.5zm1.41-3.59L9.5 10.91 5 6.41V10H3V3h7v2H6.41l4.5 4.5zm3.59 3.59l4.5 4.5V14h2v7h-7v-2h3.59l-4.5-4.5 1.41-1.41zM14.5 10.91l-1.41-1.41 4.5-4.5H14V3h7v7h-2V6.41l-4.5 4.5z"/>
</svg>
          </div>

          {/* Rotate control (top arrow) */}
          <div
            onPointerDown={(e) => {
              if (!isEditable) return;
              e.stopPropagation();
              e.preventDefault();
              dragRef.current = {
                id: s.id,
                type: 'rotate',
                startRotation: s.rotation,
                startMouseY: e.clientY,
              };
            }}
            style={{
              position: "absolute",
              left: "-5%",
              top: "-30%",
              transform: "translateX(-50%) rotate(-220deg)",
              cursor: isEditable ? "grab": "default",
              padding: "3px 8px",
              color: "#202020ff",
              fontSize: 18,
              fontWeight: 700,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#202020">
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
</svg>
          </div>

          {/* Delete button */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setStickersOnTape(prev => prev.filter(st => st.id !== s.id));
              setActiveObject(null);
            }}
            style={{
              position: "absolute",
              right: "-25%",
              top: "-25%",
              cursor: isEditable ? "pointer": "default",
              width: 19,
              height: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ef4444",
              borderRadius: 6,
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            ×
          </div>
        </>
      )}

      {/* Sticker image */}
      <img
        onPointerDown={(e) => {
  if (!isEditable) return;

  e.stopPropagation();
  setActiveObject(s.id);
  dragRef.current = {
    id: s.id,
    type: "move",
    startX: s.x,
    startY: s.y,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
  };
}}


        src={s.src}
        alt=""
        draggable={false}
        style={{
          width: "20vw",
          maxWidth: 80,
          minWidth: 50,
          height: "auto",
          display: "block",
          cursor: activeObject === s.id ? "move" : "pointer",
          userSelect: "none",
          pointerEvents: "auto",
        }}
      />

      
    </div>
  </div>
))}

{!isMobile && note && (
  <div
    style={{
      position: "relative",
      marginTop: "12px",
      padding: "6px 12px",
      border: `1px dashed ${isDarkBg ? "#fff" : "#000"}`,
      color: isDarkBg ? "#fff" : "#000",
      fontFamily: "'Hoover', sans serif",
      lineHeight: "1.4",
      maxWidth: 320,
      textAlign: "center",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "break-word",
      background: "transparent",
      pointerEvents: "none",
      textShadow: isDarkBg ? "0 0 3px black" : "none",
      boxShadow: isDarkBg ? "0 0 0 1px rgba(114, 114, 114, 0.35)" : "none",
      margin: "12px auto 0",
    }}
  >
    {note}
  </div>
)}



</div>
    </div>
  </div>

  {mixtapeFinished && (
  <div
    style={{
      marginTop: 10,
      marginBottom: 5,
      textAlign: "center",
      fontFamily: "'Hoover', sans-serif",
      fontSize: 20,
      fontWeight: 700,
      color: isDarkBg ? "#fff" : "#000",
    }}
  >
    🎉 Congratulations! You finished listening to the mixtape! 
  </div>
)}


{isPreviewMode && isMP3 && (
  <div
    style={{
      width: "100%",
      maxWidth: 591, 
      marginTop: -15,
      fontFamily: "'Hoover', sans serif",
      color: isDarkBg ? "#fff" : "#000",
    }}
  >
    {/* time stamps */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        marginBottom: 4,
      }}
    >
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(totalMixtapeDuration)}</span>
    </div>

    {/* progress bar */}
    <div
      style={{
        position: "relative",
        height: 8,
        borderRadius: 4,
        background: isDarkBg ? "#444" : "#ddd",
        overflow: "hidden",
      }}
    >
      {/* filled */}
      <div
        style={{
          height: "100%",
          width: `${(mixtapeTime / totalMixtapeDuration) * 100 || 0}%`,
          background: isDarkBg ? "#9ae6b4" : "#3a2d3f",
          transition: "width 100ms linear",
        }}
      />

      {/* song markers */}
      {songMarkers.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(m.time / totalMixtapeDuration) * 100}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: isDarkBg ? "#aaa" : "#666",
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  </div>
)}



{isPreviewMode && isMP3 && (
  <div
    style={{
      display: "flex",
      gap: 12,
      marginTop: 18,
    }}
  >
    <CassetteButton
      label="⏮"
      active={activeButton === "rewind"}
      onClick={rewind}
    />

    <CassetteButton
      label="⏸"
      active={activeButton === "pause"}
      onClick={pauseCassette}
    />

    <CassetteButton
      label="▶"
      active={activeButton === "play"}
      onClick={playCassette}
    />

        <CassetteButton
      label="▶|"
      active={activeButton === "ff"}
      onClick={fastForward}
    />

    <CassetteButton
      label="⏭"
      active={activeButton === "next"}
      onClick={skipToNextTrack}
      disabled={!canSkipForward}
    />
  </div>
)}
 {/* ===================== PREVIEW STACK END ===================== */}
</div>
</div>
) : null}
      </div>
</div>
      )}


{currentPage === "about" && (
  <div
    style={{
      maxWidth: 520,
      margin: "20px auto",
      padding: "0 20px",
      textAlign: "center",
      color: isDarkBg ? "#fff" : "#000",
      fontFamily: "'Hoover', sans-serif",
      textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
    }}
  >
    <h2 style={{ fontSize: isTablet ? 33 : 40, marginBottom: 22, fontFamily: "'Array', sans-serif", }}>About</h2>

    <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
      <img
        src="/me2.png"
        alt="Maria"
        style={{
          width: 200,
          height: 200,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
    </div>

    <div style={{ fontSize: 14, marginTop: "40px", lineHeight: 1.2 }}>
      <p>
        Hello! I'm Maria, an interaction designer who builds experimental human-computer driven experiences.
      </p>

      <p>
        I created this website with a wish to make the internet a more fun and magical place, through sharing
        personal, intentional and special music, like the times of cassette tapes!
      </p>

      <p>
        If you're interested in my journey of exploring creative technology, find me at{" "}
        <a
          href="https://instagram.com/softparticle"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#ff69b4", textDecoration: "none", fontWeight: 600 }}
        >
          @softparticle
        </a>
      </p>

      <p>I hope you have fun making mixtapes &lt;3</p>
    </div>

    <button
      onClick={() => setCurrentPage("home")}
      style={{
        marginTop: 80,
        padding: "12px 24px",
        background: "transparent",
        color: isDarkBg ? "#fff" : "#000",
        border: `1px solid ${isDarkBg ? "#fff" : "#000"}`,
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      ← Back
    </button>
  </div>
)}


{currentPage === "terms" && (
  <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
    <h1 style={{ 
      fontFamily: "'Hoover', sans-serif", 
      fontSize: 40, 
      marginBottom: 40,
      marginTop: 10,
      color: isDarkBg ? "#fff" : "#000",
    }}>
      Terms of Use
    </h1>
    
    <div style={{ 
      fontFamily: "'Hoover', sans serif", 
      fontSize: 18, 
      lineHeight: 1.7,
      color: isDarkBg ? "#fff" : "#000",
    }}>
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>1. About Digital Mixtape</h3>
      <p>
        Digital Mixtape is a tool for creating and sharing music as virtual gifts through customizing cassette tapes.
      </p>
      
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>2. User Content & Ownership</h3>
      <p>
        All content added by users remains the property of its respective owners. Digital Mixtape does not claim ownership of user content.
      </p>
      <p>
        By using the service, you confirm that you own the rights to the content you upload or have permission to use it.
      </p>
      
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>3. Copyright Responsibility</h3>
      <p>
        Users are responsible for ensuring their content does not infringe on copyright or other rights.
      </p>
      <p>
        We encourage the use of original or royalty-free music. Digital Mixtape does not sell or monetize uploaded music.
      </p>
      
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>4. Content Removal & Contact</h3>
      <p>
        We may remove content that violates these Terms or applicable laws.
      </p>
      <p>
        If you believe your copyrighted work has been used improperly, please contact us.
      </p>
    </div>
    
    <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: isDarkBg ? "#fff" : "#000",
    border: `1px solid ${isDarkBg ? "#fff" : "#000"}`,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ← Back
</button>
  </div>
)}

{currentPage === "privacy" && (
  <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
    <h1 style={{ 
      fontFamily: "'Hoover', sans-serif", 
      fontSize: 40, 
      marginBottom: 40,
      marginTop: 10,
      color: isDarkBg ? "#fff" : "#000",
    }}>
      Privacy Policy
    </h1>
    
    <div style={{ 
      fontFamily: "'Hoover', sans serif", 
      fontSize: 18, 
      lineHeight: 1.7,
      color: isDarkBg ? "#fff" : "#000",
    }}>
      <p>We respect your privacy.</p>
      
      <p>
        We do not require user accounts and do not collect personal information such as names or email addresses.
      </p>
      
      <p>
        The only data we store is user-generated content, including uploaded audio files, music links, images, and mixtape configuration data.
      </p>
      
      <p>
        This data is used solely to provide the Digital Mixtape service.
      </p>
      
      <p>
        We do not sell or share user data.<br />
        Content is stored securely using third-party infrastructure providers for hosting and storage.
      </p>
      
      <p>
        Users may request deletion of their content at any time by contacting us.
      </p>
    </div>
    
    <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: isDarkBg ? "#fff" : "#000",
    border: `1px solid ${isDarkBg ? "#fff" : "#000"}`,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ← Back
</button>
  </div>
)}
</div>


{/* ================= DESKTOP FOOTER (MATCH MOBILE) ================= */}
<div
  className="desktop-footer"
  style={{
    marginTop: "auto",
    paddingTop: isTablet ? 60 : 40,
    paddingBottom: isTablet ? 40 : 20,
    width: "100%",
    textAlign: "center",
    fontFamily: "'Hoover', sans-serif",
    fontSize: 13,
    color: isDarkBg ? "#fff" : "#000",
    textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
    pointerEvents: "auto",
  }}
>
  <div style={{ marginBottom: 6 }}>
    Created by{" "}
    <a
      href="https://www.instagram.com/softparticle/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: isDarkBg ? "#fff" : "#000",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      @softparticle
    </a>
  </div>

  <div style={{ marginBottom: 8 }}>
    Copyright © 2025 Softparticle
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: 6,
      fontSize: 12,
      opacity: 0.9,
    }}
  >
    <button
      onClick={() => setCurrentPage("terms")}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "inherit",
        color: isDarkBg ? "#fff" : "#000",
        fontWeight: 500,
      }}
    >
      Terms of Use
    </button>

    <span>·</span>

    <button
      onClick={() => setCurrentPage("privacy")}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "inherit",
        color: isDarkBg ? "#fff" : "#000",
        fontWeight: 500,
      }}
    >
      Privacy Policy
    </button>
  </div>
</div>
</div>
</>
    )}
  </div>

);}



/* ---------- STYLES ---------- */
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 20px",
        borderRadius: "10px 10px 0 0",
        background: active ? "#ffffff" : "#ECECEF",
        color: "#2a2438",
        border: "1px solid #E5E5EA",
        borderBottom: active ? "1px solid #ffffff" : "1px solid #E5E5EA",
        marginBottom: -1,
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}


function CassetteButton({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 78,
        height: 54,
        borderRadius: 8,
        border: "1px solid #8a8a8a",
        background: disabled
          ? "#d6d6d6"
          : active
          ? "#8e8e8e"
          : "#cfcfcf",
        color: disabled ? "#999" : "#fff",
        fontSize: 22,
        fontWeight: 700,
        boxShadow: active
          ? "inset 0 3px 6px rgba(0,0,0,0.4)"
          : "inset 0 -2px 3px rgba(255,255,255,0.4)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        transition: "background 120ms ease",
      }}
    >
      {label}
      {/* white underline */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 3,
          background: "#fff",
          opacity: disabled ? 0.3 : 1,
          borderRadius: 2,
        }}
      />
    </button>
  );
}

const styles = {
page: {
  minHeight: "100vh",
  background: "#ffffff",
  color: "#000000",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px 20px 20px",
  justifyContent: "flex-start",
  boxSizing: "border-box",
},

  logo: { width: 260, margin: "8px auto 14px", display: "block" },
main: {
    display: "grid",
    gridTemplateColumns: "minmax(250px, 380px) minmax(400px, 1fr)",
    gap: 36,
    width: "min(1400px, 90vw)",
    alignItems: "start",
    margin: "0 auto",
    padding: "0 20px",
    boxSizing: "border-box",
  },

  leftColumn: {
  display: "flex",
  flexDirection: "column",
  },
  // body of the left white
card: {
  background: "#ffffff",
  border: "1px solid #E5E5EA",
  borderRadius: "0 0 20px 20px",
  boxShadow: "0 8px 30px rgba(0,0,0,.06)",
  overflow: "hidden",
  padding: "0px 24px 24px",
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
},
tabs: {
  display: "flex",
  flexWrap: "wrap",
  gap: 5,
  padding: "8px 0 0 0",
  borderBottom: "0px solid #E5E5EA",
  borderRadius: "12px",
  background: "transparent",
  width: "100%",
},
panel: { 
  padding: "15px 20px 30px", 
  paddingBottom: 30, 
  boxSizing: "border-box",
  width: "100%",
  overflow: "hidden",
},
  h3: { margin: "4px 0 12px", fontSize: 18 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    height: 40,
    borderRadius: 10,
    border: "1px solid #E5E5EA",
    padding: "0 12px",
    background: "#f7f7fb",
    outline: "none",
    color: "#000"
  },
  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #E5E5EA",
    padding: 12,
    resize: "vertical",
    boxSizing: "border-box",
    maxHeight: 160,
  },
  //button preview 
  cta: {
    padding: "10px 14px",
    background: "#3d3d3d",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
  dropzone: {
    width: "calc(100% - 4px)",
    border: "2px dashed #bdbdcc",
    color: "#7a7a88",
    borderRadius: 14,
    padding: "26px 16px",
    textAlign: "center",
    cursor: "pointer",
    background: "#fff",
    boxSizing: "border-box",
    display: "block",
    margin: "0 auto",
  },
  label: { display: "block", margin: "13px 0 10px", fontWeight: 600 },
  trackRow: {
    display: "grid",
    gridTemplateColumns: "40px 1fr 40px",
    alignItems: "center",
    gap: 10,
    background: "#F6F6FA",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: "8px 8px",
    color: "#000",
  },
  trackBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#EDEDF5",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    color: "#000",
  },
  trackIndex: { paddingLeft: 8, fontWeight: 700, color: "#555" },
  trackName: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "8px 10px",
    color: "#000",
  },

  helperText: {
  fontSize: 12,
  color: "#8c8c8c",
  marginTop: 4,
  marginBottom: 12,
},

  trash: {
  width: 28,
  height: 28,
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#838383",
  padding: 0,
},



labelButton:
{
  height: 36,
  minWidth: 36,
  flex: "0 0 36px",
  borderRadius: 10,
  border: "2px solid #e4e4e7",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  color: "#868686",
},

select: {
  height: 36,
  borderRadius: 10,
  border: "1px solid #E5E5EA",
  padding: "0 10px",
  background: "#fff",
  fontSize: 14,
  color: "#000",
  fontFamily: "'Hoover', sans-serif",
  boxSizing: "border-box",
  maxWidth: "100%",
},

stickerPanel: {
  maxHeight: 140,
  overflowY: "auto",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  padding: 10,
  border: "1px solid #E5E5EA",
  borderRadius: 12,
  background: "#fff",
},

stickerThumb: {
  width: "100%",
  cursor: "pointer",
},

messageTextarea: {
  width: "100%",
  height: 72,                  // ≈ 3 lines
  resize: "none",              // ← important
  borderRadius: 10,
  border: "1px solid #E5E5EA",
  padding: "8px 12px",
  boxSizing: "border-box",
  background: "#f7f7fb",
  fontSize: 14,
  lineHeight: "1.4",
  color: "#000",
},


};
