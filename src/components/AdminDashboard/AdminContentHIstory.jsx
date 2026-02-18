import React, { useEffect, useState } from "react";
import { FaTrash, FaEye, FaDownload, FaCopy } from "react-icons/fa";
import "./AdminDashboard.css";

/* ✅ Date formatter */
const formatDateTime = (value) => {
  if (!value) return "-";

  const d = new Date(value);

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const ContentHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const getCleanTitle = (text) => {
    if (!text) return "Untitled Content";

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const line =
      lines.find(
        (l) =>
          !l.toLowerCase().startsWith("you are") &&
          !l.toLowerCase().startsWith("task:") &&
          !l.toLowerCase().includes("instruction")
      ) || lines[0];

    return line
      .replace(/^subject\s*:/i, "")
      .replace(/^title\s*:/i, "")
      .trim()
      .slice(0, 80);
  };

  useEffect(() => {
    const fetchAdminHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/GeneratedContent/admin/recent",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch admin content history");
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];

        const normalized = list.map((item, index) => {
          const content =
            item.generatedContent ||
            item.responseText ||
            item.content ||
            "";

          const date =
            item.createdAt ||
            item.createdOn ||
            item.created_at ||
            item.updatedAt ||
            item.updated_at ||
            item.date ||
            null;

          return {
            uid: `${item.id ?? "noid"}-${index}`,
            id: item.id ?? index,
            content,
            title: getCleanTitle(content),
            type: item.type || item.contentType || "General",
            status: item.status || "Generated",
            date,
            wordCount: content ? content.split(/\s+/).length : 0,
            raw: item,
          };
        });

        setHistory(
          normalized.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load content history.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminHistory();
  }, []);

  useEffect(() => {
    if (!copiedId) return;
    const t = setTimeout(() => setCopiedId(null), 1200);
    return () => clearTimeout(t);
  }, [copiedId]);

  const handleDelete = (uid) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setHistory((prev) => prev.filter((i) => i.uid !== uid));
  };

  const handleDownload = (item) => {
    const blob = new Blob([item.content || ""], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item.title}.txt`;
    link.click();
  };

  const handleCopy = (item, uid) => {
    navigator.clipboard.writeText(item.content || "");
    setCopiedId(uid);
  };

  const handleView = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      typeFilter === "All Types" || item.type === typeFilter;

    const matchesStatus =
      statusFilter === "All Status" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="history-container">
      <div className="history-pagee">
        <div className="history-header">
          <div>
            <h2 style={{ color: "#000", marginBottom: "20px" }}>
              Content History
            </h2>
            <p>Manage and track all generated content.</p>
          </div>

          <button
            className="generate-btn"
            onClick={() =>
              (window.location.href = "/admin/content-generator")
            }
          >
            Generate New Content
          </button>
        </div>

        <div className="history-filters">
          <input
            type="text"
            placeholder="Search content..."
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
            <option>Draft</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
        </div>

        <div className="history-list">
          {loading ? (
            <p className="empty">Loading content...</p>
          ) : error ? (
            <p className="empty">{error}</p>
          ) : filteredHistory.length === 0 ? (
            <p className="empty">No content found.</p>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.uid} className="history-item">
                <div className="history-info">
                  <h3>{item.title}</h3>

                  <div className="history-meta">
                    <span className="type">{item.type}</span>
                    <span className="status">{item.status}</span>
                    <span className="words">
                      {item.wordCount} words
                    </span>
                  </div>

                  <p className="history-preview">
                    {item.content
                      ? item.content.slice(0, 120) + "..."
                      : "No preview available."}
                  </p>
                </div>

                <div className="history-actions">
                  <FaEye
                    title="View"
                    className="icon"
                    onClick={() => handleView(item)}
                  />

                  <FaCopy
                    title={copiedId === item.uid ? "Copied" : "Copy"}
                    className={`icon ${
                      copiedId === item.uid ? "copied" : ""
                    }`}
                    onClick={() => handleCopy(item, item.uid)}
                  />

                  <FaDownload
                    title="Download"
                    className="icon"
                    onClick={() => handleDownload(item)}
                  />

                  <FaTrash
                    title="Delete"
                    className="icon delete"
                    onClick={() => handleDelete(item.uid)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {selectedItem && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedItem.title}</h3>
                <button className="close-btn" onClick={closeModal}>
                  ✖
                </button>
              </div>

              <div className="modal-meta">
                <span>🗓 {formatDateTime(selectedItem.date)}</span>
                <span>✍️ {selectedItem.type}</span>
                <span>📌 {selectedItem.status}</span>
                <span>📏 {selectedItem.wordCount} words</span>
              </div>

              <hr />

              <div className="modal-body">
                <p>{selectedItem.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHistory;
