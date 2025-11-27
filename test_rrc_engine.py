"""
Unit tests for RRC Simulation Engine

Verifies 3GPP-compliant state transitions and adaptive timer behavior.

Run with: python3 -m pytest test_rrc_engine.py -v
Or simply: python3 test_rrc_engine.py
"""

import sys
from rrc_simulation_engine import RRCSimulationEngine, RRCState


def test_idle_to_connected_on_data():
    """Verify IDLE → CONNECTED transition on data request"""
    print("Test 1: IDLE → CONNECTED on data request...")
    engine = RRCSimulationEngine()
    assert engine.state == RRCState.IDLE, "Should start in IDLE"
    
    engine.trigger_data_request()
    engine.tick()
    
    assert engine.state == RRCState.CONNECTED, "Should transition to CONNECTED"
    print("  ✓ PASSED")


def test_idle_to_connected_on_paging():
    """Verify IDLE → CONNECTED transition on paging"""
    print("Test 2: IDLE → CONNECTED on paging...")
    engine = RRCSimulationEngine()
    
    engine.trigger_paging()
    engine.tick()
    
    assert engine.state == RRCState.CONNECTED, "Should transition to CONNECTED on paging"
    print("  ✓ PASSED")


def test_connected_to_inactive_on_timer():
    """Verify CONNECTED → INACTIVE after inactivity threshold"""
    print("Test 3: CONNECTED → INACTIVE after inactivity timer...")
    engine = RRCSimulationEngine()
    engine.set_traffic_profile("IoT")  # 200ms threshold
    
    # Transition to CONNECTED
    engine.trigger_data_request(burst_duration_ms=50)
    engine.tick()
    assert engine.state == RRCState.CONNECTED
    
    # Wait for data burst to complete and inactivity timer to expire
    for _ in range(250):  # 50ms burst + 200ms inactivity = need 251+ ticks
        engine.tick()
        
    assert engine.state == RRCState.INACTIVE, f"Should be INACTIVE after timer, got {engine.state.name}"
    print("  ✓ PASSED")


def test_inactive_to_connected_fast_resume():
    """Verify INACTIVE → CONNECTED fast resume on data request"""
    print("Test 4: INACTIVE → CONNECTED (fast resume)...")
    engine = RRCSimulationEngine()
    engine.set_traffic_profile("IoT")
    
    # Get to INACTIVE state
    engine.trigger_data_request(burst_duration_ms=50)
    for _ in range(251):
        engine.tick()
    assert engine.state == RRCState.INACTIVE
    
    # Trigger data request from INACTIVE
    engine.trigger_data_request()
    engine.tick()
    
    assert engine.state == RRCState.CONNECTED, "Should fast resume to CONNECTED"
    print("  ✓ PASSED")


def test_inactive_to_idle_on_long_timer():
    """Verify INACTIVE → IDLE after long inactivity timer (30s)"""
    print("Test 5: INACTIVE → IDLE after long inactivity...")
    engine = RRCSimulationEngine()
    engine.set_traffic_profile("IoT")
    
    # Get to INACTIVE
    engine.trigger_data_request(burst_duration_ms=50)
    for _ in range(251):
        engine.tick()
    assert engine.state == RRCState.INACTIVE
    
    # Wait for long inactivity timer (30s = 30000ms)
    for _ in range(30001):
        engine.tick()
        
    assert engine.state == RRCState.IDLE, "Should return to IDLE after 30s"
    print("  ✓ PASSED")


def test_adaptive_timer_iot_vs_streaming():
    """Verify different thresholds for traffic profiles"""
    print("Test 6: Adaptive timer (IoT vs Streaming)...")
    engine = RRCSimulationEngine()
    
    # Test IoT profile
    engine.set_traffic_profile("IoT")
    assert engine.inactivity_threshold == 200, "IoT threshold should be 200ms"
    
    # Test Streaming profile
    engine.set_traffic_profile("Streaming")
    assert engine.inactivity_threshold == 10000, "Streaming threshold should be 10s"
    
    print("  ✓ PASSED")


def test_energy_calculation():
    """Verify energy integration"""
    print("Test 7: Energy calculation...")
    engine = RRCSimulationEngine()
    
    # Test IDLE energy (1 unit/tick)
    for _ in range(100):
        engine.tick()
    idle_energy = engine.total_energy
    assert idle_energy == 100, f"100 ticks in IDLE should consume 100 units, got {idle_energy}"
    
    # Test CONNECTED energy (100 units/tick)
    engine.reset()
    engine.trigger_data_request(burst_duration_ms=1000)  # Long burst
    for _ in range(10):
        engine.tick()
    connected_energy = engine.total_energy
    assert connected_energy == 1000, f"10 ticks in CONNECTED should consume 1000 units, got {connected_energy}"
    
    print("  ✓ PASSED")


def test_state_persistence_during_data():
    """Verify state remains CONNECTED during continuous data activity"""
    print("Test 8: State persistence during data activity...")
    engine = RRCSimulationEngine()
    engine.set_traffic_profile("IoT")
    
    engine.trigger_data_request(burst_duration_ms=500)
    engine.tick()
    
    # Should remain CONNECTED during entire burst
    for _ in range(500):
        engine.tick()
        assert engine.state == RRCState.CONNECTED, "Should stay CONNECTED during data burst"
        
    print("  ✓ PASSED")


def test_transition_count():
    """Verify transition counting"""
    print("Test 9: Transition counting...")
    engine = RRCSimulationEngine()
    engine.set_traffic_profile("IoT")
    
    initial_count = engine.transition_count
    assert initial_count == 0
    
    # IDLE -> CONNECTED
    engine.trigger_data_request(burst_duration_ms=50)
    engine.tick()
    assert engine.transition_count == 1
    
    # CONNECTED -> INACTIVE
    for _ in range(251):
        engine.tick()
    assert engine.transition_count == 2
    
    # INACTIVE -> CONNECTED
    engine.trigger_data_request()
    engine.tick()
    assert engine.transition_count == 3
    
    print("  ✓ PASSED")


def test_get_state_snapshot():
    """Verify get_state() returns correct snapshot"""
    print("Test 10: State snapshot API...")
    engine = RRCSimulationEngine()
    
    state = engine.get_state()
    assert 'state' in state
    assert 'state_name' in state
    assert 'simulation_time' in state
    assert 'total_energy' in state
    assert state['state'] == RRCState.IDLE
    assert state['state_name'] == 'IDLE'
    
    print("  ✓ PASSED")


def run_all_tests():
    """Run all test cases"""
    print("="*60)
    print("RRC Simulation Engine - Unit Tests")
    print("="*60)
    print()
    
    tests = [
        test_idle_to_connected_on_data,
        test_idle_to_connected_on_paging,
        test_connected_to_inactive_on_timer,
        test_inactive_to_connected_fast_resume,
        test_inactive_to_idle_on_long_timer,
        test_adaptive_timer_iot_vs_streaming,
        test_energy_calculation,
        test_state_persistence_during_data,
        test_transition_count,
        test_get_state_snapshot,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"  ✗ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed += 1
            
    print()
    print("="*60)
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("="*60)
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
