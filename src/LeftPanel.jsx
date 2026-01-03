export default function LeftPanel({
  isPreviewMode,
  isLoadingSharedMixtape,
  styles,
  tab,
  setTab,
  tracks,
  setTracks,
  MAX_TRACKS,

  // voice
  setShowVoiceRecorder,
  startRecording,
  nextFrame,

  // decorate
  isTablet,
  coverColor,
  setCoverColor,
  setMixtapeImage,
  labelOverlay,
  setLabelOverlay,
  setUploadedLabelImage,
  setLabelImageScale,
  setLabelImagePos,
  handleLabelUpload,

  // text
  textFont,
  setTextFont,
  textSize,
  setTextSize,
  textColor,
  setTextColor,
  labelMessage,
  setLabelMessage,
  FONT_OPTIONS,

  // stickers
  STICKERS,
  setStickersOnTape,

  // preview
  siteBackground,
  setSiteBackground,
  setIsDarkBg,
  glowEnabled,
  setGlowEnabled,
  glowColor,
  setGlowColor,

  // sharing
  shareLink,
  generateShareLink,
  isSaving,

  // misc
  isEditable,
}) {

      if (isPreviewMode || isLoadingSharedMixtape) return null;

  return (
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
  onClick={async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Voice recording is not supported on this device/browser.");
      return;
    }

    try {
      setShowVoiceRecorder(true); // 1️⃣ show popup
      await nextFrame();          // 2️⃣ wait for React to render it
      await startRecording();     // 3️⃣ start mic recording
    } catch (err) {
      console.error(err);
      alert("Could not start voice recording.");
      setShowVoiceRecorder(false);
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
    fontFamily: "'Hoover', sans-serif",
    color: "#444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }}
>
  🎙️ Record Voice Message
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
    { color: "#FF6FA9", image: "/pinkntape.webp" },
    { color: "#B7FF33", image: "/greennotape.webp" },
    { color: "#C9D3DA", image: "/transnotape.webp" },
    { color: "#FFFFFF", image: "/whitenotape.webp" },
    { color: "#3F3F3F", image: "/blacknotape1.webp" },
    { color: "#AF96E6", image: "/purplenotape1.webp" },
    { color: "#86E3FD", image: "/bluenotape.webp" },
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
        border: coverColor === item.color ? "2px solid #222" : "2px solid #e4e4e7",
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
    onClick={() => setLabelOverlay("/label1.webp")}
    style={styles.labelButton}
  >
    1
  </button>

  {/* 2 */}
  <button
    onClick={() => setLabelOverlay("/label2.webp")}
    style={styles.labelButton}
  >
    2
  </button>

  {/* 3 */}
  <button
    onClick={() => setLabelOverlay("/label3.webp")}
    style={styles.labelButton}
  >
    3
  </button>

  {/* 4 */}
  <button
    onClick={() => setLabelOverlay("/label4.webp")}
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
        border: siteBackground === item.img ? "2px solid #222" : "1px solid #ccc",
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
      background: glowEnabled ? "#222" : "#ddd",
      color: glowEnabled ? "#fff" : "#000",
    }}
  >
    On
  </button>

  <button
    onClick={() => setGlowEnabled(false)}
    style={{
      ...styles.cta,
      background: !glowEnabled ? "#222" : "#ddd",
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
  );
}