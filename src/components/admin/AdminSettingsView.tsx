import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Palette,
  ChevronRight,
  Database,
  Key,
  Webhook
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/PageHeader';
import { hapticFeedback } from '@/lib/telegram';

const settingsGroups = [
  {
    title: 'Уведомления',
    items: [
      { icon: Bell, label: 'Push-уведомления админам', type: 'switch' as const, defaultChecked: true },
      { icon: Bell, label: 'Email уведомления', type: 'switch' as const, defaultChecked: false },
    ]
  },
  {
    title: 'Безопасность',
    items: [
      { icon: Shield, label: 'Двухфакторная аутентификация', type: 'switch' as const, defaultChecked: true },
      { icon: Key, label: 'API ключи', type: 'link' as const },
      { icon: Webhook, label: 'Вебхуки', type: 'link' as const },
    ]
  },
  {
    title: 'Платежи',
    items: [
      { icon: CreditCard, label: 'Настройки оплаты', type: 'link' as const },
      { icon: CreditCard, label: 'Тарифы подписок', type: 'link' as const },
    ]
  },
  {
    title: 'Система',
    items: [
      { icon: Database, label: 'База данных', type: 'link' as const },
      { icon: Globe, label: 'Домены', type: 'link' as const },
      { icon: Palette, label: 'Кастомизация', type: 'link' as const },
    ]
  }
];

export const AdminSettingsView = () => {
  return (
    <div className="px-4 pb-24">
      <PageHeader
        icon="settings"
        title="Настройки"
        subtitle="Конфигурация платформы"
      />

      <div className="space-y-6 mt-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
              {group.title}
            </h3>
            <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden">
              <CardContent className="p-0">
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
