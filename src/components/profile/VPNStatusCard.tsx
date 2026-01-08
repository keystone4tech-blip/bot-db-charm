import { motion } from 'framer-motion';
import { Shield, Wifi, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VPNStatusCardProps {
  vpnKey: any; // VPNKey
  onNavigate: (tab: string) => void;
}

export const VPNStatusCard = ({ vpnKey, onNavigate }: VPNStatusCardProps) => {
  const isActive = vpnKey?.status === 'active';
  const expiresAt = vpnKey?.expires_at ? new Date(vpnKey.expires_at) : null;
  const isExpired = expiresAt && expiresAt < new Date();
  const serverLocation = vpnKey?.server_location || 'США - Нью-Йорк';

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
                  <Shield className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">VPN Сервис</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isActive && !isExpired ? 'default' : 'destructive'}>
                    {isActive && !isExpired ? 'Активен' : 'Не активен'}
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
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('vpn')}
              >
                Управление
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};