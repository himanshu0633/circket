import "./gallery.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Gallery = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // 🔹 Logo hover
  const handleLogoHover = (e, isEnter) => {
    e.currentTarget.style.transform = isEnter
      ? "rotate(15deg)"
      : "rotate(0deg)";
  };

  // 🔹 All images for navigation
  const allImages = [
    "/image/batting1.jpeg",
    "/image/batting2.jpeg",
    "/image/batting3.jpeg",
    "/image/batting4.jpeg",
    "/image/team1.jpeg",
    "/image/team2.jpeg",
    "/image/team3.jpeg",
    "/image/team4.jpeg",
    "/image/team5.jpeg",
    "/image/team6.jpeg",
    "/image/stadium1.jpeg",
    "/image/stadium2.jpeg",
    "/image/stadium3.jpeg",
    "/image/stadium4.jpeg",
    "/image/stadium5.jpeg",
    "/image/stadium6.jpeg",
    "/image/stadium7.jpeg",
    "/image/stadium8.jpeg",
    "/image/award1.jpeg",
    "/image/award2.jpeg",
    "/image/award3.jpeg",
    "/image/award4.jpeg",
    "/image/award5.jpeg",
    "/image/award6.jpeg",
    "/image/award7.jpeg",
    "/image/award8.jpeg",
  ];

  const openImage = (src) => {
    setCurrentIndex(allImages.indexOf(src));
    setSelectedImage(src);
    setZoom(1);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setZoom(1);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const i = (currentIndex + 1) % allImages.length;
    setCurrentIndex(i);
    setSelectedImage(allImages[i]);
    setZoom(1);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const i = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(i);
    setSelectedImage(allImages[i]);
    setZoom(1);
  };

  const zoomIn = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.min(z + 0.2, 3));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setZoom((z) => Math.max(z - 0.2, 1));
  };

  // 🔹 Gallery sections
  const gallerySections = [
    {
      title: "Match Action",
      subtitle: "Exciting on-field moments",
      images: [
        { src: "/image/batting1.jpeg", name: "Batsman Strike" },
        { src: "/image/batting2.jpeg", name: "Bowler Delivery" },
        { src: "/image/batting3.jpeg", name: "Fielding Action" },
        { src: "/image/batting4.jpeg", name: "Fielding Action" },
      ],
    },
    {
      title: "Team Celebration",
      subtitle: "Winning & joy moments",
      images: [
        { src: "/image/team1.jpeg", name: "Victory Cheers" },
        { src: "/image/team2.jpeg", name: "Team Huddle" },
        { src: "/image/team3.jpeg", name: "Captain Pose" },
        { src: "/image/team4.jpeg", name: "Award Holding" },
        { src: "/image/team5.jpeg", name: "Award Holding" },
        { src: "/image/team6.jpeg", name: "Award Holding" },
      ],
    },
    {
      title: "Stadium Overview",
      subtitle: "Yamuna Ground full view",
      images: [
        { src: "/image/stadium1.jpeg" },
        { src: "/image/stadium2.jpeg" },
        { src: "/image/stadium3.jpeg" },
        { src: "/image/stadium4.jpeg" },
        { src: "/image/stadium5.jpeg" },
        { src: "/image/stadium6.jpeg" },
        { src: "/image/stadium7.jpeg" },
        { src: "/image/stadium8.jpeg" },
      ],
    },
    {
      title: "Award Ceremony",
      subtitle: "Trophy distribution",
      images: [
        { src: "/image/award1.jpeg" },
        { src: "/image/award2.jpeg" },
        { src: "/image/award3.jpeg" },
        { src: "/image/award4.jpeg" },
        { src: "/image/award5.jpeg" },
        { src: "/image/award6.jpeg" },
        { src: "/image/award7.jpeg" },
        { src: "/image/award8.jpeg" },
      ],
    },
  ];

  return (
    <div className="home-container">
      {/* 🔹 HEADER */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div
              className="logo"
              onMouseEnter={(e) => handleLogoHover(e, true)}
              onMouseLeave={(e) => handleLogoHover(e, false)}
            >
              <img src="/image/cds-logo.jpeg" alt="CDS LOGO" onClick={navigate("/")}/>
            </div>
            <div>
              <div className="league-name">CDS CRICKET LEAGUE</div>
              <div className="sub-title">Yamuna Ground Stadium</div>
            </div>
          </div>

          <div className="title-section">
            <div className="main-title">CDS PREMIER CRICKET LEAGUE</div>
            <div className="sub-title">
              Daily Professional Cricket Tournament
            </div>
          </div>

          <button className="login-btn" onClick={() => navigate("/login")}>
            Register
          </button>
        </div>
      </header>

      {/* 🔹 GALLERY */}
      <section className="gallery-page">
        <h1 className="page-title">Cricket Gallery</h1>
        <p className="page-subtitle">
          Relive the best moments from matches, celebrations, and awards
        </p>

        {gallerySections.map((section, idx) => (
          <div className="gallery-section" key={idx}>
            <h2 className="section-title">{section.title}</h2>
            <p className="section-subtitle">{section.subtitle}</p>

            <div className="gallery-grid">
              {section.images.map((img, i) => (
                <div
                  key={i}
                  className="gallery-card"
                  onClick={() => openImage(img.src)}
                >
                  <img src={img.src} alt="" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 🔹 MODAL */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Full"
              style={{ transform: `scale(${zoom})` }}
            />

            <button className="close-btn" onClick={closeModal}>✖</button>
            <button className="nav-btn prev" onClick={prevImage}>❮</button>
            <button className="nav-btn next" onClick={nextImage}>❯</button>

            <div className="zoom-controls">
              <button onClick={zoomIn}>＋</button>
              <button onClick={zoomOut}>－</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
