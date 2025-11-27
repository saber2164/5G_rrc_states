"""
Comparative Study: Static vs. Adaptive Inactivity Timer
5G NR RRC State Machine Analysis

This script performs a comprehensive comparison between:
1. Static timer configuration (single threshold for all scenarios)
2. Adaptive timer configuration (profile-based thresholds)

Metrics evaluated:
- Total energy consumption
- State transition counts
- Time spent in each state (IDLE, CONNECTED, INACTIVE)
- Average latency for data bursts
- Network efficiency score

Test scenarios: 50+ diverse traffic patterns
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
import pandas as pd
from rrc_simulation_engine import RRCSimulationEngine, RRCState
from typing import Dict, List, Tuple
import time


class TimerComparativeStudy:
    """
    Comparative analysis framework for RRC timer strategies.
    """
    
    def __init__(self):
        self.results = []
        self.test_count = 0
        
    def run_scenario(self, 
                     scenario_name: str,
                     data_pattern: List[Tuple[int, int]],  # [(time_ms, burst_duration_ms), ...]
                     duration_ms: int,
                     timer_config: Dict,
                     config_name: str) -> Dict:
        """
        Run a single test scenario.
        
        Args:
            scenario_name: Name of the test scenario
            data_pattern: List of (time, burst_duration) tuples
            duration_ms: Total simulation duration
            timer_config: Timer configuration dict
            config_name: "Static" or "Adaptive-{profile}"
            
        Returns:
            Dictionary of metrics
        """
        engine = RRCSimulationEngine()
        
        # Apply timer configuration
        if 'static_threshold' in timer_config:
            # Static configuration - manually override
            engine.inactivity_threshold = timer_config['static_threshold']
            engine.long_inactivity_threshold = timer_config['static_long_threshold']
        else:
            # Adaptive configuration - use profile
            engine.set_traffic_profile(timer_config['profile'])
        
        # Schedule data bursts
        data_schedule = {t: duration for t, duration in data_pattern}
        
        # Run simulation
        for tick in range(duration_ms):
            # Trigger scheduled data bursts
            if tick in data_schedule:
                engine.trigger_data_request(burst_duration_ms=data_schedule[tick])
            
            engine.tick()
        
        # Collect metrics
        state_info = engine.get_state()
        total_time = duration_ms
        
        # Calculate percentages and derived metrics
        idle_pct = (state_info['state_durations'][RRCState.IDLE] / total_time) * 100
        connected_pct = (state_info['state_durations'][RRCState.CONNECTED] / total_time) * 100
        inactive_pct = (state_info['state_durations'][RRCState.INACTIVE] / total_time) * 100
        
        # Network efficiency: ratio of CONNECTED time to non-IDLE time
        non_idle_time = total_time - state_info['state_durations'][RRCState.IDLE]
        efficiency = (state_info['state_durations'][RRCState.CONNECTED] / non_idle_time * 100) if non_idle_time > 0 else 0
        
        # Average energy per second
        avg_energy_per_sec = state_info['total_energy'] / (total_time / 1000.0)
        
        return {
            'scenario': scenario_name,
            'config': config_name,
            'total_energy': state_info['total_energy'],
            'transitions': state_info['transition_count'],
            'idle_time_ms': state_info['state_durations'][RRCState.IDLE],
            'connected_time_ms': state_info['state_durations'][RRCState.CONNECTED],
            'inactive_time_ms': state_info['state_durations'][RRCState.INACTIVE],
            'idle_pct': idle_pct,
            'connected_pct': connected_pct,
            'inactive_pct': inactive_pct,
            'efficiency': efficiency,
            'avg_energy_per_sec': avg_energy_per_sec,
            'data_bursts': len(data_pattern)
        }
    
    def generate_test_scenarios(self) -> List[Dict]:
        """
        Generate 50+ diverse test scenarios covering various traffic patterns.
        
        Returns:
            List of scenario configurations
        """
        scenarios = []
        
        # Category 1: Periodic IoT sensors (10 tests)
        print("Generating IoT sensor scenarios...")
        for interval_ms in [500, 1000, 2000, 5000, 10000]:
            for burst_duration in [50, 100]:
                duration = 30000  # 30 seconds
                pattern = [(t, burst_duration) for t in range(0, duration, interval_ms)]
                scenarios.append({
                    'name': f'IoT_Sensor_{interval_ms}ms_interval_{burst_duration}ms_burst',
                    'pattern': pattern,
                    'duration': duration,
                    'category': 'IoT'
                })
        
        # Category 2: Streaming sessions (10 tests)
        print("Generating streaming scenarios...")
        for session_duration in [5000, 10000, 15000, 20000, 30000]:
            for burst_rate in [50, 100]:  # Frame rate simulation
                duration = session_duration + 10000  # Add idle time after
                pattern = [(t, 20) for t in range(0, session_duration, burst_rate)]
                scenarios.append({
                    'name': f'Streaming_{session_duration}ms_{burst_rate}ms_rate',
                    'pattern': pattern,
                    'duration': duration,
                    'category': 'Streaming'
                })
        
        # Category 3: Bursty web browsing (10 tests)
        print("Generating web browsing scenarios...")
        for num_pages in [3, 5, 7, 10, 15]:
            for page_load_time in [500, 1000]:
                duration = num_pages * 8000  # Pages spread over time
                pattern = []
                for i in range(num_pages):
                    page_start = i * (duration // num_pages)
                    # Multiple bursts per page load
                    pattern.extend([
                        (page_start, 100),
                        (page_start + 200, 150),
                        (page_start + 500, page_load_time),
                    ])
                scenarios.append({
                    'name': f'Web_Browse_{num_pages}_pages_{page_load_time}ms_load',
                    'pattern': pattern,
                    'duration': duration,
                    'category': 'Web'
                })
        
        # Category 4: Mixed traffic (10 tests)
        print("Generating mixed traffic scenarios...")
        for test_id in range(10):
            duration = 40000
            pattern = []
            # Random mix of short and long bursts
            np.random.seed(test_id)
            num_bursts = np.random.randint(10, 30)
            for _ in range(num_bursts):
                t = np.random.randint(0, duration - 1000)
                burst_len = np.random.choice([50, 100, 200, 500, 1000])
                pattern.append((t, burst_len))
            pattern.sort()  # Sort by time
            scenarios.append({
                'name': f'Mixed_Traffic_{test_id}',
                'pattern': pattern,
                'duration': duration,
                'category': 'Mixed'
            })
        
        # Category 5: Edge cases (10 tests)
        print("Generating edge case scenarios...")
        
        # Very sparse
        scenarios.append({
            'name': 'Edge_Very_Sparse',
            'pattern': [(5000, 50), (25000, 50)],
            'duration': 30000,
            'category': 'Edge'
        })
        
        # Very dense
        scenarios.append({
            'name': 'Edge_Very_Dense',
            'pattern': [(t, 50) for t in range(0, 10000, 100)],
            'duration': 15000,
            'category': 'Edge'
        })
        
        # Single long burst
        scenarios.append({
            'name': 'Edge_Single_Long',
            'pattern': [(1000, 5000)],
            'duration': 20000,
            'category': 'Edge'
        })
        
        # Increasing frequency
        for i in range(7):
            pattern = []
            interval = 2000
            for j in range(15):
                t = sum([interval // (1 + k//3) for k in range(j)])
                if t < 30000:
                    pattern.append((t, 100))
            scenarios.append({
                'name': f'Edge_Increasing_Freq_{i}',
                'pattern': pattern,
                'duration': 30000,
                'category': 'Edge'
            })
        
        print(f"Generated {len(scenarios)} test scenarios")
        return scenarios
    
    def run_comparative_study(self):
        """
        Run full comparative study: Static vs. Adaptive configurations.
        """
        print("="*70)
        print("RRC TIMER COMPARATIVE STUDY")
        print("Static vs. Adaptive Inactivity Timer")
        print("="*70)
        print()
        
        scenarios = self.generate_test_scenarios()
        
        # Define timer configurations to test
        configs = [
            # Static configurations
            {'name': 'Static_1s', 'static_threshold': 1000, 'static_long_threshold': 10000},
            {'name': 'Static_5s', 'static_threshold': 5000, 'static_long_threshold': 15000},
            {'name': 'Static_10s', 'static_threshold': 10000, 'static_long_threshold': 20000},
            
            # Adaptive configurations
            {'name': 'Adaptive_IoT', 'profile': 'IoT'},
            {'name': 'Adaptive_Streaming', 'profile': 'Streaming'},
        ]
        
        total_tests = len(scenarios) * len(configs)
        current_test = 0
        
        print(f"Running {total_tests} total tests ({len(scenarios)} scenarios × {len(configs)} configs)")
        print()
        
        start_time = time.time()
        
        for scenario in scenarios:
            for config in configs:
                current_test += 1
                print(f"[{current_test}/{total_tests}] {scenario['name'][:40]:40s} | {config['name']:20s}", end='\r')
                
                result = self.run_scenario(
                    scenario_name=scenario['name'],
                    data_pattern=scenario['pattern'],
                    duration_ms=scenario['duration'],
                    timer_config=config,
                    config_name=config['name']
                )
                result['category'] = scenario['category']
                self.results.append(result)
        
        elapsed = time.time() - start_time
        print(f"\n\n✓ Completed {total_tests} tests in {elapsed:.2f}s")
        print()
        
    def analyze_results(self):
        """
        Analyze and print statistical summary of results.
        """
        df = pd.DataFrame(self.results)
        
        print("="*70)
        print("STATISTICAL ANALYSIS")
        print("="*70)
        print()
        
        # Group by configuration
        for config_name in df['config'].unique():
            config_df = df[df['config'] == config_name]
            print(f"\n{config_name}:")
            print(f"  Average Energy:      {config_df['total_energy'].mean():>12,.0f} units")
            print(f"  Average Transitions: {config_df['transitions'].mean():>12,.1f}")
            print(f"  Average IDLE:        {config_df['idle_pct'].mean():>12,.1f}%")
            print(f"  Average CONNECTED:   {config_df['connected_pct'].mean():>12,.1f}%")
            print(f"  Average INACTIVE:    {config_df['inactive_pct'].mean():>12,.1f}%")
            print(f"  Average Efficiency:  {config_df['efficiency'].mean():>12,.1f}%")
        
        print()
        print("="*70)
        print("CATEGORY BREAKDOWN")
        print("="*70)
        
        for category in df['category'].unique():
            cat_df = df[df['category'] == category]
            print(f"\n{category} Traffic:")
            for config_name in df['config'].unique():
                config_cat_df = cat_df[cat_df['config'] == config_name]
                if len(config_cat_df) > 0:
                    print(f"  {config_name:20s}: Avg Energy = {config_cat_df['total_energy'].mean():>10,.0f} units")
    
    def plot_results(self, output_dir='results'):
        """
        Generate comprehensive visualization of results as separate files.
        
        Args:
            output_dir: Directory to save plots (default: 'results')
        """
        import os
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        df = pd.DataFrame(self.results)
        configs = df['config'].unique()
        categories = df['category'].unique()
        
        # Color scheme
        colors = plt.cm.Set3(np.linspace(0, 1, len(configs)))
        config_colors = {config: colors[i] for i, config in enumerate(configs)}
        
        print(f"\nGenerating individual plots in '{output_dir}/' folder...")
        
        # ===== Plot 1: Energy Consumption by Configuration =====
        fig1, ax1 = plt.subplots(figsize=(10, 6))
        energy_by_config = df.groupby('config')['total_energy'].mean()
        bars = ax1.bar(range(len(energy_by_config)), energy_by_config.values, 
                       color=[config_colors[c] for c in energy_by_config.index],
                       edgecolor='black', linewidth=1.5)
        ax1.set_xticks(range(len(energy_by_config)))
        ax1.set_xticklabels(energy_by_config.index, rotation=45, ha='right', fontsize=11)
        ax1.set_ylabel('Average Energy (units)', fontsize=12, fontweight='bold')
        ax1.set_title('Energy Consumption by Configuration', fontsize=14, fontweight='bold', pad=20)
        ax1.grid(axis='y', alpha=0.3, linestyle='--')
        
        # Add value labels on bars
        for i, (bar, val) in enumerate(zip(bars, energy_by_config.values)):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height(), 
                    f'{val:,.0f}', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        plot1_path = os.path.join(output_dir, '1_energy_by_config.png')
        plt.savefig(plot1_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot1_path}")
        
        # ===== Plot 2: State Distribution (Stacked Bar) =====
        fig2, ax2 = plt.subplots(figsize=(10, 6))
        state_data = df.groupby('config')[['idle_pct', 'connected_pct', 'inactive_pct']].mean()
        state_data.plot(kind='bar', stacked=True, ax=ax2, 
                       color=['#FF6B6B', '#4ECDC4', '#FFE66D'],
                       edgecolor='black', linewidth=1.5)
        ax2.set_ylabel('Time Distribution (%)', fontsize=12, fontweight='bold')
        ax2.set_title('State Distribution by Configuration', fontsize=14, fontweight='bold', pad=20)
        ax2.legend(['IDLE', 'CONNECTED', 'INACTIVE'], fontsize=11, loc='upper left')
        ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right', fontsize=11)
        ax2.set_xlabel('Configuration', fontsize=12, fontweight='bold')
        ax2.grid(axis='y', alpha=0.3, linestyle='--')
        plt.tight_layout()
        plot2_path = os.path.join(output_dir, '2_state_distribution.png')
        plt.savefig(plot2_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot2_path}")
        
        # ===== Plot 3: Transition Count =====
        fig3, ax3 = plt.subplots(figsize=(10, 6))
        transitions = df.groupby('config')['transitions'].mean()
        bars = ax3.bar(range(len(transitions)), transitions.values,
                      color=[config_colors[c] for c in transitions.index],
                      edgecolor='black', linewidth=1.5)
        ax3.set_xticks(range(len(transitions)))
        ax3.set_xticklabels(transitions.index, rotation=45, ha='right', fontsize=11)
        ax3.set_ylabel('Average Transitions', fontsize=12, fontweight='bold')
        ax3.set_title('State Transitions by Configuration', fontsize=14, fontweight='bold', pad=20)
        ax3.grid(axis='y', alpha=0.3, linestyle='--')
        
        # Add value labels
        for bar, val in zip(bars, transitions.values):
            ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height(), 
                    f'{val:.1f}', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        plot3_path = os.path.join(output_dir, '3_transition_count.png')
        plt.savefig(plot3_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot3_path}")
        
        # ===== Plot 4: Energy by Category =====
        fig4, ax4 = plt.subplots(figsize=(12, 6))
        for config in configs:
            config_df = df[df['config'] == config]
            category_energy = config_df.groupby('category')['total_energy'].mean()
            ax4.plot(category_energy.index, category_energy.values, 
                    marker='o', label=config, color=config_colors[config], 
                    linewidth=2.5, markersize=8)
        ax4.set_ylabel('Average Energy (units)', fontsize=12, fontweight='bold')
        ax4.set_xlabel('Traffic Category', fontsize=12, fontweight='bold')
        ax4.set_title('Energy Consumption by Traffic Category', fontsize=14, fontweight='bold', pad=20)
        ax4.legend(fontsize=10, loc='best')
        ax4.grid(alpha=0.3, linestyle='--')
        plt.tight_layout()
        plot4_path = os.path.join(output_dir, '4_energy_by_category.png')
        plt.savefig(plot4_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot4_path}")
        
        # ===== Plot 5: Efficiency Score =====
        fig5, ax5 = plt.subplots(figsize=(10, 6))
        efficiency = df.groupby('config')['efficiency'].mean()
        bars = ax5.bar(range(len(efficiency)), efficiency.values,
                      color=[config_colors[c] for c in efficiency.index],
                      edgecolor='black', linewidth=1.5)
        ax5.set_xticks(range(len(efficiency)))
        ax5.set_xticklabels(efficiency.index, rotation=45, ha='right', fontsize=11)
        ax5.set_ylabel('Network Efficiency (%)', fontsize=12, fontweight='bold')
        ax5.set_title('Network Efficiency Score', fontsize=14, fontweight='bold', pad=20)
        ax5.grid(axis='y', alpha=0.3, linestyle='--')
        ax5.axhline(y=50, color='red', linestyle='--', alpha=0.7, linewidth=2, label='Target: 50%')
        ax5.legend(fontsize=11)
        
        # Add value labels
        for bar, val in zip(bars, efficiency.values):
            ax5.text(bar.get_x() + bar.get_width()/2, bar.get_height(), 
                    f'{val:.1f}%', ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        plot5_path = os.path.join(output_dir, '5_efficiency_score.png')
        plt.savefig(plot5_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot5_path}")
        
        # ===== Plot 6: Energy Distribution (Box Plot) =====
        fig6, ax6 = plt.subplots(figsize=(12, 6))
        data_for_box = [df[df['config'] == config]['total_energy'].values for config in configs]
        box = ax6.boxplot(data_for_box, tick_labels=configs, patch_artist=True,
                         boxprops=dict(linewidth=1.5),
                         medianprops=dict(color='red', linewidth=2),
                         whiskerprops=dict(linewidth=1.5),
                         capprops=dict(linewidth=1.5))
        
        for patch, config in zip(box['boxes'], configs):
            patch.set_facecolor(config_colors[config])
            patch.set_alpha(0.7)
        
        ax6.set_xticklabels(configs, rotation=45, ha='right', fontsize=11)
        ax6.set_ylabel('Energy (units)', fontsize=12, fontweight='bold')
        ax6.set_title('Energy Distribution - Box Plot Analysis', fontsize=14, fontweight='bold', pad=20)
        ax6.grid(axis='y', alpha=0.3, linestyle='--')
        plt.tight_layout()
        plot6_path = os.path.join(output_dir, '6_energy_distribution_boxplot.png')
        plt.savefig(plot6_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot6_path}")
        
        # ===== Plot 7: Category Performance Heatmap =====
        fig7, ax7 = plt.subplots(figsize=(12, 6))
        heatmap_data = df.pivot_table(values='total_energy', 
                                       index='category', 
                                       columns='config', 
                                       aggfunc='mean')
        im = ax7.imshow(heatmap_data.values, cmap='YlOrRd', aspect='auto')
        ax7.set_xticks(range(len(heatmap_data.columns)))
        ax7.set_yticks(range(len(heatmap_data.index)))
        ax7.set_xticklabels(heatmap_data.columns, rotation=45, ha='right', fontsize=11)
        ax7.set_yticklabels(heatmap_data.index, fontsize=11)
        ax7.set_title('Energy Consumption Heatmap: Category × Configuration', 
                     fontsize=14, fontweight='bold', pad=20)
        
        # Add values to heatmap
        for i in range(len(heatmap_data.index)):
            for j in range(len(heatmap_data.columns)):
                value = heatmap_data.values[i, j]
                text = ax7.text(j, i, f'{value:,.0f}',
                               ha="center", va="center", 
                               color="white" if value > heatmap_data.values.max()/2 else "black",
                               fontsize=9, fontweight='bold')
        
        cbar = plt.colorbar(im, ax=ax7, label='Energy (units)')
        cbar.ax.tick_params(labelsize=10)
        plt.tight_layout()
        plot7_path = os.path.join(output_dir, '7_heatmap_category_config.png')
        plt.savefig(plot7_path, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  ✓ {plot7_path}")
        
        print(f"\n✓ All 7 plots saved to '{output_dir}/' folder")
        return output_dir
        """
        Generate comprehensive visualization of results.
        """
        df = pd.DataFrame(self.results)
        
        fig = plt.figure(figsize=(20, 12))
        gs = GridSpec(3, 3, figure=fig, hspace=0.3, wspace=0.3)
        
        configs = df['config'].unique()
        categories = df['category'].unique()
        
        # Color scheme
        colors = plt.cm.Set3(np.linspace(0, 1, len(configs)))
        config_colors = {config: colors[i] for i, config in enumerate(configs)}
        
        # 1. Energy Consumption by Configuration
        ax1 = fig.add_subplot(gs[0, 0])
        energy_by_config = df.groupby('config')['total_energy'].mean()
        bars = ax1.bar(range(len(energy_by_config)), energy_by_config.values, 
                       color=[config_colors[c] for c in energy_by_config.index])
        ax1.set_xticks(range(len(energy_by_config)))
        ax1.set_xticklabels(energy_by_config.index, rotation=45, ha='right')
        ax1.set_ylabel('Average Energy (units)')
        ax1.set_title('Energy Consumption by Configuration')
        ax1.grid(axis='y', alpha=0.3)
        
        # 2. State Distribution (Stacked Bar)
        ax2 = fig.add_subplot(gs[0, 1])
        state_data = df.groupby('config')[['idle_pct', 'connected_pct', 'inactive_pct']].mean()
        state_data.plot(kind='bar', stacked=True, ax=ax2, 
                       color=['#FF6B6B', '#4ECDC4', '#FFE66D'])
        ax2.set_ylabel('Time (%)')
        ax2.set_title('State Distribution by Configuration')
        ax2.legend(['IDLE', 'CONNECTED', 'INACTIVE'])
        ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right')
        
        # 3. Transition Count
        ax3 = fig.add_subplot(gs[0, 2])
        transitions = df.groupby('config')['transitions'].mean()
        ax3.bar(range(len(transitions)), transitions.values,
               color=[config_colors[c] for c in transitions.index])
        ax3.set_xticks(range(len(transitions)))
        ax3.set_xticklabels(transitions.index, rotation=45, ha='right')
        ax3.set_ylabel('Average Transitions')
        ax3.set_title('State Transitions by Configuration')
        ax3.grid(axis='y', alpha=0.3)
        
        # 4. Energy by Category
        ax4 = fig.add_subplot(gs[1, 0])
        for config in configs:
            config_df = df[df['config'] == config]
            category_energy = config_df.groupby('category')['total_energy'].mean()
            ax4.plot(category_energy.index, category_energy.values, 
                    marker='o', label=config, color=config_colors[config], linewidth=2)
        ax4.set_ylabel('Average Energy (units)')
        ax4.set_title('Energy by Traffic Category')
        ax4.legend(fontsize=8)
        ax4.grid(alpha=0.3)
        
        # 5. Efficiency Score
        ax5 = fig.add_subplot(gs[1, 1])
        efficiency = df.groupby('config')['efficiency'].mean()
        ax5.bar(range(len(efficiency)), efficiency.values,
               color=[config_colors[c] for c in efficiency.index])
        ax5.set_xticks(range(len(efficiency)))
        ax5.set_xticklabels(efficiency.index, rotation=45, ha='right')
        ax5.set_ylabel('Network Efficiency (%)')
        ax5.set_title('Network Efficiency Score')
        ax5.grid(axis='y', alpha=0.3)
        ax5.axhline(y=50, color='red', linestyle='--', alpha=0.5, label='Target: 50%')
        ax5.legend()
        
        # 6. Energy Distribution (Box Plot)
        ax6 = fig.add_subplot(gs[1, 2])
        data_for_box = [df[df['config'] == config]['total_energy'].values for config in configs]
        box = ax6.boxplot(data_for_box, labels=configs, patch_artist=True)
        for patch, config in zip(box['boxes'], configs):
            patch.set_facecolor(config_colors[config])
        ax6.set_xticklabels(configs, rotation=45, ha='right')
        ax6.set_ylabel('Energy (units)')
        ax6.set_title('Energy Distribution (Box Plot)')
        ax6.grid(axis='y', alpha=0.3)
        
        # 7. Category Performance Heatmap
        ax7 = fig.add_subplot(gs[2, :])
        heatmap_data = df.pivot_table(values='total_energy', 
                                       index='category', 
                                       columns='config', 
                                       aggfunc='mean')
        im = ax7.imshow(heatmap_data.values, cmap='YlOrRd', aspect='auto')
        ax7.set_xticks(range(len(heatmap_data.columns)))
        ax7.set_yticks(range(len(heatmap_data.index)))
        ax7.set_xticklabels(heatmap_data.columns, rotation=45, ha='right')
        ax7.set_yticklabels(heatmap_data.index)
        ax7.set_title('Energy Consumption Heatmap: Category vs Configuration')
        
        # Add values to heatmap
        for i in range(len(heatmap_data.index)):
            for j in range(len(heatmap_data.columns)):
                text = ax7.text(j, i, f'{heatmap_data.values[i, j]:.0f}',
                               ha="center", va="center", color="black", fontsize=8)
        
        plt.colorbar(im, ax=ax7, label='Energy (units)')
        
        plt.suptitle('5G RRC Timer Comparative Study: Static vs. Adaptive', 
                    fontsize=16, fontweight='bold', y=0.995)
        
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"\n✓ Visualization saved to: {output_file}")
        
        return fig


def main():
    """
    Main execution function.
    """
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*14 + "5G NR RRC TIMER COMPARATIVE STUDY" + " "*21 + "║")
    print("║" + " "*14 + "Static vs. Adaptive Configuration" + " "*20 + "║")
    print("╚" + "="*68 + "╝")
    print()
    
    study = TimerComparativeStudy()
    
    # Run the study
    study.run_comparative_study()
    
    # Analyze results
    study.analyze_results()
    
    # Generate visualizations
    results_dir = study.plot_results()
    
    # Export to CSV
    df = pd.DataFrame(study.results)
    csv_file = 'comparative_study_data.csv'
    df.to_csv(csv_file, index=False)
    print(f"\n✓ Raw data exported to: {csv_file}")
    
    print("\n" + "="*70)
    print("STUDY COMPLETE")
    print("="*70)
    print(f"Total tests run: {len(study.results)}")
    print(f"Plots saved to: {results_dir}/")
    print(f"  - 1_energy_by_config.png")
    print(f"  - 2_state_distribution.png")
    print(f"  - 3_transition_count.png")
    print(f"  - 4_energy_by_category.png")
    print(f"  - 5_efficiency_score.png")
    print(f"  - 6_energy_distribution_boxplot.png")
    print(f"  - 7_heatmap_category_config.png")
    print(f"Data exported to: {csv_file}")
    print()


if __name__ == "__main__":
    main()
