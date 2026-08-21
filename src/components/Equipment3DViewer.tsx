'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, OrbitControls } from '@react-three/drei';
import { Cuboid, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from './ui/ErrorBoundary';

/** Boundary local: un model 3D defect nu poate dobori intreaga aplicatie. */
function ModelBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    // Clone scene to avoid mutation issues if reused
    const sceneClone = React.useMemo(() => scene.clone(), [scene]);
    return <primitive object={sceneClone} />;
}

interface Equipment3DViewerProps {
    modelUrl: string;
    className?: string;
}

export default function Equipment3DViewer({ modelUrl, className }: Equipment3DViewerProps) {
    if (!modelUrl) return null;

    return (
        <div className={`relative w-full h-[300px] md:h-[400px] bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl ${className}`}>
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-xs font-medium text-white/90 border border-white/10">
                <Cuboid className="w-4 h-4 text-blue-400" />
                <span>Interactive BIM View</span>
            </div>

            <ErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-white/70 text-xs gap-2"><AlertTriangle className="w-4 h-4" /> Model indisponibil</div>}>
                <Canvas dpr={[1, 2]} shadows camera={{ fov: 50, position: [0, 0, 5] }} className="touch-none cursor-move">
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6} shadows>
                            <Model url={modelUrl} />
                        </Stage>
                    </Suspense>
                    <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                </Canvas>
            </ErrorBoundary>

            <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
                <p className="text-[10px] text-white/20 mb-2">Drag to rotate • Scroll to zoom</p>
            </div>
        </div>
    );
}
