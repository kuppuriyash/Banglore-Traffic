import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, MapPin, Activity, HelpCircle, Navigation } from 'lucide-react';
import { buildNetwork, runDijkstra, getEdgeTravelTime } from './utils/routing';
import NetworkMap from './components/NetworkMap';
import LayerDetail from './components/LayerDetail';
import './App.css';

const { nodes, edges } = buildNetwork();

const INITIAL_TRAINING_DATA = [
  { day: 1, mae: 0.385, baselineMae: 0.395 },
  { day: 2, mae: 0.292, baselineMae: 0.380 },
  { day: 3, mae: 0.210, baselineMae: 0.375 },
  { day: 4, mae: 0.145, baselineMae: 0.382 },
  { day: 5, mae: 0.084, baselineMae: 0.385 },
];

export default function App() {
  // Navigation stepper active layer state
  const [activeLayer, setActiveLayer] = useState(4); // default to prediction engine (the brain)
  const [selectedModelTab, setSelectedModelTab] = useState('gnn');

  // Scenario variables
  const [hour, setHour] = useState(18);
  const [isWeekend, setIsWeekend] = useState(false);
  const [isRaining, setIsRaining] = useState(false);
  const [vehicle, setVehicle] = useState('Car');

  // Interactive triggers
  const [incidentOn, setIncidentOn] = useState(false);
  const [emergencyOn, setEmergencyOn] = useState(false);

  // Source and Destination Node states
  const [sourceNode, setSourceNode] = useState('0,0'); // Hebbal
  const [targetNode, setTargetNode] = useState('5,5'); // Electronic City

  // Continuous Learning training state
  const [trainingHistory, setTrainingHistory] = useState(INITIAL_TRAINING_DATA);
  const [isRetraining, setIsRetraining] = useState(false);

  // Edge Congestion Map state
  const [congestionMap, setCongestionMap] = useState({});

  // Compute congestion values for every edge dynamically based on current scenario
  useEffect(() => {
    const newCongestion = {};
    Object.entries(edges).forEach(([key, edge]) => {
      // 1. Base bias
      let cong = edge.congestionBias * 0.3;

      // 2. Rush hour bumps (8-11am, 5-8pm on weekdays)
      let rush = 0.05;
      if (!isWeekend) {
        if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20)) {
          rush = 0.45;
        } else if (hour >= 12 && hour <= 16) {
          rush = 0.20;
        }
      } else {
        if (hour >= 11 && hour <= 20) {
          rush = 0.25;
        }
      }
      cong += rush;

      // 3. Rain impact
      if (isRaining) {
        cong += 0.22;
      }

      // 4. Incident impact (affects roads touching MG Road '2,2' or immediate neighbors)
      if (incidentOn) {
        const incidentAt = '2,2';
        if (edge.u === incidentAt || edge.v === incidentAt) {
          cong += 0.50;
        }
      }

      // Constrain value between 0.05 and 0.98
      newCongestion[key] = Math.max(0.05, Math.min(0.98, cong));
    });
    setCongestionMap(newCongestion);
  }, [hour, isWeekend, isRaining, incidentOn]);

  // Handle map node selection
  const handleSelectNode = (key) => {
    if (sourceNode === key) {
      // If clicking source node, deselect it
      setSourceNode(null);
    } else if (!sourceNode) {
      setSourceNode(key);
    } else if (targetNode === key) {
      setTargetNode(null);
    } else {
      setTargetNode(key);
    }
  };

  // Run Dijkstra route optimization
  let aiRoute = [];
  let aiTime = 0;
  let naiveRoute = [];
  let naiveTime = 0;
  let emergencyRoute = [];
  let emergencyTime = 0;
  
  // Set up emergency corridor block sets
  const blockedEdges = new Set();

  if (sourceNode && targetNode && sourceNode !== targetNode) {
    // 1. Calculate emergency vehicle route first if active (Hebbal to Electronic City)
    if (emergencyOn) {
      const emgSrc = '0,0'; // Hebbal
      const emgDst = '5,5'; // Electronic City
      const result = runDijkstra(nodes, edges, emgSrc, emgDst, congestionMap, 'Emergency');
      emergencyRoute = result.path;
      emergencyTime = result.time;

      // Penalize normal vehicles taking the emergency corridor
      for (let i = 0; i < emergencyRoute.length - 1; i++) {
        const u = emergencyRoute[i];
        const v = emergencyRoute[i+1];
        blockedEdges.add(`${u}-${v}`);
        blockedEdges.add(`${v}-${u}`);
      }
    }

    // 2. Calculate AI Proactive route (takes congestion map & detour penalties)
    const aiResult = runDijkstra(nodes, edges, sourceNode, targetNode, congestionMap, vehicle, blockedEdges);
    aiRoute = aiResult.path;
    aiTime = aiResult.time;

    // 3. Calculate Naive/Reactive route (ignores congestion and blocked edges)
    const emptyCongestion = {};
    const naiveResult = runDijkstra(nodes, edges, sourceNode, targetNode, emptyCongestion, vehicle);
    naiveRoute = naiveResult.path;
    
    // Evaluate naive path travel time UNDER current actual traffic conditions (with congestion penalties)
    let totalNaiveTime = 0;
    for (let i = 0; i < naiveRoute.length - 1; i++) {
      const u = naiveRoute[i];
      const v = naiveRoute[i+1];
      const edgeKey = `${u}-${v}`;
      const revKey = `${v}-${u}`;
      const edge = edges[edgeKey] || edges[revKey];
      const cong = congestionMap[edgeKey] || congestionMap[revKey] || 0.1;
      const isBlocked = blockedEdges.has(edgeKey) || blockedEdges.has(revKey);
      
      totalNaiveTime += getEdgeTravelTime(edge, cong, vehicle, isBlocked);
    }
    naiveTime = totalNaiveTime;
  }

  // Calculate metrics
  const timeSaved = Math.max(0, naiveTime - aiTime);
  const percentSaved = naiveTime > 0 ? (timeSaved / naiveTime) * 100 : 0;
  const avgNetworkCongestion = Object.values(congestionMap).reduce((a, b) => a + b, 0) / Object.values(edges).length;

  // Handle continuous learning retrain button
  const handleTriggerRetrain = () => {
    if (isRetraining) return;
    setIsRetraining(true);
    setTimeout(() => {
      setTrainingHistory(prev => {
        const nextDay = prev.length + 1;
        // MAE asymptotically decreases towards 0.04
        const lastMae = prev[prev.length - 1].mae;
        const nextMae = Math.max(0.041, lastMae - (lastMae - 0.04) * 0.4);
        return [
          ...prev,
          { day: nextDay, mae: nextMae, baselineMae: 0.380 }
        ];
      });
      setIsRetraining(false);
      setActiveLayer(7); // Switch view to Continuous Learning
    }, 1500);
  };

  const getSourceLabel = () => nodes[sourceNode]?.name || 'Not Selected';
  const getTargetLabel = () => nodes[targetNode]?.name || 'Not Selected';

  return (
    <div className="dashboard-container">
      {/* Top Banner Header */}
      <header>
        <h1>🚦 Predictive Traffic Intelligence Platform</h1>
        <div className="meta-info">
          <div className="meta-item">
            <span className="tag">Ideathon Pitch CC220</span>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="dashboard-grid">
        
        {/* Left Control Sidebar */}
        <aside className="glass-panel sidebar">
          <div className="panel-title">
            ⚙️ Scenario Configuration
          </div>

          {/* Time slider */}
          <div className="control-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="control-label">Hour of day</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Selection Selects */}
          <div className="control-group">
            <span className="control-label">Vehicle Type</span>
            <select className="select-input" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              <option value="Car">🚙 Private Car</option>
              <option value="Bike">🏍️ Motorbike (congestion filters)</option>
              <option value="Truck">🚛 Heavy Truck (road restrictions)</option>
            </select>
          </div>

          {/* Checkbox triggers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-name">Weekend Schedule</span>
                <span className="toggle-desc">Shifts rush hours to afternoon</span>
              </div>
              <span className="switch">
                <input 
                  type="checkbox" 
                  checked={isWeekend} 
                  onChange={(e) => setIsWeekend(e.target.checked)} 
                />
                <span className="slider-switch" />
              </span>
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-name">Monsoon Weather</span>
                <span className="toggle-desc">Increases baseline road delay</span>
              </div>
              <span className="switch">
                <input 
                  type="checkbox" 
                  checked={isRaining} 
                  onChange={(e) => setIsRaining(e.target.checked)} 
                />
                <span className="slider-switch" />
              </span>
            </label>
          </div>

          <div className="panel-title" style={{ marginTop: '10px', fontSize: '15px' }}>
            💥 Interactive Simulation Toggles
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-name">🚨 Simulate Road Incident</span>
                <span className="toggle-desc">Triggers accident at MG Road</span>
              </div>
              <span className="switch">
                <input 
                  type="checkbox" 
                  checked={incidentOn} 
                  onChange={(e) => setIncidentOn(e.target.checked)} 
                />
                <span className="slider-switch red-switch" />
              </span>
            </label>

            <label className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-name">🚑 Emergency Corridor</span>
                <span className="toggle-desc">Syncs signals & detours traffic</span>
              </div>
              <span className="switch">
                <input 
                  type="checkbox" 
                  checked={emergencyOn} 
                  onChange={(e) => setEmergencyOn(e.target.checked)} 
                />
                <span className="slider-switch" />
              </span>
            </label>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '11px', lineHeight: '1.4', color: 'var(--text-muted)' }}>
            <strong>💡 Pro-Tip:</strong> Select nodes on the map grid to adjust routing origin/destination points.
          </div>
        </aside>

        {/* Center Panel (Map & Architecture Step Flow) */}
        <main className="center-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Layer navigation bar */}
          <nav className="layer-stepper">
            {[
              { num: 1, label: 'Data' },
              { num: 2, label: 'Edge' },
              { num: 3, label: 'Preprocessing' },
              { num: 4, label: 'AI Predict' },
              { num: 5, label: 'Optimizer' },
              { num: 6, label: 'Decision HUD' },
              { num: 7, label: 'Learning' },
            ].map((step) => (
              <button
                key={step.num}
                className={`step-button ${activeLayer === step.num ? 'active' : ''}`}
                onClick={() => setActiveLayer(step.num)}
              >
                <span className="step-number">{step.num}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </nav>

          {/* Metrics summary cards */}
          <section className="metrics-row">
            <div className="metric-box">
              <span className="metric-label">AI Route Duration</span>
              <span className="metric-value">
                {aiRoute.length > 0 ? `${aiTime.toFixed(1)} min` : '--'}
              </span>
              <span className="metric-subtext">
                <Clock size={11} /> {aiRoute.length > 0 ? `${aiRoute.length - 1} road links` : 'Select nodes'}
              </span>
            </div>

            <div className="metric-box saving">
              <span className="metric-label">Reactive Navigation</span>
              <span className="metric-value">
                {aiRoute.length > 0 ? `${naiveTime.toFixed(1)} min` : '--'}
              </span>
              <span className="metric-subtext">
                Ignore future congestion
              </span>
            </div>

            <div className="metric-box congestion">
              <span className="metric-label">Avg Network Congestion</span>
              <span className="metric-value">{(avgNetworkCongestion * 100).toFixed(0)}%</span>
              <span className="metric-subtext">
                Spatio-temporal average
              </span>
            </div>

            <div className="metric-box saving">
              <span className="metric-label">Travel Time Saved</span>
              <span className="metric-value" style={{ color: timeSaved > 0 ? 'var(--color-success)' : 'inherit' }}>
                {timeSaved > 0 ? `-${percentSaved.toFixed(0)}%` : '0%'}
              </span>
              <span className="metric-subtext">
                {timeSaved > 0 ? `Saved ${timeSaved.toFixed(1)}m` : 'Optimal free flow'}
              </span>
            </div>
          </section>

          {/* Interactive Map Visualizer */}
          <NetworkMap
            congestionMap={congestionMap}
            aiRoute={aiRoute}
            naiveRoute={naiveRoute}
            emergencyRoute={emergencyRoute}
            sourceNode={sourceNode}
            targetNode={targetNode}
            onSelectNode={handleSelectNode}
            incidentNode={incidentOn ? '2,2' : null}
          />
        </main>

        {/* Right Panel (Architecture detailed views) */}
        <LayerDetail
          activeLayer={activeLayer}
          scenario={{ hour, isWeekend, isRaining, vehicle }}
          predictions={congestionMap}
          routesInfo={{
            sourceName: getSourceLabel(),
            targetName: getTargetLabel(),
            aiTime,
            naiveTime,
            timeSaved,
            percentSaved,
            pathLength: aiRoute.length,
          }}
          onTriggerRetrain={handleTriggerRetrain}
          trainingData={trainingHistory}
          isRetraining={isRetraining}
          selectedModelTab={selectedModelTab}
          setSelectedModelTab={setSelectedModelTab}
          incidentNode={incidentOn ? '2,2' : null}
          emergencyActive={emergencyOn}
        />

      </div>
    </div>
  );
}
