import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import "../styles/Buses.css";

/* ── SVG Icons ───────────────────────────────────────────── */
const Ic = {
  Bus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17h12M4 9h16M4 13h16M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
      <circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  Hash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  Wifi: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Form: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Table: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
};

/* ── Field helper ─────────────────────────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="bus-field">
      {label && <label>{label}</label>}
      <div className="bus-input-wrap">
        <span className="bus-input-ico"><Icon /></span>
        {children}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
function Buses() {
  const [buses, setBuses]   = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    busNumber: "", capacity: "", route: "", gpsDeviceId: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchBuses  = async () => { try { const r = await API.get("/buses");  setBuses(r.data);  } catch (e) { console.log(e); } };
  const fetchRoutes = async () => { try { const r = await API.get("/routes"); setRoutes(r.data); } catch (e) { console.log(e); } };

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    const iv = setInterval(fetchBuses, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async () => {
    if (!form.busNumber || !form.capacity || !form.route)
      return alert("Please fill all required fields");

    const payload = {
      busNumber:   form.busNumber,
      capacity:    Number(form.capacity),
      route:       form.route,
      gpsDeviceId: form.gpsDeviceId,
    };

    try {
      if (editId) { await API.put(`/buses/${editId}`, payload); }
      else        { await API.post("/buses", payload); }

      setForm({ busNumber: "", capacity: "", route: "", gpsDeviceId: "" });
      setEditId(null);
      fetchBuses();
      localStorage.setItem("bus_updated", Date.now());
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/buses/${id}`);
      fetchBuses();
      localStorage.setItem("bus_updated", Date.now());
    } catch (e) { console.log(e); }
  };

  const handleEdit = (bus) => {
    setForm({
      busNumber:   bus.busNumber,
      capacity:    bus.capacity,
      route:       bus.route?._id || "",
      gpsDeviceId: bus.gpsDeviceId || "",
    });
    setEditId(bus._id);
  };

  const cancelEdit = () => {
    setForm({ busNumber: "", capacity: "", route: "", gpsDeviceId: "" });
    setEditId(null);
  };

  const filtered = buses.filter(b =>
    b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.route?.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    b.route?.routeNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // capacity display: cap relative to max in fleet (visual bar)
  const maxCap = Math.max(...buses.map(b => b.capacity || 0), 1);

  return (
    <Layout>
      <div className="bus-page">

        {/* ── Page header ── */}
        <div className="bus-page-header">
          <div className="bus-page-title">
            <div className="bus-page-title-icon"><Ic.Bus /></div>
            <div>
              <h1>Bus Management</h1>
              <p>Manage fleet, routes and GPS assignments</p>
            </div>
          </div>
          <div className="bus-stat-pills">
            <span className="bus-stat-pill total">
              <Ic.Bus /> {buses.length} Buses
            </span>
            <span className="bus-stat-pill active">
              <Ic.Wifi /> {buses.filter(b => b.gpsDeviceId).length} GPS Active
            </span>
            <span className="bus-live-badge">
              <span className="bus-live-dot" /> Live
            </span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="bus-layout">

          {/* ── Form panel ── */}
          <div className="bus-card">
            <div className="bus-card-header">
              <h2><Ic.Form /> {editId ? "Edit Bus" : "Add New Bus"}</h2>
            </div>
            <div className="bus-card-body">

              {editId && (
                <div className="bus-edit-banner">
                  <Ic.Alert /> Editing mode — changes will update live data
                </div>
              )}

              <div className="bus-form">
                <Field label="Bus Number" icon={Ic.Hash}>
                  <input
                    placeholder="e.g. UP-14-BUS-001"
                    value={form.busNumber}
                    onChange={e => setForm({ ...form, busNumber: e.target.value.toUpperCase() })}
                  />
                </Field>

                <Field label="Passenger Capacity" icon={Ic.Users}>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 40"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                  />
                </Field>

                <Field label="Assign Route" icon={Ic.Map}>
                  <select
                    value={form.route}
                    onChange={e => setForm({ ...form, route: e.target.value })}
                  >
                    <option value="">Select a route…</option>
                    {routes.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.routeNumber} — {r.routeName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="GPS Device ID" icon={Ic.Wifi}>
                  <input
                    placeholder="e.g. GPS-00123"
                    value={form.gpsDeviceId}
                    onChange={e => setForm({ ...form, gpsDeviceId: e.target.value })}
                  />
                  <span className="bus-optional">Optional</span>
                </Field>

                <div className="bus-form-actions">
                  <button
                    className={`bus-btn-primary ${editId ? "update" : ""}`}
                    onClick={handleSubmit}
                  >
                    {editId ? <><Ic.Save /> Update Bus</> : <><Ic.Plus /> Add Bus</>}
                  </button>
                  {editId && (
                    <button className="bus-btn-ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Table panel ── */}
          <div className="bus-card">
            <div className="bus-table-toolbar">
              <h2 style={{ fontFamily: "var(--bus-display)", fontSize: ".95rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: ".5rem" }}>
                <Ic.Table /> Fleet Overview
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                <span className="bus-count-badge">{filtered.length} of {buses.length} buses</span>
                <div className="bus-search-wrap">
                  <Ic.Search />
                  <input
                    placeholder="Search buses…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bus-table-wrap">
              {filtered.length === 0 ? (
                <div className="bus-empty">
                  <Ic.Bus />
                  <p>{buses.length === 0 ? "No buses registered yet. Add your first bus." : "No buses match your search."}</p>
                </div>
              ) : (
                <table className="bus-table">
                  <thead>
                    <tr>
                      <th>Bus Number</th>
                      <th>Capacity</th>
                      <th>Route</th>
                      <th>GPS</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(bus => (
                      <tr key={bus._id}>
                        <td>
                          <span className="bus-number-chip">
                            {bus.busNumber}
                          </span>
                        </td>
                        <td>
                          <div className="bus-cap-wrap">
                            <span className="bus-cap-text">{bus.capacity}</span>
                            <div className="bus-cap-bar">
                              <div
                                className="bus-cap-fill"
                                style={{ width: `${Math.round((bus.capacity / maxCap) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          {bus.route
                            ? <span className="bus-route-badge">{bus.route.routeNumber} — {bus.route.routeName}</span>
                            : <span className="bus-route-none">Unassigned</span>
                          }
                        </td>
                        <td>
                          {bus.gpsDeviceId
                            ? <span className="bus-gps-tag"><span className="bus-gps-dot" />{bus.gpsDeviceId}</span>
                            : <span style={{ color: "var(--bus-hint)", fontSize: ".8rem" }}>—</span>
                          }
                        </td>
                        <td>
                          <div className="bus-row-actions">
                            <button className="bus-btn-edit" onClick={() => handleEdit(bus)}>
                              <Ic.Edit /> Edit
                            </button>
                            <button className="bus-btn-del" onClick={() => handleDelete(bus._id)}>
                              <Ic.Trash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Buses;