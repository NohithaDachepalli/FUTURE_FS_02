const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
};

const toCsv = (rows, headers) => {
  const lines = [headers.map((header) => escapeCsv(header.label)).join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(header.value(row))).join(','));
  });
  return lines.join('\n');
};

module.exports = toCsv;

