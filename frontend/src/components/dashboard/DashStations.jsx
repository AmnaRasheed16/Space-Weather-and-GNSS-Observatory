import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export default function DashStations() {
  const { token, role, showToast } = useContext(AuthContext);
  const [stations, setStations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", lat: "", lon: "", receiver: "", antenna: "", status: "active" });
  const [error, setError] = useState(null);

  const fetchStations = async () => {
    try {
      const data = await apiFetch("/api/stations", token);
      setStations(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStations();
    window.addEventListener('dashboard:reseeded', fetchStations);
    return () => window.removeEventListener('dashboard:reseeded', fetchStations);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/api/stations", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id, name: form.name, latitude: parseFloat(form.lat),
          longitude: parseFloat(form.lon), receiver_type: form.receiver,
          antenna_type: form.antenna, status: form.status
        })
      });
      showToast("Station Registered", `Station ${form.id} integrated.`, "success");
      setIsModalOpen(false);
      fetchStations();
      setForm({ id: "", name: "", lat: "", lon: "", receiver: "", antenna: "", status: "active" });
    } catch (err) { setError(err.message); }
  };

  return (
    <section className="dashboard-panel" id="panel-stations">
      <div className="panel-header-with-action">
        <div>
          <h2>GNSS Observatory Station Directory</h2>
          <p>Overview of regional tracking hardware networks.</p>
        </div>
        {role === "admin" && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <i className="fa-solid fa-circle-plus"></i> Register Station
          </button>
        )}
      </div>
      <div className="stations-grid" id="stations-directory-cards">
        {stations.map(st => (
          <div className="glass-card station-card" key={st.id}>
            <div className="station-card-header">
              <h3>{st.name} <span className="id-tag">({st.id})</span></h3>
              <span className={`status-pill ${st.status === 'active' ? 'online' : 'offline'}`}>{st.status.toUpperCase()}</span>
            </div>
            <div className="station-card-body">
              <div className="coord-row">
                <span>Lat: <strong>{st.latitude.toFixed(4)}°N</strong></span>
                <span>Lon: <strong>{st.longitude.toFixed(4)}°E</strong></span>
              </div>
              <div className="hw-detail">
                <span><i className="fa-solid fa-microchip"></i> {st.receiver_type}</span>
                <span><i className="fa-solid fa-satellite-dish"></i> {st.antenna_type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="login-modal-overlay" id="modal-station-registration">
          <div className="login-card glass-card">
            <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            <div className="login-header">
              <h2>Register GNSS Station</h2>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-row-2">
                <input type="text" value={form.id} onChange={e=>setForm({...form, id: e.target.value})} required placeholder="ID" maxLength={5} />
                <input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required placeholder="Name" />
              </div>
              <div className="form-row-2">
                <input type="number" value={form.lat} onChange={e=>setForm({...form, lat: e.target.value})} required step="0.0001" placeholder="Lat" />
                <input type="number" value={form.lon} onChange={e=>setForm({...form, lon: e.target.value})} required step="0.0001" placeholder="Lon" />
              </div>
              <div className="form-row-2">
                <input type="text" value={form.receiver} onChange={e=>setForm({...form, receiver: e.target.value})} required placeholder="Receiver" />
                <input type="text" value={form.antenna} onChange={e=>setForm({...form, antenna: e.target.value})} required placeholder="Antenna" />
              </div>
              <div className="form-group">
                <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {error && <div className="login-error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Integrate Station</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
