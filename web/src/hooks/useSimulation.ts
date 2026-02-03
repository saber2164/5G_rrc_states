'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEngine, SimulationState, EventLog } from '@/lib/rrc-engine';

export function useSimulation() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const engine = getEngine();
    
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
      setEvents(engine.getEventLog());
      setIsRunning(engine.isRunning());
    });

    // Initial state
    setState(engine.getState());
    setEvents(engine.getEventLog());
    setIsRunning(engine.isRunning());

    return () => {
      unsubscribe();
    };
  }, []);

  const start = useCallback(() => {
    getEngine().start();
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    getEngine().stop();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    getEngine().reset();
    setState(getEngine().getState());
    setEvents([]);
    setIsRunning(false);
  }, []);

  const sendData = useCallback((duration: number = 100) => {
    getEngine().triggerDataRequest(duration);
  }, []);

  const triggerPaging = useCallback(() => {
    getEngine().triggerPaging();
  }, []);

  const setProfile = useCallback((profile: 'Streaming' | 'IoT') => {
    getEngine().setTrafficProfile(profile);
    setState(getEngine().getState());
  }, []);

  return {
    state,
    events,
    isRunning,
    start,
    stop,
    reset,
    sendData,
    triggerPaging,
    setProfile,
  };
}
