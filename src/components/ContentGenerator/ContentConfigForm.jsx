import React, { useState } from "react";

/* ------------------ HELPERS ------------------ */

const hasAtLeastOneMeaningfulWord = (value) => {
  const words = value
    .replace(/,/g, " ")
    .trim()
    .split(/\s+/);

  return words.some((word) => {
    if (/^(ai|ml|seo|ui|ux)$/i.test(word)) return true;
    return (
      word.length >= 3 &&
      /[a-zA-Z]/.test(word) &&
      /[aeiouAEIOU]/.test(word) &&
      !/(.)\1{2,}/.test(word)
    );
  });
};

const hasOnlyNumbers = (value) => /^[0-9]+$/.test(value);
const hasOnlySpecialChars = (value) => /^[^a-zA-Z0-9\s]+$/.test(value);
const hasNoAlphabets = (value) => !/[a-zA-Z]/.test(value);

/* ------------------ CONTENT TYPE MAPPER ------------------ */

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

/* ------------------ CONFIG ------------------ */

const configFields = {
  "Blog Post": [
    { label: "Blog Title", type: "text", key: "title" },
    { label: "Topic or Keywords", type: "text", key: "keywords" },
    { label: "Blog Description", type: "textarea", key: "outline" },
  ],
  "Social Media": [
    { label: "Platform (Facebook, Twitter etc.)", type: "text", key: "platform" },
    { label: "Hashtags", type: "text", key: "hashtags" },
    { label: "Message", type: "textarea", key: "message" },
  ],
  "Ad Copy": [
    { label: "Product/Service Name", type: "text", key: "product" },
    { label: "Target Audience", type: "text", key: "audience" },
    { label: "USP (Unique Selling Point)", type: "textarea", key: "usp" },
  ],
  "Email Copy": [
    { label: "Subject Line", type: "text", key: "subject" },
    { label: "Recipient Type", type: "text", key: "recipient" },
    { label: "Body Notes", type: "textarea", key: "body" },
  ],
};

export default function ContentConfigForm({
  contentType,
  formData,
  tone,
  wordCount,
  onChange,
  setTone,
  setWordCount,
  setGeneratedContent,
  usesUpdating,
  isGenerating,
  onGenerate, // not used
  allowedTones,
}) {
  const [errors, setErrors] = useState({});

  const generateLocalFallback = () => {
    switch (contentType) {
      case "Social Media":
        return `💬 Question for you!

What’s one strategy that helped you improve engagement on social media?

Drop your thoughts in the comments 👇
${formData.hashtags || "#SocialMedia #Engagement #Growth"}`;

      case "Blog Post":
        return `${formData.title || "Blog Post"}

${formData.outline}`;

      case "Ad Copy":
        return `🚀 ${formData.product}

Perfect for ${formData.audience}.

Why choose us?
${formData.usp}`;

      case "Email Copy":
        return `Subject: ${formData.subject}

Hello ${formData.recipient},

${formData.body}`;

      default:
        return "Content could not be generated. Please try again.";
    }
  };

  const handleGenerate = async () => {
    const requiredFields = configFields[contentType] || [];
    const newErrors = {};

    requiredFields.forEach((field) => {
      const value = (formData[field.key] || "").trim();

      if (!value) {
        newErrors[field.key] = `${field.label} is required.`;
        return;
      }

      if (hasOnlyNumbers(value)) {
        newErrors[field.key] = `${field.label} cannot contain only numbers.`;
        return;
      }

      if (hasOnlySpecialChars(value)) {
        newErrors[field.key] =
          `${field.label} cannot contain only special characters.`;
        return;
      }

      if (hasNoAlphabets(value)) {
        newErrors[field.key] =
          `${field.label} must contain alphabetic characters.`;
        return;
      }

      if (!hasAtLeastOneMeaningfulWord(value)) {
        newErrors[field.key] =
          `${field.label} must contain at least one meaningful word.`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        return;
      }

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


      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Content/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const fallback = generateLocalFallback();
        setGeneratedContent(fallback);
        return;
      }

      const data = await res.json();
      setGeneratedContent(data.html || "");

      localStorage.removeItem("draftFormData");
    } catch (err) {
      console.error("Generate failed:", err);
      alert("Content generation failed. Check console.");
    }
  };

  return (
    <div className="config-card">
      <h3>Content Configuration</h3>
      <p>Customize your {contentType} settings</p>

      {configFields[contentType]?.map((field) => (
        <label key={field.key} style={{ display: "block", marginBottom: 12 }}>
          {field.label}
          {field.type === "text" ? (
            <input
              type="text"
              value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          ) : (
            <textarea
              value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
          {errors[field.key] && (
            <div style={{ color: "red" }}>{errors[field.key]}</div>
          )}
        </label>
      ))}

      <label style={{ display: "block", marginTop: 16 }}>
        Content Style
        <input
          type="text"
          value={tone}
          disabled
          style={{
            width: "100%",
            padding: "10px 12px",
            marginTop: 6,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: "15px",
            background: "#f9fafb",
            cursor: "default",
          }}
        />
      </label>

      <label style={{ display: "block", marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          <span>Word Count</span>
          <span>{wordCount}</span>
        </div>

        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value))}
          style={{
            width: "100%",
            height: "6px",
            borderRadius: "6px",
            cursor: "pointer",
            accentColor: "#2e397a",
          }}
        />
      </label>

      <button onClick={handleGenerate} disabled={usesUpdating || isGenerating}>
        {isGenerating ? "Generating..." : `⚡ Generate ${contentType}`}
      </button>
    </div>
  );
}
