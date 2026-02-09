import { motion } from 'framer-motion';
import { Download, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const InstallAppCard = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-4 border border-primary/20 cyber-glow"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Приложение установлено</p>
            <p className="text-xs text-muted-foreground">Доступно на домашнем экране</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl p-5 border border-primary/20 relative overflow-hidden"
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-foreground mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Установить приложение
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Добавьте на домашний экран для быстрого доступа и работы оффлайн
          </p>
          {isInstallable ? (
            <Button
              size="sm"
              onClick={install}
              className="gap-2 gold-gradient text-primary-foreground font-semibold"
            >
              <Download className="w-4 h-4" />
              Установить
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">📱 <strong>iPhone:</strong> Нажмите «Поделиться» → «На экран Домой»</p>
              <p>🤖 <strong>Android:</strong> Меню браузера → «Установить приложение»</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
