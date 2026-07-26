// Dijkstra Shortest Path and Road Grid Utilities

const GRID_SIZE = 6;

// Deterministic random generator for edge lengths and biases (so grid looks consistent)
const createSeededRandom = (seed) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

export const buildNetwork = () => {
  const rand = createSeededRandom(42);
  const nodes = {};
  const edges = {};

  // Landmarks names
  const landmarks = {
    '0,0': 'Hebbal',
    '0,5': 'KR Puram',
    '5,0': 'Silk Board',
    '5,5': 'Electronic City',
    '2,2': 'MG Road',
    '3,3': 'Koramangala',
  };

  // Build nodes
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const key = `${r},${c}`;
      nodes[key] = {
        key,
        name: landmarks[key] || `Jn-${r}${c}`,
        r,
        c,
      };
    }
  }

  // Build edges
  let edgeId = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const u = `${r},${c}`;
      
      // Horizontal edge
      if (c + 1 < GRID_SIZE) {
        const v = `${r},${c+1}`;
        const key = `${u}-${v}`;
        const lengthKm = 1.0 + rand() * 1.5;
        const baseSpeed = [30, 40, 50, 60][Math.floor(rand() * 4)];
        const congestionBias = 0.1 + rand() * 0.5;
        edges[key] = {
          id: edgeId++,
          u,
          v,
          lengthKm,
          baseSpeed,
          congestionBias,
        };
      }

      // Vertical edge
      if (r + 1 < GRID_SIZE) {
        const v = `${r+1},${c}`;
        const key = `${u}-${v}`;
        const lengthKm = 1.0 + rand() * 1.5;
        const baseSpeed = [30, 40, 50, 60][Math.floor(rand() * 4)];
        const congestionBias = 0.1 + rand() * 0.5;
        edges[key] = {
          id: edgeId++,
          u,
          v,
          lengthKm,
          baseSpeed,
          congestionBias,
        };
      }
    }
  }

  return { nodes, edges };
};

// Calculate travel time in minutes for an edge under given conditions
export const getEdgeTravelTime = (edge, congestion, vehicle = 'Car', isBlocked = false) => {
  const speedFactors = {
    Bike: 1.15,
    Car: 1.0,
    Truck: 0.85,
    Emergency: 1.3,
  };
  const factor = speedFactors[vehicle] || 1.0;
  
  // Free flow travel time (minutes)
  const freeFlowMinutes = (edge.lengthKm / edge.baseSpeed) * 60;
  const speedTime = freeFlowMinutes / factor;
  
  // Congestion multiplier depending on vehicle capabilities
  let congestionMultiplier = 2.5; // Standard (Car)
  
  if (vehicle === 'Bike') {
    congestionMultiplier = 0.4; // Bikes filter through traffic easily
  } else if (vehicle === 'Emergency') {
    congestionMultiplier = 0.2; // Priority traffic signal coordination clears roads
  } else if (vehicle === 'Truck') {
    congestionMultiplier = 4.0; // Heavy trucks are severely delayed by gridlock
  }

  let time = speedTime * (1 + congestionMultiplier * congestion);
  
  // Vehicle-specific road restrictions
  if (vehicle === 'Truck' && edge.baseSpeed <= 40) {
    // Trucks barred from narrow/internal roads (speed limits 30 or 40 kmph)
    // We add a massive time penalty to force them onto wider roads (50 or 60 kmph)
    time += 50.0; 
  }
  
  // Add penalty if edge is in emergency avoidance corridor
  if (isBlocked) {
    time += 15.0; // 15-minute detour penalty
  }
  
  return time;
};

// Dijkstra implementation
export const runDijkstra = (nodes, edges, startKey, targetKey, congestionMap, vehicle = 'Car', blockedEdges = new Set()) => {
  const distances = {};
  const previous = {};
  const queue = new Set();

  Object.keys(nodes).forEach(key => {
    distances[key] = Infinity;
    previous[key] = null;
    queue.add(key);
  });

  distances[startKey] = 0;

  while (queue.size > 0) {
    // Find node with minimum distance in queue
    let minNode = null;
    let minDistance = Infinity;
    queue.forEach(node => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        minNode = node;
      }
    });

    if (minNode === null || minNode === targetKey) {
      break;
    }

    queue.delete(minNode);

    // Find neighbors
    const neighbors = [];
    Object.entries(edges).forEach(([edgeKey, edge]) => {
      if (edge.u === minNode && queue.has(edge.v)) {
        neighbors.push({ neighbor: edge.v, edge, edgeKey });
      } else if (edge.v === minNode && queue.has(edge.u)) {
        neighbors.push({ neighbor: edge.u, edge, edgeKey });
      }
    });

    neighbors.forEach(({ neighbor, edge, edgeKey }) => {
      const cong = congestionMap[edgeKey] || 0.1;
      const isBlocked = blockedEdges.has(edgeKey);
      
      const alt = distances[minNode] + getEdgeTravelTime(edge, cong, vehicle, isBlocked);
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = minNode;
      }
    });
  }

  // Reconstruct path
  const path = [];
  let curr = targetKey;
  if (previous[curr] !== null || curr === startKey) {
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return {
    path,
    time: distances[targetKey] === Infinity ? 0 : distances[targetKey],
  };
};
