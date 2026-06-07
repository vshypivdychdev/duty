import { useRef, useEffect } from 'react'
import { getOffsetDate } from '../../utils/dutyResolver'
import styles from './DateTabStrip.module.css'

const UK_DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const OFFSETS = [-3, -2, -1, 0, 1, 2, 3]

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface DateTabStripProps {
  today: Date
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export default function DateTabStrip({ today, selectedDate, onDateChange }: DateTabStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [selectedDate])

  return (
    <nav className={styles.strip} ref={stripRef} aria-label="Вибір дати">
      {OFFSETS.map((offset) => {
        const date = getOffsetDate(today, offset)
        const isToday = isSameDay(date, today)
        const isSelected = isSameDay(date, selectedDate)
        const dayName = UK_DAY_NAMES[date.getDay()]
        const dayNum = date.getDate()

        return (
          <button
            key={offset}
            ref={isSelected ? activeRef : null}
            className={`${styles.tab} ${isSelected ? styles.tabSelected : ''} ${isToday && !isSelected ? styles.tabToday : ''}`}
            onClick={() => onDateChange(date)}
            aria-current={isSelected ? 'date' : undefined}
          >
            <span className={styles.dayName}>{dayName}</span>
            <span className={styles.dayNum}>{dayNum}</span>
            {isToday && <span className={styles.todayDot} aria-hidden="true" />}
          </button>
        )
      })}
    </nav>
  )
}
