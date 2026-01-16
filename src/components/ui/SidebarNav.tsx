import { Button } from '@/components/ui/button';
import {
  Home,
  Shield,
  Users,
  Bot,
  Share2,
  User,
  CreditCard,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEnterAdminMode: () => void;
}

export const SidebarNav = ({ activeTab, onTabChange, onEnterAdminMode }: SidebarNavProps) => {
  const navItems = [
    { id: 'info', label: 'Главная', icon: Home },
    { id: 'vpn', label: 'VPN', icon: Shield },
    { id: 'channels', label: 'Каналы', icon: Users },
    { id: 'promotion', label: 'Продвижение', icon: Share2 },
    { id: 'bots', label: 'Боты', icon: Bot },
    { id: 'referral', label: 'Рефералы', icon: Users },
    { id: 'subscription', label: 'Подписка', icon: CreditCard },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <nav className="p-4 h-full overflow-y-auto sticky top-14">
      <div className="space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                activeTab === item.id && 'bg-primary/10 text-primary'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onEnterAdminMode}
        >
          <Monitor className="mr-2 h-4 w-4" />
          Панель администратора
        </Button>
      </div>
    </nav>
  );
};