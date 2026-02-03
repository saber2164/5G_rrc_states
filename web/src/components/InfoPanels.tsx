'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EventLog } from '@/lib/rrc-engine';
import { Info, BookOpen, Lightbulb, ChevronRight } from 'lucide-react';

interface EventLogPanelProps {
  events: EventLog[];
}

export function EventLogPanel({ events }: EventLogPanelProps) {
  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Info className="w-5 h-5" />
        Event Log
      </h3>
      <div className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence>
          {recentEvents.map((event, index) => (
            <motion.div
              key={`${event.timestamp}-${event.message}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-2 p-2 bg-slate-700/30 rounded-lg"
            >
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-500">
                  [{event.timestamp.toFixed(2)}s]
                </span>
                <p className="text-sm text-slate-300">{event.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            Start the simulation to see events
          </p>
        )}
      </div>
    </div>
  );
}

export function LearningPanel() {
  const concepts = [
    {
      title: 'RRC States',
      icon: '📡',
      content: 'The Radio Resource Control (RRC) protocol manages the connection between a device (UE) and the 5G network. It defines three states: IDLE, CONNECTED, and INACTIVE.',
    },
    {
      title: 'Energy Efficiency',
      icon: '⚡',
      content: 'Devices consume different amounts of power in each state. IDLE uses minimal power, CONNECTED uses full power for active data transfer, and INACTIVE balances quick resume with lower power.',
    },
    {
      title: 'Adaptive Timers',
      icon: '⏱️',
      content: 'Different traffic profiles (IoT vs Streaming) use different inactivity timer thresholds to optimize for their specific use cases.',
    },
    {
      title: 'Fast Resume',
      icon: '🚀',
      content: 'The INACTIVE state enables fast connection resume without full connection setup, reducing latency for intermittent data transfers.',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-400" />
        Learning Center
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, index) => (
          <motion.div
            key={concept.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{concept.icon}</span>
              <h4 className="font-medium text-white">{concept.title}</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{concept.content}</p>
          </motion.div>
        ))}
      </div>

      {/* 3GPP Compliance Badge */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-white">3GPP Compliant</p>
            <p className="text-xs text-slate-400">Based on TS 38.331 specifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileComparison() {
  const profiles = [
    {
      name: 'IoT Burst',
      icon: '📱',
      color: 'from-blue-600 to-cyan-600',
      connToInact: '200ms',
      inactToIdle: '5s',
      bestFor: 'Sensors, M2M, periodic updates',
      energySaving: 'Highest',
    },
    {
      name: 'Streaming',
      icon: '🎬',
      color: 'from-purple-600 to-pink-600',
      connToInact: '10s',
      inactToIdle: '20s',
      bestFor: 'Video, audio, downloads',
      energySaving: 'Moderate',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Profile Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${profile.color} bg-opacity-20`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{profile.icon}</span>
              <h4 className="font-semibold text-white">{profile.name}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">CONN → INACT:</span>
                <span className="text-white font-medium">{profile.connToInact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">INACT → IDLE:</span>
                <span className="text-white font-medium">{profile.inactToIdle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Energy Saving:</span>
                <span className="text-green-400 font-medium">{profile.energySaving}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-600">
                Best for: {profile.bestFor}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
