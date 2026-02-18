// src/components/ProfileWithAPI.jsx
import React, { useEffect, useRef, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";
 
const API = {
  getProfile: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile",
  updateProfile: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile",
  uploadPhoto: "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/upload-photo",
  uploadPhotoFallbacks: [
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/profile/photo",
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/User/photo",
  ],
};
 
const LOCAL_KEY = "userProfileData";
 
export default function ProfileWithAPI() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    avatarUrl: null,
  });
 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
 
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);
  const fileInputRef = useRef(null);
 
  const API_ORIGIN = new URL(API.uploadPhoto).origin;
  const [fieldErrors, setFieldErrors] = useState({});
 
 
  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt");
 
  /* ---------------- URL NORMALIZER ---------------- */
  function normalizeAvatarUrl(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str) return null;
    if (str.startsWith("http")) return str;
    if (str.startsWith("/")) return API_ORIGIN + str;
    return API_ORIGIN + "/" + str;
  }
 
  /* ---------------- FETCH IMAGE AS BLOB (ADDED) ---------------- */
  async function fetchAvatarAsBlob(url) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });
 
      if (!res.ok) throw new Error("Image fetch failed");
 
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Avatar blob fetch failed:", url);
      return null;
    }
  }
 
  /* ---------------- IMAGE CONVERSION ---------------- */
  async function convertImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
 
      reader.onload = (e) => (img.src = e.target.result);
 
      img.onload = () => {
        const MAX = 512;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
 
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
 
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
 
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject();
            resolve(
              new File([blob], "avatar.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          0.8
        );
      };
 
      img.onerror = reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
 
  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    fetchProfile();
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (profile.avatarUrl?.startsWith("blob:"))
        URL.revokeObjectURL(profile.avatarUrl);
    };
    // eslint-disable-next-line
  }, []);
 
  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch(API.getProfile, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "ngrok-skip-browser-warning": "69420",
        },
      });
 
      const data = await res.json();
      console.log("PROFILE API RESPONSE:", data);
 
      let avatarBlob = null;
      if (data.avatarUrl) {
        const normalized = normalizeAvatarUrl(data.avatarUrl);
        avatarBlob = await fetchAvatarAsBlob(normalized);
      }
 
      const parsed = {
        firstName:
          data.firstName ||
          data.FirstName ||
          data.first_name ||
          "",
 
        lastName:
          data.lastName ||
          data.LastName ||
          data.secondName ||
          data.last_name ||
          "",
        email: data.email || "",
        bio: data.bio || "",
        avatarUrl: avatarBlob,
      };
 
      setProfile(parsed);
      // 🔁 Keep currentUser in sync on initial load
      const existingUser =
        JSON.parse(localStorage.getItem("currentUser")) || {};
 
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...existingUser,
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email,
        })
      );
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }
 
  /* ---------------- PHOTO UPLOAD ---------------- */
  async function handlePhotoSelect(e) {
    let file = e.target.files[0];
    if (!file) return;
 
    try {
      file = await convertImage(file);
    } catch {
      setError("Image conversion failed");
      return;
    }
 
    const tempUrl = URL.createObjectURL(file);
    previewUrlRef.current = tempUrl;
    setPreviewUrl(tempUrl);
 
    const form = new FormData();
    form.append("File", file);
 
    for (const url of [API.uploadPhoto, ...API.uploadPhotoFallbacks]) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "ngrok-skip-browser-warning": "69420",
          },
          body: form,
        });
 
        if (!res.ok) continue;
 
        setPreviewUrl(null);
        setSuccessMsg("Photo uploaded successfully");
 
        // 🔥 Reload profile to fetch blob image again
        fetchProfile();
        window.dispatchEvent(new Event("profileUpdated"));
        return;
      } catch { }
    }
 
    setError("Photo upload failed");
  }
 
  /* ---------------- SAVE PROFILE ---------------- */
  async function handleSave(e) {
  e.preventDefault();
 
  const errors = {};
  if (!profile.firstName.trim()) errors.firstName = "First name is required";
  if (!profile.lastName.trim()) errors.lastName = "Last name is required";
 
  if (Object.keys(errors).length) {
    setFieldErrors(errors);
    return;
  }
 
  setFieldErrors({});
  setSaving(true);
  setError(null);
 
  try {
    const res = await fetch(API.updateProfile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(profile),
    });
 
    if (!res.ok) throw new Error("Save failed");
 
    const existingUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};
 
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...existingUser,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      })
    );
 
    window.dispatchEvent(new Event("profileUpdated"));
    setSuccessMsg("Profile saved successfully");
  } catch {
    setError("Save failed");
  } finally {
    setSaving(false);
  }
}
 
  function getInitials() {
    return `${profile.firstName?.[0] || "J"}${profile.lastName?.[0] || "D"}`;
  }
 
  const displayedAvatar = previewUrl || profile.avatarUrl;
 
  /* ---------------- UI ---------------- */
  return (
    <SettingsLayout>
      <div className="profile_container">
        <h3 className="profile_heading">Profile Information</h3>
        <p className="profile_subheading">
          Update your personal information and profile details
        </p>
 
        <div className="profile_avatar_section">
          {displayedAvatar ? (
            <img
              src={displayedAvatar}
              alt="avatar"
              className="profile_avatar_img"
              onError={() => console.warn("Avatar failed to render")}
            />
          ) : (
            <div className="profile_avatar">{getInitials()}</div>
          )}
 
          <div className="profile_avatar_actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoSelect}
            />
            <button
              type="button"
              className="profile_blue_button"
              onClick={() => fileInputRef.current.click()}
              disabled={saving}
            >
              Change Photo
            </button>
            <p className="profile_avatar_note">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>
 
        <form onSubmit={handleSave}>
          <div className="profile_form_group">
  <label className="profile_label">First Name *</label>
  <input
  className="profile_input"
  value={profile.firstName}
  maxLength={35}
  onChange={(e) =>
    setProfile({
      ...profile,
      firstName: e.target.value.replace(/[^a-zA-Z\s]/g, "")
    })
  }
/>
  {fieldErrors.firstName && (
    <span className="profile_error">{fieldErrors.firstName}</span>
  )}
</div>
 
<div className="profile_form_group">
  <label className="profile_label">Last Name *</label>
  <input
  className="profile_input"
  value={profile.lastName}
  maxLength={35}
  onChange={(e) =>
    setProfile({
      ...profile,
      lastName: e.target.value.replace(/[^a-zA-Z\s]/g, "")
    })
  }
/>
  {fieldErrors.lastName && (
    <span className="profile_error">{fieldErrors.lastName}</span>
  )}
</div>
 
          <div className="profile_form_group">
            <label className="profile_label">Email</label>
            <input className="profile_input" value={profile.email} readOnly />
          </div>
 
          <div className="profile_form_group">
            <label className="profile_label">Bio</label>
            <textarea
              className="profile_textarea"
              value={profile.bio}
              onChange={(e) =>
                setProfile({ ...profile, bio: e.target.value })
              }
            />
          </div>
 
          {error && <div style={{ color: "#b00020" }}>{error}</div>}
          {successMsg && <div style={{ color: "#006400" }}>{successMsg}</div>}
 
          <button
            type="submit"
            className="profile_green_button"
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
}