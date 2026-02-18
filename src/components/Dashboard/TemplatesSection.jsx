import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaComments,
  FaBullhorn,
  FaEnvelopeOpenText,
  FaChartLine,
  FaTags,
  FaTimes,
} from "react-icons/fa";

const TemplatesSection = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const templates = [
    {
      tag: "Blogging",
      title: "How-To Guide",
      text: "Step-by-step content creation.",
      icon: <FaBookOpen />,
      details: {
        heading: "How-To Guide",
        description:
          "Generate step-by-step guides for any topic. Perfect for tutorials, blog posts, and documentation.",
        fields: ["Blog Title", "Topic or Keywords", "Blog Description", "Content Style"],
      },
    },
    {
      tag: "Social",
      title: "Engagement Post",
      text: "Boost likes and comments.",
      icon: <FaComments />,
      details: {
        heading: "Engagement Post",
        description:
          "Create interactive posts that increase engagement like likes, shares, and comments.",
        fields: ["Platform", "Hashtags", "Message", "Content Style"],
      },
    },
    {
      tag: "Ad",
      title: "Problem–Solution",
      text: "Address pain points fast.",
      icon: <FaBullhorn />,
      details: {
        heading: "Problem–Solution",
        description:
          "Generate ad copy that highlights a problem and provides your product/service as the solution.",
        fields: ["Product/Service Name", "Target Audience", "USP", "Content Style"],
      },
    },
    {
      tag: "Email",
      title: "Welcome Email",
      text: "First impression message.",
      icon: <FaEnvelopeOpenText />,
      details: {
        heading: "Welcome Email",
        description:
          "Create a professional welcome email for new users/customers with a strong first impression.",
        fields: ["Subject Line", "Recipient Type", "Body Notes", "Content Style"],
      },
    },
    {
      tag: "Blogging",
      title: "Trend Insights",
      text: "Latest industry updates.",
      icon: <FaChartLine />,
      details: {
        heading: "Trend Insights",
        description:
          "Generate trending content ideas and insights to keep your audience updated.",
        fields: ["Blog Title", "Topic or Keywords", "Blog Description", "Content Style"],
      },
    },
    {
      tag: "Social",
      title: "Promo Post",
      text: "Highlight offers quickly.",
      icon: <FaTags />,
      details: {
        heading: "Promo Post",
        description:
          "Create promotional posts for offers, discounts, and new launches that convert.",
        fields: ["Platform", "Hashtags", "Message", "Content Style"],
      },
    },
  ];

  const handleGenerate = () => {
  if (!activeCard) return;

  const generatorTypeMap = {
    "How-To Guide": "Blog Post",
    "Trend Insights": "Blog Post",
    "Engagement Post": "Social Media",
    "Promo Post": "Social Media",
    "Problem–Solution": "Ad Copy",
    "Welcome Email": "Email Copy",
  };

  const type = generatorTypeMap[activeCard.title] || "Blog Post";

  navigate(
    `/content-generator?type=${encodeURIComponent(type)}&template=${encodeURIComponent(activeCard.title)}`
  );
};
  return (
    <div className="ts-wrapper">
      <h2 className="ts-heading-main">Content Ideas</h2>

      <p className="ts-subheading">
        Choose a content idea and generate unique content based on your input.
      </p>

      <div className="ts-grid">
        {templates.map((t, i) => {
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              className="ts-card"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveCard(t)}
              style={{
                transition: "all 0.25s ease",
                cursor: "pointer",
                transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isHovered
                  ? "0 15px 28px rgba(0, 0, 0, 0.12)"
                  : "0 4px 12px rgba(0, 0, 0, 0.06)",
                borderRadius: "14px",
                background: "#fff",
                padding: "18px 18px 16px",
                border: "1px solid #eef2ff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "42px",
                  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                  opacity: 0.12,
                }}
              />

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(37, 99, 235, 0.12)",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  marginBottom: "10px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {t.icon}
              </div>

              <p
                className="ts-tag"
                style={{
                  margin: "0 0 8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#2563eb",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {t.tag}
              </p>

              <h3
                className="ts-card-title"
                style={{
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#0f172a",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {t.title}
              </h3>

              <p
                className="ts-card-desc"
                draggable={false}
                contentEditable={false}
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.5",
                  userSelect: "none",
                  cursor: "default",
                  resize: "none",
                  pointerEvents: "none",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {t.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {activeCard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "16px",
          }}
          onClick={() => setActiveCard(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              borderRadius: "14px",
              background: "#fff",
              padding: "20px",
              border: "1px solid #eef2ff",
              boxShadow: "0 15px 28px rgba(0, 0, 0, 0.12)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCard(null)}
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                color: "#475569",
              }}
            >
              <FaTimes />
            </button>

            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800 }}>
              {activeCard.details.heading}
            </h3>

            <p style={{ margin: "0 0 14px", color: "#475569", fontSize: "14px" }}>
              {activeCard.details.description}
            </p>

            <p style={{ margin: "0 0 10px", fontWeight: 700, color: "#0f172a" }}>
              Required Inputs:
            </p>

            <ul style={{ margin: 0, paddingLeft: "18px", color: "#475569" }}>
              {activeCard.details.fields.map((f, idx) => (
                <li key={idx} style={{ marginBottom: "6px", fontSize: "14px" }}>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleGenerate}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                background: "#213ac7",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Generate Content →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesSection;
