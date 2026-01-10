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
        "fixed top-0 left-0 right-0 z-[90] bg-background/80 backdrop-blur-xl border-b border-border",
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-center h-14 px-4 relative">
        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <Settings className="w-5 h-5 text-primary" />
          ) : (
            <Shield className="w-5 h-5 text-primary" />
          )}
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 animate-strong-gold-shimmer gold-gradient-text-outline has-text-outline">
            {isAdminMode ? 'Админ-панель' : 'Keystone Tech'}
          </h1>
        </div>
        <div className="absolute right-4">
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};