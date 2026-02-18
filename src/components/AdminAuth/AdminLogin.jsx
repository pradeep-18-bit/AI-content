import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // redirect if already admin
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      }
    } catch {}
  }, [navigate]);

  // ---------- VALIDATION (same as your LoginForm) ----------
  const validate = (field, value) => {
    let msg = "";

    if (field === "email") {
      if (!value.trim()) msg = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        msg = "Enter a valid email.";
    }

    if (field === "password") {
      if (!value.trim()) {
        msg = "Password is required.";
      } else if (value.length < 8) {
        msg = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(value)) {
        msg = "Password must contain at least 1 uppercase letter.";
      } else if (!/[0-9]/.test(value)) {
        msg = "Password must contain at least 1 digit.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        msg = "Password must contain at least 1 special character.";
      }
    }

    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // block space for password
    if (name === "password" && value.includes(" ")) return;

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setErrors((p) => ({
      ...p,
      [name]: validate(name, value),
    }));
  };

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((v) => v !== "")) return;

    setLoading(true);
    setLoginError("");

    try {
      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.token) {
        setLoginError(data.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      const decoded = decodeToken(data.token);

      const role =
        decoded?.role ||
        decoded?.Role ||
        decoded?.roles ||
        decoded?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      if (!role || role.toLowerCase() !== "admin") {
        setLoginError("You are not authorized as admin.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: decoded?.email || form.email,
          role: "admin",
        })
      );

      navigate("/admin", { replace: true });
    } catch (err) {
      setLoginError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="admin-bg">
      <div className="admin-glass-card">
        <h2 className="admin-title">Admin Access</h2>
        <p className="admin-subtitle">
          Secure sign in for administrators
        </p>

        {loginError && <div className="admin-error">{loginError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* EMAIL */}
          <div className="admin-field">
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`admin-input ${
                errors.email ? "error-border" : ""
              }`}
              disabled={loading}
            />
            {errors.email && (
              <div className="admin-field-error">{errors.email}</div>
            )}
          </div>

          {/* PASSWORD (eye inside field) */}
          <div className="admin-field">
            <div className="admin-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`admin-input admin-password-input ${
                  errors.password ? "error-border" : ""
                }`}
                disabled={loading}
              />

              <span
                className="admin-eye-inside"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {errors.password && (
              <div className="admin-field-error">
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="admin-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
