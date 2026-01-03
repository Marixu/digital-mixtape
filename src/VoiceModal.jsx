// components/VoiceModal.jsx

export default function VoiceModal({
  showVoiceRecorder,
  isMobile,
  isRecording,
  isProcessingRecording,
  recordingTime,
  startRecording,
  stopRecording,
  cancelRecording,
  formatRecordingTime,
}) {
  if (!showVoiceRecorder) return null;

  if (isMobile) {
    return (
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
          if (e.target === e.currentTarget && !isProcessingRecording) cancelRecording();
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
            fontFamily: "'Hoover', sans-serif",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: 28, marginBottom: 15 }}>
  {isProcessingRecording ? (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
    </svg>
  ) : (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
      />
    </svg>
  )}
</div>


          <h3 style={{ margin: "0 0 20px", color: "#000", fontSize: 18, fontWeight: 700 }}>
            {isProcessingRecording ? "Saving..." : isRecording ? "Recording..." : "Voice Recorder"}
          </h3>

          <div
            style={{
              fontSize: 42,
              fontFamily: "'Hoover', sans-serif",
              color: isRecording ? "#ff69b4" : "#1a1a1a",
              marginBottom: 20,
              fontWeight: 700,
            }}
          >
            {formatRecordingTime(recordingTime)}
          </div>

          {(isRecording || isProcessingRecording) && (
            <div
              style={{
                width: 12,
                height: 12,
                background: isRecording ? "#ff69b4" : "#888",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isProcessingRecording ? (
              <div
                style={{
                  padding: "16px 20px",
                  background: "#e0e0e0",
                  color: "#666",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "'Hoover', sans-serif",
                }}
              >
                Saving your recording...
              </div>
            ) : !isRecording ? (
              <button
                onClick={startRecording}
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
                  fontFamily: "'Hoover', sans-serif",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
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
                  fontFamily: "'Hoover', sans-serif",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Stop & Save
              </button>
            )}

            {!isProcessingRecording && (
              <button
                onClick={cancelRecording}
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
                  fontFamily: "'Hoover', sans-serif",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Cancel
              </button>
            )}
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
        transform: "translate3d(0,0,0)",
        WebkitTransform: "translate3d(0,0,0)",
        isolation: "isolate",
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessingRecording) cancelRecording();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "40px 50px",
          textAlign: "center",
          width: 360,
          fontFamily: "'Hoover', sans-serif",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 28, marginBottom: 15 }}>
  {isProcessingRecording ? (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
    </svg>
  ) : (
    <svg
      className="w-6 h-6 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"
      />
    </svg>
  )}
</div>


        <h3 style={{ margin: "0 0 24px", color: "#000", fontSize: 22, fontWeight: 700 }}>
          {isProcessingRecording ? "Saving..." : isRecording ? "Recording..." : "Voice Recorder"}
        </h3>

        <div
          style={{
            fontSize: 56,
            fontFamily: "'Hoover', sans-serif",
            color: isRecording ? "#ff69b4" : "#1a1a1a",
            marginBottom: 24,
            fontWeight: 700,
          }}
        >
          {formatRecordingTime(recordingTime)}
        </div>

        {(isRecording || isProcessingRecording) && (
          <div
            style={{
              width: 16,
              height: 16,
              background: isRecording ? "#ff69b4" : "#888",
              borderRadius: "50%",
              margin: "0 auto 24px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {isProcessingRecording ? (
            <div
              style={{
                padding: "14px 32px",
                background: "#e0e0e0",
                color: "#666",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Hoover', sans-serif",
              }}
            >
              Saving...
            </div>
          ) : !isRecording ? (
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
                fontFamily: "'Hoover', sans-serif",
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
                fontFamily: "'Hoover', sans-serif",
              }}
            >
              Stop & Save
            </button>
          )}

          {!isProcessingRecording && (
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
                fontFamily: "'Hoover', sans-serif",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}