import { useEffect } from "react";

function NotificationPopup({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // auto close

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.popup}>
      <h4>{notification.title}</h4>
      <p>{notification.body}</p>
    </div>
  );
}

const styles = {
  popup: {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#1f2937",
    color: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 9999,
    width: "250px",
  },
};

export default NotificationPopup;