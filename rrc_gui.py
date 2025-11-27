"""
5G NR RRC State Machine - Graphical User Interface

Real-time GUI for controlling and visualizing the RRC state machine simulation.
Built with tkinter and matplotlib for cross-platform compatibility.

Author: Python port of MATLAB App Designer UI
Date: 2025-11-27
"""

import tkinter as tk
from tkinter import ttk, font
import matplotlib
matplotlib.use('TkAgg')  # Use Tk backend
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import queue
from typing import Optional
from rrc_simulation_engine import RRCState


class RRCSimulationGUI:
    """
    Real-time GUI for 5G NR RRC State Machine Simulation.
    
    Features:
    - Control buttons for triggering events
    - Traffic profile selector
    - Visual state indicators (colored lamps)
    - Real-time strip chart of state and data signals
    - Live metrics display
    """
    
    # Color scheme for state indicators
    STATE_COLORS = {
        RRCState.IDLE: '#FF4444',        # Red
        RRCState.CONNECTED: '#44FF44',   # Green
        RRCState.INACTIVE: '#FFAA44'     # Yellow/Orange
    }
    
    INACTIVE_COLOR = '#333333'  # Dark gray for inactive lamps
    
    def __init__(self, master, command_queue: queue.Queue, state_queue: queue.Queue):
        """
        Initialize the GUI.
        
        Args:
            master: Tkinter root window
            command_queue: Queue for sending commands to simulation thread
            state_queue: Queue for receiving state updates from simulation
        """
        self.master = master
        self.command_queue = command_queue
        self.state_queue = state_queue
        
        # Current state (updated from simulation thread)
        self.current_state = RRCState.IDLE
        self.current_state_data = {}
        
        # Configure main window
        self.master.title("5G NR RRC State Machine Simulation")
        self.master.geometry("1000x700")
        self.master.configure(bg='#1E1E1E')
        
        # Create GUI components
        self._create_widgets()
        
        # Start update loop
        self._update_loop()
        
    def _create_widgets(self):
        """Create all GUI widgets"""
        # Title
        title_font = font.Font(family='Arial', size=18, weight='bold')
        title_label = tk.Label(
            self.master,
            text="5G NR RRC State Machine Simulator",
            font=title_font,
            bg='#1E1E1E',
            fg='#FFFFFF'
        )
        title_label.pack(pady=10)
        
        # Main container
        main_frame = tk.Frame(self.master, bg='#1E1E1E')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Left panel: Controls and indicators
        left_panel = tk.Frame(main_frame, bg='#2D2D2D', relief=tk.RAISED, borderwidth=2)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 5))
        
        self._create_controls(left_panel)
        self._create_state_indicators(left_panel)
        self._create_metrics(left_panel)
        
        # Right panel: Charts
        right_panel = tk.Frame(main_frame, bg='#2D2D2D', relief=tk.RAISED, borderwidth=2)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        self._create_charts(right_panel)
        
    def _create_controls(self, parent):
        """Create control buttons and selectors"""
        control_frame = tk.LabelFrame(
            parent,
            text="Controls",
            bg='#2D2D2D',
            fg='#FFFFFF',
            font=('Arial', 12, 'bold'),
            padx=10,
            pady=10
        )
        control_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Traffic profile selector (moved to top - select before starting)
        tk.Label(
            control_frame,
            text="1. Select Traffic Profile:",
            bg='#2D2D2D',
            fg='#FFAA00',
            font=('Arial', 10, 'bold')
        ).pack(pady=(5, 5))
        
        self.traffic_profile = tk.StringVar(value="IoT")
        
        profile_frame = tk.Frame(control_frame, bg='#2D2D2D')
        profile_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.streaming_radio = tk.Radiobutton(
            profile_frame,
            text="Streaming (10s inactivity)",
            variable=self.traffic_profile,
            value="Streaming",
            command=self._on_profile_change,
            bg='#2D2D2D',
            fg='#FFFFFF',
            selectcolor='#1E1E1E',
            activebackground='#2D2D2D',
            activeforeground='#FFFFFF',
            font=('Arial', 10)
        )
        self.streaming_radio.pack(anchor=tk.W, padx=10)
        
        self.iot_radio = tk.Radiobutton(
            profile_frame,
            text="IoT Burst (200ms inactivity)",
            variable=self.traffic_profile,
            value="IoT",
            command=self._on_profile_change,
            bg='#2D2D2D',
            fg='#FFFFFF',
            selectcolor='#1E1E1E',
            activebackground='#2D2D2D',
            activeforeground='#FFFFFF',
            font=('Arial', 10)
        )
        self.iot_radio.pack(anchor=tk.W, padx=10)
        
        # Separator
        tk.Frame(control_frame, height=2, bg='#555555').pack(fill=tk.X, pady=10)
        
        # Start/Stop button
        tk.Label(
            control_frame,
            text="2. Start Simulation:",
            bg='#2D2D2D',
            fg='#FFAA00',
            font=('Arial', 10, 'bold')
        ).pack(pady=(0, 5))
        
        self.start_button = tk.Button(
            control_frame,
            text="▶ START SIMULATION",
            command=self._on_start_stop,
            bg='#00AA00',
            fg='white',
            font=('Arial', 12, 'bold'),
            relief=tk.RAISED,
            borderwidth=4,
            padx=20,
            pady=12
        )
        self.start_button.pack(fill=tk.X, pady=5)
        
        self.simulation_running = False
        
        # Separator
        tk.Frame(control_frame, height=2, bg='#555555').pack(fill=tk.X, pady=10)
        
        # Event triggers (disabled initially)
        tk.Label(
            control_frame,
            text="3. Trigger Events:",
            bg='#2D2D2D',
            fg='#FFAA00',
            font=('Arial', 10, 'bold')
        ).pack(pady=(0, 5))
        
        # Data burst button
        self.data_button = tk.Button(
            control_frame,
            text="📡 Send Data Burst",
            command=self._on_data_button,
            bg='#4CAF50',
            fg='white',
            font=('Arial', 11, 'bold'),
            relief=tk.RAISED,
            borderwidth=3,
            padx=15,
            pady=10,
            state=tk.DISABLED
        )
        self.data_button.pack(fill=tk.X, pady=5)
        
        # Paging button
        self.paging_button = tk.Button(
            control_frame,
            text="📞 Simulate Paging",
            command=self._on_paging_button,
            bg='#2196F3',
            fg='white',
            font=('Arial', 11, 'bold'),
            relief=tk.RAISED,
            borderwidth=3,
            padx=15,
            pady=10,
            state=tk.DISABLED
        )
        self.paging_button.pack(fill=tk.X, pady=5)
        
    def _create_state_indicators(self, parent):
        """Create visual state indicator lamps"""
        indicator_frame = tk.LabelFrame(
            parent,
            text="RRC State",
            bg='#2D2D2D',
            fg='#FFFFFF',
            font=('Arial', 12, 'bold'),
            padx=10,
            pady=10
        )
        indicator_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Create canvas for circular lamps
        self.lamp_canvas = tk.Canvas(
            indicator_frame,
            bg='#1E1E1E',
            height=250,
            highlightthickness=0
        )
        self.lamp_canvas.pack(fill=tk.BOTH, expand=True)
        
        # Draw lamps for each state
        y_positions = [40, 125, 210]
        self.lamp_ids = {}
        
        for i, (state, state_name) in enumerate([
            (RRCState.IDLE, "IDLE"),
            (RRCState.CONNECTED, "CONNECTED"),
            (RRCState.INACTIVE, "INACTIVE")
        ]):
            y = y_positions[i]
            
            # Draw circle
            lamp_id = self.lamp_canvas.create_oval(
                15, y - 25, 65, y + 25,
                fill=self.INACTIVE_COLOR,
                outline=self.STATE_COLORS[state],
                width=2
            )
            self.lamp_ids[state] = lamp_id
            
            # Label
            self.lamp_canvas.create_text(
                100, y,
                text=state_name,
                fill='#FFFFFF',
                font=('Arial', 12, 'bold'),
                anchor=tk.W
            )
            
    def _create_metrics(self, parent):
        """Create metrics display panel"""
        metrics_frame = tk.LabelFrame(
            parent,
            text="Metrics",
            bg='#2D2D2D',
            fg='#FFFFFF',
            font=('Arial', 12, 'bold'),
            padx=10,
            pady=10
        )
        metrics_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Simulation time
        tk.Label(
            metrics_frame,
            text="Simulation Time:",
            bg='#2D2D2D',
            fg='#AAAAAA',
            font=('Arial', 9)
        ).pack(anchor=tk.W, pady=(5, 0))
        
        self.time_label = tk.Label(
            metrics_frame,
            text="0.00 s",
            bg='#2D2D2D',
            fg='#00FF00',
            font=('Courier', 16, 'bold')
        )
        self.time_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Total energy
        tk.Label(
            metrics_frame,
            text="Total Energy:",
            bg='#2D2D2D',
            fg='#AAAAAA',
            font=('Arial', 9)
        ).pack(anchor=tk.W, pady=(5, 0))
        
        self.energy_label = tk.Label(
            metrics_frame,
            text="0 units",
            bg='#2D2D2D',
            fg='#FFAA00',
            font=('Courier', 16, 'bold')
        )
        self.energy_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Transitions
        tk.Label(
            metrics_frame,
            text="Transitions:",
            bg='#2D2D2D',
            fg='#AAAAAA',
            font=('Arial', 9)
        ).pack(anchor=tk.W, pady=(5, 0))
        
        self.transition_label = tk.Label(
            metrics_frame,
            text="0",
            bg='#2D2D2D',
            fg='#00AAFF',
            font=('Courier', 16, 'bold')
        )
        self.transition_label.pack(anchor=tk.W, pady=(0, 10))
        
    def _create_charts(self, parent):
        """Create real-time strip charts using matplotlib"""
        chart_frame = tk.Frame(parent, bg='#2D2D2D')
        chart_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create matplotlib figure with dark theme
        plt.style.use('dark_background')
        self.fig = Figure(figsize=(8, 6), facecolor='#2D2D2D')
        
        # State subplot
        self.ax_state = self.fig.add_subplot(2, 1, 1)
        self.ax_state.set_ylabel('RRC State', color='white', fontsize=10)
        self.ax_state.set_ylim(-0.5, 2.5)
        self.ax_state.set_yticks([0, 1, 2])
        self.ax_state.set_yticklabels(['IDLE', 'CONN', 'INACT'], fontsize=8)
        self.ax_state.grid(True, alpha=0.3)
        self.ax_state.set_facecolor('#1E1E1E')
        
        # Data request subplot
        self.ax_data = self.fig.add_subplot(2, 1, 2)
        self.ax_data.set_ylabel('Data Active', color='white', fontsize=10)
        self.ax_data.set_xlabel('Time (s)', color='white', fontsize=10)
        self.ax_data.set_ylim(-0.1, 1.1)
        self.ax_data.set_yticks([0, 1])
        self.ax_data.grid(True, alpha=0.3)
        self.ax_data.set_facecolor('#1E1E1E')
        
        self.fig.tight_layout()
        
        # Initialize plot lines
        self.line_state, = self.ax_state.plot([], [], 'g-', linewidth=2, label='State')
        self.line_data, = self.ax_data.plot([], [], 'c-', linewidth=2, label='Data')
        
        # Embed in tkinter
        self.canvas = FigureCanvasTkAgg(self.fig, master=chart_frame)
        self.canvas.draw()
        self.canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Start animation
        self.ani = FuncAnimation(
            self.fig,
            self._update_plots,
            interval=50,  # Update every 50ms (20 FPS)
            blit=False
        )
        
    def _update_plots(self, frame):
        """Update plot data (called by FuncAnimation)"""
        if not hasattr(self, 'plot_data'):
            return
            
        data = self.plot_data
        if not data['time']:
            return
            
        # Update state line
        self.line_state.set_data(data['time'], data['state'])
        
        # Update data request line
        self.line_data.set_data(data['time'], data['data_request'])
        
        # Auto-scale x-axis to show last 10 seconds
        if data['time']:
            max_time = max(data['time'])
            min_time = max(0, max_time - 10)
            self.ax_state.set_xlim(min_time, max_time + 0.1)
            self.ax_data.set_xlim(min_time, max_time + 0.1)
            
        return self.line_state, self.line_data
        
    def _update_loop(self):
        """Main update loop - polls state from simulation thread"""
        # Get latest state from queue (non-blocking)
        try:
            while True:
                state_data = self.state_queue.get_nowait()
                self.current_state = RRCState(state_data['state'])
                self.current_state_data = state_data
                self.plot_data = state_data.get('history', {'time': [], 'state': [], 'data_request': []})
        except queue.Empty:
            pass
            
        # Update state indicators
        self._update_state_lamps()
        
        # Update metrics
        self._update_metrics()
        
        # Schedule next update (50ms = 20Hz)
        self.master.after(50, self._update_loop)
        
    def _update_state_lamps(self):
        """Update visual state indicator lamps"""
        for state, lamp_id in self.lamp_ids.items():
            if state == self.current_state:
                # Active state - bright color
                self.lamp_canvas.itemconfig(lamp_id, fill=self.STATE_COLORS[state])
            else:
                # Inactive state - dark
                self.lamp_canvas.itemconfig(lamp_id, fill=self.INACTIVE_COLOR)
                
    def _update_metrics(self):
        """Update metrics display"""
        if self.current_state_data:
            # Simulation time
            sim_time = self.current_state_data.get('simulation_time', 0)
            self.time_label.config(text=f"{sim_time:.2f} s")
            
            # Total energy
            energy = self.current_state_data.get('total_energy', 0)
            self.energy_label.config(text=f"{int(energy):,} units")
            
            # Transitions
            transitions = self.current_state_data.get('transition_count', 0)
            self.transition_label.config(text=str(transitions))
            
    # === Event handlers ===
    
    def _on_start_stop(self):
        """Handle Start/Stop button click"""
        if not self.simulation_running:
            # Start simulation
            self.simulation_running = True
            self.command_queue.put({'command': 'start'})
            
            # Update button to STOP state
            self.start_button.config(
                text="⏸ STOP SIMULATION",
                bg='#DD0000'
            )
            
            # Enable event buttons
            self.data_button.config(state=tk.NORMAL)
            self.paging_button.config(state=tk.NORMAL)
            
            # Disable profile selection during simulation
            self.streaming_radio.config(state=tk.DISABLED)
            self.iot_radio.config(state=tk.DISABLED)
        else:
            # Stop simulation
            self.simulation_running = False
            self.command_queue.put({'command': 'stop'})
            
            # Update button to START state
            self.start_button.config(
                text="▶ START SIMULATION",
                bg='#00AA00'
            )
            
            # Disable event buttons
            self.data_button.config(state=tk.DISABLED)
            self.paging_button.config(state=tk.DISABLED)
            
            # Enable profile selection
            self.streaming_radio.config(state=tk.NORMAL)
            self.iot_radio.config(state=tk.NORMAL)
    
    def _on_data_button(self):
        """Handle 'Send Data Burst' button click"""
        if not self.simulation_running:
            return
        self.command_queue.put({'command': 'data_request', 'duration': 100})
        # Visual feedback
        self.data_button.config(relief=tk.SUNKEN)
        self.master.after(100, lambda: self.data_button.config(relief=tk.RAISED))
        
    def _on_paging_button(self):
        """Handle 'Simulate Paging' button click"""
        if not self.simulation_running:
            return
        self.command_queue.put({'command': 'paging'})
        # Visual feedback
        self.paging_button.config(relief=tk.SUNKEN)
        self.master.after(100, lambda: self.paging_button.config(relief=tk.RAISED))
        
    def _on_profile_change(self):
        """Handle traffic profile change"""
        profile = self.traffic_profile.get()
        self.command_queue.put({'command': 'set_profile', 'profile': profile})


# Test GUI standalone (with mock data)
if __name__ == "__main__":
    import threading
    import time
    
    print("Testing GUI with mock simulation data...")
    
    # Create queues
    cmd_queue = queue.Queue()
    state_queue = queue.Queue()
    
    # Mock simulation thread
    def mock_simulation():
        mock_time = 0
        mock_state = 0
        mock_energy = 0
        while True:
            # Simulate state changes
            if mock_time % 2.0 < 0.001:  # Every 2 seconds
                mock_state = (mock_state + 1) % 3
                
            mock_energy += [1, 100, 10][mock_state]
            
            # Generate mock history
            history = {
                'time': [mock_time - i*0.1 for i in range(100)],
                'state': [mock_state] * 100,
                'data_request': [1 if i % 20 < 5 else 0 for i in range(100)]
            }
            
            # Push state
            state_queue.put({
                'state': mock_state,
                'state_name': ['IDLE', 'CONNECTED', 'INACTIVE'][mock_state],
                'simulation_time': mock_time,
                'total_energy': mock_energy,
                'transition_count': int(mock_time / 2),
                'history': history
            })
            
            mock_time += 0.05
            time.sleep(0.05)
            
    # Start mock thread
    sim_thread = threading.Thread(target=mock_simulation, daemon=True)
    sim_thread.start()
    
    # Create GUI
    root = tk.Tk()
    gui = RRCSimulationGUI(root, cmd_queue, state_queue)
    
    # Print commands from GUI
    def print_commands():
        try:
            while True:
                cmd = cmd_queue.get_nowait()
                print(f"GUI Command: {cmd}")
        except queue.Empty:
            pass
        root.after(100, print_commands)
        
    print_commands()
    
    root.mainloop()
