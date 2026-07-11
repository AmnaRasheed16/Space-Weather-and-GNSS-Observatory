import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Toast() {
    const { toast } = useContext(AuthContext);
    
    if (!toast) return null;
    
    const { title, message, type } = toast;
    let borderColor = "";
    let boxShadow = "";
    let iconClass = "fa-solid fa-bell text-glow-green";
    
    if (type === "success") {
        borderColor = "#10b981";
        boxShadow = "0 0 15px rgba(16, 185, 129, 0.2)";
        iconClass = "fa-solid fa-circle-check text-glow-green";
    } else if (type === "warning") {
        borderColor = "#ffb800";
        boxShadow = "0 0 15px rgba(255, 184, 0, 0.2)";
        iconClass = "fa-solid fa-circle-exclamation text-orange";
    } else if (type === "danger") {
        borderColor = "#ef4444";
        boxShadow = "0 0 15px rgba(239, 104, 104, 0.2)";
        iconClass = "fa-solid fa-triangle-exclamation text-red";
    }
    
    return (
        <div 
            className="toast-notification" 
            id="toast-alert"
            style={{ borderColor, boxShadow }}
        >
            <i className={iconClass} id="toast-icon"></i>
            <div className="toast-content">
                <span className="toast-title" id="toast-title">{title}</span>
                <span className="toast-desc" id="toast-message">{message}</span>
            </div>
        </div>
    );
}
