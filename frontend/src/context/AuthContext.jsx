import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.token) {
            const decodedToken = JSON.parse(atob(parsedUser.token.split('.')[1]));
            if (decodedToken.exp * 1000 < Date.now()) {
              // Token expired
              logout();
              return;
            }
          }
          setUser(parsedUser);
        } catch (error) {
          logout();
          return;
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Axios interceptor to catch 401 Unauthorized errors globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, { email, password });
      setUser(data);
      if (rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(data));
      } else {
        sessionStorage.setItem('userInfo', JSON.stringify(data));
      }
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/users`, { name, email, password, phone });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const updateUserState = (userData) => {
    setUser(userData);
    if (localStorage.getItem('userInfo')) {
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } else if (sessionStorage.getItem('userInfo')) {
      sessionStorage.setItem('userInfo', JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserState }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

