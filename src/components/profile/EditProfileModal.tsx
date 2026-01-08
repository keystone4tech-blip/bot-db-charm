import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, User, Camera, MapPin, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any; // UserProfile
  onSave: (updates: Partial<any>) => Promise<void>; // updateProfile function
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    telegram_username: profile?.telegram_username || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-md rounded-2xl p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Редактировать профиль</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={formData.avatar_url} alt={formData.first_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="pl-10"
                  placeholder="Введите ваше имя"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Фамилия</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="pl-10"
                  placeholder="Введите вашу фамилию"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram_username">Telegram ник</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telegram_username"
                  value={formData.telegram_username}
                  onChange={(e) => handleChange('telegram_username', e.target.value)}
                  className="pl-10"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 gold-gradient text-white"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Сохранить
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};