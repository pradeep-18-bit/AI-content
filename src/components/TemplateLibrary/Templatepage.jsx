import React, { useState, useEffect } from "react";
import TemplateForm from "./TemplateForm";
import TemplateLibrary from "./TemplateLibrary";

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://YOUR-NEW-NGROK-URL.ngrok-free.app/api/Templates",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid JSON response");

      setTemplates(data);
      localStorage.setItem("templates", JSON.stringify(data));
    } catch (err) {
      console.error("❌ Error fetching templates:", err);
      setError("Unable to load templates");
    } finally {
      setLoading(false);
    }
  };

  // Fetch once on load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("templates"));
    if (saved) setTemplates(saved);
    fetchTemplates();
  }, []);

  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
      {/* Left: Form */}
      <TemplateForm onTemplateAdded={fetchTemplates} />

      {/* Right: Library */}
      <TemplateLibrary
        templates={templates}
        loading={loading}
        error={error}
        onRetry={fetchTemplates}
      />
    </div>
  );
}
