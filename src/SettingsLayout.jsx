import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./SettingsLayout.css";

const SettingsLayout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { name: "Profile", icon: "👤", link: "/settings/profile" },
    { name: "Preferences", icon: "⚙️", link: "/settings/preferences" },
    { name: "Notifications", icon: "🔔", link: "/settings/notifications" },
    { name: "Security", icon: "🔒", link: "/settings/security" },
    { name: "Billing", icon: "💳", link: "/settings/billing" },
    { name: "API", icon: "🌐", link: "/settings/api" },
  ];

  return (
    <div className="settings-header-container">
    <div className="settings-layout">
      <div className="settings-container">
        <h2 className="settings-header">Settings</h2>
        <p className="settings-subtext">
          Manage your account preferences and content generation settings
        </p>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.link}
              className={`settings-tab ${
                path === tab.link ? "active" : ""
              }`}
            >
              {tab.icon} {tab.name}
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">{children}</div>
      </div>
    </div>
    </div>
  );
};

export default SettingsLayout;
