import { motion } from 'framer-motion';
import { Check, Clock, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  onToggle: (id: string) => void;
  index: number;
}

const priorityColors = {
  low: 'bg-telegram-green/10 text-telegram-green border-telegram-green/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityLabels = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const TaskCard = ({ 
  id, 
  title, 
  description, 
  completed, 
  priority, 
  dueDate,
  onToggle,
  index 
}: TaskCardProps) => {
  const handleToggle = () => {
    hapticFeedback('medium');
    onToggle(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border",
        completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            completed 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </motion.div>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              "font-semibold text-foreground transition-all",
              completed && "line-through text-muted-foreground"
            )}>
              {title}
            </h3>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border font-medium",
              priorityColors[priority]
            )}>
              {priorityLabels[priority]}
            </span>
            
            {dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {dueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
