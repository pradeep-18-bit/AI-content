import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const navigate = useNavigate(); // ✅ already correct

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rememberMeData"));
    if (saved) {
      setForm(saved);
      setRememberMe(true);
    }
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validate = (field, value) => {
    if (field === "email") {
      if (!value) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Enter a valid email.";
    }

    if (field === "password") {
      if (!value) return "Password is required.";
      if (value.length < 8) return "Minimum 8 characters required.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password" && value.includes(" ")) return;

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e) => {
    setErrors((p) => ({
      ...p,
      [e.target.name]: validate(e.target.name, e.target.value),
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };

    setErrors(validationErrors);
    if (Object.values(validationErrors).some(Boolean)) return;

    setLoading(true);
    setLoginError("");

    try {
      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Invalid credentials");
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

      // ✅ SAVE USER
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: form.email,
          role: "user", // default user
        })
      );

      // ✅ REMEMBER ME
      rememberMe
        ? localStorage.setItem("rememberMeData", JSON.stringify(form))
        : localStorage.removeItem("rememberMeData");

      // ✅ REDIRECT TO USER DASHBOARD  ⭐⭐ FIX
      navigate("/dashboard", { replace: true });

    } catch {
      setLoginError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-panel">
      <h2 className="login-title">Sign In</h2>
      <p className="login-subtitle">Welcome back! Please sign in.</p>

      <form className="login-form" onSubmit={handleSubmit}>
        {/* EMAIL */}
        <div className="input-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input ${errors.email ? "error-border" : ""}`}
            disabled={loading}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        {/* PASSWORD */}
        <div className="input-group" style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`input ${errors.password ? "error-border" : ""}`}
            disabled={loading}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        {loginError && <div className="login-error">{loginError}</div>}

        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />{" "}
            Remember me
          </label>
          <span
            onClick={() => navigate("/reset-password")}
            style={{
              fontWeight: "700",        // ✅ bold
              cursor: "pointer",        // ✅ hand cursor
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Forgot password?
          </span>

        </div>

        <button className="sign-in-button" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div
          className="signup"
          style={{ textAlign: "center", marginTop: "12px", fontSize: "16px" }}
        >
          Don’t have an account?{" "}
          <span
            style={{ color: "#6b46ff", cursor: "pointer", fontWeight: "700" }}
            onClick={() => !loading && navigate("/register")}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Sign up
          </span>
        </div>

      </form>
    </div>
  );
}
