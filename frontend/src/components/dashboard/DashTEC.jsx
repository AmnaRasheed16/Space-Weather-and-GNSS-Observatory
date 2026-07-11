import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function DashTEC({ history }) {
  const [selectedStation, setSelectedStation] = useState("all");

  const chartData = useMemo(() => {
    if (!history?.tec) return null;
    const { times, stations } = history.tec;
    
    const datasets = Object.keys(stations)
      .filter(key => selectedStation === "all" || key === selectedStation)
      .map(key => {
        let color = "#06b6d4";
        if (key === "KHI02") color = "#8b5cf6";
        else if (key === "PEW03") color = "#ef4444";
        return {
          label: `${key} TEC (TECU)`,
          data: stations[key],
          borderColor: color,
          borderWidth: 2,
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0
        };
      });

    return { labels: times, datasets };
  }, [history, selectedStation]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: "rgba(255, 255, 255, 0.05)" } },
      y: { min: 0, max: 80, grid: { color: "rgba(255, 255, 255, 0.05)" } }
    }
  };

  return (
    <section className="dashboard-panel" id="panel-tec">
      <div className="panel-header">
        <h2>Total Electron Content (TEC) Analysis</h2>
        <p>Diurnal ionospheric fluctuations and absolute electron concentration anomalies.</p>
      </div>

      <div className="glass-card full-width-card">
        <div className="widget-header">
          <h4>24-Hour Regional TEC Trends (TECU)</h4>
          <div className="station-filter-container">
            <label htmlFor="select-tec-station">Station Highlight:</label>
            <select 
              id="select-tec-station" 
              className="form-control-sm"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="all">Display All Stations</option>
              <option value="IST01">Islamabad (IST01)</option>
              <option value="KHI02">Karachi (KHI02)</option>
              <option value="PEW03">Peshawar (PEW03)</option>
            </select>
          </div>
        </div>
        <div style={{ height: '350px' }}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
        <div className="tec-explanation-box mt-20">
          <h5><i className="fa-solid fa-circle-info text-cyan"></i> Understanding TEC Variations:</h5>
          <p>1 TECU represents 10<sup>16</sup> electrons/m² along the signal path. Diurnal peaks occur during local solar noon. Sudden Ionospheric Disturbances (SIDs) trigger sharp increases, inducing range errors up to several meters in single-frequency GNSS receivers.</p>
        </div>
      </div>
    </section>
  );
}
