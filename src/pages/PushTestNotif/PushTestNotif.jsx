import React, { useState } from "react";

export const PushTestNotif = () => {
  const [registration, setRegistration] = useState(null);

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("Service Worker registered");
      setRegistration(reg);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied.");
        return;
      }
    } catch (err) {
      console.error("Error registering SW:", err);
    }
  };

  const sendTestNotification = () => {
    if (!registration) return;

    registration.showNotification("Test Notification", {
      body: "این یک پیام تستی است!",
      icon: "/pill.png"
    });
  };

  return (
    <div>
      <h2>Push Notification Test</h2>
      <button onClick={registerServiceWorker}>Enable Notifications</button>
      <button onClick={sendTestNotification} disabled={!registration}>
        Send Test Notification
      </button>
    </div>
  );
};
