import React, { useState } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ❌ block space bar handlers
  const handleCurrentChange = (e) => {
    if (e.target.value.includes(" ")) return;
    setCurrentPassword(e.target.value);
  };

  const handleNewChange = (e) => {
    if (e.target.value.includes(" ")) return;
    setNewPassword(e.target.value);
  };

  const handleConfirmChange = (e) => {
    if (e.target.value.includes(" ")) return;
    setConfirmPassword(e.target.value);
  };

  const handleChangePassword = async () => {
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all password fields.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to change password.");
        return;
      }

      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (res.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (!res.ok) {
        setError(data?.message || "Failed to change password.");
      } else {
        setMessage("✅ Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <h3 className="settings-title">Security Settings</h3>
      <p className="settings-description">
        Manage your account security and privacy
      </p>

      {/* Current Password */}
      <div className="settings-input-group" style={{ position: "relative" }}>
        <label className="settings-label">Current Password</label>
        <input
          type={showCurrent ? "text" : "password"}
          className="settings-input"
          value={currentPassword}
          onChange={handleCurrentChange}
        />
        <span onClick={() => setShowCurrent(!showCurrent)} style={eyeStyle}>
          {showCurrent ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>

      {/* New Password */}
      <div className="settings-input-group" style={{ position: "relative" }}>
        <label className="settings-label">New Password</label>
        <input
          type={showNew ? "text" : "password"}
          className="settings-input"
          value={newPassword}
          onChange={handleNewChange}
        />
        <span onClick={() => setShowNew(!showNew)} style={eyeStyle}>
          {showNew ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>

      {/* Confirm Password */}
      <div className="settings-input-group" style={{ position: "relative" }}>
        <label className="settings-label">Confirm New Password</label>
        <input
          type={showConfirm ? "text" : "password"}
          className="settings-input"
          value={confirmPassword}
          onChange={handleConfirmChange}
        />
        <span onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>
          {showConfirm ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <button
        className="settings-button"
        onClick={handleChangePassword}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </SettingsLayout>
  );
};

const eyeStyle = {
  position: "absolute",
  right: "12px",
  top: "75%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  fontSize: "18px",
  color: "#555",
  background: "white",
  paddingLeft: "4px",
};

export default Security;
