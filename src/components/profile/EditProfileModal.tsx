import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, User, MapPin, Phone, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any; // UserProfile
  onSave: (updates: Partial<any>) => Promise<void>; // updateProfile function
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    city: profile?.city || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    link: profile?.link || '',
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
            <span>О себе</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="pl-10"
                  placeholder="Введите ваш город"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">О себе</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="pl-10 min-h-[100px]"
                  placeholder="Расскажите немного о себе..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Ссылка</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  className="pl-10"
                  placeholder="https://example.com"
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