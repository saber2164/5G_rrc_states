'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSimulation } from '@/hooks/useSimulation';
import { StateMachineDiagram } from '@/components/StateMachineDiagram';
import { StateIndicators } from '@/components/StateIndicators';
import { ControlPanel } from '@/components/ControlPanel';
import { SimulationCharts } from '@/components/SimulationCharts';
import { EventLogPanel, LearningPanel, ProfileComparison } from '@/components/InfoPanels';
import { RRCState } from '@/lib/rrc-engine';
import { Radio, Github, BookOpen, BarChart3 } from 'lucide-react';

export default function Home() {
  const {
    state,
    events,
    isRunning,
    start,
    stop,
    reset,
    sendData,
    triggerPaging,
    setProfile,
  } = useSimulation();

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Initializing simulation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">5G NR RRC Simulator</h1>
                <p className="text-sm text-slate-400">Interactive Learning Platform</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/study"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-sm text-white transition-colors font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Study Results
              </Link>
              <a
                href="https://www.3gpp.org/specifications-technologies/releases-specifications/specifications-by-series"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                3GPP Specs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
              >
                <Github className="w-4 h-4" />
                Source
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - State Machine & Controls */}
          <div className="lg:col-span-2 space-y-6">
            <StateMachineDiagram
              currentState={state.state as RRCState}
              transitionCount={state.transitionCount}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimulationCharts
                history={state.history}
                stateDurations={state.stateDurations as Record<RRCState, number>}
                totalEnergy={state.totalEnergy}
              />
            </div>
          </div>

          {/* Right Column - Controls & Info */}
          <div className="space-y-6">
            <StateIndicators
              currentState={state.state as RRCState}
              simulationTime={state.simulationTime}
              totalEnergy={state.totalEnergy}
              transitionCount={state.transitionCount}
            />
            
            <ControlPanel
              isRunning={isRunning}
              profile={state.trafficProfile}
              onStart={start}
              onStop={stop}
              onReset={reset}
              onSendData={sendData}
              onTriggerPaging={triggerPaging}
              onSetProfile={setProfile}
              inactivityTimer={state.inactivityTimer}
              inactivityThreshold={state.inactivityThreshold}
              longInactivityTimer={state.longInactivityTimer}
              longInactivityThreshold={state.longInactivityThreshold}
            />

            <EventLogPanel events={events} />
          </div>
        </motion.div>

        {/* Bottom Section - Learning Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <LearningPanel />
          <ProfileComparison />
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
          <p>
            Built for educational purposes • Based on 3GPP TS 38.331 specifications
          </p>
          <p className="mt-2">
            5G NR RRC State Machine Simulation • Python port of MATLAB Simulink model
          </p>
        </footer>
      </main>
    </div>
  );
}
