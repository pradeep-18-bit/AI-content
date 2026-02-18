import React, { useState } from "react";

export default function TemplateForm({ onSave, success }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uses, setUses] = useState(0);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const inputStyle = (error) => ({
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: error ? "2px solid #ff3b3b" : "1px solid #ccc",
    background: "white",
    boxSizing: "border-box",
    marginTop: "3px",
  });

  const errorTextStyle = {
    color: "#ff3b3b",
    fontSize: "12px",
    height: "10px",
    marginBottom: "4px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!category) newErrors.category = "Please select a category";
    if (!description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to create a template");
      return;
    }

    // ✅ FINAL CORRECT BODY (NO WRAPPING)
    const newTemplate = {
      title,
      category,
      description,
      tags, // backend expects string
      uses: Number(uses),
      rating: Number(rating),
    };

    try {
      setLoading(true);

      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTemplate),
        }
      );

      const result = await response.text();
      console.log("Backend result:", result);

      if (!response.ok) {
        throw new Error(result);
      }

      onSave(JSON.parse(result));

      // Reset form
      setTitle("");
      setCategory("");
      setDescription("");
      setTags("");
      setUses(0);
      setRating(0);
      setErrors({});

    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving template: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "650px",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <input
        type="text"
        placeholder="Template Title *"
        value={title}
        style={inputStyle(errors.title)}
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors((prev) => ({ ...prev, title: "" }));
        }}
      />
      <span style={errorTextStyle}>{errors.title}</span>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setErrors((prev) => ({ ...prev, category: "" }));
        }}
        style={inputStyle(errors.category)}
      >
        <option value="" disabled>
          Select Category *
        </option>
        <option value="Blog Post">Blog Post</option>
        <option value="Social Media">Social Media</option>
        <option value="Ad Copy">Ad Copy</option>
        <option value="Email Copy">Email Copy</option>
      </select>
      <span style={errorTextStyle}>{errors.category}</span>

      {/* Description */}
      <textarea
        placeholder="Description *"
        value={description}
        style={{
          ...inputStyle(errors.description),
          minHeight: "110px",
          fontFamily: "'Poppins', sans-serif", // 👈 ADD THIS
          fontSize: "14px",                     // optional
        }}
        onChange={(e) => {
          setDescription(e.target.value);
          setErrors((prev) => ({ ...prev, description: "" }));
        }}
      />
      <span style={errorTextStyle}>{errors.description}</span>

      {/* Optional */}
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        style={inputStyle(false)}
        onChange={(e) => setTags(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          background: "#2e397aff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          width: "100%",
        }}
      >
        {loading ? "Saving..." : "Save Template"}
      </button>

      {success && (
        <p style={{ color: "green" }}>✅ Template saved successfully!</p>
      )}
    </form>
  );
}
