import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { yearsFromEvents, type ScheduleItem } from './event-utils'

export type { ScheduleItem } from './event-utils'
export { eventsInYear, yearsFromEvents } from './event-utils'

const schedulePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../schedule.yaml')

export function getAllEvents(): ScheduleItem[] {
  const raw = fs.readFileSync(schedulePath, 'utf-8')
  return (parse(raw) as ScheduleItem[]) ?? []
}

export function getEventYears(): number[] {
  return yearsFromEvents(getAllEvents())
}
