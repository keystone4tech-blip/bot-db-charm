import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { hapticFeedback } from '@/lib/telegram';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { title: string; description: string; priority: 'low' | 'medium' | 'high' }) => void;
}

export const AddTaskModal = ({ isOpen, onClose, onAdd }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    hapticFeedback('medium');
    onAdd({ title, description, priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  };

  const priorities = [
    { value: 'low' as const, label: 'Низкий', color: 'bg-telegram-green' },
    { value: 'medium' as const, label: 'Средний', color: 'bg-yellow-500' },
    { value: 'high' as const, label: 'Высокий', color: 'bg-destructive' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Новая задача</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Название
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Что нужно сделать?"
                  className="h-12 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Описание
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добавьте детали..."
                  className="min-h-[100px] rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Приоритет
                </label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        hapticFeedback('light');
                        setPriority(p.value);
                      }}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        priority === p.value
                          ? `${p.color} text-primary-foreground`
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full h-14 rounded-xl text-base font-semibold telegram-gradient hover:opacity-90 transition-opacity"
              >
                Добавить задачу
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
