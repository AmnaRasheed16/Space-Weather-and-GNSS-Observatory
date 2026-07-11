import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
    const { login } = useContext(AuthContext);
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(user, pass);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleQuickCreds = (username, password) => {
        setUser(username);
        setPass(password);
    };

    return (
        <div className="login-modal-overlay" id="login-modal">
            <div className="login-card glass-card">
                <button className="btn-close-modal" id="btn-login-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <div className="login-header">
                    <div className="login-logo">
                        <i className="fa-solid fa-user-shield"></i>
                    </div>
                    <h2>Enter AetherShield</h2>
                    <p>Authenticate to access the scientific observatory panel</p>
                </div>
                
                <form className="login-form" id="form-login-submit" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <i className="fa-solid fa-user"></i>
                            <input 
                                type="text" 
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                required 
                                placeholder="Enter username" 
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type="password" 
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                required 
                                placeholder="Enter password" 
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="login-error" id="login-error-msg">
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary btn-block">
                        Verify Identity <i className="fa-solid fa-unlock-keyhole"></i>
                    </button>
                </form>
                
                <div className="quick-credentials">
                    <span>Developer Quick Accounts:</span>
                    <div className="quick-buttons">
                        <button className="btn btn-xs btn-outline" onClick={() => handleQuickCreds("admin", "admin123")} type="button">
                            Admin User
                        </button>
                        <button className="btn btn-xs btn-outline" onClick={() => handleQuickCreds("scientist", "scientist123")} type="button">
                            Scientist User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
