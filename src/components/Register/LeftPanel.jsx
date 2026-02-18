import React, { useEffect, useState } from "react";
 
const LeftPanel = () => {
  const [show, setShow] = useState(false);
 
  useEffect(() => {
    // trigger slide-in after mount
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);
 
  return (
    <div
      style={{
        flex: 0.5,
        background:
          "linear-gradient(145deg, rgba(11,29,58,0.92), rgba(15,42,87,0.92), rgba(8,23,47,0.92))",
        color: "#d0f0ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
 
        /* 🔥 LEFT SLIDE-IN */
        transform: show ? "translateX(0)" : "translateX(-70px)",
        opacity: show ? 1 : 0,
        transition: "all 0.8s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "520px",
          width: "100%",
        }}
      >
        {/* BULB ICON (BIGGER) */}
        <svg
          width="60"
          height="60"
          viewBox="0 0 64 64"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginBottom: "26px",
            filter: "drop-shadow(0 0 8px rgba(180,220,255,0.4))",
          }}
        >
          {/* Rays */}
          <line x1="32" y1="2" x2="32" y2="8" />
          <line x1="32" y1="56" x2="32" y2="62" />
          <line x1="2" y1="32" x2="8" y2="32" />
          <line x1="56" y1="32" x2="62" y2="32" />
          <line x1="10" y1="10" x2="14" y2="14" />
          <line x1="50" y1="50" x2="54" y2="54" />
          <line x1="10" y1="54" x2="14" y2="50" />
          <line x1="50" y1="14" x2="54" y2="10" />
 
          {/* Bulb */}
          <path d="M32 8c-10 0-18 8-18 18 0 7 4.5 12.5 8.5 16 2 2 3 4 3 6h13c0-2 1-4 3-6 4-3.5 8.5-9 8.5-16 0-10-8-18-18-18z" />
 
          {/* Filament */}
          <path d="M26 36c2 2 10 2 12 0" />
          <path d="M26 40c2 2 10 2 12 0" />
 
          {/* Base */}
          <path d="M26 48h12" />
          <path d="M27 52h10" />
 
          {/* AI Chip */}
          <rect x="24" y="22" width="16" height="14" rx="2" />
          <text
            x="32"
            y="32"
            textAnchor="middle"
            fontSize="8"
            fill="white"
            stroke="none"
            fontWeight="bold"
          >
            AI
          </text>
        </svg>
 
        {/* ONE-LINE TITLE */}
        <h1
          style={{
            fontSize: "44px",
            fontWeight: 700,
            color: "#cfefff",
            marginBottom: "18px",
            whiteSpace: "nowrap",
          }}
        >
          AI Content Generator
        </h1>
 
        {/* SUBTITLE */}
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#b7dcf5",
            maxWidth: "380px",
          }}
        >
          Generate amazing content powered by AI effortlessly.
        </p>
      </div>
    </div>
  );
};
 
export default LeftPanel;