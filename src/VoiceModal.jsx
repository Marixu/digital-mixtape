// components/VoiceModal.jsx

export default function VoiceModal({
  showVoiceRecorder,
  isMobile,
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  cancelRecording,
  formatRecordingTime,
}) {
  // 🔑 If not visible, render nothing
  if (!showVoiceRecorder) return null;

  // 📱 MOBILE
  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) cancelRecording();
        }}
      >
        {/* Voice Recorder Modal - Mobile */}
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

      </div>
    );
  }

  // 🖥 DESKTOP
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483647,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cancelRecording();
      }}
    >
      
{/* Voice Recorder Modal - Desktop - ADD THIS AS A SEPARATE BLOCK */}
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2147483647, // 🔥 force above everything
      transform: "translate3d(0,0,0)",
      WebkitTransform: "translate3d(0,0,0)",
      isolation: "isolate",          // 🔥 important
      pointerEvents: "auto",
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) cancelRecording();
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "40px 50px",
        textAlign: "center",
        width: 360,
        fontFamily: "'Hoover', sans serif",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 20 }}>🎙️</div>
      
      <h3 style={{ margin: "0 0 24px", color: "#000", fontSize: 22, fontWeight: 700 }}>
        Voice Recorder
      </h3>
      
      <div
        style={{
          fontSize: 56,
          fontFamily: "'Hoover', sans serif",
          color: isRecording ? "#ff69b4" : "#1a1a1a",
          marginBottom: 24,
          fontWeight: 700,
        }}
      >
        {formatRecordingTime(recordingTime)}
      </div>
      
      {isRecording && (
        <div
          style={{
            width: 16,
            height: 16,
            background: "#ff69b4",
            borderRadius: "50%",
            margin: "0 auto 24px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
      
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {!isRecording ? (
          <button
            onClick={startRecording}
            style={{
              padding: "14px 32px",
              background: "#ff69b4",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Hoover', sans serif",
            }}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              padding: "14px 32px",
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Hoover', sans serif",
            }}
          >
            Stop & Save
          </button>
        )}
        
        <button
          onClick={cancelRecording}
          style={{
            padding: "14px 32px",
            background: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Hoover', sans serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
    </div>
  );
}

