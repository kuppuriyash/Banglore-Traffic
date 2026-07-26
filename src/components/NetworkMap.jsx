import React from 'react';

const GRID_SIZE = 6;
const WIDTH = 680;
const HEIGHT = 460;

const LANDMARKS = {
  '0,0': 'Hebbal',
  '0,5': 'KR Puram',
  '5,0': 'Silk Board',
  '5,5': 'Electronic City',
  '2,2': 'MG Road',
  '3,3': 'Koramangala',
};

// Generates position in SVG coordinates
const getNodePos = (r, c) => {
  const xPad = 60;
  const yPad = 50;
  const x = xPad + (c * (WIDTH - xPad * 2) / (GRID_SIZE - 1));
  const y = yPad + (r * (HEIGHT - yPad * 2) / (GRID_SIZE - 1));
  return { x, y };
};

export default function NetworkMap({
  congestionMap,
  aiRoute,
  naiveRoute,
  emergencyRoute,
  sourceNode,
  targetNode,
  onSelectNode,
  incidentNode,
}) {
  // Construct nodes list
  const nodes = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const key = `${r},${c}`;
      const name = LANDMARKS[key] || `Jn-${r}${c}`;
      const { x, y } = getNodePos(r, c);
      nodes.push({ key, name, r, c, x, y });
    }
  }

  // Construct edges list
  const edges = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const { x: x1, y: y1 } = getNodePos(r, c);
      
      // Horizontal edge
      if (c + 1 < GRID_SIZE) {
        const key = `${r},${c}-${r},${c+1}`;
        const revKey = `${r},${c+1}-${r},${c}`;
        const { x: x2, y: y2 } = getNodePos(r, c + 1);
        const cong = congestionMap[key] || congestionMap[revKey] || 0.1;
        edges.push({ key, u: `${r},${c}`, v: `${r},${c+1}`, x1, y1, x2, y2, cong });
      }
      
      // Vertical edge
      if (r + 1 < GRID_SIZE) {
        const key = `${r},${c}-${r+1},${c}`;
        const revKey = `${r+1},${c}-${r},${c}`;
        const { x: x2, y: y2 } = getNodePos(r + 1, c);
        const cong = congestionMap[key] || congestionMap[revKey] || 0.1;
        edges.push({ key, u: `${r},${c}`, v: `${r+1},${c}`, x1, y1, x2, y2, cong });
      }
    }
  }

  // Helper to get color based on congestion
  const getCongestionColor = (cong) => {
    if (cong < 0.3) return '#10b981'; // Green
    if (cong < 0.65) return '#f59e0b'; // Yellow/Orange
    return '#ef4444'; // Red
  };

  // Helper to build SVG path string for a route
  const getRoutePathString = (route) => {
    if (!route || route.length === 0) return '';
    return route.map((nodeKey, index) => {
      const parts = nodeKey.split(',').map(Number);
      const { x, y } = getNodePos(parts[0], parts[1]);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="map-card glass-panel" style={{ padding: '16px' }}>
      <div className="panel-title" style={{ justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗺️ Bangalore Road Network Grid
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Click nodes to set Source & Destination
        </span>
      </div>

      <div className="map-viewport">
        <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ background: '#070a13' }}>
          
          {/* Base road edges (colored by congestion) */}
          {edges.map((edge) => (
            <line
              key={edge.key}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke={getCongestionColor(edge.cong)}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.3"
            />
          ))}

          {/* Dotted Naive/Reactive Route overlay */}
          {naiveRoute && naiveRoute.length > 0 && (
            <path
              d={getRoutePathString(naiveRoute)}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="3"
              strokeDasharray="4 6"
              strokeLinecap="round"
              opacity="0.8"
            />
          )}

          {/* Glowing AI Proactive Route overlay */}
          {aiRoute && aiRoute.length > 0 && (
            <>
              {/* Outer glow */}
              <path
                d={getRoutePathString(aiRoute)}
                fill="none"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Core line */}
              <path
                d={getRoutePathString(aiRoute)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                className="flow-line"
              />
            </>
          )}

          {/* Emergency Corridor overlay */}
          {emergencyRoute && emergencyRoute.length > 0 && (
            <>
              {/* Outer glowing Red boundary */}
              <path
                d={getRoutePathString(emergencyRoute)}
                fill="none"
                stroke="rgba(239, 68, 68, 0.3)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Animated dashed emergency line */}
              <path
                d={getRoutePathString(emergencyRoute)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
                className="emergency-line"
              />
            </>
          )}

          {/* Incident markers */}
          {edges.map((edge) => {
            const isIncident = incidentNode && (edge.u === incidentNode || edge.v === incidentNode);
            if (!isIncident) return null;
            const midX = (edge.x1 + edge.x2) / 2;
            const midY = (edge.y1 + edge.y2) / 2;
            return (
              <g key={`incident-${edge.key}`}>
                <circle cx={midX} cy={midY} r="12" fill="rgba(239, 68, 68, 0.25)" className="pulse-node-danger" />
                <circle cx={midX} cy={midY} r="5" fill="#ef4444" />
                <path d={`M ${midX-1} ${midY-3} L ${midX+1} ${midY-3} L ${midX} ${midY+1} Z`} fill="white" />
                <circle cx={midX} cy={midY+2.5} r="0.8" fill="white" />
              </g>
            );
          })}

          {/* Node drawing */}
          {nodes.map((node) => {
            const isSelected = sourceNode === node.key || targetNode === node.key;
            const isSource = sourceNode === node.key;
            const isTarget = targetNode === node.key;
            const isLandmark = LANDMARKS[node.key] !== undefined;

            return (
              <g
                key={node.key}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={() => onSelectNode(node.key)}
              >
                {/* Node outer glow ring */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="12"
                    fill="none"
                    stroke={isSource ? '#60a5fa' : '#10b981'}
                    strokeWidth="2"
                    className="pulse-node"
                  />
                )}

                {/* Node center point */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isLandmark ? '6' : '4'}
                  fill={isSource ? '#3b82f6' : isTarget ? '#10b981' : isLandmark ? '#f3f4f6' : '#4b5563'}
                  stroke={isSelected ? '#ffffff' : '#070a13'}
                  strokeWidth="1.5"
                />

                {/* Node labels (Landmarks always show, others show on hover in CSS if desired, but we print names nicely) */}
                {isLandmark && (
                  <g>
                    {/* Shadow text */}
                    <text
                      x={node.x}
                      y={node.y - 12}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="10"
                      fontWeight="bold"
                      stroke="#000000"
                      strokeWidth="3"
                    >
                      {node.name}
                    </text>
                    {/* Actual text */}
                    <text
                      x={node.x}
                      y={node.y - 12}
                      textAnchor="middle"
                      fill={isSource ? '#60a5fa' : isTarget ? '#34d399' : '#e0e7ff'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {node.name}
                    </text>
                  </g>
                )}
                
                {/* Display coordinates/names for regular intersections if selected */}
                {!isLandmark && isSelected && (
                  <g>
                    <text
                      x={node.x}
                      y={node.y - 12}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="9"
                      fontWeight="bold"
                      stroke="#000000"
                      strokeWidth="2.5"
                    >
                      {node.name}
                    </text>
                    <text
                      x={node.x}
                      y={node.y - 12}
                      textAnchor="middle"
                      fill={isSource ? '#60a5fa' : '#34d399'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {node.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '11px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span>Free-Flowing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span>Moderate Congestion</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span>Heavy Traffic</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '4px', background: '#3b82f6' }} />
          <span>AI Predictive Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '4px', background: '#9ca3af', borderTop: '2px dotted transparent' }} />
          <span>Reactive/Naive Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '16px', height: '4px', background: '#ef4444', borderTop: '2px dashed transparent' }} />
          <span>Emergency Corridor</span>
        </div>
      </div>
    </div>
  );
}
