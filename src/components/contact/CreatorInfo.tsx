import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreatorInfoProps {
  name: string
  bio: string
  imageUrl?: string // Ссылка на изображение опциональна
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean) // Удаляем возможные пустые строки
    .slice(0, 2) // Берем максимум 2 инициала
    .join('')
    .toUpperCase()
}

export function CreatorInfo({ name, bio, imageUrl }: CreatorInfoProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <Avatar className="h-16 w-16 border">
          {imageUrl ? <AvatarImage src={imageUrl} alt={name} className="object-cover" /> : null}
          <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          {/* Можно добавить должность или короткий слоган */}
          {/* <p className="text-sm text-muted-foreground">Веб-разработчик</p> */}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{bio}</p>
      </CardContent>
      {/* Возможно, добавить футер с дополнительной информацией или ссылками? */}
      {/* <CardFooter>
        <p>Дополнительная информация</p>
      </CardFooter> */}
    </Card>
  )
}
