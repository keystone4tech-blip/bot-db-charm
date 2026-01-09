import { motion } from 'framer-motion';
import { Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AppHeaderProps {
  isAdminMode?: boolean;
  className?: string;
}

export const AppHeader = ({ isAdminMode = false, className }: AppHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border",
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <Settings className="w-5 h-5 text-primary" />
          ) : (
            <Shield className="w-5 h-5 text-primary" />
          )}
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-strong-gold-shimmer">
            {isAdminMode ? 'Админ-панель' : 'Keystone Tech'}
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
};