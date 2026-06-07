import { useState, useMemo } from 'react'
import DateTabStrip from './components/DateTabStrip/DateTabStrip'
import DutyView from './components/DutyView/DutyView'
import { resolveDutyForDate } from './utils/dutyResolver'
import styles from './App.module.css'

export default function App() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [selectedDate, setSelectedDate] = useState<Date>(today)

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
