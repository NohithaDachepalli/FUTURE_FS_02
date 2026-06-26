import { apiUrl } from './api';

export async function downloadReport(fileName) {
  const token = localStorage.getItem('leadflow_token') || sessionStorage.getItem('leadflow_token');
  const response = await fetch(`${apiUrl}/reports/${fileName}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!response.ok) throw new Error('Export failed');

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

