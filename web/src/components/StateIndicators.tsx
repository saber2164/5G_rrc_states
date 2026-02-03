'use client';

import { motion } from 'framer-motion';
import { RRCState } from '@/lib/rrc-engine';

interface StateIndicatorsProps {
  currentState: RRCState;
  simulationTime: number;
  totalEnergy: number;
  transitionCount: number;
}

const STATE_INFO = {
  [RRCState.IDLE]: {
    color: 'bg-gray-500',
    glow: 'shadow-gray-500/50',
    ring: 'ring-gray-400',
    label: 'IDLE',
    power: '0 units/tick',
    description: 'Low Power Mode',
  },
  [RRCState.CONNECTED]: {
    color: 'bg-primary',
    glow: 'shadow-primary/50',
    ring: 'ring-primary',
    label: 'CONNECTED',
    power: '100 units/tick',
    description: 'Active Transfer',
  },
  [RRCState.INACTIVE]: {
    color: 'bg-accent',
    glow: 'shadow-accent/50',
    ring: 'ring-accent',
    label: 'INACTIVE',
    power: '10 units/tick',
    description: 'Fast Resume Ready',
  },
};

export function StateIndicators({ currentState, simulationTime, totalEnergy, transitionCount }: StateIndicatorsProps) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
      <h3 className="text-lg font-semibold text-text mb-4">State Indicators</h3>
      
      {/* State Lamps */}
      <div className="flex justify-center gap-8 mb-6">
        {Object.entries(STATE_INFO).map(([stateKey, info]) => {
          const stateNum = parseInt(stateKey) as RRCState;
          const isActive = currentState === stateNum;
          
          return (
            <div key={stateKey} className="flex flex-col items-center">
              <motion.div
                className={`w-16 h-16 rounded-full ${info.color} ${isActive ? 'shadow-lg ' + info.glow : 'opacity-30'}`}
                animate={isActive ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(255,255,255,0)',
                    '0 0 20px 10px rgba(255,255,255,0.2)',
                    '0 0 0 0 rgba(255,255,255,0)',
                  ],
                } : {}}
                transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
              >
                {isActive && (
                  <motion.div
                    className={`w-full h-full rounded-full ring-4 ${info.ring}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.div>
              <span className={`mt-2 text-sm font-medium ${isActive ? 'text-text' : 'text-secondary'}`}>
                {info.label}
              </span>
              <span className={`text-xs ${isActive ? 'text-secondary' : 'text-secondary/50'}`}>
                {info.power}
              </span>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Simulation Time"
          value={`${simulationTime.toFixed(2)}s`}
          icon="TIME"
        />
        <MetricCard
          label="Total Energy"
          value={`${(totalEnergy / 1000).toFixed(1)}k`}
          icon="ENERGY"
        />
        <MetricCard
          label="Transitions"
          value={transitionCount.toString()}
          icon="COUNT"
        />
      </div>

      {/* Current State Badge */}
      <motion.div
        key={currentState}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-4 p-4 rounded-xl bg-surface border border-secondary/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">Current State</p>
            <p className="text-xl font-bold text-text">{STATE_INFO[currentState].label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-secondary">Mode</p>
            <p className="text-sm text-text">{STATE_INFO[currentState].description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-background rounded-xl p-3 text-center border border-secondary/10">
      <div className="text-xs text-secondary mb-1">{icon}</div>
      <motion.div
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold text-text"
      >
        {value}
      </motion.div>
      <div className="text-xs text-secondary">{label}</div>
    </div>
  );
}
