import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export default function Sidebar({ activePanel, onPanelSelect }) {
    const { token } = useContext(AuthContext);
    const [dbStatus, setDbStatus] = useState("Connected");

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await apiFetch("/api/status", token);
                setDbStatus(data.database);
            } catch (err) {
                setDbStatus("Disconnected");
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, [token]);

    const handleReseed = async () => {
        try {
            await apiFetch("/api/seed", token, { method: "POST" });
            window.dispatchEvent(new CustomEvent('dashboard:reseeded'));
        } catch (err) {
            console.error(err);
        }
    };

    const isConnected = dbStatus.includes("Connected");

    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-menu">
                <button className={`sidebar-item ${activePanel === 'overview' ? 'active' : ''}`} onClick={() => onPanelSelect("overview")}>
                    <i className="fa-solid fa-gauge"></i> Space Weather
                </button>
                <button className={`sidebar-item ${activePanel === 'tec' ? 'active' : ''}`} onClick={() => onPanelSelect("tec")}>
                    <i className="fa-solid fa-chart-line"></i> Ionospheric TEC
                </button>
                <button className={`sidebar-item ${activePanel === 'orbits' ? 'active' : ''}`} onClick={() => onPanelSelect("orbits")}>
                    <i className="fa-solid fa-compass"></i> Satellite Sky Plot
                </button>
                <button className={`sidebar-item ${activePanel === 'stations' ? 'active' : ''}`} onClick={() => onPanelSelect("stations")}>
                    <i className="fa-solid fa-house-laptop"></i> GNSS Stations
                </button>
                <button className={`sidebar-item ${activePanel === 'uploads' ? 'active' : ''}`} onClick={() => onPanelSelect("uploads")}>
                    <i className="fa-solid fa-file-arrow-up"></i> Data Ingestion
                </button>
            </div>
            <div className="sidebar-status-footer">
                <div className="db-conn-status">
                    <span className={`status-dot ${isConnected ? 'green' : 'red'}`}></span>
                    <span className="status-text">DB: {dbStatus}</span>
                </div>
                <button className="btn btn-xs btn-outline btn-block" onClick={handleReseed}>
                    <i className="fa-solid fa-arrows-rotate"></i> Reset/Seed DB
                </button>
            </div>
        </aside>
    );
}
