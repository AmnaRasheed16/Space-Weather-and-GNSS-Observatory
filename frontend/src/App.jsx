import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Header from './components/landing/Header';
import Hero from './components/landing/Hero';
import PublicTelemetry from './components/landing/PublicTelemetry';
import NOAAScales from './components/landing/NOAAScales';
import ScienceFeatures from './components/landing/ScienceFeatures';
import TechModules from './components/landing/TechModules';
import Resources from './components/landing/Resources';
import Footer from './components/landing/Footer';
import LoginModal from './components/LoginModal';
import Sidebar from './components/dashboard/Sidebar';
import DashOverview from './components/dashboard/DashOverview';
import DashTEC from './components/dashboard/DashTEC';
import DashSatellites from './components/dashboard/DashSatellites';
import DashStations from './components/dashboard/DashStations';
import DashIngestion from './components/dashboard/DashIngestion';
import Toast from './components/Toast';
import { apiFetch } from './utils/api';

export default function App() {
  const { token, logout } = useContext(AuthContext);
  const [view, setView] = useState("landing");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("overview");
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState(null);

  const fetchTelemetry = async () => {
    try {
      const current = await apiFetch("/api/weather/current", token);
      setWeather(current);
      const hist = await apiFetch("/api/weather/history", token);
      setHistory(hist);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      setView("dashboard");
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 10000);
      return () => clearInterval(interval);
    } else { setView("landing"); }
  }, [token]);

  return (
    <>
      <Toast />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      {view === "landing" ? (
        <>
          <Header onLoginOpen={() => setIsLoginOpen(true)} />
          <main className="page-view">
            <Hero onLoginOpen={() => setIsLoginOpen(true)} onDashboardEnter={() => setView("dashboard")} />
            <PublicTelemetry />
            <NOAAScales />
            <ScienceFeatures />
            <TechModules />
            <Resources />
            <Footer />
          </main>
        </>
      ) : (
        <main className="page-view" id="private-dashboard-view">
          <header className="app-header">
            <div className="header-container">
              <div className="logo-area" onClick={() => setView("landing")} style={{ cursor: "pointer" }}>
                <span className="logo-text">AETHER<span className="logo-accent">SHIELD</span></span>
              </div>
              <div className="auth-buttons">
                <button className="btn btn-secondary btn-sm" onClick={() => setView("landing")} style={{ marginRight: '10px' }}>
                  <i className="fa-solid fa-house"></i> Public Page
                </button>
                <button className="btn btn-logout" onClick={logout} title="Log Out">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>
          </header>
          <div className="dashboard-wrapper">
            <Sidebar activePanel={activePanel} onPanelSelect={setActivePanel} />
            <div className="dashboard-main-content">
              {activePanel === "overview" && <DashOverview weather={weather} history={history} />}
              {activePanel === "tec" && <DashTEC history={history} />}
              {activePanel === "orbits" && <DashSatellites />}
              {activePanel === "stations" && <DashStations />}
              {activePanel === "uploads" && <DashIngestion />}
            </div>
          </div>
        </main>
      )}
    </>
  );
}
