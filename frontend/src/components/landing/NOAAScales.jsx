import React, { useState } from 'react';
import { scaleData } from '../../utils/scalesData';

export default function NOAAScales() {
    const [activeTab, setActiveTab] = useState("scale-g");
    const data = scaleData[activeTab];

    return (
        <section className="scales-console-section" id="scales-console-section">
            <div className="section-header-centered">
                <h2 className="section-title">NOAA Space Weather <span className="text-glow">Scales Console</span></h2>
                <p className="section-desc">Analyze how geomagnetic, radiation, and radio blackouts affect global satellite navigation ranging accuracy.</p>
            </div>
            
            <div className="scales-console-wrapper glass-card">
                <div className="console-tabs-container">
                    <button className={`console-tab ${activeTab === 'scale-g' ? 'active' : ''}`} onClick={() => setActiveTab("scale-g")}>
                        <div className="tab-label-group">
                            <span className="tab-prefix">G-Scale</span>
                            <span className="tab-title">Geomagnetic Storms</span>
                        </div>
                        <i className="fa-solid fa-magnet tab-icon"></i>
                    </button>
                    <button className={`console-tab ${activeTab === 'scale-s' ? 'active' : ''}`} onClick={() => setActiveTab("scale-s")}>
                        <div className="tab-label-group">
                            <span className="tab-prefix">S-Scale</span>
                            <span className="tab-title">Solar Radiation Storms</span>
                        </div>
                        <i className="fa-solid fa-shield-halved tab-icon"></i>
                    </button>
                    <button className={`console-tab ${activeTab === 'scale-r' ? 'active' : ''}`} onClick={() => setActiveTab("scale-r")}>
                        <div className="tab-label-group">
                            <span className="tab-prefix">R-Scale</span>
                            <span className="tab-title">Radio Blackouts</span>
                        </div>
                        <i className="fa-solid fa-satellite-dish tab-icon"></i>
                    </button>
                </div>
                
                <div className="console-details-board">
                    <div className="scale-detail-panel">
                        <div className="scale-panel-header">
                            <h3>{data.title}</h3>
                            <span className={`threat-badge ${data.badgeClass}`}>{data.badge}</span>
                        </div>
                        <div className="scale-panel-grid">
                            <div className="scale-grid-item">
                                <span className="item-lbl">Primary Cause</span>
                                <span className="item-val">{data.cause}</span>
                            </div>
                            <div className="scale-grid-item">
                                <span className="item-lbl">Ionospheric Impact</span>
                                <span className="item-val">{data.impact}</span>
                            </div>
                            <div className="scale-grid-item">
                                <span className="item-lbl">GNSS System Threat</span>
                                <span className="item-val text-red">{data.threat}</span>
                            </div>
                            <div className="scale-grid-item">
                                <span className="item-lbl">Typical Ranging Delay</span>
                                <span className="item-val text-cyan">{data.delay}</span>
                            </div>
                        </div>
                        <div className="threat-meter-box mt-20">
                            <span className="meter-lbl">{data.meterText}</span>
                            <div className="threat-meter-bg">
                                <div className={`threat-meter-bar ${data.meterClass}`} style={{ width: data.meterValue }}>
                                    {data.meterValue} Severity
                                </div>
                            </div>
                        </div>
                        <p className="scale-text-description mt-20">{data.desc}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
