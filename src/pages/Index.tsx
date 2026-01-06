import { useState } from 'react';
import { TelegramProvider } from '@/components/TelegramProvider';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AddTaskButton } from '@/components/AddTaskButton';
import { AddTaskModal } from '@/components/AddTaskModal';
import { HomeView } from '@/components/views/HomeView';
import { TasksView } from '@/components/views/TasksView';
import { ProfileView } from '@/components/views/ProfileView';
import { SettingsView } from '@/components/views/SettingsView';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Настроить Telegram бота', description: 'Создать бота через BotFather и получить токен', completed: false, priority: 'high', dueDate: 'Сегодня' },
  { id: '2', title: 'Подключить базу данных', description: 'Настроить таблицы в Lovable Cloud', completed: true, priority: 'high' },
  { id: '3', title: 'Добавить авторизацию', completed: false, priority: 'medium', dueDate: 'Завтра' },
  { id: '4', title: 'Протестировать WebApp', completed: false, priority: 'low' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAddTask = (newTask: { title: string; description: string; priority: 'low' | 'medium' | 'high' }) => {
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
    }]);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView tasks={tasks} onToggleTask={handleToggleTask} />;
      case 'tasks':
        return <TasksView tasks={tasks} onToggleTask={handleToggleTask} />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView tasks={tasks} onToggleTask={handleToggleTask} />;
    }
  };

  return (
    <TelegramProvider>
      <div className="min-h-screen bg-background max-w-md mx-auto">
        <Header />
        <main className="min-h-[calc(100vh-3.5rem-4rem)]">
          {renderView()}
        </main>
        <AddTaskButton onClick={() => setIsModalOpen(true)} />
        <AddTaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTask}
        />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </TelegramProvider>
  );
};

export default Index;
