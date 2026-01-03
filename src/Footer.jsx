export default function Footer({
  isPreviewMode,
  appMode,
  setCurrentPage,
}) {
    if (!(isPreviewMode || appMode === "editor")) return null;

   {/* ---------- FOOTER ---------- */}
   
   return (
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
      @Softparticle
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
);
}