import React, { useEffect, useState } from "react";
import { FaTrash, FaCopy, FaEye, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ContentHistory.css";

const API_URL =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/GeneratedContent/recent";

export default function ContentHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Unauthorized");
          setLoading(false);
          return;
        }

        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setError("Unauthorized");
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error("Failed to load content history");

        const response = await res.json();

        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const normalized = list.map((item, index) => {
          const content =
            item.generatedContent ||
            item.responseText ||
            item.content ||
            "";

         const getTitle = (text) => {
  if (!text) return "Untitled";

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  // skip system / instruction lines
  const usableLine =
    lines.find(
      l =>
        !l.toLowerCase().startsWith("you are an expert") &&
        !l.toLowerCase().startsWith("task:") &&
        !l.toLowerCase().includes("strict rules")
    ) || lines[0];

  return usableLine
    .replace(/^subject\s*:/i, "")
    .replace(/^title\s*:/i, "")
    .trim()
    .slice(0, 80);
};
          const title = getTitle(content);

          return {
            uid: `${item.id ?? "noid"}-${index}`,
            id: item.id ?? index,
            title,
            content,
            type: item.contentType || "General",
            status: "Generated",
            wordCount: content ? content.split(/\s+/).length : 0,
            date: item.createdAt || new Date().toISOString(),
          };
        });

        setHistory(
          normalized.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )
        );
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === "All Types" || item.type === typeFilter) &&
      (statusFilter === "All Status" || item.status === statusFilter)
    );
  });

  const handleCopy = (item) => {
  navigator.clipboard.writeText(item.content);
  setCopiedId(item.uid);

  setTimeout(() => {
    setCopiedId(null);
  }, 1000);
};


  const handleDelete = (uid) => {
    setHistory((prev) => prev.filter((i) => i.uid !== uid));
    setConfirmId(null);
  };

  const handleDownload = (item) => {
    const blob = new Blob([item.content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title.slice(0, 30)}.txt`;
    link.click();
  };

  return (
    <div className="history-container">
      <div className="history-page">
        <div className="history-header">
          <div>
            <h2>Content History</h2>
            <p>Manage and track all your generated content</p>
          </div>
          <button
            className="generate-btn"
            onClick={() => navigate("/content-generator")}
          >
            Generate New Content
          </button>
        </div>

        <div className="history-filters">
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Types</option>
            <option>Blog Post</option>
            <option>Email Copy</option>
            <option>Ad Copy</option>
            <option>Social Media</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Generated</option>
          </select>
        </div>

        <div className="history-list">
          {loading && <p className="empty">Loading content...</p>}
          {error && <p className="empty error">{error}</p>}
          {!loading && !error && filteredHistory.length === 0 && (
            <p className="empty">No content found.</p>
          )}

          {filteredHistory.map((item) => (
            <div key={item.uid} className="history-item">
              <div className="history-info">
                <h3>{item.title}</h3>

                <div className="history-meta">
                  <span>{item.type}</span>
                  <span>{item.status}</span>
                  <span>
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span>{item.wordCount} words</span>
                </div>

                <p className="history-preview">
                  {item.content.slice(0, 120)}...
                </p>
              </div>

              <div className="history-actions">
                <FaEye onClick={() => setSelectedItem(item)} />
                <div style={{ position: "relative" }}>
  <FaCopy onClick={() => handleCopy(item)} />

  {copiedId === item.uid && (
    <span
      style={{
        position: "absolute",
        top: "22px",     // ✅ show below icon
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: "11px",
        color: "#4b5aa6",
        whiteSpace: "nowrap",
      }}
    >
      Copied
    </span>
  )}
</div>

                <FaDownload onClick={() => handleDownload(item)} />
                <FaTrash onClick={() => setConfirmId(item.uid)} />
              </div>
            </div>
          ))}
        </div>

        {confirmId && (
          <div className="simple-popup-wrapper">
            <div className="modal-content" style={{ maxWidth: "420px" }}>
              <div className="modal-header">
                <h3>Delete content?</h3>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "12px",
                    background: "transparent",
                    border: "none",
                    fontSize: "22px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>
                  Are you sure you want to delete this content? This
                  action cannot be undone.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    className="cancel-btn"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(confirmId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ position: "relative", paddingRight: "40px" }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: "1.4",
                  }}
                >
                  {selectedItem.title}
                </h3>

                <button
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "16px",
                    background: "transparent",
                    border: "none",
                    fontSize: "22px",
                    cursor: "pointer",
                    lineHeight: 1,
                    color: "#111",
                    zIndex: 1000,
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <p>{selectedItem.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
