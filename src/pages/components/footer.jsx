// Footer ke liye CSS file import
import "./footer.css";

function Footer() {
  return (
    <>
      {/* Footer Section */}
      <footer className="footer">

        {/* Footer main content */}
        <div className="footer-content">

          {/* Column 1 - About */}
          <div className="footer-column">
            <h3>CDS CRICKET PREMIER LEAGUE</h3>

            <p>
              Premier cricket tournament in Yamunanagar organized by CDS for youth
              talent development. Professional setup at Yamuna Ground Stadium with
              daily matches and certified facilities.
            </p>

            <p>
              <i className="fas fa-map-marker-alt"></i>
              {" "}Yamuna Ground Cricket Stadium, Yamunanagar, Haryana
            </p>
          </div>

          {/* Column 2 - Contact Info */}
          <div className="footer-column">
            <h3>CONTACT INFORMATION</h3>

            <ul className="contact-info">
              <li>
                <i className="fas fa-phone"></i>
                {" "}Tournament Helpline: +91 98765 43210
              </li>

              <li>
                <i className="fas fa-envelope"></i>
                {" "}Official Email: cricket@cdsleague.com
              </li>

              <li>
                <i className="fas fa-clock"></i>
                {" "}Match Hours: 6:30 AM - 11:30 PM Daily
              </li>

              <li>
                <i className="fas fa-user-tie"></i>
                {" "}Registration Office: 9:00 AM - 6:00 PM
              </li>
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div className="footer-column">
            <h3>QUICK ACCESS LINKS</h3>

            <p>
              <a href="#stadium" className="footer-link">
                Stadium Facilities
              </a>
            </p>

            <p>
              <a href="#gallery" className="footer-link">
                Match Gallery
              </a>
            </p>

            <p>
              <a href="#register" className="footer-link">
                Player Registration
              </a>
            </p>

            <p>
              <a href="#" className="footer-link">
                Tournament Rules & Guidelines
              </a>
            </p>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="copyright">
          <p>
            © 2025-26 CDS Cricket Premier League. All Rights Reserved.
            | Organized by CIIS - Career Infowis IT Solutions Pvt Ltd
          </p>

          <p style={{ marginTop: "5px" }}>
            Yamuna Ground Stadium, Yamunanagar | Play Hard, Play Fair, Play Cricket!
          </p>
        </div>

      </footer>
    </>
  );
}

export default Footer;
