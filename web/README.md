# 5G NR RRC Simulator - Web Application

An interactive visual learning platform for understanding 5G NR Radio Resource Control (RRC) state machine behavior.

##  Features

 **Interactive State Machine**
- Animated SVG visualization of RRC states (IDLE, CONNECTED, INACTIVE)
- Real-time state transitions with glowing effects
- 3GPP TS 38.331 compliant

 **Real-Time Simulation**
- Browser-based simulation engine (TypeScript port)
- Adjustable traffic profiles (IoT Burst vs Streaming)
- Live energy consumption tracking

 **Visualizations**
- State timeline charts
- Energy consumption graphs  
- Time distribution analysis

 **Educational Content**
- Learning modules explaining each state
- Profile comparisons
- Comparative study results page

##  Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

##  Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

##  Deploy to Vercel

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `web`
4. Deploy!

Or use Vercel CLI:

```bash
npm i -g vercel
cd web
vercel
```

##  Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main simulator page
│   │   ├── study/page.tsx    # Comparative study results
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── StateMachineDiagram.tsx  # Animated state diagram
│   │   ├── StateIndicators.tsx      # State lights & metrics
│   │   ├── ControlPanel.tsx         # Simulation controls
│   │   ├── SimulationCharts.tsx     # Real-time charts
│   │   └── InfoPanels.tsx           # Learning content
│   ├── hooks/
│   │   └── useSimulation.ts  # Simulation state hook
│   └── lib/
│       ├── rrc-engine.ts     # TypeScript simulation engine
│       └── study-data.ts     # Comparative study data
├── vercel.json               # Vercel config
└── package.json
```


##  Pages

- **/** - Interactive simulator with real-time visualization
- **/study** - Comparative study results with charts

##  License

Educational/Research UseElectronics & Communication Engineer

