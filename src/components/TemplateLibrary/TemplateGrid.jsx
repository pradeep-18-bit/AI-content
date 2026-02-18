import React from "react";
import TemplateCard from "./TemplateCard";

export default function TemplateGrid({ templates, navigate }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))", // ✅ force 3 columns
        gap: "25px",
        width: "100%",
      }}
    >
      {templates.map((t) => (
        <TemplateCard
          key={t.id || t._id || t.templateId} // ✅ safe key
          template={{
            ...t,
            averageRating: t.averageRating ?? t.rating ?? 0,
          }}
          navigate={navigate}
        />
      ))}
    </div>
  );
}
