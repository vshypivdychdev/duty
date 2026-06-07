import { useState, useMemo } from 'react'
import DateTabStrip from './components/DateTabStrip/DateTabStrip'
import styles from './App.module.css'

export default function App() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [selectedDate, setSelectedDate] = useState<Date>(today)

  return (
    <div className={styles.app}>
      <DateTabStrip today={today} selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <main className={styles.main}>
        <p className={styles.placeholder}>
          {selectedDate.toLocaleDateString('uk-UA', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </main>
    </div>
  )
}
