import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// 🔑 Get FCM Token & save to backend
export const initNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BJtm2PrP0CUb4U-vyS0ZjKmY2lWM6pTPt0N6PBISCd21_RySUFMQdBbK3fn9x6xkVW7DH-mnjisJbGK1Tg9BB9Q",
    });

    console.log("✅ FCM Token:", token);

    // 🔥 Send to backend
    await axios.post("http://localhost:5000/api/fcm/save-token", {
      token,
    });

  } catch (err) {
    console.log("❌ Token error:", err);
  }
};

// 🔔 Listen for messages (foreground)
export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("📩 Message received:", payload);
    callback(payload);
  });
};