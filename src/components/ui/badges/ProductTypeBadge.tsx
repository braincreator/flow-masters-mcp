import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Download, BatteryCharging, Tag, Clock, Shield } from 'lucide-react'

interface ProductTypeBadgeProps {
  type: 'physical' | 'digital' | 'subscription' | 'service' | 'access'
  className?: string
}

export function ProductTypeBadge({ type, className }: ProductTypeBadgeProps) {
  // Determine icon based on product type
  const Icon = React.useMemo(() => {
    switch (type) {
      case 'digital':
        return Download
      case 'subscription':
        return BatteryCharging
      case 'service':
        return Clock
      case 'access':
        return Shield
      default:
        return Tag
    }
  }, [type])

  return (
    <Badge
      variant="outline"
      className={`text-xs bg-accent/5 border-accent/20 text-accent-foreground ${className || ''}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {type}
    </Badge>
  )
}
