import React, { useRef, useState } from 'react';
import '../styles/CameraCapture.css';

const CameraCapture = ({ onClose, onCapture, canvasRef }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleCapture = async () => {
    // Capture canvas
    const canvas = canvasRef?.current?.querySelector('canvas');
    if (canvas) {
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target.result);
          onCapture(e.target.result);
        };
        reader.readAsDataURL(blob);
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`/api/components/search/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleExportCapture = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `capture_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="camera-overlay">
      <div className="camera-modal">
        <div className="camera-header">
          <h2>📷 Camera Capture & Search</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="camera-content">
          <div className="capture-section">
            <h3>Capture Current View</h3>
            <button className="capture-btn" onClick={handleCapture}>
              📸 Capture Screenshot
            </button>
            {selectedImage && (
              <div className="capture-preview">
                <img src={selectedImage} alt="Captured view" />
                <button className="export-btn" onClick={handleExportCapture}>
                  💾 Export Image
                </button>
              </div>
            )}
          </div>

          <div className="search-section">
            <h3>Search Components</h3>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search by material, type, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>
                🔍 Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Found {searchResults.length} results</h4>
                {searchResults.map((result, index) => (
                  <div key={index} className="result-item">
                    <div className="result-header">
                      <h5>{result.name}</h5>
                      <span className="relevance">Relevance: {result.relevanceScore?.toFixed(1)}%</span>
                    </div>
                    <p className="result-type">Type: {result.type}</p>
                    <p className="result-efficiency">Efficiency: {result.efficiency}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="camera-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
