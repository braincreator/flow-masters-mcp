'use client'
import React, { useState, useEffect } from 'react'
import { Service } from '@/types/service'
import AnimateInView from '@/components/AnimateInView'
import { ArrowRight, Filter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ServiceCard } from '@/components/services/ServiceCard'

type ServiceListProps = {
  services: Service[]
  serviceTypes: string[]
  translations: Record<string, string>
  commonTranslations: Record<string, string>
  locale: string
}

export default function ServiceList({
  services,
  serviceTypes,
  translations,
  commonTranslations,
  locale,
}: ServiceListProps) {
  const [filteredServices, setFilteredServices] = useState<Service[]>(services)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Функция для фильтрации услуг
  const filterServices = (type: string | null, query: string) => {
    let result = services

    // Применяем фильтр по типу
    if (type) {
      result = result.filter((service) => service.serviceType === type)
    }

    // Применяем фильтр по поисковому запросу
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter((service) => {
        // Получаем локализованный заголовок
        const title =
          typeof service.title === 'object' && service.title !== null
            ? service.title[locale as keyof typeof service.title] || String(service.title)
            : service.title

        // Получаем локализованное описание
        const description =
          typeof service.shortDescription === 'object' && service.shortDescription !== null
            ? service.shortDescription[locale as keyof typeof service.shortDescription] ||
              String(service.shortDescription)
            : service.shortDescription || ''

        // Проверяем совпадение в заголовке или описании
        return (
          String(title).toLowerCase().includes(lowerQuery) ||
          String(description).toLowerCase().includes(lowerQuery)
        )
      })
    }

    setFilteredServices(result)
  }

  // Обновляем фильтры при изменении активного фильтра или поискового запроса
  useEffect(() => {
    filterServices(activeFilter, searchQuery)
  }, [activeFilter, searchQuery, services, locale])

  // Группируем отфильтрованные услуги по типу
  const filteredServicesByType: Record<string, Service[]> = {}

  filteredServices.forEach((service) => {
    const type = service.serviceType || 'other'

    if (!filteredServicesByType[type]) {
      filteredServicesByType[type] = []
    }

    filteredServicesByType[type].push(service)
  })

  // Обработчик клика по фильтру категории
  const handleFilterClick = (type: string) => {
    if (activeFilter === type) {
      // Если кликнули на активный фильтр, снимаем его
      setActiveFilter(null)
    } else {
      // Иначе устанавливаем новый фильтр
      setActiveFilter(type)
    }
  }

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Сброс всех фильтров
  const resetFilters = () => {
    setActiveFilter(null)
    setSearchQuery('')
  }

  return (
    <>
      {/* Фильтры поиска */}
      <AnimateInView direction="up" className="mb-12">
        <div className="max-w-4xl mx-auto mt-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10 h-11 border-primary/20"
              placeholder={translations.searchServices}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {activeFilter && (
            <Button
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-11"
              variant="outline"
              onClick={resetFilters}
            >
              <X className="h-4 w-4 mr-2" />
              {translations.resetFilters}
            </Button>
          )}
        </div>
      </AnimateInView>

      {/* Фильтры по типу услуг - быстрый доступ */}
      <AnimateInView direction="up" className="mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {serviceTypes.map((type) => (
            <Badge
              key={type}
              variant={activeFilter === type ? 'default' : 'outline'}
              className={`py-2 px-4 text-sm font-medium cursor-pointer transition-all ${
                activeFilter === type
                  ? 'bg-primary text-white'
                  : 'border-primary/30 bg-card hover:bg-primary/5'
              }`}
              onClick={() => handleFilterClick(type)}
            >
              {translations[`serviceTypes.${type}`]}
            </Badge>
          ))}
        </div>
      </AnimateInView>

      {/* Если нет отфильтрованных услуг */}
      {filteredServices.length === 0 && (
        <AnimateInView direction="up" className="mb-16 text-center">
          <div className="bg-muted/30 p-8 rounded-xl">
            <h3 className="text-2xl font-semibold mb-3">{translations.servicesNotFound}</h3>
            <p className="text-muted-foreground mb-6">{translations.tryAnotherSearch}</p>
            <Button variant="outline" onClick={resetFilters}>
              {translations.resetFilters}
            </Button>
          </div>
        </AnimateInView>
      )}

      {/* Отображение отфильтрованных услуг по категориям */}
      {Object.entries(filteredServicesByType).map(([type, services], typeIndex) => (
        <AnimateInView
          key={type}
          direction="up"
          delay={typeIndex * 100}
          className="mb-16 last:mb-0"
        >
          <div className="flex items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">
              {translations[`serviceTypes.${type}`]}
            </h2>
            <div className="ml-4 h-1 flex-grow bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, serviceIndex) => (
              <AnimateInView
                key={service.id}
                direction="up"
                delay={(serviceIndex % 3) * 100}
                className="h-full"
              >
                <ServiceCard service={service} locale={locale} translations={translations} />
              </AnimateInView>
            ))}
          </div>
        </AnimateInView>
      ))}
    </>
  )
}
