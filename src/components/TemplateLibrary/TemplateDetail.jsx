import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../App.css";

export default function TemplateDetail({ initialTemplates = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  // ⭐ Rating
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  /* ============================================================
        FETCH TEMPLATE
  ============================================================ */
  useEffect(() => {
    const fetchTemplateById = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );
        if (res.status === 404) {
          throw new Error("TEMPLATE_NOT_FOUND");
        }

        if (!res.ok) {
          throw new Error("SERVER_ERROR");
        }

        const data = await res.json();
        setTemplate(data);

        // keep localStorage in sync with server
        const stored = JSON.parse(localStorage.getItem("templates")) || [];
        const updated = stored.map((t) =>
          Number(t.id ?? t.Id ?? t.templateId ?? t._id) === Number(id)
            ? { ...t, uses: Number(data.uses ?? data.Uses ?? t.uses ?? 0) }
            : t
        );

        localStorage.setItem("templates", JSON.stringify(updated));

        /* ⭐ LOAD SAVED RATING */
        const savedRating = JSON.parse(localStorage.getItem("templateRating"));

        setRating(
          savedRating && Number(savedRating.templateId) === Number(id)
            ? Number(savedRating.rating)
            : Number(data.rating || 0)
        );

        setAvgRating(
          Number(
            data.AverageRating ??
            data.averageRating ??
            data.Rating ??
            data.rating ??
            savedRating?.rating ??
            0
          )
        );

      } catch (err) {
        if (err.message !== "TEMPLATE_NOT_FOUND") {
          console.error("Fetch error:", err.message);
        }

        const local = initialTemplates.find(
          (t) => Number(t.id ?? t.Id ?? t.templateId ?? t._id) === Number(id)
        );

        if (local) {
          setTemplate(local);
          setError(""); // ✅ clear error
        } else if (err.message === "TEMPLATE_NOT_FOUND") {
          setError("This template no longer exists.");
        } else {
          setError("Server error while loading template.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateById();
  }, [id, initialTemplates]);

  /* ============================================================
        ⭐ SAVE RATING
  ============================================================ */
  // Replace ONLY submitRating with this block, rest stays same.
  const submitRating = async (value) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const templateId =
        template?.id || template?.Id || template?._id || template?.templateId || id;

      if (!templateId) return;

      // ⭐ UPDATE UI
      setRating(value);

      const res = await fetch(
        `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/rate/${templateId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ Rating: Number(value) }),
        }
      );

      const updated = await res.json();

      const newAvg = Number(
        updated?.averageRating ??
        updated?.avgRating ??
        updated?.rating ??
        value
      );

      setAvgRating(newAvg);

      setTemplate((prev) => ({
        ...prev,
        rating: value,
        averageRating: newAvg,
      }));

      const updates = JSON.parse(localStorage.getItem("template_updates")) || {};

      updates[String(templateId)] = {
        ...(updates[String(templateId)] || {}),
        rating: Number(value),
        averageRating: Number(newAvg),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("template_updates", JSON.stringify(updates));

      /* ⭐ also save last user rating */
      localStorage.setItem(
        "templateRating",
        JSON.stringify({ templateId: Number(templateId), rating: value })
      );

      // Refresh library
      const refreshed = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates",
        { headers: { "ngrok-skip-browser-warning": "69420" } }
      );

      const newList = await refreshed.json();

      const updatesStore =
        JSON.parse(localStorage.getItem("template_updates")) || {};

      const merged = newList.map((t) => {
        const tid = String(t.id ?? t.Id ?? t.templateId ?? t._id);
        const local = updatesStore[tid];

        return local
          ? {
            ...t,
            rating: local.rating ?? t.rating,
            averageRating: local.averageRating ?? t.averageRating,
          }
          : t;
      });

      localStorage.setItem("templates", JSON.stringify(merged));
      window.dispatchEvent(new Event("updateTemplates"));

    } catch (err) {
      console.error("Rating update error:", err);
    }
  };

  /* ============================================================
        DELETE TEMPLATE
  ============================================================ */
 const handleDelete = async () => {
  setDeleteError("");
  setDeleteSuccess("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const currentEmail = currentUser.email || currentUser.mailId || "";

  const creatorEmail =
    template?.createdByEmail ||
    template?.creatorEmail ||
    template?.email ||
    template?.createdBy ||
    "";

  // ✅ block delete if not creator
  if (creatorEmail && currentEmail && creatorEmail !== currentEmail) {
    setDeleteError("Only creators can delete this template.");
    return;
  }

  setDeleting(true);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        setDeleteError("Only creators can delete this template.");
        return;
      }
      throw new Error("Failed to delete");
    }

    setDeleteSuccess("Template deleted!");
    window.dispatchEvent(new Event("updateTemplates"));

    setTimeout(() => navigate("/template-library"), 900);
  } catch (err) {
    setDeleteError("Only creators can delete this template.");
  } finally {
    setDeleting(false);
  }
};


  // ================== USE TEMPLATE (INCREMENT USES) ==================
  const handleUseTemplate = () => {
    navigate("/content-generator", {
      state: {
        template, // ✅ DO NOT MODIFY uses here
        fromTemplate: true,
      },
    });
  };

  /* ============================================================
        UI
  ============================================================ */
  if (loading) return <p className="template-detail-loading">Loading...</p>;
  if (error) return <p className="template-detail-error">{error}</p>;
  if (!template) return <p>No template found.</p>;

  const title =
    template.Title ?? template.title ?? "";

  const category =
    template.Category ?? template.category ?? "";

  const description =
    template.Description ?? template.description ?? "";

  const tags =
    template.Tags ?? template.tags ?? "";

  const uses =
    template.Uses ?? template.uses ?? 0;

  if (!template) return <p>No template found.</p>;

  const tagList = Array.isArray(tags)
    ? tags
    : typeof tags === "string" && tags.trim()
      ? tags.split(",").map((t) => t.trim())
      : [];

  return (
    <div className="template-detail-container">
      <div className="template-detail-card">
        <h2>{title}</h2>

        <p><strong>Category:</strong> {category}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Tags:</strong> {tagList.join(", ") || "N/A"}</p>
        <p><strong>Uses:</strong> {uses || 0}</p>

        {/* ⭐ RATING UI */}
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <strong>Average Rating:</strong>

          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              style={{
                fontSize: "22px",
                color: avgRating >= num ? "#facc15" : "#ccc",
                marginRight: 4,
                cursor: "default",
              }}
            >
              ★
            </span>
          ))}

          <span style={{ marginLeft: 6 }}>
            {Number(avgRating || 0).toFixed(1)}
          </span>
        </div>

        <div className="template-detail-buttons">
          <button onClick={() => navigate("/template-library")}>
            Back to Library
          </button>

          <button
            style={{ backgroundColor: "#2e397aff", color: "white" }}
            onClick={handleUseTemplate}
          >
            Use Template
          </button>

          <button
            style={{ backgroundColor: "#2e397aff", color: "white" }}
            onClick={() => navigate(`/template-edit/${id}`)}
          >
            Update Template
          </button>

          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Template"}
          </button>
        </div>

        {deleteError && <p className="template-detail-error">{deleteError}</p>}
        {deleteSuccess && (
          <p className="template-detail-success">{deleteSuccess}</p>
        )}
      </div>
    </div>
  );
}