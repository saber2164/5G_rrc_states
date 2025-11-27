# 5G RRC Simulation - Quick Start Guide

## Launch the Application

```bash
python3 main.py
```

## Using the GUI

### Step-by-Step Workflow

#### 1. Select Traffic Profile
**Before starting**, choose your traffic pattern:

- **🎬 Streaming (10s inactivity)**
  - Best for: Video streaming, audio calls, file downloads
  - UE stays CONNECTED longer before sleeping
  - Lower transition overhead, better for sustained throughput

- ** IoT Burst (200ms inactivity)**
  - Best for: Sensors, M2M devices, periodic updates
  - UE quickly enters INACTIVE state to save energy
  - Fast resume capability for bursty traffic

#### 2. Start the Simulation
Click the large **green " START SIMULATION"** button.

The button will:
- Turn red and show " STOP SIMULATION"
- Enable the event trigger buttons
- Begin the simulation engine (time starts incrementing)

#### 3. Trigger Events
Now you can interact with the UE:

** Send Data Burst** (100ms):
- If in IDLE: Establishes full RRC connection
- If in INACTIVE: Fast resume to CONNECTED (lower latency)
- Keeps UE in CONNECTED for burst duration + inactivity timer

** Simulate Paging**:
- Pages UE from IDLE to CONNECTED
- Simulates network-initiated wakeup

#### 4. Stop/Pause
Click **" STOP SIMULATION"** to:
- Pause the simulation engine
- Change traffic profile
- Reset if needed

## Understanding the Visualization

### State Lamps (Left Side)
- **RED IDLE**: Low power, no connection (0 units/ms - fully asleep)
- **GREEN CONNECTED**: Active data transfer (100 units/ms)
- **YELLOW INACTIVE**: Context retained, fast resume (10 units/ms)

### Real-Time Charts (Right Side)
- **Top chart**: RRC State over time (0=IDLE, 1=CONNECTED, 2=INACTIVE)
- **Bottom chart**: Data activity signal (1=active, 0=idle)
- Auto-scrolls to show last 10 seconds

### Metrics Panel
- **Simulation Time**: Total elapsed time (in seconds)
- **Total Energy**: Cumulative power consumption
- **Transitions**: Number of state changes

## Example Scenarios

### IoT Temperature Sensor
1. Select **"IoT Burst (200ms)"**
2. Click **"START"**
3. Click **"Send Data Burst"** once
4. Wait and observe: IDLE → CONNECTED → INACTIVE (after 200ms) → IDLE (after 5s)

**Expected behavior**: 
- Starts in IDLE (red lamp)
- Data burst: Transitions to CONNECTED (green lamp)
- After 200ms of inactivity: Goes to INACTIVE (yellow lamp)
- After 5s in INACTIVE with no data: Returns to IDLE (red lamp)
- Energy efficient cycle for periodic sensor readings!

### Video Streaming Session
1. Select **"Streaming (10s)"**
2. Click **"START"**
3. Click **"Send Data Burst"** multiple times (simulating continuous frames)
4. Stop clicking for >10s

**Expected behavior**:
- Stays in CONNECTED during active streaming
- Remains CONNECTED for 10s after last burst
- Eventually transitions to INACTIVE if no more data

## Tips

- **Energy comparison**: Run same scenario with both profiles to see energy difference
- **Fast resume**: Notice how INACTIVE→CONNECTED is instant (no re-establishment delay)
- **Traffic profile impact**: IoT mode transitions 50x faster than Streaming (200ms vs 10s)
- **State persistence**: Data bursts reset the inactivity timer

## Keyboard Shortcuts
- Close window: `Alt+F4` or click X
- No other shortcuts (use mouse for buttons)

## Troubleshooting

**Event buttons are grayed out**:
→ Click "START SIMULATION" first

**Can't change traffic profile**:
→ Click "STOP SIMULATION" first

**Charts not updating**:
→ Ensure simulation is started (green button should be red)
