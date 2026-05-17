import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";

//  Notification
import NotificationPopup from "./components/NotificationPopup";
import {
  initNotifications,
  onMessageListener,
} from "./services/notificationService";

// Pages
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Buses from "./pages/Buses";
import Assignments from "./pages/Assignments";
import RegisterUser from "./pages/RegisterUser";
import RoutesPage from "./pages/Routes";
import BusSeatLayout from "./components/BusSeatLayout";
import Reports from "./pages/Reports";
import DriverDashboard from "./pages/DriverDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Initialize Firebase Notifications
    initNotifications();

    //  Listen for incoming messages
    onMessageListener((payload) => {
      const title = payload?.notification?.title || "Notification";
      const body = payload?.notification?.body || "";

      setNotification({ title, body });

      //  Play sound
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {/*  GLOBAL NOTIFICATION POPUP */}
        {notification && (
          <NotificationPopup
            notification={notification}
            onClose={() => setNotification(null)}
          />
        )}

        <Routes>
          {/*  Public Route */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/buses"
            element={
              <ProtectedRoute role="admin">
                <Buses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute role="admin">
                <Assignments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/register"
            element={
              <ProtectedRoute role="admin">
                <RegisterUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/routes"
            element={
              <ProtectedRoute role="admin">
                <RoutesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/bus-seat-layout/:busId"
            element={
              <ProtectedRoute role="admin">
                <BusSeatLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <Reports />
              </ProtectedRoute>
            }
          />

          {/*  Driver */}
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute role="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
