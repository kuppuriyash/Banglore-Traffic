# Predictive Traffic Intelligence Platform — Bangalore Road Grid
### Cisco Ideathon Pitch CC220 — Urban Tech Track (Anurag University)

A high-fidelity, interactive **React + Vite** web dashboard demonstrating the **7-Layer Architecture** of a Predictive Traffic Intelligence Platform, built from scratch for the Cisco Ideathon pitch deck.

This prototype demonstrates how integrating edge computing, multi-model AI routing, emergency prioritization, and continuous learning outperforms reactive navigation systems in urban environments like Bangalore.

---

## 🚀 Key Features Demonstrated

### 1. Spatio-Temporal Bangalore Grid Map
An interactive vector grid mapping key junctions in Bangalore:
* **Hebbal**, **KR Puram**, **MG Road**, **Koramangala**, **Silk Board**, and **Electronic City**.
* Dynamic color-coding showing predicted congestion levels (Green, Orange, Red).
* **Click-to-Select Nodes** allowing judges to set the routing origin/destination directly on the map.
* Simultaneous route comparisons:
  * **Naive Route** (dotted grey): Standard reactive shortest-path routing.
  * **AI Optimized Route** (glowing blue): Proactive detour routing based on predicted congestion.
  * **Emergency Corridor** (pulsing dashed red): Priority path for emergency vehicles.

### 2. Multi-Model AI Prediction Engine (Layer 4)
Interactive HUDs showing the simulated processes, inputs, and outputs of the 5 core models:
1. **ST-GNN (Spatio-Temporal Graph Neural Network)**: Forecasts congestion density 30–60 minutes ahead across the grid.
2. **XGBoost Classifier**: Classifies traffic incidents (breakdowns, collisions) from CCTV metadata.
3. **DRL (Deep Reinforcement Learning)**: Solves for optimal journey policies using travel-time rewards.
4. **MARL Priority (Multi-Agent RL)**: Coordinates traffic light timings to create prioritized "green wave" corridors.
5. **MARL + Graph Optimization**: Optimizes overall network load distribution to balance traffic.

### 3. Vehicle-Aware Routing (Layer 5)
Supports different vehicle classes with realistic constraints:
* **🏍️ Motorbike (Filters Traffic)**: Reduced congestion multiplier (`0.4x`) since bikes can filter between cars. Takes shorter routes even in heavy traffic.
* **🚛 Heavy Truck (Highway-Restricted)**: Barred from residential/minor roads (base speed <= 40 kmph) with a massive `+50 min` weight penalty. Congestion multiplier is increased to `4.0x`.
* **🚙 Private Car (Standard)**: Standard balanced routing.

### 4. Continuous Learning Loop (Layer 7)
Demonstrates the model retraining cycle. Clicking **Simulate Day + Retrain** runs a simulated training epoch, reducing prediction Mean Absolute Error (MAE) and updating the learning curve graph dynamically.

---

## 🛠️ Project Structure

* `src/App.jsx` — Core state manager, scenario selectors, and layout compiler.
* `src/App.css` — Global CSS stylesheet with glassmorphic dark-theme styles.
* `src/components/NetworkMap.jsx` — Visual SVG Bangalore road grid with flow animations and event overlays.
* `src/components/LayerDetail.jsx` — Component detailing operations and sub-visuals for all 7 layers.
* `src/utils/routing.js` — Core pathfinder module implementing the Dijkstra algorithm with vehicle-aware edge weights.

---

## ⚙️ Local Installation & Setup

1. **Install Node.js** (v18+ recommended)
2. **Clone the repository**:
   ```bash
   git clone https://github.com/kuppuriyash/Banglore-Traffic.git
   cd Banglore-Traffic
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the local development server**:
   ```bash
   npm run dev
   ```
5. **Open the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.
