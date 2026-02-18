import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Pricing.css";

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const activeStyle = {
    border: "2px solid #2e397a",
    boxShadow: "0 12px 30px rgba(46,57,122,0.25)",
    transform: "scale(1.04)",
  };

  return (
    <div className="pricing-container">
      <div className="pricing-wrapper">

        <h2 className="pricing-title">Simple, Transparent Pricing</h2>
        <p className="pricing-subtitle">
          Choose the perfect plan for your content generation needs. Start free and scale as you grow
        </p>

        <div className="pricing-cards">

          {/* FREE */}
          <div
            className="pricing-card"
            style={selectedPlan === "free" ? activeStyle : {}}
            onClick={() => setSelectedPlan("free")}
          >
            <h3>Free</h3>
            <p className="plan-price">
              Free <span>/forever</span>
            </p>

            <p className="plan-description">
              Perfect for trying out AI-generated content
            </p>

            <button className="btn btn-free">Get Started Free</button>

            <ul>
              <li>5 content generations per month</li>
              <li>Basic templates</li>
              <li>Blog posts & social media</li>
              <li>Email support</li>
              <li>Basic analytics</li>
            </ul>
          </div>

          {/* PRO */}
          <div
            className="pricing-card popular"
            style={selectedPlan === "pro" ? activeStyle : {}}
            onClick={() => setSelectedPlan("pro")}
          >
            <div className="badge">Most Popular</div>

            <h3>Professional</h3>
            <p className="plan-price">
              $29 <span>/per month</span>
            </p>

            <p className="plan-description">
              Ideal for content creators and small teams
            </p>

            <button className="btn btn-pro">Start Pro Trial</button>

            <ul>
              <li>Unlimited content generation</li>
              <li>Premium templates library</li>
              <li>All content types</li>
              <li>Priority email support</li>
              <li>Advanced analytics</li>
            </ul>
          </div>

          {/* ENTERPRISE */}
          <div
            className="pricing-card"
            style={selectedPlan === "enterprise" ? activeStyle : {}}
            onClick={() => setSelectedPlan("enterprise")}
          >
            <h3>Enterprise</h3>
            <p className="plan-price">
              $99 <span>/per month</span>
            </p>

            <p className="plan-description">
              For large teams and businesses
            </p>

            <button className="btn btn-enterprise">Contact Sales</button>

            <ul>
              <li>Everything in Professional</li>
              <li>Unlimited team members</li>
              <li>Custom templates</li>
              <li>API access</li>
              <li>Dedicated account manager</li>
              <li>Priority phone support</li>
              <li>Custom integrations</li>
              <li>Advanced security features</li>
              <li>White-label options</li>
              <li>Custom AI model training</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Pricing;