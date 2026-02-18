import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateForm from "./TemplateForm";
import "../../App.css";

export default function CreateTemplate({ addTemplate }) {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSave = (template) => {
    addTemplate(template);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      navigate("/template-library"); // ✅ correct route
    }, 1000);
  };

  return (
    <div className="create-template-wrapper">
      <div className="create-template-container">
        <div className="create-template-card">
          <h1>Create Template</h1>
          <TemplateForm onSave={handleSave} success={success} />
        </div>
      </div>
    </div>
  );
}
