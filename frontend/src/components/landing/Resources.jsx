import React from 'react';

export default function Resources() {
    return (
        <section className="resources-section" id="resources-section">
            <h2 className="section-title text-center">Research & <span className="text-glow">Resources</span></h2>
            <p className="section-desc text-center">Reference documents and standard file formats for ionospheric modeling.</p>
            
            <div className="resources-grid">
                <div className="resource-card glass-card">
                    <i className="fa-solid fa-file-pdf r-icon text-red"></i>
                    <div className="r-info">
                        <h4>RINEX 3.04 Standard Specification</h4>
                        <p>Format guidelines for GNSS raw observation data exchange.</p>
                    </div>
                    <a href="https://files.igs.org/pub/data/format/rinex304.pdf" target="_blank" className="r-download" title="Download"><i className="fa-solid fa-download"></i></a>
                </div>
                <div className="resource-card glass-card">
                    <i className="fa-solid fa-file-invoice r-icon text-cyan"></i>
                    <div className="r-info">
                        <h4>Space Weather Scales Description</h4>
                        <p>Detailed breakdown of NOAA's R, S, and G scales for radio and geomagnetic storms.</p>
                    </div>
                    <a href="https://www.swpc.noaa.gov/noaa-scales-explanation" target="_blank" className="r-download" title="View Details"><i className="fa-solid fa-arrow-up-right-from-square"></i></a>
                </div>
                <div className="resource-card glass-card">
                    <i className="fa-solid fa-file-code r-icon text-purple"></i>
                    <div className="r-info">
                        <h4>AetherShield API Docs</h4>
                        <p>Swagger OpenAPI documentation for programmatic data requests.</p>
                    </div>
                    <a href="/docs" target="_blank" className="r-download" title="Open Swagger"><i className="fa-solid fa-code"></i></a>
                </div>
            </div>
        </section>
    );
}
