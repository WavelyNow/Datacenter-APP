# 🌐 Datacenter - Engineering Suite 2026

Aplicație local-first pentru instalații de răcire în datacentere: dimensionare țevi, calcule hidraulice, glicol și rapoarte Excel/PDF.

## 🎯 Scop principal

**Aflarea diametrelor de țeavă corecte și a cantității de glicol necesare** pentru sisteme de răcire datacenter — cu date de producători **verificate** (nu inventate).

---

## 🧭 Aplicația (după optimizare)

### Navigație (sidebar minimal, focus pe scop)
- **Dimensionare Conducte** — segmentele de țeavă, diametre, debite, căderi de presiune
- **Standarde Țevi** — pagina dedicată cu tabele **editabile** ale producătorilor:
  GF COOL-FIT 2.0/4.0 (broșuri oficiale 2026), Uponor PE-Xa (certificat KIWA),
  Pipelife RO, Valrom RO — diametre, grosimi, Ø interior, greutăți, Ø izolat
- **Hidraulică** — calcule hidraulice (Darcy-Weisbach), pompă, vană, vas expansiune
- **Suporți / Greutăți** — calcul suporturi, sarcini, profile metalice
- **Galerie BIM 3D** — 70+ modele **verificate** Sketchfab (Vertiv, Schneider,
  generatoare, containere, țevi/fittinguri, chillere) + **import GLB/GLTF** propriu
  (ex. modele GF de pe cad.georgfischer.com)
- **Asistent Specificații** — extragere pe bază de reguli din Caietul de Sarcini
- **Normative** — registry cu integritate testată
- Export rapoarte PDF/Excel și persistență locală a proiectului

Documentație tehnică: [arhitectură](docs/ARCHITECTURE.md), [contract export](docs/EXPORT-CONTRACT.md), [status funcțional](docs/FEATURE-STATUS.md).

### Eliminate
Mapare IFC, Pregătire Cameră, Sustenabilitate, Estimator Costuri, Cantități (BoQ),
Punere în Funcțiune, Librărie Tehnică — componentă moartă ștearsă.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack) + React 19 + React Compiler
- **Style**: TailwindCSS 4 — temă Apple-minimal (un singur accent, fără culori țipătoare)
- **3D**: Three.js / react-three-fiber (doar în galerie — lazy-loaded)
- **Persistence**: localStorage (proiect, standarde țevi); fluxul principal este local
- **Testing**: 293 teste Jest (inclusiv integritate date: țevi, normative, geometrie)

---

## 🚀 Dev & Deploy

```bash
npm install
npm run dev        # localhost:3000
npm test           # 293 teste
npm run build      # producție
```

Deploy automat pe Vercel la push pe `main`.

---

_Designed for datacenter engineers — date verificate, nu presupuse._
