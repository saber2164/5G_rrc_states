# Vercel Deployment Guide

## Step-by-Step Instructions

### 1. Go to Vercel
Visit [https://vercel.com/new](https://vercel.com/new)

### 2. Import Repository
- Click **"Add New..."** → **"Project"**
- Select **"Import Git Repository"**
- Choose `saber2164/5G_rrc_states` from your GitHub repos
- Click **"Import"**

### 3. Configure Project Settings

**IMPORTANT: Set Root Directory**

In the "Configure Project" screen, you'll see several sections:

1. **Build and Output Settings**
   - Framework Preset: **Next.js** (should auto-detect)

2. **Root Directory** ← THIS IS WHERE YOU CHANGE IT
   - Click **"Edit"** button next to "Root Directory"
   - Enter: `web`
   - Click **"Continue"**

3. **Environment Variables**
   - Leave empty (none needed)

### 4. Deploy
- Click **"Deploy"**
- Wait ~2-3 minutes for build

### 5. Access Your Site
Once deployed, Vercel will give you:
- Production URL: `https://your-project-name.vercel.app`
- Share this with students!

---

## Screenshot Guide

**Where to find Root Directory setting:**

```
┌─────────────────────────────────────────────────┐
│ Configure Project                               │
├─────────────────────────────────────────────────┤
│                                                 │
│ Build and Output Settings                      │
│ ┌─────────────────────────────────────────┐   │
│ │ Framework Preset: Next.js        ▼      │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Root Directory                          [Edit] │ ← Click here
│ ┌─────────────────────────────────────────┐   │
│ │ ./                                      │   │
│ │                                         │   │
│ │ Change to: web                          │   │ ← Type "web"
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Build Command                                  │
│ ┌─────────────────────────────────────────┐   │
│ │ npm run build                           │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Output Directory                               │
│ ┌─────────────────────────────────────────┐   │
│ │ .next                                   │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│              [Deploy] ←────────────────────────┤ Click when done
└─────────────────────────────────────────────────┘
```

---

## Alternative: Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to web directory
cd web

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? 5g-rrc-simulator
# - In which directory is your code located? ./
# - Want to override settings? No

# Deploy to production
vercel --prod
```

---

## Troubleshooting

### Build fails with "Cannot find module"
- Make sure Root Directory is set to `web`
- Check that all dependencies are in `web/package.json`

### 404 on deployment
- Verify Root Directory is `web` not `./web` or `/web`

### Build succeeds but site is blank
- Check browser console for errors
- Verify all imports use correct paths with `@/` alias

---

## After Deployment

Your site will be live at:
- **Production**: `https://5g-rrc-simulator.vercel.app`

Features available:
- ✅ Interactive state machine simulation
- ✅ Real-time animations
- ✅ Comparative study at `/study`
- ✅ Mobile responsive
- ✅ Auto-deployment on git push

Share the link with students! 🎓
