import React from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css"; // ✅ Import global styles

const Api = () => {
  return (
    <SettingsLayout>
      <h3 className="settings-title">API Configuration</h3>
      <p className="settings-description">
        Manage your API keys and integration settings
      </p>

      {/* API Key */}
      <div className="settings-input-group">
        <label className="settings-label">API Key</label>
        <div className="settings-flex-row">
          <input
            type="text"
            value="sk-proj-1234567890abcdef..."
            readOnly
            className="settings-input"
          />
          <button className="settings-btn-secondary">Copy</button>
          <button className="settings-btn-secondary">Regenerate</button>
        </div>
        <p className="settings-helper-text">
          Keep your API key secure and don’t share it publicly
        </p>
      </div>

      {/* Rate Limit */}
      <div className="settings-input-group">
        <label className="settings-label">Rate Limit</label>
        <select className="settings-select">
          <option>1,000 requests/hour</option>
          <option>5,000 requests/hour</option>
          <option>10,000 requests/hour</option>
        </select>
      </div>

      <button className="settings-btn-green">Save API Settings</button>
    </SettingsLayout>
  );
};

export default Api;
