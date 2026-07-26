import React, { useState, useEffect } from 'react';
import { Activity, Cpu, ShieldCheck, BrainCircuit, Route, Navigation, RefreshCw, AlertTriangle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';

export default function LayerDetail({
  activeLayer,
  scenario,
  predictions,
  routesInfo,
  onTriggerRetrain,
  trainingData,
  isRetraining,
  selectedModelTab,
  setSelectedModelTab,
  incidentNode,
  emergencyActive,
}) {
  const [dataLogs, setDataLogs] = useState([]);

  // Generate simulated raw data feed logs
  useEffect(() => {
    const intervals = [];
    if (activeLayer === 1) {
      const feedSources = ['GPS_Tel_410', 'CCTV_Hebbal_02', 'IoT_Sensor_15', 'WeatherAPI_Monsoon', 'Signal_MG_Road'];
      const actions = ['Transmitting location updates', 'Analyzing video frame queue', 'Publishing flow density', 'Updated precipitation factor', 'Cycle timing broadcast'];
      
      const generateLog = () => {
        const source = feedSources[Math.floor(Math.random() * feedSources.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date().toLocaleTimeString();
        const value = (Math.random() * 100).toFixed(1);
        return { timestamp, source, message: `${action} (val: ${value})` };
      };

      // Initial logs
      setDataLogs(Array.from({ length: 8 }, generateLog));

      const interval = setInterval(() => {
        setDataLogs(prev => [generateLog(), ...prev.slice(0, 9)]);
      }, 1500);
      intervals.push(interval);
    }
    return () => intervals.forEach(clearInterval);
  }, [activeLayer]);

  // Layout for each layer details
  const renderLayerContent = () => {
    switch (activeLayer) {
      case 1:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Aggregates raw IoT feeds, telemetry, and camera streams from 10 distinct real-time pipelines across Bangalore.
            </p>
            <div className="layer-visualizer-box">
              <span className="control-label">📡 Live Master Telemetry Ticker</span>
              <div className="stream-ticker">
                {dataLogs.map((log, idx) => (
                  <div key={idx} className="stream-row">
                    <span className="stream-time">[{log.timestamp}]</span>
                    <span className="stream-source">{log.source}:</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="metric-box">
                <span className="metric-label">Active Streams</span>
                <span className="metric-value">12 / 12</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Raw Bandwidth</span>
                <span className="metric-value">18.5 MB/s</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Processes data directly on Cisco IE3400 rugged edge nodes. Employs local algorithms to compress, filter duplicates, and identify high-priority incident triggers before sending.
            </p>
            <div className="layer-visualizer-box">
              <span className="control-label">⚙️ Cisco Edge Intelligence Metrics</span>
              
              <div className="progress-bar-container">
                <div className="progress-bar-label-row">
                  <span>Data Compression Rate</span>
                  <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>84.2%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill success" style={{ width: '84.2%' }} />
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-label-row">
                  <span>Duplicated Frame Dropping</span>
                  <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>92.6%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill success" style={{ width: '92.6%' }} />
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-label-row">
                  <span>Local Anomaly Flag Latency</span>
                  <span style={{color: 'var(--color-primary)', fontWeight: 'bold'}}>1.8 ms</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Edge Node Health</span>
              <span className="metric-value" style={{ color: 'var(--color-success)' }}>ONLINE (100%)</span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Performs missing value interpolation, outlier smoothing, and timestamp synchronization. Prepares the raw telemetry into spatial-temporal graph structures.
            </p>
            <div className="layer-visualizer-box" style={{ justifyContent: 'center', gap: '16px' }}>
              <span className="control-label">🛡️ Preprocessing Checklist</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <CheckCircle size={16} color="var(--color-success)" />
                  <span>Format Check: Unified Unix Timestamps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <CheckCircle size={16} color="var(--color-success)" />
                  <span>Missing Values: Spatio-temporal interpolation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <CheckCircle size={16} color="var(--color-success)" />
                  <span>Outlier Smoothing: Kalman filtering on GPS coordinates</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <CheckCircle size={16} color="var(--color-success)" />
                  <span>Anomaly Flags: Synchronized with incident registers</span>
                </div>
              </div>
            </div>
            <div className="metric-box">
              <span className="metric-label">Dataset Quality Score</span>
              <span className="metric-value" style={{ color: 'var(--color-success)' }}>99.4% (Clean)</span>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Executes 5 specialized AI models in parallel to analyze traffic forecasting, incident classification, and reinforcement learning route policies.
            </p>
            
            <div className="models-visual-grid">
              {[
                { id: 'gnn', name: '1. ST-GNN', desc: 'Spatio-Temporal Graph Neural Network' },
                { id: 'xgb', name: '2. XGBoost', desc: 'Incident classification classifier' },
                { id: 'drl', name: '3. DRL Agent', desc: 'Deep RL route policy learning' },
                { id: 'marl', name: '4. MARL priority', desc: 'Multi-Agent signal coordination' },
                { id: 'graph', name: '5. MARL + Graph', desc: 'Load balancing optimization' },
              ].map(model => (
                <div
                  key={model.id}
                  className={`model-visual-card ${selectedModelTab === model.id ? 'active' : ''}`}
                  onClick={() => setSelectedModelTab(model.id)}
                >
                  <div className="model-visual-header">
                    <span className="model-visual-name">{model.name}</span>
                    <span className="model-visual-status"><span className="status-dot"></span>Active</span>
                  </div>
                  <p className="model-visual-body">{model.desc}</p>
                </div>
              ))}
            </div>

            {/* Model Sub-Panel Visualizer */}
            <div className="layer-visualizer-box" style={{ minHeight: '180px', background: 'rgba(6, 8, 16, 0.75)' }}>
              {selectedModelTab === 'gnn' && (
                <>
                  <span className="control-label" style={{ color: '#60a5fa' }}>🧠 Spatio-Temporal Graph Neural Network</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Fuses spatial connections (roads) and temporal steps (previous 4 hours) to forecast traffic density 30–60 minutes ahead.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginTop: '4px' }}>
                    <div><strong>GCN Layers:</strong> 3 Stacked Layers</div>
                    <div><strong>GRU Steps:</strong> 12 steps (60 min)</div>
                    <div><strong>MAE:</strong> {trainingData[trainingData.length-1]?.mae.toFixed(4) || '0.084'}</div>
                    <div><strong>Prediction Horizon:</strong> 45 min</div>
                  </div>
                </>
              )}

              {selectedModelTab === 'xgb' && (
                <>
                  <span className="control-label" style={{ color: '#f59e0b' }}>🌲 XGBoost Incident Classifier</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Monitors camera meta-data anomalies and speed drops to flag, verify, and catalog road incidents.
                  </p>
                  {incidentNode ? (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', fontWeight: 'bold' }}>
                        <ShieldAlert size={14} />
                        <span>Incident Classified at {incidentNode === '2,2' ? 'MG Road' : 'Road Grid'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-main)', marginTop: '4px' }}>
                        <strong>Type:</strong> Vehicle breakdown / collision block<br />
                        <strong>Confidence:</strong> 96.8%<br />
                        <strong>Routing Impact:</strong> Redirection enabled
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <CheckCircle size={14} color="var(--color-success)" />
                      <span>No active incidents detected. Model scanning...</span>
                    </div>
                  )}
                </>
              )}

              {selectedModelTab === 'drl' && (
                <>
                  <span className="control-label" style={{ color: 'var(--color-primary)' }}>🤖 Deep Reinforcement Learning (DRL) routing</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Dijkstra operates over DRL-optimized weights representing spatial travel-time penalties.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', marginTop: '4px' }}>
                    <div><strong>Action Space:</strong> Edge paths connecting {routesInfo.pathLength} junctions</div>
                    <div><strong>Reward Formula:</strong> <code>R = - (TravelTime + CongestionPenalty)</code></div>
                    <div><strong>Policy:</strong> Proximal Policy Optimization (PPO)</div>
                  </div>
                </>
              )}

              {selectedModelTab === 'marl' && (
                <>
                  <span className="control-label" style={{ color: 'var(--color-danger)' }}>🚑 MARL priority (Emergency Signal Coordination)</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Coordinates signal phases to create a "green wave" corridor for emergency response.
                  </p>
                  {emergencyActive ? (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12px', fontWeight: 'bold' }}>
                        <Zap size={14} className="pulse-node" />
                        <span>Green-Wave Priority Active</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Changing signal timing patterns dynamically to keep the priority path clear.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Trigger "Simulate emergency vehicle" in Layer 5 to see signal timings sync.
                    </p>
                  )}
                </>
              )}

              {selectedModelTab === 'graph' && (
                <>
                  <span className="control-label" style={{ color: 'var(--color-success)' }}>🕸️ MARL + Graph Optimization</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Balances network traffic load distribution to avoid guiding everyone to a single highway.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginTop: '4px' }}>
                    <div><strong>Optimization Target:</strong> Minimize Flow Variance</div>
                    <div><strong>Congestion Reduction:</strong> ~35%</div>
                    <div><strong>Network Utilization:</strong> +18%</div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Select vehicle parameters and toggle road events to observe how route calculations adjust to congestion.
            </p>
            <div className="layer-visualizer-box">
              <span className="control-label">🚙 Route Calculation Settings</span>
              <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                <strong style={{ color: '#60a5fa' }}>{routesInfo.sourceName}</strong>
                <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                <strong style={{ color: '#34d399' }}>{routesInfo.targetName}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>• Vehicle Speed Factor: {scenario.vehicle === 'Bike' ? '1.15x (congestion filtering)' : scenario.vehicle === 'Truck' ? '0.85x (restricted roads)' : scenario.vehicle === 'Emergency' ? '1.3x (priority speed)' : '1.0x (standard)'}</div>
                {incidentNode && <div>• Incident detours: ON (MG Road blocked)</div>}
                {emergencyActive && <div>• Emergency avoid-penalty: ON (+15 min penalty for standard cars on corridor edges)</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="metric-box saving">
                <span className="metric-label">AI Route Time</span>
                <span className="metric-value">{routesInfo.aiTime.toFixed(1)} m</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Reactive Time</span>
                <span className="metric-value">{routesInfo.naiveTime.toFixed(1)} m</span>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="layer-content">
            <p className="layer-description">
              Translates machine learning routing policies into turn-by-turn alerts. Communicates estimated times and savings.
            </p>
            <div className="layer-visualizer-box nav-hud">
              <div className="hud-alert">
                <Navigation className="hud-alert-icon" size={20} />
                <div className="hud-alert-content">
                  <span className="hud-alert-title">Proactive Route Navigation HUD</span>
                  <span className="hud-alert-desc">
                    Routing from {routesInfo.sourceName} to {routesInfo.targetName} optimized for current conditions.
                  </span>
                </div>
              </div>
              
              <div className="hud-route-summary">
                <div className="hud-route-details">
                  <span className="hud-route-time">{routesInfo.aiTime.toFixed(1)} min</span>
                  <span className="hud-route-metric">{routesInfo.pathLength - 1} road links · Optimized Route</span>
                </div>
                {routesInfo.timeSaved > 0 && (
                  <div style={{ background: 'var(--color-success-glow)', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 12px', borderRadius: '8px', textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399', display: 'block' }}>
                      -{routesInfo.timeSaved.toFixed(1)} m
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      saved ({routesInfo.percentSaved.toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="metric-box">
              <span className="metric-label">Navigation Status</span>
              <span className="metric-value" style={{ color: 'var(--color-success)', fontSize: '15px' }}>
                {routesInfo.timeSaved > 0 
                  ? `✓ Bypassed predicted bottleneck. Saved ${routesInfo.timeSaved.toFixed(1)} minutes.` 
                  : '✓ Shortest path selected (free flow).'}
              </span>
            </div>
          </div>
        );

      case 7:
        // Calculate SVG polyline points for the MAE graph
        const getSvgPoints = () => {
          if (trainingData.length === 0) return '';
          const chartW = 380;
          const chartH = 120;
          const xPad = 20;
          const yPad = 15;
          const maxVal = 0.4;
          const minVal = 0.0;
          
          return trainingData.map((d, index) => {
            const x = xPad + (index * (chartW - xPad * 2) / (trainingData.length - 1));
            // Invert Y so 0 is at bottom
            const y = chartH - yPad - ((d.mae - minVal) * (chartH - yPad * 2) / (maxVal - minVal));
            return `${x},${y}`;
          }).join(' ');
        };

        const currentMae = trainingData[trainingData.length-1]?.mae || 0.084;
        const baselineMae = trainingData[trainingData.length-1]?.baselineMae || 0.285;
        const improvement = ((1 - currentMae / baselineMae) * 100).toFixed(1);

        return (
          <div className="layer-content">
            <p className="layer-description">
              Compares simulated predictions with actual travel times, calculating error metrics to retrain and update model weights.
            </p>
            
            {/* SVG Training Curve graph */}
            <div className="layer-visualizer-box" style={{ minHeight: '160px' }}>
              <span className="control-label">📉 Prediction Error Curve (Mean Absolute Error)</span>
              <div style={{ width: '100%', height: '120px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 380 120">
                  {/* Grid lines */}
                  <line x1="20" y1="15" x2="360" y2="15" stroke="rgba(255,255,255,0.05)" />
                  <line x1="20" y1="60" x2="360" y2="60" stroke="rgba(255,255,255,0.05)" />
                  <line x1="20" y1="105" x2="360" y2="105" stroke="rgba(255,255,255,0.05)" />
                  
                  {/* Labels */}
                  <text x="5" y="20" fill="var(--text-muted)" fontSize="8">0.40</text>
                  <text x="5" y="65" fill="var(--text-muted)" fontSize="8">0.20</text>
                  <text x="5" y="110" fill="var(--text-muted)" fontSize="8">0.00</text>

                  {/* Curve path */}
                  {trainingData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2.5"
                      points={getSvgPoints()}
                    />
                  )}

                  {/* Draw points */}
                  {trainingData.map((d, index) => {
                    const chartW = 380;
                    const chartH = 120;
                    const xPad = 20;
                    const yPad = 15;
                    const maxVal = 0.4;
                    const minVal = 0.0;
                    const x = xPad + (index * (chartW - xPad * 2) / (trainingData.length - 1));
                    const y = chartH - yPad - ((d.mae - minVal) * (chartH - yPad * 2) / (maxVal - minVal));
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#ffffff"
                        stroke="var(--color-primary)"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>Day 1 (Unoptimized)</span>
                <span>Day {trainingData.length} (Retrained)</span>
              </div>
            </div>

            <div className="learning-action-row">
              <div className="learning-info">
                <span className="learning-title">Model Feedback Loop</span>
                <span className="learning-desc">
                  Runs training cycles on previous outcomes to reduce forecasting errors.
                </span>
              </div>
              <button
                className="btn-action"
                onClick={onTriggerRetrain}
                disabled={isRetraining}
              >
                <RefreshCw size={14} className={isRetraining ? 'spin-anim' : ''} />
                {isRetraining ? 'Fitting...' : 'Simulate Day + Retrain'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="metric-box saving">
                <span className="metric-label">Model MAE</span>
                <span className="metric-value">{currentMae.toFixed(4)}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Improvement</span>
                <span className="metric-value">+{improvement}%</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getLayerIcon = () => {
    switch (activeLayer) {
      case 1: return <Activity size={20} color="var(--color-primary)" />;
      case 2: return <Cpu size={20} color="var(--color-primary)" />;
      case 3: return <ShieldCheck size={20} color="var(--color-success)" />;
      case 4: return <BrainCircuit size={20} color="var(--color-warning)" />;
      case 5: return <Route size={20} color="var(--color-primary)" />;
      case 6: return <Navigation size={20} color="var(--color-success)" />;
      case 7: return <RefreshCw size={20} color="var(--color-success)" />;
      default: return null;
    }
  };

  const getLayerName = () => {
    const names = [
      'Master Data Acquisition',
      'Cisco Edge Intelligence',
      'Data Validation & Preprocessing',
      'Multi-Model AI Prediction Engine',
      'Intelligent Mobility Optimization',
      'AI Decision Delivery HUD',
      'Continuous Learning Feedback Loop',
    ];
    return names[activeLayer - 1];
  };

  return (
    <div className="glass-panel right-panel" style={{ flex: 'none', height: '100%' }}>
      <div className="panel-title">
        {getLayerIcon()}
        <span>Layer {activeLayer}: {getLayerName()}</span>
      </div>
      {renderLayerContent()}
    </div>
  );
}
