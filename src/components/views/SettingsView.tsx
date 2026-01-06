import { motion } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTelegramContext } from '@/components/TelegramProvider';
import { hapticFeedback, closeTelegramApp } from '@/lib/telegram';

export const SettingsView = () => {
  const { isTelegram } = useTelegramContext();

  const handleClose = () => {
    hapticFeedback('medium');
    closeTelegramApp();
  };

  const settingsGroups = [
    {
      title: 'Уведомления',
      items: [
        { icon: Bell, label: 'Push-уведомления', type: 'switch' as const, defaultChecked: true },
      ]
    },
    {
      title: 'Внешний вид',
      items: [
        { icon: Moon, label: 'Тёмная тема', type: 'switch' as const, defaultChecked: false },
        { icon: Globe, label: 'Язык', type: 'link' as const, value: 'Русский' },
      ]
    },
    {
      title: 'Другое',
      items: [
        { icon: Shield, label: 'Конфиденциальность', type: 'link' as const },
        { icon: HelpCircle, label: 'Помощь', type: 'link' as const },
      ]
    }
  ];

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-6">Настройки</h2>

        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => hapticFeedback('light')}
                    className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors ${
                      itemIndex !== group.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    {item.type === 'switch' ? (
                      <Switch defaultChecked={item.defaultChecked} />
                    ) : (
                      <div className="flex items-center gap-2">
                        {item.value && (
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {isTelegram && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-2xl font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Закрыть приложение
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs">Telegram Mini App v1.0.0</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
