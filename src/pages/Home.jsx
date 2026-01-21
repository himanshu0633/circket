import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from "react-router-dom";
import Header from '../pages/components/header';
import Footer from '../pages/components/footer';
import TutorialVideo from "../assets/Tutorial.mp4";

const Home = () => {
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [stadiumImageIndex, setStadiumImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(true); // Always show video on load
  
  // Hero section images
  const heroImages = [
    '/image/stadium4.jpeg',
    '/image/stadium5.jpeg',
    '/image/stadium7.jpeg',
    '/image/stadium3.jpeg',
    '/image/stadium6.jpeg' 
  ];
  
  // Stadium section images
  const stadiumImages = [
    '/image/stadium7.jpeg',
    '/image/stadium1.jpeg',
    '/image/stadium2.jpeg',
    '/image/stadium8.jpeg',
    '/image/stadium6.jpeg' 
  ];

  // Hero image slideshow
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(heroInterval);
  }, [heroImages.length]);

  // Stadium image slideshow
  useEffect(() => {
    const stadiumInterval = setInterval(() => {
      setStadiumImageIndex((prevIndex) => (prevIndex + 1) % stadiumImages.length);
    }, 3000);

    return () => clearInterval(stadiumInterval);
  }, [stadiumImages.length]);

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
    
    return () => {
      window.removeEventListener('scroll', revealOnScroll);
    };
  }, []);

  // Video modal को open/close करते समय body scroll रोकने के लिए
  useEffect(() => {
    if (showVideo) {
      document.body.classList.add('video-open');
    } else {
      document.body.classList.remove('video-open');
    }
    
    return () => {
      document.body.classList.remove('video-open');
    };
  }, [showVideo]);

  // Auto-close video after 45 seconds
  useEffect(() => {
    if (showVideo) {
      const timer = setTimeout(() => {
        setShowVideo(false);
      }, 45000); // 45 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showVideo]);

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

  return (
    <>
      <Header/>
      <div className="home-container">
        <div className="bg-pattern"></div>

        {/* Hero Section with Slideshow */}
        <section className="hero">
          {/* Hero Slideshow */}
          <div className="hero-slideshow">
            {heroImages.map((img, index) => (
              <div 
                key={index}
                className={`hero-slide ${index === heroImageIndex ? 'active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(rgba(10,10,10,0.7), rgba(0,0,0,0.56)), url('${img}')`
                }}
              />
            ))}

            <div className="slideshow-dots">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === heroImageIndex ? 'active' : ''}`}
                  onClick={() => setHeroImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="hero-content-wrapper">
            {/* Left Content */}
            <div className="hero-content">
              <h1>JOIN THE CRICKET REVOLUTION AT YAMUNANAGAR GROUND</h1>
              <p>
                Experience professional cricket at our state-of-the-art stadium.
                Register now for CDS Cricket Premier League 2025-26!
              </p>

              <button className="register-btn" onClick={() => navigate("/playerRegistration")}>
                Register As Player
              </button>

              <button className="register-btn" onClick={() => navigate("/login")}>
                Login
              </button>
            </div>
          </div>

          <div className="cricket-ball ball-1"></div>
          <div className="cricket-ball ball-2"></div>
        </section>

        {/* VIDEO POPUP - Always show on load */}
        {showVideo && (
          <div className="video-modal">
            <div className="video-modal-content">
              <div className="video-wrapper">
                {/* Close button for all devices */}
                <button
                  className="video-cut-btn"
                  onClick={() => setShowVideo(false)}
                >
                  ✕
                </button>
                
                {/* Auto-play countdown timer */}
                <div className="video-timer">
                  Video will auto-close in <span id="countdown">45</span> seconds
                </div>
                
                <video 
                  controls 
                  autoPlay 
                  muted 
                  playsInline
                  onEnded={() => {
                    // Video खत्म होने पर auto-close
                    setTimeout(() => setShowVideo(false), 1000);
                  }}
                >
                  <source src={TutorialVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Skip button */}
                <button 
                  className="skip-video-btn"
                  onClick={() => setShowVideo(false)}
                >
                  Skip & Continue to Website
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Tournament Info */}
          <section className="info-section reveal">
            <h2 className=" section-titleh2">TOURNAMENT DETAILS & FEATURES</h2>
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

          {/* Stadium Section with Slideshow */}
          <section className="stadium-section reveal" id="stadium">
            <div className="stadium-content">
              <div className="stadium-slideshow">
                {stadiumImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`stadium-slide ${index === stadiumImageIndex ? 'active' : ''}`}
                  >
                    <img src={img} alt={`Stadium view ${index + 1}`} />
                  </div>
                ))}
                
                {/* Slideshow Navigation */}
                <button 
                  className="slideshow-nav prev"
                  onClick={() => setStadiumImageIndex((prev) => (prev - 1 + stadiumImages.length) % stadiumImages.length)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="slideshow-nav next"
                  onClick={() => setStadiumImageIndex((prev) => (prev + 1) % stadiumImages.length)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                
                {/* Slideshow Dots */}
                <div className="slideshow-dots">
                  {stadiumImages.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === stadiumImageIndex ? 'active' : ''}`}
                      onClick={() => setStadiumImageIndex(index)}
                    />
                  ))}
                </div>
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
              <h2 className="section-titleh2">DAILY MATCH TIME SLOTS</h2>
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
          <section className="gallery-section reveal" id="gallery">
            <div className="gallery-container">
              <h2 className="section-titleh2">MATCH GALLERY & HIGHLIGHTS</h2>
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
                  onClick={() => navigate("/gallery")}
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
              <h2 className="section-titleh2">MATCH HIGHLIGHTS VIDEOS</h2>
              <p className="section-subtitle">
                Watch exciting highlights from our previous matches
              </p>

              <div className="video-gallery-grid">
                <div className="video-item">
                  <video controls muted loop>
                    <source src="/videos/highlight2.mp4" type="video/mp4" />
                  </video>
                  <div className="video-overlay">
                    <b>Highlights</b>
                  </div>
                </div>

                <div className="video-item">
                  <video controls muted loop>
                    <source src="/videos/highlight1.mp4" type="video/mp4" />
                  </video>
                  <div className="video-overlay">
                    <b>Highlights</b>
                  </div>
                </div>

                <div className="video-item">
                  <video controls muted loop>
                    <source src="/videos/highlight3.mp4" type="video/mp4" />
                  </video>
                  <div className="video-overlay">
                    <b>Highlights</b>
                  </div>
                </div>

                <div className="video-item">
                  <video controls muted loop>
                    <source src="/videos/highlight4.mp4" type="video/mp4" />
                  </video>
                  <div className="video-overlay">
                    <b>Highlights</b>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Registration CTA */}
          <section className="registration-cta reveal" id="register">
            <h2>READY TO PLAY PROFESSIONAL CRICKET?</h2>
            <p>Don't miss your chance to be part of the most exciting cricket tournament in Yamunanagar. Register now and secure your spot in the CDS Cricket Premier League 2025-26. Limited slots available for each time session!</p>
            
            <button className="cta-register-btn" onClick={() => navigate("/login")}>
              <i className="fas fa-cricket"></i> REGISTER FOR CDS CRICKET LEAGUE
            </button>
            
            <div style={{ marginTop: '2rem', color: 'var(--cricket-cream)', fontSize: '0.9rem' }}>
              <p><i className="fas fa-phone"></i> Contact for Registration: +91 98765 43210</p>
              <p style={{ marginTop: '5px' }}><i className="fas fa-envelope"></i> Email: register@cdscricketleague.com</p>
            </div>
          </section>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Home;