import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TemplateControls from "./TemplateControls";
import TemplateGrid from "./TemplateGrid";
import "../../App.css";

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // 🔑 Normalize template ID (handles id / Id / _id / templateId)
  const normalizeId = (obj) =>
    String(obj?.id ?? obj?.Id ?? obj?.templateId ?? obj?._id ?? "");


  // ⭐ Fetch templates from server
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      if (!res.ok) throw new Error("Error fetching templates");

      const data = await res.json();

      const formatted = data
        .filter(t => t.Id || t.id || t.templateId || t._id)
        .map((t) => ({
          id: String(t.Id ?? t.id ?? t.templateId ?? t._id),

          title: t.Title ?? t.title ?? "Untitled",
          description: t.Description ?? t.description ?? "",
          category: (() => {
            const c = (t.Category ?? t.category ?? "").toLowerCase();
            if (c.includes("blog")) return "Blog Post";
            if (c.includes("social")) return "Social Media";
            if (c.includes("ad")) return "Ad Copy";
            if (c.includes("email")) return "Email Copy";
            return "Blog Post";
          })(),

          tags: t.Tags ?? t.tags ?? "",
          rating: t.Rating ?? t.rating ?? 0,
          averageRating: t.AverageRating ?? t.averageRating ?? t.Rating ?? t.rating ?? 0,
          uses: t.Uses ?? t.uses ?? 0,
        }));

      setTemplates(formatted);
    } catch (err) {
      console.error(err);
      setError("Unable to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Search + Filter
  const filtered = templates.filter((t) => {
    const matchesSearch = (t.title || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      t.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="template-library-container">
      <div className="template-library">
        <h2>Template Library</h2>
        <p>Access ready-to-use templates to create content faster</p>
        <TemplateControls
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
        />

        {loading ? (
          <p>Loading templates...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filtered.length ? (
          <TemplateGrid templates={filtered} navigate={navigate} />
        ) : (
          <p>No templates found.</p>
        )}
      </div>
    </div>
  );
}