import { useState } from "react";
import { FaBus, FaCheckCircle } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import "../styles/BusSeatLayout.css";

/* Seat icon — redbus-style chair shape in SVG */
const SeatIcon = ({ color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 20v-8a6 6 0 0 1 12 0v8"/>
    <path d="M4 20h16"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v2h20v-2a2 2 0 0 0-2-2h-2"/>
  </svg>
);

function BusSeatLayout({
  capacity,
  bookedSeats = [],
  onConfirm,
  selectedSeat: initialSeat = null,
}) {
  const [selectedSeat, setSelectedSeat] = useState(initialSeat);

  const handleClick = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;
    setSelectedSeat((prev) => (prev === seatNo ? null : seatNo));
  };

  const handleConfirm = () => {
    if (!selectedSeat) {
      alert("Please select a seat first");
      return;
    }
    if (typeof onConfirm === "function") onConfirm(selectedSeat);
  };

  const getSeatClass = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return "bsl-seat booked";
    if (selectedSeat === seatNo) return "bsl-seat selected";
    return "bsl-seat available";
  };

  /* Build rows — 2 seats | aisle | 2 seats (Redbus style) */
  const buildRows = () => {
    const rows = [];
    for (let i = 1; i <= capacity; i += 4) {
      rows.push([i, i + 1, null, i + 2, i + 3].filter(
        (s) => s === null || s <= capacity
      ));
    }
    return rows;
  };

  const rows = buildRows();

  return (
    <div className="bsl-wrapper">
      {/* Header */}
      <div className="bsl-header">
        <div className="bsl-header-icon">
          <FaBus size={16} />
        </div>
        <div className="bsl-header-text">
          <h4>Select a Seat</h4>
          <p>{capacity} seats · {bookedSeats.length} booked · {capacity - bookedSeats.length} available</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bsl-legend">
        <div className="bsl-legend-item">
          <span className="bsl-legend-dot available" /> Available
        </div>
        <div className="bsl-legend-item">
          <span className="bsl-legend-dot booked" /> Booked
        </div>
        <div className="bsl-legend-item">
          <span className="bsl-legend-dot selected" /> Selected
        </div>
      </div>

      {/* Bus Shell */}
      <div className="bsl-bus">
        {/* Driver Row */}
        <div className="bsl-driver-row">
          <div className="bsl-driver-seat">
            <BsPersonFill size={16} />
          </div>
          <span className="bsl-driver-label">Driver</span>
        </div>

        {/* Seat Grid — 2 | aisle | 2 */}
        <div className="bsl-seat-grid">
          {rows.map((row, rIdx) =>
            row.map((seatNo, cIdx) => {
              /* Aisle column */
              if (seatNo === null) {
                return <div key={`aisle-${rIdx}`} className="bsl-aisle" />;
              }
              /* Out-of-range seat (last row might be incomplete) */
              if (seatNo > capacity) {
                return <div key={`empty-${rIdx}-${cIdx}`} />;
              }
              const isBooked   = bookedSeats.includes(seatNo);
              const isSelected = selectedSeat === seatNo;
              const iconColor  = isBooked ? "#c92a2a" : isSelected ? "#2f9e44" : "#868e96";

              return (
                <div
                  key={seatNo}
                  className={getSeatClass(seatNo)}
                  onClick={() => handleClick(seatNo)}
                  title={isBooked ? `Seat ${seatNo} — Booked` : `Seat ${seatNo}`}
                >
                  <SeatIcon color={iconColor} />
                  <span className="bsl-seat-num">{seatNo}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bsl-footer">
        <div className="bsl-selected-info">
          <span>Selected:</span>
          <span className={`bsl-selected-badge${selectedSeat ? "" : " empty"}`}>
            {selectedSeat ?? "—"}
          </span>
        </div>
        <button
          className="bsl-confirm-btn"
          onClick={handleConfirm}
          disabled={!selectedSeat}
        >
          <FaCheckCircle size={13} />
          Confirm Seat
        </button>
      </div>
    </div>
  );
}

export default BusSeatLayout;