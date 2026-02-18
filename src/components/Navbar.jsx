import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const hideTimeoutRef = useRef(null);

  const PROFILE_API =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile";


  const API_ORIGIN = "https://duncan-exclamatory-synaptically.ngrok-free.dev";

  const normalizeAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return API_ORIGIN + url;
    return API_ORIGIN + "/" + url;
  };
  const fetchAvatarAsBlob = async (url, token) => {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });

      if (!res.ok) return null;

      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };
  const syncUser = () => {
    const updatedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (updatedUser) {
      setUser(updatedUser);
    }
  };
  useEffect(() => {
    const syncAvatar = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("jwt");

        if (!token) return;

        const res = await fetch(PROFILE_API, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        // ✅ Extract first & last name (handle multiple key styles)
        const firstName =
          data.firstName ||
          data.FirstName ||
          data.first_name ||
          "";

        const lastName =
          data.lastName ||
          data.LastName ||
          data.secondName ||
          data.last_name ||
          "";

        // ✅ Update user state with names
        setUser((prev) => ({
          ...(prev || {}),
          firstName,
          lastName,
        }));

        // ✅ Optional: sync to localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...(JSON.parse(localStorage.getItem("currentUser")) || {}),
            firstName,
            lastName,
          })
        );

        const avatar =
          data?.avatarUrl ||
          data?.AvatarUrl ||
          data?.ProfilePhoto ||
          data?.profilePhoto;

        if (avatar) {
          const fullUrl = normalizeAvatarUrl(avatar);
          const blobUrl = await fetchAvatarAsBlob(fullUrl, token);

          if (blobUrl) {
            setAvatarUrl(blobUrl);
          } else {
            setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error("Navbar profile fetch failed", err);
      }
    };
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) setUser(storedUser);

    syncAvatar();

    const handleProfileUpdated = () => {
      syncAvatar();
      syncUser();
    };

    window.addEventListener("profileUpdated", handleProfileUpdated);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/settings/profile");
  };

  const handleMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
    setShowLogout(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowLogout(false);
    }, 300);
  };

  const displayName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()

      : "User";


  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (active) => ({
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "600",
    lineHeight: "1",
    background: active ? "#eef2ff" : "transparent",
    transition: "background 0.25s ease",
    display: "inline-flex",
    alignItems: "center",
  });

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div
        className="navbar-logo"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "22px",
          fontWeight: "900",
        }}
      >
        <svg
          width="42"
          height="42"
          viewBox="0 0 64 64"
          fill="none"
          stroke="#1534e4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(21, 52, 228, 0.6))" }}
        >
          <line x1="32" y1="2" x2="32" y2="8" />
          <line x1="32" y1="56" x2="32" y2="62" />
          <line x1="2" y1="32" x2="8" y2="32" />
          <line x1="56" y1="32" x2="62" y2="32" />
          <line x1="10" y1="10" x2="14" y2="14" />
          <line x1="50" y1="50" x2="54" y2="54" />
          <line x1="10" y1="54" x2="14" y2="50" />
          <line x1="50" y1="14" x2="54" y2="10" />
          <path d="M32 8c-10 0-18 8-18 18 0 7 4.5 12.5 8.5 16 2 2 3 4 3 6h13c0-2 1-4 3-6 4-3.5 8.5-9 8.5-16 0-10-8-18-18-18z" />
          <path d="M26 36c2 2 10 2 12 0" />
          <path d="M26 40c2 2 10 2 12 0" />
          <path d="M26 48h12" />
          <path d="M27 52h10" />
          <rect x="24" y="22" width="16" height="14" rx="2" />
          <text x="33" y="33" textAnchor="middle" fontSize="8" fill="#1534e4" fontWeight="bold">
            AI
          </text>
        </svg>
        <span>AI Content Generator</span>
      </div>

      {/* NAV LINKS */}
      <div className="navbar-links" style={{ display: "flex", gap: "6px" }}>
        {[
          { name: "Dashboard", path: "/" },
          { name: "Content Generator", path: "/content-generator" },
          { name: "Templates", path: "/template-library" },
          { name: "Content History", path: "/content-history" },
          { name: "Pricing", path: "/Pricing" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={navLinkStyle(isActive(item.path))}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) e.currentTarget.style.background = "transparent";
            }}
          >
            {item.name}
          </Link>
        ))}

        {user && (
          <Link to="/settings/profile" style={navLinkStyle(isActive("/settings/profile"))}>
            Settings
          </Link>
        )}
      </div>



      {/* PROFILE / LOGIN */}
      {!user ? (
        <Link
          to="/login"
          style={{
            padding: "7px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            color: "#101010ff",
            textDecoration: "none",
            border: "1.4px solid #0b0b0bff",
          }}
        >
          Login
        </Link>
      ) : (
        <div
          className="profile-section"
          onClick={handleProfileClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", cursor: "pointer" }}
        >

          <img
            src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
            alt="User"
            className="navbar-profile-small"
            onError={(e) => {
              e.currentTarget.src =
                "https://cdn-icons-png.flaticon.com/512/847/847969.png";
            }}
          />

          <span className="navbar-username-below">{displayName}</span>

          {showLogout && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                right: 0,
                background: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                padding: "4px",
                minWidth: "80px",
                zIndex: 1000,
              }}
            >
              <button
  onClick={(e) => {
    e.stopPropagation();
    handleLogout();
  }}
  style={{
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    background: "transparent",
    color: "#111827",   // ✅ FIX: text visible
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
>
  Logout
</button>

            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
