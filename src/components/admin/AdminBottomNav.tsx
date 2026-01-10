import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Settings,
  Bot,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

interface NavItem {
  icon: LucideIcon;
  label: string;
  id: string;
}

const adminNavItems: NavItem[] = [
  { icon: BarChart3, label: 'Статистика', id: 'admin-stats' },
  { icon: Users, label: 'Польз.', id: 'admin-users' },
  { icon: Bot, label: 'Боты', id: 'admin-bots' },
  { icon: Settings, label: 'Настройки', id: 'admin-settings' },
  { icon: ArrowLeft, label: 'Назад', id: 'exit-admin' },
];

interface AdminBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExitAdmin: () => void;
}

export const AdminBottomNav = ({ activeTab, onTabChange, onExitAdmin }: AdminBottomNavProps) => {
  const handleTabClick = (tabId: string) => {
    hapticFeedback('light');
    if (tabId === 'exit-admin') {
      onExitAdmin();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-xl border-t border-primary/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isExit = item.id === 'exit-admin';

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-300",
                isExit
                  ? "text-destructive hover:text-destructive/80"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && !isExit && (
                <motion.div
                  layoutId="activeAdminNavTab"
                  className="absolute -top-0.5 w-10 h-1 bg-primary rounded-full"
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
                className="relative"
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium mt-1 transition-all duration-300",
                isActive && !isExit && "text-primary font-semibold"
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
