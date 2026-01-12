import { motion } from 'framer-motion';
import { Shield, Globe, Wifi, Lock, Server, CheckCircle, XCircle, Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTelegramContext } from '@/components/TelegramProvider';
import { PageHeader } from '@/components/ui/PageHeader';

export const VPNView = () => {
  const { authProfile } = useTelegramContext();

  // Заглушка для VPN ключа - в реальной реализации загружать из useProfile
  const vpnKey = null as { key: string; serverLocation: string; expiresAt: Date; status: string; isTrial: boolean } | null;

  const hasSubscription = !!vpnKey && vpnKey.status === 'active';

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* Header - объединенный значок и название */}
      <PageHeader
        icon="shield"
        title="VPN Сервис"
        subtitle="Безопасное и анонимное соединение"
      />

      {/* Статус подписки */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${hasSubscription ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {hasSubscription ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Статус подписки</h3>
                <p className="text-sm text-muted-foreground">
                  {hasSubscription ? 'Активна' : 'Не оформлена'}
                </p>
              </div>
            </div>
            <Badge variant={hasSubscription ? 'default' : 'destructive'}>
              {hasSubscription ? 'Подписка активна' : 'Нужна подписка'}
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Пробный период информации */}
      {hasSubscription && vpnKey?.isTrial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 mt-0.5">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-300">Пробный период</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Вам предоставлен пробный бесплатный период на 7 дней.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  За каждого нового реферала вы получите +3 дня.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Если один из ваших рефералов приобретет подписку VPN, вы получите 100% на внутренний баланс для оплаты сервисов.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Информация в зависимости от статуса подписки */}
      {hasSubscription ? (
        // Если подписка есть
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Ваш VPN ключ</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-xl">
                <p className="text-sm font-mono break-all">{vpnKey?.key}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Срок действия: до {vpnKey?.expiresAt.toLocaleDateString('ru-RU')}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Как использовать:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Скачайте приложение OpenVPN или WireGuard</li>
                  <li>Импортируйте конфигурационный файл или введите ключ вручную</li>
                  <li>Подключитесь к серверу {vpnKey?.serverLocation}</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Конфиг
                </Button>
                <Button
                  className="flex-1 gold-gradient text-white"
                  onClick={() => navigator.clipboard.writeText(vpnKey?.key || '')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        // Если подписки нет
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Наши преимущества</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-green-500/10 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Высокая скорость</h4>
                    <p className="text-sm text-muted-foreground">Без ограничений скорости, полный доступ к каналам</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-green-500/10 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Полная анонимность</h4>
                    <p className="text-sm text-muted-foreground">Скрытие IP-адреса, защита от слежки</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-green-500/10 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Безопасность данных</h4>
                    <p className="text-sm text-muted-foreground">AES-256 шифрование, защита от утечек</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-green-500/10 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Доступ к заблокированным ресурсам</h4>
                    <p className="text-sm text-muted-foreground">Обход блокировок, доступ к любому контенту</p>
                  </div>
                </div>
              </div>

              <Button className="w-full gold-gradient text-white">
                Оформить подписку
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Серверы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Доступные серверы</h3>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, name: 'США - Нью-Йорк', flag: '🇺🇸', ping: '12ms', status: 'online' },
              { id: 2, name: 'Германия - Берлин', flag: '🇩🇪', ping: '45ms', status: 'online' },
              { id: 3, name: 'Япония - Токио', flag: '🇯🇵', ping: '89ms', status: 'online' },
              { id: 4, name: 'Сингапур', flag: '🇸🇬', ping: '102ms', status: 'online' },
              { id: 5, name: 'Нидерланды - Амстердам', flag: '🇳🇱', ping: '38ms', status: 'online' },
            ].map((server, index) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  server.status === 'online' ? 'border-border' : 'border-border opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{server.flag}</span>
                  <div>
                    <h4 className="font-medium">{server.name}</h4>
                    <p className="text-sm text-muted-foreground">{server.ping}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {server.status === 'online' ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Онлайн
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500">
                      <XCircle className="w-3 h-3 mr-1" />
                      Оффлайн
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};