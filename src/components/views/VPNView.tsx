import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Wifi, Lock, Server, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export const VPNView = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [autoConnect, setAutoConnect] = useState(true);
  
  const servers = [
    { id: 1, name: 'США - Нью-Йорк', flag: '🇺🇸', ping: '12ms', status: 'online' },
    { id: 2, name: 'Германия - Берлин', flag: '🇩🇪', ping: '45ms', status: 'online' },
    { id: 3, name: 'Япония - Токио', flag: '🇯🇵', ping: '89ms', status: 'offline' },
    { id: 4, name: 'Сингапур', flag: '🇸🇬', ping: '102ms', status: 'online' },
    { id: 5, name: 'Нидерланды - Амстердам', flag: '🇳🇱', ping: '38ms', status: 'online' },
  ];

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">VPN Сервис</h1>
        <p className="text-muted-foreground">Безопасное и анонимное соединение</p>
      </motion.div>

      {/* Connection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isConnected ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {isConnected ? (
                    <Wifi className="w-6 h-6 text-green-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Статус подключения</h3>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Подключено к VPN' : 'Не подключено'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isConnected}
                onCheckedChange={handleConnect}
              />
            </div>
            
            {isConnected && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сервер:</span>
                  <span>США - Нью-Йорк</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Пинг:</span>
                  <span>12ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IP:</span>
                  <span>192.168.1.100</span>
                </div>
              </div>
            )}
            
            <Button 
              className={`w-full mt-4 ${isConnected ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={handleConnect}
            >
              {isConnected ? 'Отключить VPN' : 'Подключить VPN'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Auto Connect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Автоподключение</h4>
                <p className="text-sm text-muted-foreground">Подключаться к VPN при запуске</p>
              </div>
              <Switch
                checked={autoConnect}
                onCheckedChange={setAutoConnect}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Server List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Серверы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {servers.map((server, index) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  isConnected && index === 0 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-accent'
                }`}
                onClick={() => {
                  if (server.status === 'online') {
                    // Устанавливаем этот сервер как текущий
                  }
                }}
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
                  {isConnected && index === 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      Подключен
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card className="text-center">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-medium text-sm">Безопасность</h4>
            <p className="text-xs text-muted-foreground">AES-256 шифрование</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <Globe className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-medium text-sm">Анонимность</h4>
            <p className="text-xs text-muted-foreground">Скрытие IP-адреса</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};