'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { comparativeStudyData } from '@/lib/study-data';
import { ArrowLeft, TrendingDown, Zap, BarChart3, Lightbulb, FlaskConical, Settings, Grid3X3, Leaf } from 'lucide-react';

export default function StudyPage() {
  const { summary, energyByConfig, stateDistribution, energyByCategory, recommendations } = comparativeStudyData;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Header */}
      <header className="border-b border-secondary/20 bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-secondary hover:text-text transition-colors">
                <ArrowLeft className="w-5 h-5" />
                Back to Simulator
              </Link>
            </div>
            <h1 className="text-xl font-bold text-text">Comparative Study Results</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-text mb-4">
            Static vs. Adaptive Timer Analysis
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Comprehensive study of {summary.totalTests} tests across {summary.categories.length} traffic categories
            comparing {summary.configurations.length} timer configurations.
          </p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 inline-block bg-primary rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-10 h-10 text-background" />
              <div className="text-left">
                <p className="text-background/80 text-sm">Key Finding</p>
                <p className="text-2xl font-bold text-background">{summary.keyFinding}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Energy by Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-6 border border-secondary/10"
          >
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Average Energy by Configuration
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyByConfig} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#A3AD9E30" />
                  <XAxis type="number" stroke="#A3AD9E" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="config" stroke="#A3AD9E" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#232621', border: '1px solid #A3AD9E30', borderRadius: '8px' }}
                    labelStyle={{ color: '#E2E3DE' }}
                  />
                  <Bar dataKey="avgEnergy" radius={[0, 4, 4, 0]}>
                    {energyByConfig.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* State Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl p-6 border border-secondary/10"
          >
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              State Time Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#A3AD9E30" />
                  <XAxis dataKey="config" stroke="#A3AD9E" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#A3AD9E" />
                  <Tooltip contentStyle={{ backgroundColor: '#232621', border: '1px solid #A3AD9E30', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="idle" stackId="a" fill="#6B7280" name="IDLE" />
                  <Bar dataKey="connected" stackId="a" fill="#8DB580" name="CONNECTED" />
                  <Bar dataKey="inactive" stackId="a" fill="#E3B04B" name="INACTIVE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Energy by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl p-6 border border-secondary/10 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-text mb-4">Energy Consumption by Traffic Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#A3AD9E30" />
                  <XAxis dataKey="category" stroke="#A3AD9E" />
                  <YAxis stroke="#A3AD9E" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#232621', border: '1px solid #A3AD9E30', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Adaptive_IoT" fill="#8DB580" name="Adaptive IoT" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Static_1s" fill="#6B7280" name="Static 1s" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Static_5s" fill="#E3B04B" name="Static 5s" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-accent" />
            Configuration Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.scenario}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-surface rounded-xl p-6 border border-secondary/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-text">{rec.scenario}</h4>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {rec.energySaving} saved
                  </span>
                </div>
                <p className="text-sm text-secondary mb-3">{rec.reason}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">Recommended:</span>
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-sm font-medium">
                    {rec.recommended}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Tests', value: '250', icon: FlaskConical },
            { label: 'Configurations', value: '5', icon: Settings },
            { label: 'Categories', value: '5', icon: Grid3X3 },
            { label: 'Max Energy Saved', value: '76%', icon: Leaf },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface rounded-xl p-4 text-center border border-secondary/10"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-text">{stat.value}</div>
              <div className="text-sm text-secondary">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 text-center text-secondary text-sm border-t border-secondary/20 pt-8">
          <p>Data from comparative_study.py - 50 scenarios x 5 configurations</p>
          <Link href="/" className="text-primary hover:text-primary/80 mt-2 inline-block">
            Return to Interactive Simulator
          </Link>
        </footer>
      </main>
    </div>
  );
}
