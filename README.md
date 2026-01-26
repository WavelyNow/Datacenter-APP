# Datacenter - Engineering Suite

## Overview
Datacenter APP is a specialized engineering suite designed for calculating, managing, and generating technical reports for hydraulic cooling systems in data centers.

## Key Features

### 🔧 Core Functionality
- **Hydraulic Calculations**: Glycol volume, pressure drop, flow rate calculations
- **Pipe Management**: Catalog of standard pipe sizes with real hydraulic properties
- **Equipment Inventory**: Manage chillers, CRAH, CDUs with weight/volume tracking
- **Support Dimensioning**: Calculate pipe support requirements (Mupro-verified)

### 📊 Advanced Tools
- **BIM Integration**: IFC model upload and pipe extraction
- **Cost Estimation**: Material and labor cost calculations
- **Energy Analysis**: Thermal load and sustainability metrics
- **Commissioning Checklist**: Pre-startup verification tool

### 📤 Export & Reports
- **PDF Reports**: Professional multi-page technical reports
- **Excel Export**: Bill of Quantities spreadsheet export
- **Project Save/Load**: JSON project files with cloud sync

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + K` | Open Command Palette |
| `⌘/Ctrl + S` | Save Project |
| `⌘/Ctrl + E` | Export Report |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + ⇧ + Z` | Redo |
| `?` | Show Shortcuts Help |

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **PDF**: html2canvas + jsPDF / Puppeteer
- **State**: React Context with History (undo/redo)
- **Animations**: Framer Motion

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   └── bim/         # BIM-specific components
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
│   ├── bim/        # IFC parsing logic
│   └── excel/      # Excel generation
└── types/           # TypeScript types
```

## Accessibility
- Skip-to-content link
- ARIA landmarks on navigation
- Focus trap in modals
- Keyboard navigation support

## License
Private / Proprietary
