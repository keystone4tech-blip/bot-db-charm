import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Mesh } from "three";

import { cn } from "@/lib/utils";

interface ProfileAvatar3DProps {
  url?: string;
  className?: string;
}

function AvatarOrb({ url }: { url?: string }) {
  const mesh = useRef<Mesh>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(Boolean(media?.matches));
    update();
    media?.addEventListener?.("change", update);
    return () => media?.removeEventListener?.("change", update);
  }, []);

  const texture = useTexture(
    url ??
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2K0AAAAASUVORK5CYII=",
  ) as any;

  useFrame((_state, delta) => {
    if (!mesh.current || reducedMotion) return;
    mesh.current.rotation.y += delta * 0.7;
    mesh.current.rotation.x += delta * 0.25;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.72, 48, 48]} />
      {url ? (
        <meshStandardMaterial map={texture} metalness={0.15} roughness={0.75} />
      ) : (
        <meshStandardMaterial color="#D4A574" emissive="#D4A574" emissiveIntensity={0.18} metalness={0.55} roughness={0.2} />
      )}
    </mesh>
  );
}

export const ProfileAvatar3D = ({ url, className }: ProfileAvatar3DProps) => {
  const dpr = useMemo(() => (typeof window === "undefined" ? 1 : Math.min(1.5, window.devicePixelRatio || 1)), []);

  return (
    <div className={cn("relative h-20 w-20 overflow-hidden rounded-2xl", className)}>
      <div className="absolute inset-0 rounded-2xl bg-[var(--gradient-gold)] opacity-30 blur-xl" />
      <div className="absolute inset-0 rounded-2xl border border-border/60 bg-background/20 backdrop-blur-sm" />
      <div className="absolute inset-[1px] overflow-hidden rounded-[15px]">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 2.4], fov: 52 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[2.5, 2, 3]} intensity={1.1} />
          <Suspense fallback={null}>
            <AvatarOrb url={url} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default ProfileAvatar3D;