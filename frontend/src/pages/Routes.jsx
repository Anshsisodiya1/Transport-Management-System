import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import RouteViewer from "../components/RouteViewer";
import "../styles/transport-admin.css";

/* ─── Icons ─────────────────────────────────────────────────────── */
const IconRoute = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconHash = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
  </svg>
);
const IconTag = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);
const IconMapPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconBus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-4.8c.3-2.7.2-3.2.2-3.2H2s-.1.5.2 3.2C2.5 16.3 3 18 3 18h3" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);
const IconClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────── */
function Routes() {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editId, setEditId] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [routeSuccess, setRouteSuccess] = useState("");

  const [form, setForm] = useState({
    routeNumber: "",
    routeName: "",
    startPoint: "",
    endPoint: "",
    stops: "",
    timings: "",
  });

  const fetchRoutes = async () => {
    const res = await API.get("/routes");
    setRoutes(res.data);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const normalize = (v) => v?.toLowerCase().replace(/-/g, "").trim();

  const checkRouteExists = (value) => {
    const exists = routes.some(
      (r) => normalize(r.routeNumber) === normalize(value),
    );
    if (!value) {
      setRouteError("");
      setRouteSuccess("");
      return;
    }
    if (exists && !editId) {
      setRouteError("Route number already exists");
      setRouteSuccess("");
    } else {
      setRouteError("");
      setRouteSuccess("Route number available");
    }
  };

  const cleanSplit = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSubmit = async () => {
    if (routeError) {
      alert("Fix route number first!");
      return;
    }

      if (
    !form.routeNumber ||
    !form.routeName ||
    !form.startPoint ||
    !form.endPoint
  ) {
    alert("Please fill all required fields");
    return;
  }

  if (routeError) {
    alert("Fix route number first!");
    return;
  }
  
    const payload = {
      routeNumber: form.routeNumber,
      routeName: form.routeName,
      startPoint: form.startPoint,
      endPoint: form.endPoint,

      stops: cleanSplit(form.stops).map((stop) => ({
        name: stop,
        lat: 0,
        lng: 0,
        time: "",
      })),

      timings: cleanSplit(form.timings),
    };
    if (editId) await API.put(`/routes/${editId}`, payload);
    else await API.post("/routes", payload);
    resetForm();
    fetchRoutes();
  };

  const resetForm = () => {
    setForm({
      routeNumber: "",
      routeName: "",
      startPoint: "",
      endPoint: "",
      stops: "",
      timings: "",
    });
    setEditId(null);
    setRouteError("");
    setRouteSuccess("");
  };

  const handleEdit = (route) => {
    setForm({
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      stops: route.stops?.map((s) => s.name).join(", ") || "",
      timings: route.timings?.join(", ") || "",
    });

    setEditId(route._id);
    setRouteError("");
    setRouteSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await API.delete(`/routes/${id}`);
    fetchRoutes();
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.routeName.toLowerCase().includes(search.toLowerCase()) ||
      r.routeNumber.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="admin-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Route Management</h1>
            <p>
              Manage and configure all bus routes across the transport network
            </p>
          </div>
          <div className="stat-pill">
            <IconRoute />
            <span className="count">{routes.length}</span>
            <span>Total Routes</span>
          </div>
        </div>

        {/* Search */}
        <div className="topbar">
          <div className="search-wrap">
            <span className="search-icon">
              <IconSearch />
            </span>
            <input
              className="search-input"
              placeholder="Search by name or number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="routes-grid">
          {/* Form Card */}
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon">
                {editId ? <IconEdit /> : <IconPlus />}
              </div>
              <div>
                <h2>{editId ? "Edit Route" : "Add New Route"}</h2>
                <p>
                  {editId
                    ? "Update route details below"
                    : "Fill in details to create a new route"}
                </p>
              </div>
            </div>

            <div className="field">
              <label>Route Number</label>
              <div className="field-input-wrap">
                <span className="field-icon">
                  <IconHash />
                </span>
                <input
                  placeholder="e.g. R-1"
                  value={form.routeNumber}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, routeNumber: v });
                    checkRouteExists(v);
                  }}
                />
              </div>
              {routeError && (
                <div className="validation-msg error">
                  <IconX /> {routeError}
                </div>
              )}
              {routeSuccess && !routeError && (
                <div className="validation-msg success">
                  <IconCheck /> {routeSuccess}
                </div>
              )}
            </div>

            <div className="field">
              <label>Route Name</label>
              <div className="field-input-wrap">
                <span className="field-icon">
                  <IconTag />
                </span>
                <input
                  placeholder="e.g. City Centre Express"
                  value={form.routeName}
                  onChange={(e) =>
                    setForm({ ...form, routeName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Start Point</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <IconMapPin />
                  </span>
                  <input
                    placeholder="Origin"
                    value={form.startPoint}
                    onChange={(e) =>
                      setForm({ ...form, startPoint: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>End Point</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <IconMapPin />
                  </span>
                  <input
                    placeholder="Destination"
                    value={form.endPoint}
                    onChange={(e) =>
                      setForm({ ...form, endPoint: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Stops</label>
              <div className="field-input-wrap">
                <span className="field-icon">
                  <IconBus />
                </span>
                <input
                  placeholder="Stop A, Stop B, Stop C…"
                  value={form.stops}
                  onChange={(e) => setForm({ ...form, stops: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>Timings</label>
              <div className="field-input-wrap">
                <span className="field-icon">
                  <IconClock />
                </span>
                <input
                  placeholder="07:00, 09:00, 11:00…"
                  value={form.timings}
                  onChange={(e) =>
                    setForm({ ...form, timings: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className={`btn-submit${editId ? " editing" : ""}`}
                onClick={handleSubmit}
              >
                {editId ? (
                  <>
                    <IconEdit /> Update Route
                  </>
                ) : (
                  <>
                    <IconPlus /> Add Route
                  </>
                )}
              </button>
              {editId && (
                <button className="btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="table-card">
            <div className="table-card-header">
              <h2>All Routes</h2>
              <span className="route-count-badge">
                {filteredRoutes.length} route
                {filteredRoutes.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filteredRoutes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛣️</div>
                <p>
                  {search
                    ? "No routes match your search"
                    : "No routes added yet"}
                </p>
                <span>
                  {search
                    ? "Try a different keyword"
                    : "Add your first route using the form"}
                </span>
              </div>
            ) : (
              <table className="routes-table">
                <thead>
                  <tr>
                    <th>Route No.</th>
                    <th>Name</th>
                    <th>Journey</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutes.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <span className="route-number-badge">
                          <IconHash /> {r.routeNumber}
                        </span>
                      </td>
                      <td>
                        <span
                          className="route-name-link"
                          onClick={() => setSelectedRoute(r)}
                        >
                          {r.routeName}
                          <span className="eye-icon">
                            <IconEye />
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="endpoint-flow">
                          <span className="endpoint-dot start" />
                          <span className="endpoint-label">{r.startPoint}</span>
                          <span className="endpoint-arrow">→</span>
                          <span className="endpoint-dot end" />
                          <span className="endpoint-label">{r.endPoint}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn-icon edit"
                            title="Edit"
                            onClick={() => handleEdit(r)}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete"
                            onClick={() => handleDelete(r._id)}
                          >
                            <IconTrash />
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

      {selectedRoute && (
        <div className="modal-overlay" onClick={() => setSelectedRoute(null)}>
          <div
            style={{ position: "relative", width: "100%", maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedRoute(null)}
            >
              ✕
            </button>
            <RouteViewer
              route={selectedRoute}
              onClose={() => setSelectedRoute(null)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Routes;
