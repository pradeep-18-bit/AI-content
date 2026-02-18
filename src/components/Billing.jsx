import React from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css"; // ✅ Import global styles

const Billing = () => {
  return (
    <SettingsLayout>
      <h3 className="settings-title">Billing Information</h3>
      <p className="settings-description">
        Manage your subscription and billing details
      </p>

      {/* Current Plan Box */}
      <div className="settings-card">
        <div>
          <h4>Current Plan</h4>
          <p>$29/month • Renews on March 15, 2024</p>
          <small>
            ✓ Unlimited content generation • ✓ Premium templates • ✓ API access
          </small>
        </div>

        <span className="settings-plan-badge">Pro Plan</span>
      </div>

      {/* Action Buttons */}
      <div className="settings-btn-group">
        <button className="settings-btn-secondary">Change Plan</button>
        <button className="settings-btn-secondary">View Usage</button>
        <button className="settings-btn-secondary">Download Invoice</button>
      </div>
    </SettingsLayout>
  );
};

export default Billing;
