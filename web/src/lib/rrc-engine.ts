/**
 * 5G NR RRC State Machine Simulation Engine (TypeScript)
 * Port of Python simulation engine for browser-based execution
 */

export enum RRCState {
  IDLE = 0,
  CONNECTED = 1,
  INACTIVE = 2,
}

export enum TrafficProfile {
  STREAMING = 0,
  IOT = 1,
}

export interface SimulationState {
  state: RRCState;
  stateName: string;
  simulationTime: number;
  totalEnergy: number;
  inactivityTimer: number;
  longInactivityTimer: number;
  inactivityThreshold: number;
  longInactivityThreshold: number;
  trafficProfile: string;
  dataActive: boolean;
  transitionCount: number;
  stateDurations: Record<RRCState, number>;
  history: {
    time: number[];
    state: number[];
    dataRequest: number[];
  };
}

export interface EventLog {
  timestamp: number;
  message: string;
}

const STATE_NAMES: Record<RRCState, string> = {
  [RRCState.IDLE]: 'IDLE',
  [RRCState.CONNECTED]: 'CONNECTED',
  [RRCState.INACTIVE]: 'INACTIVE',
};

const POWER_CONSUMPTION: Record<RRCState, number> = {
  [RRCState.IDLE]: 0,
  [RRCState.CONNECTED]: 100,
  [RRCState.INACTIVE]: 10,
};

const TIMER_THRESHOLDS: Record<TrafficProfile, number> = {
  [TrafficProfile.STREAMING]: 10000, // 10 seconds
  [TrafficProfile.IOT]: 200, // 200 milliseconds
};

const LONG_INACTIVITY_THRESHOLDS: Record<TrafficProfile, number> = {
  [TrafficProfile.STREAMING]: 20000, // 20 seconds
  [TrafficProfile.IOT]: 5000, // 5 seconds
};

export class RRCSimulationEngine {
  private state: RRCState = RRCState.IDLE;
  private previousState: RRCState = RRCState.IDLE;
  
  private inactivityTimer: number = 0;
  private longInactivityTimer: number = 0;
  private simulationTime: number = 0;
  
  private trafficProfile: TrafficProfile = TrafficProfile.IOT;
  private inactivityThreshold: number = TIMER_THRESHOLDS[TrafficProfile.IOT];
  private longInactivityThreshold: number = LONG_INACTIVITY_THRESHOLDS[TrafficProfile.IOT];
  
  private dataRequest: boolean = false;
  private pagingRequest: boolean = false;
  private dataActive: boolean = false;
  private dataBurstDuration: number = 0;
  
  private totalEnergy: number = 0;
  
  private maxHistoryLength: number = 10000;
  private stateHistory: number[] = [];
  private dataRequestHistory: number[] = [];
  private timeHistory: number[] = [];
  
  private eventLog: EventLog[] = [];
  
  private stateDurations: Record<RRCState, number> = {
    [RRCState.IDLE]: 0,
    [RRCState.CONNECTED]: 0,
    [RRCState.INACTIVE]: 0,
  };
  private transitionCount: number = 0;
  
  private running: boolean = false;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(state: SimulationState) => void> = new Set();

  tick(): void {
    this.updateTimers();
    this.updateStateMachine();
    this.calculateEnergy();
    this.stateDurations[this.state] += 1;
    this.recordHistory();
    this.simulationTime += 1;
    this.pagingRequest = false;
  }

  private updateTimers(): void {
    if (this.state === RRCState.CONNECTED) {
      if (this.dataActive) {
        this.inactivityTimer = 0;
      } else {
        this.inactivityTimer += 1;
      }
    } else {
      this.inactivityTimer = 0;
    }

    if (this.state === RRCState.INACTIVE) {
      this.longInactivityTimer += 1;
    } else {
      this.longInactivityTimer = 0;
    }

    if (this.dataBurstDuration > 0) {
      this.dataBurstDuration -= 1;
      this.dataActive = true;
    } else {
      this.dataActive = false;
    }
  }

  private updateStateMachine(): void {
    const oldState = this.state;

    if (this.state === RRCState.IDLE) {
      if (this.dataRequest || this.pagingRequest) {
        this.state = RRCState.CONNECTED;
        this.logEvent(`IDLE → CONNECTED (${this.dataRequest ? 'data' : 'paging'})`);
      }
    } else if (this.state === RRCState.CONNECTED) {
      if (this.inactivityTimer >= this.inactivityThreshold && !this.dataActive) {
        this.state = RRCState.INACTIVE;
        this.logEvent(`CONNECTED → INACTIVE (${this.inactivityTimer}ms inactivity)`);
      }
    } else if (this.state === RRCState.INACTIVE) {
      if (this.dataRequest) {
        this.state = RRCState.CONNECTED;
        this.logEvent('INACTIVE → CONNECTED (fast resume)');
      } else if (this.longInactivityTimer >= this.longInactivityThreshold) {
        this.state = RRCState.IDLE;
        this.logEvent(`INACTIVE → IDLE (${this.longInactivityTimer}ms)`);
      }
    }

    if (oldState !== this.state) {
      this.previousState = oldState;
      this.transitionCount += 1;
    }

    this.dataRequest = false;
  }

  private calculateEnergy(): void {
    this.totalEnergy += POWER_CONSUMPTION[this.state];
  }

  private recordHistory(): void {
    if (this.stateHistory.length >= this.maxHistoryLength) {
      const trimSize = Math.floor(this.maxHistoryLength / 10);
      this.stateHistory = this.stateHistory.slice(trimSize);
      this.dataRequestHistory = this.dataRequestHistory.slice(trimSize);
      this.timeHistory = this.timeHistory.slice(trimSize);
    }

    this.stateHistory.push(this.state);
    this.dataRequestHistory.push(this.dataActive || this.dataRequest ? 1 : 0);
    this.timeHistory.push(this.simulationTime / 1000);
  }

  private logEvent(message: string): void {
    const timestamp = this.simulationTime / 1000;
    this.eventLog.push({ timestamp, message });
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100);
    }
  }

  triggerDataRequest(burstDurationMs: number = 100): void {
    this.dataRequest = true;
    this.dataBurstDuration = burstDurationMs;
    this.logEvent(`Data request (${burstDurationMs}ms burst)`);
  }

  triggerPaging(): void {
    this.pagingRequest = true;
    this.logEvent('Paging request');
  }

  setTrafficProfile(profile: 'Streaming' | 'IoT'): void {
    if (profile === 'Streaming') {
      this.trafficProfile = TrafficProfile.STREAMING;
      this.inactivityThreshold = TIMER_THRESHOLDS[TrafficProfile.STREAMING];
      this.longInactivityThreshold = LONG_INACTIVITY_THRESHOLDS[TrafficProfile.STREAMING];
    } else {
      this.trafficProfile = TrafficProfile.IOT;
      this.inactivityThreshold = TIMER_THRESHOLDS[TrafficProfile.IOT];
      this.longInactivityThreshold = LONG_INACTIVITY_THRESHOLDS[TrafficProfile.IOT];
    }
    this.logEvent(`Profile: ${profile}`);
  }

  getState(): SimulationState {
    return {
      state: this.state,
      stateName: STATE_NAMES[this.state],
      simulationTime: this.simulationTime / 1000,
      totalEnergy: this.totalEnergy,
      inactivityTimer: this.inactivityTimer,
      longInactivityTimer: this.longInactivityTimer,
      inactivityThreshold: this.inactivityThreshold,
      longInactivityThreshold: this.longInactivityThreshold,
      trafficProfile: this.trafficProfile === TrafficProfile.STREAMING ? 'Streaming' : 'IoT',
      dataActive: this.dataActive,
      transitionCount: this.transitionCount,
      stateDurations: { ...this.stateDurations },
      history: this.getHistory(10),
    };
  }

  getHistory(lastNSeconds: number = 10): { time: number[]; state: number[]; dataRequest: number[] } {
    if (this.timeHistory.length === 0) {
      return { time: [], state: [], dataRequest: [] };
    }

    const currentTime = this.simulationTime / 1000;
    const cutoffTime = currentTime - lastNSeconds;
    
    let startIdx = 0;
    for (let i = 0; i < this.timeHistory.length; i++) {
      if (this.timeHistory[i] >= cutoffTime) {
        startIdx = i;
        break;
      }
    }

    return {
      time: this.timeHistory.slice(startIdx),
      state: this.stateHistory.slice(startIdx),
      dataRequest: this.dataRequestHistory.slice(startIdx),
    };
  }

  getEventLog(): EventLog[] {
    return [...this.eventLog];
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    
    // Run at ~100Hz for smooth visualization (10ms per tick = 10x speedup)
    this.tickInterval = setInterval(() => {
      for (let i = 0; i < 10; i++) {
        this.tick();
      }
      this.notifyListeners();
    }, 10);
  }

  stop(): void {
    this.running = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  reset(): void {
    this.stop();
    this.state = RRCState.IDLE;
    this.previousState = RRCState.IDLE;
    this.inactivityTimer = 0;
    this.longInactivityTimer = 0;
    this.simulationTime = 0;
    this.dataRequest = false;
    this.pagingRequest = false;
    this.dataActive = false;
    this.dataBurstDuration = 0;
    this.totalEnergy = 0;
    this.stateHistory = [];
    this.dataRequestHistory = [];
    this.timeHistory = [];
    this.eventLog = [];
    this.stateDurations = {
      [RRCState.IDLE]: 0,
      [RRCState.CONNECTED]: 0,
      [RRCState.INACTIVE]: 0,
    };
    this.transitionCount = 0;
    this.notifyListeners();
  }

  subscribe(listener: (state: SimulationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

// Singleton instance
let engineInstance: RRCSimulationEngine | null = null;

export function getEngine(): RRCSimulationEngine {
  if (!engineInstance) {
    engineInstance = new RRCSimulationEngine();
  }
  return engineInstance;
}
