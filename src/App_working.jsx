import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  useProgress,
  Center,
  ContactShadows,
  Environment,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { MixtapeModel } from "./DigitalMixtape";

/* ---------- ASSETS ---------- */
const MODEL_URL = "/models/Mixtape.glb"; // Mixtape.glb in public/models
const LOGO_URL = "/Mixtape_logo3.png"; // Logo in public/

/* ---------- SMALL UTILITIES ---------- */
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #ddd",
          background: "white",
          color: "#222",
          fontSize: 13,
          boxShadow: "0 4px 16px rgba(0,0,0,.08)",
        }}
      >
        Loading… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

/* ---------- CAMERA CONTROLS ---------- */
function LimitedOrbitControls() {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.position.set(0, 0, 4.5);
  }, [camera]);
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2 - 0.2}
      maxPolarAngle={Math.PI / 2 + 0.2}
      minAzimuthAngle={-0.35}
      maxAzimuthAngle={0.35}
      rotateSpeed={0.5}
      enableDamping
      dampingFactor={0.08}
    />
  );
}

/* ---------- MAIN APP ---------- */
export default function App() {
  const [tab, setTab] = React.useState("songs"); // "songs" | "decorate" | "preview"
  const [coverColor, setCoverColor] = React.useState("#E6CDEB");
  const [labelColor, setLabelColor] = React.useState("#FFFFFF");
  const [labelMessage, setLabelMessage] = React.useState("");
  const [labelImageTexture, setLabelImageTexture] = React.useState(null);
  const [tracks, setTracks] = React.useState([]);
  const [note, setNote] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [pendingUrl, setPendingUrl] = React.useState("");

  const audioRef = React.useRef(new Audio());

  // Upload label image
  const handleLabelUpload = (file) => {
    const url = URL.createObjectURL(file);
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        setLabelImageTexture(tex);
      },
      undefined,
      () => console.warn("⚠️ Failed to load label texture")
    );
  };

  // Add track from URL
  const addTrackByUrl = () => {
    if (!pendingUrl.trim()) return;
    const name = pendingUrl.replace(/^https?:\/\//, "").slice(0, 40);
    setTracks((t) => [...t, { name, src: pendingUrl }]);
    setPendingUrl("");
  };

  // Add uploaded audio files
  const handleSongFiles = (files) => {
    const list = Array.from(files || []);
    const toAdd = list.map((file) => ({
      name: file.name,
      src: URL.createObjectURL(file),
    }));
    setTracks((t) => [...t, ...toAdd]);
  };

  // Audio player logic
  React.useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  const play = () => {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    if (!audio.src) audio.src = tracks[0].src;
    audio.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const palette = [
    "#FF6FA9",
    "#AFC8C7",
    "#C9D3DA",
    "#E5A0A7",
    "#B7FF33",
    "#8D78C5",
    "#53EDFF",
    "#5B6B8E",
    "#F46C96",
    "#F9D76B",
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
      <img src={LOGO_URL} alt="Digital Mixtape" style={styles.logo} />

      <div style={styles.main}>
        {/* LEFT PANEL */}
        <div style={styles.card}>
          <div style={styles.tabs}>
            <Tab label="Add Songs" active={tab === "songs"} onClick={() => setTab("songs")} />
            <Tab label="Decorate" active={tab === "decorate"} onClick={() => setTab("decorate")} />
            <Tab label="Preview" active={tab === "preview"} onClick={() => setTab("preview")} />
          </div>

          <div style={styles.panel}>
            {/* SONGS TAB */}
            {tab === "songs" && (
              <div>
                <h3 style={styles.h3}>Add Links</h3>
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                  <input
                    style={{ ...styles.input, color: "black" }}
                    placeholder="Paste your URL here..."
                    value={pendingUrl}
                    onChange={(e) => setPendingUrl(e.target.value)}
                  />
                  <button style={styles.cta} onClick={addTrackByUrl}>
                    + Add
                  </button>
                </div>

                {/* Upload audio files */}
                <div style={{ marginTop: 20, overflow: "hidden" }}>
                  <div
                    onClick={() => document.getElementById("songFiles").click()}
                    style={styles.dropzone}
                  >
                    Click to upload audio files
                    <input
                      id="songFiles"
                      type="file"
                      accept="audio/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => handleSongFiles(e.target.files)}
                    />
                  </div>
                </div>

                {/* Track list */}
                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
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
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <button style={styles.cta} onClick={() => setTab("decorate")}>
                    Decorate →
                  </button>
                </div>
              </div>
            )}

            {/* DECORATE TAB */}
            {tab === "decorate" && (
              <div>
                <h3 style={styles.h3}>Customize your Cover</h3>

                <label style={styles.label}>Mixtape Message</label>
                <input
                  style={styles.input}
                  placeholder="Type a message..."
                  value={labelMessage}
                  onChange={(e) => setLabelMessage(e.target.value)}
                />

                <label style={{ ...styles.label, marginTop: 18 }}>Cover Color</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 40px)", gap: 10 }}>
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCoverColor(c)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: "2px solid #e4e4e7",
                        background: c,
                        cursor: "pointer",
                      }}
                      aria-label={`color ${c}`}
                    />
                  ))}
                  <label
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "2px dashed #d4d4d8",
                      background:
                        "linear-gradient(45deg, #ff0080, #ffcd1e, #00f5d4, #8e77ff)",
                      cursor: "pointer",
                      position: "relative",
                      display: "block",
                    }}
                  >
                    <input
                      type="color"
                      value={coverColor}
                      onChange={(e) => setCoverColor(e.target.value)}
                      style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                    />
                  </label>
                </div>

                <label style={{ ...styles.label, marginTop: 18 }}>Label (image)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                 {/* Upload button */}
                 <label style={{ ...styles.cta, background: "#efefef", color: "#222" }}>
                    Upload Image
                   <input
                    type="file"
                     accept="image/png, image/jpeg"
                      onChange={(e) => {
                      const f = e.target.files?.[0];
                     if (f) handleLabelUpload(f); // keeps your existing upload function
                     }}
                    style={{ display: "none" }}
                    />
                  </label>

                  {/* Reset button (only visible if texture exists) */}
                  {labelImageTexture && (
                  <button
                   style={{
                   ...styles.cta,
                   background: "#fff",
                    color: "#222",
                    border: "1px solid #ddd",
                    }}
                   onClick={() => setLabelImageTexture(null)}
                  >
                   Reset
                  </button>
                  )}
                  </div>


                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    style={{
                      ...styles.cta,
                      background: "#fff",
                      color: "#222",
                      border: "1px solid #ddd",
                    }}
                    onClick={() => setTab("songs")}
                  >
                    ← Back
                  </button>
                  <button style={styles.cta} onClick={() => setTab("preview")}>
                    Preview →
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW TAB */}
            {tab === "preview" && (
              <div>
                <h3 style={styles.h3}>Tracks</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {tracks.length === 0 && <div style={{ color: "#777" }}>No tracks yet.</div>}
                  {tracks.map((t, i) => (
                    <div key={i} style={styles.trackRow}>
                      <div style={styles.trackIndex}>{i + 1}.</div>
                      <div style={styles.trackName}>{t.name}</div>
                      <button
                        style={styles.trash}
                        onClick={() =>
                          setTracks((arr) => arr.filter((_, idx) => idx !== i))
                        }
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <label style={{ ...styles.label, marginTop: 18 }}>Add a note?</label>
                <textarea
                  style={styles.textarea}
                  rows={4}
                  placeholder="Write a personal note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                  <button style={styles.smallBtn} disabled>
                    Prev
                  </button>
                  <button style={styles.smallBtn} disabled>
                    Rewind
                  </button>
                  <button style={styles.smallBtn} onClick={pause}>
                    Stop
                  </button>
                  <button
                    style={{ ...styles.smallBtn, background: "#fff" }}
                    onClick={isPlaying ? pause : play}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button style={styles.smallBtn} disabled>
                    F.F
                  </button>
                  <button style={styles.smallBtn} disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: 3D CANVAS */}
      <div
       style={{
       border: "1px solid #E5E5EA",
       background: "#fff",
       borderRadius: 18,
       boxShadow: "0 8px 30px rgba(0,0,0,.06)",
       width: "100%",
       aspectRatio: "4 / 3",
       overflow: "visible", // allow full view
       display: "flex",
        alignItems: "center",
       justifyContent: "center",
       }}
>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.2], fov: 35 }}>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={0.9} />
     <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <directionalLight position={[-3, -2, 2]} intensity={0.5} />
      <Environment preset="studio" />
      <ContactShadows position={[0, -0.8, 0]} opacity={0.25} scale={10} blur={2.8} far={5} />

      <React.Suspense fallback={<LoaderOverlay />}>
      <Center position={[0, -0.1, 0]} scale={2.9}>
        <MixtapeModel
          coverColor={coverColor}
          screwsTone="dark"
          labelColor={labelColor}
          labelMessage={labelMessage}
          labelImageTexture={labelImageTexture}
          isPlaying={isPlaying}
        />
      </Center>
      </React.Suspense>

        <LimitedOrbitControls />
      </Canvas>
</div>


      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: "10px 10px 0 0",
        background: active ? "#ffffff" : "#ECECEF",
        color: "#2a2438",
        border: "1px solid #E5E5EA",
        borderBottomColor: active ? "#ffffff" : "#E5E5EA",
        fontWeight: 700,
        boxShadow: active ? "0 -2px 0 0 #ffffff inset" : "none",
      }}
    >
      {label}
    </button>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: "#2a2438",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "28px 20px 60px",
  },
  logo: {
    width: 260,
    margin: "8px auto 14px",
    display: "block",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 420px) minmax(640px, 900px)",
    gap: 36,
    width: "min(1200px, 96vw)",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: "1px solid #E5E5EA",
    borderRadius: 18,
    boxShadow: "0 8px 30px rgba(0,0,0,.06)",
  },
  tabs: {
    display: "flex",
    gap: 8,
    padding: "8px 10px 0 10px",
    borderBottom: "1px solid #E5E5EA",
  },
  panel: {
    padding: 20,
  },
  h3: { margin: "4px 0 12px", fontSize: 18 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    border: "1px solid #E5E5EA",
    padding: "0 12px",
    background: "#f7f7fb",
    outline: "none",
  },
  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #E5E5EA",
    background: "#f7f7fb",
    padding: 12,
    resize: "vertical",
  },
  cta: {
    padding: "10px 14px",
    background: "#3a2d3f",
    color: "#fff",
    borderRadius: 10,
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
  dropzone: {
    width: "100%",
    border: "2px dashed #bdbdcc",
    color: "#7a7a88",
    borderRadius: 14,
    padding: "26px 16px",
    textAlign: "center",
    cursor: "pointer",
    background: "#fff",
    boxSizing: "border-box",
    maxWidth: "100%",
    display: "block",
  },
  label: { display: "block", margin: "12px 0 8px", fontWeight: 600 },
  trackRow: {
    display: "grid",
    gridTemplateColumns: "40px 1fr 40px",
    alignItems: "center",
    gap: 10,
    background: "#F6F6FA",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: "8px 8px",
  },
  trackBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#EDEDF5",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
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
  },
  trash: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    height: 36,
    cursor: "pointer",
  },
  smallBtn: {
    border: "1px solid #DCDCE4",
  }}
