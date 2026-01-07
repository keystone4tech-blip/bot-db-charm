import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Loader2, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Используем API клиент для взаимодействия с Node.js сервером
// TODO: Реализовать поддержку тикетов в Node.js API
import { toast } from 'sonner';

interface SupportTicketButtonProps {
  profileId: string | null;
}

export const SupportTicketButton = ({ profileId }: SupportTicketButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { value: 'technical', label: 'Техническая проблема' },
    { value: 'billing', label: 'Оплата и биллинг' },
    { value: 'vpn', label: 'VPN' },
    { value: 'referral', label: 'Реферальная программа' },
    { value: 'other', label: 'Другое' },
  ];

  const handleSubmit = async () => {
    if (!profileId) {
      toast.error('Необходима авторизация');
      return;
    }

    if (!subject.trim() || !message.trim() || !category) {
      toast.error('Заполните все поля');
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправляем тикет через API
      const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: profileId,
          subject: subject.trim(),
          message: message.trim(),
          category,
          priority: 'medium',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit support ticket');
      }

      toast.success('Тикет создан успешно!');
      setIsOpen(false);
      setSubject('');
      setMessage('');
      setCategory('');
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Ошибка создания тикета');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          size="lg"
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          Создать тикет в поддержку
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden rounded-t-3xl bg-card border-t border-border shadow-xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              
              <div className="px-6 pb-8 pt-2 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Новый тикет</h2>
                      <p className="text-xs text-muted-foreground">Опишите вашу проблему</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category" className="text-sm text-foreground">Категория</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-sm text-foreground">Тема</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Кратко опишите проблему"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-sm text-foreground">Сообщение</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Подробно опишите вашу проблему..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !subject.trim() || !message.trim() || !category}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
