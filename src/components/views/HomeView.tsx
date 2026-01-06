import { motion } from 'framer-motion';
import { CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { TaskCard } from '@/components/TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface HomeViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export const HomeView = ({ tasks, onToggleTask }: HomeViewProps) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const todayTasks = tasks.filter(t => !t.completed).slice(0, 3);

  const stats = [
    { icon: CheckCircle2, label: 'Выполнено', value: completedTasks, trend: '+12% за неделю', trendUp: true },
    { icon: Clock, label: 'В процессе', value: pendingTasks },
    { icon: TrendingUp, label: 'Прогресс', value: `${tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}%` },
    { icon: Zap, label: 'Серия', value: '5 дней', trend: 'Отлично!', trendUp: true },
  ];

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Статистика</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <StatsCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Сегодня</h2>
          <span className="text-sm text-primary font-medium">Все задачи →</span>
        </div>
        
        {todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                {...task}
                onToggle={onToggleTask}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-8 text-center border border-border"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Все задачи выполнены!</h3>
            <p className="text-sm text-muted-foreground">Добавьте новую задачу, чтобы начать</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
