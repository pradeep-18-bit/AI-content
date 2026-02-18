import React, { useState, useEffect } from "react";
import { FaRegFileAlt, FaShareAlt, FaBullhorn, FaEnvelope } from "react-icons/fa";
import "./AdminDashboard.css";

const contentTypeToneMap = {
  "Blog Post": "Professional",
  "Email Copy": "Professional",
  "Social Media": "Engaging",
  "Ad Copy": "Persuasive",
};

const adminContentTypes = [
  { key: "Blog Post", title: "Blog Post", description: "SEO-optimized articles", icon: FaRegFileAlt, color: "#6b46ff" },
  { key: "Social Media", title: "Social Media", description: "Engaging posts", icon: FaShareAlt, color: "#ff6b6b" },
  { key: "Ad Copy", title: "Ad Copy", description: "High-converting ads", icon: FaBullhorn, color: "#00b894" },
  { key: "Email Copy", title: "Email Copy", description: "Professional email campaigns", icon: FaEnvelope, color: "#0984e3" },
];

const adminContentTones = [
  "Professional",
  "Engaging",
  "Persuasive",
];

const adminContentFields = {
  "Blog Post": [
    { label: "Blog Title", type: "text", key: "title" },
    { label: "Topic or Keywords", type: "text", key: "keywords" },
    { label: "Blog Description", type: "textarea", key: "outline" },
  ],
  "Social Media": [
    { label: "Platform", type: "text", key: "platform" },
    { label: "Hashtags", type: "text", key: "hashtags" },
    { label: "Message", type: "textarea", key: "message" },
  ],
  "Ad Copy": [
    { label: "Product/Service Name", type: "text", key: "product" },
    { label: "Target Audience", type: "text", key: "audience" },
    { label: "USP", type: "textarea", key: "usp" },
  ],
  "Email Copy": [
    { label: "Subject Line", type: "text", key: "subject" },
    { label: "Recipient Type", type: "text", key: "recipient" },
    { label: "Body Notes", type: "textarea", key: "body" },
  ],
};

/* ---------------- BACKEND CONTENT TYPE MAPPER ---------------- */

const mapContentTypeForApi = (type) => {
  switch (type) {
    case "Blog Post":
      return "Blog";
    case "Email Copy":
      return "Email";
    case "Social Media":
      return "SocialMedia";
    case "Ad Copy":
      return "AdCopy";
    default:
      return type;
  }
};

/* ============================================================
   Content Type Selector Component
============================================================= */

const AdminContentTypeSelector = ({
  contentTypes,
  contentType,
  setContentType,
  setFormData,
  setErrors,
  setGeneratedContent,
}) => {

  const typeCardClass = (type) =>
    contentType === type ? "adminContentTypeCard adminContentTypeCardActive" : "adminContentTypeCard";

  return (
    <div
      className="adminContentTypeCardContainer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h3>Choose Content Type</h3>
      <p style={{ marginTop: "-10px" }}>
        Select the type of content you want to generate
      </p>
      {contentTypes.map((type) => {
        const Icon = type.icon;
        return (
          <div
            key={type.key}
            className={typeCardClass(type.key)}
            onClick={() => {
              setContentType(type.key);
              setFormData({});
              setErrors({});
              setGeneratedContent("");
            }}
          >
            <div className="adminContentTypeCardIcon" style={{ backgroundColor: type.color }}>
              <Icon size={24} />
            </div>

            <div>
              <strong className="adminContentTypeCardTitle">{type.title}</strong>
              <div className="adminContentTypeCardText">{type.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   Configuration Form Component
============================================================= */

const AdminConfigForm = ({
  configFields,
  formData,
  handleChange,
  tone,
  wordCount,
  setWordCount,
  contentType,
  handleGenerate,
  loading,
  errors,
}) => {
  return (
    <div className="adminContentConfigCard">
      <h3>Content Configuration</h3>
      <p>Customize your {contentType} settings</p>

      {configFields.map((field) => (
        <label key={field.key} className="adminContentConfigFieldLabel">
          {field.label}
          {field.type === "text" ? (
            <input
              type="text"
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`adminContentConfigFieldInput ${errors[field.key] ? "input-error" : ""}`}
            />
          ) : (
            <textarea
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`adminContentConfigFieldTextarea ${errors[field.key] ? "input-error" : ""}`}
            />
          )}
          {errors[field.key] && <div className="error-text">{errors[field.key]}</div>}
        </label>
      ))}

      <div style={{ marginTop: "12px" }}>
        <label style={{ fontSize: "16px", color: "#333", display: "block", fontFamily: "inherit" }}>
          Tone
          <div
            style={{
              marginTop: "6px",
              padding: "8px 10px",
              background: "#f5f5f5",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#333",
              width: "100%",
            }}
          >
            {tone}
          </div>
        </label>

        <label style={{ fontSize: "16px", color: "#333", display: "block", marginTop: "14px", fontFamily: "inherit" }}>
          Word Count: {wordCount} words
          <input
            type="range"
            min={100}
            max={2000}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            className="adminContentConfigFieldRange"
            style={{ width: "100%", marginTop: "6px" }}
          />
        </label>
      </div>

      <button className="adminContentGenerateButton" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : `⚡ Generate ${contentType} `}
      </button>
    </div>
  );
};

/* ============================================================
   MAIN PAGE COMPONENT
============================================================= */

export default function AdminContentGeneratorPage() {
  const [contentType, setContentType] = useState("Blog Post");
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState("Professional");
  const [wordCount, setWordCount] = useState(500);
  const [generatedContent, setGeneratedContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const generatedContentRef = React.useRef(null);

  useEffect(() => {
    setTone(contentTypeToneMap[contentType]);
  }, [contentType]);

  useEffect(() => {
    if (generatedContent) {
      generatedContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [generatedContent]);

  const saveToHistory = (title, content) => {
    const oldHistory = JSON.parse(localStorage.getItem("adminContentHistory")) || [];

    const newItem = {
      title,
      type: contentType,
      status: "Published",
      wordCount,
      date: new Date().toISOString(),
      content,
    };

    oldHistory.unshift(newItem);
    localStorage.setItem("adminContentHistory", JSON.stringify(oldHistory));
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleGenerate = async () => {
    const newErrors = {};
    adminContentFields[contentType].forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setGeneratedContent("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt");

      const payload = {
        ContentType: mapContentTypeForApi(contentType),

        title:
          formData.title ||
          formData.subject ||
          formData.product ||
          formData.platform ||
          "",

        keywords:
          formData.keywords ||
          formData.recipient ||
          formData.audience ||
          formData.hashtags ||
          "",

        description:
          formData.outline ||
          formData.body ||
          formData.usp ||
          formData.message ||
          "",

        tone,
        wordCount,
        Prompt: ""
      };

      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Content/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const t = await response.text();
        throw new Error(t);
      }

      const data = await response.json();

      setGeneratedContent(data.html);

      saveToHistory(
        payload.title || "Untitled",
        data.html
      );

    } catch (err) {
      console.error("Generate error:", err);
      alert("Content generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminContentWrapper">
      <div
        className="adminContentContainer"
        style={{
          border: "2px solid #6b46ff",
          borderRadius: "12px",
          padding: "10px",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginLeft: "100px",
          marginTop: "30px",
        }}
      >
        <h3 className="adminContentTitle">Generate Content</h3>
        <p className="adminContentSubtitle">Create amazing content with the power of AI</p>

        <div className="adminContentFlex">
          <AdminContentTypeSelector
            contentTypes={adminContentTypes}
            contentType={contentType}
            setContentType={setContentType}
            setFormData={setFormData}
            setErrors={setErrors}
            setGeneratedContent={setGeneratedContent}
          />

          <AdminConfigForm
            configFields={adminContentFields[contentType]}
            formData={formData}
            handleChange={handleChange}
            tone={tone}
            setTone={setTone}
            tones={adminContentTones}
            wordCount={wordCount}
            setWordCount={setWordCount}
            contentType={contentType}
            handleGenerate={handleGenerate}
            loading={loading}
            errors={errors}
          />
        </div>

        {loading && <p>⚡ Generating content...</p>}

        {generatedContent && !loading && (
          <div className="adminGeneratedContent" ref={generatedContentRef}>
            <h4>Generated {contentType}:</h4>
            <div className="generatedContentBox">
              <div
                style={{ lineHeight: "1.6" }}
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
