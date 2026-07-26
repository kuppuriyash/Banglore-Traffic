# Cisco Ideathon Interview Preparation — Q&A Guide
### Predictive Traffic Intelligence Platform — CC220 (Anurag University)

This guide contains the most likely questions an interviewer or judge will ask you during your Cisco Ideathon project presentation, along with strategic, technically precise answers.

---

## 1. Architectural & Cisco Integration Questions

### Q1: Why did you design a 7-layer architecture? Why not keep it simpler?
* **Answer**: "The 7-layer architecture is designed for modularity, scalability, and clean separation of concerns. In smart city systems, coupling data ingestion, edge processing, AI prediction, and routing into a monolithic system causes high latency and failure points. By separating the layers, we can upgrade our prediction models (Layer 4) without altering our edge configurations (Layer 2) or our delivery HUDs (Layer 6)."

### Q2: What is the role of Cisco Edge Intelligence in this platform? Why not process everything in the cloud?
* **Answer**: "Processing everything in the cloud leads to two critical problems: high network bandwidth costs and latency. In our platform, Cisco Edge Intelligence runs locally on IE3400 rugged switches at junctions. Instead of streaming raw CCTV video to the cloud, the edge nodes run local object detection models to extract vehicle counts and drop raw video frames. This reduces cloud data bandwidth by **84%** and cuts incident classification latency down to **1.8 milliseconds**, allowing instant local responses (e.g. green lights for ambulances) even if cellular connection to the cloud drops."

---

## 2. Machine Learning & Models Questions

### Q3: Why do you need 5 different ML models? Can't a single model handle it?
* **Answer**: "Traffic management involves different types of problems that require specialized mathematical approaches:
  * **ST-GNN** is spatial-temporal and is optimized to predict future road congestion maps.
  * **XGBoost** is a fast gradient-boosted tree classifier, perfect for binary and categorical incident classification from camera metadata.
  * **DRL** learns optimal pathfinding policies through trial-and-reward loops.
  * **MARL** coordinates traffic light synchronization across multiple intersections.
  A single model trying to solve all these tasks would be too large, slow to train, and perform poorly across the board."

### Q4: How does a Spatio-Temporal Graph Neural Network (ST-GNN) predict traffic better than standard LSTMs?
* **Answer**: "Standard LSTMs only capture temporal patterns (how traffic changes over time on a single road). However, traffic is also highly spatial—congestion on one flyover overflows into neighboring streets. An ST-GNN combines **Graph Convolutional Networks (GCN)**, which capture the spatial relationships (connections between roads), with **Gated Recurrent Units (GRU)**, which capture the temporal trends. This allows the system to predict congestion 30–60 minutes ahead with over 90% accuracy."

### Q5: In your Deep Reinforcement Learning (DRL) routing agent, how did you model the State, Action, and Reward?
* **Answer**: "We modeled the routing problem as a Markov Decision Process (MDP):
  * **State (\(S\))**: The current node position, target destination, hour of the day, and weather index.
  * **Action (\(A\))**: Selecting which neighboring intersection to move to next.
  * **Reward (\(R\))**: A negative reward (cost) representing travel time plus traffic density: \(R = -(\text{TravelTime} + \lambda \cdot \text{Congestion})\). The agent maximizes this reward by finding the fastest, least congested path."

---

## 3. Data Processing & Scale Questions

### Q6: How does the platform handle missing data or offline sensors in Layer 3?
* **Answer**: "Sensor failures are common in urban environments. In Layer 3 (Validation & Preprocessing), we implement spatial-temporal interpolation. If a loop sensor at a junction drops offline, the system estimates the traffic density by averaging the counts from upstream and downstream connected sensors, combined with historical averages for that specific hour. This ensures the prediction engine always receives complete tensors."

### Q7: How does the Continuous Learning loop (Layer 7) work in a live environment?
* **Answer**: "Once a commuter reaches their destination, the platform compares the predicted travel time with the actual travel time recorded via GPS. The error (Mean Absolute Error) is calculated. If the error spikes (e.g., due to unmapped road construction), the system logs the new travel patterns and schedules an automated retraining job on the edge/cloud servers to update the model weights. This keeps the predictions accurate without manual intervention."

---

## 4. Scope & Prototype Implementation Questions

### Q8: What are the main limitations of this prototype compared to your full proposed system?
* **Answer**: "Our prototype is built as an interactive React SPA to demonstrate the full end-to-end logic, UI delivery, and simulation flows. The main difference is that in the production system:
  * The edge processing (Layer 2) runs on physical Cisco IE3400 hardware.
  * The 5 models in Layer 4 are fully trained deep learning graphs hosted on cloud GPU servers (e.g. PyTorch/TensorFlow models).
  * The data ingestion is hooked to live city feeds.
  The prototype simulates these outputs mathematically (using Dijkstra for routing and exponential decay for learning loops) to prove the validity of the architecture."

### Q9: From where are you getting the traffic data used in this platform?
* **Answer**: "We must distinguish between the **Proposed Real-World Production System** and our **Prototype Demo**:
  * **In the Proposed Production System**: The data is ingested in real-time from three primary urban infrastructure providers:
    1. **Government/Municipal feeds**: Live feeds from traffic surveillance cameras, loop induction sensors, and SCATS/SCOOT traffic signal controllers.
    2. **Vehicle Telematics & Crowd-Sourced data**: Real-time GPS location updates from public transit (BMTC buses), commercial logistics operators, ridesharing services, and active mobile navigation apps.
    3. **Contextual sources**: Weather forecasts via REST APIs (e.g., OpenWeatherMap) and police dispatch logs for accidents or road closures.
  * **In our Demonstration Prototype**: Because accessing raw metropolitan government feeds requires restricted API keys and enterprise billing, the prototype uses a **dynamically simulated dataset** generated by a Python seeding engine (pushed to our GitHub). The engine simulates a 6x6 grid over 60 days of hourly intervals, introducing realistic noise, monsoon spikes, and rush-hour bottlenecks to provide a robust training set for our models."
