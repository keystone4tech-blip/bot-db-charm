import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '@/hooks/useProfile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSave: (updates: { first_name?: string; last_name?: string; avatar_url?: string }) => Promise<boolean>;
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave({
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      avatar_url: avatarUrl || undefined,
    });
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  const initials = (firstName?.slice(0, 1) || 'G') + (lastName?.slice(0, 1) || '');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
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
            
            <div className="px-6 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Редактировать профиль</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                    <AvatarImage src={avatarUrl} alt="Preview" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Нажмите для изменения</p>
              </div>
              
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-foreground">Имя</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Введите имя"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm text-foreground">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Введите фамилию"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="avatarUrl" className="text-sm text-foreground">URL фото профиля</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Вставьте ссылку на изображение
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Отмена
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
