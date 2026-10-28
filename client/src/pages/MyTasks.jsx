import useAuth from "../hooks/useAuth";

function MyTasks() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-16">

      <div className="mx-auto max-w-7xl">

        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Task Management System
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-900">
          My Tasks
        </h1>

        {user ? (
          <p className="mt-4 text-slate-600">
            Welcome,{" "}
            <span className="font-semibold text-slate-900">
              {user.email}
            </span>
            . Your assigned tasks will appear here.
          </p>
        ) : (
          <p className="mt-4 text-red-600">
            Please login to view your tasks.
          </p>
        )}

        {/* Task Information */}
        {user && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-700">
                Pending Tasks
              </h2>

              <p className="mt-3 text-3xl font-bold text-yellow-500">
                3
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-700">
                In Progress
              </h2>

              <p className="mt-3 text-3xl font-bold text-blue-500">
                2
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-slate-700">
                Completed
              </h2>

              <p className="mt-3 text-3xl font-bold text-green-500">
                5
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default MyTasks;