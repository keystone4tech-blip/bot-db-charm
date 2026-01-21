import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Points as ThreePoints } from "three";
import * as THREE from "three";

interface ParticleFieldProps {
  className?: string;
  count?: number;
  color?: string;
  speed?: number;
}

function Field({ count, color, speed }: Required<Pick<ParticleFieldProps, "count" | "color" | "speed">>) {
  const points = useRef<ThreePoints>(null);
  const { mouse } = useThree();

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() - 0.5) * 6;
      positions[i3 + 1] = (Math.random() - 0.5) * 6;
      positions[i3 + 2] = (Math.random() - 0.5) * 6;

      velocities[i3 + 0] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    return { positions, velocities };
  }, [count]);

  useFrame((_state, delta) => {
    const obj = points.current;
    if (!obj) return;

    const geom = obj.geometry as THREE.BufferGeometry;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 0] += velocities[i3 + 0] * delta * 60 * speed;
      positions[i3 + 1] += velocities[i3 + 1] * delta * 60 * speed;
      positions[i3 + 2] += velocities[i3 + 2] * delta * 60 * speed;

      if (positions[i3 + 0] > 3) positions[i3 + 0] = -3;
      if (positions[i3 + 0] < -3) positions[i3 + 0] = 3;
      if (positions[i3 + 1] > 3) positions[i3 + 1] = -3;
      if (positions[i3 + 1] < -3) positions[i3 + 1] = 3;
      if (positions[i3 + 2] > 3) positions[i3 + 2] = -3;
      if (positions[i3 + 2] < -3) positions[i3 + 2] = 3;
    }

    attr.needsUpdate = true;

    obj.rotation.y = mouse.x * 0.35;
    obj.rotation.x = -mouse.y * 0.25;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleField({ className, count = 420, color = "#D4A574", speed = 0.75 }: ParticleFieldProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(Boolean(media?.matches));
    update();
    media?.addEventListener?.("change", update);
    return () => media?.removeEventListener?.("change", update);
  }, []);

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3], fov: 70 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Field count={count} color={color} speed={reducedMotion ? 0 : speed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
