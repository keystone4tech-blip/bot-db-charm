import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

export type FloatingObjectShape = "box" | "sphere" | "torusKnot";

interface FloatingObjectProps {
  className?: string;
  shape?: FloatingObjectShape;
  color?: string;
  size?: number;
  speed?: number;
  glow?: number;
  "aria-label"?: string;
}

function RotatingMesh({ shape, color, size, speed, glow }: Required<Pick<FloatingObjectProps, "shape" | "color" | "size" | "speed" | "glow">>) {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.6;
    ref.current.rotation.y += delta * speed;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
  });

  return (
    <mesh ref={ref} scale={size}>
      {shape === "box" ? <boxGeometry args={[1, 1, 1, 2, 2, 2]} /> : null}
      {shape === "sphere" ? <sphereGeometry args={[0.72, 32, 32]} /> : null}
      {shape === "torusKnot" ? <torusKnotGeometry args={[0.5, 0.18, 120, 18]} /> : null}
      <meshStandardMaterial
        color={color}
        metalness={0.55}
        roughness={0.18}
        emissive={color}
        emissiveIntensity={glow}
      />
    </mesh>
  );
}

export function FloatingObject({
  className,
  shape = "torusKnot",
  color = "#D4A574",
  size = 1,
  speed = 0.9,
  glow = 0.4,
}: FloatingObjectProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(Boolean(media?.matches));
    update();
    media?.addEventListener?.("change", update);
    return () => media?.removeEventListener?.("change", update);
  }, []);

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const ratio = window.devicePixelRatio || 1;
    return Math.min(1.5, ratio);
  }, []);

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 3.1], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 2, 3]} intensity={1.15} />
        <pointLight position={[-2, -1.5, 2]} intensity={0.6} color={color} />
        <Suspense fallback={null}>
          <RotatingMesh shape={shape} color={color} size={size} speed={reducedMotion ? 0 : speed} glow={glow} />
        </Suspense>
      </Canvas>
    </div>
  );
}
