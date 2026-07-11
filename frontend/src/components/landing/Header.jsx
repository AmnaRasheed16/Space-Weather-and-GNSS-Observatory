import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Header({ onLoginOpen }) {
    const { token, username, role, logout } = useContext(AuthContext);

    return (
        <header className="app-header" id="app-header-nav">
            <div className="header-container">
                <div className="logo-area" id="observatory-logo-container">
                    <div className="logo-orb">
                        <div className="logo-sun"></div>
                        <div className="logo-orbit"></div>
                    </div>
                    <span className="logo-text">AETHER<span className="logo-accent">SHIELD</span></span>
                </div>
                
                <nav className="main-navigation" id="header-nav-links">
                    <a href="#about-section" className="nav-link active">About</a>
                    <a href="#science-section" className="nav-link">Phenomena</a>
                    <a href="#tech-section" className="nav-link">Technology</a>
                    <a href="#resources-section" className="nav-link">Resources</a>
                </nav>
                
                <div className="auth-buttons" id="auth-header-actions">
                    {!token ? (
                        <button className="btn btn-primary" onClick={onLoginOpen}>
                            <i className="fa-solid fa-satellite-dish"></i> Enter Observatory
                        </button>
                    ) : (
                        <div className="user-profile-badge" id="user-badge">
                            <span className="badge-role" id="badge-user-role">{role}</span>
                            <span className="badge-name" id="badge-user-name">{username}</span>
                            <button className="btn btn-logout" onClick={logout} title="Log Out">
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
