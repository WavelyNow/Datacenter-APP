# Agent B — State Management & Persistence Audit Fixes

Branch: `fix/deep-audit` · Date: 2026-08-21

All 16 verified bugs addressed within ownership (`src/context/*`, `src/hooks/*`, `src/app/page.tsx`, `src/lib/types.ts`, `src/lib/supabase.ts`, plus README.md). No files outside ownership were modified.

---

## Fixes

### 1. CRITICAL — Project never persisted (WRONG storage key)
- **Files:** `src/context/ProjectContext.tsx`, `src/app/page.tsx`
- ProjectContext now **owns** persistence:
  - Exported single shared constant `PROJECT_STORAGE_KEY = 'hydraulic_calc_project_v2'` (used for both read and write; nothing else references the dead `datacenter_autosave` key anymore).
  - New debounced persist effect (400 ms) writes the full `ProjectDataState` to localStorage on change, **skipped while `isInitialized === false`** so the initial load is never overwritten with defaults.
  - `beforeunload` flush (via a `latestStateRef`) so the last debounce window is never lost on refresh/close.
- page.tsx: the `datacenter_autosave` writer effect was **removed** entirely (it was also `JSON.stringify`-ing on every keystroke — bug 15 handled by removal + context debounce).
- Initial load still uses `reset()` + merge over defaults; `loadFromStorage` returns the persistable shape and validates the parsed value is an object.

### 2. CRITICAL — Cloud save/load dropped fields
- **Files:** `src/lib/types.ts`, `src/context/ProjectContext.tsx`
- `ProjectLoadData` extended with `safetyMarginPercentage`, `supportConfig`, `branding`, `boqItems`.
- New shared `buildProjectLoadData()` builds the complete payload used by **both** insert and update paths in `saveToCloud`.
- New shared pure helper `applyProjectData(base, data)` with the merge semantics:
  - present + valid ⇒ full replace for `segments` / `equipmentList` / `projectDetails` / `fluidType` / primitives (`glycolPercentage`, `safetyMargin`, `safetyMarginPercentage`), spread-merge for `supportConfig` / `branding`, replace for `boqItems` when array;
  - `ifcModelUrl` uses `hasOwnProperty` + null-handling (JSON `null` = explicit “none”, missing key = keep local);
  - **missing field (absent key or JSON null) ⇒ keeps local/base value** — local `boqItems` / `supportConfig` are never destroyed by an older cloud payload.
- `loadFromCloud` now uses `applyProjectData(state, projectData)` over the current state + `cloudProjectId: data.id`, instead of the uncompensated `{...defaultState, ...projectData}` reset.

### 3. CRITICAL — supabase null double-cast
- **File:** `src/lib/supabase.ts`
- Typing is now honest: `export const supabase: SupabaseClient | null`, created only when both env vars are set.
- Guards (meaningful errors instead of crashes) added in:
  - `ProjectContext.saveToCloud` / `loadFromCloud`: `throw new Error('Cloud disabled — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars')`.
  - `useLibrary.fetchItems` / `addItem` / `deleteItem`: same meaning message (surfaced through existing `error` state / thrown errors).
- **⚠ NOTE for other agents:** `src/components/CloudBrowserAction.tsx` (line 22) and `src/components/BimPage.tsx` (lines 126, 132) still access `supabase` unguarded — `tsc` now flags them (TS18047). They are outside my ownership; they need the same `if (!supabase) throw` guard.

### 4. CRITICAL — RoomPrep deletions never persisted
- **File:** `src/context/RoomPrepContext.tsx`
- The `rooms.length > 0` guard was removed. Persistence now always writes (including `[]`), gated only on post-hydration `isInitialized`, debounced 400 ms (needed because rooms now update on every mutation — see bug 6).

### 5. CRITICAL — Keyboard handler: dead redo + input hijack
- **File:** `src/app/page.tsx`
- The inline `window` keydown handler was replaced with the already-correct `src/hooks/useKeyboardShortcuts.ts` + `createStandardShortcuts` (wire-up is the only place the hook was dead code; it now lives).
- Fixes: redo via `Ctrl+Shift+Z` works (hook lowercases keys via `event.key.toLowerCase()`); shortcuts are skipped when target is `INPUT` / `TEXTAREA` / `SELECT` / `contentEditable` (except Escape), so `Cmd+Z` no longer hijacks native undo inside text fields. `Cmd+S` / `Cmd+E` / `?` behavior preserved.
- `saveProject` export file now also includes `branding`, `boqItems`, `ifcModelUrl` (round-trip parity with import).

### 6. MAJOR — RoomPrep currentRoom drift / stale completion
- **File:** `src/context/RoomPrepContext.tsx`
- Minimal-risk approach chosen: **sync `currentRoom` into `rooms` on every mutation** via an effect that maps the updated room (with freshly computed `calculateCompletionPercentage`) into `rooms` whenever `currentRoom` identity changes. Effect deps are `[currentRoom]` only, so no render loop (rooms updates do not retrigger it).
- `completionPercentage` is no longer stale: the context exposes a **derived** `currentRoom` (live `calculateCompletionPercentage`), identity-stable when completion already matches (avoids extra re-renders). The `rooms` array entries also carry fresh percentages via the sync effect.
- `saveRoom` kept as-is (it additionally stamps `updatedAt`); it remains fully redundant-safe with the sync.

### 7. MAJOR — Hydration mismatch (Preferences + RoomPrep)
- **Files:** `src/context/PreferencesContext.tsx`, `src/context/RoomPrepContext.tsx`
- Both providers now use the mounted-gate pattern: initial state = defaults (identical on server and first client render); `useEffect` after mount reads localStorage, applies, then sets `isInitialized`. Save effects are gated on `isInitialized` so hydration never gets overwritten by defaults.
- `RoomPrepContext` exposes additive `isInitialized: boolean` for consumers.

### 8. MAJOR — useHistory unbounded snapshots
- **File:** `src/hooks/useHistory.ts`
- `HISTORY_LIMIT = 50` caps the `past` stack (`slice(-HISTORY_LIMIT)`) and the `future` stack. Coalescing not implemented (audit allowed cap-only).
- **README.md** line 50 corrected: “React Context with in-memory Undo/Redo history (capped, not persisted) + localStorage autosave” — the README previously claimed “History Persistence”.

### 9. MAJOR — Export/import asymmetry
- **Files:** `src/app/page.tsx`, `src/context/ProjectContext.tsx`
- Save payload now includes `supportConfig`, `safetyMarginPercentage`, `branding`, `boqItems`, `ifcModelUrl` (previously lost on export).
- Load (both the Sidebar file input and the Header `onLoadProject` path) now calls the new additive context action `importProjectData(data)`:
  - full document replace over defaults (`applyProjectData(defaultState, data)`) — restores `supportConfig` + `safetyMarginPercentage` (+ `branding`, `boqItems`, `ifcModelUrl` if present) and **resets fields absent from older files to defaults**;
  - validation: non-object documents and non-array `segments` / `equipmentList` throw meaningful errors, surfaced via the existing `alert('Eroare la încărcarea fișierului.')` handlers.

### 10. MAJOR — Cloud save race / offline
- **File:** `src/context/ProjectContext.tsx`
- `cloudSaveInFlightRef` (useRef) guards double-invocation → second call throws `'A cloud save is already in progress.'` instead of inserting duplicate rows; ref released in `finally`.
- `navigator.onLine` checked before any request; offline ⇒ `'Offline — connect to the internet before saving to the cloud.'`.
- Note: the save button is already disabled during save by `CloudBrowserAction`'s local `saving` state (component-owned); the guard makes it bullet-proof against double invoke regardless of UI state.

### 11. MAJOR — useLibrary fetch race
- **File:** `src/hooks/useLibrary.ts`
- `requestSeqRef` sequence token: every `fetchItems` call captures a token; stale responses (superseded call or unmount) are ignored before `setItems` / `setError` / `setLoading`. The effect cleanup increments the token, so no setState after unmount. Refreshes still work.

### 12. MINOR — Memoize context values
- **Files:** `src/context/BimContext.tsx`, `src/context/UIContext.tsx` — both context values wrapped in `useMemo` with correct deps.

### 13. MINOR — resetPreferences re-save race
- **File:** `src/context/PreferencesContext.tsx`
- `resetPreferences` now sets a `skipNextSaveRef` flag (consumed by the next save effect, with a `setTimeout(0)` safety net), so removing the key is not immediately undone by the save effect.

### 14. MINOR — Project date refresh
- **File:** `src/context/ProjectContext.tsx`
- Defaults' date is computed per provider mount (fine). `applyProjectData` now fills a missing `date` with today’s date when loading/importing project details from older files (old export files lack the date).
- **Not fixable within ownership:** applying a template from the Dashboard “New Project” wizard (`TemplateSelector`) merges the template `projectDetails` over existing details, which retains the old `date` — the merge happens in `src/components/TemplateSelector.tsx` (component-owned). If desired, a component-side fix (`{ date: today, ...templateDetails }`) is needed there, or a `resetProject()` action in the context could be wired.

### 15. MINOR — JSON.stringify on every keystroke
- **File:** `src/app/page.tsx` — the per-keystroke autosave writer is gone; ProjectContext debounces (400 ms) the single serialization.

### 16. Tests
- No existing test directly tests page.tsx autosave or ProjectContext internals (ProjectContext is mocked in `src/__tests__/mocks/mockProjectContext.ts`), so `src/__tests__` was left untouched.

---

## Extra hardening included
- `loadFromStorage` validates the parsed payload is an object (corrupt JSON falls back to defaults gracefully).
- Context value of `ProjectContext` keeps existing `useMemo`; new `importProjectData` added to it (additive; no public prop contract changed — page.tsx props unchanged).

## Verification
- `npx tsc --noEmit`: **zero errors in owned files**.
- `npx jest`: **15 suites / 205 tests passing**.
- Remaining `tsc` errors (outside ownership, pre-existing or parallel-agent in-flight):
  - `src/components/BimPage.tsx` (126, 132) and `src/components/CloudBrowserAction.tsx` (22): need `if (!supabase)` guards after the honest typing (bug 3).
  - `src/lib/calculations/specAssistant.ts`: pre-existing/other-agent in-flight errors (`PIPE_STANDARDS` reference, etc.) — file not in my ownership.
- Note: the working tree at the time of verification also contained parallel agents’ uncommitted changes in `src/lib/calculations/*`; `git stash` was used once for a baseline check and everything was immediately restored (`stash pop`) — no work lost.
