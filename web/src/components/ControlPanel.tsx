'use client';

import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Radio, Wifi, WifiOff } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  profile: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSendData: () => void;
  onTriggerPaging: () => void;
  onSetProfile: (profile: 'Streaming' | 'IoT') => void;
  inactivityTimer: number;
  inactivityThreshold: number;
  longInactivityTimer: number;
  longInactivityThreshold: number;
}

export function ControlPanel({
  isRunning,
  profile,
  onStart,
  onStop,
  onReset,
  onSendData,
  onTriggerPaging,
  onSetProfile,
  inactivityTimer,
  inactivityThreshold,
  longInactivityTimer,
  longInactivityThreshold,
}: ControlPanelProps) {
  const inactivityProgress = Math.min((inactivityTimer / inactivityThreshold) * 100, 100);
  const longInactivityProgress = Math.min((longInactivityTimer / longInactivityThreshold) * 100, 100);

  return (
    <div className="bg-surface rounded-2xl p-6 space-y-6 border border-secondary/10">
      <h3 className="text-lg font-semibold text-text">Control Panel</h3>

      {/* Traffic Profile Selection */}
      <div className="space-y-2">
        <label className="text-sm text-secondary">Traffic Profile</label>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSetProfile('IoT')}
            disabled={isRunning}
            className={`p-3 rounded-xl flex items-center gap-2 transition-all border ${
              profile === 'IoT'
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-background text-secondary border-secondary/20 hover:bg-surface'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Wifi className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">IoT Burst</div>
              <div className="text-xs opacity-75">200ms to 5s</div>
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSetProfile('Streaming')}
            disabled={isRunning}
            className={`p-3 rounded-xl flex items-center gap-2 transition-all border ${
              profile === 'Streaming'
                ? 'bg-accent/20 text-accent border-accent/30'
                : 'bg-background text-secondary border-secondary/20 hover:bg-surface'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Radio className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Streaming</div>
              <div className="text-xs opacity-75">10s to 20s</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={isRunning ? onStop : onStart}
          className={`p-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isRunning
              ? 'bg-gray-600 hover:bg-gray-500 text-text'
              : 'bg-primary hover:bg-primary/80 text-background'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              STOP
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              START
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="p-4 rounded-xl font-semibold bg-background hover:bg-surface text-text flex items-center justify-center gap-2 border border-secondary/20"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </motion.button>
      </div>

      {/* Event Triggers */}
      <div className="space-y-2">
        <label className="text-sm text-secondary">Trigger Events</label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSendData}
            disabled={!isRunning}
            className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all border ${
              isRunning
                ? 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/30'
                : 'bg-background text-secondary/50 cursor-not-allowed border-secondary/10'
            }`}
          >
            <Zap className="w-6 h-6" />
            <span className="font-medium">Send Data</span>
            <span className="text-xs opacity-75">100ms burst</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTriggerPaging}
            disabled={!isRunning}
            className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all border ${
              isRunning
                ? 'bg-accent/10 hover:bg-accent/20 text-accent border-accent/30'
                : 'bg-background text-secondary/50 cursor-not-allowed border-secondary/10'
            }`}
          >
            <WifiOff className="w-6 h-6" />
            <span className="font-medium">Paging</span>
            <span className="text-xs opacity-75">Network wake</span>
          </motion.button>
        </div>
      </div>

      {/* Timer Progress Bars */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-secondary">Inactivity Timer</span>
            <span className="text-text">
              {(inactivityTimer / 1000).toFixed(1)}s / {(inactivityThreshold / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="h-3 bg-background rounded-full overflow-hidden border border-secondary/10">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${inactivityProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-secondary mt-1">CONNECTED to INACTIVE transition</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-secondary">Long Inactivity Timer</span>
            <span className="text-text">
              {(longInactivityTimer / 1000).toFixed(1)}s / {(longInactivityThreshold / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="h-3 bg-background rounded-full overflow-hidden border border-secondary/10">
            <motion.div
              className="h-full bg-gray-500"
              initial={{ width: 0 }}
              animate={{ width: `${longInactivityProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-secondary mt-1">INACTIVE to IDLE transition</p>
        </div>
      </div>
    </div>
  );
}
