import { useState, useRef } from 'react'
import type { DutyPerson } from '../../types/duty'
import styles from './DutyView.module.css'

const SLIDE_COUNT = 3
const SWIPE_THRESHOLD = 50

interface DutyViewProps {
  person: DutyPerson
}

export default function DutyView({ person }: DutyViewProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [imgError, setImgError] = useState(false)

  const dragStartX = useRef<number | null>(null)
  const dragging = useRef(false)

  function goTo(index: number) {
    setSlideIndex(Math.max(0, Math.min(SLIDE_COUNT - 1, index)))
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
    dragging.current = true
    setAnimate(false)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current || dragStartX.current === null) return
    const delta = e.clientX - dragStartX.current
    const atStart = slideIndex === 0 && delta > 0
    const atEnd = slideIndex === SLIDE_COUNT - 1 && delta < 0
    setDragDelta(atStart || atEnd ? delta * 0.2 : delta)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging.current || dragStartX.current === null) return
    const delta = e.clientX - dragStartX.current
    dragging.current = false
    dragStartX.current = null
    setAnimate(true)
    setDragDelta(0)
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      goTo(slideIndex + (delta < 0 ? 1 : -1))
    }
  }

  const translateX = -(slideIndex * 100) + (dragDelta / window.innerWidth) * 100

  return (
    <div className={styles.root}>
      <div
        className={styles.track}
        style={{
          transform: `translateX(${translateX}%)`,
          transition: animate ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Slide 1: Photo + name */}
        <div className={styles.slide}>
          {imgError ? (
            <div className={styles.photoFallback}>
              <span className={styles.photoInitial}>{person.name[0]}</span>
            </div>
          ) : (
            <img
              className={styles.photo}
              src={person.url}
              alt={person.name}
              onError={() => setImgError(true)}
              draggable={false}
            />
          )}
          <div className={styles.nameOverlay}>
            <span className={styles.name}>{person.name}</span>
          </div>
        </div>

        {/* Slide 2: Daily responsibilities */}
        <div className={styles.slide}>
          <div className={styles.responsibilitiesContent}>
            <h2 className={styles.slideTitle}>Щоденні обов&apos;язки</h2>
            <ul className={styles.list}>
              {person.dailyResponsibilities.map((item, i) => (
                <li key={i} className={styles.listItem}>
                  <span className={styles.bullet} aria-hidden="true">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Slide 3: Weekly responsibilities */}
        <div className={styles.slide}>
          <div className={styles.responsibilitiesContent}>
            <h2 className={styles.slideTitle}>Тижневі обов&apos;язки</h2>
            <ul className={styles.list}>
              {person.weeklyResponsibilities.map((item, i) => (
                <li key={i} className={styles.listItem}>
                  <span className={styles.bullet} aria-hidden="true">
                    ·
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Dot indicator */}
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === slideIndex ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
