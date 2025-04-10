"use client"
'use client'

import React, { useState, useEffect } from 'react'
import { CountdownBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import { Action } from '@/components/Action'

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

export const CountdownBlock: React.FC<CountdownBlock> = ({
  title,
  targetDate,
  format = 'full',
  expiredMessage = 'Expired',
  actions,
  settings,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const targetTime =
        typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate.getTime()

      const now = new Date().getTime()
      const difference = targetTime - now

      if (difference <= 0) {
        // Target date has passed
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        })
        return
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        expired: false,
      })
    }

    // Calculate initially
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    // Clean up interval
    return () => clearInterval(interval)
  }, [targetDate])

  // Format number with leading zero
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num.toString()
  }

  // Display different layouts based on format prop
  const renderCountdown = () => {
    if (timeRemaining.expired) {
      return (
        <div className="text-center">
          <p className="text-xl font-medium text-muted-foreground">{expiredMessage}</p>
        </div>
      )
    }

    if (format === 'days') {
      return (
        <div className="flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl font-bold">{timeRemaining.days}</span>
            <span className="text-xl ml-2">days</span>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <div className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-bold bg-card rounded-lg px-3 py-2 border border-border min-w-[4rem] text-center">
            {formatNumber(timeRemaining.days)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">DAYS</span>
        </div>
        <div className="text-2xl font-bold">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-bold bg-card rounded-lg px-3 py-2 border border-border min-w-[4rem] text-center">
            {formatNumber(timeRemaining.hours)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">HOURS</span>
        </div>
        <div className="text-2xl font-bold">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-bold bg-card rounded-lg px-3 py-2 border border-border min-w-[4rem] text-center">
            {formatNumber(timeRemaining.minutes)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">MINUTES</span>
        </div>
        <div className="text-2xl font-bold">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-bold bg-card rounded-lg px-3 py-2 border border-border min-w-[4rem] text-center">
            {formatNumber(timeRemaining.seconds)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">SECONDS</span>
        </div>
      </div>
    )
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full flex flex-col items-center py-8">
        {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}

        {renderCountdown()}

        {/* Actions */}
        {actions && actions.length > 0 && !timeRemaining.expired && (
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {actions.map((action, i) => (
              <Action key={i} {...action} />
            ))}
          </div>
        )}
      </div>
    </GridContainer>
  )
}
