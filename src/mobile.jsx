export default function Mobile({
  renderMixtape,
  renderControls,
  isPreviewMode,
}) {
  return (
    <div className="mobile-shell">
      <div className="mobile-header">
        <div className="mobile-title">Digital Mixtape</div>
      </div>

      <div className="mobile-mixtape">
        {renderMixtape()}
      </div>

      {!isPreviewMode && (
        <div className="mobile-editor">
          {/* Mobile editor comes later */}
        </div>
      )}

      <div className="mobile-tray">
        {renderControls()}
      </div>
    </div>
  );
}
