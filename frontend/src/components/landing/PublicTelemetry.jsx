import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

export default function PublicTelemetry() {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await apiFetch("/api/weather/current");
                setWeather(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchWeather();
        const interval = setInterval(fetchWeather, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!weather) return null;

    return (
        <section className="live-environment-grid" id="public-live-metrics">
            <div className="section-header-centered">
                <h2 className="section-title">Live Space <span className="text-glow">Telemetry</span></h2>
                <p className="section-desc">Real-time parameters fetched directly from orbital sensors and planetary magnetometer networks.</p>
            </div>
            <div className="grid-3">
                <div className="glass-card metric-display-card">
                    <div className="card-header-small">
                        <span>Kp Index (Geomagnetic Activity)</span>
                        <i className="fa-solid fa-gauge text-cyan"></i>
                    </div>
                    <div className="metric-value-box">
                        <span className="metric-val text-glow-green" id="public-kp-value">
                            {weather.kp_index.toFixed(1)}
                        </span>
                        <span className="metric-status text-glow-green">Quiet State</span>
                    </div>
                    <p className="metric-explanation">Estimated global geomagnetic activity indicator. Kp values below 5.0 denote minor perturbations.</p>
                </div>
                
                <div className="glass-card metric-display-card">
                    <div className="card-header-small">
                        <span>Solar Wind Velocity</span>
                        <i className="fa-solid fa-wind text-purple"></i>
                    </div>
                    <div className="metric-value-box">
                        <span className="metric-val" id="public-wind-value">
                            {Math.round(weather.solar_wind_speed)} km/s
                        </span>
                        <span className="metric-status text-purple">Normal Velocity</span>
                    </div>
                    <p className="metric-explanation">Interplanetary particle streams velocity. Typical ambient speed averages 300 to 500 km/sec.</p>
                </div>
                
                <div className="glass-card metric-display-card">
                    <div className="card-header-small">
                        <span>Noon 10.7cm Radio Flux</span>
                        <i className="fa-solid fa-solar-panel text-orange"></i>
                    </div>
                    <div className="metric-value-box">
                        <span className="metric-val" id="public-flux-value">
                            {Math.round(weather.radio_flux)} sfu
                        </span>
                        <span className="metric-status text-orange">Optimal Flux</span>
                    </div>
                    <p className="metric-explanation">Solar activity indicator correlating with UV levels. Critical for forecasting ionospheric density peaks.</p>
                </div>
            </div>
        </section>
    );
}
