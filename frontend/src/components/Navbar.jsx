import "../styles/navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <h3>Admin Dashboard</h3>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;