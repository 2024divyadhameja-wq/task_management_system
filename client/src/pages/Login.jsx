import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage("Please fill in all fields.");
      return;
    }

    login(formData.email);

    setMessage("Login successful!");

    setTimeout(() => {
      navigate("/");
    }, 500);
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-16">

      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-md">

        <h1 className="text-3xl font-bold text-slate-900">
          Login
        </h1>

        <p className="mt-2 text-slate-600">
          Login to manage your tasks and projects.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >

          {/* Email */}
          <div>

            <label className="mb-1 block font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300
              px-4 py-2 outline-none
              focus:border-indigo-500 focus:ring-2
              focus:ring-indigo-200"
            />

          </div>

          {/* Password */}
          <div>

            <label className="mb-1 block font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300
              px-4 py-2 outline-none
              focus:border-indigo-500 focus:ring-2
              focus:ring-indigo-200"
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600
            px-4 py-3 font-semibold text-white
            transition hover:bg-indigo-700"
          >
            Login
          </button>

          {/* Message */}
          {message && (
            <p className="text-center font-semibold text-green-600">
              {message}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}

export default Login;