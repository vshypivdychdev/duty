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

export function resolveDuty(roster: DutyPerson[], date: Date): DutyPerson | null {
  const dayName = getDayOfWeek(date)
  return roster.find((person) => person.dutyDays.includes(dayName)) ?? null
}

export function resolveDutyForDate(date: Date): DutyPerson | null {
  return resolveDuty(dutyData as DutyPerson[], date)
}

export function getOffsetDate(baseDate: Date, offsetDays: number): Date {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + offsetDays)
  return d
}

// Accepts a full URL (https://..., /assets/...) or a bare Google Drive file ID.
export function photoUrl(urlOrId: string): string {
  if (urlOrId.startsWith('http') || urlOrId.startsWith('/')) return urlOrId
  return `https://drive.google.com/thumbnail?id=${urlOrId}&sz=w1200`
}
