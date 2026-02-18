import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles.css";
 
function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  // Real-time validation
  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) setError("");
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Invalid email format.");
 
    setLoading(true);
 
    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ Email: email }), // ✅ FIXED
        }
      );
 
      const contentType = response.headers.get("content-type");
 
      // ❌ Backend error (JSON or text)
      if (!response.ok) {
        let message = "Failed to send OTP.";
 
        if (contentType && contentType.includes("application/json")) {
          const errJson = await response.json();
          message = errJson.message || errJson.error || message;
        } else {
          const errText = await response.text();
          message = errText || message;
        }
 
        throw new Error(message);
      }
 
      // ✅ Success
      if (contentType && contentType.includes("application/json")) {
        await response.json(); // optional
      }
 
      navigate("/verify-otp", { state: { email } });
 
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="reset-password-page">
      <div className="reset-password-panel">
        <div
          className="reset-back-arrow"
          onClick={() => navigate(-1)}
        >
          ← Back
        </div>
 
        <h2 className="reset-password-title">Forgot Password</h2>
 
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              disabled={loading}
              className={`reset-password-input ${
                error ? "error-border" : ""
              }`}
            />
            {error && (
              <div className="reset-password-error">{error}</div>
            )}
          </div>
 
          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
 
export default ResetPassword;