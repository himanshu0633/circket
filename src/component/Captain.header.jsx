import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Calendar, Home, Users, Menu, X, Bell, Settings, Trophy } from 'lucide-react';
import logo from '../../src/assets/logo.png';
import './Captain.header.css';

const Header = ({ currentUser, onLogout, isExporting }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifications] = React.useState(3); // Mock notification count
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Get current page title
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/book-slots':
        return 'Slot Booking';
      case '/captain':
        return 'Captain Dashboard';
      default:
        return 'CDS Premier League';
    }
  };

  const getPageIcon = () => {
    switch(location.pathname) {
      case '/team':
      case '/':
        return <Home size={22} />;
      case '/book-slots':
        return <Calendar size={22} />;
      case '/captain':
        return <Users size={22} />;
      default:
        return <Trophy size={22} />;
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setMobileMenuOpen(false);
  };

  // Sidebar navigation items
  const navItems = [
    { path: '/captain', label: 'Dashboard', icon: <Users size={20} /> },
    { path: '/book-slots', label: 'Booking', icon: <Calendar size={20} /> },
  ];

  return (
    <>
      <header className="captain-header">
        {/* Top Bar */}
        <div className="header-top-bar">

          
          <div className="container">
            <div className="top-bar-content">
              {/* Left: Logo and Tournament Info */}
              <div className="header-left">
                <div className="tournament-info" onClick={() => navigate('/team')} style={{cursor: 'pointer'}}>
                  <div className="tournament-logo">
                    <img src={logo} alt="CDS Premier League" className="header-logo" />
                    <div className="logo-glow"></div>
                  </div>
                  <div className="tournament-text">
                    <h1 className="tournament-title">
                      <span className="tournament-name">CDS</span>
                      <span className="tournament-premier">PREMIER LEAGUE</span>
                    </h1>
                    <div className="tournament-meta">
                      <span className="season-tag">SEASON 2026</span>
                      <span className="divider">•</span>
                      <span className="live-status">
                        <span className="status-dot"></span>
                        LIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hamburger Menu Button */}
                <button 
                  className="hamburger-menu"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Center: Page Title and Navigation */}
              <div className="header-center">
                <div className="page-title-wrapper">
                  <div className="page-icon">
                    {getPageIcon()}
                  </div>
                  <h2 className="current-page-title">{getPageTitle()}</h2>
                </div>
                
                {/* Breadcrumb Navigation */}
                <nav className="breadcrumb-nav">
                  <button 
                    className={`breadcrumb-item ${location.pathname === '/captain' ? 'active' : ''}`}
                    onClick={() => navigate('/captain')}
                  >
                    <span className="breadcrumb-text">Dashboard</span>
                  </button>
                  <div className="breadcrumb-separator">→</div>
                  <button 
                    className={`breadcrumb-item ${location.pathname === '/book-slots' ? 'active' : ''}`}
                    onClick={() => navigate('/book-slots')}
                  >
                    <span className="breadcrumb-text">Booking</span>
                  </button>
                </nav>
              </div>
              <div className="header-right">
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-details">
              <h3 className="user-name">{currentUser?.name || 'Captain'}</h3>
              <span className="user-role">Team Captain</span>
            </div>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;