import React from 'react';

export default function ScienceFeatures() {
    return (
        <section className="info-section grid-3" id="science-section">
            <div className="glass-card feature-card">
                <div className="feature-icon bg-cyan"><i className="fa-solid fa-globe"></i></div>
                <h3>Ionospheric Disturbance</h3>
                <p>Track phase and amplitude scintillation triggered by extreme solar radiation, causing critical propagation delays in GNSS signals.</p>
            </div>
            <div className="glass-card feature-card">
                <div className="feature-icon bg-purple"><i className="fa-solid fa-satellite"></i></div>
                <h3>GPS & GNSS Degradation</h3>
                <p>Identify satellite-receiver ranging errors and satellite signal availability issues caused by geomagnetic storms and ionospheric bubbles.</p>
            </div>
            <div className="glass-card feature-card">
                <div className="feature-icon bg-orange"><i className="fa-solid fa-house-signal"></i></div>
                <h3>Total Electron Content (TEC)</h3>
                <p>Visualize spatial and temporal variations of TEC over regional receiver arrays to calculate signal path corrections in real time.</p>
            </div>
        </section>
    );
}
