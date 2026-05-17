import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";
import "../styles/layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        {/* <Navbar /> */}
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;