function StatsCard({ title, value, description }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition duration-300 hover:shadow-xl">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-sm text-slate-600">
        {description}
      </p>

    </div>
  );
}

export default StatsCard;