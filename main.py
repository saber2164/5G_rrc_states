"""
5G NR RRC State Machine - Main Application

Entry point for the 5G RRC simulation with threading integration.
Orchestrates the simulation engine and GUI in separate threads.

Usage:
    python3 main.py

Author: Python port of MATLAB Simulink + App Designer
Date: 2025-11-27
"""

import tkinter as tk
import threading
import queue
import time
import sys
from rrc_simulation_engine import RRCSimulationEngine
from rrc_gui import RRCSimulationGUI


class RRCApplication:
    """
    Main application class that orchestrates the simulation engine and GUI.
    
    Architecture:
    - Simulation runs in background thread at ~1kHz (1ms ticks)
    - GUI runs in main thread with Tk event loop
    - Thread-safe communication via queues
    """
    
    def __init__(self):
        """Initialize application components"""
        # Create simulation engine
        self.engine = RRCSimulationEngine()
        
        # Create thread-safe queues
        self.command_queue = queue.Queue()  # GUI → Engine commands
        self.state_queue = queue.Queue()    # Engine → GUI state updates
        
        # Threading control
        self.running = True
        self.paused = True  # Start paused, wait for user to click Start
        self.sim_thread = None
        
        # Statistics
        self.tick_count = 0
        self.start_time = time.time()
        
    def run_simulation_thread(self):
        """
        Background thread running the simulation engine.
        
        Runs at approximately 1kHz (1ms per tick).
        Processes commands from GUI and pushes state updates.
        """
        print("Simulation thread started")
        
        last_state_push = 0
        STATE_PUSH_INTERVAL = 50  # Push state every 50 ticks (20Hz for GUI)
        
        while self.running:
            loop_start = time.time()
            
            # Process all pending commands from GUI
            while not self.command_queue.empty():
                try:
                    cmd = self.command_queue.get_nowait()
                    self._process_command(cmd)
                except queue.Empty:
                    break
            
            # Only tick if not paused
            if not self.paused:
                # Tick simulation
                self.engine.tick()
                self.tick_count += 1
            else:
                # When paused, still push state but don't tick
                pass
            
            # Push state to GUI (throttled to reduce overhead)
            if self.tick_count - last_state_push >= STATE_PUSH_INTERVAL:
                state_data = self.engine.get_state()
                history = self.engine.get_history(last_n_seconds=10.0)
                state_data['history'] = history
                
                # Non-blocking put (drop if queue is full to prevent backlog)
                try:
                    self.state_queue.put_nowait(state_data)
                    last_state_push = self.tick_count
                except queue.Full:
                    pass
                    
            # Maintain 1kHz tick rate (1ms per loop)
            elapsed = time.time() - loop_start
            sleep_time = 0.001 - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
            elif elapsed > 0.002:  # Warn if loop is too slow
                print(f"Warning: Simulation loop slow ({elapsed*1000:.1f}ms)")
                
        print("Simulation thread stopped")
        
    def _process_command(self, cmd: dict):
        """
        Process command from GUI.
        
        Args:
            cmd: Command dictionary with 'command' key and optional parameters
        """
        command = cmd.get('command')
        
        if command == 'start':
            print("Simulation STARTED")
            self.paused = False
            
        elif command == 'stop':
            print("Simulation PAUSED")
            self.paused = True
            
        elif command == 'data_request':
            duration = cmd.get('duration', 100)
            self.engine.trigger_data_request(burst_duration_ms=duration)
            
        elif command == 'paging':
            self.engine.trigger_paging()
            
        elif command == 'set_profile':
            profile = cmd.get('profile', 'IoT')
            self.engine.set_traffic_profile(profile)
            print(f"Traffic profile changed to: {profile}")
            
        elif command == 'reset':
            self.engine.reset()
            self.tick_count = 0
            
        else:
            print(f"Unknown command: {command}")
            
    def start(self):
        """Start the application"""
        print("="*60)
        print("5G NR RRC State Machine Simulation")
        print("="*60)
        print("Initializing...")
        
        # Create GUI window
        root = tk.Tk()
        
        # Handle window close
        def on_closing():
            print("\nShutting down...")
            self.running = False
            if self.sim_thread and self.sim_thread.is_alive():
                self.sim_thread.join(timeout=2.0)
            root.destroy()
            
        root.protocol("WM_DELETE_WINDOW", on_closing)
        
        # Create GUI
        gui = RRCSimulationGUI(root, self.command_queue, self.state_queue)
        
        # Start simulation thread
        self.sim_thread = threading.Thread(
            target=self.run_simulation_thread,
            daemon=True,
            name="SimulationThread"
        )
        self.sim_thread.start()
        
        print("Application started successfully!")
        print("\nHow to use:")
        print("  1. Select traffic profile (Streaming or IoT Burst)")
        print("  2. Click 'START SIMULATION' button")
        print("  3. Use 'Send Data Burst' or 'Simulate Paging' to trigger events")
        print("  4. Click 'STOP SIMULATION' to pause and change profile")
        print("\nClose window to exit.\n")
        
        # Run GUI main loop (blocks until window closed)
        try:
            root.mainloop()
        except KeyboardInterrupt:
            print("\nInterrupted by user")
            self.running = False
            
        # Cleanup
        if self.sim_thread and self.sim_thread.is_alive():
            self.running = False
            self.sim_thread.join(timeout=2.0)
            
        # Print final statistics
        elapsed_time = time.time() - self.start_time
        print("\n" + "="*60)
        print("Simulation Statistics:")
        print(f"  Total runtime: {elapsed_time:.2f}s")
        print(f"  Total ticks: {self.tick_count:,}")
        print(f"  Average tick rate: {self.tick_count/elapsed_time:.1f} Hz")
        
        final_state = self.engine.get_state()
        print(f"\n  Final state: {final_state['state_name']}")
        print(f"  Total energy: {final_state['total_energy']:,.0f} units")
        print(f"  State transitions: {final_state['transition_count']}")
        print("\nTime in each state:")
        for state_val, duration in final_state['state_durations'].items():
            from rrc_simulation_engine import RRCState
            state_name = RRCState(state_val).name
            percentage = (duration / self.tick_count * 100) if self.tick_count > 0 else 0
            print(f"  {state_name:12s}: {duration:6d}ms ({percentage:5.1f}%)")
        print("="*60)


def main():
    """Main entry point"""
    try:
        app = RRCApplication()
        app.start()
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
        
    return 0


if __name__ == "__main__":
    sys.exit(main())
