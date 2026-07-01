import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import '../styles/InquiryLog.css';

const InquiryLog = ({ onClose, logs }) => {
  const [filterAction, setFilterAction] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const actions = [
    { id: 'all', label: 'All Actions' },
    { id: 'component_selected', label: 'Component Selected' },
    { id: 'camera_capture', label: 'Camera Capture' },
    { id: 'simulation_run', label: 'Simulation Run' },
    { id: 'search_query', label: 'Search Query' }
  ];

  const filteredLogs = logs.filter(log => {
    if (filterAction === 'all') return true;
    return log.action === filterAction;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
    return 0;
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(sortedLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inquiry_logs_${Date.now()}.json`;
    link.click();
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Component', 'Relevance Score'];
    const rows = sortedLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.componentName || 'N/A',
      log.relevanceScore?.toFixed(2) || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inquiry_logs_${Date.now()}.csv`;
    link.click();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'component_selected': return '🖱️';
      case 'camera_capture': return '📷';
      case 'simulation_run': return '⚙️';
      case 'search_query': return '🔍';
      default: return '📝';
    }
  };

  return (
    <div className="inquiry-overlay">
      <div className="inquiry-modal">
        <div className="inquiry-header">
          <h2>📋 Inquiry Log & Activity Tracking</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="inquiry-controls">
          <div className="filter-group">
            <label>Filter by Action:</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              {actions.map(action => (
                <option key={action.id} value={action.id}>{action.label}</option>
              ))}
            </select>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="export-buttons">
            <button className="export-btn" onClick={exportLogs}>📥 Export JSON</button>
            <button className="export-btn" onClick={exportCSV}>📊 Export CSV</button>
          </div>
        </div>

        <div className="inquiry-content">
          {sortedLogs.length === 0 ? (
            <div className="no-logs">
              <p>No activity logs yet. Start interacting with the platform!</p>
            </div>
          ) : (
            <div className="logs-list">
              <div className="logs-count">Total: {sortedLogs.length} entries</div>
              {sortedLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <div className="log-icon">{getActionIcon(log.action)}</div>
                  <div className="log-content">
                    <div className="log-action">
                      <span className="action-name">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="time">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                    </div>
                    {log.componentName && (
                      <div className="log-component">
                        <strong>Component:</strong> {log.componentName}
                      </div>
                    )}
                    {log.relevanceScore !== undefined && (
                      <div className="log-relevance">
                        <strong>Relevance:</strong> {log.relevanceScore.toFixed(2)}%
                      </div>
                    )}
                    {log.searchQuery && (
                      <div className="log-query">
                        <strong>Query:</strong> {log.searchQuery}
                      </div>
                    )}
                    <div className="log-timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inquiry-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default InquiryLog;
