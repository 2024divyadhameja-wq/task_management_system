import { useEffect, useState } from "react";
import { getProjects, createProject } from "../services/api";

const initialProjects = [
  {
    name: "Task Management System",
    description: "Develop a complete task management application using React and Tailwind CSS.",
    status: "In Progress",
    tasks: 8,
    progress: 65,
  },
  {
    name: "College Assignment",
    description: "Complete academic assignments and prepare documentation for submission.",
    status: "In Progress",
    tasks: 5,
    progress: 50,
  },
  {
    name: "Personal Portfolio",
    description: "Design and develop a personal portfolio website showcasing projects and skills.",
    status: "Pending",
    tasks: 4,
    progress: 20,
  },
];

function Projects() {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      }
    } catch (err) {
      console.warn("Using offline projects list:", err.message);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();

    const newProjectPayload = {
      name: projectName,
      description: description,
      status: "Pending",
      tasks: 0,
      progress: 0,
    };

    try {
      const response = await createProject(newProjectPayload);
      if (response?.project) {
        setProjects((prev) => [response.project, ...prev]);
      } else {
        setProjects((prev) => [
          { ...newProjectPayload, id: Date.now() },
          ...prev,
        ]);
      }
    } catch (err) {
      // Local fallback
      setProjects((prev) => [
        { ...newProjectPayload, id: Date.now() },
        ...prev,
      ]);
    }

    setProjectName("");
    setDescription("");
    setShowForm(false);
  };

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
              <h1 className="text-4xl font-bold text-slate-900">My Projects</h1>
              <p className="mt-3 text-slate-600">
                Organize your tasks into different projects.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
            >
              {showForm ? "Close Form" : "+ Add Project"}
            </button>
          </div>
        </div>

        {/* Add Project Form */}
        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Create New Project
            </h2>

            <form onSubmit={handleAddProject}>
              <div className="mb-5">
                <label className="mb-2 block font-semibold text-slate-700">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="mb-5">
                <label className="mb-2 block font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows="4"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg bg-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id || project.id || project.name}
              className="rounded-xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Project Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    project.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {project.status}
                </span>

                <span className="text-sm font-semibold text-slate-500">
                  {project.tasks || 0} Tasks
                </span>
              </div>

              {/* Project Name */}
              <h2 className="mt-5 text-xl font-bold text-slate-800">
                {project.name}
              </h2>

              {/* Description */}
              <p className="mt-2 text-slate-600">{project.description}</p>

              {/* Progress */}
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Progress</span>
                  <span className="text-slate-500">{project.progress || 0}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* View Project */}
              <button
                type="button"
                className="mt-6 w-full rounded-lg border border-indigo-600 px-4 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
              >
                View Project
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
