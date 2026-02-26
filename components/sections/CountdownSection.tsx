'use client'

import { useEffect, useMemo, useState } from 'react'
import { RACE_CONFIG } from '@/lib/constants'
import { parseLocalDate } from '@/lib/utils/dates'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownContent {
  title?: string
  subtitle?: string
  targetDate?: string
  backgroundColor?: string
}

interface CountdownSectionProps {
  eventData?: any
  content?: CountdownContent
}

export default function CountdownSection({ eventData, content }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const edition = eventData?.edition || RACE_CONFIG.edition

  const target = useMemo(() => {
    if (content?.targetDate) {
      const parsed = parseLocalDate(content.targetDate)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed
      }
    }
    return eventData?.race_date ? parseLocalDate(eventData.race_date) : RACE_CONFIG.raceDate
  }, [content?.targetDate, eventData?.race_date])

  useEffect(() => {
    const targetMillis = target.getTime()

    const updateCountdown = () => {
      const now = Date.now()
      const distance = targetMillis - now

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [target])

  const timeUnits = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ]

  const title = content?.title || 'Faltam Apenas'
  const subtitle =
    content?.subtitle || `Para a largada da ${edition}ª Corrida Rustica de Macuco`

  const backgroundClass =
    content?.backgroundColor === 'gradient-accent'
      ? 'from-accent-600 to-primary-600'
      : 'from-primary-600 to-primary-700'

  return (
    <section className={`bg-gradient-to-r ${backgroundClass} py-16`}>
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-display font-bold text-white md:text-4xl">{title}</h2>
          <p className="mt-2 text-lg text-white/90">{subtitle}</p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="rounded-2xl border border-white/25 bg-white/15 p-6 text-center backdrop-blur-md transition-all duration-300 hover:bg-white/20"
            >
              <div className="font-display text-5xl font-bold tabular-nums text-white md:text-6xl">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-widest text-white/90 md:text-base">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

