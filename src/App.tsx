import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import DateTabStrip from './components/DateTabStrip/DateTabStrip'
import DutyView from './components/DutyView/DutyView'
import { resolveDutyForDate } from './utils/dutyResolver'
import styles from './App.module.css'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function App() {
  const [today, setToday] = useState(() => startOfDay(new Date()))
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  // Keep refs in sync so the midnight timeout can read current state values.
  const todayRef = useRef(today)
  const selectedDateRef = useRef(selectedDate)
  useLayoutEffect(() => {
    todayRef.current = today
    selectedDateRef.current = selectedDate
  })

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      id = setTimeout(() => {
        const newToday = startOfDay(new Date())
        // If the user was viewing today, move them to the new today.
        if (selectedDateRef.current.getTime() === todayRef.current.getTime()) {
          setSelectedDate(newToday)
        }
        setToday(newToday)
        scheduleNext()
      }, midnight.getTime() - now.getTime())
    }

    scheduleNext()
    return () => clearTimeout(id)
  }, [])

  const person = useMemo(() => resolveDutyForDate(selectedDate), [selectedDate])

  return (
    <div className={styles.app}>
      <DateTabStrip today={today} selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main className={styles.main}>
        {person ? (
          <DutyView key={selectedDate.toISOString()} person={person} />
        ) : (
          <div className={styles.noDuty}>
            <p>Сьогодні ніхто не чергує</p>
          </div>
        )}
      </main>
    </div>
  )
}
