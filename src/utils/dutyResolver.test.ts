import { describe, it, expect } from 'vitest'
import type { DutyPerson } from '../types/duty'
import { getDayOfWeek, resolveDuty, getOffsetDate } from './dutyResolver'

const monday = new Date('2025-01-06') // known Monday
const tuesday = new Date('2025-01-07')
const sunday = new Date('2025-01-12')

const roster: DutyPerson[] = [
  {
    name: 'Alice',
    url: '',
    dailyResponsibilities: [],
    weeklyResponsibilities: [],
    dutyDays: ['Monday', 'Thursday'],
  },
  {
    name: 'Bob',
    url: '',
    dailyResponsibilities: [],
    weeklyResponsibilities: [],
    dutyDays: ['Tuesday', 'Friday'],
  },
]

describe('getDayOfWeek', () => {
  it('maps JS day index to English day name', () => {
    expect(getDayOfWeek(new Date('2025-01-06'))).toBe('Monday')
    expect(getDayOfWeek(new Date('2025-01-07'))).toBe('Tuesday')
    expect(getDayOfWeek(new Date('2025-01-08'))).toBe('Wednesday')
    expect(getDayOfWeek(new Date('2025-01-12'))).toBe('Sunday')
  })
})

describe('resolveDuty', () => {
  it('returns the person whose dutyDays includes the date day', () => {
    expect(resolveDuty(roster, monday)?.name).toBe('Alice')
    expect(resolveDuty(roster, tuesday)?.name).toBe('Bob')
  })

  it('returns null when no one is scheduled for that day', () => {
    expect(resolveDuty(roster, sunday)).toBeNull()
  })

  it('returns null for an empty roster', () => {
    expect(resolveDuty([], monday)).toBeNull()
  })
})

describe('getOffsetDate', () => {
  it('adds positive offsets', () => {
    expect(getOffsetDate(monday, 2).toISOString().slice(0, 10)).toBe('2025-01-08')
  })

  it('subtracts negative offsets', () => {
    expect(getOffsetDate(monday, -1).toISOString().slice(0, 10)).toBe('2025-01-05')
  })

  it('does not mutate the input date', () => {
    const original = new Date(monday)
    getOffsetDate(monday, 5)
    expect(monday.getTime()).toBe(original.getTime())
  })
})
