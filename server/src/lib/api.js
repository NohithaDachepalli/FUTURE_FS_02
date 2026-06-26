const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is not defined. Add it to client/.env, for example: VITE_API_URL=http://localhost:5001/api');
}

const getToken = () => localStorage.getItem('leadflow_token') || sessionStorage.getItem('leadflow_token');

export const apiUrl = API_URL;

export async function api(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error(`Cannot reach the CRM API at ${API_URL}. Start the backend server and check MongoDB.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export const leadStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'];
export const leadSources = [
  'Website Contact Form',
  'Landing Page',
  'Social Media',
  'LinkedIn',
  'Referral',
  'Advertisement',
  'Manual Entry'
];
