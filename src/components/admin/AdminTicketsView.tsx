import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupportTickets, Ticket } from '@/hooks/useSupportTickets';
import SupportChat from '../support/SupportChat';

const AdminTicketsView = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState('open');
  const { tickets, loading, error, fetchAllTickets, updateTicketStatus } = useSupportTickets();

  // Загружаем тикеты при монтировании компонента
  useEffect(() => {
    fetchAllTickets();
  }, [fetchAllTickets]);

  const openTicketChat = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const closeChat = () => {
    setSelectedTicket(null);
  };

  const handleTicketStatusChange = async (ticketId: string, status: 'open' | 'in_progress' | 'closed') => {
    try {
      await updateTicketStatus(ticketId, status);
      if (selectedTicket?.id === ticketId && status === 'closed') {
        closeChat();
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'open') return ticket.status === 'open';
    if (activeTab === 'in-progress') return ticket.status === 'in_progress';
    if (activeTab === 'closed') return ticket.status === 'closed';
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'closed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (selectedTicket) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Чат с пользователем #{selectedTicket.id.substring(0, 8)}</h2>
          <div className="flex space-x-2">
            {selectedTicket.status !== 'closed' && (
              <Button
                variant="outline"
                onClick={() => handleTicketStatusChange(selectedTicket.id, 'closed')}
              >
                Закрыть тикет
              </Button>
            )}
            <Button
              variant="outline"
              onClick={closeChat}
            >
              Назад к списку
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <SupportChat ticketId={selectedTicket.id} onClose={closeChat} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Тикеты поддержки</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="open">Новые</TabsTrigger>
              <TabsTrigger value="in-progress">В работе</TabsTrigger>
              <TabsTrigger value="closed">Закрытые</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">Загрузка тикетов...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет новых тикетов
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => openTicketChat(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {ticket.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status === 'open' && 'Новый'}
                              {ticket.status === 'in_progress' && 'В работе'}
                              {ticket.status === 'closed' && 'Закрыт'}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-2">
                              {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-muted-foreground">
                            Категория: {ticket.category}
                          </span>
                          <Button variant="outline" size="sm">
                            Открыть
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">Загрузка тикетов...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет тикетов в работе
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => openTicketChat(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {ticket.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status === 'open' && 'Новый'}
                              {ticket.status === 'in_progress' && 'В работе'}
                              {ticket.status === 'closed' && 'Закрыт'}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-2">
                              {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-muted-foreground">
                            Категория: {ticket.category}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketStatusChange(ticket.id, 'closed');
                              }}
                            >
                              Закрыть
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTicketChat(ticket);
                              }}
                            >
                              Открыть
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="closed" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">Загрузка тикетов...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет закрытых тикетов
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-4 border rounded-lg opacity-70"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {ticket.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status === 'open' && 'Новый'}
                              {ticket.status === 'in_progress' && 'В работе'}
                              {ticket.status === 'closed' && 'Закрыт'}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-2">
                              {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-muted-foreground">
                            Категория: {ticket.category}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTicketChat(ticket)}
                          >
                            Просмотр
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTicketsView;