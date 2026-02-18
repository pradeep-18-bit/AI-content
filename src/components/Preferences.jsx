import React, { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";

const API = {
  getPreferences:
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Preferences",
  savePreferences:
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Preferences",
};

const LOCAL_KEY = "contentPreferences";

const Preferences = () => {
  const [autoSave, setAutoSave] = useState(true);
  const [seoSuggestions, setSeoSuggestions] = useState(true);
  const [plagiarismCheck, setPlagiarismCheck] = useState(false);
  const [language, setLanguage] = useState("English");
  const [lengthPref, setLengthPref] = useState("Short (100-300 words)");

  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const lengthMap = {
    "Short (100-300 words)": 1,
    "Medium (300-600 words)": 2,
    "Long (600+ words)": 3,
  };

  const intToLengthLabel = (val) => {
    if (val === 1) return "Short (100-300 words)";
    if (val === 2) return "Medium (300-600 words)";
    if (val === 3) return "Long (600+ words)";
    return "Short (100-300 words)";
  };

  const safeParse = async (res) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { _rawText: text };
    }
  };

  const getRawToken = () => {
    const raw =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      null;
    if (!raw) return null;
    if (raw.length > 1 && raw[0] === '"' && raw[raw.length - 1] === '"') {
      try {
        return JSON.parse(raw);
      } catch {
        return raw.slice(1, -1);
      }
    }
    return raw;
  };

  const formatValidationErrors = (errorsObj) => {
    if (!errorsObj) return null;
    const parts = [];
    try {
      for (const key of Object.keys(errorsObj)) {
        const arr = errorsObj[key];
        if (Array.isArray(arr)) parts.push(`${key}: ${arr.join("; ")}`);
        else if (typeof arr === "string") parts.push(`${key}: ${arr}`);
        else parts.push(`${key}: ${JSON.stringify(arr)}`);
      }
      return parts.join(" | ");
    } catch {
      return null;
    }
  };

  const loadLocalPrefs = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const saveLocalPrefs = (prefs) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs));
    } catch {}
  };

  useEffect(() => {
    let mounted = true;

    const local = loadLocalPrefs();
    if (local) {
      setLanguage(local.language ?? "English");
      setLengthPref(local.lengthPref ?? "Short (100-300 words)");
      setAutoSave(local.autoSave ?? true);
      setSeoSuggestions(local.seoSuggestions ?? true);
      setPlagiarismCheck(local.plagiarismCheck ?? false);
    }

    const fetchPrefs = async () => {
      setLoadingGet(true);
      setError("");
      setValidationErrors({});
      try {
        const token = getRawToken();
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(API.getPreferences, { method: "GET", headers });
        const data = await safeParse(res);
        if (!mounted) return;

        if (res.status === 401) {
          setError(data?.message || "Unauthorized — please login.");
          ["token", "accessToken"].forEach((k) => localStorage.removeItem(k));
          return;
        }

        if (!res.ok) {
          if (!local) {
            setError(
              data?.message ||
                `Failed to load preferences (${res.status}). Using local values.`
            );
          }
          return;
        }

        const p = data?.data || data || {};
        if (!p || Object.keys(p).length === 0) return;

        if (p.DefaultLanguage || p.language) {
          setLanguage(p.DefaultLanguage || p.language);
        }

        const rawLen =
          p.DefaultContentLength ??
          p.ContentLength ??
          p.lengthPref ??
          p.contentLength;

        if (typeof rawLen === "number") {
          setLengthPref(intToLengthLabel(rawLen));
        } else if (typeof rawLen === "string" && rawLen.trim() !== "") {
          setLengthPref(rawLen);
        }

        const toBool = (val, defaultVal) => {
          if (typeof val === "boolean") return val;
          if (val === 1 || val === "1" || val === "true") return true;
          if (val === 0 || val === "0" || val === "false") return false;
          return defaultVal;
        };

        const nextPrefs = {
          language: p.DefaultLanguage || p.language || (local?.language ?? language),
          lengthPref:
            typeof rawLen === "number"
              ? intToLengthLabel(rawLen)
              : rawLen || (local?.lengthPref ?? lengthPref),
          autoSave: toBool(
            p.AutoSaveDrafts ?? p.autoSaveDrafts,
            local?.autoSave ?? autoSave
          ),
          seoSuggestions: toBool(
            p.IncludeSeoSuggestions ?? p.includeSeoSuggestions,
            local?.seoSuggestions ?? seoSuggestions
          ),
          plagiarismCheck: toBool(
            p.EnablePlagiarismCheck ?? p.enablePlagiarismCheck,
            local?.plagiarismCheck ?? plagiarismCheck
          ),
        };

        setAutoSave(nextPrefs.autoSave);
        setSeoSuggestions(nextPrefs.seoSuggestions);
        setPlagiarismCheck(nextPrefs.plagiarismCheck);
        setLanguage(nextPrefs.language);
        setLengthPref(nextPrefs.lengthPref);

        saveLocalPrefs(nextPrefs);
      } catch {
        if (mounted && !local) {
          setError("Network error while loading preferences. Using local values.");
        }
      } finally {
        if (mounted) setLoadingGet(false);
      }
    };

    fetchPrefs();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setMessage("");
    setError("");
    setValidationErrors({});

    if (!language || !lengthPref) {
      setError("Please ensure Language and Content Length are selected.");
      return;
    }

    setLoadingSave(true);

    const rawToken = getRawToken();
    const payload = {
      UserId: localStorage.getItem("userId") || "",
      DefaultLanguage: language,
      DefaultContentLength: lengthMap[lengthPref] || 1,
      AutoSaveDrafts: autoSave,
      IncludeSeoSuggestions: seoSuggestions,
      EnablePlagiarismCheck: plagiarismCheck,
    };

    saveLocalPrefs({
      language,
      lengthPref,
      autoSave,
      seoSuggestions,
      plagiarismCheck,
    });

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (rawToken) headers.Authorization = `Bearer ${rawToken}`;

      const res = await fetch(API.savePreferences, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await safeParse(res);

      if (res.ok) {
        setMessage("Preferences saved successfully!");
        window.dispatchEvent(new Event("preferencesUpdated"));
        setTimeout(() => setMessage(""), 6000);
        return;
      }

      if (res.status === 401) {
        setError(data?.message || "Unauthorized. Please login.");
        ["token", "accessToken"].forEach((k) => localStorage.removeItem(k));
        return;
      }

      if (res.status === 400) {
        const serverErrors = data?.errors || data?.ModelState || null;
        const formatted = formatValidationErrors(serverErrors);
        if (formatted) {
          setValidationErrors(serverErrors || {});
          setError(`Validation failed: ${formatted}`);
          return;
        }
        setError(data?.message || "Failed to save preferences (400).");
        return;
      }

      setError(data?.message || `Failed to save preferences (${res.status})`);
    } catch {
      setError("Network error while saving preferences.");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <SettingsLayout>
      <h3 className="settings-title">Content Preferences</h3>
      <p className="settings-description">
        Set your default preferences for content generation
      </p>

      {/* Language */}
      <div className="settings-input-group">
        <label className="settings-label">Default Language</label>
        <select
          className="settings-input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
        </select>
      </div>

      {/* Content Length */}
      <div className="settings-input-group">
        <label className="settings-label">Default Content Length</label>
        <select
          className="settings-input"
          value={lengthPref}
          onChange={(e) => setLengthPref(e.target.value)}
        >
          <option>Short (100-300 words)</option>
          <option>Medium (300-600 words)</option>
          <option>Long (600+ words)</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="settings-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={() => setAutoSave(!autoSave)}
          />
          Auto-save Drafts
        </label>
      </div>

      <div className="settings-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={seoSuggestions}
            onChange={() => setSeoSuggestions(!seoSuggestions)}
          />
          Include SEO Suggestions
        </label>
      </div>

      <div className="settings-toggle-row">
        <label>
          <input
            type="checkbox"
            checked={plagiarismCheck}
            onChange={() => setPlagiarismCheck(!plagiarismCheck)}
          />
          Enable Plagiarism Check
        </label>
      </div>

      <button
        className="settings-button"
        onClick={handleSave}
        disabled={loadingSave}
      >
        {loadingSave ? "Saving..." : "Save Preferences"}
      </button>

      {loadingGet && <p style={{ marginTop: 8 }}>Loading preferences...</p>}
      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      {message && <p style={{ color: "green", marginTop: 8 }}>{message}</p>}

      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <div style={{ marginTop: 12, color: "#b00" }}>
          <strong>Validation Errors:</strong>
          <ul>
            {Object.entries(validationErrors).map(([field, msgs]) => (
              <li key={field}>
                <strong>{field}:</strong>{" "}
                {Array.isArray(msgs) ? msgs.join("; ") : String(msgs)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SettingsLayout>
  );
};

export default Preferences;
