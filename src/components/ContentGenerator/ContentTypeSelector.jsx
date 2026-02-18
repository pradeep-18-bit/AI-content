import React from "react";
import {
  FaRegFileAlt,
  FaShareAlt,
  FaBullhorn,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const contentTypes = [
  {
    key: "Blog Post",
    title: "Blog Post",
    description: "SEO-optimized articles and blog content",
    icon: <FaRegFileAlt />,
    color: "#6b46ff",
  },
  {
    key: "Social Media",
    title: "Social Media",
    description: "Engaging posts for all platforms",
    icon: <FaShareAlt />,
    color: "#ff6b6b",
  },
  {
    key: "Ad Copy",
    title: "Ad Copy",
    description: "High-converting advertising content",
    icon: <FaBullhorn />,
    color: "#00b894",
  },
  {
    key: "Email Copy",
    title: "Email Copy",
    description: "Professional email campaigns",
    icon: <FaEnvelope />,
    color: "#0984e3",
  },
];

export default function ContentTypeSelector({
  contentType,
  setContentType,
}) {

  const navigate = useNavigate();
  const location = useLocation();

 const handleSelect = (typeKey) => {
  setContentType(typeKey);

  navigate(
    `${location.pathname}?type=${encodeURIComponent(typeKey)}`,
    { replace: true }
  );
};


  return (
    <div
      style={{
        width: "100%",
        maxWidth: "350px",
        padding: "20px",
        border: "2px solid #2e397aff",
        borderRadius: "12px",
        backgroundColor: "#fff",
      }}
    >
      <h3
        style={{
          marginBottom: "5px",
          fontSize: "20px",
          color: "#111",
          marginTop: "0px",
        }}
      >
        Choose Content Type
      </h3>

      <p style={{ marginBottom: "20px", fontSize: "14px", color: "#555" }}>
        Select the type of content you want to generate
      </p>

      {contentTypes.map((type) => {
        const active = contentType === type.key;

        return (
          <div
            key={type.key}
            onClick={() => handleSelect(type.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "15px",
              marginBottom: "12px",
              borderRadius: "10px",
              border: active
                ? "2px solid #2e397aff"
                : "1px solid #ccc",
              backgroundColor: active ? "#f8f5ff" : "#fafafa",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                backgroundColor: type.color,
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontSize: "18px",
              }}
            >
              {type.icon}
            </div>

            <div>
              <strong style={{ fontSize: "16px", color: "#222" }}>
                {type.title}
              </strong>
              <div style={{ fontSize: "13px", color: "#666" }}>
                {type.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
