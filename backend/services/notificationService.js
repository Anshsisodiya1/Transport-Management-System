const admin = require("firebase-admin");

// 🔥 Load your Firebase service account key
const serviceAccount = require("../config/firebaseKey.json");

// 🔥 Initialize Firebase (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ============================================
// 📲 SEND PUSH NOTIFICATION
// ============================================
const sendNotification = async (tokens, title, body) => {
  try {
    if (!tokens || tokens.length === 0) {
      console.log("⚠️ No FCM tokens found");
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens, // multiple devices
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("✅ Notifications sent:", response.successCount);
    console.log("❌ Failed:", response.failureCount);

    return response;

  } catch (error) {
    console.error("🔥 Notification Error:", error);
  }
};

module.exports = { sendNotification };