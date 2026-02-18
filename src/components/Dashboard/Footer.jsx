import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLinkedin,
  FaInstagram,
  FaPhoneAlt,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();
  const goTo = (path) => {
    navigate(path);
  };

  const styles = {
    cta: {
      padding: "70px 20px",
      textAlign: "center",
      background: "linear-gradient(145deg, #0b1d3a, #0f2a57, #08172f)",
      color: "#d0f0ff",
    },
    buttons: {
      display: "flex",
      justifyContent: "center",
      gap: 16,
      marginTop: 30,
      flexWrap: "wrap",
    },
    btnWhite: {
      padding: "12px 22px",
      borderRadius: 30,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      background: "#ffffff",
      color: "#0b1d3a",
    },
    btnOutline: {
      padding: "12px 22px",
      borderRadius: 30,
      background: "transparent",
      color: "#ffffff",
      border: "1.5px solid #ffffff",
      cursor: "pointer",
      fontWeight: 600,
    },
    info: {
      marginTop: 20,
      display: "flex",
      justifyContent: "center",
      gap: 20,
      flexWrap: "wrap",
      fontSize: 14,
    },

    bottom: {
      display: "grid",
      gridTemplateColumns: "2.2fr 1fr 1fr 1fr",
      gap: 60,
      padding: "70px 80px",
      background: "#08172f",
      color: "#d0f0ff",
      alignItems: "flex-start",
    },

    brand: {
      maxWidth: 360,
    },
    brandTitle: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "24px",
      fontWeight: 800,
      color: "#ffffff",
      whiteSpace: "nowrap",
      marginBottom: "12px",
    },
    icons: {
      display: "flex",
      gap: 16,
      marginTop: 18,
    },
    iconLink: {
      fontSize: 20,
      color: "#d0f0ff",
      cursor: "pointer",
    },
    column: {
      lineHeight: 2.2,
    },
    columnTitle: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#ffffff",
    },
    link: {
      cursor: "pointer",
      opacity: 0.85,
      fontSize: "15px",
    },
  };

  return (
    <>
      {/* CTA SECTION */}
      <footer style={styles.cta}>
        <h2>Ready to Transform Your Content Creation?</h2>
        <p>Join thousands already using AI to create content in seconds.</p>

        <div style={styles.buttons}>
          <button
            style={styles.btnWhite}
            onClick={() => navigate("/create-template")}
          >
            Start Creating Now →
          </button>
          <button
            style={styles.btnOutline}
            onClick={() => navigate("/pricing?plan=free")}
          >
            Start Your Free Trial
          </button>
        </div>

        <div style={styles.info}>
          <span>✅ Free 7-day trial</span>
          <span>✅ No setup fees</span>
          <span>✅ Cancel anytime</span>
        </div>
      </footer>

      {/* FOOTER BOTTOM */}
      <div style={styles.bottom}>
        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.brandTitle}>
            {/* 🔥 EXACT SAME BULB AS LEFT PANEL (SCALED) */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 64 64"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 6px rgba(180,220,255,0.35))",
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

            <span>AI Content Generator</span>
          </div>

          <p>Transform your content creation with AI-powered tools.</p>

          <div style={styles.icons}>
            <FaLinkedin style={styles.iconLink} />
            <FaInstagram style={styles.iconLink} />
            <FaTwitter style={styles.iconLink} />
            <FaPhoneAlt style={styles.iconLink} />
            <FaEnvelope style={styles.iconLink} />
          </div>
        </div>


        {/* PRODUCT */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Product</div>

          <div
            style={styles.link}
            onClick={() => goTo("/content-generator")}

          >
            Content Generator
          </div>

          <div
            style={styles.link}
            onClick={() => goTo("/template-library")}
          >
            Templates
          </div>

          <div
            style={styles.link}
            onClick={() => goTo("/pricing")}
          >
            Pricing
          </div>

          <div
            style={styles.link}
            onClick={() => goTo("/settings/api")}
          >
            API
          </div>
        </div>


        {/* COMPANY */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Company</div>
          <div style={styles.link}>About</div>
          <div style={styles.link}>Blog</div>
          <div style={styles.link}>Careers</div>
          <div style={styles.link}>Partners</div>
        </div>

        {/* SUPPORT */}
        <div style={styles.column}>
          <div style={styles.columnTitle}>Support</div>
          <div style={styles.link}>Help Center</div>
          <div style={styles.link}>Contact</div>
          <div style={styles.link}>Privacy</div>
          <div style={styles.link}>Terms</div>
        </div>
      </div>
    </>
  );
};

export default Footer;
