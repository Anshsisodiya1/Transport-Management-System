import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

import { MdAdminPanelSettings, MdDirectionsBus, MdSchool } from "react-icons/md";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { RiLoginBoxLine } from "react-icons/ri";
import { TbBusStop } from "react-icons/tb";

function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const roles = [
    { value: "admin",   label: "Admin",   Icon: MdAdminPanelSettings },
    { value: "driver",  label: "Driver",  Icon: MdDirectionsBus },
    { value: "student", label: "Student", Icon: MdSchool },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) { setError("Please select a role to continue."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email, password, role,
      });
      const { token, role: userRole, user } = res.data;
      login(token, { ...user, role: userRole });
      if (userRole === "admin")        navigate("/admin-dashboard",   { replace: true });
      else if (userRole === "driver")  navigate("/driver-dashboard",  { replace: true });
      else if (userRole === "student") navigate("/student-dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      {/* subtle background pattern */}
      <div className="lg-bg" aria-hidden="true" />

      <div className="lg-card">

        {/* ── Header ── */}
        <div className="lg-header">
          <div className="lg-logo-ring">
            <img src="/logowhite.svg" alt="University Logo" className="lg-logo" />
          </div>
          <h1 className="lg-title">University Transport</h1>
          <p className="lg-subtitle">Route &amp; Tracking Management System</p>
          <p className="lg-tagline">
            <TbBusStop size={13} />
            Safe journeys, every day.
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="lg-divider" />

        {/* ── Role selector ── */}
        <div className="lg-section">
          <p className="lg-section-label">Sign in as</p>
          <div className="lg-role-row">
            {roles.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                className={`lg-role-btn ${role === value ? "active" : ""}`}
                onClick={() => { setRole(value); setError(""); }}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleLogin}
          className={`lg-form ${role ? "visible" : ""}`}
          noValidate
        >
          {/* Email */}
          <div className="lg-field">
            <label htmlFor="email" className="lg-label">Email Address</label>
            <div className="lg-input-wrap">
              <HiMail className="lg-input-icon" size={17} />
              <input
                id="email"
                type="email"
                className="lg-input"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="lg-field">
            <label htmlFor="password" className="lg-label">Password</label>
            <div className="lg-input-wrap">
              <HiLockClosed className="lg-input-icon" size={16} />
              <input
                id="password"
                type={showPass ? "text" : "password"}
                className="lg-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPass ? <HiEyeOff size={17} /> : <HiEye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="lg-error">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className={`lg-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="lg-spinner" />
            ) : (
              <>
                <RiLoginBoxLine size={17} />
                Sign In
              </>
            )}
          </button>
        </form>

        {!role && (
          <p className="lg-hint">↑ Select your role to continue</p>
        )}

        {/* ── Footer ── */}
        <p className="lg-footer">
          Secure Access · University Transport Management System
        </p>
      </div>
    </div>
  );
}

export default Login;