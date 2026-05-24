const BACKEND_URL = 'http://localhost:5237';

export const getImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // path already has /uploads/offers/... so just prepend backend URL
  return `${BACKEND_URL}${path}`;
};