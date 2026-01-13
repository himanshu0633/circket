import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";

function Header() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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

          <div>
            {/* <div style={{ fontWeight: "bolder", fontSize: "0.9rem", color: " #00308F" }}>
              CDS CRICKET LEAGUE
            </div> */}
            <div style={{ fontSize: "0.75rem" }}>
             
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="title-section">
          <div className="main-title">CDS PREMIER CRICKET LEAGUE</div>
          <div className="sub-title">Daily Professional Cricket Tournament</div>
        </div>

        {/* RIGHT */}
        <button className="login-btn login-bnt-padnig" onClick={() => navigate("/playerRegistration")}>
          Register As Player
        </button>
        
        <button className="login-btn" onClick={() => navigate("/login")}>
          Register
        </button>

      </div>
    </header>
  );
}

export default Header;
