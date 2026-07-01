import React, { useState, useEffect } from 'react';
import '../styles/Playthrough.css';

const Playthrough = ({ onClose, sessionId, onComponentSelect }) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    fetch('/api/components')
      .then(res => res.json())
      .then(data => setComponents(data.components || []))
      .catch(err => console.log('Components fetch error'));
  }, []);

  const steps = [
    {
      title: 'Welcome to the Metallurgical Assessment Platform',
      description: 'This interactive 3D environment allows you to analyze computer components and extract precious metals.',
      action: 'Next'
    },
    {
      title: 'Understanding the 3D View',
      description: 'The golden components on the circuit board represent computer chips and processors. Each contains various precious metals.',
      action: 'Next'
    },
    {
      title: 'Interactive Selection',
      description: 'Click on any component to select it and view detailed analysis including material composition and extraction feasibility.',
      action: 'Select Component'
    },
    {
      title: 'Material Composition',
      description: 'Each component contains precious metals like gold, silver, and copper. View the exact percentages in the analysis panel.',
      action: 'Next'
    },
    {
      title: 'Purity Analysis',
      description: 'The purity of each material is measured in percentages. Higher purity values indicate better quality for extraction.',
      action: 'Next'
    },
    {
      title: 'Performance Metrics',
      description: 'Extraction Efficiency and Feasibility scores help determine the best approach for material recovery.',
      action: 'Next'
    },
    {
      title: 'Running Simulations',
      description: 'Enable simulation mode to calculate optimal extraction methods and estimated yields.',
      action: 'Next'
    },
    {
      title: 'Camera Capture',
      description: 'Capture screenshots of the current view and save them with metadata for future reference.',
      action: 'Next'
    },
    {
      title: 'Inquiry Logs',
      description: 'All your interactions are logged for tracking and educational purposes. Access them from the main menu.',
      action: 'Next'
    },
    {
      title: 'Playthrough Complete!',
      description: 'You now understand the platform basics. Start exploring and analyzing components!',
      action: 'Finish'
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step === 2 && components.length > 0) {
      // Select first component
      onComponentSelect(components[0]);
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <div className="playthrough-overlay">
      <div className="playthrough-modal">
        <div className="playthrough-header">
          <h2>📚 Guided Playthrough</h2>
          <button className="close-btn" onClick={handleSkip}>✕</button>
        </div>
        
        <div className="playthrough-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
          </div>
          <span className="progress-text">{step + 1} of {steps.length}</span>
        </div>

        <div className="playthrough-content">
          <h3>{currentStep.title}</h3>
          <p>{currentStep.description}</p>
        </div>

        <div className="playthrough-footer">
          <button className="btn-secondary" onClick={handleSkip}>Skip</button>
          <div className="step-indicators">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`indicator ${i <= step ? 'active' : ''}`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <button className="btn-primary" onClick={handleNext}>
            {currentStep.action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Playthrough;
