# 5G NR RRC State Machine Simulation

**Python port of MATLAB Simulink/App Designer model**

A real-time discrete-event simulation of the 5G New Radio (NR) Radio Resource Control (RRC) state machine, compliant with 3GPP TS 38.331 specifications.

## Key Features

- ✅ **3GPP-Compliant State Machine**: RRC_IDLE, RRC_CONNECTED, and RRC_INACTIVE states
- ✅ **Adaptive Inactivity Timers**: Profile-based (IoT vs Streaming) with different thresholds
- ✅ **Real-Time Visualization**: Live charts, state lamps, and metrics display
- ✅ **User-Controlled Workflow**: Start/Stop button with 3-step process
- ✅ **Energy Tracking**: Zero power in IDLE, accurate consumption in other states
- ✅ **Comprehensive Testing**: 10 unit tests + 250-test comparative study
- ✅ **Performance Analysis**: Detailed comparison of static vs adaptive timers

## Features

- **3GPP-Compliant State Machine**: Implements RRC_IDLE, RRC_CONNECTED, and RRC_INACTIVE states with proper transition guards
- **Adaptive Inactivity Timer**: Dynamically adjusts sleep threshold based on traffic profiles (Streaming vs IoT)
- **Real-Time Visualization**: Live strip-chart plotting of state transitions and data activity
- **Energy Tracking**: Calculates and displays cumulative power consumption
- **Interactive GUI**: Control buttons for data bursts and paging events

## RRC State Diagram

```
                    data_request / paging
        IDLE ────────────────────────────> CONNECTED
         ^                                      │
         │                                      │ inactivity_timer > threshold
         │                                      v
         │                                  INACTIVE
         │                                      │
         └──────────────────────────────────────┘
              long_inactivity_timer > threshold
              
        Fast Resume: INACTIVE ─data_request─> CONNECTED
```

**Timing (profile-dependent):**
- **IoT Burst**: CONNECTED→INACTIVE (200ms), INACTIVE→IDLE (5s)
- **Streaming**: CONNECTED→INACTIVE (10s), INACTIVE→IDLE (20s)

## Installation

### Prerequisites

- Python 3.7 or higher
- tkinter (usually included with Python)
- pip package manager

### Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install numpy matplotlib
```

## Usage

### Run the Simulation

```bash
python3 main.py
```

The GUI will open with the simulation **paused** by default.

### Quick Start
1. **Select traffic profile** (Streaming or IoT Burst)
2. **Click "START SIMULATION"** (green button)
3. **Trigger events** using the data/paging buttons
4. **Click "STOP SIMULATION"** to pause and change settings

See [QUICKSTART.md](QUICKSTART.md) for detailed step-by-step guide.

### GUI Controls

**Step 1: Select Traffic Profile** (choose before starting)
- **Streaming (10s inactivity)**: For video/audio streaming with long sessions
- **IoT Burst (200ms inactivity)**: For sensor data with short, frequent bursts

**Step 2: Start Simulation**
- **▶ START SIMULATION**: Begins the simulation engine (button turns red and shows STOP)
- **⏸ STOP SIMULATION**: Pauses the simulation (allows changing traffic profile)

**Step 3: Trigger Events** (only available when simulation is running)

1. **Send Data Burst**: Triggers a 100ms data transmission
   - IDLE → CONNECTED: Establishes RRC connection
   - INACTIVE → CONNECTED: Fast resume (no full connection setup)

2. **Simulate Paging**: Network-initiated paging from IDLE state
   - IDLE → CONNECTED

> **Note**: Event buttons are disabled when simulation is stopped. Traffic profile selection is disabled while simulation is running to ensure consistent behavior.

### State Indicators

- **Red Lamp**: RRC_IDLE (low power, no connection)
- **Green Lamp**: RRC_CONNECTED (active, high power)
- **Yellow Lamp**: RRC_INACTIVE (intermediate power, context retained)

### Metrics Display

- **Simulation Time**: Total elapsed simulation time
- **Total Energy**: Cumulative power consumption (arbitrary units)
- **Transitions**: Number of state changes

## File Structure

```
5g/
├── main.py                          # Application entry point
├── rrc_simulation_engine.py         # Core state machine logic
├── rrc_gui.py                       # GUI implementation
├── test_rrc_engine.py               # Unit tests (10 tests)
├── comparative_study.py             # Comprehensive timer analysis
├── comparative_study_data.csv       # Study results (250 tests)
├── COMPARATIVE_STUDY_RESULTS.md     # Study summary report
├── results/                         # Visualization plots
│   ├── 1_energy_by_config.png
│   ├── 2_state_distribution.png
│   ├── 3_transition_count.png
│   ├── 4_energy_by_category.png
│   ├── 5_efficiency_score.png
│   ├── 6_energy_distribution_boxplot.png
│   └── 7_heatmap_category_config.png
├── requirements.txt                 # Python dependencies
├── README.md                        # This file
└── QUICKSTART.md                    # Step-by-step usage guide
```

## Architecture

### Threading Model

- **Simulation Thread**: Runs at 1kHz (1ms time step) in background
- **GUI Thread**: Main thread running Tkinter event loop at 20Hz refresh
- **Communication**: Thread-safe queues for command/state exchange

### Power Consumption Model

| State       | Power (units/tick) |
|-------------|-------------------:|
| IDLE        | 0                  |
| CONNECTED   | 100                |
| INACTIVE    | 10                 |

### Adaptive Timer Thresholds

**Profile-dependent thresholds for both transitions:**

| Profile   | CONNECTED→INACTIVE | INACTIVE→IDLE | Use Case |
|-----------|--------------------|---------------|----------|
| IoT Burst | 200 ms             | 5 s           | Sensors, M2M, periodic updates |
| Streaming | 10 s               | 20 s          | Video, audio, downloads |

**Key insight:** Both timers adapt based on traffic profile for optimal energy efficiency.

## 3GPP Compliance

This simulation implements state transitions based on:
- **3GPP TS 38.331**: Radio Resource Control (RRC) Protocol Specification
- Inactivity timer behavior matches T320 timer specifications
- INACTIVE→IDLE transition uses RNA (RAN Notification Area) update timer equivalent

## Technical Details

### Discrete-Time Simulation

- Fixed time step: 1 ms (matching MATLAB Simulink FixedStep solver)
- State machine updates: Every tick
- GUI refresh rate: 20 Hz (50ms interval)

### History Buffer

- Maintains last 100,000 ticks (100 seconds) of history
- Automatic ring buffer management to prevent memory overflow
- Provides data for real-time plotting

## Example Scenarios

### IoT Device Behavior

```python
# In IoT mode (200ms threshold):
# 1. Device wakes up and sends data → IDLE to CONNECTED
# 2. After 100ms burst completes → wait 200ms
# 3. Transition to INACTIVE (fast resume ready)
# 4. New data arrives → INACTIVE to CONNECTED (fast)
# 5. After 30s of inactivity → INACTIVE to IDLE
```

### Streaming Session

```python
# In Streaming mode (10s threshold):
# 1. Start video stream → IDLE to CONNECTED
# 2. Continuous data activity keeps state in CONNECTED
# 3. User pauses video → after 10s → CONNECTED to INACTIVE
# 4. Resume playback → INACTIVE to CONNECTED (fast resume)
```

## Comparative Study

A comprehensive analysis tool compares **static vs. adaptive timer configurations** across 50 diverse traffic scenarios.

### Running the Study

```bash
python3 comparative_study.py
```

**What it does:**
- Runs 250 tests (50 scenarios × 5 configurations)
- Tests IoT, Streaming, Web, Mixed, and Edge case traffic
- Generates 7 individual visualization plots
- Exports detailed CSV data

**Results saved to:**
- `results/` folder - 7 individual PNG plots
- `comparative_study_data.csv` - Raw test data
- `COMPARATIVE_STUDY_RESULTS.md` - Summary report

### Key Findings

**Adaptive_IoT configuration achieved 36-76% energy savings vs. static timers!**

| Configuration | Avg Energy | Best For |
|---------------|------------|----------|
| Adaptive_IoT | 1,139,971 | **Energy efficiency** ⭐ |
| Static_1s | 1,789,175 | Moderate power/transitions |
| Static_5s | 3,044,195 | Balanced approach |
| Static_10s | 3,575,310 | Connection stability |
| Adaptive_Streaming | 3,575,310 | Long sessions |

See `COMPARATIVE_STUDY_RESULTS.md` for detailed analysis.

## Performance

- Simulation runs at real-time speed (1ms simulation = ~1ms wall clock)
- Capable of >1000 ticks/second on modern hardware
- Minimal CPU usage (~5-10% on single core)

## Troubleshooting

### GUI not appearing

Ensure tkinter is installed:
```bash
# Ubuntu/Debian
sudo apt-get install python3-tk

# macOS (usually pre-installed)
brew install python-tk
```

### Slow simulation

- Check system load
- Reduce plot history window (modify `last_n_seconds` in main.py)

## Extensions

### Add Custom States

Modify `RRCState` enum in `rrc_simulation_engine.py` and update transition logic in `_update_state_machine()`.

### Network Latency Simulation

Add delay queues for paging and data requests to simulate realistic network conditions.

### Multiple UEs

Extend to simulate multiple User Equipment devices with independent state machines.

## License

Educational/Research Use

## Author

Python port of MATLAB Simulink model for 5G NR RRC state transitions.

## References

1. 3GPP TS 38.331 - NR Radio Resource Control (RRC) protocol specification
2. 3GPP TS 38.300 - NR Overall description
3. MATLAB Simulink Stateflow documentation
