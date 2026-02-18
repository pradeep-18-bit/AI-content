 
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContentTypeSelector from "./ContentTypeSelector";
import ContentConfigForm from "./ContentConfigForm";
import { FaCopy } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import "../../App.css";
 
const API_BASE = "https://duncan-exclamatory-synaptically.ngrok-free.dev";
 
// 🔹 Read saved preferences
const getContentPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem("contentPreferences")) || {};
  } catch {
    return {};
  }
};
 
// 🔹 Map preference length → word count
const lengthPrefToWordCount = (lengthPref) => {
  switch (lengthPref) {
    case "Short (100-300 words)":
      return 100;
    case "Medium (300-600 words)":
      return 300;
    case "Long (600+ words)":
      return 600;
    default:
      return 500;
  }
};
 
const TONE_OPTIONS = ["Professional", "Engaging", "Persuasive"];
 
const DEFAULT_TONE_BY_TYPE = {
  "Blog Post": "Professional",
  "Email Copy": "Professional",
  "Social Media": "Engaging",
  "Ad Copy": "Persuasive",
};
 
 
export default function ContentGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const incomingTemplate = location.state?.template || null;
 
  const [template, setTemplate] = useState(incomingTemplate);
 
  const [contentType, setContentType] = useState("Blog Post");
  const [formData, setFormData] = useState({});
  const [tone, setTone] = useState("Professional");
  // ✅ MOVE THIS HERE (IMPORTANT)
  const [prefs, setPrefs] = useState(getContentPrefs());
 
  useEffect(() => {
    // ✅ If user saved tone in Preferences, DO NOT override
    if (prefs?.tone) return;
 
    const defaultTone = DEFAULT_TONE_BY_TYPE[contentType];
    if (defaultTone) {
      setTone(defaultTone);
    }
  }, [contentType, prefs?.tone]);
 
  const [wordCount, setWordCount] = useState(500);
 
  const [generatedContent, setGeneratedContent] = useState("");
  const outputRef = useRef(null);
  const plagiarismRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
 
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");
 
  const [usesUpdating, setUsesUpdating] = useState(false);
  const [usesMessage, setUsesMessage] = useState("");
  const [seoResult, setSeoResult] = useState(null);
 
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  // 🔁 Keep preferences in sync with Settings page
  useEffect(() => {
    const syncPrefs = () => {
      setPrefs(getContentPrefs());
    };
 
    window.addEventListener("preferencesUpdated", syncPrefs);
    window.addEventListener("storage", syncPrefs);
 
    return () => {
      window.removeEventListener("preferencesUpdated", syncPrefs);
      window.removeEventListener("storage", syncPrefs);
    };
  }, []);
 
  // 🔹 APPLY SAVED PREFERENCES ON LOAD
  // 🔹 APPLY SAVED PREFERENCES ON LOAD (ONLY when no template & no repost)
  useEffect(() => {
    if (incomingTemplate) return;
    if (localStorage.getItem("repostContent")) return;
 
    setTone(prefs.tone || "Professional");
    setWordCount(
      prefs.lengthPref
        ? lengthPrefToWordCount(prefs.lengthPref)
        : 500
    );
  }, [prefs, incomingTemplate]);
  // 🔹 RESTORE INPUT DRAFT (FORM DATA)
  // 🔹 RESTORE INPUT DRAFT (ONLY IF AUTO-SAVE ON)
  useEffect(() => {
    // ❌ Auto-save OFF → clear EVERYTHING
    if (prefs.autoSave === false) {
      localStorage.removeItem("draftFormData");
 
      setFormData({});
      setContentType("Blog Post");     // ✅ ADD
      setTone(prefs.tone || "Professional"); // ✅ ADD
      setWordCount(
        prefs.lengthPref
          ? lengthPrefToWordCount(prefs.lengthPref)
          : 500
      ); // ✅ ADD
 
      return;
    }
 
    // ✅ Auto-save ON → restore draft
    const raw = localStorage.getItem("draftFormData");
    if (!raw) return;
 
    try {
      const data = JSON.parse(raw);
 
      if (data.contentType) setContentType(data.contentType);
      // ❌ DO NOT override prefs tone & wordCount
      // if (data.tone) setTone(data.tone);
      // if (data.wordCount) setWordCount(data.wordCount);
 
      // ✅ only restore form fields + content type
      if (data.contentType) setContentType(data.contentType);
      if (data.formData) setFormData(data.formData);
      if (data.formData) setFormData(data.formData);
    } catch {
      // ignore
    }
  }, [prefs.autoSave]);
 
  // 🔹 LOAD SAVED DRAFT WHEN PAGE OPENS
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
 
        const res = await fetch(
          `${API_BASE}/api/editor/draft`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );
 
        if (!res.ok) return;
 
        const text = await res.text();
        if (!text) return; // 👈 no draft saved yet
 
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn("Draft response is not valid JSON");
          return;
        }
 
        if (data?.content) {
          setGeneratedContent("");
          setTimeout(() => setGeneratedContent(data.content), 100);
        }
      } catch (err) {
        console.error("Load draft failed", err);
      }
    };
 
    loadDraft();
  }, []);

  // 🔹 AUTO SAVE (after user stops typing for 3 seconds)
  useEffect(() => {
    if (!generatedContent) return;
    if (prefs.autoSave === false) return;
 
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
 
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
 
        await fetch(`${API_BASE}/api/editor/autosave`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
          body: generatedContent,
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 3000);
 
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [generatedContent, prefs.autoSave]);
 
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");       // Blog Post / Social Media / Ad Copy / Email Copy
    const templateFromUrl = searchParams.get("template"); // How-To Guide / Promo Post etc.
 
    // ✅ 1) Auto select content type
    if (typeFromUrl) {
      setContentType(typeFromUrl);
    }
 
    // ✅ 2) Prefill form fields based on template name
    if (templateFromUrl) {
      // Stop clearing fields (important)
      setIsTemplateLoaded(true);
 
      if (typeFromUrl === "Blog Post") {
        setFormData({
          title: templateFromUrl,
          keywords: templateFromUrl,
          outline: `Write a detailed blog post about ${templateFromUrl}`,
        });
      } else if (typeFromUrl === "Social Media") {
        setFormData({
          platform: "Instagram",
          hashtags: `#${templateFromUrl.replace(/\s+/g, "")}`,
          message: `Create an engaging post for: ${templateFromUrl}`,
        });
      } else if (typeFromUrl === "Ad Copy") {
        setFormData({
          product: templateFromUrl,
          audience: "Target audience",
          usp: `Problem + Solution based ad copy for ${templateFromUrl}`,
        });
      } else if (typeFromUrl === "Email Copy") {
        setFormData({
          subject: `Welcome Email - ${templateFromUrl}`,
          recipient: "New Users",
          body: `Write a welcome email for ${templateFromUrl}`,
        });
      }
 
      // ✅ Optional: also prefill tone + wordCount
      setTone("Professional");
      setWordCount(300);
    }
  }, [searchParams]);
 
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl) {
      setContentType(typeFromUrl);
    }
  }, [searchParams]);
 
  const handleCopy = async () => {
    if (!generatedContent) return;
 
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
 
    setTimeout(() => setCopied(false), 2000); // reset after 2s
  };
 
  const getTemplateId = (tpl) => {
    if (!tpl) return null;
    const raw = tpl?.id ?? tpl?.Id ?? tpl?.templateId ?? tpl?._id ?? null;
    return raw !== null && raw !== undefined ? String(raw) : null;
  };
 
  const getStoredToken = () => localStorage.getItem("token");
 
  const persistTemplateUpdateToStorage = (templateId, usesCount, ratingVal) => {
    try {
      const key = String(templateId);
      const raw = localStorage.getItem("template_updates") || "{}";
      const map = JSON.parse(raw);
      map[key] = {
        uses: usesCount,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("template_updates", JSON.stringify(map));
    } catch (e) {
      // ignore
    }
 
    try {
      window.dispatchEvent(
        new CustomEvent("updateTemplates", {
          detail: { templateId, uses: usesCount, rating: ratingVal ?? 0 },
        })
      );
    } catch {
      window.dispatchEvent(new Event("updateTemplates"));
    }
  };
 
  /**
   * recordTemplateUseOnServer
   * - Waits for server response before updating UI uses count.
   * - Returns true if server acknowledged (res.ok), false otherwise.
   * - If server returns uses count (JSON), uses that; otherwise increments current by 1 on success.
   */
  const recordTemplateUseOnServer = async (tpl) => {
    const templateId = getTemplateId(tpl);
    if (!templateId) return false;
 
    if (usesUpdating) return false;
    setUsesUpdating(true);
    setUsesMessage("");
 
    const currentUses = Number(tpl?.uses ?? tpl?.Uses ?? 0) || 0;
 
    const url = `${API_BASE}/api/Templates/use/${templateId}`;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "69420",
      ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
    };
 
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ usedAt: new Date().toISOString() }),
      });
 
      let body = null;
      try {
        const ct = res.headers.get?.("content-type") || "";
        if (ct.toLowerCase().includes("application/json")) body = await res.json().catch(() => null);
        else body = await res.text().catch(() => null);
      } catch {
        body = null;
      }
 
      if (res && res.ok) {
        // prefer server-provided uses count if available
        const serverUses =
          Number(
            body?.uses ??
            body?.Uses ??
            body?.usesCount ??
            body?.UsesCount ??
            body?.uses_total ??
            body?.UsesTotal
          ) || null;
 
        const finalUses = Number.isFinite(serverUses) ? serverUses : currentUses + 1;
 
        setTemplate((prev) => (prev ? { ...prev, uses: finalUses, Uses: finalUses } : { ...(tpl || {}), uses: finalUses, Uses: finalUses }));
        persistTemplateUpdateToStorage(templateId, finalUses, tpl?.rating ?? tpl?.Rating ?? rating);
        setUsesMessage("Usage recorded ✅");
        setUsesUpdating(false);
        return true;
      } else {
        console.warn("Use endpoint non-ok:", res && res.status, body);
        setUsesMessage("Recording failed (server).");
        setUsesUpdating(false);
        return false;
      }
    } catch (err) {
      console.error("Use API error:", err);
      setUsesMessage("Recording failed (network).");
      setUsesUpdating(false);
      return false;
    }
  };
  useEffect(() => {
    if (!template) return;
 
    const category =
      (template.Category ?? template.category ?? "").toLowerCase();
 
    const tags =
      Array.isArray(template.Tags)
        ? template.Tags.join(", ")
        : Array.isArray(template.tags)
          ? template.tags.join(", ")
          : template.Tags ?? template.tags ?? "";
 
    const title = template.Title ?? template.title ?? "";
    const description = template.Description ?? template.description ?? "";
 
    if (category.includes("blog")) {
      setContentType("Blog Post");
      setFormData({
        title,
        keywords: tags,
        outline: description,
      });
    } else if (category.includes("social")) {
      setContentType("Social Media");
      setFormData({
        platform: title,
        hashtags: tags,
        message: description,
      });
    } else if (category.includes("ad")) {
      setContentType("Ad Copy");
      setFormData({
        product: title,
        audience: tags,
        usp: description,
      });
    } else if (category.includes("email")) {
      setContentType("Email Copy");
      setFormData({
        subject: title,
        recipient: tags,
        body: description,
      });
    }
 
    setIsTemplateLoaded(true);
  }, [template]);
 
  useEffect(() => {
    const repost = localStorage.getItem("repostContent");
    if (repost) {
      try {
        const data = JSON.parse(repost);
        if (data.type) setContentType(data.type);
        if (data.tone) setTone(data.tone);
        if (data.wordCount) setWordCount(data.wordCount);
        setFormData({
          title: data.title || "",
          body: data.content || "",
        });
        localStorage.removeItem("repostContent");
      } catch (e) {
        // ignore
      }
    }
  }, []);
  const handleChange = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
 
      // ✅ save ONLY if auto-save is enabled
      if (prefs.autoSave !== false) {
        localStorage.setItem(
          "draftFormData",
          JSON.stringify({
            contentType,
            formData: updated,
            tone,
            wordCount,
          })
        );
      }
 
      return updated;
    });
  };
  useEffect(() => {
    if (!generatedContent) return;
 
    // ✅ STOP LOADING
    setIsGenerating(false);
 
    // ✅ SCROLL ONLY WHEN CONTENT IS READY
    setTimeout(() => {
      outputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [generatedContent]);
 
  useEffect(() => {
    if (!plagiarismResult) return;
 
    setTimeout(() => {
      plagiarismRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [plagiarismResult]);
  /**
   * handleGenerate
   * - Waits for server use-recording to succeed before updating uses in UI.
   * - If recording fails, shows message and does NOT change uses count.
   * - Then proceeds to generate content (placeholder logic).
   */

const mapContentTypeForApi = (type) => {
  switch (type) {
    case "Blog Post":
      return "Blog";
    case "Email Copy":
      return "Email";
    case "Social Media":
      return "SocialMedia";
    case "Ad Copy":
      return "AdCopy";
    default:
      return type;
  }
};


   const handleGenerate = async () => {
  setSeoResult(null);
  setPlagiarismResult(null);
  setGeneratedContent("");
  setIsGenerating(true);

  if (template) {
    setShowRating(true);
    setRatingSaved(false);
  }

  if (template && getTemplateId(template)) {
    const success = await recordTemplateUseOnServer(template);
    if (!success) {
      setIsGenerating(false);
      return;
    }
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/Content/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
  contentType: mapContentTypeForApi(contentType), // ✅ IMPORTANT
  tone,
  wordCount,
  inputs: formData,
}),

    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Generate failed:", err);
      setIsGenerating(false);
      return;
    }

    const data = await res.json();

    // ✅ backend returns html
   setGeneratedContent(
  data.html ||
  data.rawResponse ||
  ""
);


  } catch (err) {
    console.error("Generate error:", err);
    setIsGenerating(false);
  }

  window.dispatchEvent(new Event("updateTemplates"));
};

  const saveRating = async (value) => {
    if (!value || Number.isNaN(Number(value))) return;
    const numericValue = Number(value);
    const templateId = getTemplateId(template);
    if (!templateId) {
      setRatingMessage("No template to save rating for.");
      return;
    }
 
    setRating(numericValue);
    setHoverRating(0);
    setShowRating(false);
    setRatingSaved(false);
    setRatingSaving(true);
    setRatingMessage("");
 
    try {
      localStorage.setItem(
        "templateRating",
        JSON.stringify({
          templateId: String(templateId), // ✅ ALWAYS STRING
          rating: numericValue
        })
      );
      const stored = JSON.parse(localStorage.getItem("templates")) || [];
      const updatedStored = Array.isArray(stored)
        ? stored.map((t) =>
          (t.id || t.Id || t._id || t.templateId) == templateId
            ? { ...t, rating: Number(numericValue), averageRating: Number(numericValue) }
            : t
        )
        : stored;
      localStorage.setItem("templates", JSON.stringify(updatedStored));
      window.dispatchEvent(new Event("updateTemplates"));
    } catch (e) {
      // ignore
    }
 
    try {
      const res = await fetch(`${API_BASE}/api/Templates/rate/${templateId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "69420",
          ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
        },
        body: JSON.stringify({ rating: numericValue }),
      });
 
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const serverRating = data?.rating ?? data?.Rating ?? numericValue;
        setRating(Number(serverRating));
        setTemplate((prev) =>
          prev
            ? {
              ...prev,
              rating: Number(serverRating),
              Rating: Number(serverRating),
              averageRating: Number(serverRating),
              AverageRating: Number(serverRating),
            }
            : prev
        );
        setRatingSaved(true);
        setRatingSaving(false);
        setRatingMessage("Rating saved ✅");
        try {
          localStorage.setItem(
            "templateRating",
            JSON.stringify({
              templateId: String(templateId), // ✅ ALWAYS STRING
              rating: numericValue
            })
          );
          const stored2 = JSON.parse(localStorage.getItem("templates")) || [];
          const updatedStored2 = Array.isArray(stored2)
            ? stored2.map((t) =>
              (t.id || t.Id || t._id || t.templateId) == templateId
                ? { ...t, rating: Number(serverRating), averageRating: Number(serverRating) }
                : t
            )
            : stored2;
          localStorage.setItem("templates", JSON.stringify(updatedStored2));
          window.dispatchEvent(new Event("updateTemplates"));
        } catch { }
        return;
      } else {
        const txt = await res.text().catch(() => null);
        console.warn("Rating endpoint non-ok:", res.status, txt);
      }
    } catch (err) {
      console.warn("Rating network error:", err);
    }
 
    setRatingSaved(true);
    setRatingSaving(false);
    setRatingMessage("Saved locally (server sync failed).");
  };
  // 🔹 SEO SUGGESTIONS (STRUCTURED)
  const getSeoSuggestions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !generatedContent) return;
 
      const res = await fetch(`${API_BASE}/api/editor/seo-suggestions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
          "ngrok-skip-browser-warning": "69420",
        },
        body: generatedContent,
      });
 
      if (!res.ok) {
        console.error("SEO failed:", res.status);
        return;
      }
 
      const raw = await res.text();
 
      const normalized = {
        keywords: [],
        headings: [],
        improvements: [],
      };
 
      try {
        const parsed = JSON.parse(raw);
        const source = parsed.suggestions ?? parsed;
 
        normalized.keywords = source.keywords || [];
        normalized.headings = source.headings || [];
        normalized.improvements = source.improvements || [];
      } catch {
        const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
        let current = null;
 
        lines.forEach(line => {
          const l = line.toLowerCase();
          if (l.includes("keyword")) current = "keywords";
          else if (l.includes("heading")) current = "headings";
          else if (l.includes("improvement")) current = "improvements";
          else if ((line.startsWith("-") || line.startsWith("•")) && current) {
            normalized[current].push(line.replace(/^[-•]\s*/, ""));
          }
        });
      }
 
      setSeoResult(normalized);
    } catch (err) {
      console.error("SEO check failed", err);
    }
  };
  // 🔹 PLAGIARISM CHECK
  const checkPlagiarism = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !generatedContent) return;
 
      const res = await fetch(`${API_BASE}/api/editor/plagiarism-check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain", // ✅ FIX
          "ngrok-skip-browser-warning": "69420",
        },
        body: generatedContent, // ✅ RAW TEXT
      });
 
      if (!res.ok) {
        console.error("Plagiarism failed:", res.status);
        return;
      }
 
      const data = await res.json();
 
      setPlagiarismResult({
        percentage: data.plagiarismPercentage,
        message: data.message,
      });
    } catch (err) {
      console.error("Plagiarism check failed", err);
    }
  };
 
  const tagList = Array.isArray(template?.tags)
    ? template.tags
    : typeof template?.tags === "string" && template?.tags.trim() !== ""
      ? template.tags.split(",").map((t) => t.trim())
      : Array.isArray(template?.Tags)
        ? template.Tags
        : typeof template?.Tags === "string"
          ? template.Tags.split(",").map((t) => t.trim())
          : [];
 
  return (
    <div className="generator-container">
      <div className="header-card">
        <h2>Generate Content</h2>
        <p>Create amazing content with the power of AI</p>
 
        <div className="generator-grid">
          <ContentTypeSelector
            contentType={contentType}
            setContentType={(type) => {
              setContentType(type);
              if (!isTemplateLoaded) setFormData({});
            }}
          />
 
          <ContentConfigForm
  contentType={contentType}
  formData={formData}
  tone={tone}
  wordCount={wordCount}
  onChange={handleChange}
  setTone={setTone}
  setWordCount={setWordCount}
  setGeneratedContent={setGeneratedContent}
  usesUpdating={usesUpdating}
  isGenerating={isGenerating}
  onGenerate={handleGenerate}
  allowedTones={TONE_OPTIONS}   // ✅ ADD THIS
/>

        </div>
 
        {generatedContent && (
          <div
            ref={outputRef}
            className="generated-output"
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              position: "relative",
              border: "2px solid #2e397a",
            }}
          >
 
            <h3>✨ Generated {contentType}</h3>
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                fontSize: "13px",
                color: copied ? "#22c55e" : "inherit",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy"}
            </div>
            <div
  className="generated-text"
  style={{ minHeight: "40px" }}
  dangerouslySetInnerHTML={{ __html: generatedContent }}
/>

            {/* ✅ ADD BUTTONS HERE */}
            <div style={{ marginTop: 15, display: "flex", gap: 20 }}>
              <button
                className="action-btn"
                onClick={getSeoSuggestions}
                disabled={prefs.seoSuggestions === false}
              >
                🔍 SEO Suggestions
              </button>
 
              <button
                className="action-btn"
                onClick={checkPlagiarism}
                disabled={prefs.plagiarismCheck === false}
              >
                🧪 Plagiarism Check
              </button>
            </div>
            {seoResult && (
              <div
                className="seo-box"
                style={{
                  marginTop: 15,
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                {typeof seoResult === "string" ? (
                  <p>{seoResult}</p>
                ) : (
                  <>
                    <h4>🔑 Keywords</h4>
                    <ul>
                      {seoResult.keywords?.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
 
                    <h4>🧱 Suggested Headings</h4>
                    <ul>
                      {seoResult.headings?.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
 
                    <h4>✨ Improvements</h4>
                    <ul>
                      {seoResult.improvements?.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {plagiarismResult && (
              <div
                ref={plagiarismRef}
                className="plagiarism-box"
                style={{
                  marginTop: 15,
                  padding: 12,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                🧪 Plagiarism Result<br />
                Plagiarism: {plagiarismResult.percentage}%<br />
                {plagiarismResult.message}
              </div>
            )}
            {showRating && !ratingSaved && (
              <div style={{ marginTop: "20px" }}>
                <strong style={{ fontSize: "18px" }}>Rate this content: </strong>
 
                {[1, 2, 3, 4, 5].map((num) => (
                  <span
                    key={num}
                    onClick={() => {
                      if (!ratingSaving) saveRating(num);
                    }}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      cursor: ratingSaving ? "not-allowed" : "pointer",
                      fontSize: "26px",
                      color: (hoverRating ? hoverRating : rating) >= num ? "#facc15" : "#ccc",
                      marginRight: 6,
                      opacity: ratingSaving ? 0.6 : 1,
                      userSelect: "none",
                    }}
                    aria-hidden
                  >
                    ★
                  </span>
                ))}
 
                {ratingSaving && (
                  <div style={{ marginTop: 8 }}>
                    <small>Saving rating...</small>
                  </div>
                )}
                {ratingMessage && !ratingSaving && (
                  <div style={{ marginTop: 8 }}>
                    <small>{ratingMessage}</small>
                  </div>
                )}
              </div>
            )}
            {ratingSaved && (
              <p style={{ marginTop: "15px", color: "#16a34a", fontSize: "17px" }}>✓ Rating saved successfully!</p>
            )}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: template ? "space-between" : "flex-end",
                fontWeight: "600",
              }}
            >
              {template && (
                <span
                  onClick={() => navigate("/template-library")}
                  style={{ cursor: "pointer", color: "#4B6BFB" }}
                >
                  ← Back to Templates
                </span>
              )}
 
              <span
                onClick={() => navigate("/content-history")}
                style={{ cursor: "pointer", color: "#4B6BFB" }}
              >
                Go to Content History →
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
