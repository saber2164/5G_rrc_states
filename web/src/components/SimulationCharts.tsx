'use client';

import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts';
import { RRCState } from '@/lib/rrc-engine';

interface SimulationChartsProps {
  history: {
    time: number[];
    state: number[];
    dataRequest: number[];
  };
  stateDurations: Record<RRCState, number>;
  totalEnergy: number;
}

const STATE_COLORS = {
  [RRCState.IDLE]: '#6B7280',
  [RRCState.CONNECTED]: '#8DB580',
  [RRCState.INACTIVE]: '#E3B04B',
};

export function SimulationCharts({ history, stateDurations, totalEnergy }: SimulationChartsProps) {
  const chartData = useMemo(() => {
    if (!history.time.length) return [];
    
    // Downsample for performance
    const step = Math.max(1, Math.floor(history.time.length / 200));
    const data = [];
    
    for (let i = 0; i < history.time.length; i += step) {
      data.push({
        time: history.time[i],
        state: history.state[i],
        dataActivity: history.dataRequest[i],
        stateColor: STATE_COLORS[history.state[i] as RRCState],
      });
    }
    return data;
  }, [history]);

  const stateDistribution = useMemo(() => {
    const total = Object.values(stateDurations).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    
    return [
      { name: 'IDLE', value: stateDurations[RRCState.IDLE], percentage: (stateDurations[RRCState.IDLE] / total * 100).toFixed(1), fill: STATE_COLORS[RRCState.IDLE] },
      { name: 'CONNECTED', value: stateDurations[RRCState.CONNECTED], percentage: (stateDurations[RRCState.CONNECTED] / total * 100).toFixed(1), fill: STATE_COLORS[RRCState.CONNECTED] },
      { name: 'INACTIVE', value: stateDurations[RRCState.INACTIVE], percentage: (stateDurations[RRCState.INACTIVE] / total * 100).toFixed(1), fill: STATE_COLORS[RRCState.INACTIVE] },
    ];
  }, [stateDurations]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: number }) => {
    if (active && payload && payload.length) {
      const stateValue = payload.find(p => p.dataKey === 'state')?.value;
      const stateName = stateValue !== undefined ? ['IDLE', 'CONNECTED', 'INACTIVE'][stateValue] : '';
      
      return (
        <div className="bg-surface border border-secondary/20 rounded-lg p-3 shadow-xl">
          <p className="text-secondary text-sm">Time: {label?.toFixed(2)}s</p>
          <p className="text-text font-semibold">State: {stateName}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* State Timeline Chart */}
      <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
        <h3 className="text-lg font-semibold text-text mb-4">State Timeline</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#A3AD9E30" />
              <XAxis 
                dataKey="time" 
                stroke="#A3AD9E"
                tickFormatter={(value) => `${value.toFixed(1)}s`}
              />
              <YAxis 
                stroke="#A3AD9E"
                domain={[-0.5, 2.5]}
                ticks={[0, 1, 2]}
                tickFormatter={(value) => ['IDLE', 'CONN', 'INACT'][value] || ''}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="state"
                stroke="#8DB580"
                fill="url(#stateGradient)"
                strokeWidth={2}
              />
              <Bar dataKey="dataActivity" fill="#8DB580" opacity={0.5} />
              <defs>
                <linearGradient id="stateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8DB580" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8DB580" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Distribution */}
      <div className="bg-surface rounded-2xl p-6 border border-secondary/10">
        <h3 className="text-lg font-semibold text-text mb-4">Time Distribution</h3>
        <div className="space-y-3">
          {stateDistribution.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text">{item.name}</span>
                <span className="text-secondary">{item.percentage}%</span>
              </div>
              <div className="h-4 bg-background rounded-full overflow-hidden border border-secondary/10">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.fill,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Energy Summary */}
        <div className="mt-6 p-4 bg-background rounded-xl border border-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Total Energy Consumed</p>
              <p className="text-2xl font-bold text-text">{(totalEnergy / 1000).toFixed(2)}k units</p>
            </div>
            <div className="text-2xl text-accent font-bold">ENERGY</div>
          </div>
          <p className="text-xs text-secondary mt-2">
            Power: IDLE=0, INACTIVE=10, CONNECTED=100 units/tick
          </p>
        </div>
      </div>
    </div>
  );
}
