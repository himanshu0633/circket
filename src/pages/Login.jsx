import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const ballRef = useRef(null);
  const formRef = useRef(null);
  const containerRef = useRef(null);

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("cricket_login_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    
    if (!email || !password) {
      setMsg("Please fill in all fields");
      return;
    }
    
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      
      if (rememberMe) {
        localStorage.setItem("cricket_login_email", email);
      } else {
        localStorage.removeItem("cricket_login_email");
      }

      // Add success class for animation
      if (formRef.current) {
        formRef.current.classList.add('success');
        setTimeout(() => {
          if (res.data.role === "admin") navigate("/admin");
          else navigate("/captain");
        }, 1000);
      }
      
    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");
      // Add error animation
      if (formRef.current) {
        formRef.current.classList.add('error');
        setTimeout(() => {
          formRef.current.classList.remove('error');
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" ref={containerRef}>
      {/* Cricket Field Background */}
      <div className="cricket-field">
        <div className="pitch"></div>
        <div className="stumps">
          <div className="bails"></div>
        </div>
        <div className="cricket-ball" ref={ballRef}></div>
        <div className="ball-shadow"></div>
        <div className="boundary"></div>
        
        {/* Fielders */}
        <div className="fielder fielder1"></div>
        <div className="fielder fielder2"></div>
        
        {/* Cricket Equipment */}
        <div className="cricket-bat"></div>
        <div className="cricket-glove"></div>
      </div>
      
      {/* Clouds */}
      <div className="cloud"></div>
      <div className="cloud cloud2"></div>

      {/* Login Form */}
      <div className="login-card">
        <div className="card-header">
          <div className="cricket-logo">
            <div className="logo-bat"></div>
            <div className="logo-ball"></div>
          </div>
          <h1 className="title">Welcome to Cricket Manager</h1>
         
        </div>

        <form onSubmit={handleLogin} className="login-form" ref={formRef}>
          {msg && (
            <div className={`message ${msg.includes('failed') ? 'error' : 'info'}`}>
              <span className="message-icon">
                {msg.includes('failed') ? '⚠️' : 'ℹ️'}
              </span>
              {msg}
            </div>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
              <span className="input-icon">📧</span>
              <div className="input-underline"></div>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <span className="input-icon">🔒</span>
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              <div className="input-underline"></div>
            </div>
            
            {/* Password strength indicator */}
            <div className="password-strength">
              <div className={`strength-bar ${password.length > 0 ? 'active' : ''}`}>
                <div className={`strength-fill ${
                  password.length > 8 ? 'strong' : 
                  password.length > 4 ? 'medium' : 'weak'
                }`}></div>
              </div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="checkbox-input"
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            
          
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <span className="btn-icon">🏏</span>
                Sign In
              </>
            )}
          </button>

          <div className="form-footer">
          
            
            <div className="role-info">
              <div className="role-badge admin">
                <span className="badge-icon">👑</span>
                Admin
              </div>
              <div className="role-badge captain">
                <span className="badge-icon">🎯</span>
                Captain
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}