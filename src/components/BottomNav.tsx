import { Info, CreditCard, TrendingUp, Shield, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

interface NavItem {
  icon: typeof Info;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Info, label: 'Инфо', id: 'info' },
  { icon: CreditCard, label: 'Подписка', id: 'subscription' },
  { icon: TrendingUp, label: 'Продвиж.', id: 'promotion' },
  { icon: Shield, label: 'VPN', id: 'vpn' },
  { icon: Users, label: 'Реф. прогр.', id: 'referral' },
  { icon: User, label: 'Кабинет', id: 'profile' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const handleTabClick = (tabId: string) => {
    hapticFeedback('light');
    onTabChange(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute -top-0.5 w-10 h-1 gold-gradient rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                  "relative",
                  isActive && "animate-glow"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 rounded-full bg-primary/30"
                  />
                )}
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-all duration-300",
                isActive && "text-primary font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};