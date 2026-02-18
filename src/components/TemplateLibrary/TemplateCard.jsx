// src/components/TemplateLibrary/TemplateCard.jsx
import React, { useState, useEffect, useCallback } from "react";
 
/**
 * TemplateCard
 * - Displays a single template card with average rating, uses and tags
 * - Listens for "updateTemplates" events and syncs rating/uses from localStorage
 *
 * Props:
 *  - template: object (may have id / Id / _id / templateId)
 *  - navigate: optional function to programmatically navigate (react-router)
 */
export default function TemplateCard({ template, navigate }) {
  if (!template || typeof template !== "object") return null;
 
  // Normalize any id-like field to a stable string key
  const normalizeId = useCallback((obj) => {
    const raw = obj?.id ?? obj?.Id ?? obj?.templateId ?? obj?._id;
    if (raw === undefined || raw === null) return null;
    return String(raw);
  }, []);
 
  const templateId = normalizeId(template);
  if (!templateId) {
    console.warn("Invalid template ID:", template);
    return null;
  }
  const initialUses = (() => {
    const v = Number(template?.uses ?? template?.Uses ?? 0);
    return Number.isFinite(v) ? v : 0;
  })();
 
  const initialRating = (() => {
    const v = Number(template?.rating ?? 0);
    return Number.isFinite(v) ? v : 0;
  })();
 
  const initialAvg = (() => {
    const v = Number(
      template?.averageRating ??
      template?.AverageRating ??
      template?.rating ??
      template?.Rating ??
      0
    );
    return Number.isFinite(v) ? v : 0;
  })();
 
  const [uses, setUses] = useState(initialUses);
  const [rating, setRating] = useState(initialRating);
  const [avgRating, setAvgRating] = useState(initialAvg);
 
  // ensure component updates if `template` prop changes externally
  useEffect(() => {
    setUses(initialUses);
    setRating(initialRating);
    setAvgRating(initialAvg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]); // update when template identity changes
 
  const { title = "", category = "", description = "", tags = "" } = template;
 
  const tagList =
    typeof tags === "string" && tags.trim() !== ""
      ? tags.split(",").map((t) => t.trim())
      : Array.isArray(tags)
        ? tags.map((t) => String(t).trim())
        : [];
 
  /* ============================================================
     INITIAL SYNC FROM localStorage (page load / refresh)
  ============================================================ */
  useEffect(() => {
    try {
      const updates = JSON.parse(localStorage.getItem("template_updates")) || {};
      const entry = updates[templateId];
      if (!entry) return;
 
      if (Number.isFinite(Number(entry.uses))) {
        setUses((prev) => Math.max(prev, Number(entry.uses)));
      }
    } catch {
      // ignore
    }
  }, [templateId]);
  /* ============================================================
     LIVE UPDATE WHEN updateTemplates EVENT FIRES
  ============================================================ */
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const updates = JSON.parse(localStorage.getItem("template_updates")) || {};
        const entry = updates[templateId];
        if (!entry) return;
 
        if (Number.isFinite(Number(entry.uses))) {
          setUses((prev) => Math.max(prev, Number(entry.uses)));
        }
 
        if (Number.isFinite(Number(entry.rating))) {
          setRating(Number(entry.rating));
        }
 
        if (Number.isFinite(Number(entry.averageRating ?? entry.rating))) {
          setAvgRating(Number(entry.averageRating ?? entry.rating));
        }
      } catch {
        // ignore
      }
    };
 
    window.addEventListener("updateTemplates", handleUpdate);
    return () => window.removeEventListener("updateTemplates", handleUpdate);
  }, [templateId]);
 
  /* --------------------------------------------------------
     RENDER CARD
  -------------------------------------------------------- */
  return (
    <div
      className="template-card"
      style={{
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #eef2f6",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(16,24,40,0.03)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: "200px",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{category}</span>
        </div>
 
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: 20,
            lineHeight: 1.25,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>
 
        <p
          style={{
            margin: "0 0 12px 0",
            fontSize: 14,
            color: "#374151",
 
            /* 🔥 FIX LONG DESCRIPTION */
            maxHeight: "72px",          // limits height
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,         // show only 3 lines
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </p>
 
        {/* ⭐ STAR RATING DISPLAY (AVERAGE RATING) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                aria-hidden
                style={{
                  color: avgRating >= num ? "#f5b50a" : "#e5e7eb",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ))}
            <span style={{ marginLeft: 6, fontSize: 13, color: "#374151" }}>
              {Number.isFinite(avgRating) ? avgRating.toFixed(1) : "0.0"}
            </span>
          </div>
        </div>
 
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
          👁 {uses} uses
        </div>
 
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          {tagList.length ? (
            tagList.map((tag, idx) => (
              <span
                key={idx}
                title={tag}   // ⭐ shows full text on hover
                style={{
                  padding: "6px 10px",
                  background: "#f3f4f6",
                  borderRadius: 9999,
                  fontSize: 12,
                  color: "#374151",
 
                  /* 🔥 FIX LONG TAG TEXT */
                  maxWidth: "140px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>No tags</span>
          )}
        </div>
      </div>
 
      <button
        type="button"
        onClick={() => {
          try {
            if (typeof navigate === "function") {
              navigate(`/template/${templateId}`);
            } else {
              // fallback to direct navigation
              window.location.href = `/template/${templateId}`;
            }
          } catch {
            window.location.href = `/template/${templateId}`;
          }
        }}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#162d64",
          color: "#fff",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontSize: 15,
          marginTop: 12,
        }}
        aria-label={`View template ${title}`}
      >
        View Template →
      </button>
    </div>
  );
}
 