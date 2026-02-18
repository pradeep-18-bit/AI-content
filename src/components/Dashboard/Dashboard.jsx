import React, { useEffect, useState } from "react";

import HeroSection from "./HeroSection";

import FeaturesSection from "./FeaturesSection";

import HowItWorksSection from "./HowItWorksSection";

import TemplatesSection from "./TemplatesSection";

import TestimonialsSection from "./TestimonialsSection";

import Footer from "./Footer";

import AdditionalDetailsModal from "../AdditionalDetails/AdditionalDetailsModal.jsx";

import { profileStatus } from "../../services/userProfileApi";

import "../../App.css";
 
const ANALYTICS_START_URL =

  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Analytics/start";

const ANALYTICS_END_URL =

  "https://duncan-exclamatory-synaptically.ngrok-free.dev/api/Analytics/end";
 
/* ---------------------------------

   Helpers

---------------------------------- */

function readStoredUser() {

  try {

    const data = localStorage.getItem("currentUser");

    return data ? JSON.parse(data) : null;

  } catch {

    return null;

  }

}
 
function getUserKey(user) {

  return user?.id || user?.email;

}
 
function isProfileCompletedLocally(user) {

  const key = getUserKey(user);

  if (!key) return false;

  return localStorage.getItem(`profileCompleted_${key}`) === "true";

}
 
function markProfileCompletedLocally(user) {

  const key = getUserKey(user);

  if (!key) return;

  localStorage.setItem(`profileCompleted_${key}`, "true");

}
 
function isProfileModalShown(user) {

  const key = getUserKey(user);

  if (!key) return false;

  return localStorage.getItem(`profileModalShown_${key}`) === "true";

}
 
function markProfileModalShown(user) {

  const key = getUserKey(user);

  if (!key) return;

  localStorage.setItem(`profileModalShown_${key}`, "true");

}
 
/* ---------------------------------

   Component

---------------------------------- */

const Dashboard = () => {

  const [currentUser, setCurrentUser] = useState(() => readStoredUser());

  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);

  const [checkingProfile, setCheckingProfile] = useState(false);
 
  /* 🔄 Sync user after login/logout */

  useEffect(() => {

    const syncUser = () => {

      setCurrentUser(readStoredUser());

    };
 
    window.addEventListener("userLoggedIn", syncUser);

    window.addEventListener("storage", syncUser);
 
    return () => {

      window.removeEventListener("userLoggedIn", syncUser);

      window.removeEventListener("storage", syncUser);

    };

  }, []);
 
  /* 🔐 Profile check */

  useEffect(() => {

    if (!currentUser) return;
 
    if (isProfileModalShown(currentUser)) {

      setNeedsProfileUpdate(false);

      return;

    }
 
    if (isProfileCompletedLocally(currentUser)) {

      setNeedsProfileUpdate(false);

      return;

    }
 
    let cancelled = false;

    setCheckingProfile(true);
 
    (async () => {

      try {

        const res = await profileStatus();

        const completed =

          res?.isProfileCompleted ??

          res?.completed ??

          res?.profileCompleted ??

          false;
 
        if (!cancelled) {

          if (completed) {

            markProfileCompletedLocally(currentUser);

            setNeedsProfileUpdate(false);

          } else {

            setNeedsProfileUpdate(true);

          }

        }

      } catch {

        if (!cancelled) setNeedsProfileUpdate(true);

      } finally {

        if (!cancelled) setCheckingProfile(false);

      }

    })();
 
    return () => {

      cancelled = true;

    };

  }, [currentUser]);
 
  /* 📊 Analytics */

  useEffect(() => {

    if (!currentUser?.email) return;
 
    const sessionId =

      sessionStorage.getItem("sessionId") ||

      (() => {

        const id = "s_" + Math.random().toString(36).slice(2);

        sessionStorage.setItem("sessionId", id);

        return id;

      })();
 
    const headers = {

      "Content-Type": "application/json",

      Accept: "application/json",

      ...(localStorage.getItem("token")

        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }

        : {}),

    };
 
    fetch(ANALYTICS_START_URL, {

      method: "POST",

      headers,

      body: JSON.stringify({

        sessionId,

        userEmail: currentUser.email,

        page: "dashboard",

      }),

    }).catch(() => {});
 
    const end = () => {

      navigator.sendBeacon?.(

        ANALYTICS_END_URL,

        new Blob(

          [

            JSON.stringify({

              sessionId,

              userEmail: currentUser.email,

              page: "dashboard",

            }),

          ],

          { type: "application/json" }

        )

      );

    };
 
    window.addEventListener("beforeunload", end);

    return () => window.removeEventListener("beforeunload", end);

  }, [currentUser]);
 
  /* 🖥 Render */

  return (
<div className="dashboard-container">

      {/* Profile modal */}

      {currentUser && !checkingProfile && needsProfileUpdate && (
<AdditionalDetailsModal

          open={true}

          currentUser={currentUser}

          onClose={() => {

            markProfileModalShown(currentUser);

            setNeedsProfileUpdate(false);

          }}

        />

      )}
 
      {checkingProfile && currentUser && (
<div style={{ textAlign: "center", padding: 10 }}>

          Checking profile…
</div>

      )}
 
      {/* Dashboard content */}
<HeroSection />
<FeaturesSection />
<HowItWorksSection />
<TemplatesSection />
<TestimonialsSection />
<Footer />
</div>

  );

};
 
export default Dashboard;