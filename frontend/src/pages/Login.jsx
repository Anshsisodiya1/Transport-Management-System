import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/LoginShared.css";

import { MdDirectionsBus, MdSchool } from "react-icons/md";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { RiLoginBoxLine } from "react-icons/ri";
import { BsCardText } from "react-icons/bs";
import ForgotPasswordModal from "./ForgotPasswordModal";

function Login() {
  const [role, setRole] = useState("driver");
  const [email, setEmail] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const isStudent = role === "student";

  const roles = [
    { value: "driver",  label: "Driver",  Icon: MdDirectionsBus },
    { value: "student", label: "Student", Icon: MdSchool },
  ];

  const handleRoleSelect = (value) => {
    setRole(value);
    setError("");
    setEmail("");
    setEnrollmentNumber("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = isStudent
        ? { enrollmentNumber, password, role }
        : { email, password, role };

      const res = await axios.post("http://localhost:5000/api/auth/login", payload);
      const { token, role: userRole, user } = res.data;
      login(token, { ...user, role: userRole });
      if (userRole === "driver")  navigate("/driver-dashboard",  { replace: true });
      else if (userRole === "student") navigate("/student-dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rt-page">
      <div className="rt-shell">

        {/* ── Left panel — local route, stops along the way ── */}
        <div className="rt-panel">
          <div className="rt-panel-top">
            <div className="rt-mark">
              <img src="/logowhite.svg" alt="University Logo" />
            </div>
            <p className="rt-eyebrow">Driver &amp; Student Portal</p>
            <h1 className="rt-headline">
              Every stop,<br /><em>on time.</em>
            </h1>
            <p className="rt-desc">
              Track buses live, manage trips and never miss your ride across campus.
            </p>
          </div>

          <div className="rt-route">
            <div className="rt-route-track dashed">
              <div className="rt-route-fill" />
              <div className="rt-route-dot" />
            </div>
            <div className="rt-route-labels">
              <span>CAMPUS</span>
              <span>LOCAL</span>
            </div>
          </div>

          <div className="rt-panel-bottom">
            University Transport Management System
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="rt-form-side">
          <div className="rt-form-head">
            <h2 className="rt-form-title">Sign in to continue</h2>
            <p className="rt-form-sub">Select your role to get started.</p>
          </div>

          <div className="rt-role-row">
            {roles.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                className={`rt-role-btn ${role === value ? "active" : ""}`}
                onClick={() => handleRoleSelect(value)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <form className="rt-form" onSubmit={handleLogin} noValidate>
            {isStudent ? (
              <div className="rt-field">
                <label htmlFor="enrollmentNumber" className="rt-label">Enrollment number</label>
                <div className="rt-input-wrap">
                  <BsCardText className="rt-input-icon" size={15} />
                  <input
                    id="enrollmentNumber"
                    type="text"
                    className="rt-input"
                    placeholder="Enter your enrollment number"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
            ) : (
              <div className="rt-field">
                <label htmlFor="email" className="rt-label">Email address</label>
                <div className="rt-input-wrap">
                  <HiMail className="rt-input-icon" size={16} />
                  <input
                    id="email"
                    type="email"
                    className="rt-input"
                    placeholder="driver@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            <div className="rt-field">
              <label htmlFor="password" className="rt-label">Password</label>
              <div className="rt-input-wrap">
                <HiLockClosed className="rt-input-icon" size={16} />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="rt-input"
                  placeholder={isStudent ? "Same as your enrollment number" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="rt-eye"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="rt-row-between">
              <button
                type="button"
                className="rt-link-btn"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>

            {error && <p className="rt-error">{error}</p>}

            <button type="submit" className="rt-submit" disabled={loading}>
              {loading ? <span className="rt-spinner" /> : (<><RiLoginBoxLine size={16} /> Sign in</>)}
            </button>
          </form>

          {/* <p className="rt-footer-link">
            Administrator? <a href="/admin/login">Go to admin sign in</a>
          </p> */}
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

export default Login;