import React, { useEffect, useRef, useState } from "react";
import {
  updateProfile,
  uploadProfilePhoto,
  completeProfile,
} from "../../services/userProfileApi";
import "./AdditionalDetailsModal.css";
 
const isValidName = (name) => {
  return /^[A-Za-z]+$/.test(name.trim());
};
 
 
export default function AdditionalDetailsModal({
  open,
  onClose,
  currentUser,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
 
  const objectUrlRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ ADD THIS
 
  /* 🔑 USER-SPECIFIC KEYS */
  const userKey = currentUser?.id || currentUser?.email;
  const profileCompletedKey = userKey ? `profileCompleted_${userKey}` : null;
  const profileModalShownKey = userKey ? `profileModalShown_${userKey}` : null;
 
  /* 🚫 AUTO-CLOSE IF ALREADY HANDLED */
  useEffect(() => {
    if (
      open &&
      (localStorage.getItem(profileCompletedKey) === "true" ||
        localStorage.getItem(profileModalShownKey) === "true")
    ) {
      onClose?.();
    }
  }, [open, profileCompletedKey, profileModalShownKey, onClose]);
 
  /* 🔄 RESET FORM ON OPEN */
  useEffect(() => {
    if (!open) return;
 
    setError("");
    setFirstName("");
    setLastName("");
    setBio("");
    setProfilePicFile(null);
    setPreview(null);
  }, [open]);
 
  /* 🧹 CLEANUP IMAGE URL */
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);
 
  if (!open) return null;
 
  /* 👉 CLICK AVATAR TO OPEN FILE PICKER */
  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };
 
  /* 🖼 IMAGE HANDLER */
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    if (file.size > 2 * 1024 * 1024) {
      setError("Image too large (max 2MB)");
      return;
    }
 
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
 
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
 
    setProfilePicFile(file);
    setPreview(url);
  };
 
  /* ⏭ SKIP */
  const handleSkip = () => {
    if (profileModalShownKey) {
      localStorage.setItem(profileModalShownKey, "true");
    }
    window.dispatchEvent(new Event("profileUpdated"));
    onClose?.();
  };
 
  /* ✅ SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }
 
    setSaving(true);
 
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: currentUser.email,
        bio: bio.trim(),
      });
 
      if (profilePicFile) {
        await uploadProfilePhoto(profilePicFile);
      }
 
      await completeProfile();
 
      if (profileCompletedKey) {
        localStorage.setItem(profileCompletedKey, "true");
      }
      if (profileModalShownKey) {
        localStorage.setItem(profileModalShownKey, "true");
      }
 
      window.dispatchEvent(new Event("profileUpdated"));
      onClose?.();
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
 
  return (
    <div className="adm-backdrop">
      <div className="adm-modal">
        <h2>Complete your profile</h2>
 
        <form onSubmit={handleSubmit}>
          {/* AVATAR */}
          {/* AVATAR */}
          <div className="adm-avatar" onClick={triggerFilePicker}>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="adm-avatar-placeholder">
                <span className="adm-avatar-plus">+</span>
                <span className="adm-avatar-label">Add photo</span>
              </div>
            )}
 
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />
          </div>
 
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            maxLength={35}
            onChange={(e) => setFirstName(e.target.value)}
          />
 
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            maxLength={35}
            onChange={(e) => setLastName(e.target.value)}
          />
 
          <input
            type="email"
            value={currentUser?.email || ""}
            readOnly
            className="readonly"
          />
 
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
 
          {error && <div className="adm-error">{error}</div>}
 
          <div className="adm-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
 
            <button
              type="button"
              className="adm-skip"
              onClick={handleSkip}
              disabled={saving}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
 