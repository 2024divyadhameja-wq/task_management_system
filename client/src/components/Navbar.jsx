import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

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
          <Link
            to="/"
            className="transition hover:text-indigo-400"
          >
            Home
          </Link>

          {/* Tasks */}
          <Link
            to="/tasks"
            className="transition hover:text-indigo-400"
          >
            Tasks
          </Link>

          {/* Projects */}
          <Link
            to="/projects"
            className="transition hover:text-indigo-400"
          >
            Projects
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="transition hover:text-indigo-400"
          >
            Notifications
          </Link>

          {/* Logged In User */}
          {user ? (
            <>
              {/* My Tasks */}
              <Link
                to="/my-tasks"
                className="transition hover:text-indigo-400"
              >
                My Tasks
              </Link>

              {/* User Email */}
              <span className="text-sm text-slate-300">
                Hi, {user.email}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2
                font-semibold transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="transition hover:text-indigo-400"
              >
                Login
              </Link>
            </>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-slate-600 px-3 py-2 md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-700 px-6 py-4 md:hidden">

          <div className="flex flex-col gap-4">

            {/* Home */}
            <Link
              to="/"
              onClick={closeMenu}
            >
              Home
            </Link>

            {/* Tasks */}
            <Link
              to="/tasks"
              onClick={closeMenu}
            >
              Tasks
            </Link>

            {/* Projects */}
            <Link
              to="/projects"
              onClick={closeMenu}
            >
              Projects
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              onClick={closeMenu}
            >
              Notifications
            </Link>

            {user ? (
              <>
                {/* My Tasks */}
                <Link
                  to="/my-tasks"
                  onClick={closeMenu}
                >
                  My Tasks
                </Link>

                {/* User Email */}
                <p className="text-sm text-slate-300">
                  Logged in as {user.email}
                </p>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-left
                  font-semibold transition hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
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