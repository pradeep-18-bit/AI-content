// src/pages/AdminAnalyticsDashboard.jsx
import React, { useEffect, useState } from "react";
import "../../App.css";
 
const API_BASE = "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Admin";
// explicitly use the exact GeneratedContent endpoints you provided
const GC_RECENT =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/GeneratedContent/recent";
const GC_MOST_USED =
  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/GeneratedContent/most-used";
 
/* ----------------- Helpers ----------------- */
function getStoredToken() {
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("authToken") ||
    null
  );
}
 
function handleAuthFailure(res) {
  if (!res) return false;
  if (res.status === 401 || res.status === 403) {
    ["authToken", "token", "jwt", "userToken"].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
    console.warn("Auth failed (401/403) — tokens cleared.");
    return true;
  }
  return false;
}
 
async function readResponseSafely(res) {
  if (!res) return { ok: false, status: 0, raw: null };
  if (handleAuthFailure(res)) return { ok: false, status: res.status, raw: "" };
 
  const ct = res.headers?.get?.("content-type") || "";
  const text = await res.text().catch(() => "");
  const trimmed = (text || "").trim();
 
  if (
    ct.includes("application/json") ||
    ct.includes("json") ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[")
  ) {
    try {
      return { ok: true, json: JSON.parse(trimmed), raw: text, status: res.status };
    } catch {
      return { ok: false, raw: text, status: res.status };
    }
  }
 
  return { ok: false, raw: text, status: res.status };
}
 
function deepExtractNumber(obj) {
  if (obj == null) return null;
  if (typeof obj === "number") return obj;
  if (typeof obj === "string") {
    const s = obj.trim();
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    const m = s.match(/-?\d+(\.\d+)?/);
    if (m) return Number(m[0]);
    return null;
  }
  if (Array.isArray(obj)) return obj.length;
  if (typeof obj === "object") {
    const keys = ["count", "total", "value", "size", "users", "length", "data"];
    for (const k of keys) {
      if (obj[k] != null) {
        const v = deepExtractNumber(obj[k]);
        if (v != null) return v;
      }
    }
    for (const k of Object.keys(obj)) {
      const v = deepExtractNumber(obj[k]);
      if (v != null) return v;
    }
  }
  return null;
}
 
function extractArrayFromWrappedObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const candidates = ["data", "users", "items", "results", "rows", "list"];
  for (const k of candidates) if (Array.isArray(obj[k])) return obj[k];
  for (const k of Object.keys(obj)) if (Array.isArray(obj[k])) return obj[k];
  return null;
}
 
/* ---------- improved content-type detection ---------- */
function extractContentType(item) {
  if (!item) return null;
 
  const directCandidates = [
    item.type,
    item.contentType,
    item.content_type,
    item.template,
    item.templateName,
    item.kind,
    item.category,
    item.label,
    item.format,
    item.meta && item.meta.type,
    item.metadata && (item.metadata.type || item.metadata.category),
    item.promptType,
    item.generatedType,
    item.typeName,
  ];
 
  for (const cand of directCandidates) {
    if (!cand && cand !== 0) continue;
    if (typeof cand === "string") {
      const s = cand.trim();
      if (s) return s;
    }
    if (typeof cand === "number") return String(cand);
    if (typeof cand === "object") {
      const nested = cand.name || cand.title || cand.type || cand.label || cand.category;
      if (nested) return String(nested);
    }
  }
 
  const parts = [
    item.title,
    item.name,
    item.prompt,
    item.summary,
    item.text,
    item.body,
    item.message,
    item.instructions,
    item.templateName,
    item.template,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase())
    .join(" || ");
 
  if (!parts) return null;
 
  const patterns = [
    [/\b(email|email copy|subject:|recipient:|write a professional email|free trial)\b/, "Email"],
    [
      /\b(ad copy|adcopy|ad creative|advertis(e|ing)|facebook ad|google ad|instagram ad|ad copy)\b/,
      "Ad Copy",
    ],
    [/\b(blog post|blog|article|write a (?:professional|long|short)? blog|10 proven strategies)\b/, "Blog Post"],
    [
      /\b(social media|social post|instagram|facebook post|linkedin post|tiktok post|caption|hashtag|social media of)\b/,
      "Social Post",
    ],
    [/\b(tweet|twitter|x post|thread)\b/, "Tweet"],
    [/\b(landing page|landingpage|hero section|call to action|cta)\b/, "Landing Page"],
    [/\b(product description|product detail|product description for)\b/, "Product Description"],
    [/\b(press release|press release headline|press)\b/, "Press Release"],
  ];
 
  for (const [re, label] of patterns) {
    if (re.test(parts)) return label;
  }
 
  if (parts.includes("blog")) return "Blog Post";
  if (parts.includes("email")) return "Email";
  if (parts.includes("ad") && parts.includes("copy")) return "Ad Copy";
  if (parts.includes("instagram") || parts.includes("facebook") || parts.includes("social")) return "Social Post";
 
  return null;
}
// ✅ Normalize bad / empty generated content types
function normalizeGeneratedType(type) {
  if (!type) return "General";
 
  const t = String(type).toLowerCase();
 
  if (t === "string" || t === "unknown" || t === "null") {
    return "General";
  }
 
  if (t.includes("blog")) return "Blog Post";
  if (t.includes("social")) return "Social Media";
  if (t.includes("email")) return "Email";
  if (t.includes("ad")) return "Ad Copy";
  if (t.includes("product")) return "Product Description";
  if (t.includes("landing")) return "Landing Page";
 
  return "General";
}
/* ----------------- Date parsing helpers ----------------- */
 
/**
 * Parse many common API date shapes into a Date object.
 */
function parseDateInput(input) {
  if (input == null) return null;
 
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    return input;
  }
 
  if (typeof input === "number") {
    if (input > 0 && input < 1e11) {
      return new Date(input * 1000); // seconds -> ms
    }
    return new Date(input);
  }
 
  if (typeof input === "string") {
    const s = input.trim();
 
    if (/^\d+$/.test(s)) {
      try {
        const n = Number(s);
        if (n > 0 && s.length <= 10) {
          return new Date(n * 1000); // seconds -> ms
        }
        return new Date(n); // ms
      } catch {
        // ignore
      }
    }
 
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
 
    const alt = Date.parse(s);
    if (!isNaN(alt)) return new Date(alt);
 
    return null;
  }
 
  if (typeof input === "object") {
    const candidates = ["createdAt", "created_at", "created", "date", "timestamp", "generatedAt", "time", "isoDate"];
    for (const k of candidates) {
      if (input[k]) {
        const d = parseDateInput(input[k]);
        if (d) return d;
      }
    }
    for (const k of Object.keys(input)) {
      const val = input[k];
      if (typeof val === "string" || typeof val === "number" || val instanceof Date) {
        const d = parseDateInput(val);
        if (d) return d;
      }
    }
  }
 
  return null;
}
 
/** Default local format (for everything else) */
function formatDate(value) {
  const d = parseDateInput(value);
  if (d) return d.toLocaleString();
  if (value == null || value === "") return "No date";
  return String(value);
}
 
/** UTC-specific formatter for Recently Generated Content */
function formatDateUTC(value) {
  const d = parseDateInput(value);
  if (!d) {
    if (value == null || value === "") return "No date";
    return String(value);
  }
 
  try {
    const formatted = new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(d);
 
    return `${formatted} UTC`;
  } catch {
    // fallback
    return d.toUTCString();
  }
}
 
/* ----------------- Sample fallback data ----------------- */
const sampleTemplates = [
  {
    id: "t1",
    name: "Blog Post - SEO",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    uses: 24,
  },
  {
    id: "t2",
    name: "Social Media Short",
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    uses: 41,
  },
  {
    id: "t3",
    name: "Product Launch Ad",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    uses: 12,
  },
  {
    id: "t4",
    name: "Welcome Email",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    uses: 33,
  },
  {
    id: "t5",
    name: "Newsletter Longform",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    uses: 9,
  },
];
 
const sampleGenerated = [
  {
    id: "g1",
    title: "SEO Blog for Product X",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: "Blog Post",
  },
  {
    id: "g2",
    title: "Facebook Ad Copy",
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    type: "Ad Copy",
  },
  {
    id: "g3",
    title: "Onboarding Email Series",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    type: "Email",
  },
];
 
// ✅ GLOBAL TEMPLATE NAME RESOLVER (ONLY PLACE IT HERE)
function getTemplateNameById(templateId) {
  if (templateId == null) return "Unknown Template";
 
  const tid = String(templateId);
  const stored = JSON.parse(localStorage.getItem("templates") || "[]");
 
  const found = stored.find(
    (t) =>
      String(t.id) === tid ||
      String(t._id) === tid ||
      String(t.templateId) === tid
  );
 
  return (
    found?.title ||
    found?.name ||
    found?.templateName ||
    "Unknown Template"
  );
}
 
/* ----------------- Component ----------------- */
const AdminAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
 
  useEffect(() => {
    let mounted = true;
 
    async function fetchAll() {
      const token = getStoredToken();
      const headers = { Accept: "application/json", "ngrok-skip-browser-warning": "69420" };
      if (token) headers.Authorization = `Bearer ${token}`;
 
      const urls = {
        totalUsers: `${API_BASE}/total-users`,
        newSignupsToday: `${API_BASE}/new-signups-today`,
        activeUsers: `${API_BASE}/active-users`,
        totalAdmins: `${API_BASE}/total-admins`,
        totalLogs: `${API_BASE}/total-logs`,
        mostUsedTemplates: `${API_BASE}/most-used-templates`,
        recentTemplates: `${API_BASE}/recent-templates`,
        usersTable: `${API_BASE}/users-table`,
 
        // use the exact endpoints
        recentGeneratedContent: GC_RECENT,
        mostUsedGeneratedContent: GC_MOST_USED,
      };
 
      try {
        const responses = await Promise.all(
          Object.values(urls).map((u) =>
            fetch(u, { headers }).catch(() => ({
              ok: false,
              status: 0,
              text: async () => "",
            }))
          )
        );
 
        const parsed = await Promise.all(responses.map((r) => readResponseSafely(r)));
        const keys = Object.keys(urls);
        const dataMap = {};
        keys.forEach((k, i) => {
          dataMap[k] = parsed[i];
        });
        // ✅ Fetch ALL templates for name resolution
        const allTemplatesRes = await fetch(
          "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Templates",
          { headers }
        );
 
        const allTemplatesSafe = await readResponseSafely(allTemplatesRes);
  if (allTemplatesSafe?.ok && Array.isArray(allTemplatesSafe.json)) {
          const allTemplatesToStore = allTemplatesSafe.json.map((t) => ({
            id: t.id ?? t._id ?? t.templateId,
            title:
              t.Title ??
              t.title ??
              t.Name ??
              t.name ??
              t.TemplateName ??
              t.templateName ??
              "Untitled Template",
            uses: Number(t.Uses ?? t.uses ?? 0),
          }));
 
          localStorage.setItem("templates", JSON.stringify(allTemplatesToStore));
 
        }
 
        // totalUsers
        const totalUsers = (() => {
          const p = dataMap.totalUsers;
          const n = p?.ok ? deepExtractNumber(p.json) : deepExtractNumber(p.raw);
          if (n != null) return n;
          const ut = dataMap.usersTable;
          if (ut?.ok && Array.isArray(ut.json)) return ut.json.length;
          return 0;
        })();
 
        // newSignups
        const newSignups = (() => {
          const p = dataMap.newSignupsToday;
          const n = p?.ok ? deepExtractNumber(p.json) : deepExtractNumber(p.raw);
          return n ?? 0;
        })();
 
        // activeUsers
        const activeUsers = (() => {
          const p = dataMap.activeUsers;
          if (p?.ok && Array.isArray(p.json)) return p.json.length;
          if (p?.ok && typeof p.json === "object") {
            const arr = extractArrayFromWrappedObject(p.json);
            if (Array.isArray(arr)) return arr.length;
            const n = deepExtractNumber(p.json);
            if (n != null) return n;
          }
          const ut = dataMap.usersTable;
          if (ut?.ok && Array.isArray(ut.json)) {
            const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const filtered = ut.json.filter((u) => {
              const lastActive =
                u.lastActiveAt ||
                u.last_active ||
                u.lastSeen ||
                u.lastLogin ||
                u.last_logged_in ||
                u.last_activity;
              if (!lastActive) return false;
              const t = Date.parse(lastActive);
              return !Number.isNaN(t) && t >= dayAgo;
            });
            if (filtered.length) return filtered.length;
            return Math.min(ut.json.length, Math.floor(ut.json.length * 0.2));
          }
          return 0;
        })();
 
        // totalAdmins & totalLogs
        const totalAdmins = (() => {
          const p = dataMap.totalAdmins;
          return p?.ok ? deepExtractNumber(p.json) ?? deepExtractNumber(p.raw) : deepExtractNumber(p.raw) ?? 0;
        })();
 
        const totalLogs = (() => {
          const p = dataMap.totalLogs;
          return p?.ok ? deepExtractNumber(p.json) ?? deepExtractNumber(p.raw) : deepExtractNumber(p.raw) ?? 0;
        })();
 
        // ✅ Most Used Templates — SAME SOURCE AS TEMPLATE LIBRARY
        let mostUsedTemplates = [];
 
        const mut = dataMap.mostUsedTemplates;
        console.log("MOST USED TEMPLATES RAW RESPONSE:", mut);
 
        // ✅ handle array OR wrapped object { data: [] }
        const mostUsedRaw =
          Array.isArray(mut?.json)
            ? mut.json
            : Array.isArray(mut?.json?.data)
              ? mut.json.data
              : Array.isArray(mut?.json?.data?.templates)
                ? mut.json.data.templates
                : Array.isArray(mut?.json?.result?.templates)
                  ? mut.json.result.templates
                  : Array.isArray(mut?.json?.result)
                    ? mut.json.result
                    : Array.isArray(mut?.json?.items)
                      ? mut.json.items
                      : [];
 
        if (mostUsedRaw.length > 0) {
          mostUsedTemplates = mostUsedRaw
            .map((t, i) => ({
              id: i, // API does not give id
              name: t.Title || t.title || "Unknown Template",
              uses: Number(t.Uses ?? t.uses ?? 0),
            }))
            .slice(0, 5); // ✅ SHOW ONLY TOP 5
        }
        else {
          console.warn("Most Used Templates API returned empty data", mut?.json);
        }
        let recentCreatedTemplates = [];
 
        const rtList = dataMap.recentTemplates;
 
        if (rtList?.ok && Array.isArray(rtList.json)) {
          recentCreatedTemplates = rtList.json
            .map((t) => ({
              id: t.id ?? t._id,
              name:
                t.Title ??
                t.title ??
                t.Name ??
                t.name ??
                t.TemplateName ??
                t.templateName ??
                "Unknown Template",
              createdAt:
                t.createdAt ||
                t.created_at ||
                t.created ||
                new Date().toISOString(),
              uses: Number(
                t.uses ??
                t.usageCount ??
                t.count ??
                0
              ),
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        }
        // --- Generated content parsing ---
        let recentGeneratedContent = sampleGenerated.slice();
        const rg = dataMap.recentGeneratedContent;
        if (rg?.ok) {
          if (Array.isArray(rg.json)) recentGeneratedContent = rg.json;
          else {
            const arr = Array.isArray(rg.json?.data) ? rg.json.data : extractArrayFromWrappedObject(rg.json);
            if (arr) recentGeneratedContent = arr;
            else if (rg.json && typeof rg.json === "object") {
              recentGeneratedContent = Object.keys(rg.json).map((k) => ({ id: k, ...rg.json[k] }));
            }
          }
        }
        recentGeneratedContent = recentGeneratedContent
          .map((g) => {
            const createdRaw =
              g.createdAt ||
              g.created_at ||
              g.created ||
              g.generatedAt ||
              g.timestamp ||
              g.date ||
              g.time ||
              new Date().toISOString();
            const parsed = parseDateInput(createdRaw);
            return {
              id: g.id ?? g._id ?? g.uuid ?? Math.random().toString(36).slice(2, 9),
              title: g.title ?? g.name ?? g.summary ?? g.prompt ?? g.text ?? "Generated Item",
              createdAtRaw: createdRaw,
              createdAtParsed: parsed,
              createdAt: parsed ? parsed.toISOString() : createdRaw,
              type: normalizeGeneratedType(extractContentType(g)),
              uses: Number(g.uses ?? g.count ?? 0),
              raw: g,
            };
          })
          .sort((a, b) => {
            const da = parseDateInput(a.createdAt);
            const db = parseDateInput(b.createdAt);
            return (db?.getTime() || 0) - (da?.getTime() || 0);
          })
          .slice(0, 10);
 
        let mostUsedGeneratedContent = recentGeneratedContent.slice();
        const mg = dataMap.mostUsedGeneratedContent;
        if (mg?.ok) {
          if (Array.isArray(mg.json)) mostUsedGeneratedContent = mg.json;
          else {
            const arr = Array.isArray(mg.json?.data) ? mg.json.data : extractArrayFromWrappedObject(mg.json);
            if (arr) mostUsedGeneratedContent = arr;
          }
        }
        mostUsedGeneratedContent = mostUsedGeneratedContent
          .map((g) => {
            const createdRaw =
              g.createdAt ||
              g.created_at ||
              g.created ||
              g.generatedAt ||
              g.timestamp ||
              g.date ||
              g.time ||
              new Date().toISOString();
 
            const parsed = parseDateInput(createdRaw);
            const normalizedType = normalizeGeneratedType(extractContentType(g));
 
            return {
              id: g.id ?? g._id ?? g.uuid ?? Math.random().toString(36).slice(2, 9),
              title: normalizedType,      // ✅ CHANGE IS HERE
              createdAtRaw: createdRaw,
              createdAtParsed: parsed,
              createdAt: parsed ? parsed.toISOString() : createdRaw,
              type: normalizedType,
              uses: Number(g.uses ?? g.count ?? g.total ?? 0),
              raw: g,
            };
          })
          .sort((a, b) => (b.uses || 0) - (a.uses || 0))
          .slice(0, 10);
 
        // sample activity and users derived locally (unchanged)
        const activityLogs = [
          { action: "Logged In", name: "Alice" },
          { action: "Created Content", name: "Bob" },
          { action: "Logged In", name: "Alice" },
          { action: "Registered", name: "Carol" },
          { action: "Updated Profile", name: "David" },
          { action: "Logged In", name: "Bob" },
          { action: "Logged In", name: "Eve" },
          { action: "Registered", name: "Frank" },
          { action: "Logged In", name: "Alice" },
          { action: "Logged In", name: "David" },
        ];
        const activityMap = {};
        activityLogs.forEach(({ action }) => {
          activityMap[action] = (activityMap[action] || 0) + 1;
        });
        const totalActions = Object.values(activityMap).reduce((a, b) => a + b, 0) || 1;
        const activitySummary = Object.entries(activityMap)
          .map(([type, count]) => ({ type, percent: ((count / totalActions) * 100).toFixed(1) }))
          .sort((a, b) => b.percent - a.percent);
 
        const userActionsMap = {};
        activityLogs.forEach(({ name }) => {
          userActionsMap[name] = (userActionsMap[name] || 0) + 1;
        });
        const mostActiveUsers = Object.entries(userActionsMap)
          .map(([name, actions]) => ({ name, actions }))
          .sort((a, b) => b.actions - a.actions)
          .slice(0, 5);
 
        const rawUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const recentUsers = (Array.isArray(rawUsers) ? rawUsers : [])
          .filter((u) => u.role === "user")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(({ name, email, createdAt }) => ({ name, email, createdAt }));
 
        const prevTotalUsers = Math.max(1, (totalUsers || 0) - 5);
        const prevActiveUsers = Math.max(1, (activeUsers || 0) - 2);
        const prevTotalLogs = Math.max(1, (totalLogs || 0) - 20);
        const prevTotalAdmins = Math.max(1, totalAdmins || 0);
 
        const calcChangePercent = (current, previous) => {
          if (!previous || isNaN(current) || isNaN(previous)) return null;
          const change = ((current - previous) / previous) * 100;
          return (change > 0 ? "+" : "") + change.toFixed(1) + "%";
        };
 
        const activeUsersPercent = totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) : "0.0";
        const totalAdminsPercent = totalUsers ? ((totalAdmins / totalUsers) * 100).toFixed(1) : "0.0";
 
        if (!mounted) return;
 
        setAnalytics({
          totalUsers: totalUsers ?? 0,
          totalUsersChange: calcChangePercent(totalUsers, prevTotalUsers),
          newSignups: newSignups ?? 0,
          activeUsers: activeUsers ?? 0,
          activeUsersChange: calcChangePercent(activeUsers, prevActiveUsers),
          activeUsersPercent,
          totalLogs: totalLogs ?? 0,
          totalLogsChange: calcChangePercent(totalLogs, prevTotalLogs),
          totalAdmins: totalAdmins ?? 0,
          totalAdminsChange: calcChangePercent(totalAdmins, prevTotalAdmins),
          totalAdminsPercent,
          activitySummary,
          mostActiveUsers,
          recentUsers,
          mostUsedTemplates,
          recentCreatedTemplates,
          // new fields:
          recentGeneratedContent,
          mostUsedGeneratedContent,
        });
      } catch (err) {
        console.error("Failed to load analytics:", err);
        if (!mounted) return;
        setAnalytics({
          totalUsers: 0,
          totalUsersChange: null,
          newSignups: 0,
          activeUsers: 0,
          activeUsersChange: null,
          activeUsersPercent: "0.0",
          totalLogs: 0,
          totalLogsChange: null,
          totalAdmins: 0,
          totalAdminsChange: null,
          totalAdminsPercent: "0.0",
          activitySummary: [],
          mostActiveUsers: [],
          recentUsers: [],
          mostUsedTemplates: sampleTemplates,
          recentCreatedTemplates: sampleTemplates,
          recentGeneratedContent: sampleGenerated,
          mostUsedGeneratedContent: sampleGenerated,
        });
      }
    }
 
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);
 
  if (!analytics) return <div className="aad-centerText">Loading analytics...</div>;
 
  return (
    <div className="aad-container">
      <h2 className="aad-title">Admin Analytics Dashboard</h2>
 
      <div className="aad-topCards">
        <AnalyticsCard
          title="Total Users"
          value={analytics.totalUsers}
          change={analytics.totalUsersChange}
          color="#4f46e5"
        />
        <AnalyticsCard
          title="Active Users"
          value={analytics.activeUsers}
          change={analytics.activeUsersChange}
          relativePercent={analytics.activeUsersPercent}
          color="#10b981"
        />
        <AnalyticsCard
          title="New Signups (today)"
          value={analytics.newSignups}
          color="#06b6d4"
        />
        <AnalyticsCard
          title="Admins"
          value={analytics.totalAdmins}
          change={analytics.totalAdminsChange}
          relativePercent={analytics.totalAdminsPercent}
          color="#ef4444"
        />
      </div>
 
      <div className="aad-contentGrid">
        <div className="aad-box">
          <h3>Most Used Templates</h3>
          <table className="aad-table">
            <thead>
              <tr>
                <th>Template</th>
                <th style={{ textAlign: "right" }}>Uses</th>
              </tr>
            </thead>
            <tbody>
              {analytics.mostUsedTemplates.map((tpl, i) => (
                <tr key={tpl.id || i}>
                  <td>{tpl.name}</td>
                  <td style={{ textAlign: "right" }}>{tpl.uses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
        <div className="aad-box">
          <h3>Recently Created Templates</h3>
          <ul className="aad-list">
            {analytics.recentCreatedTemplates.map((tpl, i) => (
              <li key={tpl.id || i} className="aad-listItem">
                <div className="aad-userInfo">
                  <strong>{tpl.name}</strong>
                  <small>
                    Created: {formatDate(tpl.createdAt)} • Uses: {tpl.uses}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
 
        {/* Recently Generated Content — now in UTC */}
        <div className="aad-box">
          <h3>Recently Generated Content</h3>
          <ul className="aad-list">
            {analytics.recentGeneratedContent && analytics.recentGeneratedContent.length ? (
              analytics.recentGeneratedContent.map((g, i) => (
                <li key={g.id || i} className="aad-listItem">
                  <div className="aad-userInfo">
                    <strong>{g.title}</strong>
                    <small>
                      {`Type: ${g.type ?? "Unknown"}`} • {formatDateUTC(g.createdAt)}{" "}
                      {g.uses ? `• Uses: ${g.uses}` : ""}
                    </small>
                  </div>
                </li>
              ))
            ) : (
              <li className="aad-listItem">No recent generated content found.</li>
            )}
          </ul>
        </div>
 
        <div className="aad-box">
          <h3>Most Used Generated Content</h3>
          <table className="aad-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Uses</th>
              </tr>
            </thead>
            <tbody>
              {analytics.mostUsedGeneratedContent && analytics.mostUsedGeneratedContent.length ? (
                analytics.mostUsedGeneratedContent.map((g, i) => (
                  <tr key={g.id || i}>
                    <td>{g.title}</td>
                    <td>{g.type ?? "Unknown"}</td>
                    <td style={{ textAlign: "right" }}>{g.uses ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
 
const AnalyticsCard = ({ title, value, change, color, relativePercent }) => (
  <div className="aad-card" style={{ borderBottom: `3px solid ${color}` }}>
    <h4>{title}</h4>
    <p className="aad-value">
      {value}{" "}
      {relativePercent !== undefined && (
        <span
          className="aad-relativePercent"
          style={{ color: "#666", fontSize: "0.8rem", marginLeft: 6 }}
        >
          ({relativePercent}%)
        </span>
      )}
    </p>
  </div>
);
 
export default AdminAnalyticsDashboard;
