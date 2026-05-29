export function exportAnalyticsCsv(data: any[], filename: string = 'analytics.csv') {
  if (!Array.isArray(data) || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvRows = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))];
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
