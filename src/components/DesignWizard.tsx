'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Info, Wand2, Snowflake, Building2, Droplets, LayoutList, FileText } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { useUI } from '@/context/UIContext';
import { toast } from 'sonner';
import {
    WizardConfig,
    WizardResult,
    buildFromWizard,
} from '@/lib/calculations/designFlow';

/**
 * ASISTENT DE DIMENSIONARE — te întreabă în ordinea corectă de inginerie
 * și generează întregul proiect (segmente + echipamente + fittinguri).
 * Fiecare pas are explicația — gândit pentru interni.
 */

const STEPS = [
    { id: 'project', label: 'Proiect', icon: Wand2 },
    { id: 'load', label: 'Sarcina & ΔT', icon: Snowflake },
    { id: 'chillers', label: 'Chillere', icon: Snowflake },
    { id: 'crah', label: 'Unități interioare', icon: Building2 },
    { id: 'topology', label: 'Topologie & lungimi', icon: LayoutList },
    { id: 'fluid', label: 'Fluid & protecție', icon: Droplets },
    { id: 'review', label: 'Rezumat & generare', icon: FileText },
];

const inputCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-foreground';
const lbl = 'block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1';

export const DesignWizard: React.FC = () => {
    const {
        projectDetails, setProjectDetails,
        setSegments, setEquipmentList,
        setGlycolPercentage, setFluidType,
        setFittingItems, setBoqItems,
    } = useProject();
    const { setActiveTab } = useUI();

    const [step, setStep] = useState(0);

    // Config state
    const [cfg, setCfg] = useState<WizardConfig>({
        projectName: '',
        location: '',
        totalLoadKw: 300,
        deltaTK: 7,
        chillerInstalled: 2,
        chillerActive: 1,
        chillerCapacityKwEach: 320,
        chillerFlowDatasheet: null as number | null,
        crahInstalled: 4,
        crahActive: 3,
        crahFlowDatasheet: null as number | null,
        lenExtMainsM: 20,
        lenExtRingM: 80,
        lenIntMainsM: 15,
        lenIntRingM: 60,
        lenBranchM: 10,
        fluidType: 'propylene',
        glycolPercentage: 30,
        minTempProtect: -25,
        material: 'steel_light',
    });

    const set = <K extends keyof WizardConfig>(key: K, value: WizardConfig[K]) =>
        setCfg(prev => ({ ...prev, [key]: value }));

    const result: WizardResult = React.useMemo(() => buildFromWizard(cfg), [cfg]);

    const handleGenerate = () => {
        const r = result;

        const segs = r.segments.map(sg => ({
            ...sg,
            id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        const eqs = r.equipment.map(eq => ({
            ...eq,
            id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));
        const fits = r.fittingItems.map(f => ({
            ...f,
            id: `fit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        }));

        setSegments(segs);
        setEquipmentList(eqs);
        setFittingItems(fits);
        setBoqItems([]);
        setGlycolPercentage(cfg.glycolPercentage);
        setFluidType(cfg.fluidType);
        setProjectDetails({
            ...projectDetails,
            projectName: cfg.projectName || 'Proiect nou',
            location: cfg.location || '',
        });

        toast.success('Proiect generat! Vezi segmentele în Dimensionare Conducte.');
        setActiveTab('config');
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Asistent de dimensionare</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                    Răspunzi la câteva întrebări simple și aplicația construiește întregul calcul hidraulic —
                    debite, diametre, glicol, fittinguri. Fiecare pas explică ce se calculează și de ce.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <button
                            onClick={() => setStep(i)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                                step === i
                                    ? 'bg-primary/10 text-primary border border-primary/30'
                                    : i < step
                                        ? 'text-emerald-600 hover:bg-muted'
                                        : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                step === i ? 'bg-primary text-primary-foreground' :
                                i < step ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}>
                                {i < step ? '✓' : i + 1}
                            </span>
                            <span className="text-xs font-semibold">{s.label}</span>
                        </button>
                        {i < STEPS.length - 1 && <Chevron className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* ===== PASUL curent ===== */}
                    {step === 0 && (
                        <StepCard title="Pasul 1 — Proiectul" hint="Datele apar pe prima pagină a raportului de comandă.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Denumirea proiectului</label>
                                    <input className={inputCls} placeholder="ex. DC Cluj — Sala A"
                                        value={cfg.projectName}
                                        onChange={e => set('projectName', e.target.value)} />
                                </div>
                                <div>
                                    <label className={lbl}>Locația site-ului</label>
                                    <input className={inputCls} placeholder="ex. București, Str. Fabrica 12"
                                        value={cfg.location}
                                        onChange={e => set('location', e.target.value)} />
                                </div>
                            </div>
                            <InfoBox>
                                Aici definim cine primește raportul și unde este site-ul. Toate datele se regăsesc automat în PDF-ul de comandă.
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 1 && (
                        <StepCard title="Pasul 2 — Sarcina termică & ΔT" hint="Debitul total se calculează automat din putere și diferența de temperatură.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Putere de răcire necesară (kW)</label>
                                    <input type="number" min={1} className={inputCls} value={cfg.totalLoadKw}
                                        onChange={e => set('totalLoadKw', parseFloat(e.target.value) || 0)} />
                                    <p className="text-[11px] text-muted-foreground mt-1">Sarcina IT reală a sălii (suma consumului rack-urilor).</p>
                                </div>
                                <div>
                                    <label className={lbl}>ΔT tur–retur (K)</label>
                                    <input type="number" min={1} max={20} className={inputCls} value={cfg.deltaTK}
                                        onChange={e => set('deltaTK', parseFloat(e.target.value) || 7)} />
                                    <p className="text-[11px] text-muted-foreground mt-1">Tipic CHW: 6–8 K. Valoarea exactă vine din fișele CRAH/chiller.</p>
                                </div>
                            </div>

                            <ResultRow label="Debit total sistem" value={`${result.totalFlowM3H.toFixed(1)} m³/h`} big />

                            <InfoBox title="De ce e important ΔT?">
                                Debitul scade proporțional cu ΔT: un ΔT mai mare = țevi mai mici + pompă mai mică + energie mai puțin.
                                ΔT prea mare însă → serpentinele nu pot prelua căldura eficient. Standard: proiectezi la 6–8 K.
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 2 && (
                        <StepCard title="Pasul 3 — Chillerele" hint="Redundanța se alege în funcție de Tier-ul dorit: N (fără rezervă), N+1 (o unitate rezervă), 2N (dublare completă).">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className={lbl}>Chillere instalate</label>
                                    <input type="number" min={1} max={8} className={inputCls} value={cfg.chillerInstalled}
                                        onChange={e => set('chillerInstalled', parseInt(e.target.value) || 1)} />
                                </div>
                                <div>
                                    <label className={lbl}>Lucrează simultan (N)</label>
                                    <input type="number" min={1} className={inputCls} value={cfg.chillerActive}
                                        onChange={e => set('chillerActive', Math.max(1, parseInt(e.target.value) || 1))} />
                                </div>
                                <div>
                                    <label className={lbl}>Capacitate per chiller (kW)</label>
                                    <input type="number" min={1} className={inputCls} value={cfg.chillerCapacityKwEach}
                                        onChange={e => set('chillerCapacityKwEach', parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Debit per chiller din fișa tehnică (m³/h) — opțional</label>
                                    <input type="number" min={0} step={0.1} className={inputCls} placeholder="lasă gol pentru calcul automat"
                                        value={cfg.chillerFlowDatasheet ?? ''}
                                        onChange={e => set('chillerFlowDatasheet', e.target.value ? parseFloat(e.target.value) : null)} />
                                    <p className="text-[11px] text-muted-foreground mt-1">Dacă ai fișa tehnică, introdu debitul nominal declarat — are prioritate față de calcul.</p>
                                </div>
                            </div>

                            <ResultRow label="Debit per chiller" value={`${result.chillerFlowM3H.toFixed(1)} m³/h`} />

                            <InfoBox title="Cum aleg redundanța?">
                                N+1 = pentru sarcina de 300 kW instalezi chillere care împreună au ≥ 400 kW capacitate, dar lucrează simultan doar atâtea cât să acopere 300 kW.
                                2N = dublare completă (orice chiller poate lua totul singur). Cu cât redundanța crește, debitul PER UNITATE scade (mai multe unități împart același debit total).
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 3 && (
                        <StepCard title="Pasul 4 — Unități interioare (CRAH)" hint="La fel ca la chillere: instalate vs. active simultan. Fișa tehnică a CRAH-ului conține debitul nominal.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className={lbl}>CRAH-uri instalate</label>
                                    <input type="number" min={1} max={20} className={inputCls} value={cfg.crahInstalled}
                                        onChange={e => set('crahInstalled', parseInt(e.target.value) || 1)} />
                                </div>
                                <div>
                                    <label className={lbl}>Active simultan</label>
                                    <input type="number" min={1} className={inputCls} value={cfg.crahActive}
                                        onChange={e => set('crahActive', Math.max(1, parseInt(e.target.value) || 1))} />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Debit per CRAH din fișa tehnică (m³/h) — opțional</label>
                                <input type="number" min={0} step={0.1} className={inputCls} placeholder="lasă gol pentru calcul automat"
                                    value={cfg.crahFlowDatasheet ?? ''}
                                    onChange={e => set('crahFlowDatasheet', e.target.value ? parseFloat(e.target.value) : null)} />
                            </div>

                            <ResultRow label="Debit per CRAH" value={`${result.crahFlowM3H.toFixed(1)} m³/h`} />

                            <InfoBox title="Regula N+1 la CRAH-uri">
                                Exemplu: sarcină 300 kW cu CRAH-uri de 100 kW → ai nevoie de minim 3 active. Instalezi 4 (N+1): dacă unul cade, celelalte 3 preiau toată sarcina.
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 4 && (
                        <StepCard title="Pasul 5 — Topologie & lungimi" hint="Tur + retur se generează automat pentru ambele inele, iar debitul cumulat se calculează automat per tronson.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <NumberField label="Alimentare chillere → inel ext. (m)" value={cfg.lenExtMainsM} onChange={v => set('lenExtMainsM', v)} />
                                <NumberField label="Inel exterior (m)" value={cfg.lenExtRingM} onChange={v => set('lenExtRingM', v)} />
                                <NumberField label="Pompe → inel interior (m)" value={cfg.lenIntMainsM} onChange={v => set('lenIntMainsM', v)} />
                                <NumberField label="Inel interior (m)" value={cfg.lenIntRingM} onChange={v => set('lenIntRingM', v)} />
                                <NumberField label="Ramură către fiecare CRAH (m)" value={cfg.lenBranchM} onChange={v => set('lenBranchM', v)} />
                                <div>
                                    <label className={lbl}>Material conducte</label>
                                    <select className={inputCls} value={cfg.material}
                                        onChange={e => set('material', e.target.value)}>
                                        {['steel_light', 'steel_medium', 'steel_heavy', 'ppr_pn20', 'pehd_sdr17', 'gf_coolfit_2_0', 'gf_coolfit_4_0'].map(k => (
                                            <option key={k} value={k}>{PIPE_LABELS[k] ?? k}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <ResultRow label="Segmente generate" value={`${result.segments.length} tronsoane (tur+retur incluse)`} />

                            <InfoBox title="Ce se generează automat?">
                                Inel exterior tur+retur → alimentarea spre inelul interior → inel interior tur+retur → o ramură per CRAH.
                                Debitul fiecărui tronson este deja cel corect (cumulat spre sursă), iar diametrul este cel recomandat pentru viteza ≤ 2,5 m/s.
                                Poți ajusta orice după generare în tabelul „Dimensionare Conducte”.
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 5 && (
                        <StepCard title="Pasul 6 — Fluid & protecție anticongelare" hint="Aplicația recomandă concentrația minimă care protejează până la temperatura cerută (+3°C marjă practică).">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={lbl}>Tip fluid</label>
                                    <select className={inputCls} value={cfg.fluidType}
                                        onChange={e => set('fluidType', e.target.value as WizardConfig['fluidType'])}>
                                        <option value="propylene">Propilen Glicol (food-safe)</option>
                                        <option value="ethylene">Etilen Glicol (industrial)</option>
                                        <option value="water">Apă pură</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Concentrație (% volum)</label>
                                    <input type="number" min={0} max={60} className={inputCls} value={cfg.glycolPercentage}
                                        onChange={e => set('glycolPercentage', parseInt(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <label className={lbl}>Temp. minimă de protecție (°C)</label>
                                    <input type="number" min={-50} max={5} className={inputCls} value={cfg.minTempProtect}
                                        onChange={e => set('minTempProtect', parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>

                            {cfg.fluidType !== 'water' && (
                                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                                    result.recommendedGlycolPercent === null
                                        ? 'bg-amber-500/10 text-amber-600'
                                        : result.recommendedGlycolPercent > cfg.glycolPercentage
                                            ? 'bg-primary/5 border border-primary/20 text-foreground'
                                            : 'bg-emerald-500/10 text-emerald-700'
                                }`}>
                                    {result.recommendedGlycolPercent === null
                                        ? `⚠️ Nici 60% ${cfg.fluidType === 'propylene' ? 'propilen' : 'etilen'}-glicol nu protejează până la ${cfg.minTempProtect}°C. Consideră trasare termică sau încălzire de sprijin.`
                                        : result.recommendedGlycolPercent > cfg.glycolPercentage
                                            ? `⚠️ Concentrația ta (${cfg.glycolPercentage}%) NU protejează până la ${cfg.minTempProtect}°C. Minim recomandat: ${result.recommendedGlycolPercent}%.`
                                            : `✓ Concentrația de ${cfg.glycolPercentage}% protejează până la ${cfg.minTempProtect}°C.`}
                                </div>
                            )}

                            <InfoBox title="Propilen vs Etilen?">
                                Propilen-glicol = non-toxic, obligatoriu dacă apa poate intra în contact cu apa potabilă sau în spații cu personal. Etilen-glicol = toxic, dar proprietăți termice puțin mai bune. Ambele cresc vascozitatea → pompe puțin mai mari decât pe apă pură.
                            </InfoBox>
                        </StepCard>
                    )}

                    {step === 6 && (
                        <StepCard title="Rezumat — tot ce se va genera" hint="Verifică totul înainte de a apăsa Generare.">
                            <div className="space-y-3">
                                <SummaryBlock title="1. Sistem" rows={[
                                    ['Proiect', cfg.projectName || '—'],
                                    ['Locație', cfg.location || '—'],
                                    ['Sarcină / ΔT', `${cfg.totalLoadKw} kW @ ${cfg.deltaTK} K`],
                                    ['Debit total', `${result.totalFlowM3H.toFixed(1)} m³/h`],
                                ]} />
                                <SummaryBlock title="2. Chillere" rows={[
                                    ['Instalate / Active', `${cfg.chillerInstalled} / ${cfg.chillerActive}`],
                                    ['Capacitate each', `${cfg.chillerCapacityKwEach} kW`],
                                    ['Debit per chiller', `${result.chillerFlowM3H.toFixed(1)} m³/h`],
                                ]} />
                                <SummaryBlock title="3. Unități interioare" rows={[
                                    ['Instalate / Active', `${cfg.crahInstalled} / ${cfg.crahActive}`],
                                    ['Debit per CRAH', `${result.crahFlowM3H.toFixed(1)} m³/h`],
                                ]} />
                                <SummaryBlock title="4. Fluid" rows={[
                                    ['Tip', cfg.fluidType === 'propylene' ? 'Propilen Glicol' : cfg.fluidType === 'ethylene' ? 'Etilen Glicol' : 'Apă'],
                                    ['Concentrație', `${cfg.glycolPercentage}% vol`],
                                    ['Marja siguranta', 'se configurează în proiect (0–20%)'],
                                ]} />
                                <SummaryBlock title="5. Se generează" rows={[
                                    ['Segmentele de teavă', `${result.segments.length} buc (debite cumulate corect)`],
                                    ['Echipamente', `${result.equipment.length} buc (chillere + CRAH-uri)`],
                                    ['Fittinguri estimate', `${result.fittingItems.reduce((s, f) => s + f.quantity, 0)} buc`],
                                ]} />
                            </div>
                        </StepCard>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    className="btn btn-secondary btn-md disabled:opacity-40">
                    <ArrowLeft className="w-4 h-4" /> Înapoi
                </button>

                <span className="text-xs text-muted-foreground font-mono">
                    Pasul {step + 1} din {STEPS.length}
                </span>

                {step < STEPS.length - 1 ? (
                    <button onClick={() => setStep(s => s + 1)}
                        disabled={step === 6}
                        className="btn btn-primary btn-md gap-2">
                        Continuă <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={handleGenerate} className="btn btn-primary btn-md gap-2">
                        <Check className="w-4 h-4" /> Generează proiectul
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Sub-components ---

function StepCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
            {hint && <p className="text-sm text-muted-foreground mb-6">{hint}</p>}
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function InfoBox({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
            <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                    {title && <p className="font-bold text-foreground">{title}</p>}
                    {children}
                </div>
            </div>
        </div>
    );
}

function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }) {
    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 ${big ? 'py-4' : ''}`}>
            <span className="text-sm font-medium">{label}</span>
            <span className={`font-mono font-bold ${big ? 'text-xl' : ''} text-primary`}>{value}</span>
        </div>
    );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div>
            <label className={lbl}>{label}</label>
            <input type="number" min={0} className={inputCls} value={value || 0}
                onChange={e => onChange(parseFloat(e.target.value) || 0)} />
        </div>
    );
}

function SummaryBlock({ title, rows }: { title: string; rows: [string, string][] }) {
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
            <div className="divide-y divide-border/40">
                {rows.map(([l, v], idx) => (
                    <div key={idx} className="px-4 py-2 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{l}</span>
                        <span className="font-mono font-semibold text-sm">{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Chevron(props: React.ComponentProps<'svg'>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M9 18l6-6-6-6" /></svg>;
}

// helper folosit de select-ul de materiale
export const PIPE_LABELS: Record<string, string> = {
    steel_light: 'Oțel - Ușoară',
    steel_medium: 'Oțel - Medie',
    steel_heavy: 'Oțel - Grea',
    ppr_pn20: 'PPR PN20',
    pehd_sdr17: 'PEHD SDR17',
    gf_coolfit_2_0: 'GF COOL-FIT 2.0',
    gf_coolfit_4_0: 'GF COOL-FIT 4.0',
};
