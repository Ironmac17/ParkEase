export const exportToCSV = (rows, filename) => {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","), // header row
    ...rows.map(row =>
      headers
        .map(key => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
