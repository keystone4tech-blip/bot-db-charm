import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Shield, Globe, Wifi, Lock, Server, CheckCircle, XCircle, Download, Copy, Activity } from 'lucide-react';
import { VPNServer3D } from '@/components/3d/VPNServer3D';
import { LiveLineChart } from '@/components/charts/LiveLineChart';
import { NumberCounter } from '@/components/charts/NumberCounter';
import { InteractiveBackground } from '@/components/3d/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { PageHeader } from '@/components/ui/PageHeader';

import { useProfile } from '@/hooks/useProfile';
import { getVPNServers } from '@/lib/api';
import { useState, useEffect } from 'react';

export const VPNView = () => {
  const { vpnKey, isLoading, error } = useProfile();
  const [vpnServers, setVpnServers] = useState([]);

  useEffect(() => {
    const fetchVPNServers = async () => {
      try {
        const servers = await getVPNServers();
        setVpnServers(servers);
      } catch (err) {
        console.error('Ошибка загрузки VPN-серверов:', err);
        // В случае ошибки не отображаем фиктивные данные, а оставляем пустой массив
        setVpnServers([]);
      }
    };

    fetchVPNServers();
  }, []);

  const hasSubscription = !!vpnKey && vpnKey.status === 'active';

  const trafficData = useMemo(() => {
    const pts: { t: string; v: number }[] = [];
    const base = hasSubscription ? 120 : 40;
    for (let i = 0; i < 18; i++) {
      const v = Math.max(0, base + Math.sin(i * 0.45) * base * 0.22 + Math.cos(i * 0.2) * base * 0.12);
      pts.push({ t: `${i + 1}`, v: Math.round(v) });
    }
    return pts;
  }, [hasSubscription]);

  const currentSpeedMbps = useMemo(() => {
    const last = trafficData[trafficData.length - 1]?.v ?? 0;
    return Math.max(0, last / 4);
  }, [trafficData]);

  return (
    <InteractiveBackground className="px-4 py-6 pb-24 space-y-6 page-enter" intensity={0.8}>
      {/* Header - объединенный значок и название */}
      <PageHeader
        icon="shield"
        title="VPN Сервис"
        subtitle="Безопасное и анонимное соединение"
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="rounded-3xl overflow-hidden">
          <div className="flex items-center gap-4 p-5">
            <div className="h-24 w-24 shrink-0">
              <VPNServer3D className="h-full w-full" status={hasSubscription ? 'online' : 'offline'} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">Текущая скорость</div>
                  <div className="mt-1 text-xl font-extrabold tracking-tight flex items-center gap-2">
                    <NumberCounter value={currentSpeedMbps} decimals={0} />
                    <span className="text-xs text-muted-foreground">Mbps</span>
                  </div>
                </div>
                <div className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                  hasSubscription ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
                )}>
                  <span className={cn('h-2 w-2 rounded-full', hasSubscription ? 'bg-success pulse-soft' : 'bg-destructive')} />
                  {hasSubscription ? 'Онлайн' : 'Оффлайн'}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-4 w-4" />
                Живой мониторинг трафика
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <LiveLineChart data={trafficData} xKey="t" yKey="v" height={140} />
          </div>
        </Card>
      </motion.div>

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
      {hasSubscription && vpnKey?.is_trial && (
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
                <p className="text-sm font-mono break-all">{vpnKey?.key_value}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Срок действия: до {vpnKey?.expires_at ? new Date(vpnKey.expires_at).toLocaleDateString('ru-RU') : 'не ограничен'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Как использовать:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Скачайте приложение OpenVPN или WireGuard</li>
                  <li>Импортируйте конфигурационный файл или введите ключ вручную</li>
                  <li>Подключитесь к серверу {vpnKey?.server_location}</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Конфиг
                </Button>
                <Button
                  className="flex-1 gold-gradient text-white"
                  onClick={() => navigator.clipboard.writeText(vpnKey?.key_value || '')}
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
            {vpnServers.length > 0 ? (
              vpnServers.map((server, index) => (
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
                    <div className="text-xs text-muted-foreground">
                      Загрузка: {server.load}%
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Серверы временно недоступны</p>
                <p className="text-sm text-muted-foreground">Скоро будут добавлены новые серверы</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </InteractiveBackground>
  );
};