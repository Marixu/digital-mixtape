export default function Header({
  isMobile,
  isTablet,
  isDarkBg,
  currentPage,
  setCurrentPage,
}) {


  if (isMobile) {
    return (
      <>
    <div className="mobile-header" 
    style={{ padding: isTablet ? "8px 40px" : undefined }}
    
    >

   <div className="mobile-header-top">
    <button
      className="mobile-header-link"
      onClick={() => setCurrentPage("home")}
      style={{
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        fontSize: isTablet ? 14 : undefined,
      }}
    >
     <a
      href="https://www.instagram.com/softparticle/"
      target="_blank"
      rel="noopener noreferrer"
    >
      @Softparticle
    </a>
    </button>

    <button
      className="mobile-header-link"
      onClick={() => {
        if (currentPage === "about") {
          setCurrentPage("home");
        } else {
          setCurrentPage("about");
        }
      }}
      style={{
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        fontSize: isTablet ? 14 : undefined,
      }}
    >
      {currentPage === "about" ? "Digital Mixtape" : "About"}
    </button>
  </div>
</div>

{/* Only show "Digital Mixtape" title on home page */}
{currentPage === "home" && (
  <div 
    className="mobile-header-title"
    onClick={() => setCurrentPage("home")}
    style={{
      color: isDarkBg ? "#fff" : "#000",
      textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
      fontSize: isTablet ? 24 : undefined,
      marginTop: isTablet ? 10 : undefined,
    }}
  >
    Digital Mixtape
  </div>
  )}
  </>
)}

  return (
    <>
<div
  className="desktop-header"
  style={{
    width: "100%",
    margin: "0 auto",
    padding: "8px 0 0",
  }}
>
  {/* top row */}
  <div
    className="desktop-header-top"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%", 
      maxWidth: "none", 
      margin: "0 auto",
      padding: "0 10px",
    }}
  >
    <button
      onClick={() => setCurrentPage("home")}
      style={{
        background: "none",
        border: "none",
        fontFamily: "'Hoover', sans-serif",
        fontSize: isTablet ? 14 : 14,
        fontWeight: 600,
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      @Softparticle
    </button>

    <button
      onClick={() => {
        if (currentPage === "about") setCurrentPage("home");
        else setCurrentPage("about");
      }}
      style={{
        background: "none",
        border: "none",
        fontFamily: "'Hoover', sans-serif",
        fontSize: isTablet ? 14 : 14,
        fontWeight: 600,
        color: isDarkBg ? "#fff" : "#000",
        textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {currentPage === "about" ? "Digital Mixtape" : "About"}
    </button>
  </div>

 <div className="center-column-desktop">

  {/* title under (home only) */}
  {currentPage === "home" && (
    <div
      onClick={() => setCurrentPage("home")}
      style={{
    marginTop: 15,
    marginBottom: isTablet ? 20 : -5,
    textAlign: "center",
    fontFamily: "'Array', sans-serif",
    fontSize: "40px",
    letterSpacing: "0.03em",
    color: isDarkBg ? "#fff" : "#000",
    textShadow: isDarkBg ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
    cursor: "pointer",
    userSelect: "none",
    paddingLeft: isTablet ? 100 : 0,
    visibility: currentPage === "home" ? "visible" : "hidden",
  }}
    >
      Digital Mixtape
    </div>
  )}
</div>
</div>
</>
);
}
