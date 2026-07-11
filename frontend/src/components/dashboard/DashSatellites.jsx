import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export default function DashSatellites() {
  const { token } = useContext(AuthContext);
  const [satellites, setSatellites] = useState([]);

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        const data = await apiFetch("/api/satellites", token);
        setSatellites(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSatellites();
    const interval = setInterval(fetchSatellites, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const stats = React.useMemo(() => {
    const constellations = { GPS: [], GLONASS: [], Galileo: [], BeiDou: [] };
    satellites.forEach(s => {
      if (constellations[s.constellation]) constellations[s.constellation].push(s.snr);
    });
    const result = {};
    Object.keys(constellations).forEach(key => {
      const arr = constellations[key];
      const avg = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      result[key] = { count: arr.length, avg };
    });
    return result;
  }, [satellites]);

  return (
    <section className="dashboard-panel" id="panel-orbits">
      <div className="panel-header">
        <h2>Real-time Satellite Visibility</h2>
        <p>Tracks active constellations: GPS (G), GLONASS (R), Galileo (E), and BeiDou (C).</p>
      </div>
      <div className="orbits-grid-wrapper">
        <div className="glass-card widget-sky-radar">
          <h4>Sky Plot Diagram (Azimuth vs. Elevation)</h4>
          <div className="sky-radar-container">
            <svg id="sky-plot-svg" viewBox="0 0 400 400" width="100%" height="100%">
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
              <text x="200" y="135" className="radar-marker-label" textAnchor="middle">60°</text>
              <text x="200" y="75" className="radar-marker-label" textAnchor="middle">30°</text>
              <g id="sky-plot-satellites-group">
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
                      <circle cx={x} cy={y} r="6" fill={dotColor} style={{ filter: `drop-shadow(0 0 5px ${dotColor})` }} />
                      <text x={x + 9} y={y + 4} className="sat-label">{sat.id}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
        <div className="glass-card widget-constellation-stats">
          <h4>Constellation Signal Health (SNR)</h4>
          <div className="signal-chart-wrapper">
            {Object.keys(stats).map(key => {
              const info = stats[key];
              const pct = Math.min(100, Math.round((info.avg / 50.0) * 100));
              let barColor = "bg-blue";
              if (key === "GLONASS") barColor = "bg-red";
              else if (key === "Galileo") barColor = "bg-green";
              else if (key === "BeiDou") barColor = "bg-yellow";
              return (
                <div className="snr-bar-row" key={key}>
                  <span className="snr-label">{key}</span>
                  <div className="snr-progress-bg">
                    <div className={`snr-progress-bar ${barColor}`} style={{ width: `${pct}%` }}>
                      {pct}% (Avg {info.avg} dB-Hz)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <h4 className="mt-20">Visible Satellite Feed</h4>
          <div className="satellite-list-scrollable" id="satellite-table-body">
            {satellites.map(sat => (
              <div className="sat-list-item" key={sat.id}>
                <span><strong>{sat.id}</strong> ({sat.constellation})</span>
                <span>Elev: {sat.elevation}° | Azim: {sat.azimuth}° | SNR: <strong>{sat.snr}</strong> dB-Hz</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
