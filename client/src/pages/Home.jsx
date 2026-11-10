import { useEffect, useState } from "react";
import TaskCard from "../components/TaskCard";
import StatsCard from "../components/StatsCard";
import TaskForm from "../components/TaskForm";
import Loading from "../components/loading";
import { getTasks, getTaskStats, createTask, updateTask, deleteTask } from "../services/api";

function Home() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });

  const loadDashboardData = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        getTasks(),
        getTaskStats().catch(() => null),
      ]);

      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      }

      if (statsData) {
        setStats(statsData);
      } else if (Array.isArray(tasksData)) {
        setStats({
          totalTasks: tasksData.length,
          pendingTasks: tasksData.filter((t) => t.status === "Pending").length,
          inProgressTasks: tasksData.filter((t) => t.status === "In Progress").length,
          completedTasks: tasksData.filter((t) => t.status === "Completed").length,
        });
      }
    } catch (err) {
      console.warn("Could not load tasks from API, using fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Add a new task
  const handleAddTask = async (newTask) => {
    try {
      const result = await createTask(newTask);
      if (result?.task) {
        setTasks((prev) => [result.task, ...prev]);
      } else {
        loadDashboardData();
      }
      setShowForm(false);
    } catch (err) {
      alert(err.message || "Failed to create task");
    }
  };

  // Mark a task as Completed
  const handleCompleteTask = async (taskId) => {
    try {
      await updateTask(taskId, { status: "Completed" });
      setTasks((prev) =>
        prev.map((task) => {
          const currentId = task._id || task.id;
          if (currentId === taskId) {
            return { ...task, status: "Completed" };
          }
          return task;
        })
      );
      // Refresh stats
      getTaskStats()
        .then((s) => s && setStats(s))
        .catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to complete task");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => (task._id || task.id) !== taskId));
      getTaskStats()
        .then((s) => s && setStats(s))
        .catch(() => {});
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-indigo-50 px-6 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            Task Management System
          </p>

          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Manage Your Tasks
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Organize your work, track your progress, and complete
            your tasks efficiently with TaskFlow.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-indigo-700 hover:shadow-lg"
          >
            Create Task
          </button>
        </div>
      </section>

      {/* ================= DASHBOARD ================= */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-slate-600">Overview of your current tasks</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            description="All assigned tasks"
          />
          <StatsCard
            title="Pending"
            value={stats.pendingTasks}
            description="Tasks waiting to start"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTasks}
            description="Currently working"
          />
          <StatsCard
            title="Completed"
            value={stats.completedTasks}
            description="Successfully completed"
          />
        </div>
      </section>

      {/* ================= TASK SECTION ================= */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Tasks</h2>
            <p className="mt-1 text-slate-600">View and manage your tasks</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition duration-300 hover:bg-indigo-700"
          >
            {showForm ? "Close Form" : "+ Add Task"}
          </button>
        </div>

        {/* ================= TASK FORM ================= */}
        {showForm && (
          <TaskForm
            onAddTask={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* ================= TASK CARDS ================= */}
        {loading ? (
          <Loading />
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
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
            <h3 className="text-xl font-bold text-slate-800">No Tasks in Database</h3>
            <p className="mt-2 text-slate-500">
              Click &quot;+ Add Task&quot; above to create your first persistent task.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
