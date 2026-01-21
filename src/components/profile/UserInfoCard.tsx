import React from "react";
import { AtSign, Copy, Link as LinkIcon, Mail, MapPin, Phone, User } from "lucide-react";

import { ExtendedUserProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserInfoCardProps {
  profile: ExtendedUserProfile;
}

function InfoRow({
  icon,
  label,
  value,
  copyValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  copyValue?: string;
}) {
  const onCopy = () => {
    if (!copyValue) return;
    navigator.clipboard.writeText(copyValue);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/30 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-xl bg-secondary/40 flex items-center justify-center shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-sm font-semibold truncate">{value}</div>
        </div>
      </div>
      {copyValue ? (
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export const UserInfoCard = ({ profile }: UserInfoCardProps) => {
  const referralLink = profile.referral_code ? `https://t.me/Keystone_Tech_bot?start=${profile.referral_code}` : null;

  return (
    <Card className="rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Информация о пользователе
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="main">
          <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-secondary/40 p-1">
            <TabsTrigger value="main" className={cn("rounded-xl text-xs", "data-[state=active]:bg-background/50")}>Основное</TabsTrigger>
            <TabsTrigger value="contacts" className={cn("rounded-xl text-xs", "data-[state=active]:bg-background/50")}>Контакты</TabsTrigger>
            <TabsTrigger value="social" className={cn("rounded-xl text-xs", "data-[state=active]:bg-background/50")}>Соцсети</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-4 space-y-3">
            <InfoRow icon={<User className="h-4 w-4" />} label="Имя" value={`${profile.first_name || "—"}${profile.last_name ? ` ${profile.last_name}` : ""}`} />
            <InfoRow
              icon={<AtSign className="h-4 w-4" />}
              label="Никнейм"
              value={profile.telegram_username ? `@${profile.telegram_username}` : "не указан"}
              copyValue={profile.telegram_username ?? undefined}
            />
            <InfoRow
              icon={<Copy className="h-4 w-4" />}
              label="Реферальный код"
              value={profile.referral_code ?? "не создан"}
              copyValue={profile.referral_code ?? undefined}
            />
            <InfoRow
              icon={<LinkIcon className="h-4 w-4" />}
              label="Реферальная ссылка"
              value={referralLink ? <span className="font-mono text-xs">{referralLink}</span> : "не создана"}
              copyValue={referralLink ?? undefined}
            />
            {profile.bio ? (
              <div className="rounded-2xl border border-border/50 bg-background/30 p-3">
                <div className="text-xs text-muted-foreground">О себе</div>
                <div className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="contacts" className="mt-4 space-y-3">
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Город"
              value={profile.city ?? "—"}
              copyValue={profile.city ?? undefined}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Телефон"
              value={profile.phone ?? "—"}
              copyValue={profile.phone ?? undefined}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={profile.email ?? "—"}
              copyValue={profile.email ?? undefined}
            />
          </TabsContent>

          <TabsContent value="social" className="mt-4 space-y-3">
            <InfoRow
              icon={<LinkIcon className="h-4 w-4" />}
              label="Ссылка"
              value={profile.link ?? "—"}
              copyValue={profile.link ?? undefined}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
