import React from "react";
import { useNavigate } from "react-router-dom";
 
export default function TemplateControls({ search, setSearch, filter, setFilter }) {
  const navigate = useNavigate();
 
  return (
    <div
      className="controls"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "nowrap", // ✅ force one line
      }}
    >
      <input
        type="text"
        placeholder="Search by name or keyword"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "220px",      // ✅ decreased width
          height: "15px",      // ✅ proper height
          paddingLeft: "12px",
          paddingRight: "40px",
          fontSize: "14px",
          marginTop: "10px",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "16px",
        }}
      />
 
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          height: "36px",
           marginTop: "10px",
        }}
      >
        <option value="All">All</option>
        <option value="Blog Post">Blog Post</option>
        <option value="Social Media">Social Media</option>
        <option value="Ad Copy">Ad Copy</option>
        <option value="Email Copy">Email Copy</option>
      </select>
 
      <button
        className="create-template-btn"
        onClick={() => navigate("/create-template")}
        style={{
          height: "36px",
          marginTop: "10px",
        }}
      >
        + Create Template
      </button>
    </div>
  );
}
