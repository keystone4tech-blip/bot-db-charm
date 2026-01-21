import { motion } from "framer-motion";
import { Copy, Edit3, User } from "lucide-react";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { Mesh } from "three";

import { ParticleField } from "@/components/3d/ParticleField";
import { LightRays } from "@/components/3d/LightRays";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TelegramUser } from "@/hooks/useTelegram";

interface ProfileHeaderProps {
  profile: any; // UserProfile
  telegramUser: TelegramUser | null;
  onEditClick: (() => void) | null;
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

function ProfileAvatar3D({ url, className }: { url?: string; className?: string }) {
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
}

export const ProfileHeader = ({ profile, telegramUser, onEditClick }: ProfileHeaderProps) => {
  const fullName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}`
    : "Неизвестный пользователь";
  const username = profile?.telegram_username || telegramUser?.username || "Не указан";
  const avatarUrl: string | undefined = profile?.avatar_url || telegramUser?.photo_url;

  const handleCopyReferralLink = () => {
    if (!profile?.referral_code) return;
    const referralLink = `https://t.me/Keystone_Tech_bot?start=${profile.referral_code}`;
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-[var(--gradient-dark)] p-6 shadow-card"
    >
      <ParticleField className="pointer-events-none absolute inset-0 opacity-[0.28]" count={220} speed={0.65} />
      <LightRays className="pointer-events-none absolute inset-0" intensity={0.85} />
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="relative z-10 flex items-center gap-4">
        <ProfileAvatar3D url={avatarUrl} />

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight truncate">{fullName}</h2>
          <p className="text-sm text-muted-foreground truncate">@{username}</p>

          {profile?.referral_code ? (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-[var(--gradient-gold)] px-3 py-1 text-xs font-semibold text-white shadow-card-gold">
                Реф. код: {profile.referral_code}
              </span>
              <Button variant="outline" size="sm" onClick={handleCopyReferralLink} className="h-8">
                <Copy className="h-4 w-4" />
                Скопировать
              </Button>
            </div>
          ) : null}
        </div>

        {onEditClick ? (
          <Button variant="outline" size="icon" onClick={onEditClick} className="shrink-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary/30 flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
