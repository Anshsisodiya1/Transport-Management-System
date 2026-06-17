import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";
import BusSeatLayout from "../components/BusSeatLayout";
import "../styles/Assignments.css";

/* ── SVG Icons ───────────────────────────────────────────── */
const Ic = {
  Assign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Student: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <line x1="2" y1="12" x2="2" y2="17"/><line x1="22" y1="12" x2="22" y2="17"/>
    </svg>
  ),
  Driver: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  Bus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 17h12M4 9h16M4 13h16M6 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
      <circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/>
    </svg>
  ),
  Seat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Table: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
  Form: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Prev: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Next: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

/* ── Field helper ─────────────────────────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="asgn-form-field">
      {label && <label>{label}</label>}
      <div className="asgn-input-wrap">
        <span className="asgn-input-ico"><Icon /></span>
        {children}
      </div>
    </div>
  );
}

/* ── Initials avatar ──────────────────────────────────────── */
function Avatar({ name, type }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return <div className={`asgn-avatar ${type}`}>{initials}</div>;
}

/* ── Seat Picker Modal ────────────────────────────────────── */
function SeatPickerModal({ bus, bookedSeats, currentSeat, onConfirm, onClose }) {
  return (
    <div
      className="asgn-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="asgn-modal" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div className="asgn-modal-header">
          <h3>Select Seat — {bus?.busNumber}</h3>
          <button className="asgn-modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>

        {/* Body */}
        <div className="asgn-modal-body" style={{ padding: "20px" }}>
          <BusSeatLayout
            capacity={bus?.capacity}
            bookedSeats={bookedSeats}
            selectedSeat={currentSeat}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents]       = useState([]);
  const [drivers, setDrivers]         = useState([]);
  const [buses, setBuses]             = useState([]);

  const [type, setType]               = useState("");
  const [form, setForm]               = useState({ studentId: "", driverId: "", busId: "" });
  const [seat, setSeat]               = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [seatModal, setSeatModal]     = useState(false);

  const [editOpen, setEditOpen]   = useState(false);
  const [editData, setEditData]   = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterType, setFilterType]   = useState("all");
  const [search, setSearch]           = useState("");

  /* ── Fetch ── */
  const fetchData = async () => {
    const [a, s, b, d] = await Promise.all([
      API.get("/assignments"),
      API.get("/admin/students"),
      API.get("/buses"),
      API.get("/admin/drivers"),
    ]);
    setAssignments(a.data || []);
    setStudents(s.data || []);
    setBuses(b.data || []);
    setDrivers(d.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Assign ── */
  const handleAssign = async () => {
    try {
      const payload = { type, busId: form.busId };
      if (type === "student") {
        if (seat === null || seat === undefined) return alert("Please select a seat");
        payload.studentId  = form.studentId;
        payload.seatNumber = parseInt(seat, 10);
      }
      if (type === "driver") payload.driverId = form.driverId;
      await API.post("/assignments/assign", payload);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const resetForm = () => {
    setType("");
    setForm({ studentId: "", driverId: "", busId: "" });
    setSeat(null);
    setSelectedBus(null);
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await API.delete(`/assignments/${id}`);
    fetchData();
  };

  /* ── Edit ── */
  const openEdit = (a) => {
    const bus = buses.find((b) => b._id === a.bus?._id);
    setEditOpen(true);
    setEditData({
      id: a._id,
      type: a.type,
      busId: a.bus?._id,
      seatNumber: a.seatNumber,
    });
    setSelectedBus(bus);
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/assignments/${editData.id}`, {
        busId:      editData.busId,
        seatNumber: editData.type === "student" ? editData.seatNumber : undefined,
      });
      setEditOpen(false);
      setEditData(null);
      setSelectedBus(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditData(null);
    setSelectedBus(null);
  };

  /* ── Booked seats (exclude current edit assignment) ── */
  const bookedSeats = assignments
    .filter((a) => {
      if (!selectedBus) return false;
      if (editOpen && editData?.id === a._id) return false;
      return (
        a.type === "student" &&
        String(a.bus?._id) === String(selectedBus?._id)
      );
    })
    .map((a) => Number(a.seatNumber));

  /* ── Filter + paginate ── */
  const filtered = assignments
    .filter((a) => filterType === "all" || a.type === filterType)
    .filter((a) => {
      const name = a.type === "student" ? a.student?.name : a.driver?.name;
      const bus  = a.bus?.busNumber;
      return (
        name?.toLowerCase().includes(search.toLowerCase()) ||
        bus?.toLowerCase().includes(search.toLowerCase())
      );
    });

  const totalPages      = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems    = filtered.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, safeCurrentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const studentCount = assignments.filter((a) => a.type === "student").length;
  const driverCount  = assignments.filter((a) => a.type === "driver").length;

  return (
    <Layout>
      <div className="asgn-page">

        {/* ── Page header ── */}
        <div className="asgn-page-header">
          <div className="asgn-page-title">
            <div className="asgn-title-icon"><Ic.Assign /></div>
            <div>
              <h1>Assignment Dashboard</h1>
              <p>Assign students and drivers to buses</p>
            </div>
          </div>
          <div className="asgn-stat-pills">
            <span className="asgn-stat-pill total">
              <Ic.Assign /> {assignments.length} Total
            </span>
            <span className="asgn-stat-pill student">
              <Ic.Student /> {studentCount} Students
            </span>
            <span className="asgn-stat-pill driver">
              <Ic.Driver /> {driverCount} Drivers
            </span>
          </div>
        </div>

        {/* ── Create form card ── */}
        <div className="asgn-card">
          <div className="asgn-card-header">
            <h2 className="asgn-card-title"><Ic.Form /> New Assignment</h2>
          </div>
          <div className="asgn-card-body">
            <div className="asgn-form-row">

              <Field label="Assignment Type" icon={Ic.Assign}>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setForm({ studentId: "", driverId: "", busId: "" });
                    setSeat(null);
                    setSelectedBus(null);
                  }}
                >
                  <option value="">Select type…</option>
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
                </select>
              </Field>

              {type === "student" && (
                <Field label="Student" icon={Ic.Student}>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  >
                    <option value="">Select student…</option>
                    {students.map((s) => (
                      <option key={s._id} value={s.user?._id}>{s.user?.name}</option>
                    ))}
                  </select>
                </Field>
              )}

              {type === "driver" && (
                <Field label="Driver" icon={Ic.Driver}>
                  <select
                    value={form.driverId}
                    onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                  >
                    <option value="">Select driver…</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d.user?._id}>{d.user?.name}</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Bus" icon={Ic.Bus}>
                <select
                  value={form.busId}
                  onChange={(e) => {
                    const bus = buses.find((b) => b._id === e.target.value);
                    setForm({ ...form, busId: e.target.value });
                    setSelectedBus(bus);
                    setSeat(null); // reset seat when bus changes
                  }}
                >
                  <option value="">Select bus…</option>
                  {buses.map((b) => (
                    <option key={b._id} value={b._id}>{b.busNumber}</option>
                  ))}
                </select>
              </Field>

              {type === "student" && (
                <div className="asgn-form-field">
                  <label>Seat</label>
                  <button
                    className="asgn-seat-btn"
                    onClick={() => {
                      if (!selectedBus) return alert("Please select a bus first");
                      setSeatModal(true);
                    }}
                  >
                    <Ic.Seat />
                    {seat !== null ? "Change Seat" : "Select Seat"}
                    <span className={`asgn-seat-pill ${seat === null ? "none" : ""}`}>
                      {seat !== null ? seat : "—"}
                    </span>
                  </button>
                </div>
              )}

              <div className="asgn-form-field" style={{ justifyContent: "flex-end" }}>
                <label style={{ visibility: "hidden" }}>_</label>
                <button
                  className="asgn-btn-assign"
                  onClick={handleAssign}
                  disabled={
                    !type ||
                    !form.busId ||
                    (type === "student" && seat === null) ||
                    (type === "student" && !form.studentId) ||
                    (type === "driver" && !form.driverId)
                  }
                >
                  <Ic.Plus /> Assign
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="asgn-card">

          {/* Toolbar */}
          <div className="asgn-toolbar">
            <div className="asgn-tabs">
              {["all", "student", "driver"].map((t) => (
                <button
                  key={t}
                  className={`asgn-tab ${filterType === t ? "active" : ""}`}
                  onClick={() => { setFilterType(t); setCurrentPage(1); }}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                </button>
              ))}
            </div>
            <div className="asgn-toolbar-right">
              <span className="asgn-result-count">{filtered.length} records</span>
              <div className="asgn-search-wrap">
                <Ic.Search />
                <input
                  type="text"
                  placeholder="Search name or bus…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="asgn-table-wrap">
            {currentItems.length === 0 ? (
              <div className="asgn-empty">
                <Ic.Table />
                {assignments.length === 0
                  ? "No assignments yet. Create one above."
                  : "No records match your search or filter."}
              </div>
            ) : (
              <table className="asgn-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Bus</th>
                    <th>Seat</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((a) => {
                    const name = a.type === "student" ? a.student?.name : a.driver?.name;
                    return (
                      <tr key={a._id}>
                        <td>
                          <span className={`asgn-type-badge ${a.type}`}>
                            {a.type === "student" ? <Ic.Student /> : <Ic.Driver />}
                            {a.type}
                          </span>
                        </td>
                        <td>
                          <div className="asgn-name-cell">
                            <Avatar name={name} type={a.type} />
                            <span className="asgn-name-text">{name || "—"}</span>
                          </div>
                        </td>
                        <td>
                          {a.bus?.busNumber ? (
                            <span className="asgn-bus-chip">{a.bus.busNumber}</span>
                          ) : (
                            <span style={{ color: "var(--asgn-hint)", fontSize: ".8rem" }}>—</span>
                          )}
                        </td>
                        <td>
                          {a.type === "student" && a.seatNumber != null ? (
                            <span className="asgn-seat-badge">{a.seatNumber}</span>
                          ) : (
                            <span style={{ color: "var(--asgn-hint)", fontSize: ".8rem" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="asgn-row-actions">
                            <button className="asgn-btn-edit" onClick={() => openEdit(a)}>
                              <Ic.Edit /> Edit
                            </button>
                            <button className="asgn-btn-del" onClick={() => handleDelete(a._id)}>
                              <Ic.Trash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="asgn-pagination">
              <span className="asgn-page-info">
                Showing {(safeCurrentPage - 1) * itemsPerPage + 1}–
                {Math.min(safeCurrentPage * itemsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="asgn-page-btns">
                <button
                  className="asgn-page-btn"
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <Ic.Prev />
                </button>
                {pageNumbers().map((n) => (
                  <button
                    key={n}
                    className={`asgn-page-btn ${n === safeCurrentPage ? "current" : ""}`}
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="asgn-page-btn"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <Ic.Next />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Edit Modal ── */}
        {editOpen && editData && (
          <div
            className="asgn-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && closeEdit()}
          >
            <div className="asgn-modal">
              <div className="asgn-modal-header">
                <h3>Edit Assignment</h3>
                <button className="asgn-modal-close" onClick={closeEdit}>
                  <Ic.X />
                </button>
              </div>
              <div className="asgn-modal-body">

                <div className="asgn-form-field">
                  <label>Bus</label>
                  <div className="asgn-input-wrap">
                    <span className="asgn-input-ico"><Ic.Bus /></span>
                    <select
                      value={editData.busId}
                      onChange={(e) => {
                        const bus = buses.find((b) => b._id === e.target.value);
                        setEditData({ ...editData, busId: e.target.value, seatNumber: null });
                        setSelectedBus(bus);
                      }}
                    >
                      {buses.map((b) => (
                        <option key={b._id} value={b._id}>{b.busNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {editData.type === "student" && (
                  <div className="asgn-form-field">
                    <label>Seat</label>
                    <button
                      className="asgn-seat-btn"
                      onClick={() => setSeatModal(true)}
                    >
                      <Ic.Seat />
                      Change Seat
                      <span className="asgn-seat-pill">
                        {editData.seatNumber ?? "—"}
                      </span>
                    </button>
                  </div>
                )}

              </div>
              <div className="asgn-modal-footer">
                <button className="asgn-btn-cancel" onClick={closeEdit}>Cancel</button>
                <button className="asgn-btn-save" onClick={handleUpdate}>
                  <Ic.Save /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Seat Picker Modal ── */}
        {seatModal && selectedBus && (
          <SeatPickerModal
            bus={selectedBus}
            bookedSeats={bookedSeats}
            currentSeat={editOpen ? editData?.seatNumber : seat}
            onConfirm={(s) => {
              if (editOpen) setEditData({ ...editData, seatNumber: s });
              else setSeat(s);
              setSeatModal(false);
            }}
            onClose={() => setSeatModal(false)}
          />
        )}

      </div>
    </Layout>
  );
}

export default Assignments;