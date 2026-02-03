// Comparative study data embedded for client-side visualization
export const comparativeStudyData = {
  summary: {
    totalTests: 250,
    configurations: ['Static_1s', 'Static_5s', 'Static_10s', 'Adaptive_IoT', 'Adaptive_Streaming'],
    categories: ['IoT', 'Streaming', 'Web', 'Mixed', 'Edge'],
    keyFinding: 'Adaptive_IoT achieved 36-76% energy savings vs. static timers'
  },
  
  energyByConfig: [
    { config: 'Adaptive_IoT', avgEnergy: 1139971, color: '#22c55e' },
    { config: 'Static_1s', avgEnergy: 1789175, color: '#3b82f6' },
    { config: 'Static_5s', avgEnergy: 3044195, color: '#f59e0b' },
    { config: 'Static_10s', avgEnergy: 3575310, color: '#ef4444' },
    { config: 'Adaptive_Streaming', avgEnergy: 3575310, color: '#8b5cf6' },
  ],

  stateDistribution: [
    { config: 'Adaptive_IoT', idle: 45, connected: 25, inactive: 30 },
    { config: 'Static_1s', idle: 0, connected: 60, inactive: 40 },
    { config: 'Static_5s', idle: 0, connected: 100, inactive: 0 },
    { config: 'Static_10s', idle: 0, connected: 100, inactive: 0 },
    { config: 'Adaptive_Streaming', idle: 0, connected: 100, inactive: 0 },
  ],

  energyByCategory: [
    { category: 'IoT', Adaptive_IoT: 1200000, Static_1s: 2500000, Static_5s: 3000000 },
    { category: 'Streaming', Adaptive_IoT: 2800000, Static_1s: 2900000, Static_5s: 3000000 },
    { category: 'Web', Adaptive_IoT: 1500000, Static_1s: 2200000, Static_5s: 2800000 },
    { category: 'Mixed', Adaptive_IoT: 1800000, Static_1s: 2400000, Static_5s: 2900000 },
    { category: 'Edge', Adaptive_IoT: 800000, Static_1s: 1500000, Static_5s: 2500000 },
  ],

  transitionCounts: [
    { config: 'Adaptive_IoT', avgTransitions: 85 },
    { config: 'Static_1s', avgTransitions: 45 },
    { config: 'Static_5s', avgTransitions: 12 },
    { config: 'Static_10s', avgTransitions: 6 },
    { config: 'Adaptive_Streaming', avgTransitions: 6 },
  ],

  recommendations: [
    {
      scenario: 'IoT/Sensor Devices',
      recommended: 'Adaptive_IoT',
      reason: 'Frequent short bursts benefit from quick transitions to low-power states',
      energySaving: '76%'
    },
    {
      scenario: 'Video Streaming',
      recommended: 'Adaptive_Streaming',
      reason: 'Long continuous sessions need stable connection without frequent state changes',
      energySaving: '5%'
    },
    {
      scenario: 'Web Browsing',
      recommended: 'Static_1s',
      reason: 'Moderate activity with variable pauses, balance between responsiveness and power',
      energySaving: '36%'
    },
    {
      scenario: 'Mixed Usage',
      recommended: 'Adaptive_IoT',
      reason: 'Adaptive approach handles varying traffic patterns efficiently',
      energySaving: '45%'
    }
  ]
};
