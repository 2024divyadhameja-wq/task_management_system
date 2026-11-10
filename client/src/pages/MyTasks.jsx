import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import TaskCard from "../components/TaskCard";
import Loading from "../components/loading";
import { getTasks, updateTask, deleteTask } from "../services/api";

function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks({ myTasks: true });
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Failed to load user tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyTasks();
    }
  }, [user]);

  const handleCompleteTask = async (id) => {
    try {
      await updateTask(id, { status: "Completed" });
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, status: "Completed" } : t))
      );
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Task Management System
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          My Assigned Tasks
        </h1>

        {user ? (
          <p className="mt-4 text-slate-600">
            Welcome,{" "}
            <span className="font-semibold text-slate-900">
              {user.name || user.email}
            </span>
            . Below are your assigned and created tasks.
          </p>
        ) : (
          <p className="mt-4 text-red-600">Please login to view your tasks.</p>
        )}

        {/* Task Summary Badges */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-yellow-500">
            <h2 className="text-lg font-semibold text-slate-700">Pending Tasks</h2>
            <p className="mt-3 text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-blue-500">
            <h2 className="text-lg font-semibold text-slate-700">In Progress</h2>
            <p className="mt-3 text-3xl font-bold text-blue-600">{inProgressCount}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-green-500">
            <h2 className="text-lg font-semibold text-slate-700">Completed</h2>
            <p className="mt-3 text-3xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Your Tasks ({tasks.length})
          </h2>

          {tasks.length > 0 ? (
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
              <h3 className="text-xl font-bold text-slate-800">No Personal Tasks Found</h3>
              <p className="mt-2 text-slate-500">
                You currently do not have any tasks assigned or created by you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
