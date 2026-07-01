import React, { useState, useEffect, useRef } from 'react';
import Viewer3D from './components/Viewer3D';
import Playthrough from './components/Playthrough';
import CameraCapture from './components/CameraCapture';
import InquiryLog from './components/InquiryLog';
import './App.css';

function App() {
  const [settings, setSettings] = useState({
    showMetals: true,
    showComposition: true,
    showHistory: true,
    showPurity: true,
    simulationMode: false,
    efficiencyMode: false,
    highlightPrecious: true
  });

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showPlaythrough, setShowPlaythrough] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showInquiryLog, setShowInquiryLog] = useState(false);
  const [logs, setLogs] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    logInquiry('component_selected', component.id, component.name);
    
    if (sessionId) {
      fetch(`/api/sessions/${sessionId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: component.id,
          action: 'selected',
          timestamp: new Date()
        })
      }).catch(err => console.log('Interaction logged'));
    }
  };

  const logInquiry = (action, componentId, componentName, searchQuery = null) => {
    if (!sessionId) return;
    
    fetch('/api/inquiry-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        action,
        componentId,
        componentName,
        searchQuery,
        relevanceScore: Math.random() * 100,
        metadata: {
          timestamp: new Date(),
          settings
        }
      })
    }).then(() => fetchLogs())
      .catch(err => console.log('Inquiry logged'));
  };

  const fetchLogs = () => {
    if (!sessionId) return;
    fetch(`/api/inquiry-logs/${sessionId}`)
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(err => console.log('Logs fetch error'));
  };

  const runSimulation = async () => {
    if (!selectedComponent) return;
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: selectedComponent.id,
          simulationType: 'extraction_efficiency'
        })
      });
      const data = await response.json();
      setSelectedComponent(prev => ({
        ...prev,
        simulationResults: data.results
      }));
      logInquiry('simulation_run', selectedComponent.id, selectedComponent.name);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleCameraCapture = (imageData) => {
    if (!sessionId) return;
    
    fetch('/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        imageData,
        metadata: {
          timestamp: new Date(),
          selectedComponent: selectedComponent?.id
        }
      })
    }).then(() => {
      logInquiry('camera_capture', selectedComponent?.id || 'none', selectedComponent?.name || 'general_view');
      fetchLogs();
    })
      .catch(err => console.log('Capture logged'));
  };

  return (
    <div className="app">
      {showPlaythrough && (
        <Playthrough
          onClose={() => setShowPlaythrough(false)}
          sessionId={sessionId}
          onComponentSelect={handleComponentSelect}
        />
      )}

      {showCameraCapture && (
        <CameraCapture
          onClose={() => setShowCameraCapture(false)}
          onCapture={handleCameraCapture}
          canvasRef={canvasRef}
        />
      )}

      {showInquiryLog && (
        <InquiryLog
          onClose={() => setShowInquiryLog(false)}
          logs={logs}
        />
      )}

      <header>
        <div className="header-content">
          <h1>🔬 3D Metallurgical Assessment Platform</h1>
          <p className="tagline">Interactive Component Analysis & Precious Metal Assessment</p>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={() => setShowPlaythrough(true)} title="Start guided demo">
            ▶ Playthrough
          </button>
          <button className="action-btn" onClick={() => setShowCameraCapture(true)} title="Capture and search">
            📷 Capture
          </button>
          <button className="action-btn" onClick={() => { fetchLogs(); setShowInquiryLog(true); }} title="View activity logs">
            📋 Logs
          </button>
        </div>
      </header>

      <div className="controls-container">
        <div className="control-group">
          <h3>Analysis Settings</h3>
          <div className="controls">
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.showMetals}
                onChange={() => toggleSetting('showMetals')}
              />
              <span>Show Precious Metals</span>
            </label>
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.showComposition}
                onChange={() => toggleSetting('showComposition')}
              />
              <span>Material Composition</span>
            </label>
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.showPurity}
                onChange={() => toggleSetting('showPurity')}
              />
              <span>Purity Analysis</span>
            </label>
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.showHistory}
                onChange={() => toggleSetting('showHistory')}
              />
              <span>Historical Data</span>
            </label>
          </div>
        </div>

        <div className="control-group">
          <h3>Simulation & Analysis</h3>
          <div className="controls">
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.simulationMode}
                onChange={() => toggleSetting('simulationMode')}
              />
              <span>Enable Simulations</span>
            </label>
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.efficiencyMode}
                onChange={() => toggleSetting('efficiencyMode')}
              />
              <span>Efficiency Analysis</span>
            </label>
            <label className="control-item">
              <input
                type="checkbox"
                checked={settings.highlightPrecious}
                onChange={() => toggleSetting('highlightPrecious')}
              />
              <span>Highlight Precious Metals</span>
            </label>
            {settings.simulationMode && selectedComponent && (
              <button className="simulate-btn" onClick={runSimulation}>
                Run Extraction Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <Viewer3D
          settings={settings}
          onComponentSelect={handleComponentSelect}
          selectedComponent={selectedComponent}
          ref={canvasRef}
        />

        {selectedComponent && (
          <div className="analysis-panel">
            <div className="panel-header">
              <h2>{selectedComponent.name}</h2>
              <p className="component-type">{selectedComponent.type}</p>
            </div>

            {settings.showComposition && (
              <div className="section">
                <h3>Material Composition</h3>
                <div className="material-grid">
                  {Object.entries(selectedComponent.materials).map(([material, amount]) => (
                    <div key={material} className="material-item">
                      <span className="material-name">{material.toUpperCase()}</span>
                      <span className="material-amount">{(amount * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settings.showPurity && selectedComponent.purity && (
              <div className="section">
                <h3>Purity Analysis</h3>
                <div className="purity-grid">
                  {Object.entries(selectedComponent.purity).map(([material, purity]) => (
                    <div key={material} className="purity-item">
                      <span className="purity-name">{material.toUpperCase()}</span>
                      <span className="purity-value">{purity}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section">
              <h3>Performance Metrics</h3>
              <div className="metrics">
                <div className="metric">
                  <span>Extraction Efficiency</span>
                  <span className="value">{selectedComponent.efficiency}%</span>
                </div>
                <div className="metric">
                  <span>Extraction Feasibility</span>
                  <span className="value">{selectedComponent.extractionFeasibility}/10</span>
                </div>
              </div>
            </div>

            {settings.showHistory && (
              <div className="section">
                <h3>Historical Data</h3>
                <p className="history-text">{selectedComponent.history}</p>
              </div>
            )}

            {selectedComponent.simulationResults && (
              <div className="section simulation-results">
                <h3>Simulation Results</h3>
                <div className="results-grid">
                  <div className="result-item">
                    <span>Projected Efficiency</span>
                    <span className="value">{selectedComponent.simulationResults.projectedEfficiency}</span>
                  </div>
                  <div className="result-item">
                    <span>Optimal Method</span>
                    <span className="value">{selectedComponent.simulationResults.optimizedExtractionMethod}</span>
                  </div>
                  <div className="result-item">
                    <span>Process Time</span>
                    <span className="value">{selectedComponent.simulationResults.estimatedProcessTime}</span>
                  </div>
                  <div className="result-item">
                    <span>Yield</span>
                    <span className="value">{selectedComponent.simulationResults.estimatedYield}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
