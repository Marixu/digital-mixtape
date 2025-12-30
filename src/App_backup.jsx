import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  useProgress,
  Center,
  ContactShadows,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";


/* ---------- ASSETS ---------- */
const MODEL_URL = "/models/Mixtape.glb";           // put Mixtape.glb in public/models
const LOGO_URL  = "/Mixtape_logo3.png";            // put Mixtape_logo3.png in public/

/* ---------- SMALL UTILITIES ---------- */
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd",
        background: "white", color: "#222", fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,.08)"
      }}>
        Loading… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function findMeshesByName(root, includes) {
  const matches = [];
  root.traverse((o) => {
    if (o.isMesh && o.name.toLowerCase().includes(includes.toLowerCase())) {
      matches.push(o);
    }
  });
  return matches;
}
function findFirstMesh(root, exactName) {
  let found = null;
  root.traverse((o) => {
    if (!found && o.isMesh && o.name === exactName) found = o;
  });
  return found;
}
function setMeshColor(mesh, hex) {
  const apply = (m) => {
    const mat = m.material;
    if (!mat) return;
    mat.color = new THREE.Color(hex);
    mat.needsUpdate = true;
  };
  Array.isArray(mesh) ? mesh.forEach(apply) : mesh && apply(mesh);
}
function setMeshTexture(mesh, map) {
  if (!mesh) return;
  const mat = mesh.material;
  if (!mat) return;
  mat.map = map || null;
  if (map) {
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
  }
  mat.needsUpdate = true;
}

/* Make a texture with user text rendered on it (for Label_front) */
function makeTextLabelTexture({ text, width = 1024, height = 512 }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // White label with subtle gray border like your mockup
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#dcdcdc";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  // Handwritten-looking text style
  ctx.fillStyle = "#222";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 54px Arial, Helvetica, sans-serif";
  const padding = 48;

  // wrap text
  const words = (text || "").split(/\s+/);
  let line = "";
  let y = padding;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > width - padding * 2) {
      ctx.fillText(line, padding, y);
      line = words[i] + " ";
      y += 66;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, padding, y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/* ---------- 3D MODEL ---------- */
function MixtapeModel({
  coverColor,
  screwsTone,
  labelColor,
  labelMessage,
  labelImageTexture, // optional THREE.Texture from upload
  isPlaying,
}) {
  const { scene } = useGLTF(MODEL_URL);

  const labelFront = React.useMemo(() => findFirstMesh(scene, "Label_front"), [scene]);
  const cover      = React.useMemo(() => findFirstMesh(scene, "Cover"), [scene]);
  const screws     = React.useMemo(() => findFirstMesh(scene, "Screws"), [scene]);
  const wheels     = React.useMemo(() => findMeshesByName(scene, "wheel"), [scene]);

  // hygiene
  React.useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        const mat = o.material;
        if (mat) {
          mat.roughness = THREE.MathUtils.clamp(mat.roughness ?? 0.6, 0, 1);
          mat.metalness = THREE.MathUtils.clamp(mat.metalness ?? 0.0, 0, 1);
        }
      }
    });
  }, [scene]);

  React.useEffect(() => setMeshColor(cover, coverColor), [cover, coverColor]);

  React.useEffect(() => {
    const tone = screwsTone === "dark" ? "#2a2a2a" : "#D9D9D9";
    setMeshColor(screws, tone);
  }, [screws, screwsTone]);

  // Label logic: image > message > solid color
  React.useEffect(() => {
    if (labelImageTexture) {
      setMeshTexture(labelFront, labelImageTexture);
      setMeshColor(labelFront, "#ffffff");
      const mat = labelFront?.material;
      if (mat) {
        mat.transparent = true;
        mat.alphaTest = 0.01;
      }
      return;
    }
    if (labelMessage && labelMessage.trim().length) {
      const tex = makeTextLabelTexture({ text: labelMessage });
      setMeshTexture(labelFront, tex);
      setMeshColor(labelFront, "#ffffff");
      return;
    }
    // fallback: solid color
    setMeshTexture(labelFront, null);
    setMeshColor(labelFront, labelColor);
  }, [labelFront, labelColor, labelMessage, labelImageTexture]);

  // wheel spin
  useFrame((_, delta) => {
    if (!isPlaying || wheels.length === 0) return;
    const sorted = [...wheels].sort((a, b) => a.position.x - b.position.x);
    const speed = 4.0;
    sorted.forEach((wheel, i) => {
      const dir = i === 0 ? -1 : i === sorted.length - 1 ? 1 : 0.6;
      wheel.rotateZ(speed * delta * dir);
    });
  });

  // Rotate model (Make sure you put front to -Y in Blender, Three.js Y is blenders Z)
  return (
    <group rotation={[0, 0, 0]} position={[0,0,0]}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}

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

/* ---------- MAIN APP (Matches your Figma) ---------- */
export default function App() {
  const [tab, setTab] = React.useState("songs"); // "songs" | "decorate" | "preview"

  // Mixtape appearance
  const [coverColor, setCoverColor] = React.useState("#E6CDEB"); // nice lilac default
  const [labelColor, setLabelColor] = React.useState("#FFFFFF");
  const [labelMessage, setLabelMessage] = React.useState("");
  const [labelImageTexture, setLabelImageTexture] = React.useState(null);

  // Player
  const [tracks, setTracks] = React.useState([]); // {name, src (blob/url)}
  const [note, setNote] = React.useState("");
  const audioRef = React.useRef(new Audio());
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Upload image for label (Decorate tab)
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
      () => console.warn("Failed to load label texture")
    );
  };

  // Songs: add by URL
  const [pendingUrl, setPendingUrl] = React.useState("");
  const addTrackByUrl = () => {
    if (!pendingUrl.trim()) return;
    const name = pendingUrl.replace(/^https?:\/\//, "").slice(0, 40);
    setTracks((t) => [...t, { name, src: pendingUrl }]);
    setPendingUrl("");
  };

  // Songs: upload files
  const handleSongFiles = (files) => {
    const list = Array.from(files || []);
    const toAdd = list.map((file) => ({
      name: file.name,
      src: URL.createObjectURL(file),
    }));
    setTracks((t) => [...t, ...toAdd]);
  };

  // Simple audio play/pause for Preview
  React.useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);
  const play = () => {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    if (!audio.src) audio.src = tracks[0].src; // simple: play first track
    audio.play();
    setIsPlaying(true);
  };
  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  // Palette from your mockup (adjust as you like)
  const palette = [
    "#FF6FA9", "#AFC8C7", "#C9D3DA", "#E5A0A7", "#B7FF33", "#8D78C5",
    "#53EDFF", "#5B6B8E", "#F46C96", "#F9D76B"
  ];

  return (
    <div style={styles.page}>
      {/* Header logo */}
      <img src={LOGO_URL} alt="Digital Mixtape" style={styles.logo} />

      <div style={styles.main}>
        {/* Left card (tabs content) */}
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <Tab label="Add Songs" active={tab === "songs"} onClick={() => setTab("songs")} />
            <Tab label="Decorate" active={tab === "decorate"} onClick={() => setTab("decorate")} />
            <Tab label="Preview"   active={tab === "preview"} onClick={() => setTab("preview")} />
          </div>

          {/* Panel content */}
          <div style={styles.panel}>
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
                  <button style={styles.cta} onClick={addTrackByUrl}>+ Add</button>
                </div>

                {/* Upload box container — keeps everything inside the white frame */}
                <div style={{ marginTop: 20, overflow: "hidden" }}>
                <div
                  onClick={() => document.getElementById("songFiles").click()}
                  style={{
                  border: "2px dashed #d1d5db", // light gray dashed border
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  color: "#4b5563", // medium gray text
                  backgroundColor: "white",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#a78bfa")} // subtle purple hover
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
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

                {/* sample list (matches mock) */}
                <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
                  {tracks.map((t, i) => (
                    <div key={i} style={styles.trackRow}>
                      <div style={styles.trackBadge}>{i + 1}</div>
                      <div style={styles.trackName}>{t.name}</div>
                      <button
                        title="Remove"
                        onClick={() => setTracks((arr) => arr.filter((_, idx) => idx !== i))}
                        style={styles.trash}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <button style={styles.cta} onClick={() => setTab("decorate")}>Decorate →</button>
                </div>
              </div>
            )}

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
                        width: 40, height: 40, borderRadius: 10, border: "2px solid #e4e4e7",
                        background: c, cursor: "pointer"
                      }}
                      aria-label={`color ${c}`}
                    />
                  ))}
                  {/* Rainbow = open color picker */}
                  <label style={{
                    width: 40, height: 40, borderRadius: 10, border: "2px dashed #d4d4d8",
                    background: "linear-gradient(45deg, #ff0080, #ffcd1e, #00f5d4, #8e77ff)",
                    cursor: "pointer"
                  }}>
                    <input
                      type="color"
                      style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                      onChange={(e) => setCoverColor(e.target.value)}
                    />
                  </label>
                </div>

                <label style={{ ...styles.label, marginTop: 18 }}>Label (image)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <label style={{ ...styles.cta, background: "#efefef", color: "#222" }}>
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

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button style={{ ...styles.cta, background: "#fff", color: "#222", border: "1px solid #ddd" }}
                          onClick={() => setTab("songs")}>← Back</button>
                  <button style={styles.cta} onClick={() => setTab("preview")}>Preview →</button>
                </div>
              </div>
            )}

            {tab === "preview" && (
              <div>
                <h3 style={styles.h3}>Tracks</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {tracks.length === 0 && <div style={{ color: "#777" }}>No tracks yet.</div>}
                  {tracks.map((t, i) => (
                    <div key={i} style={styles.trackRow}>
                      <div style={styles.trackIndex}>{i + 1}.</div>
                      <div style={styles.trackName}>{t.name}</div>
                      <button style={styles.trash}
                        onClick={() => setTracks((arr) => arr.filter((_, idx) => idx !== i))}
                      >🗑</button>
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

                {/* Player controls */}
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                  <button style={styles.smallBtn} disabled>Prev</button>
                  <button style={styles.smallBtn} disabled>Rewind</button>
                  <button style={styles.smallBtn} onClick={pause}>Stop</button>
                  <button style={{ ...styles.smallBtn, background: "#fff" }} onClick={isPlaying ? pause : play}>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button style={styles.smallBtn} disabled>F.F</button>
                  <button style={styles.smallBtn} disabled>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: 3D cassette (big, like mockup) */}
        <div style={styles.canvasWrap}>
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 35 }}>
            <color attach="background" args={["#ffffff"]} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 3, 4]} intensity={1.2} />
            <directionalLight position={[-3, -2, 2]} intensity={0.4} />
            <Environment preset="studio" />
            <ContactShadows position={[0, -0.85, 0]} opacity={0.25} scale={10} blur={2.8} far={5} />

            <React.Suspense fallback={<LoaderOverlay />}>
              <Center scale={2.9}>
                <MixtapeModel
                  coverColor={coverColor}
                  screwsTone={"dark"}
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

/* ---------- PRESENTATION STYLES (matching your mockups) ---------- */
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
    whiteSpace: "normal", 
    wordWrap: "break-word",
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
    width: 36, height: 36, borderRadius: 10, background: "#EDEDF5",
    display: "grid", placeItems: "center", fontWeight: 700,
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
    background: "#F2F2F7",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
  },
  canvasWrap: {
    border: "1px solid #E5E5EA",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 8px 30px rgba(0,0,0,.06)",
    width: "100%",
    aspectRatio: "4 / 3",
    overflow: "hidden",
  },
};

/* Preload the model */
useGLTF.preload(MODEL_URL);
