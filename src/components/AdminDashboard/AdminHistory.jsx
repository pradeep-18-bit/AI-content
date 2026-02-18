import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminDashboard.css";
 
const API_BASE =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
const ACTIVITY_HISTORY_API = `${API_BASE}/activity-history`;
 
function AdminHistory() {
  const { refreshKey } = useOutletContext();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalData, setModalData] = useState(null);
 
  const token = localStorage.getItem("token");
 
  const extractItems = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;
    const firstArray = Object.values(data).find((v) => Array.isArray(v));
    return firstArray || [];
  };
 
  const commonHeaders = {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
 
  const parseJsonSafely = async (res, where) => {
    const text = await res.text();
    console.log(`${where} raw response:`, text);
 
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`${where}: Response is not valid JSON`);
    }
  };
 
  // Fetch all activity history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
 
        const res = await fetch(`${ACTIVITY_HISTORY_API}?pageSize=100`, {
          headers: commonHeaders,
        });
 
        if (!res.ok) {
          throw new Error(
            `Failed to fetch activity history (${res.status})`
          );
        }
 
        const data = await parseJsonSafely(res, "All history");
        const items = extractItems(data);
 
        const mapped = items
          .map((item, index) => {
            const userId =
              item.UserId ??
              item.userId ??
              item.userID ??
              item.userIDFk ??
              item.idUser;
 
            const email =
              item.Email ?? item.email ?? "";
 
            const name =
              item.UserName ??
              item.userName ??
              item.name ??
              item.fullName ??
              item.username ??
              (email ? email.split("@")[0] : "Unknown");
 
            const action =
              item.Action ??
              item.action ??
              item.activity ??
              item.description;
 
            const date =
              item.Timestamp ??
              item.timestamp ??
              item.date ??
              item.createdOn;
 
            if (!action || !date) return null;
 
            return {
              id:
                item.id ||
                item.activityId ||
                `${userId || "user"}-${index}`,
              userId,
              name,
              email,
              action,
              date,
            };
          })
          .filter(Boolean);
 
        const sorted = mapped.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
 
        setHistory(sorted);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load activity history.");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
 
    fetchHistory();
  }, [refreshKey, token]);
 
  const filteredHistory = history.filter((item) => {
    const matchAction = item.action
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
 
    const created = new Date(item.date);
    let matchDate = true;
 
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (created < start) matchDate = false;
    }
 
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (created > end) matchDate = false;
    }
 
    return matchAction && matchDate;
  });
 
  // Fetch activity history for specific user when row is clicked
  const handleRowClick = async (userId, email, name) => {
    if (userId) {
      try {
        const res = await fetch(
          `${ACTIVITY_HISTORY_API}/${userId}?pageSize=100`,
          { headers: commonHeaders }
        );
 
        if (!res.ok) {
          throw new Error(
            `Failed to fetch user activity history (${res.status})`
          );
        }
 
        const data = await parseJsonSafely(res, "User history");
        const items = extractItems(data);
 
        if (!items.length) {
          alert("No activity found for this user.");
          return;
        }
 
        const actions = items
          .map((item) => {
            const action =
              item.Action ??
              item.action ??
              item.activity ??
              item.description;
 
            const date =
              item.Timestamp ??
              item.timestamp ??
              item.date ??
              item.createdOn;
            if (!action || !date) return null;
            return { action, date };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
 
        if (!actions.length) {
          alert("No activity found for this user.");
          return;
        }
 
        const userName =
          name ||
          items[0].UserName ||
          items[0].userName ||
          items[0].name ||
          items[0].fullName ||
          items[0].username ||
          (items[0].Email
            ? items[0].Email.split("@")[0]
            : "Unknown");
 
        const userEmail =
          email || items[0].Email || items[0].email || "";
 
        setModalData({
          name: userName,
          email: userEmail,
          actions,
        });
 
        return;
      } catch (err) {
        console.error(err);
        alert(err.message || "Failed to load this user's activity history.");
      }
    }
 
    // Fallback: filter from already loaded history by email
    const userAllActions = history
      .filter((entry) => entry.email === email)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
 
    if (userAllActions.length === 0) {
      alert("No activity found for this user.");
      return;
    }
 
    const fallbackName =
      name ||
      (email ? email.split("@")[0] : "Unknown");
 
    setModalData({
      name: fallbackName,
      email,
      actions: userAllActions,
    });
  };
 
  if (loading) {
    return (
      <p className="admin-history__status-text">
        Loading activity history...
      </p>
    );
  }
 
  if (error) {
    return <p className="admin-history__status-text">{error}</p>;
  }
 
  if (history.length === 0) {
    return (
      <p className="admin-history__status-text">
        No activity history found.
      </p>
    );
  }
 
  return (
    <div className="admin-history">
      <h2 className="admin-history__title">User Activity History</h2>
 
      {/* Filters */}
      <div className="admin-history__filters">
        <input
          type="text"
          placeholder="🔍 Search by action"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-history__search-input"
        />
 
        <div className="admin-history__date-filter">
          <label htmlFor="startDate">From:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="admin-history__date-input"
          />
        </div>
 
        <div className="admin-history__date-filter">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="admin-history__date-input"
          />
        </div>
      </div>
 
      {/* Table */}
      <table className="admin-history__table">
        <thead>
          <tr>
            <th>Id</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Action</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.length === 0 ? (
            <tr>
              <td colSpan="5" className="admin-history__no-results">
                No matching activity
              </td>
            </tr>
          ) : (
            filteredHistory.map((h, i) => (
              <tr
                key={h.id || `${h.email}-${i}`}
                onClick={() => handleRowClick(h.userId, h.email, h.name)}
                className={`admin-history__row ${i % 2 === 0
                  ? "admin-history__row--even"
                  : "admin-history__row--odd"
                  }`}
              >
                <td>{i + 1}</td>
                <td title={h.name}>
                  {h.name
                    ? h.name.length > 10
                      ? h.name.slice(0, 10) + "..."
                      : h.name
                    : "Unknown"}
                </td>
 
                <td title={h.email}>
                  {h.email
                    ? h.email.length > 10
                      ? h.email.slice(0, 10) + "..."
                      : h.email
                    : ""}
                </td>
                <td>{h.action}</td>
                <td>{new Date(h.date).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
 
      {/* Modal */}
      {modalData && (
        <div
          className="admin-history__modal"
          onClick={() => setModalData(null)}
        >
          <div
            className="admin-history__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: "1.4",
              }}
            >
              {modalData.name}
              <br />
              <span style={{ fontSize: "14px", color: "#555" }}>
                {modalData.email}
              </span>
            </h3>
            <hr />
            {modalData.actions.map((act, idx) => (
              <div
                key={idx}
                className={`admin-history__modal-action ${idx % 2 === 0
                  ? "admin-history__modal-action--even"
                  : "admin-history__modal-action--odd"
                  }`}
              >
                <p>
                  <strong>Action:</strong> {act.action}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(act.date).toLocaleString()}
                </p>
              </div>
            ))}
            <button
              className="admin-history__modal-close-btn"
              onClick={() => setModalData(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default AdminHistory;