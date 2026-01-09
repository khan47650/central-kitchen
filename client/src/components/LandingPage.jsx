import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'aos/dist/aos.css';
import '../CSS/Navbar.css';
import '../CSS/hero.css';
import '../CSS/About.css';
import '../CSS/Contact.css';
import '../CSS/footer.css';
import logo from "../assets/img/logo.png";
import hero1 from "../assets/img/hero-carousel-1.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const DEFAULT_API = process.env.REACT_APP_API_URL || "";

const LandingPage = () => {
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const updateContactField = (e) =>
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      toast.error('Please fill name, email and message');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${DEFAULT_API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Failed to send message');
        setLoading(false);
        return;
      }

      toast.success('Message sent — thank you!');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);

    } catch (err) {
      console.error(err);
      toast.error('Server error. Try again later.');
      setLoading(false);
    }
  };

  // AOS & Preloader
  useEffect(() => {
    AOS.init({ duration: 1000 });

    const hidePreloader = () => {
      const preloader = document.getElementById('preloader');
      if (preloader) preloader.classList.add('hidden');
    };

    document.addEventListener('DOMContentLoaded', hidePreloader);
    setTimeout(hidePreloader, 1000);
  }, []);

  return (
    <div className="index-page" id="top">
      {/* Top Header */}
      <header className="header-top sticky-top">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a href="/" className="logo d-flex align-items-center">
            <img src={logo} alt="Logo" />
            <h1 className="sitename">Central Kitchen</h1>
          </a>
          <div className="auth-section">
            <Link to="/login" className="btn login-btn">Log In</Link>
            <Link to="/signup" className="btn signup-btn">Register</Link>
          </div>
        </div>
      </header>

      {/* Navigation Header */}
      <header className="header-nav sticky-top">
        <nav className="navbar curved-navbar navbar-expand-lg">
          <div className="container-fluid">
            <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <i className="bi bi-list"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav mx-auto">
                <li><a className="nav-link active" href="#hero">Home</a></li>
                <li><a className="nav-link" href="#about">About</a></li>
                <li><a className="nav-link" href="#contact">Contact</a></li>
                <li><Link className='nav-link' to="/login" state={{from:"schedules"}}>Schedules</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <main className="main">
        {/* Hero Section */}
        <section id="hero" className="hero section dark-background">
          <div id="hero-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
            <div className="carousel-item active">
              <img src={hero1} alt="Hero" />
              <div className="carousel-container">
                <h2>Welcome to Central Kitchen</h2>
                <a href="/signup" className="btn-get-started">Register</a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-page">
          <div className="container section-title" data-aos="fade-up">
            <h2>About</h2>
          </div>
          <div className="about-container">
            <div className="about-card" data-aos="fade-up" data-aos-delay="100">
              <h3>What does "Commissary Kitchen" mean?</h3>
              <p>  Commissary kitchens are commercial kitchens available to rent from third parties which can be set up in any location such as a Ghost Kitchen.</p>
            </div>
            <div className="about-card" data-aos="fade-up" data-aos-delay="200">
              <h3>What does "Central Kitchen" do?</h3>
              <p>  Central Kitchen is a scheduling application, designed to streamline the process of scheduling a commissary kitchen.</p>
            </div>
          </div>

          {/* CTA Banner */}
          <section className="cta-banner" id="membership" style={{marginTop:"30px"}}>
            <div className="cta-overlay">
              <h2>Become a Member</h2>
              <p>Our commissary kitchen is a licensed, commercial-grade facility...</p>
              <a className="cta-button" href="/signup">Register Now</a>
            </div>
          </section>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-page">
          <div className="contact-header" data-aos="fade-up">
            <h1>Need <span>Help?</span></h1>
            <p>Contact Us</p>
          </div>

          <div className="contact-container" data-aos="fade-up" data-aos-delay="100">
            {/* Contact Info */}
            <div className="contact-info">
              <div className="info-card" data-aos="fade-up" data-aos-delay="200">
                <div className="icon-circle"><i className="bi bi-geo-alt"></i></div>
                <h4>Address</h4>
                <p>17945 North Regent Drive, Maricopa, AZ 85138-7808</p>
              </div>
              <div className="info-card" data-aos="fade-up" data-aos-delay="300">
                <div className="icon-circle"><i className="bi bi-telephone"></i></div>
                <h4>Call Us</h4>
                <p><a href="tel:+6494461709">5204946414</a></p>
              </div>
              <div className="info-card" data-aos="fade-up" data-aos-delay="400">
                <div className="icon-circle"><i className="bi bi-envelope"></i></div>
                <h4>Email Us</h4>
                <p><a href="mailto:commissary@centralaz.edu">commissary@centralaz.edu</a></p>
              </div>
            </div>

            {/* Contact Form */}
            <ToastContainer autoClose={2500} />
            <form onSubmit={handleContactSubmit} className="contact-form" data-aos="fade-up" data-aos-delay="500">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={updateContactField}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={updateContactField}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={updateContactField}
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Message"
                  value={contactForm.message}
                  onChange={updateContactField}
                  required
                />
              </div>

              <button type="submit" className="send-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="footer" className="footer dark-background">
        <div className="container text-center mt-4">
          <p>© Central Kitchen — All Rights Reserved</p>
          <div className="credits">
            Designed by <a href="">LumenAi</a>
          </div>
        </div>
      </footer>

      {/* Scroll Top */}
      <a href="#top" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>

      {/* Preloader */}
      <div id="preloader">
        <div></div><div></div><div></div><div></div>
      </div>
    </div>
  );
};

export default LandingPage;
