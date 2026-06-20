import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/LoginShared.css";

import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import { RiLoginBoxLine } from "react-icons/ri";
import ForgotPasswordModal from "./ForgotPasswordModal";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email, password, role: "admin",
      });
      const { token, role: userRole, user } = res.data;
      login(token, { ...user, role: userRole });
      navigate("/admin-dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rt-page">
      <div>
        <div className="rt-shell">

          {/* ── Letterhead ── */}
          <div className="rt-letterhead">
            <div className="rt-crest">
              <img src="/logowhite.svg" alt="University Logo" />
            </div>
            <div className="rt-uni-name">Renaissance University</div>
            <div className="rt-uni-loc">Indore, Madhya Pradesh</div>
            <div className="rt-rule" />
            <div className="rt-dept-name">Transport Management System</div>
            <div className="rt-dept-sub">Administrator Portal</div>
          </div>

          {/* ── Body ── */}
          <div className="rt-body">
            <div className="rt-form-head">
              <h2 className="rt-form-title">Administrator Sign In</h2>
              <p className="rt-form-sub">Access is restricted to authorised university staff.</p>
            </div>

            <form className="rt-form" onSubmit={handleLogin} noValidate>
              <div className="rt-field">
                <label htmlFor="email" className="rt-label">Email Address<span className="req">*</span></label>
                <div className="rt-input-wrap">
                  <HiMail className="rt-input-icon" size={16} />
                  <input
                    id="email"
                    type="email"
                    className="rt-input"
                    placeholder="admin@renaissance.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="rt-field">
                <label htmlFor="password" className="rt-label">Password<span className="req">*</span></label>
                <div className="rt-input-wrap">
                  <HiLockClosed className="rt-input-icon" size={16} />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="rt-input"
                    placeholder="Enter your password"
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
                <button type="button" className="rt-link-btn" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
              </div>

              {error && <p className="rt-error">{error}</p>}

              <button type="submit" className="rt-submit" disabled={loading}>
                {loading ? <span className="rt-spinner" /> : (<><RiLoginBoxLine size={15} /> Sign In</>)}
              </button>
            </form>

            <p className="rt-footer-link">
              Not an administrator? <a href="/login">Driver / Student sign in</a>
            </p>
          </div>
        </div>

        <p className="rt-page-footer">
          © {new Date().getFullYear()} Renaissance University, Indore · Transport Management System
        </p>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}

export default AdminLogin;