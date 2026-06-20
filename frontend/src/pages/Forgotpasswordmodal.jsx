import { useState } from "react";
import axios from "axios";
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiX, HiOutlineKey } from "react-icons/hi";

const API_BASE = "http://localhost:5000/api/auth";

/**
 * Role-independent Forgot Password flow.
 * Works for admin, driver AND student — all accounts are matched by email
 * on the backend (forgotPassword / verifyOtp / resetPassword), regardless
 * of how the person normally logs in (email vs enrollment number).
 *
 * Usage:
 *   const [showForgot, setShowForgot] = useState(false);
 *   <button onClick={() => setShowForgot(true)}>Forgot password?</button>
 *   {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
 */
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password, 4 = done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/verify-otp`, { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/reset-password`, {
        email, otp, newPassword, confirmPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rt-modal-overlay" onClick={onClose}>
      <div className="rt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rt-modal-head">
          <h3 className="rt-modal-title">Reset password</h3>
          <button className="rt-modal-close" onClick={onClose} aria-label="Close">
            <HiX size={20} />
          </button>
        </div>
        <p className="rt-modal-sub">
          {step === 1 && "Enter the email linked to your account. We'll send a one-time code."}
          {step === 2 && `Enter the 6-digit code sent to ${email}.`}
          {step === 3 && "Choose a new password for your account."}
          {step === 4 && "Your password has been updated."}
        </p>

        {step < 4 && (
          <div className="rt-step-indicator">
            <span className={`rt-step-dot ${step >= 1 ? "done" : ""}`} />
            <span className={`rt-step-dot ${step >= 2 ? "done" : ""}`} />
            <span className={`rt-step-dot ${step >= 3 ? "done" : ""}`} />
          </div>
        )}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form className="rt-modal-form" onSubmit={handleSendOtp}>
            <div className="rt-field">
              <label className="rt-label" htmlFor="fp-email">Email address</label>
              <div className="rt-input-wrap">
                <HiMail className="rt-input-icon" size={16} />
                <input
                  id="fp-email"
                  type="email"
                  className="rt-input"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="rt-error">{error}</p>}
            <button type="submit" className="rt-submit accent" disabled={loading}>
              {loading ? <span className="rt-spinner" /> : "Send code"}
            </button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form className="rt-modal-form" onSubmit={handleVerifyOtp}>
            <div className="rt-field">
              <label className="rt-label" htmlFor="fp-otp">Verification code</label>
              <div className="rt-input-wrap">
                <HiOutlineKey className="rt-input-icon" size={16} />
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="rt-input"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </div>
            </div>
            {error && <p className="rt-error">{error}</p>}
            <button type="submit" className="rt-submit accent" disabled={loading}>
              {loading ? <span className="rt-spinner" /> : "Verify code"}
            </button>
            <button
              type="button"
              className="rt-link-btn"
              style={{ alignSelf: "center" }}
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 3 — New password */}
        {step === 3 && (
          <form className="rt-modal-form" onSubmit={handleResetPassword}>
            <div className="rt-field">
              <label className="rt-label" htmlFor="fp-new">New password</label>
              <div className="rt-input-wrap">
                <HiLockClosed className="rt-input-icon" size={16} />
                <input
                  id="fp-new"
                  type={showPass ? "text" : "password"}
                  className="rt-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
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
            <div className="rt-field">
              <label className="rt-label" htmlFor="fp-confirm">Confirm password</label>
              <div className="rt-input-wrap">
                <HiLockClosed className="rt-input-icon" size={16} />
                <input
                  id="fp-confirm"
                  type={showPass ? "text" : "password"}
                  className="rt-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="rt-error">{error}</p>}
            <button type="submit" className="rt-submit accent" disabled={loading}>
              {loading ? <span className="rt-spinner" /> : "Reset password"}
            </button>
          </form>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="rt-modal-form">
            <p className="rt-success">Password reset successfully. You can now sign in with your new password.</p>
            <button type="button" className="rt-submit" onClick={onClose}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;