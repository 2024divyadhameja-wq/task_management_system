import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getTasks, getTaskStats, deleteTask, updateTask, createTask, getAllUsers } from "../services/api";
import Loading from "../components/loading";
import StatsCard from "../components/StatsCard";
import TaskForm from "../components/TaskForm";

function AdminDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "users"
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData, usersData] = await Promise.all([
        getTasks(),
        getTaskStats().catch(() => ({
          totalTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
        })),
        getAllUsers().catch(() => []),
      ]);

      setTasks(tasksData || []);
      setStats(statsData);
      setUsers(usersData || []);
    } catch (err) {
      console.error("Admin dashboard load error:", err);
      setMessage("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (newTaskData) => {
    try {
      await createTask(newTaskData);
      setShowTaskForm(false);
      setMessage("Task created successfully!");
      loadData();
    } catch (err) {
      setMessage(err.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task as Admin?")) return;
    try {
      await deleteTask(taskId);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Administrator Control Center
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Welcome, {user?.name || user?.email}. Manage all system tasks, users, and workloads.
            </p>
          </div>

          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            {showTaskForm ? "Close Form" : "+ Create System Task"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-indigo-50 p-4 text-indigo-800 border border-indigo-200 flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-sm font-bold">✕</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks ?? tasks.length}
            description="All tasks in database"
          />
          <StatsCard
            title="Pending"
            value={stats.pendingTasks ?? tasks.filter((t) => t.status === "Pending").length}
            description="Awaiting action"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTasks ?? tasks.filter((t) => t.status === "In Progress").length}
            description="Actively worked on"
          />
          <StatsCard
            title="Registered Users"
            value={users.length}
            description="Active accounts in TaskFlow"
          />
        </div>

        {/* Create Task Form */}
        {showTaskForm && (
          <TaskForm
            onAddTask={handleCreateTask}
            onCancel={() => setShowTaskForm(false)}
          />
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-slate-300">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`pb-3 font-semibold transition ${
              activeTab === "tasks"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 font-semibold transition ${
              activeTab === "users"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Users & Roles ({users.length})
          </button>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === "tasks" ? (
          <div className="overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No tasks found in database.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <tr key={taskId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div>{task.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{task.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(taskId, e.target.value)}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-indigo-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{task.dueDate}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteTask(taskId)}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-md">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

