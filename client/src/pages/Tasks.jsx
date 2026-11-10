import { useEffect, useState } from "react";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Loading from "../components/loading";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

function Tasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Unable to load tasks from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (newTask) => {
    try {
      const result = await createTask(newTask);
      if (result?.task) {
        setTasks((prev) => [result.task, ...prev]);
      } else {
        loadTasks();
      }
      setShowForm(false);
    } catch (err) {
      alert(err.message || "Failed to create task");
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await updateTask(id, { status: "Completed" });
      setTasks((prev) =>
        prev.map((task) =>
          (task._id || task.id) === id
            ? { ...task, status: "Completed" }
            : task
        )
      );
    } catch (err) {
      alert(err.message || "Failed to complete task");
    }
  };

  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => (task._id || task.id) !== id));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const titleMatch = (task.title || "").toLowerCase().includes(search.toLowerCase());
    const descMatch = (task.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    const matchesFilter = filter === "All" || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Task Management System
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">All Tasks</h1>
              <p className="mt-3 text-slate-600">
                Search, filter and manage your persistent tasks.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-indigo-700 hover:shadow-lg"
            >
              {showForm ? "Close Form" : "+ Add Task"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <TaskForm
            onAddTask={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-md md:flex-row">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Count */}
        <div className="mb-6">
          <p className="font-semibold text-slate-700">
            Showing {filteredTasks.length} task(s)
          </p>
        </div>

        {/* Task Cards */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => {
              const taskId = task._id || task.id;
              return (
                <TaskCard
                  key={taskId}
                  title={task.title}
                  description={task.description}
                  priority={task.priority}
                  status={task.status}
                  dueDate={task.dueDate}
                  onComplete={() => handleCompleteTask(taskId)}
                  onDelete={() => handleDeleteTask(taskId)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-10 text-center shadow-md">
            <h2 className="text-xl font-bold text-slate-800">No Tasks Found</h2>
            <p className="mt-2 text-slate-500">
              Try another search or filter, or create a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
