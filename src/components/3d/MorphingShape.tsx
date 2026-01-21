import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import gsap from "gsap";
import type { Mesh } from "three";

interface MorphingShapeProps {
  className?: string;
  color?: string;
}

function Shape({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<React.ElementRef<typeof MeshDistortMaterial>>(null);

  useFrame((_state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.25;
    mesh.current.rotation.x += delta * 0.12;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "power2.inOut" } });
      tl.to(mesh.current?.scale || {}, { x: 1.08, y: 1.08, z: 1.08, duration: 1.6 });
      tl.to(mat.current || {}, { distort: 0.6, duration: 1.8 }, 0);
      tl.to(mat.current || {}, { speed: 1.6, duration: 1.8 }, 0);
    });

    return () => ctx.revert();
  }, []);

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1, 5]} />
      <MeshDistortMaterial ref={mat} color={color} metalness={0.35} roughness={0.1} distort={0.35} speed={1.1} />
    </mesh>
  );
}

export function MorphingShape({ className, color = "#D4A574" }: MorphingShapeProps) {
  const dpr = useMemo(() => (typeof window === "undefined" ? 1 : Math.min(1.5, window.devicePixelRatio || 1)), []);

  return (
    <div className={className} aria-hidden>
      <Canvas dpr={dpr} camera={{ position: [0, 0, 3.2], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[2.5, 2, 2.5]} intensity={1.2} />
        <pointLight position={[-2, -1.5, 2]} intensity={0.7} color={color} />
        <Suspense fallback={null}>
          <Shape color={color} />
        </Suspense>
      </Canvas>
    </div>
  );
}
