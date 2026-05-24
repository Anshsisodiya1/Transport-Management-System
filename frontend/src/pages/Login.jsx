import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    //  Role validation
    if (!role) {
      return alert("Please select role");
    }

    try {
      const payload = { email, password, role };

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload
      );

      console.log("Response:", res.data);

      const { token, role: userRole, user } = res.data;

      //  Save full user data
      login(token, { ...user, role: userRole });

      alert("Login Successful");

      //  Redirect based on role
      if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "driver") {
        navigate("/driver-dashboard", { replace: true });
      } else if (userRole === "student") {
        navigate("/student-dashboard", { replace: true });
      }

    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>

      {/* ROLE SELECT */}
      <div>
        <label>
          <input
            type="radio"
            value="admin"
            checked={role === "admin"}
            onChange={(e) => setRole(e.target.value)}
          />
          Admin
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            value="driver"
            checked={role === "driver"}
            onChange={(e) => setRole(e.target.value)}
          />
          Driver
        </label>

        <label style={{ marginLeft: "20px" }}>
          <input
            type="radio"
            value="student"
            checked={role === "student"}
            onChange={(e) => setRole(e.target.value)}
          />
          Student
        </label>
      </div>

      {/* FORM */}
      <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
        {role && (
          <>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button type="submit">Login</button>
          </>
        )}
      </form>
    </div>
  );
}

export default Login;