import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSupportTickets, ChatMessage } from '@/hooks/useSupportTickets';
import { Send, Paperclip, X, File, Image, FileText, Mic, Video } from 'lucide-react';

interface SupportChatProps {
  ticketId: string;
  onClose: () => void;
}

const SupportChat = ({ ticketId, onClose }: SupportChatProps) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useTelegramAuth();
  const { messages, sendMessage, fetchMessages, updateTicketStatus } = useSupportTickets();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загружаем сообщения при открытии чата
  useEffect(() => {
    if (ticketId) {
      fetchMessages(ticketId);
    }
  }, [ticketId, fetchMessages]);

  // Прокручиваем к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages[ticketId]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!message.trim() && !selectedFile) || !user || isSending) {
      return;
    }

    try {
      setIsSending(true);

      await sendMessage(
        ticketId,
        user.id,
        'user',
        message,
        selectedFile || undefined
      );

      setMessage('');
      removeFile();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTicketClose = async () => {
    try {
      await updateTicketStatus(ticketId, 'closed');
      onClose();
    } catch (error) {
      console.error('Error closing ticket:', error);
      // Даже если произошла ошибка при обновлении статуса, все равно закрываем чат
      onClose();
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.file_url) {
      // Определяем тип файла по расширению или MIME-типу
      const fileType = msg.file_type || '';
      const fileName = msg.file_name || 'Файл';

      if (fileType.startsWith('image/')) {
        return (
          <div className="mt-2">
            <img
              src={msg.file_url}
              alt={fileName}
              className="max-w-xs max-h-48 rounded-md object-cover"
            />
            <div className="text-xs text-muted-foreground mt-1">{fileName}</div>
          </div>
        );
      } else if (fileType.startsWith('audio/')) {
        return (
          <div className="mt-2">
            <audio controls className="w-full">
              <source src={msg.file_url} type={fileType} />
              Ваш браузер не поддерживает аудио элемент.
            </audio>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              <Mic className="w-3 h-3 mr-1" />
              {fileName}
            </div>
          </div>
        );
      } else if (fileType.startsWith('video/')) {
        return (
          <div className="mt-2">
            <video controls className="max-w-xs max-h-48 rounded-md">
              <source src={msg.file_url} type={fileType} />
              Ваш браузер не поддерживает видео элемент.
            </video>
            <div className="text-xs text-muted-foreground mt-1">{fileName}</div>
          </div>
        );
      } else {
        return (
          <div className="mt-2 flex items-center">
            <File className="w-4 h-4 mr-2 text-blue-500" />
            <a
              href={msg.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm break-all"
            >
              {fileName}
            </a>
          </div>
        );
      }
    }

    return <p className="whitespace-pre-wrap">{msg.message}</p>;
  };

  const ticketMessages = messages[ticketId] || [];

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Чат поддержки</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {ticketMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Начните переписку с поддержкой
              </div>
            ) : (
              ticketMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t p-4">
          {fileName && (
            <div className="flex items-center justify-between bg-secondary p-2 rounded mb-2">
              <div className="flex items-center">
                <File className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm truncate max-w-xs">{fileName}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 resize-none"
              rows={2}
            />
            <Button type="submit" size="sm" disabled={isSending}>
              {isSending ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-between mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTicketClose}
            >
              Закрыть тикет
            </Button>
            <div className="text-xs text-muted-foreground">
              Поддерживается отправка файлов, изображений, аудио и видео
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportChat;