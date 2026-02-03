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
    color: 'bg-red-500',
    glow: 'shadow-red-500/50',
    ring: 'ring-red-400',
    label: 'IDLE',
    power: '0 units/tick',
    description: 'Low Power Mode',
  },
  [RRCState.CONNECTED]: {
    color: 'bg-green-500',
    glow: 'shadow-green-500/50',
    ring: 'ring-green-400',
    label: 'CONNECTED',
    power: '100 units/tick',
    description: 'Active Transfer',
  },
  [RRCState.INACTIVE]: {
    color: 'bg-yellow-500',
    glow: 'shadow-yellow-500/50',
    ring: 'ring-yellow-400',
    label: 'INACTIVE',
    power: '10 units/tick',
    description: 'Fast Resume Ready',
  },
};

export function StateIndicators({ currentState, simulationTime, totalEnergy, transitionCount }: StateIndicatorsProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">State Indicators</h3>
      
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
                    '0 0 20px 10px rgba(255,255,255,0.3)',
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
              <span className={`mt-2 text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {info.label}
              </span>
              <span className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>
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
          icon="⏱️"
        />
        <MetricCard
          label="Total Energy"
          value={`${(totalEnergy / 1000).toFixed(1)}k`}
          icon="⚡"
        />
        <MetricCard
          label="Transitions"
          value={transitionCount.toString()}
          icon="🔄"
        />
      </div>

      {/* Current State Badge */}
      <motion.div
        key={currentState}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`mt-4 p-4 rounded-xl ${STATE_INFO[currentState].color} bg-opacity-20 border border-opacity-30`}
        style={{ borderColor: STATE_INFO[currentState].color.replace('bg-', '') }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Current State</p>
            <p className="text-xl font-bold text-white">{STATE_INFO[currentState].label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Mode</p>
            <p className="text-sm text-white">{STATE_INFO[currentState].description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <motion.div
        key={value}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold text-white"
      >
        {value}
      </motion.div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
