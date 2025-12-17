import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../CSS/About.css";

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section id="about" className="about-page">
      <div className="section-title" data-aos="fade-up">
        <h2>About</h2>
      </div>
      <div className="about-container">
        <div className="about-card" data-aos="fade-up" data-aos-delay="100">
          <h3>What does "Commissary Kitchen" mean?</h3>
          <p>
            Commissary kitchens are commercial kitchens available to rent from third parties which can be set up in any location such as a Ghost Kitchen.
          </p>
        </div>
        <div className="about-card" data-aos="fade-up" data-aos-delay="200">
          <h3>What does "Central Kitchen" do?</h3>
          <p>
            Central Kitchen is a scheduling application, designed to streamline the process of scheduling a commissary kitchen.
          </p>
        </div>
      </div>
      <section className="cta-section">
        <h2>Become a Member</h2>
        <p>Our commissary kitchen is licensed, commercial-grade, and ready for your business.</p>
        <a href="/signup" className="cta-button">Register Now</a>
      </section>
    </section>
  );
};

export default About;
