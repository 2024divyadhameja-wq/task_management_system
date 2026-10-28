import { useState } from "react";
import TaskCard from "../components/TaskCard";
import StatsCard from "../components/StatsCard";
import TaskForm from "../components/TaskForm";

function Home() {

  // Show or hide task form
  const [showForm, setShowForm] = useState(false);

  // Store all tasks
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
        "Create the database structure and define collections for users, tasks and projects.",
      priority: "Medium",
      status: "Pending",
      dueDate: "27 September 2026",
    },

    {
      id: 3,
      title: "Prepare Documentation",
      description:
        "Prepare project documentation including system features, workflow and implementation details.",
      priority: "Low",
      status: "Pending",
      dueDate: "30 September 2026",
    },

    {
      id: 4,
      title: "Complete React UI",
      description:
        "Build a responsive React user interface using Tailwind CSS components.",
      priority: "High",
      status: "In Progress",
      dueDate: "28 September 2026",
    },

    {
      id: 5,
      title: "Project Testing",
      description:
        "Test the application functionality and identify and fix errors before submission.",
      priority: "Medium",
      status: "Pending",
      dueDate: "2 October 2026",
    },
  ]);


  // Add a new task
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


  // Mark a task as Completed
  const handleCompleteTask = (taskId) => {

    setTasks((previousTasks) =>
      previousTasks.map((task) => {

        if (task.id === taskId) {
          return {
            ...task,
            status: "Completed",
          };
        }

        return task;
      })
    );
  };


  // Calculate dashboard statistics
  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;


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
            className="mt-8 rounded-lg bg-indigo-600 px-6 py-3
            font-semibold text-white shadow-md transition duration-300
            hover:bg-indigo-700 hover:shadow-lg"
          >
            Create Task
          </button>

        </div>

      </section>


      {/* ================= DASHBOARD ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h2>

          <p className="mt-1 text-slate-600">
            Overview of your current tasks
          </p>

        </div>


        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            description="All assigned tasks"
          />

          <StatsCard
            title="Pending"
            value={pendingTasks}
            description="Tasks waiting to start"
          />

          <StatsCard
            title="In Progress"
            value={inProgressTasks}
            description="Currently working"
          />

          <StatsCard
            title="Completed"
            value={completedTasks}
            description="Successfully completed"
          />

        </div>

      </section>


      {/* ================= TASK SECTION ================= */}

      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-900">
              My Tasks
            </h2>

            <p className="mt-1 text-slate-600">
              View and manage your assigned tasks
            </p>

          </div>


          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5
            font-semibold text-white transition duration-300
            hover:bg-indigo-700"
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {tasks.map((task) => (

            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              dueDate={task.dueDate}
              onComplete={() => handleCompleteTask(task.id)}
            />

          ))}

        </div>

      </section>

    </div>
  );
}

export default Home;