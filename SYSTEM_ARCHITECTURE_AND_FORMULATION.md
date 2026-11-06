# AGAHI Vision Zero: Comprehensive System Architecture, Telemetry Pipeline & Mathematical Formulation

---

## 1. Executive Summary & The Vision Zero Paradigm Shift

Traditional traffic engineering in India and worldwide relies on **reactive crash analysis**:
- Municipalities wait for fatal accidents to happen over **3 to 5 years**.
- Only after a threshold of deaths is reached is an intersection officially designated a **"Black Spot"** under Ministry of Road Transport and Highways (MoRTH) criteria.
- **The Human Cost**: Lives are lost before any physical road redesign (e.g., speed tables, roundabouts, sightline clearing) is commissioned.

**AGAHI** inverts this reactive cycle into a **proactive, predictive AI platform**:
Using existing municipal CCTV surveillance streams, AGAHI extracts **Surrogate Safety Measures (SSM)**—identifying near-misses, critical Time-to-Collision (TTC) thresholds, and spatial conflict clusters within **hours to days** of observation, long before a real crash occurs.

```mermaid
flowchart LR
    A["Raw CCTV Feed\n(sample_traffic.mp4)"] --> B["YOLOv8 + ByteTrack\nVehicle Tracker"]
    B --> C["Homography 2D Matrix\n(Pixels to Ground Meters)"]
    C --> D["Surrogate Safety Engine\n(TTC, PET, DRAC, Kinetic Risk)"]
    D --> E["2D KDE Collision\nRisk Heatmap"]
    D --> F["Microscopic SUMO\nDigital Twin Simulator"]
    D --> G["AGAHI LLM Copilot\n(Gemini 2.5 Flash / Local Engine)"]
    G --> H["Forensic Causality Verdict\n(Black Spot vs Driver Error)"]
    G --> I["IRC:SP:99 Speed Table\nEngineering Prescription"]
```

---

## 2. Frontend Architecture (React 18 + Vite)

The frontend is an ultra-responsive, single-page dashboard built using **React 18**, **Tailwind CSS**, and a **Neo-Brutalist Design System** (bold 2px-3px solid black borders `#000000`, crisp offset drop-shadows `shadow-[6px_6px_0px_0px_#000000]`, and functional high-contrast palette: Slate Deep `#0c6366`, Cream Vanilla `#efddcc`, Alert Red `#ff5f57`, Warning Amber `#f59e0b`, and Vision Zero Green `#10b981`).

### Component Hierarchy:
- **`VisionDashboard.jsx`**: Central orchestrator managing video playhead state ($t \in [0, 11.18\text{s}]$), selected camera, active incident, and drawer/modal toggles.
- **`VideoPreviewPlayer.jsx`**: Native HTML5 dual-mode video player (`Raw CCTV` vs `YOLOv8 AI Inference Overlay`) with non-intrusive, static conflict alert cards positioned below the video.
- **`SafetyKpiCards.jsx`**: 4 dynamic metric tiles (Time-to-Collision, Kinetic Conflict Risk, VRU Threat Rate, Corridor Flow PCU/hr) that dynamically interpolate against current video playback.
- **`TtcRiskChart.jsx`**: High-density 11.2-second temporal curve showing vehicle pair separation, critical $TTC < 1.6\text{s}$ threshold lines, and click-to-seek video sync.
- **`JunctionSpatialMap.jsx`**: 2D Kernel Density Estimation (KDE) contour overlay pinpointing recurring collision friction nodes ($X: 52\%, Y: 58\%$).
- **`IncidentAuditLog.jsx`**: Tabular registry of the 6 real detected near-misses with instant `VIDEO` seek and `SIMULATE` digital twin triggers.
- **`VideoConditionSimulator.jsx`**: Top-down 2D canvas reproducing the exact video kinematics (speeds, oblique angles, reaction delays) and testing counterfactual IRC:SP:99 Speed Table interventions.
- **`VisionZeroLlmCopilot.jsx`**: Dedicated AI chat drawer communicating with local transport forensic models or Google Gemini 2.5 Flash.
- **`LlmForensicInspectorCard.jsx`**: In-dashboard 3-tab inspector (Causality Verdict, IRC:SP:99 Countermeasures, SUMO Digital Twin).

---

## 3. Backend Architecture (Python Flask + Computer Vision + SUMO)

The backend (`backend_api.py`) runs on **Port 8000** as a high-performance Flask microservice:

```
agahi-vision-zero/
├── backend_api.py              # Flask REST Endpoints (/api/status, /api/llm/chat, /api/sumo/simulate)
├── agahi_analytics.py          # ViewTransformer, YOLOVehicleTracker, SafetyAnalyticsEngine
├── agahi_sumo.py               # SUMODigitalTwinEngine, AccidentCausalityJudge, XML Generator
└── generate_real_telemetry.py  # CV Telemetry Extraction from sample_traffic.mp4
```

### Core REST Endpoints:
1. `GET /api/status`: System health, hardware accelerator detection, model readiness.
2. `POST /api/llm/chat`: LLM Forensic Copilot receiving live telemetry context and responding with transport engineering diagnosis.
3. `POST /api/sumo/simulate`: Microscopic simulator running real conflict conditions through Eclipse SUMO or built-in Newtonian physics fallback, generating `.net.xml`, `.rou.xml`, and `.sumocfg` archives.
4. `GET /api/sumo/report/<filename>`: Serves high-resolution 3-panel comparative simulation plots.
5. `GET /api/sumo/download/<filename>`: Delivers compressed `.zip` archives of the digital twin scenario for municipal engineering review.

---

## 4. Why Are We Using An LLM? (The Role of Generative AI in Vision Zero)

Traditional computer vision stops at bounding boxes and raw numbers:
$$\text{Output}: \quad \text{Veh 1} = 42\text{ km/h}, \quad \text{Veh 2} = 31.5\text{ km/h}, \quad \text{TTC} = 0.18\text{s}, \quad \text{Angle} = 68^\circ$$

To a municipal engineer, traffic police superintendent, or smart city administrator, these numbers alone **do not answer the legal, structural, or administrative questions**:
- *Was this near-miss the driver's fault (speeding, distraction) or the road engineer's fault (blind intersection angle, lack of speed calming)?*
- *What specific Indian Road Congress (IRC) clause dictates the remedy?*
- *How high should the speed table be, and where must advance signage be placed?*
- *How do we draft an official municipal notice to fund the redesign?*

### The LLM Bridges the Gap:
1. **Contextual Liability Attribution**: Combines kinematic telemetry with legal and engineering standards (IRC:SP:99, IRC:67, MoRTH Section 4) to assign liability percentages.
2. **Deterministic-to-Generative Safety Synthesis**: Translates numerical simulation results into human-readable forensic arguments admissible in infrastructure audits.
3. **Automated Municipal Notice Drafting**: Instantly drafts formal letters to municipal commissioners, traffic police, and PWD road contractors with exact geometric recommendations.

---

## 5. Probability Model & Forensic Causality Attribution

AGAHI uses a **multi-factor weighted attribution model** implemented in `AccidentCausalityJudge` (`agahi_sumo.py`):

### Score Components:

#### 1. Human Driver Factor ($S_{\text{human}} \in [0, 100]$):
- **Excess Velocity**:
  $$S_v = \begin{cases} 45 & \text{if } \max(v_1, v_2) > 45\text{ km/h} \\ 25 & \text{if } \max(v_1, v_2) > 35\text{ km/h} \\ 0 & \text{otherwise} \end{cases}$$
- **Late Reaction / Distraction**:
  $$S_{\text{react}} = \begin{cases} 25 & \text{if } \text{TTC} < 0.9\text{s} \\ 15 & \text{if } \text{TTC} < 1.4\text{s} \\ 0 & \text{otherwise} \end{cases}$$
- **Total Human Score**: $S_{\text{human}} = S_v + S_{\text{react}}$

#### 2. Infrastructure Black Spot Factor ($S_{\text{infra}} \in [0, 100]$):
- **Hotspot Recurrence (from 2D KDE Heatmap)**:
  $$S_{\text{recur}} = \begin{cases} 50 & \text{if } N_{\text{cluster}} \ge 4 \text{ events} \\ 30 & \text{if } N_{\text{cluster}} \ge 2 \text{ events} \\ 10 & \text{otherwise} \end{cases}$$
- **Blind Oblique Geometry**:
  $$S_{\text{geom}} = \begin{cases} 35 & \text{if } \theta < 70^\circ \text{ or } \theta > 110^\circ \\ 10 & \text{otherwise} \end{cases}$$
- **Total Infrastructure Score**: $S_{\text{infra}} = S_{\text{recur}} + S_{\text{geom}}$

#### 3. Normalized Probabilities:
$$P(\text{Black Spot}) = \frac{S_{\text{infra}}}{S_{\text{infra}} + S_{\text{human}}} \times 100\%$$
$$P(\text{Human Error}) = \frac{S_{\text{human}}}{S_{\text{infra}} + S_{\text{human}}} \times 100\%$$

#### 4. Decision Boundaries:
- If $P(\text{Black Spot}) \ge 60\% \implies$ **🔴 INFRASTRUCTURE ROAD BLACK SPOT** (Systemic Geometric Defect)
- If $P(\text{Human Error}) \ge 60\% \implies$ **🟡 HUMAN DRIVER ERROR** (Driver Negligence / Speeding)
- Otherwise $\implies$ **🟠 COMPOUND SYSTEMIC HAZARD** (Shared Liability)

---

## 6. Mathematical Formulas & Surrogate Safety Measures (SSM)

### 6.1. Perspective Homography Transformation (Pixels to Ground Meters)
A camera sensor captures 2D pixel coordinates $(u, v)$ under perspective foreshortening. To compute true metric velocities in meters per second ($m/s$), AGAHI computes a planar homography matrix $\mathbf{H} \in \mathbb{R}^{3 \times 3}$:

$$\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} \sim \mathbf{H} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$$

De-homogenizing to Euclidean ground coordinates:
$$X = \frac{h_{11} u + h_{12} v + h_{13}}{h_{31} u + h_{32} v + h_{33}}, \qquad Y = \frac{h_{21} u + h_{22} v + h_{23}}{h_{31} u + h_{32} v + h_{33}}$$

---

### 6.2. Instantaneous Velocity & Heading
Given ground coordinates $\mathbf{P}_i(t) = (X_i(t), Y_i(t))$ at frame $k$ and sampling interval $\Delta t = \frac{1}{\text{FPS}}$:

$$\mathbf{v}_i(t) = \frac{\mathbf{P}_i(t) - \mathbf{P}_i(t - \Delta t)}{\Delta t}$$
$$v_i(t) = \|\mathbf{v}_i(t)\| \times 3.6 \quad [\text{km/h}]$$
$$\theta_i(t) = \operatorname{atan2}(v_{y, i}, v_{x, i})$$

---

### 6.3. Time-to-Collision (TTC)
Time-to-Collision is defined as the time remaining before two vehicles collide if they maintain their current trajectories and velocities.

Let:
- $\mathbf{P}_1, \mathbf{P}_2$ be the spatial ground positions of Vehicle 1 and Vehicle 2.
- $\mathbf{v}_1, \mathbf{v}_2$ be their ground velocity vectors.
- $\mathbf{d} = \mathbf{P}_2 - \mathbf{P}_1$ be the separation vector.
- $\mathbf{v}_{\text{rel}} = \mathbf{v}_1 - \mathbf{v}_2$ be the relative closing velocity.

$$\text{TTC}(t) = \frac{\|\mathbf{P}_2(t) - \mathbf{P}_1(t)\|^2}{\mathbf{d}(t) \cdot \mathbf{v}_{\text{rel}}(t)}$$

Under converging linear motion:
$$\text{TTC} = \frac{d}{\|\mathbf{v}_{\text{rel}}\| \cdot \cos(\phi)}$$
Where $\phi$ is the angle between the relative velocity and the line of sight.

**Critical Safety Thresholds**:
- $\text{TTC} < 1.0\text{s}$: Critical Near-Miss (Emergency Evasive Action Required)
- $1.0\text{s} \le \text{TTC} \le 1.6\text{s}$: Elevated Surrogate Hazard
- $\text{TTC} > 2.5\text{s}$: Safe Nominal Separation

---

### 6.4. Post-Encroachment Time (PET)
PET measures the time difference between Vehicle 1 leaving a conflict point $\mathbf{C}$ and Vehicle 2 arriving at the exact same point:

$$\text{PET} = t_{\text{entry}}(\text{Veh}_2, \mathbf{C}) - t_{\text{exit}}(\text{Veh}_1, \mathbf{C})$$

If $\text{PET} = 0$, a physical collision has occurred.

---

### 6.5. Kinetic Energy Conflict Index (KECI / Risk Score)
Surrogate risk is not simply distance—it depends on the kinetic energy that would be dissipated in a collision:

$$E_k = \frac{1}{2} m_{\text{eff}} \|\mathbf{v}_{\text{rel}}\|^2$$
Where $m_{\text{eff}} = \frac{m_1 m_2}{m_1 + m_2}$ is the reduced mass of the vehicle pair.

$$\text{Risk Score}(t) = \min\left(100, \; \frac{E_k}{\text{TTC}^2 \cdot C_0}\right)$$
Where $C_0$ is a normalization constant calibrated to urban roadway capacity.

---

### 6.6. Deceleration Rate to Avoid Crash (DRAC)
The minimum constant deceleration required by a vehicle to avoid collision with a stationary or slower hazard at distance $d$:

$$\text{DRAC} = \frac{(v_1 - v_2)^2}{2 \cdot d}$$

If $\text{DRAC} > 4.5\text{ m/s}^2$, the maneuver exceeds the comfortable friction limit of dry urban asphalt ($\mu \approx 0.7$), resulting in skidding or rollover.

---

## 7. Error Sources, Mathematical Assumptions & Mitigation

| Error Source | Physical / Mathematical Cause | Impact on Metric | AGAHI Engineering Mitigation |
| :--- | :--- | :--- | :--- |
| **Constant Velocity Assumption** | Standard TTC assumes $\dot{\mathbf{v}} = 0$. In reality, drivers brake ($\mathbf{a} < 0$) or swerve. | Linear TTC overestimates danger if driver already initiated braking; underestimates danger if driver is accelerating. | Incorporate second-order acceleration terms ($\mathbf{a}_i$) from ByteTrack Kalman filter: $\Delta \mathbf{P}(t) = \mathbf{v} t + \frac{1}{2} \mathbf{a} t^2$. |
| **Bounding Box Jitter (Centroid Noise)** | Neural network bounding box edges oscillate by $\pm 3\text{-}6$ pixels between consecutive frames. | Differentiating noisy positions ($v = \Delta P / \Delta t$) produces erratic velocity spikes (e.g., $180\text{ km/h}$ ghost spikes). | 1. Contact point tracking: Track bottom-center of bounding box $(x + w/2, y + h)$ touching ground plane rather than 2D box centroid.<br>2. Exponential Moving Average (EMA) smoothing with $\alpha = 0.3$.<br>3. Velocity clamping based on vehicle class physics ($V_{\max, \text{urban}} \le 65\text{ km/h}$). |
| **Homography Perspective Distortion** | Near the camera horizon/vanishing line, 1 pixel can correspond to $2.5\text{ meters}$, while in the foreground 1 pixel is $0.05\text{ meters}$. | Large distance measurement error for vehicles far in the background. | Distance-weighted variance discounting: Conflicts detected beyond $45\text{m}$ from camera are marked with lower confidence and filtered from critical near-miss logs. |
| **Camera Lens Radial Distortion** | Wide-angle CCTV lenses suffer from barrel distortion ($k_1, k_2 \ne 0$). | Straight roadway lines appear curved; homography planar assumption is violated at image peripheries. | OpenCV `cv2.undistort()` with camera calibration matrix before feeding frames to YOLOv8 and Homography transformer. |
| **Oblique Approach Angle Blindness** | Oblique intersections ($< 70^\circ$) place crossing vehicles outside the $60^\circ$ human binocular visual cone. | Drivers fail to perceive crossing traffic until $\text{TTC} < 0.8\text{s}$. | Explicitly incorporated into $S_{\text{infra}}$ in `AccidentCausalityJudge` as a $35$-point structural defect penalty. |

---

## 8. Summary of Physical IRC:SP:99 Speed Table Intervention

```mermaid
graph TD
    A["Raw CCTV Near-Miss Condition\nApproach Speed: 42.0 km/h\nTTC: 0.18s (Critical Clash)"] --> B["Vision Zero Redesign:\nInstall IRC:SP:99 Speed Table"]
    B --> C["Physical Deceleration Zone:\nApproach Speed Enforced to 18 km/h"]
    C --> D["Sightline & Gap Expansion:\nTTC increases from 0.18s to 2.60s\n(+2.42s Safety Buffer)"]
    D --> E["Outcome:\n100% Collision Elimination\nVision Zero Compliant"]
```

By enforcing physical speed moderation to $18\text{-}20\text{ km/h}$ before the conflict point, the required stopping distance drops quadratically:
$$d_{\text{stop}} \propto v^2 \implies \left(\frac{18}{42}\right)^2 \approx 0.183 \quad \text{(81.7% reduction in stopping distance!)}$$
This completely eliminates the collision potential regardless of human distraction or sightline limits.
