import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import "../styles.css";
 
function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
 
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
 
  // ✅ Password Strength + Suggestions
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordSuggestion, setPasswordSuggestion] = useState("");
 
  const navigate = useNavigate();
  const nameRef = useRef(null);
 
  useEffect(() => {
    nameRef.current?.focus();
  }, []);
 
  // ✅ ALLOWED EMAIL DOMAINS
  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "yahoo.in",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "proton.me",
    "protonmail.com",
  ];
 
  // ✅ REGEX
  const nameRegex = /^[A-Za-z ]+$/; // letters + spaces
  const emailRegex = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,16}$/;
 
  // ✅ Password Strength Checker
  const getPasswordStrength = (password) => {
    if (!password) return "";
 
    let score = 0;
 
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
 
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9\s]/.test(password)) score++;
    if (!/\s/.test(password)) score++;
 
    if (score <= 3) return "Weak";
    if (score <= 5) return "Medium";
    return "Strong";
  };
 
  // ✅ Password Suggestions
  const getPasswordSuggestion = (password) => {
    if (!password) return "";
 
    const tips = [];
 
    if (password.length < 8) tips.push("Use at least 8 characters");
    if (!/[A-Z]/.test(password)) tips.push("Add 1 uppercase letter (A-Z)");
    if (!/\d/.test(password)) tips.push("Add 1 number (0-9)");
    if (!/[^A-Za-z0-9\s]/.test(password)) tips.push("Add 1 symbol (!@#$)");
    if (/\s/.test(password)) tips.push("Remove spaces");
 
    return tips.join(", ");
  };
 
  // ✅ VALIDATION
  const validateField = (field, value) => {
    if (field === "name") {
      if (!value.trim()) return "Name is required.";
 
      // ✅ count ONLY letters (ignore spaces)
      const letterCount = value.replace(/[^A-Za-z]/g, "").length;
      if (letterCount > 254) return "Name cannot exceed 254 letters.";
 
 
      if (!nameRegex.test(value))
        return "Name must contain only letters and spaces.";
    }
 
    if (field === "email") {
      if (!value.trim()) return "Email is required.";
      if (value.length > 254) return "Email cannot exceed 254 characters.";
      if (!emailRegex.test(value)) return "Enter a valid email address.";
 
      const domain = value.split("@")[1];
      if (!allowedDomains.includes(domain))
        return "Please use a valid email provider.";
    }
 
    if (field === "password") {
      if (!value.trim()) return "Password is required.";
      if (value.includes(" ")) return "Spaces are not allowed.";
      if (!passwordRegex.test(value))
        return "8–16 chars, 1 capital, 1 number & 1 symbol required.";
    }
 
    if (field === "confirmPassword") {
      if (!value.trim()) return "Confirm password is required.";
      if (value !== form.password) return "Passwords do not match.";
    }
 
    return "";
  };
 
  // ✅ CHANGE HANDLER
  const handleChange = (e) => {
    const { name, value } = e.target;
 
    // ⛔ Password: no spaces
    if (name === "password" && value.includes(" ")) return;
 
    setForm((prev) => ({ ...prev, [name]: value }));
 
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
 
    setServerErrors((prev) => ({ ...prev, [name]: "" }));
 
    // ✅ Update Password Strength + Suggestions Live
    if (name === "password") {
      const strength = getPasswordStrength(value);
      setPasswordStrength(strength);
 
      if (strength === "Strong") {
        setPasswordSuggestion("Great! Your password looks strong 💪");
      } else {
        setPasswordSuggestion(getPasswordSuggestion(value));
      }
    }
 
    // ✅ If password changes, revalidate confirmPassword instantly
    if (name === "password" && form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", form.confirmPassword),
      }));
    }
  };
 
  // ✅ BLUR HANDLER
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };
 
  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      newErrors[key] = validateField(key, form[key]);
    });
 
    setErrors(newErrors);
    setServerErrors({});
 
    if (Object.values(newErrors).some(Boolean)) return;
 
    setLoading(true);
 
    try {
      const res = await fetch(
        "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email,
            password: form.password,
          }),
        }
      );
 
      if (!res.ok) {
        if (res.status === 400 || res.status === 409) {
          setServerErrors({ email: "Email already registered." });
          return;
        }
        throw new Error("Registration failed");
      }
 
      setSuccessMessage("Registration successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="register-page">
      <div className="register-container">
        <LeftPanel />
        <RightPanel
          form={form}
          errors={errors}
          serverErrors={serverErrors}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handleSubmit={handleSubmit}
          nameRef={nameRef}
          loading={loading}
          successMessage={successMessage}
          passwordStrength={passwordStrength}
          passwordSuggestion={passwordSuggestion}
        />
      </div>
    </div>
  );
}
 
export default Register;