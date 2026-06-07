export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export interface DutyPerson {
  name: string
  url: string
  dailyResponsibilities: string[]
  weeklyResponsibilities: string[]
  dutyDays: DayOfWeek[]
}
