import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("aethershield_token"));
    const [username, setUsername] = useState(localStorage.getItem("aethershield_username"));
    const [role, setRole] = useState(localStorage.getItem("aethershield_role"));
    const [toast, setToast] = useState(null);

    const showToast = (title, message, type = "success") => {
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const login = async (user, pass) => {
        const data = await apiFetch("/api/auth/login", null, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        setToken(data.access_token);
        setUsername(data.username);
        setRole(data.role);
        localStorage.setItem("aethershield_token", data.access_token);
        localStorage.setItem("aethershield_username", data.username);
        localStorage.setItem("aethershield_role", data.role);
        showToast("Access Granted", `Welcome back, ${data.username}!`, "success");
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        setRole(null);
        localStorage.removeItem("aethershield_token");
        localStorage.removeItem("aethershield_username");
        localStorage.removeItem("aethershield_role");
        showToast("Session Terminated", "You have logged out.", "warning");
    };

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
            showToast("Session Expired", "Please log in again.", "danger");
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    return (
        <AuthContext.Provider value={{ token, username, role, toast, showToast, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
