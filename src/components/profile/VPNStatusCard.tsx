import { motion } from 'framer-motion';
import { Shield, ShieldOff, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface VPNKey {
  id: string;
  status: string | null;
  expires_at: string | null;
  server_location: string;
}

interface VPNStatusCardProps {
  vpnKey: VPNKey | null;
  onNavigate: (tab: string) => void;
}

export const VPNStatusCard = ({ vpnKey, onNavigate }: VPNStatusCardProps) => {
  const isActive = vpnKey?.status === 'active';
  const expiresAt = vpnKey?.expires_at ? new Date(vpnKey.expires_at) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${isActive ? 'bg-green-500/20' : 'bg-muted'}`}>
          {isActive ? (
            <Shield className="w-5 h-5 text-green-500" />
          ) : (
            <ShieldOff className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="font-semibold">VPN</h3>
          <p className="text-xs text-muted-foreground">
            {isActive ? 'Активен' : 'Не подключён'}
          </p>
        </div>
      </div>

      {isActive && expiresAt ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Активен до:</span>
            <span className="font-medium text-primary">
              {format(expiresAt, 'd MMMM yyyy', { locale: ru })}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Сервер: {vpnKey.server_location}
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('vpn')}
          className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
        >
          Приобрести VPN
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};
