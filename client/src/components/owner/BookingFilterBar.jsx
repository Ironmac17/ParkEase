const BookingFilterBar = ({
  lots,
  filters,
  onChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
      <select
        value={filters.lotId}
        onChange={(e) =>
          onChange({ ...filters, lotId: e.target.value })
        }
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All Lots</option>
        {lots.map(lot => (
          <option key={lot._id} value={lot._id}>
            {lot.name}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value })
        }
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="COMPLETED">Completed</option>
        <option value="OVERTIME">Overtime</option>
        <option value="AUTO_CHECKED_OUT">
          Auto Checked Out
        </option>
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={(e) =>
          onChange({ ...filters, from: e.target.value })
        }
        className="border rounded px-3 py-2 text-sm"
      />

      <input
        type="date"
        value={filters.to}
        onChange={(e) =>
          onChange({ ...filters, to: e.target.value })
        }
        className="border rounded px-3 py-2 text-sm"
      />
    </div>
  );
};

export default BookingFilterBar;
