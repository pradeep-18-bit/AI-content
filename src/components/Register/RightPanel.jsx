import React from "react";
import InputField from "./InputField";

const RightPanel = ({
  form,
  errors,
  serverErrors,
  handleChange,
  handleBlur,
  handleSubmit,
  nameRef,
  loading,
  successMessage,
  passwordStrength, // ✅ added
}) => {
  const inputs = [
    { name: "name", type: "text", placeholder: "Name", ref: nameRef },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "confirmPassword", type: "password", placeholder: "Confirm Password" },
  ];

  const getStrengthColor = () => {
    if (passwordStrength === "Strong") return "green";
    if (passwordStrength === "Medium") return "orange";
    return "red";
  };

  return (
    <div className="right-panel">
      <h2 className="loginTitle">Sign-Up</h2>

      <form onSubmit={handleSubmit} className="form">
        {inputs.map(({ name, type, placeholder, ref }) => (
          <div key={name}>
            <InputField
              name={name}
              type={type}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[name]}
              serverError={serverErrors?.[name]}
              inputRef={ref}
            />

            {/* ✅ Password Strength below Password field */}
            {name === "password" && form.password && (
              <p
                style={{
                  marginTop: "6px",
                  marginBottom: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: getStrengthColor(),
                }}
              >
                Password Strength: {passwordStrength}
              </p>
            )}
          </div>
        ))}

        <button type="submit" className="signInButton" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {successMessage && (
          <p style={{ color: "green", marginTop: "2px", fontSize: "14px" }}>
            {successMessage}
          </p>
        )}
      </form>

      <p className="footerText">
        Already registered?{" "}
        <a href="/login" className="signUpLink">
          Sign-In here
        </a>
      </p>
    </div>
  );
};

export default RightPanel;