
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { IFCLoader } from 'web-ifc-three';

interface IfcViewerProps {
    fileUrl: string;
    onLoaded?: () => void;
    className?: string; // Allow custom styling
}

const Model = ({ fileUrl, onLoaded }: IfcViewerProps) => {
    const { scene } = useThree();
    const [model, setModel] = useState<THREE.Group | null>(null);

    useEffect(() => {
        if (!fileUrl) return;

        const ifcLoader = new IFCLoader();
        // Use absolute path with origin to ensure correct loading from public/ folder
        ifcLoader.ifcManager.setWasmPath('/wasm/');

        // Optimizations to prevent infinite loops on complex geometry
        ifcLoader.ifcManager.applyWebIfcConfig({
            COORDINATE_TO_ORIGIN: false,
            // @ts-ignore -- properties exist in web-ifc but missing in web-ifc-three types
            USE_FAST_BOOLS: true
        });

        ifcLoader.load(
            fileUrl,
            (ifcModel) => {
                // Center model if needed manually, or rely on camera controls
                if (ifcModel.geometry.boundingBox) {
                    // Optional: log bounding box to debug
                    console.log('Model loaded. Bounding box:', ifcModel.geometry.boundingBox);
                }

                // Style settings - Make pipes look metallic
                if (ifcModel.material) {
                    // IfcLoader creates a multi-material usually, but we can override or traverse
                    ifcModel.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            const mesh = child as THREE.Mesh;
                            mesh.material = new THREE.MeshStandardMaterial({
                                color: 0xcccccc,
                                roughness: 0.3,
                                metalness: 0.8
                            });
                        }
                    });
                }

                setModel(ifcModel as unknown as THREE.Group);
                scene.add(ifcModel);
                if (onLoaded) onLoaded();
            },
            (progress) => {
                // console.log('Loading progress:', progress);
            },
            (error) => {
                console.error('IFC Loading Error:', error);
            }
        );

        return () => {
            if (model) {
                scene.remove(model);
                // Clean up geometry/materials to avoid leaks
                model.traverse((obj) => {
                    if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
                    if ((obj as THREE.Mesh).material) {
                        if (Array.isArray((obj as THREE.Mesh).material)) {
                            ((obj as THREE.Mesh).material as THREE.Material[]).forEach(m => m.dispose());
                        } else {
                            ((obj as THREE.Mesh).material as THREE.Material).dispose();
                        }
                    }
                });
            }
        };
    }, [fileUrl, scene]);

    return null; // The loader adds to scene directly
};

export const IfcViewer: React.FC<IfcViewerProps> = ({ fileUrl, onLoaded, className }) => {
    return (
        <div className={`bg-zinc-900 rounded-xl overflow-hidden relative shadow-inner border border-zinc-800 ${className || 'w-full h-[500px]'}`}>
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white px-3 py-1 rounded text-xs font-mono border border-white/10">
                3D Preview • Use Mouse to Orbit
            </div>

            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
                <color attach="background" args={['#111']} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Environment */}
                <Grid infiniteGrid sectionColor="#333" cellColor="#222" fadeDistance={30} />
                <Environment preset="city" />
                <OrbitControls makeDefault />

                {/* The IFC Model */}
                <Model fileUrl={fileUrl} onLoaded={onLoaded} />
            </Canvas>
        </div>
    );
};
