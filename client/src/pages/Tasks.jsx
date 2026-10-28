import { useEffect, useState } from "react";

import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Loading from "../components/Loading";

function Tasks() {
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete Full Stack Assignment",
      description:
        "Develop the frontend and backend components of the task management system.",
      priority: "High",
      status: "In Progress",
      dueDate: "25 September 2026",
    },
    {
      id: 2,
      title: "Design Database",
      description:
        "Create collections for users, tasks and projects.",
      priority: "Medium",
      status: "Pending",
      dueDate: "27 September 2026",
    },
    {
      id: 3,
      title: "Prepare Documentation",
      description:
        "Prepare project documentation and implementation details.",
      priority: "Low",
      status: "Pending",
      dueDate: "30 September 2026",
    },
    {
      id: 4,
      title: "Complete React UI",
      description:
        "Build a responsive React interface using Tailwind CSS.",
      priority: "High",
      status: "In Progress",
      dueDate: "28 September 2026",
    },
    {
      id: 5,
      title: "Project Testing",
      description:
        "Test the application and fix errors before submission.",
      priority: "Medium",
      status: "Pending",
      dueDate: "2 October 2026",
    },
  ]);

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: Date.now(),
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      taskWithId,
    ]);

    setShowForm(false);
  };

  const handleCompleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "Completed",
            }
          : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== id)
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  // Show Loading component
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

              <h1 className="text-4xl font-bold text-slate-900">
                My Tasks
              </h1>

              <p className="mt-3 text-slate-600">
                Search, filter and manage your tasks.
              </p>

            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-5 py-3
              font-semibold text-white shadow-md transition
              duration-300 hover:bg-indigo-700 hover:shadow-lg"
            >
              {showForm ? "Close Form" : "+ Add Task"}
            </button>

          </div>

        </div>

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
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300
            px-4 py-3 outline-none transition
            focus:border-indigo-500 focus:ring-2
            focus:ring-indigo-200"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300
            px-4 py-3 outline-none
            focus:border-indigo-500"
          >
            <option value="All">
              All Tasks
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>
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

            {filteredTasks.map((task) => (

              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                status={task.status}
                dueDate={task.dueDate}
                onComplete={() =>
                  handleCompleteTask(task.id)
                }
                onDelete={() =>
                  handleDeleteTask(task.id)
                }
              />

            ))}

          </div>

        ) : (

          <div className="rounded-xl bg-white p-10 text-center shadow-md">

            <h2 className="text-xl font-bold text-slate-800">
              No Tasks Found
            </h2>

            <p className="mt-2 text-slate-500">
              Try another search or filter.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default Tasks;