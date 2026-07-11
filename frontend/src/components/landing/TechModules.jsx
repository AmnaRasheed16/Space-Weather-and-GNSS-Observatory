import React from 'react';

export default function TechModules() {
    return (
        <section className="tech-section" id="tech-section">
            <div className="tech-wrapper">
                <div className="tech-details">
                    <h2 className="section-title">Observatory <span className="text-glow">Modules</span></h2>
                    <p className="section-desc">Our integrated full-stack hardware and software pipeline supports deep monitoring of ionospheric factors.</p>
                    
                    <ul className="tech-list">
                        <li>
                            <i className="fa-solid fa-circle-check text-cyan"></i>
                            <div>
                                <strong>GNSS Station Registry</strong>
                                <p>Manage coordinate grids, hardware configurations, and receiver/antenna properties across stations.</p>
                            </div>
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check text-purple"></i>
                            <div>
                                <strong>RINEX Data Ingestion & Parsing</strong>
                                <p>Automated Ingestion terminal processes standard RINEX observation records for rapid analysis.</p>
                            </div>
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check text-orange"></i>
                            <div>
                                <strong>Interactive Sky Plotting</strong>
                                <p>Generate real-time sky plots tracking GPS, Galileo, GLONASS, and BeiDou constellation orbits.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="tech-visual glass-card">
                    <div className="visual-header">
                        <span className="window-dot red"></span>
                        <span className="window-dot yellow"></span>
                        <span className="window-dot green"></span>
                        <span className="window-title">observatory_pipeline.log</span>
                    </div>
                    <div className="code-terminal">
                        <p className="line"><span className="c-blue">sys@aethershield:~$</span> python3 -m parser --input ist_07.26o</p>
                        <p className="line green">[INFO] Ingesting file: ist_station_2026_07_07.26o</p>
                        <p className="line green">[INFO] RINEX version detected: 3.04 | Type: Observation</p>
                        <p className="line">[INFO] Station Name: ISLAMABAD OBS (IST01)</p>
                        <p className="line">[INFO] Receiver: Trimble NetR9 | Antenna: TRM59800.00</p>
                        <p className="line">[INFO] Calculating Approximated XYZ Coordinates...</p>
                        <p className="line cyan">&gt;&gt; X: 1124803.95m | Y: 6023554.12m | Z: 1845623.77m</p>
                        <p className="line green">[SUCCESS] Extracted 28 satellites across 120 epochs</p>
                        <p className="line purple">&gt;&gt; TEC Mean: 24.8 TECU | MAX: 42.1 TECU | Disturbance Index: Quiet</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
