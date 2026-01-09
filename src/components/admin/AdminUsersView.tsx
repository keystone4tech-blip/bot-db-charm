import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  Crown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/PageHeader';

const mockUsers = [
  { id: '1', name: 'Иван Петров', username: '@ivan_petrov', role: 'user', status: 'active', balance: 1500 },
  { id: '2', name: 'Мария Сидорова', username: '@maria_s', role: 'admin', status: 'active', balance: 5200 },
  { id: '3', name: 'Алексей Козлов', username: '@alex_k', role: 'moderator', status: 'active', balance: 800 },
  { id: '4', name: 'Елена Новикова', username: '@elena_n', role: 'user', status: 'banned', balance: 0 },
  { id: '5', name: 'Дмитрий Морозов', username: '@dmitry_m', role: 'user', status: 'active', balance: 2100 },
];

export const AdminUsersView = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary/20 text-primary"><Crown className="w-3 h-3 mr-1" />Админ</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/20 text-blue-500"><Shield className="w-3 h-3 mr-1" />Модератор</Badge>;
      default:
        return <Badge variant="secondary">Пользователь</Badge>;
    }
  };

  return (
    <div className="px-4 pb-24">
      <PageHeader
        icon="users"
        title="Пользователи"
        subtitle="Управление пользователями платформы"
      />

      {/* Search and Filter */}
      <div className="flex gap-2 mt-6 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск пользователей..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        {user.status === 'banned' && (
                          <Ban className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Баланс</span>
                  <span className="text-sm font-medium">₽{user.balance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
