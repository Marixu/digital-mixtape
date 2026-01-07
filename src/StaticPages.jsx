export default function StaticPages({
  currentPage,
  setCurrentPage,
}) {
  if (
    currentPage !== "terms" &&
    currentPage !== "privacy" &&
    currentPage !== "about"
  ) {
    return null;
  }

  return (
    <>
    {/* ================= TERMS ================= */}
{currentPage === "terms" && (
  <div className="mobile-scroll">
    <div className="mobile-legal">
      
      <h2>Terms of Use</h2>
      
      <h3>1. About Digital Mixtape</h3>
      <p>
        Digital Mixtape is a tool for creating and sharing music as virtual gifts through customizing cassette tapes.
      </p>
      
      <h3>2. User Content & Ownership</h3>
      <p>
        All content added by users remains the property of its respective owners. Digital Mixtape does not claim ownership of user content.
      </p>
      <p>
        By using the service, you confirm that you own the rights to the content you upload or have permission to use it.
      </p>
      
      <h3>3. Copyright Responsibility</h3>
      <p>
        Users are responsible for ensuring their content does not infringe on copyright or other rights.
      </p>
      <p>
        We encourage the use of original or royalty-free music. Digital Mixtape does not sell or monetize uploaded music.
      </p>
      
      <h3>4. Content Removal & Contact</h3>
      <p>
        We may remove content that violates these Terms or applicable laws.
      </p>
      <p>
        If you believe your copyrighted work has been used improperly, please contact us.
      </p>
      
      <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}
{/* ================= PRIVACY ================= */}
{currentPage === "privacy" && (
  <div className="mobile-scroll">
    <div className="mobile-legal">
      <h2>Privacy Policy</h2>
      
      <p>We respect your privacy.</p>
      
      <p>
        The only data we store is user-generated content, including uploaded audio files, music links, images, and mixtape configuration data.
      </p>
      
      <p>
        This data is used solely to provide the Digital Mixtape service.
      </p>
      
      <p>
        We do not sell or share user data.<br />
        Content is stored securely using third-party infrastructure providers for hosting and storage.
      </p>
      
      <p>
        Users may request deletion of their content at any time by contacting us.
      </p>
      
      <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}
  {/* ================= ABOUT MOBILE ================= */}
{currentPage === "about" && (
  <div className="mobile-scroll">
    <div className="mobile-about">
      <h2>About</h2>
      
      <div className="mobile-about-image">
  <img 
    src="/me2.webp" 
    alt="Maria"
    style={{
      width: 150,
      height: 150,
      objectFit: "cover",
    }}
  />
</div>
      
      <div className="mobile-about-text">
        <p>
          Hello! I'm Maria, an interaction designer who builds experimental human-computer driven experiences.
        </p>
        
        <p>
          I created this website with a wish to make the internet a more fun and magical place, through sharing personal, intentional and special music, like the times of cassette tapes! 
          
        </p>
        
        
        <p>
          If you're interested in my journey of exploring creative technology, find me at{" "}
          <a 
            href="https://instagram.com/softparticle" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: "#ff69b4", textDecoration: "none" }}
          >
            @Softparticle
          </a>
        </p>
        
        <p>
          I hope you have fun making mixtapes &lt;3
      
        </p>
      </div>
    
    <button
  onClick={() => setCurrentPage("home")}
  style={{
    marginTop: 30,
    padding: "12px 24px",
    background: "transparent",
    color: "#000",
    border: "1px solid #000",
    borderRadius: 20,
    fontFamily: "'Hoover', sans serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  }}
>
  ← Back
</button>
    </div>
  </div>
)}