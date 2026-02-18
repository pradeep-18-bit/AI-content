import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
 
const API_BASE =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
const PROFILE_API = `${API_BASE}/profile`;
 
function AdminProfile() {
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "admin",
    createdAt: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
 
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
 
  // GET /api/Admin/profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
 
        const res = await fetch(PROFILE_API, { headers });
        const text = await res.text();
        console.log("Admin profile raw:", text);
 
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Profile API did not return valid JSON.");
        }
 
        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}`);
        }
 
        const name =
          data.fullName ||
          data.FullName ||
          data.name ||
          data.Name ||
          "";
 
        const email =
          data.email ||
          data.Email ||
          "";
        const role = data.role || "admin";
        const createdAt =
          data.createdAt || data.createdOn || data.joinedOn || new Date();
 
        const profile = { name, email, role, createdAt };
        setAdmin(profile);
        setUpdatedName(name || "");
      } catch (err) {
        console.error("Profile GET error:", err);
 
        // fallback: try currentUser from localStorage
        const stored = localStorage.getItem("currentUser");
        if (stored) {
          try {
            const p = JSON.parse(stored);
            const profile = {
              name: p.fullName || p.name,
              email: p.email,
              role: p.role || "admin",
              createdAt: p.createdAt || new Date().toISOString(),
            };
            setAdmin(profile);
            setUpdatedName(profile.name || "");
          } catch (e) {
            console.error("Failed to parse currentUser from localStorage:", e);
          }
        }
 
        setMessage(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
 
    fetchProfile();
  }, [token]);
 
  const handleEditToggle = () => setEditMode(!editMode);
 
  // UPDATE /api/Admin/profile
  const handleSave = async () => {
    try {
      const body = {
        name: updatedName,
        fullName: updatedName,
      };
 
      const res = await fetch(PROFILE_API, {
        method: "PUT", // change to "POST" if your API expects POST
        headers,
        body: JSON.stringify(body),
      });
 
      const text = await res.text();
      console.log("Admin profile update raw:", text);
 
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // if backend returns no body / plain text, ignore
        data = {};
      }
 
      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}`);
      }
 
      const updatedAdmin = { ...admin, name: updatedName };
      setAdmin(updatedAdmin);
      setEditMode(false);
      setMessage("Profile updated successfully!");
 
      // persist to localStorage (optional)
      const currentUser = {
        ...updatedAdmin,
        fullName: updatedName,
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } catch (err) {
      console.error("Profile UPDATE error:", err);
      setMessage(err.message || "Failed to update profile.");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };
 
  if (loading) {
    return (
      <div className="adminProfileContainer">
        <h2 className="adminProfileTitle">Admin Profile</h2>
        <p>Loading profile...</p>
      </div>
    );
  }
 
  return (
    <div className="adminProfileContainer">
      <h2 className="adminProfileTitle">Admin Profile</h2>
      {message && <p className="adminProfileMessage">{message}</p>}
 
      <div className="adminProfileField">
        <label>Name:</label>
        {editMode ? (
          <input
            type="text"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            className="adminProfileInput"
          />
        ) : (
          <span>{admin.name}</span>
        )}
      </div>
 
      <div className="adminProfileField">
        <label>Email:</label>
        <span>{admin.email}</span>
      </div>
 
      <div className="adminProfileField">
        <label>Role:</label>
        <span>{admin.role}</span>
      </div>
 
 
 
      <div className="adminProfileButtons">
        {editMode ? (
          <>
            <button className="adminProfileSaveBtn" onClick={handleSave}>
              Save
            </button>
            <button
              className="adminProfileCancelBtn"
              onClick={handleEditToggle}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="adminProfileEditBtn"
            onClick={handleEditToggle}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
 
export default AdminProfile;