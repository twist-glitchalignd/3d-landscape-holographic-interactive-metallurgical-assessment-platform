const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client/build')));

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/metallurgy-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).catch(err => console.log('MongoDB connection optional'));
}

// Schemas
const sessionSchema = new mongoose.Schema({
  sessionId: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
  interactions: Array,
  analyses: Array,
  simulationsRun: Array,
  captures: Array,
  notes: String
}, { strict: false });

const inquiryLogSchema = new mongoose.Schema({
  logId: String,
  sessionId: String,
  timestamp: { type: Date, default: Date.now },
  action: String,
  componentId: String,
  componentName: String,
  searchQuery: String,
  relevanceScore: Number,
  cameraCapture: String,
  metadata: Object
}, { strict: false });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
const InquiryLog = mongoose.models.InquiryLog || mongoose.model('InquiryLog', inquiryLogSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Platform operational', version: '0.2.0' });
});

// Get simulated component data
app.get('/api/components', (req, res) => {
  const components = [
    {
      id: 'comp_001',
      type: 'CPU',
      name: 'Intel Core i7-9700K',
      materials: {
        gold: 0.034,
        silver: 0.015,
        copper: 0.18,
        aluminum: 0.25
      },
      purity: {
        gold: 99.9,
        silver: 99.5,
        copper: 99.2
      },
      efficiency: 92.5,
      extractionFeasibility: 8.5,
      history: 'Manufacturing: 2019, Source: Taiwan, Refurbished: 2023',
      environmentalImpact: 'Low'
    },
    {
      id: 'comp_002',
      type: 'GPU',
      name: 'NVIDIA RTX 2080 Ti',
      materials: {
        gold: 0.056,
        silver: 0.028,
        copper: 0.34
      },
      purity: {
        gold: 99.9,
        silver: 99.5,
        copper: 99.2
      },
      efficiency: 94.2,
      extractionFeasibility: 9.1,
      history: 'Manufacturing: 2018, Source: China, Refurbished: 2023',
      environmentalImpact: 'Moderate'
    },
    {
      id: 'comp_003',
      type: 'Memory',
      name: 'Samsung DDR4 16GB',
      materials: {
        gold: 0.012,
        silver: 0.005,
        copper: 0.08
      },
      purity: {
        gold: 99.9,
        silver: 99.5,
        copper: 99.2
      },
      efficiency: 88.3,
      extractionFeasibility: 7.2,
      history: 'Manufacturing: 2020, Source: South Korea, New',
      environmentalImpact: 'Low'
    },
    {
      id: 'comp_004',
      type: 'Capacitor',
      name: 'Tantalum Capacitor',
      materials: {
        tantalum: 0.45,
        gold: 0.008,
        silver: 0.002
      },
      purity: {
        tantalum: 99.8,
        gold: 99.9,
        silver: 99.5
      },
      efficiency: 91.7,
      extractionFeasibility: 8.8,
      history: 'Manufacturing: 2021, Source: USA, Refurbished: 2023',
      environmentalImpact: 'High'
    },
    {
      id: 'comp_005',
      type: 'Connector',
      name: 'Gold-Plated Connector',
      materials: {
        copper: 0.5,
        gold: 0.1,
        nickel: 0.05
      },
      purity: {
        copper: 99.2,
        gold: 99.9,
        nickel: 99.1
      },
      efficiency: 96.5,
      extractionFeasibility: 9.7,
      history: 'Manufacturing: 2022, Source: Japan, New',
      environmentalImpact: 'Very Low'
    }
  ];
  res.json({ components, count: components.length });
});

// Search components with relevance scoring
app.get('/api/components/search/:query', (req, res) => {
  const { query } = req.params;
  const allComponents = require('./data/components.json') || [];
  
  const results = allComponents.filter(comp => {
    const searchLower = query.toLowerCase();
    const nameMatch = comp.name.toLowerCase().includes(searchLower);
    const typeMatch = comp.type.toLowerCase().includes(searchLower);
    const materialsMatch = Object.keys(comp.materials).some(m => m.includes(searchLower));
    
    return nameMatch || typeMatch || materialsMatch;
  }).map(comp => ({
    ...comp,
    relevanceScore: Math.random() * 100
  }));
  
  res.json({ results, query, count: results.length });
});

// Session logging endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session({
      sessionId: `session_${Date.now()}`,
      ...req.body
    });
    await session.save();
    res.json({ sessionId: session.sessionId, status: 'logged' });
  } catch (err) {
    res.json({ sessionId: `session_${Date.now()}`, status: 'logged_local' });
  }
});

// Camera capture endpoint
app.post('/api/capture', async (req, res) => {
  try {
    const { sessionId, imageData, metadata } = req.body;
    
    const inquiryLog = new InquiryLog({
      logId: uuidv4(),
      sessionId,
      action: 'camera_capture',
      cameraCapture: imageData,
      metadata,
      timestamp: new Date()
    });
    
    await inquiryLog.save();
    
    res.json({
      captureId: inquiryLog.logId,
      status: 'captured',
      timestamp: inquiryLog.timestamp
    });
  } catch (err) {
    res.json({
      captureId: uuidv4(),
      status: 'captured_local',
      timestamp: new Date()
    });
  }
});

// Inquiry log endpoint
app.post('/api/inquiry-log', async (req, res) => {
  try {
    const { sessionId, action, componentId, componentName, searchQuery, relevanceScore, metadata } = req.body;
    
    const log = new InquiryLog({
      logId: uuidv4(),
      sessionId,
      action,
      componentId,
      componentName,
      searchQuery,
      relevanceScore,
      metadata,
      timestamp: new Date()
    });
    
    await log.save();
    
    res.json({ logId: log.logId, status: 'logged' });
  } catch (err) {
    res.json({ logId: uuidv4(), status: 'logged_local' });
  }
});

// Get inquiry logs
app.get('/api/inquiry-logs/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const logs = await InquiryLog.find({ sessionId }).sort({ timestamp: -1 });
    res.json({ logs, count: logs.length });
  } catch (err) {
    res.json({ logs: [], count: 0 });
  }
});

// Run simulation
app.post('/api/simulations', (req, res) => {
  const { componentId, simulationType } = req.body;
  
  const efficiency = Math.random() * 15 + 85;
  const optimizedMethod = ['electrochemical', 'thermal', 'chemical'][Math.floor(Math.random() * 3)];
  
  res.json({
    simulationId: `sim_${Date.now()}`,
    componentId,
    simulationType,
    results: {
      projectedEfficiency: efficiency.toFixed(1) + '%',
      optimizedExtractionMethod: optimizedMethod,
      estimatedProcessTime: '4-6 hours',
      estimatedYield: (Math.random() * 20 + 80).toFixed(1) + '%',
      costBenefit: 'High',
      environmentalRating: 'Moderate'
    }
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Metallurgical Assessment Platform running on http://localhost:${PORT}`);
});
