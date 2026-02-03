const BookingFilterBar = ({ lots, filters, onChange }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-4 flex flex-wrap gap-3 border border-slate-700/50">
      <select
        value={filters.lotId}
        onChange={(e) => onChange({ ...filters, lotId: e.target.value })}
        className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-gray-200 hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition"
      >
        <option value="">All Lots</option>
        {lots.map((lot) => (
          <option key={lot._id} value={lot._id}>
            {lot.name}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-gray-200 hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={(e) => onChange({ ...filters, from: e.target.value })}
        className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-gray-200 hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition"
      />

      <input
        type="date"
        value={filters.to}
        onChange={(e) => onChange({ ...filters, to: e.target.value })}
        className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-gray-200 hover:border-blue-500/50 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  );
};

export default BookingFilterBar;
