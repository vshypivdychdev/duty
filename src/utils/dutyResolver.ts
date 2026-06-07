import type { DayOfWeek, DutyPerson } from '../types/duty'
import dutyData from '../data/duty.json'

const JS_DAY_TO_NAME: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function getDayOfWeek(date: Date): DayOfWeek {
  return JS_DAY_TO_NAME[date.getDay()]
}

export function resolveDutyForDate(date: Date): DutyPerson | null {
  const dayName = getDayOfWeek(date)
  const roster = dutyData as DutyPerson[]
  return roster.find((person) => person.dutyDays.includes(dayName)) ?? null
}

export function getOffsetDate(baseDate: Date, offsetDays: number): Date {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + offsetDays)
  return d
}
