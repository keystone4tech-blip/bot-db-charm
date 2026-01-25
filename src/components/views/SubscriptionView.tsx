import { motion } from 'framer-motion';
import { Zap, Star, Crown, Check, Shield, Bot, Megaphone, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { hapticFeedback } from '@/lib/telegram';
import { PageHeader } from '@/components/ui/PageHeader';

interface Plan {
  id: string;
  name: string;
  icon: typeof Zap;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  includes: {
    vpn: boolean;
    bot: boolean;
    channels: number;
    subscribers: number;
  };
}

const plans: Plan[] = [
  {
    id: 'start',
    name: 'Старт',
    icon: Zap,
    price: 299,
    period: 'месяц',
    features: [
      '1 канал для продвижения',
      'До 30 постов/месяц',
      'Базовая аналитика',
      'Email поддержка',
      '500 подписчиков в месяц',
    ],
    includes: {
      vpn: false,
      bot: false,
      channels: 1,
      subscribers: 500,
    },
  },
  {
    id: 'pro',
    name: 'Про',
    icon: Star,
    price: 799,
    period: 'месяц',
    popular: true,
    features: [
      '5 каналов для продвижения',
      'Безлимит постов',
      'Расширенная аналитика',
      'Приоритетная поддержка',
      'Реферальный бот',
      'VPN доступ',
      '2000 подписчиков в месяц',
    ],
    includes: {
      vpn: true,
      bot: true,
      channels: 5,
      subscribers: 2000,
    },
  },
  {
    id: 'business',
    name: 'Бизнес',
    icon: Crown,
    price: 1999,
    period: 'месяц',
    features: [
      'Безлимит каналов',
      'Безлимит постов',
      'Полная аналитика',
      'Персональный менеджер',
      'API доступ',
      'Кастомные боты',
      'VPN доступ',
      '10000 подписчиков в месяц',
    ],
    includes: {
      vpn: true,
      bot: true,
      channels: -1, // unlimited
      subscribers: 10000,
    },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

import { useProfile } from '@/hooks/useProfile';

export const SubscriptionView = () => {
  const { subscription } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const handleSelectPlan = (planId: string) => {
    hapticFeedback('medium');
    setSelectedPlan(planId);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  // Проверяем, есть ли активная подписка
  const hasActiveSubscription = subscription && subscription.is_active;

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <PageHeader
        icon="zap"
        title="Подписка"
        subtitle={hasActiveSubscription ? "Ваш текущий план" : "Выберите план для вашего бизнеса"}
      />

      {/* Current Subscription Info */}
      {hasActiveSubscription && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Текущая подписка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{subscription.plan_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.expires_at
                      ? `Действует до: ${new Date(subscription.expires_at).toLocaleDateString('ru-RU')}`
                      : 'Бессрочная подписка'}
                  </p>
                </div>
                <Badge variant="default" className="bg-green-500/20 text-green-500">
                  Активна
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <div className="text-sm text-muted-foreground">Тип</div>
                  <div className="font-semibold">{subscription.plan_type}</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <div className="text-sm text-muted-foreground">Цена</div>
                  <div className="font-semibold">{subscription.price} ₽</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plan Includes Summary */}
      {selectedPlanData && (
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-2xl p-4 border border-primary/30"
        >
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
            Что включено в план "{selectedPlanData.name}":
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${selectedPlanData.includes.vpn ? 'bg-green-500/20' : 'bg-muted'}`}>
                <Shield className={`w-4 h-4 ${selectedPlanData.includes.vpn ? 'text-green-500' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm ${selectedPlanData.includes.vpn ? '' : 'text-muted-foreground'}`}>
                VPN {selectedPlanData.includes.vpn ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${selectedPlanData.includes.bot ? 'bg-primary/20' : 'bg-muted'}`}>
                <Bot className={`w-4 h-4 ${selectedPlanData.includes.bot ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm ${selectedPlanData.includes.bot ? '' : 'text-muted-foreground'}`}>
                Бот {selectedPlanData.includes.bot ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Megaphone className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">
                {selectedPlanData.includes.channels === -1 ? '∞' : selectedPlanData.includes.channels} канал{selectedPlanData.includes.channels === 1 ? '' : selectedPlanData.includes.channels === -1 ? 'ов' : 'ов'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm">
                {selectedPlanData.includes.subscribers.toLocaleString()} подп./мес
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPlan(plan.id)}
              className={cn(
                "relative bg-card rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer",
                isSelected
                  ? "border-primary shadow-card-gold"
                  : "border-border hover:border-primary/30"
              )}
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-3 right-4 px-3 py-1 gold-gradient rounded-full text-xs font-semibold text-primary-foreground"
                >
                  Популярный
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                <motion.div
                  className={cn(
                    "icon-container shrink-0",
                    isSelected && "animate-pulse-gold"
                  )}
                  animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-3">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <span className="text-2xl font-bold">{plan.price}₽</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + featureIndex * 0.05 }}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full mt-4 py-3 rounded-xl font-semibold transition-all duration-300",
                  isSelected
                    ? "gold-gradient text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {isSelected ? 'Выбрать план' : 'Выбрать'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        variants={itemVariants}
        className="text-center text-sm text-muted-foreground py-4"
      >
        <p>Все планы включают 7-дневный пробный период</p>
        <p className="mt-1">Отмена подписки в любое время</p>
      </motion.div>
    </motion.div>
  );
};