function TaskCard({
  title,
  description,
  priority,
  status,
  dueDate,
  onComplete,
  onDelete,
}) {

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Top Status Bar */}
      <div
        className={`h-3 ${
          status === "Completed"
            ? "bg-green-500"
            : status === "In Progress"
            ? "bg-blue-500"
            : "bg-yellow-500"
        }`}
      ></div>

      <div className="p-6">

        {/* Status + Priority */}
        <div className="flex items-center justify-between">

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              status === "Completed"
                ? "bg-green-100 text-green-700"
                : status === "In Progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>

          <span className="text-sm font-semibold text-red-500">
            {priority}
          </span>

        </div>

        {/* Title */}
        <h2 className="mt-4 text-xl font-bold text-slate-800">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-slate-600">
          {description}
        </p>

        {/* Due Date */}
        <p className="mt-4 text-sm text-slate-500">
          Due Date: {dueDate}
        </p>

        {/* Buttons */}
        <div className="mt-5 flex flex-wrap gap-2">

          {status === "Completed" ? (

            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-green-500
              px-4 py-2 font-semibold text-white"
            >
              ✓ Completed
            </button>

          ) : (

            <button
              onClick={onComplete}
              className="rounded-lg bg-indigo-600 px-4 py-2
              font-semibold text-white transition
              hover:bg-indigo-700"
            >
              ✓ Complete
            </button>

          )}

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-500 px-4 py-2
            font-semibold text-white transition
            hover:bg-red-600"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default TaskCard;