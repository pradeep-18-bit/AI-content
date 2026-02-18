const API_BASE = "https://duncan-exclamatory-synaptically.ngrok-free.dev";
 
/* -------------------------------
   COMMON HEADERS
-------------------------------- */
const NGROK_HEADER = {
  "ngrok-skip-browser-warning": "69420",
};
 
function getAuthHeader() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("authToken");
 
  return token ? { Authorization: `Bearer ${token}` } : {};
}
 
/* -------------------------------
   SAFE JSON PARSER
-------------------------------- */
async function parseJsonSafe(res) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(text || "Server error");
  }
  return res.json();
}
 
/* =========================================================
   1️⃣ GET PROFILE STATUS
========================================================= */
export async function profileStatus() {
  const res = await fetch(`${API_BASE}/api/User/profile-status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
  });
 
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Profile status failed");
  }
 
  return parseJsonSafe(res);
}
 
/* =========================================================
   2️⃣ GET FULL USER PROFILE
========================================================= */
export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/api/User/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
  });
 
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Get profile failed");
  }
 
  return parseJsonSafe(res);
}
 
/* =========================================================
   3️⃣ UPDATE PROFILE (TEXT ONLY)
========================================================= */
export async function updateProfile(payload = {}) {
  const res = await fetch(`${API_BASE}/api/User/profile`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      FirstName: payload.firstName ?? "",
      LastName: payload.lastName ?? "",
      Email: payload.email ?? "",
      Bio: payload.bio ?? "",
    }),
  });
 
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Profile update failed");
  }
 
  return parseJsonSafe(res);
}
 
/* =========================================================
   4️⃣ MARK PROFILE AS COMPLETED ✅ FIXED
========================================================= */
export async function completeProfile() {
  // 🔥 FIX: backend does NOT have /complete-profile
  // Completing profile = updating profile
  const res = await fetch(`${API_BASE}/api/User/profile`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...NGROK_HEADER,
      ...getAuthHeader(),
    },
    body: JSON.stringify({}), // backend marks completion internally
  });
 
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Complete profile failed");
  }
 
  return parseJsonSafe(res);
}
 
/* =========================================================
   5️⃣ UPLOAD PROFILE PHOTO
========================================================= */
export async function uploadProfilePhoto(file) {
  if (!file) throw new Error("No file provided");
 
  const formData = new FormData();
 
  // ✅ BACKEND EXPECTS THIS EXACT KEY + filename
  formData.append("File", file, file.name);
 
  const res = await fetch(`${API_BASE}/api/User/upload-photo`, {
    method: "POST",
    headers: {
      ...NGROK_HEADER,
      ...getAuthHeader(),
      // ❌ DO NOT set Content-Type
    },
    body: formData,
  });
 
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Photo upload failed");
  }
 
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }
 
  return {};
}
 
 