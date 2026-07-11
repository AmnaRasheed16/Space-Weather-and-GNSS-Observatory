export async function apiFetch(endpoint, token = null, options = {}) {
    const headers = options.headers || {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(endpoint, { ...options, headers });
    
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "API Request Failed");
    }
    
    return response.json();
}
