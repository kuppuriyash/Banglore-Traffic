# Deep-Dive System Architecture & Codebase Documentation
### Predictive Traffic Intelligence Platform — Cisco Ideathon (CC220, Anurag University)

This document provides a highly detailed, end-to-end technical breakdown of how the **Predictive Traffic Intelligence Platform** is built, how each feature operates, and how the 5 core machine learning models function in a real production environment versus how they are simulated in this prototype.

---

## 1. Codebase Structure & Build Detail

The prototype is built as a highly responsive Single Page Application (SPA) using **React (v19)** and **Vite**, styled with **Vanilla CSS3**. The entire codebase is structured to run locally with zero network round-trip overhead.

### File Hierarchy
```text
C:\Users\Yaswanth\.gemini\antigravity\scratch\traffic-intelligence-dashboard\
├── index.html                  # HTML entry point (loads Outfitters & Plus Jakarta fonts)
├── package.json                # Project configurations & dependency declarations
├── vite.config.js              # Vite compiler configuration
├── src/
│   ├── main.jsx                # React DOM render mounting point
│   ├── index.css               # Global reset styles
│   ├── App.jsx                 # Core state manager and layout compiler
│   ├── App.css                 # Dark-mode glassmorphic styling system
│   ├── components/
│   │   ├── NetworkMap.jsx      # Interactive SVG Bangalore grid component
│   │   └── LayerDetail.jsx     # Side panel visualizer for the 7 architecture layers
│   └── utils/
│       └── routing.js          # Custom Dijkstra pathfinder with vehicle-aware weights
```

### Dijkstra Pathfinding Implementation (`routing.js`)
Rather than relying on third-party routing libraries, we implemented a custom Dijkstra shortest-path algorithm in vanilla JavaScript. 
1. **Network Initialization**: A deterministic pseudorandom seed generator constructs a 6×6 road grid representing a city core. Landmark nodes (Hebbal, MG Road, Silk Board, etc.) are pinned to coordinates in a virtual SVG viewport.
2. **Dynamic Weight Allocation**: Roads are assigned edge weights (travel times in minutes) calculated using lengths, speed limits, vehicle coefficients, congestion levels, and detour penalties.
3. **The Pathfinder Algorithm**:
   * Initializes all node distances to `Infinity` and the start node to `0`.
   * Continually visits the unvisited node with the lowest distance.
   * Updates distances to neighbors by adding the dynamic weight of the connecting road.
   * Terminates when the target node is reached, backtracking through the stored list of parent nodes to reconstruct the optimal path.

---

## 2. Step-by-Step Feature Walkthrough

### Feature 1: Scenario Configuration (Hour, Weekend, Monsoon Rain)
* **How it is Built**: Handled via React state controls in the sidebar (`hour`, `isWeekend`, `isRaining`). 
* **Under the Hood Logic**: An `useEffect` hook in `App.jsx` listens for updates to these states and dynamically recalculates the congestion matrix for all 60 road links:
  * **Rush Hour (8 AM - 11 AM, 5 PM - 8 PM)**: Weekdays apply a severe traffic bump of `+0.45` to the baseline congestion factor of all roads.
  * **Mid-Day (12 PM - 4 PM)**: Applies a moderate bump of `+0.20` to simulate lunch hour movements.
  * **Weekend Shift**: Shims rush hour triggers, applying a steady `+0.25` density bump from 11 AM to 8 PM.
  * **Monsoon rain**: Adds a `+0.22` factor across all roads to simulate slower driving speeds, lane waterlogging, and water-induced delays.

### Feature 2: Vehicle-Aware Pathfinding (Car vs. Bike vs. Truck)
* **How it is Built**: Configured via a dropdown in the sidebar and computed inside `getEdgeTravelTime` in `routing.js`.
* **Under the Hood Logic**:
  * **Motorbike (Bike)**: Uses a speed factor of `1.15x` and scales congestion down to **`0.4x`**. While cars sit bumper-to-bumper, motorbikes filter through. If a route has a congestion rating of `80%`, a motorbike only feels `32%` congestion delay, causing Dijkstra to choose shorter, denser paths.
  * **Heavy Truck (Truck)**: Uses a speed factor of `0.85x` and scales congestion up to **`4.0x`** (trucks take much longer to accelerate in gridlock). Additionally, if an edge has a base speed limit of `40 kmph` or lower (narrow internal roads), a massive **`+50 minute`** penalty is added to that edge, forcing the truck to stick entirely to wide arterial highways.
  * **Private Car (Car)**: Represents standard baseline parameters (speed factor `1.0x`, congestion scaling `2.5x`).

### Feature 3: Interactive Node Picker (Map Clicks)
* **How it is Built**: An SVG container inside `NetworkMap.jsx` binds an `onClick` handler to all 36 node coordinate pins.
* **Under the Hood Logic**: Clicking a node toggles its state in `App.jsx`. If no origin node is selected, the clicked node is highlighted in glowing Blue (`sourceNode`). The next clicked node is highlighted in green (`targetNode`). If you click an active node again, it is deselected. Once both nodes are active, Dijkstra calculates paths instantly.

### Feature 4: Live Incident Simulation (XGBoost Alert)
* **How it is Built**: Enabled via the "Simulate Road Incident" toggle.
* **Under the Hood Logic**: Turning this on flags junction **MG Road (2,2)** as blocked. The congestion calculations immediately inject a massive **`+0.50`** congestion penalty to all roads connected to MG Road. The XGBoost classifier HUD displays a simulated camera feed alert, and Dijkstra immediately routes vehicles around MG Road to avoid the gridlock.

### Feature 5: Emergency Green-Wave Corridor (MARL Priority)
* **How it is Built**: Enabled via the "Emergency Corridor" toggle.
* **Under the Hood Logic**: Automatically launches an ambulance routing routine from **Hebbal (0,0)** to **Electronic City (5,5)** using the `Emergency` vehicle profile (speed factor `1.3x`, congestion scaling `0.2x` due to green lights). 
  Once calculated, all edges along this ambulance path are locked. Standard commuter vehicles (Cars, Trucks) routing across the grid are penalized **`+15 minutes`** if they use these emergency edges, forcing them to detour and leave the lane clear.

### Feature 6: Continuous Learning Retrainer
* **How it is Built**: Enabled via a button in Layer 7, visualized using a custom SVG `<polyline>` line chart in `LayerDetail.jsx`.
* **Under the Hood Logic**: Clicking "Retrain" launches a simulated 1.5-second training process (`isRetraining = true`). Upon completion, a new training data point is appended to the history. The Mean Absolute Error (MAE) decreases exponentially towards an asymptote:
  \[
  \text{MAE}_{t+1} = \max(0.041, \text{MAE}_t - (\text{MAE}_t - 0.04) \times 0.4)
  \]
  This mimics the real platform adapting to historical outcomes and reducing errors.

---

## 3. Deep-Dive: The 5 Core AI Models (How They Work in Production)

In the production platform, these models run in parallel on cloud and edge processors. Below is the detailed explanation of their mathematical and algorithmic operations:

```text
                               ┌─────────────┐
                               │  ST-GNN     ├─► Congestion Forecast
                               └─────────────┘
                               ┌─────────────┐
                               │  XGBoost    ├─► Incident Classification
                               └─────────────┘
Raw Preprocessed Data ───────► ┌─────────────┐
                               │  DRL Agent  ├─► Route Optimization
                               └─────────────┘
                               ┌─────────────┐
                               │  MARL Sig.  ├─► Coordinated Signals
                               └─────────────┘
                               ┌─────────────┐
                               │ MARL+Graph  ├─► Flow Load Balancing
                               └─────────────┘
```

### 1. ST-GNN (Spatio-Temporal Graph Neural Network)
* **Real-World Logic**: Traditional neural networks process data in grids (images) or sequences (text). Road networks are graphs, which requires a Graph Neural Network (GNN).
  * **Spatial Component**: Represents roads as edges and junctions as nodes. Spatially, congestion on one road (e.g., Silk Board) quickly overflows onto adjacent roads. ST-GNN uses **Graph Convolutional Networks (GCN)** to aggregate traffic features from neighboring roads using the network adjacency matrix \(A\).
  * **Temporal Component**: Traffic changes over time. ST-GNN pairs GCNs with **Gated Recurrent Units (GRU)** or Long Short-Term Memory (LSTM) layers to analyze time-series patterns (e.g., the last 12 five-minute steps).
  * **Formula**:
    \[
    H^{(l+1)} = \sigma \left( \tilde{D}^{-\frac{1}{2}} \tilde{A} \tilde{D}^{-\frac{1}{2}} H^{(l)} W^{(l)} \right)
    \]
    Where \(\tilde{A} = A + I_N\) (adjacency matrix with self-loops), \(\tilde{D}\) is the degree matrix, and \(W\) is the weight matrix.
* **Prototype Simulation**: Direct output mapped to edge travel times based on time-of-day, rain, and incident states, returning a precise `congestion` index between `0.05` and `0.98`.

### 2. XGBoost (Extreme Gradient Boosting) Classifier
* **Real-World Logic**: Deployed to classify the type and severity of incidents (e.g., vehicle breakdown, major accident, road construction) using metadata.
  * **Training**: Trains an ensemble of weak decision trees sequentially, where each new tree corrects the residual errors of the previous trees.
  * **Features**: CCTV flow rates, localized speed deceleration rates (e.g., sudden `80%` speed drop on a link), and weather indices.
  * **Output**: A probability distribution across incident classes.
* **Prototype Simulation**: Toggling "Simulate Incident" feeds an event vector containing a sudden speed anomaly to the mock classifier. It outputs an `Accident` classification with a `96.8%` confidence score, updating the UI logs.

### 3. DRL (Deep Reinforcement Learning) Routing Agent
* **Real-World Logic**: Learns the optimal sequence of turns (actions) to navigate a vehicle through a city core.
  * **State Space (\(S\))**: Current node location, destination node location, time of day, and weather condition.
  * **Action Space (\(A\))**: The set of neighboring junctions connected to the current node.
  * **Reward Function (\(R\))**: Emits a negative reward (penalty) for every travel minute elapsed plus extra penalties for congested links:
    \[
    R_t = -(\text{TravelTime} + \lambda \cdot \text{CongestionLevel})
    \]
  * **Optimization**: Uses Proximal Policy Optimization (PPO) to train an actor-critic model that maximizes cumulative rewards, effectively learning to avoid congestion bottlenecks.
* **Prototype Simulation**: Computes the optimal path in JavaScript via Dijkstra using DRL-equivalent weighted edge inputs. The details HUD displays the state-action parameters and reward criteria.

### 4. MARL (Multi-Agent Reinforcement Learning) Signal Coordinator
* **Real-World Logic**: Manages traffic signals at multiple adjacent intersections.
  * **Decentralized Agents**: Each junction has its own signal controller agent.
  * **Coordination**: Agents communicate with neighboring junctions to coordinate green phases, preventing green lights from pushing traffic into downstream blockages.
  * **Priority Routing**: When an emergency vehicle approaches, the agents along the route prioritize its direction, turning signals green sequentially (Green Wave) while holding cross-traffic.
* **Prototype Simulation**: Activates when "Emergency Corridor" is toggled. The Layer 4 MARL HUD displays active signal phase synchronization metrics, showing green lights clearing along the path.

### 5. MARL + Graph Optimization Load Balancer
* **Real-World Logic**: Avoids the "selfish routing" problem where standard GPS navigation systems guide all drivers to the same shortest path, creating a new bottleneck.
  * **Graph Partitioning**: Partitions the city road graph into sub-regions.
  * **Flow Distribution**: Uses game-theoretic models to distribute vehicle traffic across multiple alternative paths so that the overall variance in road utilization is minimized.
* **Prototype Simulation**: Runs comparison metrics between the baseline route and the load-balanced route, displaying network utilization capacity percentages (+18% network utilization) in the Layer 4 sub-dashboard.
