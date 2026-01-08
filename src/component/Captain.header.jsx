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
      case '/team':
      case '/':
        return 'Team Management';
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

  return (
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
                {/* <button 
                  className={`breadcrumb-item ${location.pathname === '/team' || location.pathname === '/' ? 'active' : ''}`}
                  onClick={() => navigate('/team')}
                >
                  <span className="breadcrumb-number">01</span>
                  <span className="breadcrumb-text">Team</span>
                </button>
                <div className="breadcrumb-separator">→</div> */}
               
                
                <button 
                  className={`breadcrumb-item ${location.pathname === '/captain' ? 'active' : ''}`}
                  onClick={() => navigate('/captain')}
                >
                  {/* <span className="breadcrumb-number">01</span> */}
                  <span className="breadcrumb-text">Dashboard</span>
                </button>
                <div className="breadcrumb-separator">→</div>
                 <button 
                  className={`breadcrumb-item ${location.pathname === '/book-slots' ? 'active' : ''}`}
                  onClick={() => navigate('/book-slots')}
                >
                  {/* <span className="breadcrumb-number">02</span> */}
                  <span className="breadcrumb-text">Booking</span>
                </button>
              </nav>
            </div>

            {/* Right: User Info and Actions */}
            <div className="header-right">
              {/* Notifications */}
              <div className="header-actions">
                <button 
                  className="action-btn notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  disabled={isExporting}
                >
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="notification-badge">{notifications}</span>
                  )}
                </button>

                {/* Settings */}
                <button 
                  className="action-btn settings-btn"
                  onClick={() => navigate('/settings')}
                  disabled={isExporting}
                >
                  <Settings size={20} />
                </button>

                {/* User Profile */}
                <div className="user-profile-dropdown">
                  <div className="user-profile-card">
                    <div className="user-avatar-wrapper">
                      <div className="user-avatar">
                        <User size={24} />
                      </div>
                      <div className="online-status"></div>
                    </div>
                    <div className="user-info">
                      <span className="user-name">{currentUser?.name || currentUser?.email || 'Guest'}</span>
                      <span className="user-role">
                        <Shield size={12} />
                        Team Captain
                      </span>
                    </div>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => navigate('/profile')}
                      disabled={isExporting}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => navigate('/settings')}
                      disabled={isExporting}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-item"
                      onClick={onLogout}
                      disabled={isExporting}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  className="mobile-menu-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications ({notifications})</h3>
            <button 
              className="clear-btn"
              onClick={() => setShowNotifications(false)}
            >
              Clear All
            </button>
          </div>
          <div className="notifications-list">
            <div className="notification-item unread">
              <div className="notification-icon">
                <Calendar size={16} />
              </div>
              <div className="notification-content">
                <p className="notification-title">Slot Booking Confirmed</p>
                <p className="notification-time">10 minutes ago</p>
              </div>
            </div>
            <div className="notification-item unread">
              <div className="notification-icon">
                <Users size={16} />
              </div>
              <div className="notification-content">
                <p className="notification-title">New Player Joined</p>
                <p className="notification-time">1 hour ago</p>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon">
                <Trophy size={16} />
              </div>
              <div className="notification-content">
                <p className="notification-title">Tournament Update</p>
                <p className="notification-time">Yesterday</p>
              </div>
            </div>
          </div>
          <div className="notifications-footer">
            <button 
              className="view-all-btn"
              onClick={() => navigate('/notifications')}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-navigation">
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="user-avatar">
                <User size={28} />
              </div>
              <div className="mobile-user-details">
                <span className="user-name">{currentUser?.name || currentUser?.email || 'Guest'}</span>
                <span className="user-role">Team Captain</span>
              </div>
            </div>
          </div>
          
          <div className="mobile-nav-content">
            <button 
              className={`mobile-nav-item ${location.pathname === '/team' || location.pathname === '/' ? 'active' : ''}`}
              onClick={() => handleNavigation('/team')}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <Home size={22} />
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Team Management</span>
                <span className="mobile-nav-subtitle">Manage your team and players</span>
              </div>
            </button>
            
            <button 
              className={`mobile-nav-item ${location.pathname === '/book-slots' ? 'active' : ''}`}
              onClick={() => handleNavigation('/book-slots')}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <Calendar size={22} />
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Slot Booking</span>
                <span className="mobile-nav-subtitle">Book practice slots</span>
              </div>
            </button>
            
            <button 
              className={`mobile-nav-item ${location.pathname === '/captain' ? 'active' : ''}`}
              onClick={() => handleNavigation('/captain')}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <Users size={22} />
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Captain Dashboard</span>
                <span className="mobile-nav-subtitle">Team analytics & insights</span>
              </div>
            </button>
            
            <div className="mobile-nav-divider"></div>
            
            <button 
              className="mobile-nav-item"
              onClick={() => handleNavigation('/notifications')}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <Bell size={22} />
                {notifications > 0 && (
                  <span className="mobile-notification-badge">{notifications}</span>
                )}
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Notifications</span>
                <span className="mobile-nav-subtitle">{notifications} unread</span>
              </div>
            </button>
            
            <button 
              className="mobile-nav-item"
              onClick={() => handleNavigation('/settings')}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <Settings size={22} />
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Settings</span>
                <span className="mobile-nav-subtitle">Account preferences</span>
              </div>
            </button>
            
            <div className="mobile-nav-divider"></div>
            
            <button 
              className="mobile-nav-item logout-item"
              onClick={onLogout}
              disabled={isExporting}
            >
              <div className="mobile-nav-icon">
                <LogOut size={22} />
              </div>
              <div className="mobile-nav-text">
                <span className="mobile-nav-title">Logout</span>
                <span className="mobile-nav-subtitle">Sign out of your account</span>
              </div>
            </button>
          </div>
          
          <div className="mobile-nav-footer">
            <div className="tournament-mobile-info">
              <div className="tournament-logo-small">
                <img src={logo} alt="CDS Premier League" />
              </div>
              <div className="tournament-mobile-text">
                <span className="tournament-mobile-title">CDS PREMIER LEAGUE</span>
                <span className="tournament-mobile-season">Season 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;