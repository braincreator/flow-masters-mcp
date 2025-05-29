import { 
  Bot, 
  MessageSquare, 
  Settings, 
  Smartphone, 
  Search, 
  Zap,
  Brain,
  Code,
  Cog,
  FileText,
  Users,
  LucideIcon
} from 'lucide-react'

// Маппинг типов услуг на иконки
export const SERVICE_TYPE_ICONS: Record<string, LucideIcon> = {
  automation: Zap,
  development: Code,
  integration: Settings,
  audit: Search,
  consultation: Users,
  content_creation: FileText,
  support: MessageSquare,
  other: Bot,
}

// Функция для получения иконки по типу услуги
export function getServiceIcon(serviceType: string): LucideIcon {
  return SERVICE_TYPE_ICONS[serviceType] || SERVICE_TYPE_ICONS.other
}

// Маппинг типов услуг на цвета
export const SERVICE_TYPE_COLORS: Record<string, string> = {
  automation: 'blue',
  development: 'purple',
  integration: 'green',
  audit: 'orange',
  consultation: 'indigo',
  content_creation: 'pink',
  support: 'cyan',
  other: 'gray',
}

// Функция для получения цвета по типу услуги
export function getServiceColor(serviceType: string): string {
  return SERVICE_TYPE_COLORS[serviceType] || SERVICE_TYPE_COLORS.other
}
