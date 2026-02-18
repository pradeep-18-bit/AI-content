import React from "react";
import { FaBlog, FaShareAlt, FaBullhorn, FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function FeaturesSection() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaBlog />,
      title: "Blog Generation",
      text: "Create SEO-optimized blog posts in minutes.",
      path: "/content-generator?type=Blog%20Post",
    },
    {
      icon: <FaShareAlt />,
      title: "Social Media Posts",
      text: "Generate engaging posts for all platforms.",
      path: "/content-generator?type=Social%20Media",
    },
    {
      icon: <FaBullhorn />,
      title: "Ad Copy",
      text: "Craft ad copies that convert and drive traffic.",
      path: "/content-generator?type=Ad%20Copy",
    },
    {
      icon: <FaLayerGroup />,
      title: "Email Copy",
      text: "Professional email campaigns.",
      path: "/content-generator?type=Email%20Copy",
    },
  ];

  return ( 
    <div className="features-section">
      <h2 style={{ color: "#213AC7" }}>
        Everything You Need to Create Amazing Content
      </h2>

      <p>
        Our AI-powered platform provides all the tools you need to generate
        high-quality content.
      </p>

      <div className="features-grid">
        {features.map((f, i) => (
          <div
            key={i}
            className="feature-card"
            onClick={() => navigate(f.path)}
            role="button"
            tabIndex={0}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
