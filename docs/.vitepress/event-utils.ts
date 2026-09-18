export type ScheduleItem = {
  name: string
  url: string
  dates: string[]
  roles?: string[]
  location: string
  place?: string
  hashtags?: string[]
  correction?: string
}

export function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function datesOf(event: ScheduleItem): Date[] {
  return (event.dates ?? []).map(toDate).filter((date): date is Date => date !== null)
}

export function yearsFromEvents(events: ScheduleItem[]): number[] {
  const years = new Set<number>()
  for (const event of events) {
    for (const date of datesOf(event)) years.add(date.getFullYear())
  }
  return Array.from(years).sort((a, b) => b - a)
}

export function eventsInYear(events: ScheduleItem[], year: number): ScheduleItem[] {
  return events.filter((event) => datesOf(event).some((date) => date.getFullYear() === year))
}
