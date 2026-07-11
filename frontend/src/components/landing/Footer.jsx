import React from 'react';

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="logo-text">AETHER<span className="logo-accent">SHIELD</span></span>
                    <p>Space Weather & GNSS Observatory platform. Developed to monitor upper-atmosphere ionization anomalies and protect global positioning, navigation, and timing infrastructure.</p>
                </div>
                <div className="footer-links-grid">
                    <div className="footer-links-col">
                        <h4>observatory</h4>
                        <a href="#about-section">Observatory Core</a>
                        <a href="#science-section">Phenomena Overview</a>
                        <a href="#tech-section">Technology Suite</a>
                        <a href="#resources-section">Public Resources</a>
                    </div>
                    <div className="footer-links-col">
                        <h4>affiliations</h4>
                        <a href="https://www.ist.edu.pk" target="_blank" rel="noreferrer">Institute of Space Technology</a>
                        <a href="http://ncgsa.org.pk" target="_blank" rel="noreferrer">NCGSA Pakistan</a>
                        <a href="https://www.spaceweather.gov" target="_blank" rel="noreferrer">NOAA SWPC</a>
                    </div>
                    <div className="footer-links-col">
                        <h4>system status</h4>
                        <div className="status-indicator-col">
                            <div className="status-dot green"></div>
                            <span>Uptime: 99.98%</span>
                        </div>
                        <div className="status-indicator-col">
                            <div class="status-dot green"></div>
                            <span>GNSS Array: 4/4 Online</span>
                        </div>
                        <div className="status-indicator-col">
                            <div class="status-dot green"></div>
                            <span>Telemetry Feed: OK</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 AetherShield Observatory. All rights reserved. Developed for Space Environment Monitoring and Positioning Assurance.</p>
            </div>
        </footer>
    );
}
