import { motion } from 'framer-motion';
import { CheckCircle2, Clock, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { FloatingObject } from '@/components/3d/FloatingObject';
import { InteractiveBackground } from '@/components/3d/InteractiveBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { TaskCard } from '@/components/TaskCard';
import { PageHeader } from '@/components/ui/PageHeader';

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
    <InteractiveBackground className="px-4 pb-24" intensity={0.8}>
      <PageHeader
        icon="chart"
        title="Главная"
        subtitle="Ваша персональная статистика и задачи"
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4">
        <Card className="rounded-3xl overflow-hidden">
          <CardContent className="relative p-5">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 h-24 w-24 opacity-90">
              <FloatingObject className="h-full w-full" />
            </div>
            <div className="relative z-10 pr-24">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-primary" />
                Дашборд
              </div>
              <div className="mt-2 text-lg font-extrabold tracking-tight">Премиум-статистика в реальном времени</div>
              <div className="mt-1 text-sm text-muted-foreground">Проверьте прогресс, задачи и ключевые метрики.</div>
              <div className="mt-4 flex gap-2">
                <Button variant="gradient" size="sm">
                  Быстрый старт
                </Button>
                <Button variant="outline" size="sm">
                  Подробнее
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
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
    </InteractiveBackground>
  );
};
