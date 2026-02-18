import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboardHome() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.role !== "admin") {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalRevenue: 0,
    bounceRate: 0,
    avgSession: 0,
  });

  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");

  const [selectedCard, setSelectedCard] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  function getStoredToken() {
    return localStorage.getItem("token");
  }

  const API_BASE =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
  const ANALYTICS_BASE =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Analytics";

  const endpoints = {
    totalUsers: `${API_BASE}/total-users`,
    newSignupsToday: `${API_BASE}/new-signups-today`,
    activeUsers: `${API_BASE}/active-users-list`,
    totalRevenue: `${API_BASE}/total-revenue`,

    // 👇 THESE 2 FIX THE ERROR
    bounceRate: `${ANALYTICS_BASE}/bounce-rate`,
    avgSession: `${ANALYTICS_BASE}/average-session`,
  };
  endpoints.activityHistory = `${API_BASE}/activity-history`;

  function handleAuthFailure(res) {
    if (!res) return false;

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");

      // 🔥 IMPORTANT: admin must go to admin login
      setTimeout(() => navigate("/admin/login", { replace: true }), 300);

      return true;
    }
    return false;
  }

  async function readResponseSafely(res) {
    if (handleAuthFailure(res)) {
      return { ok: false, error: "Unauthorized", raw: "", status: res.status };
    }
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    if (
      contentType.includes("application/json") ||
      contentType.includes("json")
    ) {
      try {
        return { ok: true, json: JSON.parse(text), raw: text, status: res.status };
      } catch (err) {
        return { ok: false, error: "Invalid JSON", raw: text, status: res.status };
      }
    }
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return { ok: true, json: parsed, raw: text, status: res.status };
      } catch (e) {
        /* fall through */
      }
    }
    return { ok: false, error: "Non-JSON response", raw: text, status: res.status };
  }

  function deepExtractNumber(jsonOrValue) {
    if (jsonOrValue == null) return null;
    if (typeof jsonOrValue === "number") return jsonOrValue;
    if (typeof jsonOrValue === "string") {
      const trimmed = jsonOrValue.trim();
      const n = Number(trimmed);
      if (!Number.isNaN(n)) return n;
      const m = trimmed.match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : null;
    }
    if (Array.isArray(jsonOrValue)) return jsonOrValue.length;
    if (typeof jsonOrValue === "object") {
      const candidates = [
        "value",
        "count",
        "total",
        "totalUsers",
        "total_users",
        "users",
        "size",
        "length",
        "countUsers",
        "activeUsers",
        "active_users",
      ];
      for (const k of candidates) {
        if (jsonOrValue[k] != null) {
          const v = deepExtractNumber(jsonOrValue[k]);
          if (v != null) return v;
        }
      }
      for (const k of Object.keys(jsonOrValue)) {
        const v = jsonOrValue[k];
        if (Array.isArray(v)) return v.length;
      }
      for (const k of Object.keys(jsonOrValue)) {
        try {
          const v = deepExtractNumber(jsonOrValue[k]);
          if (v != null) return v;
        } catch (_) { }
      }
    }
    return null;
  }

  function extractArrayFromWrappedObject(obj) {
    if (!obj || typeof obj !== "object") return null;
    const arrayKeys = ["data", "users", "items", "results", "rows", "list"];
    for (const k of arrayKeys) if (Array.isArray(obj[k])) return obj[k];
    for (const key of Object.keys(obj)) if (Array.isArray(obj[key])) return obj[key];
    return null;
  }

  // fetch stats
  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      setCardsLoading(true);
      setCardsError("");
      const token = getStoredToken();
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        const fetches = await Promise.all([
          fetch(endpoints.totalUsers, { headers }),
          fetch(endpoints.newSignupsToday, { headers }),
          fetch(endpoints.activeUsers, { headers }),
          fetch(endpoints.totalRevenue, { headers }),
          fetch(endpoints.bounceRate, { headers }),
          fetch(endpoints.avgSession, { headers }),
        ]);

        const authFail = fetches.find(
          (r) => r && (r.status === 401 || r.status === 403)
        );
        if (authFail) {
          handleAuthFailure(authFail);
          setCardsError("Authentication required. Redirecting to login...");
          return;
        }

        const parsed = await Promise.all(
          fetches.map((r) => readResponseSafely(r))
        );

        const values = parsed.map((p) => {
          try {
            if (p.ok) return deepExtractNumber(p.json);
            const raw = p.raw;
            if (typeof raw === "string") {
              const t = raw.trim();
              if (t.startsWith("{") || t.startsWith("[")) {
                try {
                  const parsedRaw = JSON.parse(t);
                  return deepExtractNumber(parsedRaw);
                } catch (_) { }
              }
              return deepExtractNumber(raw);
            }
            return deepExtractNumber(p.raw);
          } catch (_) {
            return null;
          }
        });

        if (!mounted) return;

        setStats((s) => ({
          ...s,
          totalUsers: values[0] ?? s.totalUsers,
          newSignups: values[1] ?? s.newSignups,
          activeUsers: values[2] ?? s.activeUsers,
          totalRevenue: values[3] ?? s.totalRevenue,
          bounceRate: values[4] ?? s.bounceRate,
          avgSession: values[5] ?? s.avgSession,
        }));
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        if (mounted)
          setCardsError(
            "Failed to load dashboard stats. See console/network for details."
          );
      } finally {
        if (mounted) setCardsLoading(false);
      }
    }

    fetchStats();
    return () => {
      mounted = false;
    };
  }, [navigate]);
  const colors = [
    "linear-gradient(135deg, #3b82f6, #60a5fa)",
    "linear-gradient(135deg, #10b981, #34d399)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    "linear-gradient(135deg, #ef4444, #f87171)",
    "linear-gradient(135deg, #06b6d4, #22d3ee)",
  ];

  const cards = [
    { label: "Total Users", key: "totalUsers", value: stats.totalUsers, note: "+ / -" },
    { label: "Active Users", key: "activeUsers", value: stats.activeUsers, note: "last 24h" },
    { label: "New Signups Today", key: "newSignups", value: stats.newSignups, note: "today" },
    { label: "Total Revenue ($)", key: "totalRevenue", value: stats.totalRevenue, note: "static" },
    { label: "Bounce Rate (%)", key: "bounceRate", value: stats.bounceRate, note: "static" },
    { label: "Avg. Session (min)", key: "avgSession", value: stats.avgSession, note: "avg" },
  ];

  // handle card click
  const handleCardClick = useCallback(
    async (label, key) => {
      setSelectedCard(label);
      setSearchTerm("");
      setFilterDateFrom("");
      setFilterDateTo("");
      setDetailData([]);
      setDetailError("");

      const token = getStoredToken();
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      setDetailLoading(true);

      try {
        // ✅ ACTIVE USERS → list API
        if (key === "activeUsers") {
          const res = await fetch(endpoints.activeUsers, { headers });
          if (handleAuthFailure(res)) return;

          const parsed = await readResponseSafely(res);
          if (parsed.ok && Array.isArray(parsed.json)) {
            setDetailData(parsed.json);
            return;
          }
        }

        // ✅ TOTAL USERS & NEW SIGNUPS → activity-history
        if (key === "totalUsers" || key === "newSignups") {
          const res = await fetch(
            `${endpoints.activityHistory}?page=1&pageSize=2000`,
            { headers }
          );
          if (handleAuthFailure(res)) return;

          const parsed = await readResponseSafely(res);
          if (parsed.ok && Array.isArray(parsed.json)) {
            let data = parsed.json;

            // only REGISTERED users
            data = data.filter(
              (item) => (item.Action ?? "").toLowerCase() === "registered"
            );

            // only TODAY for new signups
            if (key === "newSignups") {
              const todayUTC = new Date().toISOString().slice(0, 10);
              data = data.filter((item) =>
                item.Timestamp?.startsWith(todayUTC)
              );
            }

            // remove duplicates (one row per user)
            data = Object.values(
              data.reduce((acc, cur) => {
                acc[cur.UserId] = cur;
                return acc;
              }, {})
            );

            setDetailData(data);
            return;
          }
        }

        if (key === "totalRevenue" || key === "bounceRate" || key === "avgSession") {
          const endpoint =
            key === "totalRevenue"
              ? endpoints.totalRevenue
              : key === "bounceRate"
                ? endpoints.bounceRate
                : endpoints.avgSession;
          const res = await fetch(endpoint, { headers });

          if (handleAuthFailure(res)) {
            setDetailError("Authentication required. Redirecting to login...");
            return;
          }

          const parsed = await readResponseSafely(res);

          if (!parsed.ok) {
            console.error(
              "Metric endpoint non-JSON/invalid:",
              parsed.raw?.slice?.(0, 300)
            );
            setDetailError(
              "Server returned non-JSON or error for metric endpoint. See console/network for details."
            );
          } else {
            const json = parsed.json;
            if (Array.isArray(json)) setDetailData(json);
            else if (typeof json === "object") setDetailData([json]);
            else setDetailData([{ value: json }]);
          }
          return;
        }

        setDetailError("No endpoint configured for this card.");
      } catch (err) {
        console.error("Detail fetch error:", err);
        setDetailError(
          "Failed to load details. Check console/network for full response."
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [navigate]
  );

  const dateKey =
    detailData.length > 0 &&
    Object.keys(detailData[0]).find((key) =>
      key.toLowerCase().includes("date") ||
      key.toLowerCase().includes("at") ||
      key.toLowerCase().includes("month")
    );

  const filteredDetailData = useMemo(() => {
    if (!selectedCard) return [];
    let filtered = detailData || [];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(lowerSearch)
        )
      );
    }
    if (dateKey) {
      if (filterDateFrom) {
        const from = new Date(filterDateFrom + "T00:00:00Z");

        filtered = filtered.filter((item) => {
          const d = new Date(item[dateKey]);
          return !isNaN(d) && d >= from;
        });
      }

      if (filterDateTo) {
        const to = new Date(filterDateTo + "T23:59:59Z");

        filtered = filtered.filter((item) => {
          const d = new Date(item[dateKey]);
          return !isNaN(d) && d <= to;
        });
      }
    }
    return filtered;
  }, [detailData, searchTerm, filterDateFrom, filterDateTo, selectedCard, dateKey]);
  // ✅ FRONTEND PAGINATION (ADD HERE)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredDetailData.slice(start, end);
  }, [filteredDetailData, currentPage, pageSize]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredDetailData.length / pageSize));
  }, [filteredDetailData, pageSize]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setSelectedCard(null);
    }
    if (selectedCard) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [selectedCard]);

  const detailKeys =
    filteredDetailData.length > 0 &&
      typeof filteredDetailData[0] === "object"
      ? Object.keys(filteredDetailData[0]).filter(
        (key) =>
          !["id", "meta"].includes(key.toLowerCase())
      )
      : [];

  return (
    <div
      className="admin-dashboard-container"
      // 👇 important: allow content to grow and scroll, don't hide overflow
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        paddingBottom: "40px",
      }}
    >
      <h2 className="admin-dashboard-title">Admin Dashboard Overview</h2>

      {cardsError && <div className="admin-dashboard-error">{cardsError}</div>}

      {/* 2 cards per row; container tall enough, scroll allowed if needed */}
      <div
        className="admin-dashboard-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(280px, 1fr))",
          gap: "28px",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1100px",     // ✅ safe width for 3 cards
          margin: "0 auto",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {cards.map((item, i) => (
          <div
            key={item.label}
            className="admin-dashboard-card"
            style={{
              background: colors[i % colors.length],
            }}
            onClick={() => {
              setCurrentPage(1);
              handleCardClick(item.label, item.key);
            }}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                handleCardClick(item.label, item.key);
            }}
          >
            <div className="admin-dashboard-card-label">{item.label}</div>
            <div className="admin-dashboard-card-value">
              {cardsLoading ? "..." : item.value}
            </div>
            <div className="admin-dashboard-card-note">{item.note}</div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div
          className="admin-dashboard-modal-overlay"
          onClick={() => setSelectedCard(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="admin-dashboard-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="admin-dashboard-modal-close"
              aria-label="Close modal"
              onClick={() => setSelectedCard(null)}
            >
              &times;
            </button>
            <h3 id="modal-title">Details for: {selectedCard}</h3>

            {detailLoading && <p>Loading details...</p>}
            {detailError && (
              <p className="admin-dashboard-error">{detailError}</p>
            )}

            {detailKeys.length > 0 &&
              !["Bounce Rate (%)", "Avg. Session (min)"].includes(selectedCard) && (
                <div
                  className="admin-dashboard-filters"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",

                    // 🔥 center content ONLY for Active Users & New Signups
                    justifyContent:
                      selectedCard === "Active Users" || selectedCard === "New Signups Today"
                        ? "center"
                        : "flex-start",
                  }}
                >
                  {/* ✅ SEARCH BAR (SHOW FOR ALL LISTS) */}
                  <div
  className="input-with-icon"
  style={{
    position: "relative",
    flex: 1,          // ✅ allow it to grow
    minWidth: 0,     // ✅ important in flex
    margin:
      selectedCard === "Active Users" || selectedCard === "New Signups Today"
        ? "0 auto"
        : "0",
  }}
>

                    <FaSearch
                      className="input-icon"
                      style={{
                        position: "absolute",
                        left: "8px",
                        top: "62%",
                        transform: "translateY(-50%)",
                        color: "#555",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        paddingLeft: "30px",
                        height: "36px",
                        width: "100vw",
                        boxSizing: "border-box", // ✅ CRITICAL
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                        marginTop: "13px",
                      }}
                    />
                  </div>

                  {/* ✅ DATE FILTER → ONLY FOR TOTAL USERS */}
                  {selectedCard === "Total Users" && (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginLeft: "auto",
                        alignItems: "center",
                      }}
                    >
                      <div className="date-filter-group">
                        <label>From</label>
                        <div className="input-with-icon">
                      
                          <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="date-filter-group">
                        <label>To</label>
                        <div className="input-with-icon">
                      
                          <input
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {!detailLoading && filteredDetailData.length === 0 ? (
              <p className="admin-dashboard-empty">No data found.</p>
            ) : (
              <>
                <table className="admin-dashboard-table">
                  <thead>
                    <tr>
                      {detailKeys.map((key) => (
  <th key={key}>
    {selectedCard === "New Signups Today" &&
    key.toLowerCase() === "timestamp"
      ? "Time & Date"
      : key}
  </th>
))}

                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx}>
                        {detailKeys.map((key) => {
                          if (
                            key.toLowerCase() === "id" ||
                            key.toLowerCase() === "meta"
                          ) {
                            return null;
                          }

                          return (
                            <td
                              key={key}
                              style={{
                                maxWidth: "300px",
                                wordBreak: "break-word",
                                whiteSpace: "normal"
                              }}
                            >
                              {typeof row[key] === "object"
                                ? JSON.stringify(row[key])
                                : String(row[key] ?? "")}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 3), currentPage + 2)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "6px 10px",
                            background:
                              page === currentPage ? "#2563eb" : "#e5e7eb",
                            color: page === currentPage ? "#fff" : "#000",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )
            }
          </div>
        </div>
      )}
    </div>
  );
}