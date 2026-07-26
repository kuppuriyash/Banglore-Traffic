import pandas as pd
import numpy as np

# Seed for replication
np.random.seed(42)

GRID_SIZE = 6
DAYS = 60
HOURS = 24

# Bangalore Landmarks coordinates
landmarks = {
    (0, 0): "Hebbal",
    (0, 5): "KR Puram",
    (5, 0): "Silk Board",
    (5, 5): "Electronic City",
    (2, 2): "MG Road",
    (3, 3): "Koramangala",
}

def get_node_name(r, c):
    return landmarks.get((r, c), f"Jn-{r}{c}")

# Build Edge list
edges = []
edge_id = 0
for r in range(GRID_SIZE):
    for c in range(GRID_SIZE):
        u = f"{r},{c}"
        u_name = get_node_name(r, c)
        
        if c + 1 < GRID_SIZE:
            v = f"{r},{c+1}"
            v_name = get_node_name(r, c+1)
            edges.append({
                "edge_id": edge_id,
                "u": u,
                "v": v,
                "u_name": u_name,
                "v_name": v_name,
                "length_km": round(np.random.uniform(1.0, 2.5), 2),
                "base_speed": int(np.random.choice([30, 40, 50, 60])),
                "congestion_bias": round(np.random.uniform(0.1, 0.6), 2)
            })
            edge_id += 1
            
        if r + 1 < GRID_SIZE:
            v = f"{r+1},{c}"
            v_name = get_node_name(r+1, c)
            edges.append({
                "edge_id": edge_id,
                "u": u,
                "v": v,
                "u_name": u_name,
                "v_name": v_name,
                "length_km": round(np.random.uniform(1.0, 2.5), 2),
                "base_speed": int(np.random.choice([30, 40, 50, 60])),
                "congestion_bias": round(np.random.uniform(0.1, 0.6), 2)
            })
            edge_id += 1

# Simulation ground truth function
def get_congestion(bias, hour, is_weekend, is_raining, incident):
    if not is_weekend and (8 <= hour <= 11 or 17 <= hour <= 20):
        rush = 0.45
    elif not is_weekend and (12 <= hour <= 16):
        rush = 0.20
    elif is_weekend and (11 <= hour <= 20):
        rush = 0.25
    else:
        rush = 0.05

    rain_bump = 0.22 if is_raining else 0.0
    incident_bump = 0.50 if incident else 0.0
    noise = np.random.normal(0, 0.04)

    val = bias * 0.3 + rush + rain_bump + incident_bump + noise
    return float(np.clip(val, 0.05, 0.98))

# Generate dataset rows
rows = []
for day in range(DAYS):
    is_weekend = (day % 7) in (5, 6)
    is_raining_day = np.random.random() < 0.15
    
    for hour in range(HOURS):
        is_raining = is_raining_day and np.random.random() < 0.70
        
        for edge in edges:
            # incident happens near MG Road (nodes connected to (2,2))
            is_near_mg = edge["u"] == "2,2" or edge["v"] == "2,2"
            incident = is_near_mg and np.random.random() < 0.08 if day % 10 == 0 else False
            
            cong = get_congestion(edge["congestion_bias"], hour, is_weekend, is_raining, incident)
            
            rows.append({
                "day": day,
                "hour": hour,
                "is_weekend": int(is_weekend),
                "is_raining": int(is_raining),
                "incident": int(incident),
                "edge_id": edge["edge_id"],
                "origin": edge["u_name"],
                "destination": edge["v_name"],
                "length_km": edge["length_km"],
                "speed_limit_kmph": edge["base_speed"],
                "congestion_level": round(cong, 3)
            })

df = pd.DataFrame(rows)
output_file = "C:/Users/Yaswanth/.gemini/antigravity/scratch/traffic-intelligence-dashboard/historical_traffic.csv"
df.to_csv(output_file, index=False)
print(f"Dataset successfully created with {len(df)} records at {output_file}")
