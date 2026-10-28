import { useState } from "react";

function TaskForm({ onAddTask, onCancel }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    const newTask = {
      title,
      description,
      priority,
      status,
      dueDate,
    };

    onAddTask(newTask);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setStatus("Pending");
    setDueDate("");
  };

  return (
    <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">

      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Create New Task
      </h2>

      <form onSubmit={handleSubmit}>

        {/* Title */}
        <div className="mb-5">

          <label className="mb-2 block font-semibold text-slate-700">
            Task Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3
            outline-none transition
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

        </div>

        {/* Description */}
        <div className="mb-5">

          <label className="mb-2 block font-semibold text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows="4"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3
            outline-none transition
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

        </div>

        {/* Priority + Status */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-semibold text-slate-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3
              outline-none focus:border-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

          </div>

          <div>

            <label className="mb-2 block font-semibold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3
              outline-none focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

          </div>

        </div>

        {/* Due Date */}
        <div className="mt-5">

          <label className="mb-2 block font-semibold text-slate-700">
            Due Date
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3
            outline-none focus:border-indigo-500"
          />

        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">

          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-3
            font-semibold text-white transition
            hover:bg-indigo-700"
          >
            Add Task
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-200 px-5 py-3
            font-semibold text-slate-700 transition
            hover:bg-slate-300"
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  );
}

export default TaskForm;