import React, { useEffect, useState, useRef } from "react";
import SettingsLayout from "../SettingsLayout";
import "../SettingsLayout.css";
const DEFAULTS = {
  email: true,
  contentComplete: true,
  weeklySummary: true,
  newTemplate: false,
  usageLimit: true,
  productUpdates: false,
};

export default function Notifications() {
  const apiUrl =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/NotificationSettings";

  const WEEKLY_SUMMARY_API =
    "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/GeneratedContent/weekly-summary";

  const effectiveToken =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    null;

  const [email, setEmail] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [newTemplate, setNewTemplate] = useState(false);
  const [usageLimit, setUsageLimit] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [contentComplete, setContentComplete] = useState(true);
  const [statusType, setStatusType] = useState(null);
  const toBool = (value, fallback) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const v = value.toLowerCase();
      if (["true", "1", "yes"].includes(v)) return true;
      if (["false", "0", "no"].includes(v)) return false;
    }
    if (typeof value === "number") return value === 1;
    if (value == null) return fallback;
    return !!value;
  };

  const makePayload = () => ({
    emailNotifications: email,
    contentGenerationComplete: contentComplete,
    weeklySummary: weeklySummary,
    newTemplateAlerts: newTemplate,
    usageLimitWarnings: usageLimit,
    productUpdates: productUpdates,
  });

  const successTimeoutRef = useRef(null);

  const showStatus = (msg, type = null) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }

    setStatus(msg);
    setStatusType(type);

    if (type === "success") {
      successTimeoutRef.current = setTimeout(() => {
        setStatus(null);
        setStatusType(null);
      }, 5000);
    }
  };

  const buildOpts = (method = "GET", body = null) => {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
    };

    if (effectiveToken) {
      headers["Authorization"] = `Bearer ${effectiveToken}`;
    }

    return {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };
  };

  const fetchWeeklySummary = async () => {
    try {
      const res = await fetch(WEEKLY_SUMMARY_API, buildOpts("GET"));

      if (!res.ok) {
        console.error("Weekly summary failed");
        return;
      }

      const data = await res.json();
      console.log("Weekly Summary:", data);

      showStatus("Weekly summary enabled & fetched", "success");
    } catch (err) {
      console.error("Weekly summary error:", err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (!effectiveToken) {
      showStatus("Unauthorized — Please log in", "error");
      return;
    }

    setLoading(true);

    (async () => {
      try {
        const res = await fetch(apiUrl, {
          ...buildOpts("GET"),
          signal: controller.signal,
        });

        const text = await res.text();
        const parsed = text ? JSON.parse(text) : {};
        const data = parsed.data ?? parsed;

        if (res.status === 401) {
          showStatus("Unauthorized — token expired or invalid", "error");
          return;
        }
        setEmail(
          toBool(
            data.emailNotifications ??
            data.EmailNotifications,
            DEFAULTS.email
          )
        );

        setContentComplete(
          toBool(
            data.contentGenerationComplete ??
            data.ContentGenerationComplete ??
            data.contentUpdates,
            DEFAULTS.contentComplete
          )
        );

        setWeeklySummary(
          toBool(
            data.weeklySummary ??
            data.WeeklySummary,
            DEFAULTS.weeklySummary
          )
        );

        setNewTemplate(
          toBool(
            data.newTemplateAlerts ??
            data.NewTemplateAlerts ??
            data.newTemplate ??
            data.templateAlerts,
            DEFAULTS.newTemplate
          )
        );

        setUsageLimit(
          toBool(
            data.usageLimitWarnings ??
            data.UsageLimitWarnings,
            DEFAULTS.usageLimit
          )
        );

        setProductUpdates(
          toBool(
            data.productUpdates ??
            data.ProductUpdates,
            DEFAULTS.productUpdates
          )
        );
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Load settings error:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [apiUrl, effectiveToken]);

  // SAVE SETTINGS
  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    const payload = makePayload();
    const opts = buildOpts("POST", payload);

    try {
      const res = await fetch(apiUrl, opts);

      if (!res.ok) {
        if (res.status === 401) {
          showStatus("Unauthorized — please login again", "error");
          return;
        }
        showStatus("Failed to save settings — backend error", "error");
        return;
      }

      showStatus("Settings saved successfully", "success");
    } catch (err) {
      showStatus("Unable to save settings: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Rows WITHOUT contentComplete
  const rows = [
    { label: "Email Notifications", checked: email, set: setEmail },

    {
      label: "Content Generation Complete",
      checked: contentComplete,
      set: setContentComplete,
    },

    { label: "Weekly Summary", checked: weeklySummary, set: setWeeklySummary },
    { label: "New Template Alerts", checked: newTemplate, set: setNewTemplate },
    { label: "Usage Limit Warnings", checked: usageLimit, set: setUsageLimit },
    { label: "Product Updates", checked: productUpdates, set: setProductUpdates },
  ];

  return (
    <SettingsLayout>
      <div className="notif_container">
        <h3 className="notif_heading">Notification Settings</h3>
        <p className="notif_subheading">
          Choose what notifications you want to receive
        </p>

        {/* Render Toggle Rows */}
        {rows.map((row) => (
          <div key={row.label} className="notif_row">
            <div>
              <strong>{row.label}</strong>
            </div>
            <label className="notif_switch">
              <input
                type="checkbox"
                checked={row.checked}
                disabled={saving || loading}
                onChange={() => {
                  const newValue = !row.checked;
                  row.set(newValue);

                  if (row.label === "Weekly Summary" && newValue === true) {
                    fetchWeeklySummary();
                  }
                }}
              />
              <span className="notif_slider"></span>
            </label>

          </div>
        ))}

        <button
          className="notif_button"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 10 }}
        >
          {saving ? "Saving..." : "Save Notification Settings"}
        </button>

        {status && (
          <p
            style={{
              marginTop: 10,
              color:
                statusType === "success"
                  ? "green"
                  : statusType === "error"
                    ? "red"
                    : "inherit",
            }}
          >
            {status}
          </p>
        )}
      </div>
    </SettingsLayout>
  );
}
