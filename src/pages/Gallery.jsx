import "./gallery.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from '../pages/components/header';
import Footer from '../pages/components/footer';





const Gallery = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // 🔥 ADD THIS
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


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
 useEffect(() => {
  if (!selectedImage) return;

  const handleKeyDown = (e) => {
    if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); // scroll band
    }

    if (e.key === "ArrowRight") {
      const i = (currentIndex + 1) % allImages.length;
      setCurrentIndex(i);
      setSelectedImage(allImages[i]);
      setZoom(1);
    }

    if (e.key === "ArrowLeft") {
      const i = (currentIndex - 1 + allImages.length) % allImages.length;
      setCurrentIndex(i);
      setSelectedImage(allImages[i]);
      setZoom(1);
    }

    if (e.key === "Escape") {
      closeModal();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedImage, currentIndex]);


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
      subtitle: "Yamunanagar Ground full view",
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
    <>
      <Header/>
      <div className="gallery-home-container">
        {/* 🔹 GALLERY */}
        <section className="gallery-gallery-page">
          <h1 className="gallery-page-title">Cricket Gallery</h1>
          <p className="gallery-page-subtitle">
            Relive the best moments from matches, celebrations, and awards
          </p>

          {gallerySections.map((section, idx) => (
            <div className="gallery-gallery-section" key={idx}>
              <h2 className="gallery-section-title">{section.title}</h2>
              <p className="gallery-section-subtitle">{section.subtitle}</p>

              <div className="gallery-gallery-grid">
                {section.images.map((img, i) => (
                  <div
                    key={i}
                    className="gallery-gallery-card"
                    onClick={() => openImage(img.src)}
                  >
                    <img src={img.src} alt="" className="gallery-card-image" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 🔹 MODAL */}
        {selectedImage && (
          <div className="gallery-image-modal" onClick={closeModal}>
            <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Full"
                className="gallery-modal-image"
                style={{ transform: `scale(${zoom})` }}
              />

              <button className="gallery-close-btn" onClick={closeModal}>✖</button>
              <button className="gallery-nav-btn gallery-prev" onClick={prevImage}>❮</button>
              <button className="gallery-nav-btn gallery-next" onClick={nextImage}>❯</button>

              {/* <div className="gallery-zoom-controls">
                <button className="gallery-zoom-btn" onClick={zoomIn}>+</button>
                <button className="gallery-zoom-btn" onClick={zoomOut}>-</button>
              </div> */}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default Gallery;