import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SupportTicketButtonProps {
  profileId: string | null;
}

export const SupportTicketButton = ({ profileId }: SupportTicketButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      // В реальной реализации здесь будет вызов API для создания тикета
      console.log('Creating support ticket:', { profileId, category, subject, message });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating support ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <Button
            className="w-full gold-gradient text-white"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Служба поддержки
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md sm:max-w-md rounded-2xl p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Обратиться в поддержку
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Выберите категорию</option>
                  <option value="technical">Технические вопросы</option>
                  <option value="billing">Платежи и подписка</option>
                  <option value="account">Проблемы с аккаунтом</option>
                  <option value="feature">Предложения по улучшению</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Тема</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Кратко опишите ваш вопрос"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Сообщение</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Подробно опишите вашу проблему или вопрос..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 gold-gradient text-white"
                onClick={handleSubmit}
                disabled={isLoading || !subject.trim() || !message.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Отправка...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Отправить
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};