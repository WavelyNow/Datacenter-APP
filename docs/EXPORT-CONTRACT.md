# Contract export documente

## PDF

Endpoint: `POST /api/generate-pdf`
Sursă: `src/lib/pdf/types.ts` și `src/lib/pdf/templates/`.

Raportul de comandă are trei pagini, în această ordine:

1. amplasament și datele proiectului;
2. cantitate de țeavă, volum și greutate;
3. listă de cumpărat: fluid, țeavă și fitinguri.

Payload-ul include proiectul, segmentele, echipamentele, fluidul, marja de siguranță, brandingul și fitingurile. Serverul validează limitele de bază înainte de randare.

Previzualizarea și descărcarea folosesc același endpoint. Nu există momentan configurare manuală a secțiunilor PDF.

## Excel

Exportul Excel este generat client-side din același model de proiect și nu schimbă starea proiectului. Conține foile:

1. `Sumar` — datele proiectului și indicatorii principali;
2. `Calcul glicol` — calcul pe fiecare segment (`π/4 × (ID/1000)² × lungime × 1000`), glicol pur echivalent în țevi, apă echivalentă, echipamente, fitinguri, marjă și rotunjirea la canistre de 10 L;
3. `Listă cantități` — lungimile nete și brute de țeavă;
4. `Echipamente` — inventarul echipamentelor;
5. `Configurație` — specificațiile suporților.

În foaia `Calcul glicol`, formulele sunt formule Excel cu rezultate pre-completate, astfel încât documentul rămâne lizibil și imediat după descărcare. „Soluție de umplere / cumpărat” reprezintă volumul total al amestecului; „Glicol pur echivalent” reprezintă componenta de glicol la concentrația aleasă.

## Regula de compatibilitate

Orice modificare a structurii `PdfData`, `ProjectLoadData` sau a ordinii paginilor trebuie însoțită de actualizarea acestui document și a testului de export.
