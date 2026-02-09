import React, { useEffect, useState, useRef } from 'react';
import './Home.css';
import { useNavigate } from "react-router-dom";
import Header from '../pages/components/header';
import Footer from '../pages/components/footer';
import video from '../assets/popupview.mp4';

const Home = () => {
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [stadiumImageIndex, setStadiumImageIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showVideo, setShowVideo] = useState(true);  
  const [scrollPosition, setScrollPosition] = useState(0);
  const bodyRef = useRef(null);
  
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

  const navigate = useNavigate();

  // Show popup on page load/refresh
  useEffect(() => {
    const popupShown = sessionStorage.getItem('popupShown');
    
    if (!popupShown) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('popupShown', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

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
    revealOnScroll();
    
    return () => {
      window.removeEventListener('scroll', revealOnScroll);
    };
  }, []);

  // Handle body scroll when video modal is open/closed
  useEffect(() => {
    if (showVideo) {
      // Save current scroll position
      const scrollY = window.scrollY;
      setScrollPosition(scrollY);
      
      // Disable scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scroll and restore position
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition);
    }
    
    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showVideo, scrollPosition]);

 

  // Close popup function
  const closePopup = () => {
    setShowPopup(false);
  };

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

  // Close video modal
  const closeVideoModal = () => {
    setShowVideo(false);
  };

  return (
    <>
      <Header/>
      <div className="home-container" ref={bodyRef}>
        <div className="bg-pattern"></div>

        {/* Welcome Popup with Video */}
        {showPopup && (
          <div className="welcome-popup">
            <div className="popup-overlay" onClick={closePopup}></div>
            <div className="popup-content">
              <button className="home-popup-close" onClick={closePopup}>
                <i className="fas fa-times"></i>
              </button>
              
              <div className="popup-grid">
                <div className="popup-info">
                  <h2><i className="fas fa-cricket-ball"></i> CDS Champions Trophy</h2>
                  <p className="popup-subtitle">WELCOME TO CDS CRICKET LEAGUE</p>
                   <p className="popup-subtitle2">Tutorial video for player registration</p>
                  
                  <div className="popup-features">
                    <div className="feature-item">
                      <i className="fas fa-id-card"></i>
                      <div>
                        <h4> Fill Personal Details</h4>
                        <p> Enter your <strong>name, age, contact number , profile link and other required personal</strong> details in the registration form.</p>

                      </div>
                    </div>
                    
                    <div className="feature-item">
                        <i className="fas fa-qrcode"></i>
                      <div>
                        <h4> Proceed to Payment</h4>
                        <p>Click on the <strong>Next / Payment</strong> button to continue.
          A payment screen will appear.</p>
                      </div>
                    </div>
                    
                    <div className="feature-item">
                      <i className="fas fa-qrcode"></i>
                      <div>
                        <h4> Pay Registration Fee</h4>
                        <p> Scan the <strong>QR code</strong> or use the provided <strong>UPI ID</strong> to pay</p>
                      </div>
                    </div>
                    
                    <div className="feature-item">
                        <i className="fas fa-receipt"></i>
                      <div>
                        <h4> Enter Payment Details</h4>
                        <p> After payment, enter the <strong>UTR Number</strong> and upload
          the <strong>payment screenshot </strong> for verification.</p>
                      </div>
                    </div>

                     <div className="feature-item">
                       <i className="fas fa-check-circle"></i>
                      <div>
                        <h4>  Submit & Register</h4>
                        <p>Click on the <strong>Submit</strong> button to complete your
         <strong> registration successfully.</strong></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="popup-actions">
                    <button 
                      className="popup-register-btn"
                      onClick={() => {
                        closePopup();
                        navigate("/playerRegistration");
                      }}
                    >
                      <i className="fas fa-user-plus"></i> Register Now
                    </button>
                    
                    <button 
                      className="popup-explore-btn"
                      onClick={() => {
                        closePopup();
                        navigate("/gallery");
                      }}
                    >
                      <i className="fas fa-photo-video"></i> Explore Gallery
                    </button>
                  </div>
                </div>
                
                <div className="popup-video">
                  <div className="video-container">
                    <video 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      poster="/image/stadium1.jpeg"
                    >
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
              
              <div className="popup-footer">
                <p>Limited slots available! Register today to secure your spot in CDS Cricket Premier League 2026-27</p>
              </div>
            </div>
          </div>
        )}

    

        {/* Hero Section with Slideshow */}
        <section className="hero">
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
          
          <div className="hero-content">
            <h1>JOIN THE CRICKET REVOLUTION AT YAMUNANAGAR GROUND</h1>
            <p>Experience professional cricket at our state-of-the-art stadium. Daily matches with certified umpires, advanced facilities, and a perfect platform to showcase your talent. Register now for CDS Cricket Premier League 2025-26!</p>
            
            {/* <button 
              className="register-btn" 
              onClick={() => navigate("/playerRegistration")}
            >
              Register As Player
            </button>
             */}
            <button onClick={() => navigate("/login")} className="register-btn">
              Login
            </button>
          </div>
          
          <div className="cricket-ball ball-1"></div>
          <div className="cricket-ball ball-2"></div>
        </section>

        {/* Main Content */}
        <div className="main-content">
          {/* Tournament Info */}
          <section className="info-section reveal">
            <h2 className="section-titleh2">TOURNAMENT DETAILS & FEATURES</h2>
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
                <div className="gallery-item auto-gallery">
                  <div className="auto-track">
                    <div className="auto-scroll">
                      <img src="/image/batting1.jpeg" alt="Batting" />
                      <img src="/image/batting2.jpeg" alt="Batting" />
                      <img src="/image/batting3.jpeg" alt="Batting" />
                      <img src="/image/batting1.jpeg" alt="Batting" />
                      <img src="/image/batting2.jpeg" alt="Batting" />
                      <img src="/image/batting3.jpeg" alt="Batting" />
                    </div>
                  </div>
                  <div className="gallery-overlay">
                    <b>Match Action Shot</b>
                    <div>Exciting match moments</div>
                  </div>
                </div>

                <div className="gallery-item auto-gallery">
                  <div className="auto-track">
                    <div className="auto-scroll">
                      <img src="/image/team1.jpeg" alt="Team" />
                      <img src="/image/team2.jpeg" alt="Team" />
                      <img src="/image/team3.jpeg" alt="Team" />
                      <img src="/image/team4.jpeg" alt="Team" />
                      <img src="/image/team1.jpeg" alt="Team" />
                      <img src="/image/team2.jpeg" alt="Team" />
                      <img src="/image/team3.jpeg" alt="Team" />
                      <img src="/image/team4.jpeg" alt="Team" />
                    </div>
                  </div>
                  <div className="gallery-overlay">
                    <b>Team Celebration</b>
                    <div>Winning moments</div>
                  </div>
                </div>

                <div className="gallery-item auto-gallery">
                  <div className="auto-track">
                    <div className="auto-scroll">
                      <img src="/image/stadium4.jpeg" alt="Stadium" />
                      <img src="/image/stadium2.jpeg" alt="Stadium" />
                      <img src="/image/stadium3.jpeg" alt="Stadium" />
                      <img src="/image/stadium4.jpeg" alt="Stadium" />
                      <img src="/image/stadium1.jpeg" alt="Stadium" />
                      <img src="/image/stadium2.jpeg" alt="Stadium" />
                      <img src="/image/stadium3.jpeg" alt="Stadium" />
                      <img src="/image/stadium4.jpeg" alt="Stadium" />
                    </div>
                  </div>
                  <div className="gallery-overlay">
                    <b>Stadium Overview</b>
                    <div>Yamunanagar Ground full view</div>
                  </div>
                </div>

                <div className="gallery-item auto-gallery">
                  <div className="auto-track">
                    <div className="auto-scroll">
                      <img src="/image/award1.jpeg" alt="Award" />
                      <img src="/image/award2.jpeg" alt="Award" />
                      <img src="/image/award3.jpeg" alt="Award" />
                      <img src="/image/award4.jpeg" alt="Award" />
                      <img src="/image/award5.jpeg" alt="Award" />
                      <img src="/image/award6.jpeg" alt="Award" />
                      <img src="/image/award1.jpeg" alt="Award" />
                      <img src="/image/award2.jpeg" alt="Award" />
                      <img src="/image/award3.jpeg" alt="Award" />
                      <img src="/image/award4.jpeg" alt="Award" />
                      <img src="/image/award5.jpeg" alt="Award" />
                      <img src="/image/award6.jpeg" alt="Award" />
                    </div>
                  </div>
                  <div className="gallery-overlay">
                    <b>Award Ceremony</b>
                    <div>Trophy distribution</div>
                  </div>
                </div>
              </div>

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
            
            <button className="cta-register-btn" onClick={() => navigate("/playerRegistration")}>
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