import { motion } from 'framer-motion';
import { Wifi, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VPNStatusCardProps {
  vpnKey: any; // VPNKey
  onNavigate: (tab: string) => void;
}

export const VPNStatusCard = ({ vpnKey, onNavigate }: VPNStatusCardProps) => {
  const isActive = vpnKey?.status === 'active';
  const expiresAt = vpnKey?.expires_at ? new Date(vpnKey.expires_at) : null;
  const isExpired = expiresAt && expiresAt < new Date();
  const serverLocation = vpnKey?.server_location || 'не указано';
  const vpnKeyText = vpnKey?.key_value || 'Ключ недоступен';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive && !isExpired ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isActive && !isExpired ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Wifi className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">VPN Сервис</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isActive && !isExpired ? 'default' : 'destructive'}>
                    {isActive && !isExpired ? (vpnKey?.is_trial ? 'Пробный' : 'Активен') : 'Не активен'}
                  </Badge>
                  {isActive && !isExpired && (
                    <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                      {serverLocation}
                    </Badge>
                  )}
                  {expiresAt && (
                    <span className="text-xs text-muted-foreground">
                      до {expiresAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Отображение VPN ключа и возможности копирования */}
                {isActive && !isExpired && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground truncate max-w-[120px] font-mono">
                        {vpnKeyText}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(vpnKeyText)}
                      >
                        Копировать
                      </Button>
                    </div>

                    {/* Информация о пробном периоде */}
                    {vpnKey?.is_trial && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Пробный период: 7 дней</p>
                        <p>+3 дня за каждого реферала</p>
                        <p>+100% на баланс за подписку реферала</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isActive && !isExpired ? "secondary" : "default"}
                className={isActive && !isExpired ?
                  "text-green-500 border-green-500/30 hover:bg-green-500/10" :
                  "gold-gradient text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:animate-pulse-gold"}
                size="sm"
                onClick={() => onNavigate('vpn')}
              >
                {isActive && !isExpired ? 'Управление' : 'Подключить'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};