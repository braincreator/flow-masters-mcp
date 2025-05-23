import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  CheckSquare,
  MessageCircle,
  FolderOpen,
  Target,
  Calendar,
  Star,
} from 'lucide-react'

interface TabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  t: (key: string) => string
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab, t }) => {
  const tabs = [
    'specification',
    'tasks',
    'milestones',
    'calendar',
    'discussions',
    'files',
    'feedback',
  ]

  const getIconForTab = (tabName: string) => {
    const iconProps = { className: 'w-4 h-4' }

    switch (tabName) {
      case 'specification':
        return <FileText {...iconProps} />
      case 'tasks':
        return <CheckSquare {...iconProps} />
      case 'discussions':
        return <MessageCircle {...iconProps} />
      case 'files':
        return <FolderOpen {...iconProps} />
      case 'milestones':
        return <Target {...iconProps} />
      case 'calendar':
        return <Calendar {...iconProps} />
      case 'feedback':
        return <Star {...iconProps} />
      default:
        return null
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-7 bg-gray-50 dark:bg-gray-700">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400"
          >
            {getIconForTab(tab)}
            <span className="hidden sm:inline">{t(`tabs.${tab}`)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default TabNavigation
