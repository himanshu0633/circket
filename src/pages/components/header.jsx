import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";

function Header() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* LEFT → LOGO */}
        <div className="logo-section">
          <div
            className="logo"
            onClick={() => navigate("/")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/image/cds-logo.jpeg"
              alt="CDS LOGO"
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transition: "0.3s ease"
              }}
            />
          </div>
        </div>

        {/* CENTER - TITLE (Hidden on mobile if buttons are visible) */}
        <div className="title-section">
          <div className="main-title">CDS PREMIER CRICKET LEAGUE</div>
          <div className="sub-title">Daily Professional Cricket Tournament</div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* RIGHT - DESKTOP BUTTONS */}
        <div className="desktop-buttons">
          <button 
            className="login-btn login-bnt-padding" 
            onClick={() => navigate("/playerRegistration")}
          >
            Register As Player
          </button>
          
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
          >
            Register
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="mobile-menu-dropdown">
            <button 
              className="mobile-menu-item"
              onClick={() => {
                navigate("/playerRegistration");
                setIsMenuOpen(false);
              }}
            >
              Register As Player
            </button>
            <button 
              className="mobile-menu-item"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              Register
            </button>
            <button 
              className="mobile-menu-item"
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
            >
              Home
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;