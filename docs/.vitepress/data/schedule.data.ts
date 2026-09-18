import { getAllEvents, type ScheduleItem } from '../schedule'

export declare const data: ScheduleItem[]

export default {
  watch: ['../../../schedule.yaml'],
  load() {
    return getAllEvents()
  }
}
