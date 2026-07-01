# 3D Landscape Holographic Interactive Metallurgical Assessment Platform

## Overview
An interactive web-based 3D environment for analyzing computer chip and circuit board components, identifying precious metals, and providing educational insights into component composition, historical attribution, and extraction efficiency.

## Features
- **3D Component Visualization**: Simulated circuit board and chip landscapes with interactive 3D rendering
- **Interactive Selection**: Click-based component analysis with customizable analysis settings
- **Metallurgical Analysis**: Precious metal detection, composition breakdown, and material identification
- **Simulation Modes**: Material extraction efficiency calculations and optimization routing
- **Historical Attribution**: Component sourcing, manufacturing dates, and historical data
- **Educational Logging**: Session tracking, interaction logging, and teaching interface
- **Mobile Responsive**: Full smartphone compatibility with touch support
- **Toggleable UI**: User preference-based interaction layers and selective feature activation
- **Demonstrational Playthrough**: Guided tour of platform features with automated interactions
- **Camera Capture & Search**: Screenshot and search capabilities with relevance highlighting
- **Inquiry Logs**: Complete activity tracking with timestamp and component identification

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

## Tech Stack
- **3D Rendering**: Three.js (r128)
- **Frontend**: React 18.2
- **Backend**: Express.js
- **Database**: MongoDB (for session logging)
- **Development**: Nodemon, Concurrently

## Usage

1. **Launch the application** - opens interactive 3D environment
2. **Start Demonstrational Playthrough** - automated tour with guided interactions
3. **Click on components** - triggers analysis dialog with settings
4. **Capture & Search** - take screenshots and search for relevant components
5. **Review inquiry logs** - track all interactions and identifications
6. **Run simulations** - calculate extraction methods and optimization
7. **Educational logging** - all interactions automatically tracked

## Project Structure
```
├── server/
│   ├── index.js              # Express server, API endpoints
│   └── routes/
│       ├── components.js     # Component API routes
│       ├── sessions.js       # Session logging routes
│       └── capture.js        # Camera capture routes
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Viewer3D.jsx          # Three.js 3D environment
│   │   │   ├── Playthrough.jsx       # Demonstrational playthrough
│   │   │   ├── CameraCapture.jsx     # Screenshot and search
│   │   │   └── InquiryLog.jsx        # Activity tracking
│   │   ├── App.jsx           # Main React component
│   │   └── App.css           # Styling
│   └── public/
├── docs/
│   ├── ARCHITECTURE.md       # System design documentation
│   ├── GETTING_STARTED.md    # Setup and usage guide
│   └── FEATURES.md           # Detailed feature documentation
├── package.json
└── README.md
```

## API Endpoints

### GET `/api/health`
Healthcheck endpoint

### GET `/api/components`
Returns simulated component data with material composition

### POST `/api/sessions`
Logs user analysis sessions and interactions

### POST `/api/capture`
Processes camera capture and search queries

### GET `/api/logs`
Retrieve inquiry logs with filters

## Features in Detail

### 3D Component Visualization
- Simulated circuit board landscape rendered in Three.js
- Multiple component types (CPU, GPU, memory, capacitors, connectors)
- Interactive camera controls and component highlighting
- Real-time raycasting for precise component selection

### Demonstrational Playthrough
- Automated guided tour of all features
- Step-by-step interaction demonstrations
- Component selection and analysis showcase
- Simulation execution walkthrough
- Educational narration and tooltips

### Camera Capture & Search
- Screenshot capture of current 3D view
- Component search by material, type, or efficiency
- Relevance highlighting and filtering
- Search history tracking
- Export captured images with metadata

### Inquiry Logs & Active Identifications
- Complete interaction history with timestamps
- Component identification tracking
- Analysis parameter recording
- Search query logging
- Screenshot metadata storage
- Export logs as CSV/JSON

### Metallurgical Analysis Engine
- Precious metal identification (gold, silver, copper, etc.)
- Composition percentages by weight
- Material purity assessment
- Extraction feasibility scoring

### Efficiency Simulations
- Optimal extraction routing algorithms
- Material recovery rate calculations
- Cost-benefit analysis
- Environmental impact assessment

### Educational Logging
- Complete session tracking
- Component interaction history
- Analysis parameter recording
- Learning progress metrics
- Exportable session reports

## Mobile Support
- Responsive design for phones and tablets
- Touch-friendly interface
- Optimized 3D rendering for mobile GPUs
- Adaptive control schemes

## Contributing
Contributions welcome. Please submit pull requests with detailed descriptions.

## License
MIT

## Support
For issues or questions, please open a GitHub issue.
