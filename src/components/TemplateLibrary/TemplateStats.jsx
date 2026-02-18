import React from "react";

export default function TemplateStats() {
  const stats = [
    { value: "9", label: "Total Templates" },
    { value: "9", label: "Categories" },
    { value: "15.2k", label: "Total Uses" },
    { value: "4.7", label: "Avg Rating" },
  ];

  return (
    <div className="stats-cards">
      {stats.map((stat, idx) => (
        <div key={idx} className="stats-card">
          <div className="value">{stat.value}</div>
          <div className="label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
