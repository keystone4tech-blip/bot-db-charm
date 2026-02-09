import { motion } from 'framer-motion';
import { Shield, Settings, Zap } from 'lucide-react';
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
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/10",
        className
      )}
    >
      <div className="max-w-md mx-auto flex items-center justify-center h-14 px-4 relative">
        <div className="flex items-center gap-2">
          {isAdminMode ? (
            <Settings className="w-5 h-5 text-primary" />
          ) : (
            <Zap className="w-5 h-5 text-primary" />
          )}
          <h1
            className="text-lg font-bold tracking-wider gold-gradient-text"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            {isAdminMode ? 'ADMIN' : 'KEYSTONE'}
          </h1>
          {!isAdminMode && (
            <span className="text-lg font-bold text-foreground tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              TECH
            </span>
          )}
        </div>
        <div className="absolute right-4">
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};
