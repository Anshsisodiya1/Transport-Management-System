import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  let token = null;

  if (user?.role === "admin") {
    token = localStorage.getItem("adminToken");
  } else if (user?.role === "driver") {
    token = localStorage.getItem("driverToken");
  } else if (user?.role === "student") {
    token = localStorage.getItem("studentToken");
  }

  console.log("TOKEN:", token);

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  console.log("HEADERS:", req.headers);

  return req;
});

export default API;