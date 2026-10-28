function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-100">
      <div className="text-center">

        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full
          border-4 border-slate-300 border-t-indigo-600"
        ></div>

        <p className="mt-4 text-lg font-semibold text-slate-700">
          Loading...
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Please wait while we load your tasks.
        </p>

      </div>
    </div>
  );
}

export default Loading;