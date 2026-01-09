import { motion } from 'framer-motion';
import { Shield, Users, Rocket, MessageSquare, Bot, Settings, Coins, BarChart3, TrendingUp, Target, Sparkles, Globe, Wifi, Server, Trophy, Gift, Star, Zap, Eye, Heart, Briefcase, Calendar, MapPin, Mail, Phone, Camera, Image, Video, Music, Gamepad2, ShoppingBag, Package, Archive, FileText, Folder, Tag, Bookmark, Flag, Pin, Bell, Volume2, Mic, Headphones, Monitor, Smartphone, Tablet, Watch, Battery, Power, Sun, Moon, Cloud, Droplet, Wind, Thermometer, Umbrella, Snowflake, Flame, Anchor, Compass, Crosshair, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  className?: string;
}

const iconMap: Record<string, React.FC<any>> = {
  shield: Shield,
  users: Users,
  rocket: Rocket,
  message: MessageSquare,
  bot: Bot,
  settings: Settings,
  coins: Coins,
  chart: BarChart3,
  trending: TrendingUp,
  target: Target,
  sparkles: Sparkles,
  globe: Globe,
  wifi: Wifi,
  server: Server,
  trophy: Trophy,
  gift: Gift,
  star: Star,
  zap: Zap,
  eye: Eye,
  heart: Heart,
  briefcase: Briefcase,
  calendar: Calendar,
  map: MapPin,
  mail: Mail,
  phone: Phone,
  camera: Camera,
  image: Image,
  video: Video,
  music: Music,
  game: Gamepad2,
  shop: ShoppingBag,
  package: Package,
  archive: Archive,
  file: FileText,
  folder: Folder,
  tag: Tag,
  bookmark: Bookmark,
  flag: Flag,
  pin: Pin,
  bell: Bell,
  volume: Volume2,
  mic: Mic,
  headphones: Headphones,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  watch: Watch,
  battery: Battery,
  power: Power,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  droplet: Droplet,
  wind: Wind,
  thermometer: Thermometer,
  umbrella: Umbrella,
  snowflake: Snowflake,
  flame: Flame,
  anchor: Anchor,
  compass: Compass,
  crosshair: Crosshair,
  user: User,
};

export const PageHeader = ({ icon, title, subtitle, className }: PageHeaderProps) => {
  const IconComponent = iconMap[icon] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-3", className)}
    >
      <motion.div
        className="p-3 rounded-xl bg-primary/10"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <IconComponent className="w-6 h-6 text-primary" />
      </motion.div>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && (
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};