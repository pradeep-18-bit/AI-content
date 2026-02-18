import React from "react";
import { FaFileAlt, FaPen, FaBolt, FaShareSquare } from "react-icons/fa";

const HowItWorksSection = () => {
  const steps = [
    { num: "01", icon: <FaFileAlt />, title: "Choose Content Type", text: "Select from blogs, social media, ad copy, email copy." },
    { num: "02", icon: <FaPen />, title: "Enter Your Topic", text: "Provide a short description or keywords." },
    { num: "03", icon: <FaBolt />, title: "Generate Content", text: "AI creates original, high-quality content." },
    { num: "04", icon: <FaShareSquare />, title: "Save & Share", text: "Edit and export your ready-to-publish content." },
  ];

  return (
    <div className="how-section">
      <h2 style={{ color: "#213AC7" }}>
      How It Works
    </h2>
      <p>Get from idea to published content in just four simple steps.</p>
      <div className="how-grid">
        {steps.map((s, i) => (
          <div key={i} className="how-card">
            <div className="how-number">{s.num}</div>
            <div className="how-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSection;
