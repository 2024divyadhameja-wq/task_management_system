import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/login");
  }

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-bold transition hover:text-indigo-400"
        >
          TaskFlow
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Home */}
          <Link to="/" className="transition hover:text-indigo-400">
            Home
          </Link>

          {/* Tasks */}
          <Link to="/tasks" className="transition hover:text-indigo-400">
            Tasks
          </Link>

          {/* Projects */}
          <Link to="/projects" className="transition hover:text-indigo-400">
            Projects
          </Link>

          {/* Notifications */}
          <Link to="/notifications" className="transition hover:text-indigo-400">
            Notifications
          </Link>

          {/* Logged In User */}
          {user ? (
            <>
              {/* My Tasks */}
              <Link to="/my-tasks" className="transition hover:text-indigo-400">
                My Tasks
              </Link>

              {/* Admin Dashboard if admin */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-lg bg-indigo-800 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-700 hover:text-white"
                >
                  Admin Panel
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Greeting */}
              <span className="text-sm text-slate-300">
                Hi, {user.name || user.email}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* Login */}
              <Link to="/login" className="transition hover:text-indigo-400">
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Notification + Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <NotificationBell />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-700 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={closeMenu} className="hover:text-indigo-400">
              Home
            </Link>

            <Link to="/tasks" onClick={closeMenu} className="hover:text-indigo-400">
              Tasks
            </Link>

            <Link to="/projects" onClick={closeMenu} className="hover:text-indigo-400">
              Projects
            </Link>

            <Link to="/notifications" onClick={closeMenu} className="hover:text-indigo-400">
              Notifications
            </Link>

            {user ? (
              <>
                <Link to="/my-tasks" onClick={closeMenu} className="hover:text-indigo-400">
                  My Tasks
                </Link>

                {user.role === "admin" && (
                  <Link to="/admin" onClick={closeMenu} className="text-indigo-400 font-semibold">
                    Admin Dashboard
                  </Link>
                )}

                <p className="text-sm text-slate-300">
                  Logged in as {user.name || user.email} {user.role === "admin" && "(Admin)"}
                </p>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-left font-semibold transition hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="hover:text-indigo-400">
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu} className="text-indigo-400 font-semibold">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
