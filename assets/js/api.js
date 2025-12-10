// assets/js/api.js

(function () {
  const API_BASE = 'http://127.0.0.1:8080/api';

  async function apiRequest(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }

    if (res.status === 204) return null;

    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  window.apiGet = function (path) {
    return apiRequest(path);
  };

  window.apiPost = function (path, body) {
    return apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  };

  window.apiPatch = function (path, body) {
    return apiRequest(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  };
})();
