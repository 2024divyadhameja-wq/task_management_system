import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    function handleConnect() {
      setConnected(true);
      console.log("Connected to TaskFlow notifications");
    }

    function handleDisconnect() {
      setConnected(false);
      console.log("Disconnected from TaskFlow notifications");
    }

    function addNotification(notification) {
      setNotifications((previous) => [
        {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
        },
        ...previous,
      ]);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("task:created", addNotification);
    socket.on("task:updated", addNotification);
    socket.on("task:deleted", addNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("task:created", addNotification);
      socket.off("task:updated", addNotification);
      socket.off("task:deleted", addNotification);
      socket.disconnect();
    };
  }, []);

  function clearNotifications() {
    setNotifications([]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex items-center justify-center rounded-lg p-2 text-white transition hover:bg-slate-800"
      >
        <span className="text-xl" aria-hidden="true">
          🔔
        </span>
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {notifications.length > 99 ? "99+" : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800">Task Notifications</h2>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Status:</span>
            <span
              className={`font-medium ${
                connected ? "text-green-600" : "text-amber-600"
              }`}
            >
              ● {connected ? "Live" : "Connecting..."}
            </span>
          </div>

          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No new notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:bg-slate-100"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

