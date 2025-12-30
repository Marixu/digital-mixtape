import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
const debug = false; // 👈 change to true when you want to debug the 3D scene

async function loadApp() {
  const module = debug
    ? await import("./DigitalMixtape.jsx")
    : await import("./App.jsx");
  const App = module.default; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

}

loadApp();