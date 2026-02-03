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
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Control Panel</h3>

      {/* Traffic Profile Selection */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Traffic Profile</label>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSetProfile('IoT')}
            disabled={isRunning}
            className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
              profile === 'IoT'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Wifi className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">IoT Burst</div>
              <div className="text-xs opacity-75">200ms → 5s</div>
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSetProfile('Streaming')}
            disabled={isRunning}
            className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
              profile === 'Streaming'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Radio className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Streaming</div>
              <div className="text-xs opacity-75">10s → 20s</div>
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
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
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
          className="p-4 rounded-xl font-semibold bg-slate-600 hover:bg-slate-500 text-white flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          RESET
        </motion.button>
      </div>

      {/* Event Triggers */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Trigger Events</label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSendData}
            disabled={!isRunning}
            className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
              isRunning
                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
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
            className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
              isRunning
                ? 'bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
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
            <span className="text-slate-400">Inactivity Timer</span>
            <span className="text-slate-300">
              {(inactivityTimer / 1000).toFixed(1)}s / {(inactivityThreshold / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${inactivityProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">CONNECTED → INACTIVE transition</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Long Inactivity Timer</span>
            <span className="text-slate-300">
              {(longInactivityTimer / 1000).toFixed(1)}s / {(longInactivityThreshold / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${longInactivityProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">INACTIVE → IDLE transition</p>
        </div>
      </div>
    </div>
  );
}
