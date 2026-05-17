import React, { useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import "../styles/RegisterUser.css";

/* ── Inline SVG icons (no extra dependency) ─────────────────── */
const Icon = {
  Bus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17h12M4 9h16M4 13h16M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
      <circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/>
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  GradCap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <line x1="2" y1="12" x2="2" y2="17"/><line x1="22" y1="12" x2="22" y2="17"/>
    </svg>
  ),
  Wheel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polyline points="22 7 12 13 2 7"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.47 19a19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-2.93-8.32A2 2 0 0 1 4.36 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Hash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Id: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <circle cx="8" cy="12" r="2"/>
      <path d="M14 9h4M14 13h4M14 17h4"/>
    </svg>
  ),
  License: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="22" height="18" rx="2"/>
      <polyline points="1 9 22 9"/>
      <path d="M7 15h4M7 11h2"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Form: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

/* ── Field component ─────────────────────────────────────────── */
function Field({ label, name, placeholder, icon: IconComp, onChange }) {
  return (
    <div className="reg-field">
      <label>{label}</label>
      <div className="reg-input-wrap">
        <span className="reg-input-icon"><IconComp /></span>
        <input
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          required
          autoComplete="off"
        />
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
function RegisterUser() {
  const [role, setRole]         = useState("");
  const [formData, setFormData] = useState({});
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleSelect = (r) => {
    setRole(r);
    setFormData({});
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let res;
      if (role === "student") res = await API.post("/admin/register-student", formData);
      else if (role === "driver") res = await API.post("/admin/register-driver", formData);

      setMessage({ text: res.data.message, type: "success" });
      alert(`Email: ${res.data.credentials.email}\nPassword: ${res.data.credentials.password}`);
      setFormData({});
      setRole("");
    } catch (err) {
      console.error("FRONTEND ERROR:", err);
      setMessage({ text: err.response?.data?.message || "Registration failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="reg-page">
        <div className="reg-card">

          {/* ── Header ── */}
          <div className="reg-header">
            <div className="reg-header-icon"><Icon.Bus /></div>
            <div className="reg-header-text">
              <h1>Register User</h1>
              <p>University Transport Management System</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="reg-body">

            {/* Role picker */}
            <span className="reg-role-label">Select role</span>
            <div className="reg-role-grid">

              <button
                type="button"
                className={`reg-role-btn student-btn ${role === "student" ? "selected-student" : ""}`}
                onClick={() => handleRoleSelect("student")}
              >
                <div className="reg-role-icon"><Icon.GradCap /></div>
                <span className="reg-role-name">Student</span>
                <span className="reg-role-check"><Icon.Check /></span>
              </button>

              <button
                type="button"
                className={`reg-role-btn driver-btn ${role === "driver" ? "selected-driver" : ""}`}
                onClick={() => handleRoleSelect("driver")}
              >
                <div className="reg-role-icon"><Icon.Wheel /></div>
                <span className="reg-role-name">Driver</span>
                <span className="reg-role-check"><Icon.Check /></span>
              </button>

            </div>

            {/* Form */}
            {!role ? (
              <div className="reg-placeholder">
                <Icon.Form />
                Choose a role above to continue registration
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reg-form reg-form-enter" key={role}>

                {/* Section label */}
                <div className={`reg-section-badge ${role}`}>
                  {role === "student" ? <Icon.GradCap /> : <Icon.Wheel />}
                  {role === "student" ? "Student Info" : "Driver Info"}
                </div>

                {/* Common fields */}
                <Field label="Full Name"     name="name"  placeholder="e.g. Rahul Sharma"         icon={Icon.User}  onChange={handleChange} />
                <Field label="Email Address" name="email" placeholder="e.g. rahul@university.edu" icon={Icon.Mail}  onChange={handleChange} />
                <Field label="Phone Number"  name="phone" placeholder="e.g. 9876543210"           icon={Icon.Phone} onChange={handleChange} />

                {/* Student-only */}
                {role === "student" && (
                  <>
                    <Field label="Enrollment No." name="enrollmentNumber" placeholder="e.g. 2021CS0042"   icon={Icon.Hash}   onChange={handleChange} />
                    <Field label="Branch"          name="branch"           placeholder="e.g. Computer Science" icon={Icon.Book}   onChange={handleChange} />
                    <Field label="Bus Stop"         name="stopName"         placeholder="e.g. Gate No. 2"    icon={Icon.MapPin} onChange={handleChange} />
                  </>
                )}

                {/* Driver-only */}
                {role === "driver" && (
                  <>
                    <Field label="User ID"       name="userId"       placeholder="e.g. DRV-2024-001"  icon={Icon.Id}      onChange={handleChange} />
                    <Field label="License No."   name="licenseNumber" placeholder="e.g. UP14-20120012" icon={Icon.License} onChange={handleChange} />
                    <Field label="Aadhar Number" name="aadharNumber"  placeholder="XXXX XXXX XXXX"     icon={Icon.Shield}  onChange={handleChange} />
                  </>
                )}

                {/* Submit */}
                <button className="reg-submit" type="submit" disabled={loading}>
                  {loading ? "Registering…" : (
                    <>Register {role === "student" ? "Student" : "Driver"} <Icon.Arrow /></>
                  )}
                </button>

              </form>
            )}

            {/* Feedback message */}
            {message.text && (
              <div className={`reg-msg visible ${message.type}`}>
                {message.type === "success" ? <Icon.Check /> : <Icon.AlertCircle />}
                {message.text}
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RegisterUser;