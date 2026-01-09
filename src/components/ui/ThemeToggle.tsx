import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ui/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn("p-2 rounded-lg transition-all duration-300 hover:bg-transparent focus:ring-0 focus:ring-offset-0", className)}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
};