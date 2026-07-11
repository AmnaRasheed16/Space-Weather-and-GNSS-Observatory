import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LogarithmicScale, PointElement, LineElement, Tooltip, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LogarithmicScale, PointElement, LineElement, Tooltip, Filler);

export default function DashOverview({ weather, history }) {
  if (!weather) return null;

  const needleDegrees = (weather.kp_index / 9.0) * 180;
  const isStorm = weather.kp_index >= 5;
  const isMinor = weather.kp_index >= 3 && weather.kp_index < 5;

  const chartData = useMemo(() => {
    if (!history?.xray_flux) return null;
    return {
      labels: history.xray_flux.map(d => d.time),
      datasets: [{
        label: 'X-Ray Irradiance (W/m²)',
        data: history.xray_flux.map(d => d.value),
        borderColor: '#ff7b00',
        borderWidth: 2,
        backgroundColor: 'rgba(255, 123, 0, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    };
  }, [history]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: "rgba(255, 255, 255, 0.05)" } },
      y: { type: 'logarithmic', min: 1e-8, max: 1e-3, grid: { color: "rgba(255, 255, 255, 0.05)" } }
    }
  };

  return (
    <section className="dashboard-panel" id="panel-overview">
      <div className="panel-header">
        <h2>Real-time Space Environment Monitoring</h2>
        <p>Geomagnetic activity indices and solar UV telemetry.</p>
      </div>
      <div className="dashboard-grid-row">
        <div className="glass-card widget-kp">
          <h4>Estimated Kp Index (3-Hour)</h4>
          <div className="kp-gauge-container">
            <div className="kp-gauge-radial">
              <div className="kp-gauge-needle" style={{ transform: `rotate(${needleDegrees}deg)` }}></div>
              <div className="kp-gauge-center">
                <span className="kp-value">{weather.kp_index.toFixed(1)}</span>
                <span className={`kp-level ${isStorm ? 'bg-red' : isMinor ? 'label-minor' : 'bg-green'}`}>
                  {isStorm ? 'STORM' : isMinor ? 'MINOR' : 'QUIET'} (Kp {Math.floor(weather.kp_index)})
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card widget-solar-wind">
          <h4>Solar Wind Telemetry & Magnetic Fields</h4>
          <div className="telemetry-list">
            <div className="tel-item">
              <div className="tel-name"><i className="fa-solid fa-wind text-cyan"></i> Speed</div>
              <div className="tel-val">{Math.round(weather.solar_wind_speed)} km/s</div>
            </div>
            <div className="tel-item">
              <div className="tel-name"><i className="fa-solid fa-magnet text-purple"></i> Bt</div>
              <div className="tel-val">{Math.round(weather.solar_wind_bt)} nT</div>
            </div>
            <div className="tel-item">
              <div className="tel-name"><i className="fa-solid fa-arrows-up-down text-red"></i> Bz</div>
              <div className="tel-val">{weather.solar_wind_bz.toFixed(1)} nT</div>
            </div>
            <div className="tel-item">
              <div className="tel-name"><i className="fa-solid fa-solar-panel text-orange"></i> Radio Flux</div>
              <div className="tel-val">{Math.round(weather.radio_flux)} sfu</div>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card full-width-card mt-20">
        <h4>GOES Solar X-Ray Flux (24-Hour Timeline)</h4>
        <div style={{ height: '240px' }}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>
    </section>
  );
}
