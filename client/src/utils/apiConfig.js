const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
    // If the path already has a protocol, return as is
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Combine base URL and path
    return `${API_BASE_URL}${normalizedPath}`;
};

export default API_BASE_URL;
