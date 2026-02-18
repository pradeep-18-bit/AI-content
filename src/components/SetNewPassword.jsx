import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles.css";

function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightEmpty, setHighlightEmpty] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Redirect to reset-password if email missing
  useEffect(() => {
    if (!email) {
      navigate("/reset-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setHighlightEmpty({});

    const newErrors = {};
    const newHighlight = {};

    if (!password) {
      newErrors.password = "Password is required.";
      newHighlight.password = true;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirm) {
      newErrors.confirm = "Confirm password is required.";
      newHighlight.confirm = true;
    } else if (password && confirm !== password) {
      newErrors.confirm = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setHighlightEmpty(newHighlight);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            newPassword: password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      const data = await response.json();
      console.log("✅ Password reset success:", data);

      setSuccess("✅ Password reset successful! Redirecting to login...");
      setPassword("");
      setConfirm("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ Password reset error:", error);
      setErrors({ general: error.message || "Failed to reset password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-new-password-page">
      <div className="set-new-password-panel">
        <h2 className="set-new-password-title">Set New Password</h2>

        <form onSubmit={handleSubmit} className="set-new-password-form">
          <div className="set-new-password-input-group">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`set-new-password-input ${
                highlightEmpty.password ? "highlight" : ""
              } ${errors.password && !highlightEmpty.password ? "error" : ""}`}
            />
            {errors.password && (
              <div className="set-new-password-error">{errors.password}</div>
            )}
          </div>

          <div className="set-new-password-input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              className={`set-new-password-input ${
                highlightEmpty.confirm ? "highlight" : ""
              } ${errors.confirm && !highlightEmpty.confirm ? "error" : ""}`}
            />
            {errors.confirm && (
              <div className="set-new-password-error">{errors.confirm}</div>
            )}
          </div>

          {errors.general && (
            <div className="set-new-password-error">{errors.general}</div>
          )}
          {success && <div className="set-new-password-success">{success}</div>}

          <button
            type="submit"
            className="set-new-password-button"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetNewPassword;
