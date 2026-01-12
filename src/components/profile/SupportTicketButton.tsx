import { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateTicketModal from '@/components/support/CreateTicketModal';
import SupportChat from '@/components/support/SupportChat';
import { Ticket, useSupportTickets } from '@/hooks/useSupportTickets';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

interface SupportTicketButtonProps {
  profileId: string | null;
  isCreatingTicket?: boolean;
  onTicketCreated?: (ticket: Ticket) => void;
}

export const SupportTicketButton = ({ profileId, onTicketCreated }: SupportTicketButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { profile } = useTelegramAuth();
  const { fetchTickets, tickets } = useSupportTickets();

  // Загружаем активный тикет при монтировании
  useEffect(() => {
    if (profileId) {
      loadActiveTicket();
    }
  }, [profileId]);

  // Обновляем активный тикет при изменении списка тикетов
  useEffect(() => {
    const active = tickets.find(t => t.status !== 'closed' && t.status !== 'resolved');
    setActiveTicket(active || null);
  }, [tickets]);

  const loadActiveTicket = async () => {
    if (!profileId) return;
    try {
      const userTickets = await fetchTickets(profileId);
      const active = userTickets.find((t: Ticket) => t.status !== 'closed' && t.status !== 'resolved');
      setActiveTicket(active || null);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleTicketCreated = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setShowChat(true);
    if (onTicketCreated) {
      onTicketCreated(ticket);
    }
  };

  const handleOpenSupport = () => {
    if (activeTicket) {
      setShowChat(true);
    } else {
      setIsModalOpen(true);
    }
  };

  // Если открыт чат, показываем его на весь экран
  if (showChat && activeTicket) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <SupportChat 
          ticketId={activeTicket.id}
          ticket={activeTicket}
          onClose={() => {
            setShowChat(false);
            loadActiveTicket();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <Button
            className="w-full justify-between gold-gradient text-white rounded-xl h-12"
            onClick={handleOpenSupport}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Служба поддержки</span>
            </div>
            <div className="flex items-center gap-2">
              {activeTicket && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {activeTicket.status === 'open' ? 'Ожидает' : 'В работе'}
                </Badge>
              )}
              <ChevronRight className="w-5 h-5" />
            </div>
          </Button>
        </CardContent>
      </Card>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </>
  );
};