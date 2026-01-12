import React, { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../pages/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  
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
    
    // Start cricket ball animation
    const animateBall = () => {
      if (ballRef.current) {
        ballRef.current.classList.add('bouncing');
        setTimeout(() => {
          if (ballRef.current) {
            ballRef.current.classList.remove('bouncing');
          }
        }, 2000);
      }
    };
    
    // Animate ball every 5 seconds
    const ballInterval = setInterval(animateBall, 5000);
    
    // Initial animation
    setTimeout(animateBall, 1000);
    
    return () => clearInterval(ballInterval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Please fill in all fields");
      setBounceAnimation(true);
      setTimeout(() => setBounceAnimation(false), 1000);
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      /* ===============================
         ✅ LOCAL STORAGE SAVE (NEW)
      =============================== */

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("paymentStatus", res.data.paymentStatus);

      // 👤 FULL USER DATA
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Remember Me
      if (rememberMe) {
        localStorage.setItem("cricket_login_email", email);
      } else {
        localStorage.removeItem("cricket_login_email");
      }

      /* ===============================
         🎉 EXISTING UI ANIMATION (SAME)
      =============================== */
      if (formRef.current) {
        formRef.current.classList.add("success");
        if (ballRef.current) {
          ballRef.current.classList.add("hit");
        }

        setTimeout(() => {
          if (res.data.user.role === "admin") navigate("/admin");
          else navigate("/captain");
        }, 1500);
      }

    } catch (err) {
      setMsg(err?.response?.data?.message || "Login failed");

      if (formRef.current) {
        formRef.current.classList.add("error");
        if (ballRef.current) {
          ballRef.current.classList.add("shake");
          setTimeout(() => {
            ballRef.current.classList.remove("shake");
          }, 500);
        }
        setTimeout(() => {
          formRef.current.classList.remove("error");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container" ref={containerRef}>
        {/* Left Side - Enhanced Cricket Field */}
        <div className="login-field-left">
          <div className="login-pitch"></div>
          
          {/* Stumps at both ends */}
          <div className="login-stumps login-stumps-left">
            <div className="login-stump login-stump-1"></div>
            <div className="login-stump login-stump-2"></div>
            <div className="login-stump login-stump-3"></div>
            <div className="login-bails"></div>
          </div>
          
          <div className="login-stumps login-stumps-right">
            <div className="login-stump login-stump-1"></div>
            <div className="login-stump login-stump-2"></div>
            <div className="login-stump login-stump-3"></div>
            <div className="login-bails"></div>
          </div>
          
          {/* Animated Cricket Ball */}
          <div className="login-cricket-ball" ref={ballRef}>
            <div className="login-ball-seam"></div>
            <div className="login-ball-shine"></div>
          </div>
          
          {/* Ball Trail Effect */}
          <div className="login-ball-trail-container">
            <div className="login-trail-dot login-dot-1"></div>
            <div className="login-trail-dot login-dot-2"></div>
            <div className="login-trail-dot login-dot-3"></div>
            <div className="login-trail-dot login-dot-4"></div>
            <div className="login-trail-dot login-dot-5"></div>
          </div>
          
          {/* Fielders positioned around the field */}
          <div className="login-fielder login-fielder-1">
            <div className="login-fielder-body"></div>
            <div className="login-fielder-shadow"></div>
          </div>
          <div className="login-fielder login-fielder-2">
            <div className="login-fielder-body"></div>
            <div className="login-fielder-shadow"></div>
          </div>
          <div className="login-fielder login-fielder-3">
            <div className="login-fielder-body"></div>
            <div className="login-fielder-shadow"></div>
          </div>
          <div className="login-fielder login-fielder-4">
            <div className="login-fielder-body"></div>
            <div className="login-fielder-shadow"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-card-right">
          <div className="login-logo-container">
            <div className="login-logo-wrapper">
              <img src={logo} alt="CDS Premier League Logo" className="login-logo-image" />
              <div className="login-logo-glow"></div>
              <div className="login-logo-shine"></div>
            </div>
          </div>
          
          <div className="login-title-container">
            <h1 className="login-title">CDS Premier League</h1>
            <div className="login-title-underline">
              <div className="login-underline-line"></div>
              <div className="login-underline-ball"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className={`login-form ${bounceAnimation ? 'bounce' : ''}`} ref={formRef}>
            {msg && (
              <div className={`login-message ${msg.includes('failed') || msg.includes('Please') || msg.includes('coming soon') ? 'info' : 'info'}`}>
                <span className="login-message-icon">
                  {msg.includes('failed') ? '⚠️' : msg.includes('Please') ? 'ℹ️' : 'ℹ️'}
                </span>
                <span className="login-message-text">{msg}</span>
                <div className="login-message-underline"></div>
              </div>
            )}

            <div className="login-form-group">
              <label className="login-form-label">Email Address</label>
              <div className="login-input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-form-input"
                />
                <span className="login-input-icon">📧</span>
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-form-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-form-input"
                />
                <span className="login-input-icon">🔒</span>
                <button 
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="login-toggle-icon">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              
              {/* Password strength indicator */}
              <div className="login-password-strength">
                <div className="login-strength-labels">
                  <span className={`login-strength-label ${password.length === 0 ? 'active' : ''}`}>Weak</span>
                  <span className={`login-strength-label ${password.length > 4 && password.length <= 8 ? 'active' : ''}`}>Medium</span>
                  <span className={`login-strength-label ${password.length > 8 ? 'active' : ''}`}>Strong</span>
                </div>
                <div className="login-strength-bar">
                  <div 
                    className={`login-strength-fill ${
                      password.length > 8 ? 'strong' : 
                      password.length > 4 ? 'medium' : 'weak'
                    }`}
                    style={{width: `${Math.min(password.length * 10, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="login-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <label htmlFor="rememberMe" className="login-checkbox-label">
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              className={`login-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  <span className="login-btn-text">Signing In...</span>
                  <span className="login-btn-cricket">🏏</span>
                </>
              ) : (
                <>
                  <span className="login-btn-icon">🎯</span>
                  <span className="login-btn-text">Sign In</span>
                  <span className="login-btn-cricket">🏏</span>
                  <div className="login-btn-shine"></div>
                  <div className="login-btn-pulse"></div>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="login-register-link">
              <span>New here?</span>
              <button
                type="button"
                className="login-register-btn"
                onClick={() => setOpenRegister(true)}
              >
                Register as Captain
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Register Popup */}
      <RegisterPopup open={openRegister} onClose={() => setOpenRegister(false)} />
    </>
  );
}

// Register Popup Component
function RegisterPopup({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: ""
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      await API.post("/admin/createTeamCaptain", form);

      setMsg("✅ Registration successful! You can login now.");
      setForm({ name: "", email: "", phoneNo: "", password: "" });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="register-overlay">
      <div className="register-modal">
        <h2>Register as Captain</h2>

        {msg && <p className={`register-msg ${msg.includes('✅') ? 'success' : 'error'}`}>{msg}</p>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <input
              type="tel"
              name="phoneNo"
              placeholder="Mobile Number"
              value={form.phoneNo}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <button 
            type="submit" 
            className={`register-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <button className="register-close" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
}