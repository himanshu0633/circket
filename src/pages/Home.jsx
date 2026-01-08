import React, { useEffect } from 'react';
import './Home.css'; // We'll create this CSS file separately
import { useNavigate } from "react-router-dom";


const Home = () => {
  // Scroll animations
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 120;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', revealOnScroll);
    };
  }, []);


  const navigate = useNavigate();


  // Register now function
  const handleRegister = () => {
    alert("CDS CRICKET LEAGUE REGISTRATION PROCESS:\n\n1. Visit Yamunanagar Ground Stadium Registration Office\n2. Fill Player Registration Form with Complete Details\n3. Submit Age Proof Document & Passport Size Photo\n4. Pay Tournament Registration Fee\n5. Select Your Preferred Match Time Slot\n\nContact for Assistance: +91 98765 43210\nRegistration Office Timing: 9:00 AM to 6:00 PM");
  };

  // Add click effect to slot cards
  const handleSlotCardClick = (e) => {
    e.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
      handleRegister();
    }, 200);
  };

  // Gallery item click effect
  const handleGalleryClick = (e) => {
    e.currentTarget.style.transform = 'scale(0.98)';
    setTimeout(() => {
      e.currentTarget.style.transform = '';
      alert("Check our social media for more match photos and videos!");
    }, 200);
  };

  // Logo hover effect
  const handleLogoHover = (e, isEnter) => {
    if (isEnter) {
      e.currentTarget.style.transform = 'rotate(15deg)';
    } else {
      e.currentTarget.style.transform = 'rotate(0deg)';
    }
  };

  return (
    <div className="home-container">
      {/* Animated Background Pattern */}
      <div className="bg-pattern"></div>
      
      {/* Header - White Navbar */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div 
              className="logo"
              onMouseEnter={(e) => handleLogoHover(e, true)}
              onMouseLeave={(e) => handleLogoHover(e, false)}
              
            >
              <img src="/image/cds-logo.jpeg" alt='CDS LOGO'  onClick={navigate("/")}/>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--cricket-blue)' }}>
                CDS CRICKET LEAGUE
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--cricket-green)' }}>
                Yamunanager Ground Stadium
              </div>
            </div>
          </div>
          
          <div className="title-section">
            <div className="main-title">CDS PREMIER CRICKET LEAGUE</div>
            <div className="sub-title">Daily Professional Cricket Tournament</div>
          </div>
          
          <div>
     <button onClick={() => navigate("/login")} className="login-btn">
  Register
</button>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>JOIN THE CRICKET REVOLUTION AT YAMUNANAGAR GROUND</h1>
          <p>Experience professional cricket at our state-of-the-art stadium. Daily matches with certified umpires, advanced facilities, and a perfect platform to showcase your talent. Register now for CDS Cricket Premier League 2025-26!</p>
          <button onClick={() => navigate("/login")} className="register-btn">
  Login
</button>
        </div>
        
        {/* Floating Cricket Balls */}
        <div className="cricket-ball ball-1"></div>
        <div className="cricket-ball ball-2"></div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Tournament Info */}
        <section className="info-section reveal">
          <h2 className="section-title">TOURNAMENT DETAILS & FEATURES</h2>
          <p className="section-subtitle">Professional cricket league organized by CDS at Yamunanagar Ground Stadium with world-class facilities</p>

          <div className="slot-cards">
            <div className="slot-card" onClick={handleSlotCardClick}>
              <div className="slot-icon"><i className="fas fa-trophy"></i></div>
              <div className="slot-time">PROFESSIONAL LEAGUE</div>
              <div className="slot-name">Certified Umpires & Professional Equipment</div>
            </div>
            
            <div className="slot-card" onClick={handleSlotCardClick}>
              <div className="slot-icon"><i className="fas fa-users"></i></div>
              <div className="slot-time">YOUTH FOCUSED</div>
              <div className="slot-name">Open for Players Aged 10-25 Years</div>
            </div>
            
            <div className="slot-card" onClick={handleSlotCardClick}>
              <div className="slot-icon"><i className="fas fa-calendar-alt"></i></div>
              <div className="slot-time">DAILY MATCHES</div>
              <div className="slot-name">Four Time Slots Available Every Day</div>
            </div>
            
            <div className="slot-card" onClick={handleSlotCardClick}>
              <div className="slot-icon"><i className="fas fa-medal"></i></div>
              <div className="slot-time">PRIZES & AWARDS</div>
              <div className="slot-name">Trophies, Medals & Certificates</div>
            </div>
          </div>
        </section>

        {/* Stadium Section */}
        <section className="stadium-section reveal" id="stadium">
          <div className="stadium-content">
            <div className="stadium-image">
              <img src="/image/stadium4.jpeg" alt="Cricket Match at Yamunanagar Ground Stadium" />
            </div>
            
            <div className="stadium-details">
              <h3>YAMUNANAGAR GROUND CRICKET STADIUM</h3>
              <p>Our professional cricket stadium in Yamunanagar provides world-class facilities for both day and night matches. With a perfect pitch, advanced floodlights, and spectator seating for 500+ people, we create the ideal environment for cricket enthusiasts.</p>
              
              <ul>
                <li><i className="fas fa-check-circle"></i> Professional Grade Cricket Pitch</li>
                <li><i className="fas fa-check-circle"></i> Advanced Floodlights for Night Matches</li>
                <li><i className="fas fa-check-circle"></i> 4 Acre Ground</li>
                <li><i className="fas fa-check-circle"></i> Modern Pavilion & Changing Rooms</li>
                <li><i className="fas fa-check-circle"></i> Practice Nets Available Daily</li>
                <li><i className="fas fa-check-circle"></i> First Aid & Medical Facilities On-Site</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Time Slots Section */}
        <section className="slots-section reveal">
          <div className="slots-container">
            <h2 className="section-title">DAILY MATCH TIME SLOTS</h2>
            <p className="section-subtitle">Same time slots available every day at Yamunanagar Ground Stadium. Choose your preferred match timing.</p>
            
            <div className="slot-cards">
              <div className="slot-card" onClick={handleSlotCardClick}>
                <div className="slot-icon"><i className="fas fa-sun"></i></div>
                <div className="slot-time">6:30 AM to 9:30 AM</div>
                <div className="slot-name">Morning Cricket Match Session</div>
              </div>
              
              <div className="slot-card" onClick={handleSlotCardClick}>
                <div className="slot-icon"><i className="fas fa-cloud-sun"></i></div>
                <div className="slot-time">10:00 AM to 1:00 PM</div>
                <div className="slot-name">Day Cricket Match Session</div>
              </div>
              
              <div className="slot-card" onClick={handleSlotCardClick}>
                <div className="slot-icon"><i className="fas fa-cloud-moon"></i></div>
                <div className="slot-time">5:00 PM to 8:00 PM</div>
                <div className="slot-name">Evening Cricket Match Session</div>
              </div>
              
              <div className="slot-card" onClick={handleSlotCardClick}>
                <div className="slot-icon"><i className="fas fa-moon"></i></div>
                <div className="slot-time">8:30 PM to 11:30 PM</div>
                <div className="slot-name">Night Cricket Match Session</div>
              </div>
            </div>
          </div>
        </section>

        {/* Match Gallery Section */}
       {/* Match Gallery Section */}
<section className="gallery-section reveal" id="gallery">
  <div className="gallery-container">
    <h2 className="section-title">MATCH GALLERY & HIGHLIGHTS</h2>
    <p className="section-subtitle">
      Experience the excitement through photos from our previous matches and tournaments
    </p>

    <div className="gallery-grid">

      {/* Match Action */}
      <div className="gallery-item auto-gallery">
        <div className="auto-track">
          <div className="auto-scroll">
            <img src="/image/batting1.jpeg" />
            <img src="/image/batting2.jpeg" />
            <img src="/image/batting3.jpeg" />

            <img src="/image/batting1.jpeg" />
            <img src="/image/batting2.jpeg" />
            <img src="/image/batting3.jpeg" />
          </div>
        </div>
        <div className="gallery-overlay">
          <b>Match Action Shot</b>
          <div>Exciting match moments</div>
        </div>
      </div>

      {/* Team Celebration */}
      <div className="gallery-item auto-gallery">
        <div className="auto-track">
          <div className="auto-scroll">
            <img src="/image/team1.jpeg" />
            <img src="/image/team2.jpeg" />
            <img src="/image/team3.jpeg" />
             <img src="/image/team4.jpeg" />

            <img src="/image/team1.jpeg" />
            <img src="/image/team2.jpeg" />
            <img src="/image/team3.jpeg" />
             <img src="/image/team4.jpeg" />
          </div>
        </div>
        <div className="gallery-overlay">
          <b>Team Celebration</b>
          <div>Winning moments</div>
        </div>
      </div>

      {/* Stadium */}
      <div className="gallery-item auto-gallery">
        <div className="auto-track">
          <div className="auto-scroll">
            <img src="/image/stadium4.jpeg" />
            <img src="/image/stadium2.jpeg" />
            <img src="/image/stadium3.jpeg" />
             <img src="/image/stadium4.jpeg" />

            <img src="/image/stadium1.jpeg" />
            <img src="/image/stadium2.jpeg" />
            <img src="/image/stadium3.jpeg" />
           <img src="/image/stadium4.jpeg" />

          </div>
        </div>
        <div className="gallery-overlay">
          <b>Stadium Overview</b>
          <div>Yamunanagar Ground full view</div>
        </div>
      </div>

      {/* Award Ceremony */}
      <div className="gallery-item auto-gallery">
        <div className="auto-track">
          <div className="auto-scroll">
            <img src="/image/award1.jpeg" />
            <img src="/image/award2.jpeg" />
            <img src="/image/award3.jpeg" />
            <img src="/image/award4.jpeg" />
             <img src="/image/award5.jpeg" />
              <img src="/image/award6.jpeg" />

            <img src="/image/award1.jpeg" />
            <img src="/image/award2.jpeg" />
            <img src="/image/award3.jpeg" />
            <img src="/image/award4.jpeg" />
             <img src="/image/award5.jpeg" />
              <img src="/image/award6.jpeg" />
          </div>
        </div>
        <div className="gallery-overlay">
          <b>Award Ceremony</b>
          <div>Trophy distribution</div>
        </div>
      </div>
       </div>

       {/* Open Gallery Button */}
        <div className='open-gallery-btn-container' style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            className="open-gallery-btn"
            onClick={() => navigate("/gallery")} // Navigate to Gallery.jsx route
            
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Gallery
          </button>
        </div>

   
  </div>
</section>


{/* Video Gallery Section */}
<section className="video-gallery-section reveal" id="video-gallery">
  <div className="gallery-container">
    <h2 className="section-title">MATCH HIGHLIGHTS VIDEOS</h2>
    <p className="section-subtitle">
      Watch exciting highlights from our previous matches
    </p>

    <div className="video-gallery-grid">

      <div className="video-item">
        <video controls muted loop>
          <source src="/videos/highlight2.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <b>Match 1 Highlights</b>
        </div>
      </div>

      <div className="video-item">
        <video controls muted loop>
          <source src="/videos/highlight1.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <b>Match 2 Highlights</b>
        </div>
      </div>

      <div className="video-item">
        <video controls muted loop>
          <source src="/videos/highlight3.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <b>Match 3 Highlights</b>
        </div>
      </div>

      <div className="video-item">
        <video controls muted loop>
          <source src="/videos/highlight4.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay">
          <b>Match 4 Highlights</b>
        </div>
      </div>

    </div>
  </div>
</section>




        {/* Registration CTA */}
        <section className="registration-cta reveal" id="register">
          <h2>READY TO PLAY PROFESSIONAL CRICKET?</h2>
          <p>Don't miss your chance to be part of the most exciting cricket tournament in Yamunanagar. Register now and secure your spot in the CDS Cricket Premier League 2025-26. Limited slots available for each time session!</p>
          
          <button className="cta-register-btn" onClick={handleRegister}>
            <i className="fas fa-cricket"></i> REGISTER FOR CDS CRICKET LEAGUE
          </button>
          
          <div style={{ marginTop: '2rem', color: 'var(--cricket-cream)', fontSize: '0.9rem' }}>
            <p><i className="fas fa-phone"></i> Contact for Registration: +91 98765 43210</p>
            <p style={{ marginTop: '5px' }}><i className="fas fa-envelope"></i> Email: register@cdscricketleague.com</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>CDS CRICKET PREMIER LEAGUE</h3>
            <p>Premier cricket tournament in Yamunanagar organized by CDS for youth talent development. Professional setup at Yamunanagar Ground Stadium with daily matches and certified facilities.</p>
            <p><i className="fas fa-map-marker-alt"></i> Yamunanagar Ground Cricket Stadium, Yamunanagar, Haryana</p>
          </div>
          
          <div className="footer-column">
            <h3>CONTACT INFORMATION</h3>
            <ul className="contact-info">
              <li><i className="fas fa-phone"></i> Tournament Helpline: +91 98765 43210</li>
              <li><i className="fas fa-envelope"></i> Official Email: cricket@cdsleague.com</li>
              <li><i className="fas fa-clock"></i> Match Hours: 6:30 AM - 11:30 PM Daily</li>
              <li><i className="fas fa-user-tie"></i> Registration Office: 9:00 AM - 6:00 PM</li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>QUICK ACCESS LINKS</h3>
            <p><a href="#stadium" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--cricket-gold)'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>Stadium Facilities</a></p>
            <p><a href="#gallery" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--cricket-gold)'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>Match Gallery</a></p>
            <p><a href="#register" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--cricket-gold)'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>Player Registration</a></p>
            <p><a href="#" style={{ color: '#aaa', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseEnter={(e) => e.target.style.color = 'var(--cricket-gold)'} onMouseLeave={(e) => e.target.style.color = '#aaa'}>Tournament Rules & Guidelines</a></p>
          </div>
        </div>
        
        <div className="copyright">
          <p>&copy; 2025-26 CDS Cricket Premier League. All Rights Reserved. | Organized by CIIS - Career Infowis IT Solutions Pvt Ltd</p>
          <p style={{ marginTop: '5px' }}>Yamunanagar Ground Stadium, Yamunanagar | Play Hard, Play Fair, Play Cricket!</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;