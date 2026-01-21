import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";

interface VPNServer3DProps {
  className?: string;
  status?: "online" | "offline";
}

function ServerModel({ status }: { status: "online" | "offline" }) {
  const group = useRef<Group>(null);
  const pulse = useRef<Mesh>(null);

  const isOnline = status === "online";
  const color = isOnline ? new THREE.Color("#22C55E") : new THREE.Color("#EF4444");

  const lines = useMemo(
    () => [
      [
        [0, 0.65, 0],
        [1.4, 1.0, -0.6],
      ],
      [
        [0, 0.65, 0],
        [-1.1, 0.9, 0.7],
      ],
      [
        [0, 0.65, 0],
        [0.2, 1.3, 1.2],
      ],
    ],
    [],
  );

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.22;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }

    if (pulse.current) {
      const t = state.clock.elapsedTime;
      const s = isOnline ? 1 + Math.sin(t * 3.2) * 0.08 : 0.92 + Math.sin(t * 2.4) * 0.05;
      pulse.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <cylinderGeometry args={[0.55, 0.62, 1.35, 24, 1]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.72, 0.02, 8, 64]} />
        <meshStandardMaterial color="#D4A574" emissive="#D4A574" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[0, 0.65, 0]} ref={pulse}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>

      {lines.map((points) => (
        <Line
          key={points.flat().join(",")}
          points={points as any}
          color={isOnline ? "#D4A574" : "#64748B"}
          lineWidth={1}
          opacity={isOnline ? 0.55 : 0.25}
          transparent
          dashed
          dashSize={0.2}
          gapSize={0.15}
        />
      ))}

      <mesh position={[1.4, 1.0, -0.6]}>
        <sphereGeometry args={[0.08, 14, 14]} />
        <meshStandardMaterial color="#D4A574" emissive="#D4A574" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-1.1, 0.9, 0.7]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial color="#D4A574" emissive="#D4A574" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.2, 1.3, 1.2]}>
        <sphereGeometry args={[0.06, 14, 14]} />
        <meshStandardMaterial color="#D4A574" emissive="#D4A574" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

export function VPNServer3D({ className, status = "online" }: VPNServer3DProps) {
  const dpr = useMemo(() => (typeof window === "undefined" ? 1 : Math.min(1.5, window.devicePixelRatio || 1)), []);

  return (
    <div className={className} aria-hidden>
      <Canvas dpr={dpr} camera={{ position: [0, 0.6, 3.2], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 2.5, 2.5]} intensity={1.25} />
        <pointLight position={[-2.5, -1.2, 2.2]} intensity={0.75} color="#D4A574" />
        <Suspense fallback={null}>
          <ServerModel status={status} />
        </Suspense>
      </Canvas>
    </div>
  );
}
