import React from "react";
import "../styles/Landing.css";
import cityImg from "../assets/cityimage.jpg";

import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const Landing = () => {
  const navigate = useNavigate();
  const { isSignedIn, user, isLoaded } = useUser();

  const handleAuthAction = () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    const role = user?.publicMetadata?.role;
    if (role === "admin") navigate("/admin");
    else if (role === "department") navigate("/department");
    else navigate("/dashboard");
  };

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">Smart City Issue Tracker</h2>

        <ul className="navLinks">
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>

        <button className="loginBtn" onClick={handleAuthAction}>
          {isLoaded && isSignedIn ? "Go to Dashboard" : "Login"}
        </button>
      </nav>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="heroLeft">
          <h1>
            Report City Problems <br />
            <span>Track Solutions Easily</span>
          </h1>

          <p>
            Smart City Issue Tracker helps citizens report issues like road damage, water
            leakage, garbage overflow, and emergency situations. Admin assigns
            the complaint to the correct authority and users can track the
            progress in real time.
          </p>

          <div className="heroButtons">
            <button
              className="primaryBtn"
              onClick={() => navigate("/add-complaint")}
            >
              Report Issue
            </button>
            <button className="secondaryBtn">Learn More</button>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroCard">
            <img src={cityImg} alt="smart city" className="heroImage" />
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="stats">
        <div className="statBox">
          <h2>1000+</h2>
          <p>Citizens Connected</p>
        </div>

        <div className="statBox">
          <h2>500+</h2>
          <p>Complaints Reported</p>
        </div>

        <div className="statBox">
          <h2>300+</h2>
          <p>Issues Resolved</p>
        </div>

        <div className="statBox">
          <h2>50+</h2>
          <p>Active Authorities</p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about">
        <div className="aboutLeft">
          <h2>About Smart City Issue Tracker</h2>

          <p>
            Smart City Issue Tracker is a smart city issue management platform designed to
            connect citizens, administrators, and government authorities in one
            place.
          </p>

          <p>
            Citizens can report problems like road damage, water leakage,
            garbage overflow, electricity failure, and emergency situations with
            image proof. Admin reviews the complaint and assigns it to the
            correct department.
          </p>

          <p>
            Authorities work on the issue and update the status, while users can
            track progress in real time until the problem is fully resolved.
          </p>
        </div>

        <div className="aboutRight">
          <div className="aboutCard">
            <h3>🎯 Our Mission</h3>
            <p>
              To make cities cleaner, safer, and smarter by enabling fast
              communication between citizens and responsible authorities.
            </p>
          </div>

          <div className="aboutCard">
            <h3>⚡ Fast Response</h3>
            <p>
              Priority-based system ensures that critical problems get faster
              attention from the right department.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="howWorks">
        <h2>How Smart City Issue Tracker Works</h2>
        <p className="howSubtitle">
          A simple and powerful workflow connecting citizens, admin, and
          authorities to solve city problems efficiently.
        </p>

        <div className="howContainer">
          <div className="howStep">
            <div className="stepNumber">1</div>
            <h3>User Reports Issue</h3>
            <p>
              Citizens submit complaints like road damage, water leakage,
              garbage overflow or emergencies by uploading an image and location
              details.
            </p>
          </div>

          <div className="howStep">
            <div className="stepNumber">2</div>
            <h3>Admin Reviews Complaint</h3>
            <p>
              Admin checks the complaint details and verifies the issue before
              assigning it to the correct department.
            </p>
          </div>

          <div className="howStep">
            <div className="stepNumber">3</div>
            <h3>Authority Assigned</h3>
            <p>
              Complaint is assigned to the responsible authority like road
              department, water department, electricity department, etc.
            </p>
          </div>

          <div className="howStep">
            <div className="stepNumber">4</div>
            <h3>Work in Progress</h3>
            <p>
              The assigned authority starts working on the issue and updates the
              work progress in the system.
            </p>
          </div>

          <div className="howStep">
            <div className="stepNumber">5</div>
            <h3>Problem Resolved</h3>
            <p>
              Once the work is completed, admin verifies the result and updates
              the complaint status as resolved. Users can track everything in
              real time.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="featuresSection">
        <h2>Powerful Features</h2>
        <p className="featureSubtitle">
          Smart City Issue Tracker provides smart tools to connect citizens, admin, and
          authorities for fast and efficient problem resolution.
        </p>

        <div className="featuresGrid">
          <div className="featureCard">
            <h3>🔐 OTP Secure Login</h3>
            <p>
              Secure authentication system using OTP ensures safe access for
              users, admin, and authorities.
            </p>
          </div>

          <div className="featureCard">
            <h3>📸 Image Based Complaints</h3>
            <p>
              Users must upload an image as proof while reporting issues to
              ensure authenticity and clarity.
            </p>
          </div>

          <div className="featureCard">
            <h3>👥 Role Based System</h3>
            <p>
              Separate dashboards for User, Admin, and Authority with different
              access levels and responsibilities.
            </p>
          </div>

          <div className="featureCard">
            <h3>🏢 Department Assignment</h3>
            <p>
              Admin assigns complaints to the correct department like Road,
              Water, Electricity, Garbage, or Emergency services.
            </p>
          </div>

          <div className="featureCard">
            <h3>⚡ Priority Handling</h3>
            <p>
              Smart priority engine ensures critical problems like fire, gas
              leaks, and floods get faster attention.
            </p>
          </div>

          <div className="featureCard">
            <h3>📊 Live Status Tracking</h3>
            <p>
              Users can track the real-time status of their complaints from
              submission to final resolution.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contactSection" id="contact">
        <h2>Contact Us</h2>
        <p className="contactSubtitle">
          Have questions or want to report something urgent? Reach out to us.
        </p>

        <div className="contactContainer">
          {/* LEFT SIDE INFO */}
          <div className="contactInfo">
            <h3>Get In Touch</h3>

            <p>
              Smart City Issue Tracker connects citizens with city authorities to solve
              real-world problems faster and more efficiently.
            </p>

            <div className="contactItem">
              <strong>Email:</strong>
              <span>support@smartcityissuetracker.com</span>
            </div>

            <div className="contactItem">
              <strong>Phone:</strong>
              <span>+91 99999 99999</span>
            </div>

            <div className="contactItem">
              <strong>Office:</strong>
              <span>Smart City Control Room, India</span>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="contactForm">
            <h3>Send a Message</h3>

            <input type="text" placeholder="Your Name" />
            <input type="email" placeholder="Your Email" />
            <textarea placeholder="Write your message..." rows="4"></textarea>

            <button className="sendBtn">Send Message</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footerContainer">
          {/* LEFT SIDE */}
          <div className="footerBrand">
            <h2>Smart City Issue Tracker</h2>
            <p>
              A smart city issue tracking platform connecting citizens,
              administrators, and authorities to solve real-world problems
              faster.
            </p>
          </div>

          {/* MIDDLE LINKS */}
          <div className="footerLinks">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          {/* RIGHT INFO */}
          <div className="footerContact">
            <h3>Contact Info</h3>
            <p>Email: support@smartcityissuetracker.com</p>
            <p>Phone: +91 99999 99999</p>
            <p>India Smart City Network</p>
          </div>
        </div>

        <div className="footerBottom">
          <p>© 2026 Smart City Issue Tracker | Final Year Project | All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
