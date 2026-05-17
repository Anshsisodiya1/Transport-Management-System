import { useState } from "react";

function BusSeatLayout({ capacity, bookedSeats = [], onConfirm }) {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const handleClick = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;
    setSelectedSeat(seatNo);
  };

  // 🔥 THIS IS THE IMPORTANT FIX
  const handleConfirm = () => {
    console.log("Confirm clicked"); // DEBUG 1

    if (!selectedSeat) {
      alert("Please select a seat first");
      return;
    }

    console.log("Selected Seat:", selectedSeat); // DEBUG 2

    if (typeof onConfirm === "function") {
      onConfirm(selectedSeat); // send to parent
    } else {
      console.error("onConfirm is NOT passed from parent");
    }
  };

  const seats = Array.from({ length: capacity }, (_, i) => i + 1);

  return (
    <div style={{ padding: "10px", fontSize: "12px" }}>
      <h4>🚌 Select Seat</h4>

      {/* BUS */}
      <div style={{ display: "flex", gap: "10px" }}>

        {/* DRIVER */}
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "#333",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
          }}
        >
          D
        </div>

        {/* SEATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 35px)",
            gap: "6px",
          }}
        >
          {seats.map((seatNo) => {
            const isBooked = bookedSeats.includes(seatNo);
            const isSelected = selectedSeat === seatNo;

            return (
              <div
                key={seatNo}
                onClick={() => handleClick(seatNo)}
                style={{
                  width: "30px",
                  height: "30px",
                  fontSize: "10px",
                  background: isBooked
                    ? "#777"
                    : isSelected
                    ? "#4caf50"
                    : "#e0e0e0",

                  color: isBooked ? "#fff" : "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "4px",
                  cursor: isBooked ? "not-allowed" : "pointer",
                  opacity: isBooked ? 0.6 : 1,
                }}
              >
                {seatNo}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM BUTTON */}
      <div style={{ marginTop: "10px" }}>
        <div>
          Selected Seat: <b>{selectedSeat || "None"}</b>
        </div>

        <button
          onClick={handleConfirm}   // 🔥 IMPORTANT FIX
          style={{
            marginTop: "8px",
            padding: "5px 10px",
            fontSize: "12px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Confirm Seat
        </button>
      </div>
    </div>
  );
}

export default BusSeatLayout;