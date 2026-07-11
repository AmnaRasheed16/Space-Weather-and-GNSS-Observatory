import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export default function Hero({ onLoginOpen, onDashboardEnter }) {
    const { token } = useContext(AuthContext);
    const [satellites, setSatellites] = useState([]);

    useEffect(() => {
        const fetchSatellites = async () => {
            try {
                const data = await apiFetch("/api/satellites");
                setSatellites(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSatellites();
        const interval = setInterval(fetchSatellites, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleEnterClick = () => {
        if (token) {
            onDashboardEnter();
        } else {
            onLoginOpen();
        }
    };

    return (
        <section className="hero-section" id="about-section">
            <div className="hero-content">
                <div className="observatory-status-pill animate-pulse">
                    <span className="status-dot green"></span>
                    <span className="status-pill-text">Observatory System: Online</span>
                </div>
                <h1 className="hero-title">Aether<span className="text-glow">Shield</span></h1>
                <h2 className="hero-subtitle-scientific">Space Weather & GNSS Observatory</h2>
                <p className="hero-description">
                    Advanced tracking of ionospheric scintillation, solar flare trajectories, and regional Total Electron Content (TEC) anomalies. Designed to safeguard satellite networks.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-large btn-primary" onClick={handleEnterClick}>
                        <i className="fa-solid fa-satellite-dish"></i> Access Cockpit Dashboard
                    </button>
                    <a href="#scales-console-section" className="btn btn-large btn-secondary">Analyze NOAA Scales</a>
                </div>
                <div className="partner-branding-footer">
                    <span className="partner-title">Observatory Network Partners:</span>
                    <div className="partner-logo-row">
                        <div className="partner-badge">
                            <i className="fa-solid fa-building-columns"></i> Institute of Space Technology (IST)
                        </div>
                        <div className="partner-badge">
                            <i className="fa-solid fa-satellite"></i> National Center of GIS & Space Applications
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-radar-visual glass-card">
                <div className="radar-visual-header">
                    <div className="header-indicator">
                        <span class="pulse-indicator"></span>
                        <h4>ACTIVE ORBITAL SCANNER</h4>
                    </div>
                    <span className="live-tag">REAL-TIME</span>
                </div>
                <div className="public-radar-container">
                    <svg id="public-sky-plot-svg" viewBox="0 0 400 400" width="100%" height="100%">
                        <circle cx="200" cy="200" r="180" className="radar-grid-line" />
                        <circle cx="200" cy="200" r="120" className="radar-grid-line" />
                        <circle cx="200" cy="200" r="60" className="radar-grid-line" />
                        <circle cx="200" cy="200" r="2" className="radar-grid-center" />
                        <line x1="200" y1="20" x2="200" y2="380" className="radar-grid-line" />
                        <line x1="20" y1="200" x2="380" y2="200" className="radar-grid-line" />
                        <text x="200" y="15" className="radar-label" textAnchor="middle">N (0°)</text>
                        <text x="390" y="205" className="radar-label" textAnchor="start">E (90°)</text>
                        <text x="200" y="395" className="radar-label" textAnchor="middle">S (180°)</text>
                        <text x="10" y="205" className="radar-label" textAnchor="end">W (270°)</text>
                        <line x1="200" y1="200" x2="200" y2="20" className="radar-sweep-line" transformOrigin="200 200" />
                        <g id="public-sky-plot-satellites-group">
                            {satellites.map(sat => {
                                const radius = 180 * ((90 - sat.elevation) / 90.0);
                                const azimuthRad = (sat.azimuth * Math.PI) / 180.0;
                                const x = 200 + radius * Math.sin(azimuthRad);
                                const y = 200 - radius * Math.cos(azimuthRad);
                                let dotColor = "#2563eb";
                                if (sat.constellation === "GLONASS") dotColor = "#ef4444";
                                else if (sat.constellation === "Galileo") dotColor = "#10b981";
                                else if (sat.constellation === "BeiDou") dotColor = "#eab308";
                                return (
                                    <g key={sat.id}>
                                        <circle 
                                            cx={x} cy={y} r="5" fill={dotColor} className="sat-dot"
                                            style={{ filter: `drop-shadow(0 0 4px ${dotColor})` }}
                                        >
                                            <title>{`${sat.id} (${sat.constellation})\nElev: ${sat.elevation}°\nAzim: ${sat.azimuth}°\nSNR: ${sat.snr} dB-Hz`}</title>
                                        </circle>
                                        <text x={x + 8} y={y + 4} className="sat-label">{sat.id}</text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>
                <div className="radar-constellation-legend">
                    <span className="legend-badge gps">GPS</span>
                    <span className="legend-badge glonass">GLONASS</span>
                    <span className="legend-badge galileo">Galileo</span>
                    <span className="legend-badge beidou">BeiDou</span>
                </div>
            </div>
        </section>
    );
}
