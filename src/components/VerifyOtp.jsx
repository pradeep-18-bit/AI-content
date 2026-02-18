import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
 
function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
 
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
 
  // ✅ password strength
  const [strength, setStrength] = useState("");
 
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
 
  useEffect(() => {
    if (!email) navigate("/reset-password");
  }, [email, navigate]);
 
  // ✅ simple strength checker
  const checkStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
 
    if (!value) return "";
    if (score <= 2) return "Weak";
    if (score === 3 || score === 4) return "Medium";
    return "Strong";
  };
 
  const handlePasswordChange = (e) => {
    if (e.target.value.includes(" ")) return;
    const val = e.target.value;
    setPassword(val);
    setStrength(checkStrength(val)); // ✅
  };
 
  const handleConfirmChange = (e) => {
    if (e.target.value.includes(" ")) return;
    setConfirm(e.target.value);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
 
    if (!otp.trim()) return setError("OTP is required.");
    if (!password.trim()) return setError("Password is required.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
 
    // ✅ block weak password
    if (strength === "Weak")
      return setError("Password is too weak.");
 
    if (password !== confirm)
      return setError("Passwords do not match.");
 
    setLoading(true);
 
    try {
      const response = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp,
            newPassword: password,
          }),
        }
      );
 
      const data = await response.json();
 
      if (!response.ok) {
        if (data.message?.toLowerCase().includes("same as old")) {
          throw new Error("Old password cannot be reused.");
        }
        throw new Error(data.message || "Failed to reset password.");
      }
 
      setSuccess("Password reset successful! Redirecting...");
      setOtp("");
      setPassword("");
      setConfirm("");
      setStrength(""); // ✅
 
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="verify-otp-page">
      <div className="verify-otp-panel">
        <div className="verify-back-arrow" onClick={() => navigate(-1)}>
          ← Back
        </div>
 
        <h2 className="verify-otp-title">Verify OTP & Set New Password</h2>
 
        <form onSubmit={handleSubmit} className="verify-otp-form">
 
          <div className="verify-otp-input-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              className={`verify-otp-input ${error ? "error" : ""}`}
            />
          </div>
 
          {/* PASSWORD */}
          <div
            className="verify-otp-input-group"
            style={{ position: "relative", marginBottom: "8px" }}
          >
            <input
              type={showPass ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              className={`verify-otp-input ${error ? "error" : ""}`}
              style={{ paddingRight: "40px" }}
            />
 
            <span
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
                background: "#fff",
                paddingLeft: "4px",
                zIndex: 3,
              }}
            >
              {showPass ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
 
          {/* ✅ strength text */}
          {strength && (
            <div
              style={{
                fontSize: "12px",
                marginBottom: "14px",
                color:
                  strength === "Strong"
                    ? "green"
                    : strength === "Medium"
                    ? "orange"
                    : "red",
              }}
            >
              Password strength : {strength}
            </div>
          )}
 
          {/* CONFIRM */}
          <div
            className="verify-otp-input-group"
            style={{ position: "relative", marginBottom: "22px" }}
          >
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={handleConfirmChange}
              disabled={loading}
              className={`verify-otp-input ${error ? "error" : ""}`}
              style={{ paddingRight: "40px" }}
            />
 
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
                background: "#fff",
                paddingLeft: "4px",
                zIndex: 3,
              }}
            >
              {showConfirm ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
 
          {error && <div className="verify-otp-error">{error}</div>}
          {success && <div className="verify-otp-success">{success}</div>}
 
          <button
            type="submit"
            className="verify-otp-button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
 
export default VerifyOtp;
 