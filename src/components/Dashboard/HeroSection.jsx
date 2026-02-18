import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div className="hero-text">
        <h1>
          Generate Content In Seconds
        </h1>

        <p>
         Create high-quality blog posts, social media content, ad copy, and email copy instantly with our AI-powered content generation platform.
        </p>

        <div className="hero-features">
          <span>✔ Human-like AI Output</span>
          <span>✔ Multiple Content Types</span>
          <span>✔ Fast & Accurate AI</span>
        </div>

        <div className="hero-actions">
          <button
            className="hero-btn primary"
            onClick={() => navigate("/content-generator")}
          >
            Start Generating
          </button>

          <button
            className="hero-btn secondary"
            onClick={() => navigate("/template-library")}
          >
            View Templates
          </button>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://img.freepik.com/free-vector/hand-drawn-flat-design-homepage-illustration_23-2149233374.jpg?semt=ais_hybrid&w=740"
          alt="Illustration"
        />
      </div>
    </div>
  );
};

export default HeroSection;
