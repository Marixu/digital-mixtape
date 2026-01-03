export default function PlayerControls({
  isPreviewMode,
  isMP3,
  isDarkBg,
  currentTime,
  totalMixtapeDuration,
  mixtapeTime,
  songMarkers,
  rewind,
  pauseCassette,
  playCassette,
  fastForward,
  skipToNextTrack,
  canSkipForward,
  activeButton,
  mixtapeFinished,
}) {

if (!isPreviewMode || !isMP3) return null;

  return (

  <div style={{ padding: "10px 0 20px", marginTop: -25 }}>
     {/* ---------- Timeline ---------- */}
    <div
      style={{
        width: "85%",
        maxWidth: 340,
        margin: "0 auto 12px",
        fontFamily: "'Hoover', sans serif",
        color: isDarkBg ? "#fff" : "#000",
      }}
    >
       {/* ---------- Time stamps ---------- */}
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
            background: isDarkBg ? "#9ae6b4" : "#222",
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

     {/* ---------- Buttons ---------- */}
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
      
      </div>
      
)}