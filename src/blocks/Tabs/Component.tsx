'use client'

import React from 'react'
import { TabsBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const TabsBlock: React.FC<TabsBlock> = ({ tabs, layout = 'horizontal', settings }) => {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.label || '')

  return (
    <GridContainer settings={settings}>
      <div className={cn('w-full', layout === 'vertical' && 'md:flex md:gap-8')}>
        {/* Tab triggers */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          orientation={layout === 'vertical' ? 'vertical' : 'horizontal'}
          className="w-full"
        >
          <TabsList
            className={cn(
              'w-full',
              layout === 'vertical' ? 'md:flex-col md:w-64 md:h-auto' : 'flex-row',
            )}
          >
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={index}
                value={tab.label}
                className={cn(layout === 'vertical' && 'md:justify-start md:w-full')}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab content */}
          <div className={cn('mt-4', layout === 'vertical' && 'md:mt-0 md:flex-1')}>
            {tabs.map((tab, index) => (
              <TabsContent
                key={index}
                value={tab.label}
                className={cn('p-4', tab.media && 'flex flex-col lg:flex-row gap-8')}
              >
                {/* Tab content */}
                <div className={cn('flex-1', tab.media && 'lg:w-1/2')}>
                  <RichText data={tab.content} />
                </div>

                {/* Tab media */}
                {tab.media && (
                  <div className="mt-6 lg:mt-0 lg:w-1/2">
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={tab.media.url}
                        alt={tab.media.alt || tab.label}
                        width={tab.media.width || 600}
                        height={tab.media.height || 400}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </GridContainer>
  )
}
