import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAhTXVNrKS2pcddJQsgNzAMnRpMN30s1fo",
  authDomain: "rutms-5d587.firebaseapp.com",
  projectId: "rutms-5d587",
  storageBucket: "rutms-5d587.firebasestorage.app",
  messagingSenderId: "532733527306",
  appId: "1:532733527306:web:f035fdd6d9574c9f9ee6f3",
  measurementId: "G-WFN39DK6WS"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);