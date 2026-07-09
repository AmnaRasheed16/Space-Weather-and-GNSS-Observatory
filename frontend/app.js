// ========================================================
// AETHER SHIELD FRONTEND CONTROLLER (app.js)
// ========================================================

// Global Application State
const state = {
    token: localStorage.getItem("aethershield_token") || null,
    username: localStorage.getItem("aethershield_username") || null,
    role: localStorage.getItem("aethershield_role") || null,
    pollingInterval: null,
    charts: {
        xray: null,
        tec: null
    }
};

// --- DOM elements ---
const el = {
    // Navigation / View Toggles
    publicLanding: document.getElementById("public-landing-view"),
    privateDashboard: document.getElementById("private-dashboard-view"),
    btnHeroEnter: document.getElementById("btn-hero-enter"),
    btnModalOpen: document.getElementById("btn-login-modal-open"),
    userBadge: document.getElementById("user-badge"),
    badgeRole: document.getElementById("badge-user-role"),
    badgeName: document.getElementById("badge-user-name"),
    btnLogout: document.getElementById("btn-user-logout"),
    
    // Login Modal
    loginModal: document.getElementById("login-modal"),
    btnLoginClose: document.getElementById("btn-login-close"),
    formLogin: document.getElementById("form-login-submit"),
    inputUsername: document.getElementById("input-username"),
    inputPassword: document.getElementById("input-password"),
    loginError: document.getElementById("login-error-msg"),
    btnQuickAdmin: document.getElementById("btn-quick-admin"),
    btnQuickScientist: document.getElementById("btn-quick-scientist"),
    
    // Dashboard Navigation
    sidebarItems: document.querySelectorAll(".sidebar-item"),
    panels: document.querySelectorAll(".dashboard-panel"),
    dbStatusText: document.getElementById("db-status-text"),
    dbStatusDot: document.getElementById("db-status-dot"),
    btnReseed: document.getElementById("btn-trigger-reseed"),
    alertsTicker: document.getElementById("alerts-ticker-text"),
    
    // Space Weather Current Panel
    dashKpValue: document.getElementById("dash-kp-value"),
    dashKpLevel: document.getElementById("dash-kp-level"),
    dashKpGauge: document.getElementById("kp-gauge-indicator"),
    dashWindSpeed: document.getElementById("dash-wind-speed"),
    dashWindBt: document.getElementById("dash-wind-bt"),
    dashWindBz: document.getElementById("dash-wind-bz"),
    dashSolarFlux: document.getElementById("dash-solar-flux"),
    
    // Public Weather Widgets
    pubKp: document.getElementById("public-kp-value"),
    pubWind: document.getElementById("public-wind-value"),
    pubFlux: document.getElementById("public-flux-value"),
    pubR: document.getElementById("public-scale-r"),
    pubS: document.getElementById("public-scale-s"),
    pubG: document.getElementById("public-scale-g"),
    
    // GNSS Stations Panel
    stationsGrid: document.getElementById("stations-directory-cards"),
    btnAdminAddStationOpen: document.getElementById("btn-admin-add-station-open"),
    modalStationReg: document.getElementById("modal-station-registration"),
    btnStationRegClose: document.getElementById("btn-station-registration-close"),
    formStation: document.getElementById("form-station-submit"),
    stationRegError: document.getElementById("station-registration-error"),
    
    // TEC Panel
    selectTecStation: document.getElementById("select-tec-station"),
    
    // Sky Plot Panel
    skyPlotSatellitesGroup: document.getElementById("sky-plot-satellites-group"),
    satelliteTableBody: document.getElementById("satellite-table-body"),
    
    // Data Ingestion Panel
    uploadDragDrop: document.getElementById("upload-drag-drop-area"),
    fileUploader: document.getElementById("input-file-uploader"),
    btnFileSelect: document.getElementById("btn-trigger-file-select"),
    uploadStationSelect: document.getElementById("upload-station-select"),
    consoleTerminal: document.getElementById("upload-console-terminal-output"),
    tableUploadsList: document.getElementById("table-body-uploads-list"),
    
    // Notification Toast
    toast: document.getElementById("toast-alert"),
    toastTitle: document.getElementById("toast-title"),
    toastMessage: document.getElementById("toast-message"),
    toastIcon: document.getElementById("toast-icon")
};

// --- API Request Helpers ---
async function apiFetch(endpoint, options = {}) {
    // Add auth headers if logged in
    const headers = options.headers || {};
    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }
    
    const response = await fetch(endpoint, { ...options, headers });
    
    if (response.status === 401) {
        // Token expired or invalid -> log out
        handleLogout();
        showToast("Session Expired", "Please log in again.", "danger");
        throw new Error("Unauthorized");
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "API Request Failed");
    }
    
    return response.json();
}

// --- Toast Notification ---
function showToast(title, message, type = "success") {
    el.toastTitle.textContent = title;
    el.toastMessage.textContent = message;
    
    // Configure colors based on type
    el.toast.style.borderColor = "";
    el.toast.style.boxShadow = "";
    el.toastIcon.className = "fa-solid";
    
    if (type === "success") {
        el.toast.style.borderColor = "#10b981";
        el.toast.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.2)";
        el.toastIcon.classList.add("fa-circle-check", "text-glow-green");
    } else if (type === "warning") {
        el.toast.style.borderColor = "#ffb800";
        el.toast.style.boxShadow = "0 0 15px rgba(255, 184, 0, 0.2)";
        el.toastIcon.classList.add("fa-circle-exclamation", "text-orange");
    } else if (type === "danger") {
        el.toast.style.borderColor = "#ef4444";
        el.toast.style.boxShadow = "0 0 15px rgba(239, 104, 104, 0.2)";
        el.toastIcon.classList.add("fa-triangle-exclamation", "text-red");
    }
    
    el.toast.classList.remove("hidden");
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        el.toast.classList.add("hidden");
    }, 4000);
}

// --- Views & Tab Toggles ---
function renderView() {
    if (state.token) {
        // Authenticated Cockpit View
        el.publicLanding.classList.add("hidden");
        el.privateDashboard.classList.remove("hidden");
        el.btnModalOpen.classList.add("hidden");
        el.userBadge.classList.remove("hidden");
        el.badgeName.textContent = state.username;
        el.badgeRole.textContent = state.role;
        
        // Hide Admin controls if not admin
        if (state.role === "admin") {
            el.btnAdminAddStationOpen.classList.remove("hidden");
        } else {
            el.btnAdminAddStationOpen.classList.add("hidden");
        }
        
        // Clear active polling interval
        if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
            state.pollingInterval = null;
        }
        
        // Load secure datasets
        loadDashboardData();
        
        // Start live polling intervals (every 10 seconds)
        state.pollingInterval = setInterval(loadDashboardData, 10000);
    } else {
        // Public Visitor View
        el.publicLanding.classList.remove("hidden");
        el.privateDashboard.classList.add("hidden");
        el.btnModalOpen.classList.remove("hidden");
        el.userBadge.classList.add("hidden");
        
        // Clear active interval
        if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
            state.pollingInterval = null;
        }
        
        // Load public space weather metrics
        loadPublicWeather();
        
        // Start public live polling (every 10 seconds)
        state.pollingInterval = setInterval(loadPublicWeather, 10000);
    }
}

function switchDashboardPanel(panelId) {
    el.panels.forEach(panel => {
        if (panel.id === panelId) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    });
}

// --- Login / Session Handlers ---
async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = el.inputUsername.value.trim();
    const password = el.inputPassword.value.trim();
    
    try {
        const data = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        
        // Store session tokens
        state.token = data.access_token;
        state.username = data.username;
        state.role = data.role;
        
        localStorage.setItem("aethershield_token", data.access_token);
        localStorage.setItem("aethershield_username", data.username);
        localStorage.setItem("aethershield_role", data.role);
        
        el.loginModal.classList.add("hidden");
        el.loginError.classList.add("hidden");
        
        // Clear login fields
        el.inputUsername.value = "";
        el.inputPassword.value = "";
        
        renderView();
        showToast("Access Granted", `Welcome back, ${data.username}!`, "success");
    } catch (err) {
        logger("Login failed: " + err.message);
        el.loginError.classList.remove("hidden");
        el.loginError.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${err.message}`;
    }
}

function handleLogout() {
    state.token = null;
    state.username = null;
    state.role = null;
    
    localStorage.removeItem("aethershield_token");
    localStorage.removeItem("aethershield_username");
    localStorage.removeItem("aethershield_role");
    
    renderView();
    showToast("Session Terminated", "You have logged out.", "warning");
}

// --- Public Weather Loader ---
async function loadPublicWeather() {
    try {
        const data = await apiFetch("/api/weather/current");
        
        // Populate public elements
        if (el.pubKp) el.pubKp.textContent = data.kp_index.toFixed(1);
        if (el.pubWind) el.pubWind.textContent = `${Math.round(data.solar_wind_speed)} km/s`;
        if (el.pubFlux) el.pubFlux.textContent = `${Math.round(data.radio_flux)} sfu`;
        
        // Format NOAA scales
        const badgeG = document.getElementById("public-scale-g");
        const badgeS = document.getElementById("public-scale-s");
        const badgeR = document.getElementById("public-scale-r");
        
        if (badgeG) updateScaleBadge(badgeG, data.status_g, "G");
        if (badgeS) updateScaleBadge(badgeS, data.status_s, "S");
        if (badgeR) updateScaleBadge(badgeR, data.status_r, "R");
        
        // Also fetch active satellites to render live orbital scanner preview
        const satellites = await apiFetch("/api/satellites");
        renderSkyPlot(satellites);
        
    } catch (err) {
        logger("Error loading public weather: " + err.message);
    }
}

function updateScaleBadge(badgeElement, statusVal, prefixChar) {
    badgeElement.classList.remove("none");
    let scaleNum = "0";
    let textDesc = "Quiet";
    
    if (statusVal === "minor") { scaleNum = "1"; textDesc = "Minor"; }
    else if (statusVal === "moderate") { scaleNum = "2"; textDesc = "Moderate"; }
    else if (statusVal === "severe") { scaleNum = "4"; textDesc = "Severe"; }
    else if (statusVal === "extreme") { scaleNum = "5"; textDesc = "Extreme"; }
    else {
        badgeElement.classList.add("none");
    }
    
    badgeElement.innerHTML = `${prefixChar}${scaleNum} <span class="desc">${textDesc}</span>`;
}

// --- Complete Cockpit Dashboard Loader ---
async function loadDashboardData() {
    if (!state.token) return;
    
    try {
        // 1. Database status health check
        const health = await apiFetch("/api/status");
        el.dbStatusText.textContent = `DB Connection: ${health.database}`;
        if (health.database.includes("Connected")) {
            el.dbStatusDot.className = "status-dot green";
        } else {
            el.dbStatusDot.className = "status-dot red";
        }
        
        // 2. Load Space Weather Current
        const current = await apiFetch("/api/weather/current");
        el.dashKpValue.textContent = current.kp_index.toFixed(1);
        el.dashWindSpeed.textContent = `${Math.round(current.solar_wind_speed)} km/s`;
        el.dashWindBt.textContent = `${Math.round(current.solar_wind_bt)} nT`;
        el.dashWindBz.textContent = `${current.solar_wind_bz.toFixed(1)} nT`;
        el.dashSolarFlux.textContent = `${Math.round(current.radio_flux)} sfu`;
        
        // Rotate gauge needle based on Kp index (0 to 9 mapped to 0 to 180 degrees)
        const needleDegrees = (current.kp_index / 9.0) * 180;
        el.dashKpGauge.style.transform = `rotate(${needleDegrees}deg)`;
        
        // Style Kp index text label
        let kpText = "QUIET (Kp 0-2)";
        el.dashKpLevel.className = "kp-level";
        if (current.kp_index >= 5) {
            kpText = `STORM (Kp ${Math.floor(current.kp_index)})`;
            el.dashKpLevel.classList.add("bg-red");
            el.alertsTicker.innerHTML = `<span class="text-red">GEOMAGNETIC STORM WARNING: Kp Index at ${current.kp_index.toFixed(1)}! Expect possible GNSS positioning errors.</span>`;
        } else if (current.kp_index >= 3) {
            kpText = `MINOR (Kp ${Math.floor(current.kp_index)})`;
            el.dashKpLevel.classList.add("label-minor");
            el.alertsTicker.innerHTML = "Observing minor geomagnetic perturbations. Ionospheric fluctuations are within typical ranges.";
        } else {
            el.dashKpLevel.classList.add("bg-green");
            el.alertsTicker.innerHTML = "Space weather environment is quiet. GNSS signals operating at nominal paths.";
        }
        el.dashKpLevel.textContent = kpText;
        
        // 3. Load historical charts
        const history = await apiFetch("/api/weather/historical");
        renderXRayChart(history.xray_flux);
        renderTecTrendsChart(history.tec_trend, el.selectTecStation.value);
        
        // 4. Load Satellite Positions
        const satellites = await apiFetch("/api/satellites");
        renderSkyPlot(satellites);
        renderSatelliteTable(satellites);
        
        // 5. Load GNSS Station Directory
        const stations = await apiFetch("/api/stations");
        renderStationsGrid(stations);
        
        // 6. Load Ingestion logs
        const uploads = await apiFetch("/api/uploads");
        renderUploadsTable(uploads);
        
    } catch (err) {
        logger("Dashboard loading error: " + err.message);
    }
}

// --- Chart rendering: Solar X-Ray Flux ---
function renderXRayChart(fluxData) {
    if (!fluxData || fluxData.length === 0) return;
    
    const canvas = document.getElementById("chart-xray-flux");
    if (!canvas) return;
    
    const times = fluxData.map(d => d.time);
    const values = fluxData.map(d => d.value);
    
    if (state.charts.xray) {
        // Update data
        state.charts.xray.data.labels = times;
        state.charts.xray.data.datasets[0].data = values;
        state.charts.xray.update();
        return;
    }
    
    const ctx = canvas.getContext("2d");
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(255, 123, 0, 0.4)");
    gradient.addColorStop(1, "rgba(255, 123, 0, 0.0)");
    
    state.charts.xray = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'X-Ray Irradiance (W/m²)',
                data: values,
                borderColor: '#ff7b00',
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#94a3b8", maxTicksLimit: 12 }
                },
                y: {
                    type: 'logarithmic',
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: {
                        color: "#94a3b8",
                        callback: function(value) {
                            return value.toExponential(0);
                        }
                    },
                    min: 1e-8,
                    max: 1e-3
                }
            }
        }
    });
}

// --- Chart rendering: TEC Trends ---
function renderTecTrendsChart(tecData, stationHighlight) {
    if (!tecData || tecData.length === 0) return;
    
    const canvas = document.getElementById("chart-tec-trends");
    if (!canvas) return;
    
    const times = tecData.map(d => d.time);
    
    const datasets = [];
    const stationConfig = [
        { key: "IST01", label: "Islamabad (IST01)", color: "#00f2fe" },
        { key: "KHI02", label: "Karachi (KHI02)", color: "#8a2be2" },
        { key: "PEW03", label: "Peshawar (PEW03)", color: "#10b981" }
    ];
    
    stationConfig.forEach(sc => {
        // Filter dataset based on highlight selection dropdown
        if (stationHighlight !== "all" && stationHighlight !== sc.key) {
            return;
        }
        
        datasets.push({
            label: sc.label,
            data: tecData.map(d => d[sc.key]),
            borderColor: sc.color,
            borderWidth: 2.5,
            fill: false,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5
        });
    });
    
    if (state.charts.tec) {
        state.charts.tec.data.labels = times;
        state.charts.tec.data.datasets = datasets;
        state.charts.tec.update();
        return;
    }
    
    const ctx = canvas.getContext("2d");
    state.charts.tec = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#e2e8f0", font: { family: "Outfit" } }
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#94a3b8" }
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#94a3b8" },
                    title: { display: true, text: "TECU (10^16 el/m²)", color: "#94a3b8" }
                }
            }
        }
    });
}

// --- Orbit/Sky Plot Radar Drawer ---
function renderSkyPlot(satellites) {
    const dashboardGroup = el.skyPlotSatellitesGroup;
    const publicGroup = document.getElementById("public-sky-plot-satellites-group");
    
    if (dashboardGroup) dashboardGroup.innerHTML = "";
    if (publicGroup) publicGroup.innerHTML = "";
    
    const CenterX = 200;
    const CenterY = 200;
    const MaxRadius = 180; // Matches outer grid circle
    
    satellites.forEach(sat => {
        // Calculate polar coordinates mapping:
        // elevation: 90 is center (r=0), 0 is edge (r=MaxRadius)
        const radius = MaxRadius * ((90 - sat.elevation) / 90.0);
        
        // Azimuth: 0 degrees is North (top) and angle goes clockwise
        const azimuthRad = (sat.azimuth * Math.PI) / 180.0;
        const x = CenterX + radius * Math.sin(azimuthRad);
        const y = CenterY - radius * Math.cos(azimuthRad);
        
        // Color based on Constellation type
        let dotColor = "#2563eb"; // GPS
        if (sat.constellation === "GLONASS") dotColor = "#ef4444";
        else if (sat.constellation === "Galileo") dotColor = "#10b981";
        else if (sat.constellation === "BeiDou") dotColor = "#eab308";
        
        const createSatElements = () => {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "5");
            circle.setAttribute("fill", dotColor);
            circle.setAttribute("class", "sat-dot");
            circle.style.filter = `drop-shadow(0 0 4px ${dotColor})`;
            
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${sat.id} (${sat.constellation})\nElev: ${sat.elevation}°\nAzim: ${sat.azimuth}°\nSNR: ${sat.snr} dB-Hz`;
            circle.appendChild(title);
            
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + 8);
            text.setAttribute("y", y + 4);
            text.setAttribute("class", "sat-label");
            text.textContent = sat.id;
            
            group.appendChild(circle);
            group.appendChild(text);
            return group;
        };
        
        if (dashboardGroup) {
            dashboardGroup.appendChild(createSatElements());
        }
        if (publicGroup) {
            publicGroup.appendChild(createSatElements());
        }
    });
}

function renderSatelliteTable(satellites) {
    if (!el.satelliteTableBody) return;
    el.satelliteTableBody.innerHTML = "";
    
    // Sort satellites by SNR descending
    const sorted = [...satellites].sort((a, b) => b.snr - a.snr);
    
    sorted.forEach(sat => {
        const item = document.createElement("div");
        item.className = "sat-list-item";
        
        let constellationClass = "text-cyan";
        if (sat.constellation === "GLONASS") constellationClass = "text-red";
        else if (sat.constellation === "Galileo") constellationClass = "text-glow-green";
        else if (sat.constellation === "BeiDou") constellationClass = "text-orange";
        
        item.innerHTML = `
            <span class="${constellationClass} font-bold">${sat.id}</span>
            <span>El: ${sat.elevation}°</span>
            <span>Az: ${sat.azimuth}°</span>
            <span class="text-glow-green">${sat.snr} dB-Hz</span>
        `;
        el.satelliteTableBody.appendChild(item);
    });
}

// --- Stations Grid Renderer ---
function renderStationsGrid(stations) {
    if (!el.stationsGrid) return;
    el.stationsGrid.innerHTML = "";
    
    if (stations.length === 0) {
        el.stationsGrid.innerHTML = `
            <div class="glass-card full-width-card text-center text-gray">
                No GNSS Stations registered.
            </div>
        `;
        return;
    }
    
    stations.forEach(st => {
        const card = document.createElement("div");
        const isActive = st.status === "active";
        card.className = `glass-card station-card ${isActive ? "" : "inactive"}`;
        
        card.innerHTML = `
            <div class="station-card-header">
                <div>
                    <h3>${st.name}</h3>
                    <span class="st-id">${st.id}</span>
                </div>
                <span class="status-pill-text ${isActive ? "text-glow-green" : "text-red"}">
                    <span class="status-dot ${isActive ? "green" : "red"}"></span> ${st.status}
                </span>
            </div>
            <div class="station-details-list">
                <div class="st-detail-item">
                    <span class="lbl">Latitude / Longitude</span>
                    <span class="val">${st.latitude.toFixed(4)}°, ${st.longitude.toFixed(4)}°</span>
                </div>
                <span class="st-detail-item">
                    <span class="lbl">Data Availability</span>
                    <span class="val text-glow-green">${st.data_availability.toFixed(1)}%</span>
                </span>
                <div class="st-detail-item">
                    <span class="lbl">Receiver model</span>
                    <span class="val">${st.receiver_type}</span>
                </div>
                <div class="st-detail-item">
                    <span class="lbl">Antenna model</span>
                    <span class="val">${st.antenna_type}</span>
                </div>
            </div>
        `;
        el.stationsGrid.appendChild(card);
    });
}

// --- Upload Ingestion Records Table ---
function renderUploadsTable(uploads) {
    if (!el.tableUploadsList) return;
    el.tableUploadsList.innerHTML = "";
    
    if (uploads.length === 0) {
        el.tableUploadsList.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-gray">No files uploaded yet.</td>
            </tr>
        `;
        return;
    }
    
    uploads.forEach(up => {
        const tr = document.createElement("tr");
        const formattedDate = new Date(up.uploaded_at).toLocaleString();
        
        tr.innerHTML = `
            <td class="font-bold"><i class="fa-solid fa-file-invoice text-cyan"></i> ${up.filename}</td>
            <td><span class="badge-role">${up.station_id || 'N/A'}</span></td>
            <td>${up.file_type}</td>
            <td>${formattedDate}</td>
            <td>${up.satellite_count || '-'} Sats</td>
            <td class="text-gray">${up.uploaded_by}</td>
            <td><span class="table-status-pill completed">${up.status}</span></td>
        `;
        el.tableUploadsList.appendChild(tr);
    });
}

// --- Upload Drag and Drop handlers ---
function setupUploadListeners() {
    if (!el.uploadDragDrop) return;
    
    // Prevent defaults
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        el.uploadDragDrop.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Highlight dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        el.uploadDragDrop.addEventListener(eventName, () => {
            el.uploadDragDrop.classList.add("dragover");
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        el.uploadDragDrop.addEventListener(eventName, () => {
            el.uploadDragDrop.classList.remove("dragover");
        }, false);
    });
    
    // Handle dropped files
    el.uploadDragDrop.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // Click triggering selector
    el.btnFileSelect.addEventListener('click', () => {
        el.fileUploader.click();
    });
    
    el.fileUploader.addEventListener('change', () => {
        if (el.fileUploader.files.length > 0) {
            handleFileUpload(el.fileUploader.files[0]);
        }
    });
}

async function handleFileUpload(file) {
    const stationId = el.uploadStationSelect.value;
    
    // Update terminal console
    el.consoleTerminal.innerHTML = `
        <p class="c-line text-cyan">>> Initializing receiver pipeline...</p>
        <p class="c-line">Connecting core parse buffers to: ${stationId}</p>
        <p class="c-line text-orange">Uploading: ${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
    `;
    
    // Create form payload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("station_id", stationId);
    
    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${state.token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error("Pipeline compilation error.");
        }
        
        const resData = await response.json();
        
        // Simulating progressive text terminal printing
        let outputLines = [
            `[INFO] Ingestion completed. File type: ${resData.record.file_type}`,
            `[INFO] Target validation: Station ID [${resData.record.station_id}] identified`,
            `[INFO] Header analysis: Receiver model -> ${resData.parsed_metadata.receiver_type}`,
            `[INFO] Header analysis: Antenna type -> ${resData.parsed_metadata.antenna_type}`,
            `[INFO] Mapping constellation orbits: Extracted ${resData.record.satellite_count} satellites`,
            `[SUCCESS] Logged UUID entry to MongoDB`,
            `>> Ingestion complete. Signal parameters validated.`
        ];
        
        let index = 0;
        function printNextLine() {
            if (index < outputLines.length) {
                const p = document.createElement("p");
                p.className = "c-line";
                if (outputLines[index].includes("[SUCCESS]")) {
                    p.classList.add("text-glow-green");
                } else if (outputLines[index].includes("[INFO]")) {
                    p.classList.add("text-gray");
                } else {
                    p.classList.add("text-cyan");
                }
                p.textContent = outputLines[index];
                el.consoleTerminal.appendChild(p);
                el.consoleTerminal.scrollTop = el.consoleTerminal.scrollHeight;
                index++;
                setTimeout(printNextLine, 400);
            } else {
                // Reload uploads
                loadDashboardData();
                showToast("File Ingested", `${file.name} successfully parsed.`, "success");
            }
        }
        
        setTimeout(printNextLine, 500);
        
    } catch (err) {
        const p = document.createElement("p");
        p.className = "c-line text-red";
        p.textContent = `[CRITICAL ERROR] Ingestion failed: ${err.message}`;
        el.consoleTerminal.appendChild(p);
        showToast("Ingestion Failed", err.message, "danger");
    }
}

// --- Administrative Reseed API Trigger ---
async function triggerDatabaseReseed() {
    try {
        const res = await apiFetch("/api/seed", { method: "POST" });
        showToast("Observatory Reseeded", res.message, "success");
        loadDashboardData();
    } catch (err) {
        showToast("Reseed Failed", err.message, "danger");
    }
}

// --- Admin Station Creation Handler ---
async function handleStationRegistration(e) {
    e.preventDefault();
    
    const id = document.getElementById("station-input-id").value.trim().toUpperCase();
    const name = document.getElementById("station-input-name").value.trim();
    const latitude = parseFloat(document.getElementById("station-input-lat").value);
    const longitude = parseFloat(document.getElementById("station-input-lon").value);
    const receiver_type = document.getElementById("station-input-receiver").value.trim();
    const antenna_type = document.getElementById("station-input-antenna").value.trim();
    const status = document.getElementById("station-input-status").value;
    
    try {
        const newStation = await apiFetch("/api/stations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id, name, latitude, longitude, receiver_type, antenna_type, status,
                data_availability: 100.0
            })
        });
        
        el.modalStationReg.classList.add("hidden");
        el.stationRegError.classList.add("hidden");
        el.formStation.reset();
        
        loadDashboardData();
        showToast("Station Registered", `Station ${newStation.id} added successfully.`, "success");
    } catch (err) {
        el.stationRegError.classList.remove("hidden");
        el.stationRegError.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
    }
}

// --- Logging Helper ---
function logger(msg) {
    console.log(`[AetherShield] ${msg}`);
}

// NOAA Space Weather Scales Static Data
const scaleData = {
    "scale-g": {
        title: "Geomagnetic Storms (G-Scale)",
        badge: "Observed: None (G0)",
        badgeClass: "none",
        cause: "Coronal Mass Ejections (CMEs) or High-Speed Solar Wind Streams",
        impact: "Severe Magnetospheric perturbations, triggering electron density bubbles",
        threat: "Loss of signal lock, phase scintillation, ranging errors up to 10 meters",
        delay: "2.5m - 8.2m average range drift",
        meterValue: "45%",
        meterClass: "bg-yellow",
        meterText: "GNSS Threat Indicator: Moderate",
        desc: "Geomagnetic storms disrupt Earth's magnetic envelope, causing massive currents in the upper atmosphere. These perturbations trigger local ionospheric scintillation, causing signal dispersion and tracking loss in receivers. Single-frequency GPS devices suffer severe ranging anomalies under storm conditions."
    },
    "scale-s": {
        title: "Solar Radiation Storms (S-Scale)",
        badge: "Observed: None (S0)",
        badgeClass: "none",
        cause: "Solar Proton Events (SPE) ejected during major solar flares",
        impact: "High-energy protons penetrate the ionosphere, increasing D-region ionization",
        threat: "Severe signal absorption in polar regions, inducing path loss, sat-to-ground errors",
        delay: "1.0m - 3.5m ranging anomalies",
        meterValue: "25%",
        meterClass: "bg-cyan",
        meterText: "GNSS Threat Indicator: Low",
        desc: "Solar radiation storms eject highly charged protons that flow along magnetic lines to the Earth's poles. They ionize the D-layer of the ionosphere, leading to Polar Cap Absorption (PCA) events. High-frequency polar aviation communications and trans-polar satellite links face severe signal degradation."
    },
    "scale-r": {
        title: "Radio Blackouts (R-Scale)",
        badge: "Observed: Minor (R1)",
        badgeClass: "minor",
        cause: "Sudden solar X-ray bursts ionizing the sunlit side of the Earth",
        impact: "Sudden Ionospheric Disturbances (SIDs) in the D-region absorption layer",
        threat: "HF radio blackout, signal attenuation, cycle slips on L1/L2 GNSS carrier frequencies",
        delay: "3.2m - 12.0m sudden range drift spikes",
        meterValue: "65%",
        meterClass: "bg-orange",
        meterText: "GNSS Threat Indicator: High",
        desc: "Radio blackouts occur when high-energy solar UV and X-ray radiation flares strike Earth's atmosphere, instantly ionizing the D-region. This triggers sudden, sharp increases in Total Electron Content (TEC), throwing off signal transit times and creating major range calibration errors in satellite tracking arrays."
    }
};

function updateScalesConsole(scaleId) {
    const data = scaleData[scaleId];
    if (!data) return;
    
    const badge = document.getElementById("public-threat-badge");
    const cause = document.getElementById("scale-info-cause");
    const impact = document.getElementById("scale-info-impact");
    const threat = document.getElementById("scale-info-threat");
    const delay = document.getElementById("scale-info-delay");
    const meterLbl = document.getElementById("scale-meter-lbl");
    const meterBar = document.getElementById("scale-meter-bar");
    const desc = document.getElementById("scale-info-desc");
    const panelTitle = document.querySelector("#panel-scale-g h3");
    
    if (panelTitle) panelTitle.textContent = data.title;
    if (badge) {
        badge.textContent = data.badge;
        badge.className = `threat-badge ${data.badgeClass}`;
    }
    if (cause) cause.textContent = data.cause;
    if (impact) impact.textContent = data.impact;
    if (threat) threat.textContent = data.threat;
    if (delay) delay.textContent = data.delay;
    if (meterLbl) meterLbl.textContent = data.meterText;
    if (meterBar) {
        meterBar.style.width = data.meterValue;
        meterBar.textContent = `${data.meterValue} Severity`;
        meterBar.className = `threat-meter-bar ${data.meterClass}`;
    }
    if (desc) desc.textContent = data.desc;
}

// --- Initialize Event Listeners ---
function init() {
    // 1. App Startup View state
    renderView();
    
    // 2. Navigation Click listeners (Public Links)
    document.querySelectorAll("#header-nav-links a").forEach(link => {
        link.addEventListener("click", e => {
            document.querySelectorAll("#header-nav-links a").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
    
    // 3. Login Modal actions
    if (el.btnModalOpen) {
        el.btnModalOpen.addEventListener("click", () => el.loginModal.classList.remove("hidden"));
    }
    if (el.btnHeroEnter) {
        el.btnHeroEnter.addEventListener("click", () => el.loginModal.classList.remove("hidden"));
    }
    el.btnLoginClose.addEventListener("click", () => {
        el.loginModal.classList.add("hidden");
        el.loginError.classList.add("hidden");
    });
    el.formLogin.addEventListener("submit", handleLoginSubmit);
    
    // Quick credentials helpers
    el.btnQuickAdmin.addEventListener("click", () => {
        el.inputUsername.value = "admin";
        el.inputPassword.value = "admin123";
    });
    el.btnQuickScientist.addEventListener("click", () => {
        el.inputUsername.value = "scientist";
        el.inputPassword.value = "scientist123";
    });
    
    // Logout Action
    el.btnLogout.addEventListener("click", handleLogout);
    
    // 4. Sidebar tabs navigation
    el.sidebarItems.forEach(item => {
        item.addEventListener("click", () => {
            el.sidebarItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            switchDashboardPanel(item.dataset.target);
        });
    });
    
    // 5. Database triggers
    el.btnReseed.addEventListener("click", triggerDatabaseReseed);
    
    // 6. Station dropdown filters
    el.selectTecStation.addEventListener("change", () => {
        loadDashboardData();
    });
    
    // 7. Admin actions (New Station Creation)
    el.btnAdminAddStationOpen.addEventListener("click", () => {
        el.modalStationReg.classList.remove("hidden");
    });
    el.btnStationRegClose.addEventListener("click", () => {
        el.modalStationReg.classList.add("hidden");
        el.stationRegError.classList.add("hidden");
    });
    el.formStation.addEventListener("submit", handleStationRegistration);
    
    // 8. Upload module triggers
    setupUploadListeners();
    
    // 9. NOAA Space Weather Scales Tabs listener
    document.querySelectorAll(".console-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".console-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const scaleId = tab.dataset.scale;
            updateScalesConsole(scaleId);
        });
    });
}

// Fire init on document load
document.addEventListener("DOMContentLoaded", init);
