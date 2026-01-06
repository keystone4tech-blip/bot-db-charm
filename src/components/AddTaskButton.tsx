import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { hapticFeedback } from '@/lib/telegram';

interface AddTaskButtonProps {
  onClick: () => void;
}

export const AddTaskButton = ({ onClick }: AddTaskButtonProps) => {
  const handleClick = () => {
    hapticFeedback('medium');
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full telegram-gradient shadow-lg flex items-center justify-center"
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
    </motion.button>
  );
};
