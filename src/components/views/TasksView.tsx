import { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/lib/telegram';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

type FilterType = 'all' | 'active' | 'completed';

export const TasksView = ({ tasks, onToggleTask }: TasksViewProps) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Готовые' },
  ];

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Мои задачи</h2>
        
        <div className="flex gap-2 mb-6 bg-secondary p-1 rounded-xl">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                hapticFeedback('light');
                setFilter(f.value);
              }}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                filter === f.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
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
            <p className="text-muted-foreground">
              {filter === 'completed' 
                ? 'Нет выполненных задач' 
                : filter === 'active' 
                  ? 'Нет активных задач' 
                  : 'Нет задач'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
