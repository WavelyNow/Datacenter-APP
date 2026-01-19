# Datacenter - Engineering Suite

## Overview
Datacenter APP is a specialized engineering suite designed for calculating, managing, and generating technical reports for hydraulic cooling systems in data centers.

## Key Features
- **Project Management**: Manage details for complex projects including location, beneficiaries, and design parameters.
- **Hydraulic Calculations**: 
    - Glycol volume calculation with customizable safety margins.
    - Automatic weight estimations for structural loading.
- **Equipment Management**:
    - Manage catalogs of pipes, profiles, and cooling equipment (chillers, CDUs, etc.).
    - Drag-and-drop support for equipment proofs and data sheets.
- **Visual Branding**:
    - Customizable themes for PDF reports.
    - Company logo and color scheme integration.
- **Report Generation**: Export detailed PDF technical reports ready for submission.

## Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: TailwindCSS 4, Lucide React
- **PDF Generation**: `pdf-lib` with Puppeteer for high-fidelity rendering
- **State Management**: React Context / Hooks

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## License
Private / Proprietary# Updated: Mon Jan 19 23:22:38 EET 2026
