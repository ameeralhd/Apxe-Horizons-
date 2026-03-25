const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
    // If the path already has a protocol, return as is
    if (path.startsWith('http')) return path;
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // If API_BASE_URL is set but lacks protocol, prepend https://
    let baseUrl = API_BASE_URL;
    if (baseUrl && !baseUrl.startsWith('http')) {
        baseUrl = `https://${baseUrl}`;
    }
    
    // Combine base URL and path
    return `${baseUrl}${normalizedPath}`;
};

export default API_BASE_URL;
