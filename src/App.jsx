// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
 
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
 
/* Admin */
import AdminDashboardHome from "./components/AdminDashboard/AdminDashboardHome.jsx";
import AdminLayout from "./components/AdminDashboard/AdminLayout.jsx";
import AdminAnalyticsDashboard from "./components/AdminDashboard/AdminAnalyticsDashboard.jsx";
import AdminUsersData from "./components/AdminDashboard/AdminUsersData.jsx";
import AdminHistory from "./components/AdminDashboard/AdminHistory.jsx";
import AdminContentGenerator from "./components/AdminDashboard/AdminContentGenerator.jsx";
import AdminContentHistory from "./components/AdminDashboard/AdminContentHIstory.jsx";
import AdminProfile from "./components/AdminDashboard/AdminProfile.jsx";
 
/* Auth */
import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import SetNewPassword from "./components/SetNewPassword.jsx";
import VerifyOtp from "./components/VerifyOtp.jsx";
 
/* ADD THIS */
import AdminLogin from "./components/AdminAuth/AdminLogin.jsx";
 
/* User Features */
import ContentGenerator from "./components/ContentGenerator/ContentGenerator.jsx";
import TemplateLibrary from "./components/TemplateLibrary/TemplateLibrary.jsx";
import TemplateDetail from "./components/TemplateLibrary/TemplateDetail.jsx";
import TemplateEdit from "./components/TemplateLibrary/TemplateEdit.jsx";
import CreateTemplate from "./components/CreateTemplate/CreateTemplate.jsx";
import ContentHistory from "./components/ContentHistory/ContentHistory.jsx";
import Pricing from "./components/Pricing/Pricing.jsx";
 
/* Settings */
import Profile from "./components/Profile";
import Preferences from "./components/Preferences";
import Notifications from "./components/Notifications";
import Security from "./components/Security";
import Billing from "./components/Billing";
import Api from "./components/API";
 
/* Profile modal */
import AdditionalDetailsModal from "./components/AdditionalDetails/AdditionalDetailsModal.jsx";
import { profileStatus } from "./services/userProfileApi.js";
 
import "./App.css";
 
/* ---------------------------------
   AUTH GUARD (used for all features)
----------------------------------*/
const RequireAuth = ({ children, allowedRole }) => {
  let user = null;
 
  try {
    const raw = localStorage.getItem("currentUser");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }
 
  // 🔴 Not logged in
  if (!user) {
    if (allowedRole === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
 
  // 🔴 Logged in but wrong role
  if (allowedRole && user.role !== allowedRole) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/dashboard" replace />;
  }
 
  return children;
};
 
/* ---------------------------------
   APP WRAPPER
----------------------------------*/
const AppWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 🌙 ADD THIS BLOCK (RIGHT HERE)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  // 🌙 APPLY DARK MODE CLASS TO HTML
  useEffect(() => {
    const html = document.documentElement;
 
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
 
    localStorage.setItem("theme", theme);
  }, [theme]);
 
  const hideNavbar =
    [
      "/login",
      "/register",
      "/reset-password",
      "/verify-otp",
      "/set-new-password",
      "/admin/login",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/admin");
 
  const [templates, setTemplates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("templates")) || [];
    } catch {
      return [];
    }
  });
 
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });
 
  /* Sync user across tabs */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "currentUser") {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setCurrentUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage);
  }, []);
 
  /* -------------------------------
     Profile status check
  --------------------------------*/
  const prevUserIdRef = useRef(null);
  const checkingRef = useRef(false);
 
  useEffect(() => {
    if (
      !currentUser ||
      checkingRef.current ||
      location.pathname !== "/dashboard"
    ) {
      return;
    }
    const currentId = currentUser.id || currentUser.email;
    if (prevUserIdRef.current === currentId) return;
 
    checkingRef.current = true;
 
    profileStatus()
      .then((res) => {
        if (res?.unauthorized) {
          localStorage.clear();
          setCurrentUser(null);
          navigate("/login", { replace: true });
          return;
        }
 
        const needsProfileUpdate =
          res?.needsProfileUpdate || res?.needsProfile || false;
 
        const updated = { ...currentUser, needsProfileUpdate };
        localStorage.setItem("currentUser", JSON.stringify(updated));
        setCurrentUser(updated);
 
        prevUserIdRef.current = currentId;
      })
      .catch(() => { })
      .finally(() => {
        checkingRef.current = false;
      });
  }, [currentUser, navigate]);
 
  /* -------------------------------
     Profile modal logic
  --------------------------------*/
  const getPromptKey = (user) =>
    `profilePromptShown:${user?.id || user?.email}`;
 
  const [profilePromptShown, setProfilePromptShown] = useState(false);
 
  useEffect(() => {
    if (!currentUser) return;
    const key = getPromptKey(currentUser);
    setProfilePromptShown(!!localStorage.getItem(key));
  }, [currentUser]);
 
  const modalOpen =
    currentUser &&
    (currentUser.needsProfileUpdate || !currentUser.hasDetails) &&
    !profilePromptShown &&
    location.pathname === "/dashboard";
 
  const handleModalClose = () => {
    const key = getPromptKey(currentUser);
    localStorage.setItem(key, "1");
 
    const updated = {
      ...currentUser,
      hasDetails: true,
      needsProfileUpdate: false,
    };
 
    localStorage.setItem("currentUser", JSON.stringify(updated));
    setCurrentUser(updated);
  };
 
  const addTemplate = (template) => {
    const updated = [...templates, template];
    setTemplates(updated);
    localStorage.setItem("templates", JSON.stringify(updated));
  };
 
  return (
    <>
      {!hideNavbar && <Navbar theme={theme} setTheme={setTheme} />}
 
      <div style={{ marginTop: hideNavbar ? 0 : 70 }}>
        <AdditionalDetailsModal
          open={modalOpen}
          onClose={handleModalClose}
          currentUser={currentUser}
        />
 
        <Routes>
          {/* DEFAULT */}
         <Route path="/" element={<Navigate to="/dashboard" replace />} />
 
          {/* PUBLIC DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />
 
          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
 
          {/* ADD THIS */}
          <Route path="/admin/login" element={<AdminLogin />} />
 
          {/* USER FEATURES (LOGIN REQUIRED) */}
          <Route
            path="/content-generator"
            element={
              <RequireAuth>
                <ContentGenerator />
              </RequireAuth>
            }
          />
          <Route
            path="/template-library"
            element={
              <RequireAuth>
                <TemplateLibrary templates={templates} />
              </RequireAuth>
            }
          />
          <Route
            path="/template/:id"
            element={
              <RequireAuth>
                <TemplateDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/template-edit/:id"
            element={
              <RequireAuth>
                <TemplateEdit />
              </RequireAuth>
            }
          />
          <Route
            path="/create-template"
            element={
              <RequireAuth>
                <CreateTemplate addTemplate={addTemplate} />
              </RequireAuth>
            }
          />
          <Route
            path="/content-history"
            element={
              <RequireAuth>
                <ContentHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/pricing"
            element={
              <RequireAuth>
                <Pricing key={window.location.search} />
              </RequireAuth>
            }
          />
 
 
          {/* SETTINGS */}
          <Route path="/settings/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/settings/preferences" element={<RequireAuth><Preferences /></RequireAuth>} />
          <Route path="/settings/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/settings/security" element={<RequireAuth><Security /></RequireAuth>} />
          <Route path="/settings/billing" element={<RequireAuth><Billing /></RequireAuth>} />
          <Route path="/settings/api" element={<RequireAuth><Api /></RequireAuth>} />
 
          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <RequireAuth allowedRole="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboardHome />} />
            <Route path="analytics" element={<AdminAnalyticsDashboard />} />
            <Route path="content-generator" element={<AdminContentGenerator />} />
            <Route path="content-history" element={<AdminContentHistory />} />
            <Route path="users" element={<AdminUsersData />} />
            <Route path="history" element={<AdminHistory />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
 
          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};
 
/* ROOT */
const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);
 
export default App;