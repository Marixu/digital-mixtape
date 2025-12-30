export default function Desktop({
  renderMixtape,
  renderControls,
  isPreviewMode,
}) {
  return (
    <div className="desktop-page">
      {/* HEADER stays in App.jsx JSX ABOVE */}

      <div className="main-grid">
        {!isPreviewMode && (
          <div className="left-column">
            {/* LEFT EDITOR stays in App.jsx JSX ABOVE */}
          </div>
        )}

        <div className="right-column">
          {renderMixtape()}
          {renderControls()}
        </div>
      </div>

      {/* FOOTER stays in App.jsx JSX BELOW */}
    </div>
  );
}
