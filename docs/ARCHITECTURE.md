# Datacenter APP — arhitectură actuală

Status: 4 septembrie 2026. Acest document descrie ce face codul acum, nu o arhitectură dorită pentru viitor.

## Fluxul aplicației

`src/app/page.tsx` este singura pagină a aplicației și compune shell-ul:

`ProjectProvider` → `UIProvider` → `Sidebar` + `Header` + conținutul tab-ului activ.

`ProjectContext` este sursa comună pentru datele proiectului: detalii, segmente, echipamente, fluid, fitinguri, branding și lista de materiale. Tot aici sunt undo/redo, persistarea locală, importul JSON și integrarea opțională cu Supabase.

`UIContext` ține doar starea de interfață: tab-ul activ, sub-tab-ul de conducte, unealta hidraulică și elementul evidențiat.

## Limite de modul

- `src/lib/calculations/` conține funcții de calcul reutilizabile și este cea mai sigură zonă pentru modificări locale.
- `src/lib/pdf/` și `src/lib/excel/` conțin generatoarele de documente.
- `src/components/` conține interfața; componentele folosesc contextul proiectului pentru scrierea datelor.
- `src/app/page.tsx`, `ProjectContext.tsx`, `src/lib/types.ts` și import/export sunt puncte de legătură cu impact larg.

## Persistență și fișiere

- Proiectul local este salvat sub cheia `hydraulic_calc_project_v2`.
- Fișierele JSON folosesc versiunea `1`; fișierele vechi fără versiune rămân acceptate.
- Importul local acceptă fișiere de cel mult 25 MB.
- Importul înlocuiește proiectul curent după validarea transportului; câmpurile lipsă sunt completate cu valori implicite.
- Autosave-ul folosește preferința `autoSaveInterval`; valoarea `0` înseamnă salvare automată dezactivată. Butonul Save face și salvare locală, și export JSON.
- URL-urile `blob:` pentru modele GLB locale sunt temporare și nu supraviețuiesc unui refresh.
- Cloud sync este cod opțional, în afara scope-ului aplicației locale; nu îl folosim ca bază pentru fluxurile de lucru.

## Regula pentru modificări

O modificare este locală dacă păstrează contractul de intrare/ieșire al modulului. Pentru schimbări în starea proiectului, schema JSON sau cloud trebuie verificate simultan persistarea locală, importul, exportul, PDF/Excel și consumatorii UI.

## Limitări cunoscute

- Aplicația folosește o singură rută și ține navigarea în memorie.
- Managementul proiectelor locale (listă, Save As, duplicare) nu există încă.
- Supabase este o bibliotecă comună fără autentificare; folosirea în mai multe conturi necesită reguli de acces și identitate.
- Unele preferințe de interfață rămân stocate, dar nu sunt aplicate în toate componentele.
