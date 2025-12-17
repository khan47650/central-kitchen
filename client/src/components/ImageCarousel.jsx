import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../CSS/ImageCarousel.css";
import "animate.css";

// === Import Banner Images ===
import imageCarousel1 from "../assets/img/hero-carousel/hero-carousel-1.jpg";
import imageCarousel2 from "../assets/img/hero-carousel/hero-carousel-2.jpg";
import imageCarousel3 from "../assets/img/hero-carousel/hero-carousel-3.jpg";

const banners = [
  { img: imageCarousel1 },
  { img: imageCarousel2 },
  { img: imageCarousel3 },
];

export default function ImageCarousel() {
  return (
    <div id="mainBannerCarousel" className="carousel slide" data-bs-ride="carousel">
      {/* === Indicators === */}
      <div className="carousel-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#mainBannerCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* === Slides === */}
      <div className="carousel-inner">
        {banners.map((banner, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            <img
              src={banner.img}
              className="d-block w-100"
              alt="Central Kitchen Banner"
              loading="eager"
            />
            {/* Show caption only on the first slide */}
            {index === 0 && (
              <div className="carousel-caption text-center">
                <h1 className="fw-bold text-uppercase animate__animated animate__fadeInDown">
                  Welcome to Central Kitchen
                </h1>
                <p className="lead animate__animated animate__fadeInUp">
                  Streamline your workflow, manage resources efficiently, and elevate performance with Central Kitchen.
                </p>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-orange animate__animated animate__fadeInUp"
                >
                  Get Started Today
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* === Controls === */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#mainBannerCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#mainBannerCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
