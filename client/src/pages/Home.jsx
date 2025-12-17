import React from "react";
import ImageCarousel from "../components/ImageCarousel"; // ✅ Import the banner carousel component
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../CSS/ImageCarousel.css"; // ✅ Include carousel styling

const Home = () => {
  return (
    <div className="home-page">
      {/* === Hero Section === */}
      <section className="hero-section">
        <ImageCarousel />
      </section>

      {/* === Example: Add More Sections Below === */}
      {/* 
      <section className="features py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Our Services</h2>
          <p className="text-muted">
            We provide modern digital solutions to elevate your business.
          </p>
        </div>
      </section>
      */}
    </div>
  );
};

export default Home;
