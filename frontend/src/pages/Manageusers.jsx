import { useEffect, useState, useCallback, useRef } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import "../styles/ManageUsers.css";
import {
  RiUserLine, RiGraduationCapLine, RiCarLine, RiSearchLine,
  RiEditLine, RiDeleteBinLine, RiCloseLine, RiSaveLine,
  RiFilterLine, RiMapPinLine, RiRoadMapLine, RiMailLine,
  RiPhoneLine, RiIdCardLine, RiBuilding4Line, RiRefreshLine,
  RiTeamLine, RiCheckLine, RiAlertLine, RiLoader4Line,
  RiShieldUserLine, RiArrowDownSLine, RiFileListLine,
  RiBusLine, RiArrowUpSLine,
} from "react-icons/ri";

/* ─── Toast ──────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`mu-toast mu-toast--${type}`}>
      {type === "success" ? <RiCheckLine /> : <RiAlertLine />}
      <span>{msg}</span>
      <button onClick={onClose}><RiCloseLine /></button>
    </div>
  );
}

/* ─── Confirm Modal ──────────────────────────────── */
function ConfirmModal({ name, onConfirm, onCancel }) {
  return (
    <div className="mu-overlay" onClick={onCancel}>
      <div className="mu-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mu-confirm-icon"><RiDeleteBinLine /></div>
        <h3>Delete User</h3>
        <p>Are you sure you want to permanently delete <strong>{name}</strong>? This cannot be undone.</p>
        <div className="mu-confirm-actions">
          <button className="mu-btn mu-btn--ghost" onClick={onCancel}>Cancel</button>
          <button className="mu-btn mu-btn--danger" onClick={onConfirm}>
            <RiDeleteBinLine /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─────────────────────────────────── */
function EditModal({ user, type, onSave, onClose }) {
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => { setSaving(true); await onSave(form); setSaving(false); };

  const studentFields = [
    { key: "name",             label: "Full Name",      icon: <RiUserLine />,       type: "text"  },
    { key: "email",            label: "Email",          icon: <RiMailLine />,       type: "email" },
    { key: "phone",            label: "Phone",          icon: <RiPhoneLine />,      type: "text"  },
    { key: "enrollmentNumber", label: "Enrollment No.", icon: <RiIdCardLine />,     type: "text"  },
    { key: "branch",           label: "Branch",         icon: <RiBuilding4Line />,  type: "text"  },
    { key: "stopName",         label: "Stop Name",      icon: <RiMapPinLine />,     type: "text"  },
  ];
  const driverFields = [
    { key: "name",          label: "Full Name",      icon: <RiUserLine />,      type: "text"  },
    { key: "email",         label: "Email",          icon: <RiMailLine />,      type: "email" },
    { key: "phone",         label: "Phone",          icon: <RiPhoneLine />,     type: "text"  },
    { key: "licenseNumber", label: "License No.",    icon: <RiFileListLine />,  type: "text"  },
    { key: "aadharNumber",  label: "Aadhar No.",     icon: <RiIdCardLine />,    type: "text"  },
  ];
  const fields = type === "student" ? studentFields : driverFields;

  return (
    <div className="mu-overlay" onClick={onClose}>
      <div className="mu-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mu-edit-header">
          <div className={`mu-edit-avatar ${type}`}>
            {type === "student" ? <RiGraduationCapLine /> : <RiCarLine />}
          </div>
          <div>
            <h3>Edit {type === "student" ? "Student" : "Driver"}</h3>
            <p>{user.name}</p>
          </div>
          <button className="mu-close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>
        <div className="mu-edit-fields">
          {fields.map((f) => (
            <div className="mu-field" key={f.key}>
              <label>{f.icon} {f.label}</label>
              <input type={f.type} value={form[f.key] || ""} onChange={handle(f.key)} placeholder={`Enter ${f.label.toLowerCase()}`} />
            </div>
          ))}
        </div>
        <div className="mu-edit-footer">
          <button className="mu-btn mu-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="mu-btn mu-btn--primary" onClick={submit} disabled={saving}>
            {saving ? <RiLoader4Line className="spin" /> : <RiSaveLine />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel (opens on button click) ───────── */
function FilterPanel({ filterOpts, filters, setFilters, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);

  const hasAny = filters.branch || filters.stop || filters.route;

  const Select = ({ label, icon, options, fkey }) => (
    <div className="mu-fp-group">
      <div className="mu-fp-label">{icon} {label}</div>
      <select
        value={filters[fkey]}
        onChange={(e) => setFilters((f) => ({ ...f, [fkey]: e.target.value }))}
        className="mu-fp-select"
      >
        <option value="">All {label}s</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="mu-filter-panel" ref={ref}>
      <div className="mu-fp-header">
        <span><RiFilterLine /> Filters</span>
        {hasAny && (
          <button className="mu-fp-clear" onClick={() => setFilters({ branch: "", stop: "", route: "" })}>
            Clear all
          </button>
        )}
      </div>
      <Select label="Branch"    icon={<RiBuilding4Line />} options={filterOpts.branches} fkey="branch" />
      <Select label="Route"     icon={<RiRoadMapLine />}   options={filterOpts.routes}   fkey="route"  />
      <Select label="Stop Name" icon={<RiMapPinLine />}    options={filterOpts.stops}    fkey="stop"   />
      <button className="mu-btn mu-btn--primary mu-fp-apply" onClick={onClose}>
        <RiCheckLine /> Apply Filters
      </button>
    </div>
  );
}

/* ─── Student Row ────────────────────────────────── */
function StudentRow({ s, onEdit, onDelete, index }) {
  return (
    <tr className="mu-row" style={{ animationDelay: `${index * 35}ms` }}>
      <td>
        <div className="mu-user-cell">
          <div className="mu-avatar student">{s.name?.[0]?.toUpperCase() || "S"}</div>
          <div>
            <div className="mu-user-name">{s.name}</div>
            <div className="mu-user-sub">{s.enrollmentNumber}</div>
          </div>
        </div>
      </td>
      <td><div className="mu-with-icon"><RiMailLine />{s.email}</div></td>
      <td><div className="mu-with-icon"><RiPhoneLine />{s.phone}</div></td>
      <td><span className="mu-badge branch"><RiBuilding4Line />{s.branch}</span></td>
      <td><span className="mu-badge route"><RiRoadMapLine />{s.routeNo}</span></td>
      <td><div className="mu-with-icon"><RiMapPinLine />{s.stopName}</div></td>
      <td>
        <div className="mu-actions">
          <button className="mu-icon-btn edit" onClick={() => onEdit(s)} title="Edit"><RiEditLine /></button>
          <button className="mu-icon-btn delete" onClick={() => onDelete(s)} title="Delete"><RiDeleteBinLine /></button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Driver Row ─────────────────────────────────── */
function DriverRow({ d, onEdit, onDelete, index }) {
  return (
    <tr className="mu-row" style={{ animationDelay: `${index * 35}ms` }}>
      <td>
        <div className="mu-user-cell">
          <div className="mu-avatar driver">{d.name?.[0]?.toUpperCase() || "D"}</div>
          <div>
            <div className="mu-user-name">{d.name}</div>
            <div className="mu-user-sub">{d.driverId !== "—" ? `ID: ${d.driverId}` : "Driver"}</div>
          </div>
        </div>
      </td>
      <td><div className="mu-with-icon"><RiMailLine />{d.email}</div></td>
      <td><div className="mu-with-icon"><RiPhoneLine />{d.phone}</div></td>
      <td><div className="mu-with-icon"><RiFileListLine />{d.licenseNumber || "—"}</div></td>
      <td><span className="mu-badge route"><RiRoadMapLine />{d.routeNo}</span></td>
      <td><span className="mu-badge bus"><RiBusLine />{d.busNumber || "—"}</span></td>
      <td>
        <div className="mu-actions">
          <button className="mu-icon-btn edit" onClick={() => onEdit(d)} title="Edit"><RiEditLine /></button>
          <button className="mu-icon-btn delete" onClick={() => onDelete(d)} title="Delete"><RiDeleteBinLine /></button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function ManageUsers() {
  const [tab, setTab]             = useState("student");
  const [students, setStudents]   = useState([]);
  const [drivers, setDrivers]     = useState([]);
  const [filterOpts, setFilterOpts] = useState({ branches: [], stops: [], routes: [] });
  const [filters, setFilters]     = useState({ branch: "", stop: "", route: "" });
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]         = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const hasFilters = filters.branch || filters.stop || filters.route;
  const activeFilterCount = [filters.branch, filters.stop, filters.route].filter(Boolean).length;

  useEffect(() => {
    API.get("/admin/users/filter-options")
      .then((r) => setFilterOpts(r.data.data))
      .catch(console.error);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.branch && { branch: filters.branch }),
        ...(filters.stop   && { stop:   filters.stop   }),
        ...(filters.route  && { route:  filters.route  }),
        ...(search         && { search              }),
      };
      const res = await API.get("/admin/users/students", { params });
      setStudents(res.data.data);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [filters, search]);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users/drivers", {
        params: search ? { search } : {},
      });
      setDrivers(res.data.data);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [search]);


useEffect(() => {
  fetchStudents();
  fetchDrivers();
}, []); 


useEffect(() => {
  if (tab === "student") fetchStudents();
  else fetchDrivers();
}, [tab, fetchStudents, fetchDrivers]);

  const handleSave = async (form) => {
    try {
      if (tab === "student") await API.put(`/admin/users/students/${form._id}`, form);
      else                   await API.put(`/admin/users/drivers/${form._id}`, form);
      showToast("User updated successfully!");
      setEditTarget(null);
      tab === "student" ? fetchStudents() : fetchDrivers();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleDelete = async () => {
    try {
      if (tab === "student") await API.delete(`/admin/users/students/${deleteTarget._id}`);
      else                   await API.delete(`/admin/users/drivers/${deleteTarget._id}`);
      showToast("User deleted successfully!");
      setDeleteTarget(null);
      tab === "student" ? fetchStudents() : fetchDrivers();
    } catch (e) { showToast(e.message, "error"); }
  };

  const data = tab === "student" ? students : drivers;

  return (
    <Layout>
      <div className="mu-container">

        {/* ── Header ── */}
        <div className="mu-page-header">
          <div className="mu-header-left">
            <div className="mu-header-eyebrow"><RiShieldUserLine /> User Management</div>
            <h1>Manage <span>Users</span></h1>
            <p>View, edit and remove students &amp; drivers from the system.</p>
          </div>
          <div className="mu-header-stats">
            <div className="mu-hstat">
              <div className="mu-hstat-icon student"><RiGraduationCapLine /></div>
              <div>
                <strong>{students.length}</strong>
                <span>Students</span>
              </div>
            </div>
            <div className="mu-hstat-div" />
            <div className="mu-hstat">
              <div className="mu-hstat-icon driver"><RiCarLine /></div>
              <div>
                <strong>{drivers.length}</strong>
                <span>Drivers</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mu-tabs">
          <button
            className={`mu-tab ${tab === "student" ? "active" : ""}`}
            onClick={() => { setTab("student"); setSearch(""); setFilters({ branch: "", stop: "", route: "" }); setFilterOpen(false); }}
          >
            <RiGraduationCapLine /> Students
            <span className="mu-tab-count">{students.length}</span>
          </button>
          <button
            className={`mu-tab ${tab === "driver" ? "active" : ""}`}
            onClick={() => { setTab("driver"); setSearch(""); setFilterOpen(false); }}
          >
            <RiCarLine /> Drivers
            <span className="mu-tab-count">{drivers.length}</span>
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="mu-toolbar">
          <div className="mu-search-wrap">
            <RiSearchLine className="mu-search-icon" />
            <input
              className="mu-search"
              placeholder={`Search ${tab === "student" ? "by name, email, enrollment…" : "by name or email…"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button className="mu-search-clear" onClick={() => setSearch("")}><RiCloseLine /></button>}
          </div>

          <div className="mu-toolbar-right">
            {/* Filter button — students only */}
            {tab === "student" && (
              <div className="mu-filter-wrap">
                <button
                  className={`mu-filter-btn ${filterOpen ? "open" : ""} ${activeFilterCount ? "has-filters" : ""}`}
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <RiFilterLine />
                  Filters
                  {activeFilterCount > 0 && <span className="mu-filter-badge">{activeFilterCount}</span>}
                  {filterOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                </button>

                {filterOpen && (
                  <FilterPanel
                    filterOpts={filterOpts}
                    filters={filters}
                    setFilters={setFilters}
                    onClose={() => setFilterOpen(false)}
                  />
                )}
              </div>
            )}

            {/* Active filter chips */}
            {hasFilters && (
              <div className="mu-active-chips">
                {filters.branch && <span className="mu-chip">{filters.branch} <button onClick={() => setFilters(f=>({...f,branch:""}))}><RiCloseLine/></button></span>}
                {filters.route  && <span className="mu-chip">{filters.route}  <button onClick={() => setFilters(f=>({...f,route:""}))}><RiCloseLine/></button></span>}
                {filters.stop   && <span className="mu-chip">{filters.stop}   <button onClick={() => setFilters(f=>({...f,stop:""}))}><RiCloseLine/></button></span>}
              </div>
            )}

            <button
              className="mu-refresh-btn"
              onClick={() => tab === "student" ? fetchStudents() : fetchDrivers()}
              title="Refresh"
            >
              <RiRefreshLine className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="mu-card">
          {loading ? (
            <div className="mu-loading">
              <RiLoader4Line className="spin" />
              <span>Loading {tab === "student" ? "students" : "drivers"}…</span>
            </div>
          ) : data.length === 0 ? (
            <div className="mu-empty">
              <RiTeamLine />
              <p>No {tab === "student" ? "students" : "drivers"} found</p>
              {(search || hasFilters) && <span>Try adjusting your search or filters.</span>}
            </div>
          ) : (
            <div className="mu-table-wrap">
              <table className="mu-table">
                {tab === "student" ? (
                  <>
                    <thead>
                      <tr>
                        <th><RiUserLine /> Name</th>
                        <th><RiMailLine /> Email</th>
                        <th><RiPhoneLine /> Phone</th>
                        <th><RiBuilding4Line /> Branch</th>
                        <th><RiRoadMapLine /> Route</th>
                        <th><RiMapPinLine /> Stop</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <StudentRow key={s._id} s={s} index={i} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th><RiUserLine /> Name</th>
                        <th><RiMailLine /> Email</th>
                        <th><RiPhoneLine /> Phone</th>
                        <th><RiFileListLine /> License No.</th>
                        <th><RiRoadMapLine /> Route</th>
                        <th><RiBusLine /> Bus</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((d, i) => (
                        <DriverRow key={d._id} d={d} index={i} onEdit={setEditTarget} onDelete={setDeleteTarget} />
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}

          {!loading && data.length > 0 && (
            <div className="mu-table-footer">
              Showing <strong>{data.length}</strong> {tab === "student" ? "student" : "driver"}{data.length !== 1 ? "s" : ""}
              {(search || hasFilters) && <span className="mu-filtered-tag">filtered</span>}
            </div>
          )}
        </div>
      </div>

      {editTarget && <EditModal user={editTarget} type={tab} onSave={handleSave} onClose={() => setEditTarget(null)} />}
      {deleteTarget && <ConfirmModal name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  );
}