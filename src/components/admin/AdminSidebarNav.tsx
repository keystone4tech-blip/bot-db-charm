import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Bot, 
  Settings,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExitAdmin: () => void;
}

export const AdminSidebarNav = ({ activeTab, onTabChange, onExitAdmin }: AdminSidebarNavProps) => {
  const navItems = [
    { id: 'admin-stats', label: 'Статистика', icon: BarChart3 },
    { id: 'admin-users', label: 'Пользователи', icon: Users },
    { id: 'admin-bots', label: 'Боты', icon: Bot },
    { id: 'admin-tickets', label: 'Тикеты', icon: MessageCircle },
    { id: 'admin-settings', label: 'Настройки', icon: Settings },
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
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onExitAdmin}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти из админ-панели
        </Button>
      </div>
    </nav>
  );
};