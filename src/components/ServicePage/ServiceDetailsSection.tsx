import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Star, Shield, Search, Palette, FileJson } from 'lucide-react'
import AnimateInView from '@/components/AnimateInView'

interface ServiceDetailsSectionProps {
  // Define props if needed
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = () => {
  const t = useTranslations('servicesPage.serviceDetails')
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  // Иконки для каждого пункта
  const icons = [
    <Star key="star" className="w-8 h-8 text-primary" />,
    <Shield key="shield" className="w-8 h-8 text-primary" />,
    <Search key="search" className="w-8 h-8 text-primary" />,
    <Palette key="palette" className="w-8 h-8 text-primary" />,
    <FileJson key="file" className="w-8 h-8 text-primary" />,
  ]

  // Данные для отображения
  const detailItems = [
    {
      title: t('item1.title'),
      description: t('item1.description'),
      icon: icons[0],
    },
    {
      title: t('item2.title'),
      description: t('item2.description'),
      icon: icons[1],
    },
    {
      title: t('item3.title'),
      description: t('item3.description'),
      icon: icons[2],
    },
    {
      title: t('item4.title'),
      description: t('item4.description'),
      icon: icons[3],
    },
    {
      title: t('item5.title'),
      description: t('item5.description'),
      icon: icons[4],
    },
  ]

  // Определяем направления анимации
  const animationDirections: ('left' | 'right')[] = ['left', 'right', 'left', 'right', 'left']

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <AnimateInView direction="up">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {t('title')}
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>
        </AnimateInView>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {detailItems.map((item, index) => (
            <AnimateInView 
              key={index} 
              direction={animationDirections[index]} 
              delay={index * 150}
              className="h-full"
            >
              <div 
                className={`p-6 bg-card hover:bg-card/90 rounded-xl shadow-lg transition-all duration-300 border border-border h-full
                          ${expandedItem === index ? 'md:col-span-2 transform scale-[1.02] z-10' : ''}`}
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-start gap-4 h-full">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                    {item.icon}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <button className="text-muted-foreground">
                        {expandedItem === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                    <p className={`mt-2 text-muted-foreground transition-all duration-300 
                                ${expandedItem === index ? 'opacity-100 max-h-96' : 'opacity-90 max-h-20 line-clamp-2'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServiceDetailsSection
