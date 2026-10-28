import { useState } from "react";

function Notifications() {

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned a new task: Complete Full Stack Assignment.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Task Due Soon",
      message: "Your task Design Database is due soon.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "Project Updated",
      message: "The Task Management System project has been updated.",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      title: "Task Completed",
      message: "Your React UI task has been marked as completed.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {

    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {

    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">

      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Task Management System
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-3 text-slate-600">
              Stay updated about your tasks and projects.
            </p>

          </div>

          <button
            onClick={markAllAsRead}
            className="rounded-lg bg-indigo-600 px-5 py-3
            font-semibold text-white transition
            hover:bg-indigo-700"
          >
            Mark All as Read
          </button>

        </div>

        {/* Notification Count */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-md">

          <p className="font-semibold text-slate-700">
            {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>

        </div>

        {/* Notifications */}
        <div className="space-y-4">

          {notifications.map((notification) => (

            <div
              key={notification.id}
              className={`rounded-xl p-5 shadow-md transition ${
                notification.read
                  ? "bg-white"
                  : "border-l-4 border-indigo-600 bg-indigo-50"
              }`}
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex gap-4">

                  {/* Notification Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-full ${
                      notification.read
                        ? "bg-slate-200 text-slate-600"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    🔔
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      {notification.title}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      {notification.message}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {notification.time}
                    </p>

                  </div>

                </div>

                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg border border-indigo-600
                    px-4 py-2 text-sm font-semibold
                    text-indigo-600 transition
                    hover:bg-indigo-600 hover:text-white"
                  >
                    Mark as Read
                  </button>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Notifications;