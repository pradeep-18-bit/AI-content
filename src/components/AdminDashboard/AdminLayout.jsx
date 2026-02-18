import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Analytics", path: "/admin/analytics", icon: "📈" },
    { name: "Content Generator", path: "/admin/content-generator", icon: "🧠" },
    { name: "Content History", path: "/admin/content-history", icon: "📝" },
    { name: "Users Data", path: "/admin/users", icon: "👥" },
    { name: "History", path: "/admin/history", icon: "📜" },
    { name: "Profile", path: "/admin/profile", icon: "👤" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, "", "/admin/login");
    window.location.reload();
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
     <aside className="admin-sidebar">
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <div>
      <h2 className="admin-sidebar-title">Admin Menu</h2>

      <ul className="admin-menu">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`admin-menu-item ${
              location.pathname === item.path ? "active-admin-link" : ""
            }`}
          >
            <Link to={item.path}>
              <span className="admin-icon">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* ✅ logout pushed to bottom without breaking layout */}
    <button
      onClick={handleLogout}
      style={{
        marginTop: "auto",
        marginLeft: "12px",
        marginRight: "12px",
        marginBottom: "16px",
        padding: "10px 12px",
        border: "none",
        borderRadius: "8px",
        background: "#ff4d4f",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      🚪 Logout
    </button>
  </div>
</aside>


      {/* Main Area */}
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-header-buttons"></div>
        </header>

        {/* Child Routes */}
        <main className="admin-content">
          <Outlet context={{ refreshKey }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
