import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Lock, Check, Server } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

const features = [
  { icon: Shield, title: 'Полная защита', description: 'Шифрование военного уровня AES-256' },
  { icon: Zap, title: 'Высокая скорость', description: 'Без ограничений скорости и трафика' },
  { icon: Globe, title: '50+ локаций', description: 'Серверы по всему миру' },
  { icon: Lock, title: 'No-logs политика', description: 'Мы не храним ваши данные' },
];

const vpnPlans = [
  { id: 'month', period: 'Месяц', price: 299, perMonth: 299 },
  { id: '6months', period: '6 месяцев', price: 199, perMonth: 199, discount: 33, popular: true },
  { id: 'year', period: 'Год', price: 149, perMonth: 149, discount: 50 },
];

const servers = [
  { country: 'Нидерланды', flag: '🇳🇱', ping: 32, load: 45 },
  { country: 'Германия', flag: '🇩🇪', ping: 28, load: 62 },
  { country: 'США', flag: '🇺🇸', ping: 120, load: 38 },
  { country: 'Сингапур', flag: '🇸🇬', ping: 180, load: 25 },
];

const benefits = [
  'Доступ ко всем заблокированным сайтам',
  'Защита в публичных Wi-Fi сетях',
  'Анонимность в интернете',
  'Работает на всех устройствах',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const VPNView = () => {
  const [selectedPlan, setSelectedPlan] = useState('6months');

  const handleSelectPlan = (planId: string) => {
    hapticFeedback('light');
    setSelectedPlan(planId);
  };

  const handleConnect = () => {
    hapticFeedback('heavy');
  };

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="text-center py-6">
        <motion.div
          className="icon-container-lg mx-auto mb-6"
          animate={{ 
            boxShadow: [
              '0 0 20px hsl(45 93% 47% / 0.2)',
              '0 0 50px hsl(45 93% 47% / 0.4)',
              '0 0 20px hsl(45 93% 47% / 0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-12 h-12 text-primary animate-glow" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">VPN Защита</h1>
        <p className="text-muted-foreground">Безопасный и анонимный доступ к интернету</p>
      </motion.div>

      {/* Features grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-card rounded-2xl p-4 border border-border text-center hover:border-primary/30 transition-all"
            >
              <div className="icon-container mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Servers */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Доступные серверы</h3>
        </div>
        
        <div className="space-y-2">
          {servers.slice(0, 2).map((server, index) => (
            <motion.div
              key={server.country}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{server.flag}</span>
                <span className="font-medium">{server.country}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{server.ping}ms</span>
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${server.load}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="h-full gold-gradient"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold mb-2">Тарифы VPN</h3>
        <p className="text-sm text-muted-foreground mb-4">Выберите подходящий план</p>
        
        <div className="space-y-3">
          {vpnPlans.map((plan) => (
            <motion.div
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPlan(plan.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 gold-gradient text-xs font-semibold rounded-full text-primary-foreground">
                  Популярный
                </span>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{plan.period}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{plan.price} ₽</span>
                    <span className="text-sm text-muted-foreground">/мес</span>
                  </div>
                </div>
                {plan.discount && (
                  <span className="text-primary text-sm font-medium">
                    Экономия {plan.discount}%
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          className="w-full mt-4 py-4 gold-gradient rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Подключить VPN
        </motion.button>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-border">
        <h3 className="font-semibold mb-4">Что вы получаете:</h3>
        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};