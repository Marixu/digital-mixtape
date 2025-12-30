// 🧩 DIGITAL MIXTAPE – React + Three.js (fully fixed version)
import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

const MODEL_URL = "/models/Mixtape.glb";
console.log("🔥 File loaded and running!");

// ---------------- LOADER ----------------
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="px-4 py-2 rounded-xl shadow border bg-white text-black text-sm">
        Loading… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

// ---------------- MODEL ----------------


function MixtapeModel({ coverColor, labelImageTexture }) {
  const { scene } = useGLTF(MODEL_URL);

  // ✅ Log model hierarchy once for debugging
  React.useEffect(() => {
    if (!scene) return;
    const names = [];
    scene.traverse((o) => names.push(o.name));
    console.log("🧱 Scene objects:", names);
  }, [scene]);

  // ✅ 1. Apply color to Cover mesh
  React.useEffect(() => {
    if (!scene) return;
    scene.traverse((o) => {
      if (o.isMesh && o.name === "Cover") {
        if (!o.userData.isCloned) {
          o.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(coverColor),
            roughness: 0.4,
            metalness: 0.1,
          });
          o.userData.isCloned = true;
        } else {
          o.material.color.set(coverColor);
        }
        o.material.needsUpdate = true;
      }
    });
  }, [scene, coverColor]);

  // ✅ 2. Make screws metallic
  React.useEffect(() => {
    if (!scene) return;
    const screws = [];
    scene.traverse((o) => {
      if (o.isMesh && o.name.toLowerCase().includes("screw")) screws.push(o);
    });
    console.log("🔩 Screws found:", screws.map((s) => s.name));
    screws.forEach((s) => {
      s.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#b0b7c0"),
        metalness: 1.0,
        roughness: 0.25,
        envMapIntensity: 2.0,
      });
      s.material.needsUpdate = true;
    });
  }, [scene]);

  // ✅ 3. Apply uploaded label texture
  React.useEffect(() => {
    if (!scene) return;
    scene.traverse((o) => {
      if (o.isMesh && o.name === "Label_front") {
        if (labelImageTexture) {
          o.material = new THREE.MeshStandardMaterial({
            map: labelImageTexture,
            roughness: 0.35,
            metalness: 0.15,
          });
          o.material.map.needsUpdate = true;
        } else {
          o.material = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            roughness: 0.35,
            metalness: 0.15,
          });
        }
        o.material.needsUpdate = true;
      }
    });
  }, [scene, labelImageTexture]);

  if (!scene) return null;
  return <primitive object={scene} dispose={null} />;
}

// ---------------- ORBIT CONTROLS ----------------
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

// ---------------- MAIN APP ----------------
export default function DigitalMixtape() {
  const [coverColor, setCoverColor] = React.useState("#E6E6E6");
  const [labelImageTexture, setLabelImageTexture] = React.useState(null);
  const [labelText, setLabelText] = React.useState("");

  const onUpload = React.useCallback((file) => {
    const url = URL.createObjectURL(file);
    new THREE.TextureLoader().load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      setLabelImageTexture(tex);
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-black flex flex-col items-center justify-start p-8 relative">
      <img
        src="/Mixtape_logo3.png"
        alt="Digital Mixtape Logo"
        className="w-72 mb-8"
      />

      <div className="flex flex-col lg:flex-row items-start justify-center gap-10 w-full max-w-6xl">
        {/* LEFT PANEL */}
        <div className="w-full max-w-sm bg-white border rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Customize your Cover</h2>

          <div className="flex flex-col gap-3">
            <label>Cover Color</label>
            <input
              type="color"
              value={coverColor}
              onChange={(e) => setCoverColor(e.target.value)}
            />

            <label>Upload Label Image</label>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
              {labelImageTexture && (
                <button
                  onClick={() => setLabelImageTexture(null)}
                  className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Reset
                </button>
              )}
            </div>

            <label>Label Text</label>
            <input
              type="text"
              placeholder="Type your mixtape title..."
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* 3D CANVAS */}
        <div className="w-[900px] aspect-[4/3] bg-white rounded-2xl border shadow flex items-center justify-center">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 35 }}>
            <color attach="background" args={["#ffffff"]} />
            <Environment preset="city" environmentIntensity={0} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[2, 3, 4]} intensity={0.4} />

            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.35}
              scale={8}
              blur={3.8}
              far={5}
            />

            <React.Suspense fallback={<LoaderOverlay />}>
              <Center scale={2.6}>
                {console.log("🟢 Rendering MixtapeModel component")}
                <MixtapeModel
                  coverColor={coverColor}
                  labelImageTexture={labelImageTexture}
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

useGLTF.preload(MODEL_URL);
export { MixtapeModel };
