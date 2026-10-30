import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = '/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('p10_token') || localStorage.getItem('p9_token') || localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('p10_user') || localStorage.getItem('p9_user') || localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // In-Memory Caching telemetry state
  const [bypassCache, setBypassCache] = useState(false);
  const [lastCacheEvent, setLastCacheEvent] = useState(null);

  // Sync auth state with localStorage
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
          localStorage.setItem('p9_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify session token:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    localStorage.setItem('p10_token', data.token);
    localStorage.setItem('p10_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.details
        ? data.details.join('. ')
        : data.error || 'Registration failed.';
      throw new Error(errorMsg);
    }

    localStorage.setItem('p10_token', data.token);
    localStorage.setItem('p10_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('p10_token');
    localStorage.removeItem('p10_user');
    localStorage.removeItem('p9_token');
    localStorage.removeItem('p9_user');
    setToken(null);
    setUser(null);
  };

  // Authenticated fetch wrapper with caching telemetry & bypass support
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (bypassCache) {
      headers['Cache-Control'] = 'no-cache';
    }

    const startTime = performance.now();
    const response = await fetch(url, { ...options, headers });
    const endTime = performance.now();
    const duration = parseFloat((endTime - startTime).toFixed(2));

    const cacheHeader = response.headers.get('x-cache') || 'BYPASS';
    const cacheKey = response.headers.get('x-cache-key') || '';
    const cacheTTL = response.headers.get('x-cache-ttl') || '';
    const serverDuration = response.headers.get('x-response-time') || `${duration}ms`;

    const eventData = {
      url,
      method: options.method || 'GET',
      status: response.status,
      duration,
      serverDuration,
      cacheHeader,
      cacheKey,
      cacheTTL,
      timestamp: new Date().toLocaleTimeString()
    };

    setLastCacheEvent(eventData);

    if (response.status === 401) {
      logout();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }

    // Attach eventData to response for callers that need it
    response.eventData = eventData;
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        authFetch,
        bypassCache,
        setBypassCache,
        lastCacheEvent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
