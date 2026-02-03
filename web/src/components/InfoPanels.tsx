'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EventLog } from '@/lib/rrc-engine';
import { Info, BookOpen, Lightbulb, ChevronRight, Radio, Zap, Clock, ArrowRightCircle } from 'lucide-react';

interface EventLogPanelProps {
  events: EventLog[];
}

export function EventLogPanel({ events }: EventLogPanelProps) {
  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
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
              className="flex items-start gap-2 p-2 bg-background rounded-lg border border-secondary/10"
            >
              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-secondary">
                  [{event.timestamp.toFixed(2)}s]
                </span>
                <p className="text-sm text-text">{event.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {events.length === 0 && (
          <p className="text-secondary text-sm text-center py-8">
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
      icon: Radio,
      content: 'The Radio Resource Control (RRC) protocol manages the connection between a device (UE) and the 5G network. It defines three states: IDLE, CONNECTED, and INACTIVE.',
    },
    {
      title: 'Energy Efficiency',
      icon: Zap,
      content: 'Devices consume different amounts of power in each state. IDLE uses minimal power, CONNECTED uses full power for active data transfer, and INACTIVE balances quick resume with lower power.',
    },
    {
      title: 'Adaptive Timers',
      icon: Clock,
      content: 'Different traffic profiles (IoT vs Streaming) use different inactivity timer thresholds to optimize for their specific use cases.',
    },
    {
      title: 'Fast Resume',
      icon: ArrowRightCircle,
      content: 'The INACTIVE state enables fast connection resume without full connection setup, reducing latency for intermittent data transfers.',
    },
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 border border-primary/20">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
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
            className="p-4 bg-background rounded-xl cursor-pointer hover:bg-background/80 transition-colors border border-secondary/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <concept.icon className="w-5 h-5 text-accent" />
              <h4 className="font-medium text-text">{concept.title}</h4>
            </div>
            <p className="text-sm text-secondary leading-relaxed">{concept.content}</p>
          </motion.div>
        ))}
      </div>

      {/* 3GPP Compliance Badge */}
      <div className="mt-6 p-4 bg-background rounded-xl border border-accent/30">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-accent" />
          <div>
            <p className="text-sm font-medium text-text">3GPP Compliant</p>
            <p className="text-xs text-secondary">Based on TS 38.331 specifications</p>
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
      icon: Radio,
      connToInact: '200ms',
      inactToIdle: '5s',
      bestFor: 'Sensors, M2M, periodic updates',
      energySaving: 'Highest',
    },
    {
      name: 'Streaming',
      icon: ArrowRightCircle,
      connToInact: '10s',
      inactToIdle: '20s',
      bestFor: 'Video, audio, downloads',
      energySaving: 'Moderate',
    },
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
      <h3 className="text-lg font-semibold text-text mb-4">Profile Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-background border border-secondary/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <profile.icon className="w-5 h-5 text-accent" />
              <h4 className="font-semibold text-text">{profile.name}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">CONN to INACT:</span>
                <span className="text-text font-medium">{profile.connToInact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">INACT to IDLE:</span>
                <span className="text-text font-medium">{profile.inactToIdle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Energy Saving:</span>
                <span className="text-primary font-medium">{profile.energySaving}</span>
              </div>
              <p className="text-xs text-secondary mt-2 pt-2 border-t border-secondary/20">
                Best for: {profile.bestFor}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
