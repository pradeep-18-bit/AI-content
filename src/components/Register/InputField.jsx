import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputField = ({
  name,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  serverError,
  inputRef,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isEmail = name === "email";

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

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // ✅ BLOCK SPACES FOR PASSWORD
  const handlePasswordChange = (e) => {
    if (e.target.value.includes(" ")) return; // ❌ block spaces
    onChange(e);
  };

  // ✅ CLEAN EMAIL CHANGE HANDLER
  const handleEmailChange = (e) => {
    const email = e.target.value.trim().toLowerCase();
    onChange(e);

    if (serverError) return;

    const domain = email.split("@")[1] || "";
    if (!emailRegex.test(email) || !allowedDomains.includes(domain)) {
      onBlur({ target: { name: "email", value: email } });
    }
  };

  // 🔥 ONLY ONE ERROR MESSAGE
  const finalError = serverError || error;

  return (
    <div
      className="input-group"
      style={{ position: "relative", marginBottom: "20px" }}
    >
      <input
        ref={inputRef}
        name={name}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={
          isPassword
            ? handlePasswordChange
            : isEmail
            ? handleEmailChange
            : onChange
        }
        onBlur={onBlur}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "12px 40px 12px 14px",
          borderRadius: "10px",
          border: finalError ? "2px solid red" : "2px solid #2e397aff",
          fontSize: "16px",
          outline: "none",
          boxSizing: "border-box",
          height: "48px",
        }}
      />

      {isPassword && (
        <span
          onClick={() => setShowPassword((p) => !p)}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "18px",
            color: "#333",
            backgroundColor: "white",
            paddingLeft: "4px",
            zIndex: 2,
          }}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      )}

      {finalError && (
        <div
          style={{
            position: "absolute",
            bottom: "-18px",
            left: 0,
            color: "red",
            fontSize: "12px",
          }}
        >
          {finalError}
        </div>
      )}
    </div>
  );
};

export default InputField;
