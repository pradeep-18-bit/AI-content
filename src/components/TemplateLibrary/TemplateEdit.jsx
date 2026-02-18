import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TemplateFormEdit.css";

export default function TemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [notOwnerError, setNotOwnerError] = useState("");

  /* ================= FETCH TEMPLATE ================= */
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/${id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to load template");

        const data = await res.json();

        // ✅ OWNER CHECK (FRONTEND ONLY)
        const currentUser =
          JSON.parse(localStorage.getItem("currentUser")) || {};
        const currentEmail = currentUser.email || currentUser.mailId || "";

        const creatorEmail =
          data.createdByEmail ||
          data.creatorEmail ||
          data.email ||
          data.createdBy ||
          "";

        if (creatorEmail && currentEmail && creatorEmail !== currentEmail) {
          setNotOwnerError("Only the template owner can update this template.");
          setLoading(false);
          return;
        }

        setTitle(data.Title ?? data.title ?? "");
        setCategory(data.Category ?? data.category ?? "");
        setDescription(data.Description ?? data.description ?? "");

        const rawTags = data.Tags ?? data.tags ?? "";
        setTags(Array.isArray(rawTags) ? rawTags.join(", ") : rawTags);
      } catch (err) {
        console.error("Error loading template:", err);
        navigate("/template-library");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, navigate]);

  /* ================= UPDATE TEMPLATE ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!title.trim()) validationErrors.title = "Title is required";
    if (!category) validationErrors.category = "Category is required";
    if (!description.trim())
      validationErrors.description = "Description is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const dto = {
        id: Number(id),
        title: title.trim(),
        category,
        description: description.trim(),
        template: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(", "),
      };

      const res = await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify(dto),
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 500) {
          setNotOwnerError("Only the template owner can update this template.");
          return;
        }
        setNotOwnerError("Update failed. Please try again.");
        return;
      }

      navigate("/template-library");
    } catch (err) {
      console.error("Error updating template:", err);
      setNotOwnerError("Server error. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  }

  if (notOwnerError) {
    return (
      <div className="form-container">
        <div className="form-card">
          {/* 🔙 Back Arrow Top Left */}
          <button
            type="button"
            className="back-arrow-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h2>Edit Template</h2>
          <p style={{ color: "red", marginTop: "12px" }}>{notOwnerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <form className="form-card" onSubmit={handleUpdate}>
        {/* 🔙 Back Arrow Top Left */}
        <button
          type="button"
          className="back-arrow-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2>Edit Template</h2>

        {/* Title */}
        <label style={{ fontWeight: 600 }}>Template Title</label>
        <input
          className={`form-input ${errors.title ? "error" : ""}`}
          value={title}
          placeholder="Template Title *"
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({ ...errors, title: "" });
          }}
        />
        <span className="error-text">{errors.title}</span>

        {/* Category */}
        <label style={{ fontWeight: 600 }}>Category</label>
        <select
          className={`form-select ${errors.category ? "error" : ""}`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setErrors({ ...errors, category: "" });
          }}
        >
          <option value="">Select Category *</option>
          <option value="Blog Post">Blog Post</option>
          <option value="Social Media">Social Media</option>
          <option value="Ad Copy">Ad Copy</option>
          <option value="Email Copy">Email Copy</option>
        </select>
        <span className="error-text">{errors.category}</span>

        {/* Description */}
        <label style={{ fontWeight: 600 }}>Description</label>
        <textarea
          className={`form-textarea ${errors.description ? "error" : ""}`}
          value={description}
          placeholder="Description *"
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors({ ...errors, description: "" });
          }}
        />
        <span className="error-text">{errors.description}</span>

        {/* Tags */}
        <label style={{ fontWeight: 600 }}>Tags</label>
        <input
          className="form-input"
          value={tags}
          placeholder="Tags (comma separated)"
          onChange={(e) => setTags(e.target.value)}
        />

        <button className="submit-btn" disabled={saving} type="submit">
          {saving ? "Updating..." : "Update Template"}
        </button>
      </form>
    </div>
  );
}
