import { motion } from 'framer-motion';
import { Zap, Star, Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { hapticFeedback } from '@/lib/telegram';

interface Plan {
  id: string;
  name: string;
  icon: typeof Zap;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'start',
    name: 'Старт',
    icon: Zap,
    price: 299,
    period: 'месяц',
    features: [
      '1 канал',
      'До 30 постов/месяц',
      'Базовая аналитика',
      'Email поддержка',
    ],
  },
  {
    id: 'pro',
    name: 'Про',
    icon: Star,
    price: 799,
    period: 'месяц',
    popular: true,
    features: [
      '5 каналов',
      'Безлимит постов',
      'Расширенная аналитика',
      'Приоритетная поддержка',
      'Реферальный бот',
    ],
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
    ],
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

export const SubscriptionView = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const handleSelectPlan = (planId: string) => {
    hapticFeedback('medium');
    setSelectedPlan(planId);
  };

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center py-4">
        <h1 className="text-2xl font-bold mb-2">Подписка</h1>
        <p className="text-muted-foreground">Выберите план для вашего бизнеса</p>
      </motion.div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan, index) => {
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
    </motion.div>
  );
};