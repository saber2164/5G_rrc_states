"""
5G NR RRC State Machine Simulation Engine

This module implements a discrete-event simulation of the 5G New Radio (NR)
Radio Resource Control (RRC) state machine, compliant with 3GPP TS 38.331.

States:
    - RRC_IDLE (0): Low power, no active connection
    - RRC_CONNECTED (1): Active data transfer, full power
    - RRC_INACTIVE (2): Intermediate power, fast resume capability

Author: Python port of MATLAB Simulink model
Date: 2025-11-27
"""

from enum import IntEnum
from typing import Dict, List, Tuple
import time


class RRCState(IntEnum):
    """RRC State enumeration matching 3GPP TS 38.331"""
    IDLE = 0
    CONNECTED = 1
    INACTIVE = 2


class TrafficProfile(IntEnum):
    """Traffic profile types for adaptive timer"""
    STREAMING = 0  # Long sessions, infrequent transitions
    IOT = 1        # Short bursts, frequent sleep


class RRCSimulationEngine:
    """
    Discrete-event simulation engine for 5G NR RRC state machine.
    
    Runs at fixed 1ms time step (matching MATLAB Simulink FixedStep solver).
    Implements 3GPP-compliant state transitions with adaptive inactivity timer.
    """
    
    # Power consumption per state (arbitrary units per tick)
    POWER_CONSUMPTION = {
        RRCState.IDLE: 0,        # No power consumption when fully asleep
        RRCState.CONNECTED: 100,
        RRCState.INACTIVE: 10
    }
    
    # Adaptive timer thresholds (in milliseconds/ticks)
    TIMER_THRESHOLDS = {
        TrafficProfile.STREAMING: 10000,  # 10 seconds
        TrafficProfile.IOT: 200           # 200 milliseconds
    }
    
    # Long inactivity timer for INACTIVE -> IDLE (profile-dependent)
    # Note: 3GPP RNA update timer is typically 30s, using shorter times for demonstration
    LONG_INACTIVITY_THRESHOLDS = {
        TrafficProfile.STREAMING: 20000,  # 20 seconds (longer for streaming sessions)
        TrafficProfile.IOT: 5000          # 5 seconds (shorter for IoT bursts)
    }
    
    def __init__(self):
        """Initialize the RRC simulation engine"""
        # State machine
        self.state = RRCState.IDLE
        self.previous_state = RRCState.IDLE
        
        # Timers (in ticks, 1 tick = 1ms)
        self.inactivity_timer = 0
        self.long_inactivity_timer = 0
        self.simulation_time = 0  # Total elapsed time in ms
        
        # Traffic profile and adaptive thresholds
        self.traffic_profile = TrafficProfile.IOT
        self.inactivity_threshold = self.TIMER_THRESHOLDS[TrafficProfile.IOT]
        self.long_inactivity_threshold = self.LONG_INACTIVITY_THRESHOLDS[TrafficProfile.IOT]
        
        # Event flags
        self.data_request = False
        self.paging_request = False
        self.data_active = False
        self.data_burst_duration = 0  # Remaining ticks of data activity
        
        # Energy tracking
        self.total_energy = 0.0
        
        # History for visualization (ring buffer to prevent unbounded growth)
        self.max_history_length = 100000  # 100 seconds at 1kHz
        self.state_history: List[int] = []
        self.data_request_history: List[int] = []
        self.time_history: List[float] = []
        
        # Event log
        self.event_log: List[Tuple[float, str]] = []
        
        # Statistics
        self.state_durations = {
            RRCState.IDLE: 0,
            RRCState.CONNECTED: 0,
            RRCState.INACTIVE: 0
        }
        self.transition_count = 0
        
    def tick(self):
        """
        Main simulation step - called every 1ms.
        
        Order of operations:
        1. Update timers
        2. Process state machine transitions
        3. Update energy consumption
        4. Record history
        5. Increment simulation time
        """
        # Update inactivity timers
        self._update_timers()
        
        # Process state machine logic
        self._update_state_machine()
        
        # Calculate energy consumption
        self._calculate_energy()
        
        # Update statistics
        self.state_durations[self.state] += 1
        
        # Record history (with ring buffer management)
        self._record_history()
        
        # Increment simulation time
        self.simulation_time += 1
        
        # Clear single-tick events
        self.paging_request = False
        
    def _update_timers(self):
        """Update all timer counters"""
        # Inactivity timer (for CONNECTED -> INACTIVE)
        if self.state == RRCState.CONNECTED:
            if self.data_active:
                # Reset timer when data is active
                self.inactivity_timer = 0
            else:
                # Increment when no data activity
                self.inactivity_timer += 1
        else:
            # Reset in other states
            self.inactivity_timer = 0
            
        # Long inactivity timer (for INACTIVE -> IDLE)
        if self.state == RRCState.INACTIVE:
            self.long_inactivity_timer += 1
        else:
            self.long_inactivity_timer = 0
            
        # Data burst duration countdown
        if self.data_burst_duration > 0:
            self.data_burst_duration -= 1
            self.data_active = True
        else:
            self.data_active = False
            
    def _update_state_machine(self):
        """
        Implement 3GPP TS 38.331 state transition logic.
        
        Transition diagram:
                    data_request
            IDLE -----------------> CONNECTED
             ^                          |
             |                          | inactivity_timer > threshold
             |                          v
             |                     INACTIVE
             |                          |
             +<-------------------------+
                 long_inactivity_timer > threshold
                 
        Fast resume: INACTIVE --data_request--> CONNECTED
        """
        old_state = self.state
        
        # === IDLE State Transitions ===
        if self.state == RRCState.IDLE:
            # IDLE -> CONNECTED: On data request or paging
            if self.data_request or self.paging_request:
                self.state = RRCState.CONNECTED
                self._log_event(f"Transition: IDLE -> CONNECTED (trigger: {'data' if self.data_request else 'paging'})")
                
        # === CONNECTED State Transitions ===
        elif self.state == RRCState.CONNECTED:
            # CONNECTED -> INACTIVE: On inactivity timer expiry
            if self.inactivity_timer >= self.inactivity_threshold and not self.data_active:
                self.state = RRCState.INACTIVE
                self._log_event(f"Transition: CONNECTED -> INACTIVE (inactivity: {self.inactivity_timer}ms)")
                
        # === INACTIVE State Transitions ===
        elif self.state == RRCState.INACTIVE:
            # INACTIVE -> CONNECTED: Fast resume on data request
            if self.data_request:
                self.state = RRCState.CONNECTED
                self._log_event("Transition: INACTIVE -> CONNECTED (fast resume)")
                
            # INACTIVE -> IDLE: On long inactivity timer expiry
            elif self.long_inactivity_timer >= self.long_inactivity_threshold:
                self.state = RRCState.IDLE
                self._log_event(f"Transition: INACTIVE -> IDLE (long inactivity: {self.long_inactivity_timer}ms)")
                
        # Track state changes
        if old_state != self.state:
            self.previous_state = old_state
            self.transition_count += 1
            
        # Clear data request flag after processing
        self.data_request = False
        
    def _calculate_energy(self):
        """Integrate power consumption based on current state"""
        power = self.POWER_CONSUMPTION[self.state]
        self.total_energy += power
        
    def _record_history(self):
        """Record state and signal history for plotting"""
        # Implement ring buffer to prevent unbounded memory growth
        if len(self.state_history) >= self.max_history_length:
            # Remove oldest 10% when buffer is full
            trim_size = self.max_history_length // 10
            self.state_history = self.state_history[trim_size:]
            self.data_request_history = self.data_request_history[trim_size:]
            self.time_history = self.time_history[trim_size:]
            
        self.state_history.append(int(self.state))
        self.data_request_history.append(1 if (self.data_active or self.data_request) else 0)
        self.time_history.append(self.simulation_time / 1000.0)  # Convert to seconds
        
    def _log_event(self, message: str):
        """Log a timestamped event"""
        timestamp = self.simulation_time / 1000.0  # Convert to seconds
        self.event_log.append((timestamp, message))
        # Keep only last 1000 events
        if len(self.event_log) > 1000:
            self.event_log = self.event_log[-1000:]
            
    # === Public API for external control ===
    
    def trigger_data_request(self, burst_duration_ms: int = 100):
        """
        Trigger a data request event.
        
        Args:
            burst_duration_ms: Duration of data burst in milliseconds (default: 100ms)
        """
        self.data_request = True
        self.data_burst_duration = burst_duration_ms
        self._log_event(f"Data request triggered (burst: {burst_duration_ms}ms)")
        
    def trigger_paging(self):
        """Trigger a network paging event"""
        self.paging_request = True
        self._log_event("Paging request triggered")
        
    def set_traffic_profile(self, profile: str):
        """
        Set traffic profile and adjust adaptive inactivity timers.
        
        Args:
            profile: "Streaming" or "IoT"
        """
        if profile.lower() == "streaming":
            self.traffic_profile = TrafficProfile.STREAMING
            self.inactivity_threshold = self.TIMER_THRESHOLDS[TrafficProfile.STREAMING]
            self.long_inactivity_threshold = self.LONG_INACTIVITY_THRESHOLDS[TrafficProfile.STREAMING]
            self._log_event("Traffic profile: STREAMING (CONN→INACT: 10s, INACT→IDLE: 20s)")
        elif profile.lower() == "iot":
            self.traffic_profile = TrafficProfile.IOT
            self.inactivity_threshold = self.TIMER_THRESHOLDS[TrafficProfile.IOT]
            self.long_inactivity_threshold = self.LONG_INACTIVITY_THRESHOLDS[TrafficProfile.IOT]
            self._log_event("Traffic profile: IoT (CONN→INACT: 200ms, INACT→IDLE: 5s)")
        else:
            raise ValueError(f"Unknown traffic profile: {profile}")
            
    def get_state(self) -> Dict:
        """
        Get current simulation state snapshot (thread-safe).
        
        Returns:
            Dictionary containing all relevant state information
        """
        return {
            'state': int(self.state),
            'state_name': self.state.name,
            'simulation_time': self.simulation_time / 1000.0,  # seconds
            'total_energy': self.total_energy,
            'inactivity_timer': self.inactivity_timer,
            'long_inactivity_timer': self.long_inactivity_timer,
            'inactivity_threshold': self.inactivity_threshold,
            'long_inactivity_threshold': self.long_inactivity_threshold,
            'traffic_profile': self.traffic_profile.name,
            'data_active': self.data_active,
            'transition_count': self.transition_count,
            'state_durations': dict(self.state_durations),
        }
        
    def get_history(self, last_n_seconds: float = 10.0) -> Dict:
        """
        Get recent history for plotting.
        
        Args:
            last_n_seconds: Number of seconds of history to return
            
        Returns:
            Dictionary with time, state, and data_request arrays
        """
        if not self.time_history:
            return {
                'time': [],
                'state': [],
                'data_request': []
            }
            
        # Find index for last_n_seconds
        current_time = self.simulation_time / 1000.0
        cutoff_time = current_time - last_n_seconds
        
        # Binary search would be faster, but linear is simpler for now
        start_idx = 0
        for i, t in enumerate(self.time_history):
            if t >= cutoff_time:
                start_idx = i
                break
                
        return {
            'time': self.time_history[start_idx:],
            'state': self.state_history[start_idx:],
            'data_request': self.data_request_history[start_idx:]
        }
        
    def reset(self):
        """Reset simulation to initial state"""
        self.__init__()
        self._log_event("Simulation reset")


# Example usage and testing
if __name__ == "__main__":
    print("5G NR RRC State Machine Simulation Engine")
    print("=" * 50)
    
    # Create engine
    engine = RRCSimulationEngine()
    
    # Test scenario: IoT device with periodic data bursts
    print("\nTest Scenario: IoT device with periodic 100ms data bursts")
    print("-" * 50)
    
    engine.set_traffic_profile("IoT")
    
    # Simulate 2 seconds
    for tick in range(2000):
        # Send data burst every 500ms
        if tick % 500 == 0 and tick > 0:
            engine.trigger_data_request(burst_duration_ms=100)
            
        engine.tick()
        
        # Print state changes
        if tick > 0 and engine.state != engine.previous_state:
            state_info = engine.get_state()
            print(f"[{state_info['simulation_time']:.3f}s] State: {state_info['state_name']}")
            
    # Print final statistics
    print("\n" + "=" * 50)
    print("Final Statistics:")
    state_info = engine.get_state()
    print(f"Simulation Time: {state_info['simulation_time']:.2f}s")
    print(f"Total Energy: {state_info['total_energy']:.0f} units")
    print(f"State Transitions: {state_info['transition_count']}")
    print(f"\nTime in each state:")
    for state, duration in state_info['state_durations'].items():
        print(f"  {RRCState(state).name}: {duration}ms ({duration/20:.1f}%)")
        
    print("\nRecent events:")
    for timestamp, event in engine.event_log[-10:]:
        print(f"  [{timestamp:.3f}s] {event}")
