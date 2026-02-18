import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminDashboard.css";
 
const API_BASE =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
const ALL_ACTIVITY_API = `${API_BASE}/activity-history`;
const USER_ACTIVITY_API = `${API_BASE}/activity-history`;
 
function AdminUsersData() {
  const { refreshKey } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const [modalData, setModalData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
 
  const token = localStorage.getItem("token");
 
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
 
  const extractItems = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    return firstArray || [];
  };
 
  // --------- LOAD USERS FROM ACTIVITY HISTORY ----------
  useEffect(() => {
    const loadUsersFromHistory = async () => {
      setLoading(true);
      setError("");
 
      try {
        const res = await fetch(`${ALL_ACTIVITY_API}?pageSize=1000`, {
          headers,
        });
 
        const text = await res.text();
        console.log("All activity (for users) raw:", text);
 
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Activity-history API did not return valid JSON.");
        }
 
        if (!res.ok) {
          throw new Error(data.message || `Error ${res.status}`);
        }
 
        const items = extractItems(data);
 
        if (!items.length) {
          throw new Error("No activity found to derive users.");
        }
 
        // Build unique users by userId (or email) and take earliest timestamp as createdAt
        const usersMap = new Map();
 
        items.forEach((item, index) => {
          const email =
            item.Email ?? item.email;
 
          const userId =
            item.UserId ?? item.userId ?? item.userID ?? item.userIDFk;
 
          const key = userId ?? email;
 
          const rawTs =
            item.Timestamp ?? item.timestamp ?? item.date ?? item.createdOn;
 
          const name =
            item.UserName ??
            item.userName ??
            item.name ??
            (email ? email.split("@")[0] : "Unknown");
 
          const tsDate = new Date(rawTs);
          const createdAt = isNaN(tsDate.getTime()) ? new Date() : tsDate;
 
          const existing = usersMap.get(key);
          if (!existing) {
            usersMap.set(key, {
              id: key || index,
              userId,
              name,
              email,
              createdAt,
            });
          } else {
            // keep earliest createdAt
            if (createdAt < existing.createdAt) {
              usersMap.set(key, { ...existing, createdAt });
            }
          }
        });
 
        const usersArray = Array.from(usersMap.values()).sort(
          (a, b) => a.createdAt - b.createdAt
        );
 
        setUsers(usersArray);
      } catch (err) {
        console.error("Users from activity-history error:", err);
        setError(err.message || "Failed to load users.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
 
    loadUsersFromHistory();
  }, [refreshKey]);
 
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStartDate = (e) => setStartDate(e.target.value);
  const handleEndDate = (e) => setEndDate(e.target.value);
  const handleRowClick = (user) => {
    setModalData(user);
  };
 
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = u.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
 
    let dateMatch = true;
    const created = u.createdAt ? new Date(u.createdAt) : null;
 
    if (created && startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateMatch = created >= start;
    }
 
    if (created && endDate && dateMatch) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = created <= end;
    }
 
    return (nameMatch || emailMatch) && dateMatch;
  });
 
  if (loading) {
    return (
      <p className="admin-users__status-text admin-users__status-text--loading">
        Loading users...
      </p>
    );
  }
 
  if (!users.length) {
    return (
      <p className="admin-users__status-text admin-users__status-text--empty">
        No users found.
        {error ? ` (${error})` : ""}
      </p>
    );
  }
 
  return (
    <div className="admin-users__wrapper">
      <h2 className="admin-users__title">All Users</h2>
 
      <div className="admin-users__filters">
        <div className="admin-users__search">
          <span className="admin-users__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
            className="admin-users__search-input"
          />
        </div>
 
        <div className="admin-users__date-group">
          <label htmlFor="startDate">From</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDate}
          />
        </div>
 
        <div className="admin-users__date-group">
          <label htmlFor="endDate">To</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDate}
          />
        </div>
      </div>
 
      <table className="admin-users__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>First Activity (Created At)</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="3" className="admin-users__no-results">
                No matching users
              </td>
            </tr>
          ) : (
            filteredUsers.map((u, idx) => (
              <tr
                key={u.id ?? idx}
                className={idx % 2 === 0 ? "even-row" : "odd-row"}
                onClick={() => handleRowClick(u)}
                style={{ cursor: "pointer" }}
              >
                <td title={u.name}>
                  {u.name ? u.name.slice(0, 10) : ""}
                </td>
                <td title={u.email}>
                  {u.email && u.email.length > 10
                    ? u.email.slice(0, 10) + "..."
                    : u.email}
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
 
      {/* Activity history modal */}
      {modalData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalData(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              minWidth: "320px",
              width: "90%",
              maxWidth: "600px",        // ✅ KEY FIX
              maxHeight: "80vh",        // ✅ prevents tall overflow
              overflowY: "auto",        // ✅ scroll inside modal
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>User Details</h3>
            <hr />
 
            <p
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              <strong>Name:</strong> {modalData.name}
            </p>
 
            <p
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              <strong>Email:</strong> {modalData.email}
            </p>
            <p>
              <strong>First Activity:</strong>{" "}
              {modalData.createdAt
                ? new Date(modalData.createdAt).toLocaleString()
                : "-"}
            </p>
 
            <button className="modal-close-btn" onClick={() => setModalData(null)}>
  Close
</button>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default AdminUsersData;