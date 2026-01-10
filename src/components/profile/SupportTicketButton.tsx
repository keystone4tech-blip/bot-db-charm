import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CreateTicketModal from '@/components/support/CreateTicketModal';

interface SupportTicketButtonProps {
  profileId: string | null;
}

export const SupportTicketButton = ({ profileId }: SupportTicketButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('SupportTicketButton render - isModalOpen:', isModalOpen);

  return (
    <>
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-4">
          <Button
            className="w-full gold-gradient text-white"
            onClick={() => {
              console.log('Opening ticket modal');
              setIsModalOpen(true);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Служба поддержки
          </Button>
        </CardContent>
      </Card>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing ticket modal from button');
          setIsModalOpen(false);
        }}
      />
    </>
  );
};