import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export default function DashIngestion() {
  const { token, showToast } = useContext(AuthContext);
  const [uploads, setUploads] = useState([]);
  const [associatedStation, setAssociatedStation] = useState("IST01");
  const [terminalLines, setTerminalLines] = useState([">> Awaiting file ingestion..."]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchUploads = async () => {
    try {
      const data = await apiFetch("/api/uploads", token);
      setUploads(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchUploads();
    window.addEventListener('dashboard:reseeded', fetchUploads);
    return () => window.removeEventListener('dashboard:reseeded', fetchUploads);
  }, [token]);

  const simulateLogs = (fileName) => {
    const logs = [
      `[INFO] Ingesting file: ${fileName}`,
      `[INFO] RINEX version detected: 3.02 | Type: Observation`,
      `[INFO] Station Association: ${associatedStation}`,
      `[INFO] Extracting satellites and calculating elevation paths...`,
      `>> X: 1124803.95m | Y: 6023554.12m | Z: 1845623.77m`,
      `[SUCCESS] Extracted 24 satellites. Generated TEC profile.`,
      `>> Ingested successfully at: ${new Date().toISOString()}`
    ];
    setTerminalLines([]);
    logs.forEach((line, idx) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line]);
      }, (idx + 1) * 600);
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setTerminalLines([">> Initializing upload stream..."]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("station_id", associatedStation);
      
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error("Upload Failed");
      
      showToast("Ingestion Complete", `File ${file.name} uploaded successfully.`, "success");
      simulateLogs(file.name);
      fetchUploads();
    } catch (err) {
      setTerminalLines(prev => [...prev, `[ERROR] Ingestion failed: ${err.message}`]);
      showToast("Ingestion Failed", err.message, "danger");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="dashboard-panel" id="panel-uploads">
      <div className="panel-header">
        <h2>GNSS Data Ingestion Terminal</h2>
        <p>Ingest standard RINEX observation or station log files to calculate TEC profiles.</p>
      </div>
      <div className="upload-split-layout">
        <div className="glass-card widget-upload-control">
          <h4>Ingest File Stream</h4>
          <div 
            className="upload-dropzone" 
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
          >
            <i className="fa-solid fa-cloud-arrow-up cloud-icon"></i>
            <h5>Drag & drop observation file here</h5>
            <p>Supports RINEX (.obs, .*o) or logs (.log)</p>
            <input 
              type="file" id="input-file-uploader" className="hidden"
              onChange={e => handleFileUpload(e.target.files[0])}
            />
            <button className="btn btn-secondary btn-sm" onClick={() => document.getElementById("input-file-uploader").click()}>
              Select File
            </button>
          </div>
          <div className="upload-form-parameters mt-20">
            <div className="form-group">
              <label>Associate with GNSS Station:</label>
              <select className="form-control" value={associatedStation} onChange={e => setAssociatedStation(e.target.value)}>
                <option value="IST01">Islamabad (IST01)</option>
                <option value="KHI02">Karachi (KHI02)</option>
                <option value="PEW03">Peshawar (PEW03)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="glass-card widget-upload-console">
          <div className="console-header">
            <span><i className="fa-solid fa-terminal text-green"></i> Processing Pipeline Output</span>
          </div>
          <div className="console-body">
            {terminalLines.map((line, idx) => (
              <p className="c-line" key={idx}>{line}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card full-width-card mt-20">
        <h4>Observatory Data Ingestion Log</h4>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th><th>Station</th><th>File Type</th><th>Ingested At</th><th>User</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((up, idx) => (
                <tr key={idx}>
                  <td>{up.filename}</td><td>{up.station_id}</td><td>{up.file_type}</td>
                  <td>{new Date(up.uploaded_at).toLocaleString()}</td><td>{up.uploaded_by}</td><td><span className="status-dot green"></span> Ingested</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
