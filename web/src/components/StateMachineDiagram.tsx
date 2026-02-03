'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RRCState } from '@/lib/rrc-engine';

interface StateMachineDiagramProps {
  currentState: RRCState;
  transitionCount: number;
}

const STATE_COLORS = {
  [RRCState.IDLE]: { bg: '#ef4444', glow: '#fca5a5', text: 'white' },
  [RRCState.CONNECTED]: { bg: '#22c55e', glow: '#86efac', text: 'white' },
  [RRCState.INACTIVE]: { bg: '#eab308', glow: '#fde047', text: 'black' },
};

const STATE_DESCRIPTIONS = {
  [RRCState.IDLE]: 'Low power, no active connection. Device is in sleep mode.',
  [RRCState.CONNECTED]: 'Active data transfer. Full power consumption.',
  [RRCState.INACTIVE]: 'Intermediate power. Context retained for fast resume.',
};

export function StateMachineDiagram({ currentState, transitionCount }: StateMachineDiagramProps) {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-4 relative z-10">
        5G NR RRC State Machine
        <span className="ml-2 text-sm font-normal text-slate-400">
          (3GPP TS 38.331)
        </span>
      </h3>

      {/* SVG State Machine */}
      <svg viewBox="0 0 500 280" className="w-full h-[280px] relative z-10">
        {/* Connection Lines */}
        {/* IDLE to CONNECTED */}
        <motion.path
          d="M 100 100 Q 200 50 300 100"
          fill="none"
          stroke={currentState === RRCState.CONNECTED && transitionCount > 0 ? '#22c55e' : '#475569'}
          strokeWidth="3"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <text x="200" y="45" fill="#94a3b8" fontSize="10" textAnchor="middle">data_request / paging</text>
        
        {/* CONNECTED to INACTIVE */}
        <motion.path
          d="M 340 140 L 340 200"
          fill="none"
          stroke={currentState === RRCState.INACTIVE ? '#eab308' : '#475569'}
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <text x="400" y="175" fill="#94a3b8" fontSize="9" textAnchor="start">inactivity_timer</text>
        <text x="400" y="188" fill="#94a3b8" fontSize="9" textAnchor="start">&gt; threshold</text>

        {/* INACTIVE to CONNECTED (Fast Resume) */}
        <motion.path
          d="M 300 200 Q 250 170 300 140"
          fill="none"
          stroke={currentState === RRCState.CONNECTED ? '#22c55e' : '#475569'}
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <text x="240" y="165" fill="#86efac" fontSize="9" textAnchor="end">fast resume</text>

        {/* INACTIVE to IDLE */}
        <motion.path
          d="M 260 220 Q 180 250 100 160"
          fill="none"
          stroke={currentState === RRCState.IDLE ? '#ef4444' : '#475569'}
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <text x="140" y="230" fill="#94a3b8" fontSize="9" textAnchor="middle">long_inactivity</text>

        {/* State Nodes */}
        {/* IDLE Node */}
        <g>
          <motion.circle
            cx="80"
            cy="120"
            r="40"
            fill={STATE_COLORS[RRCState.IDLE].bg}
            animate={{
              scale: currentState === RRCState.IDLE ? [1, 1.05, 1] : 1,
              boxShadow: currentState === RRCState.IDLE ? `0 0 30px ${STATE_COLORS[RRCState.IDLE].glow}` : 'none',
            }}
            transition={{ repeat: currentState === RRCState.IDLE ? Infinity : 0, duration: 2 }}
          />
          {currentState === RRCState.IDLE && (
            <motion.circle
              cx="80"
              cy="120"
              r="48"
              fill="none"
              stroke={STATE_COLORS[RRCState.IDLE].glow}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.8, 0], scale: [1, 1.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
          <text x="80" y="115" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">RRC</text>
          <text x="80" y="130" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">IDLE</text>
        </g>

        {/* CONNECTED Node */}
        <g>
          <motion.circle
            cx="320"
            cy="100"
            r="45"
            fill={STATE_COLORS[RRCState.CONNECTED].bg}
            animate={{
              scale: currentState === RRCState.CONNECTED ? [1, 1.05, 1] : 1,
            }}
            transition={{ repeat: currentState === RRCState.CONNECTED ? Infinity : 0, duration: 1 }}
          />
          {currentState === RRCState.CONNECTED && (
            <motion.circle
              cx="320"
              cy="100"
              r="55"
              fill="none"
              stroke={STATE_COLORS[RRCState.CONNECTED].glow}
              strokeWidth="3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [1, 0], scale: [1, 1.4] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}
          <text x="320" y="95" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">RRC</text>
          <text x="320" y="110" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">CONNECTED</text>
        </g>

        {/* INACTIVE Node */}
        <g>
          <motion.circle
            cx="320"
            cy="220"
            r="42"
            fill={STATE_COLORS[RRCState.INACTIVE].bg}
            animate={{
              scale: currentState === RRCState.INACTIVE ? [1, 1.05, 1] : 1,
            }}
            transition={{ repeat: currentState === RRCState.INACTIVE ? Infinity : 0, duration: 1.5 }}
          />
          {currentState === RRCState.INACTIVE && (
            <motion.circle
              cx="320"
              cy="220"
              r="52"
              fill="none"
              stroke={STATE_COLORS[RRCState.INACTIVE].glow}
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.8, 0], scale: [1, 1.3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}
          <text x="320" y="215" fill="black" fontSize="12" fontWeight="bold" textAnchor="middle">RRC</text>
          <text x="320" y="230" fill="black" fontSize="12" fontWeight="bold" textAnchor="middle">INACTIVE</text>
        </g>

        {/* Arrows */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>

      {/* State Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3"
        >
          <p className="text-sm text-slate-300">
            <span className="font-semibold" style={{ color: STATE_COLORS[currentState].glow }}>
              Current State:
            </span>{' '}
            {STATE_DESCRIPTIONS[currentState]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
