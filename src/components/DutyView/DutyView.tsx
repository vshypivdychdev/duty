import { useState, useRef } from 'react'
import type { DutyPerson } from '../../types/duty'
import { photoUrl } from '../../utils/dutyResolver'
import styles from './DutyView.module.css'

const SLIDE_COUNT = 3
const SWIPE_THRESHOLD = 0.12 // fraction of container width
// Each slide occupies 1/SLIDE_COUNT of the track width as a percentage
const SLIDE_PCT = 100 / SLIDE_COUNT

interface DutyViewProps {
  person: DutyPerson
}

export default function DutyView({ person }: DutyViewProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  // fraction of container width (-1 to 1), computed in pointer handlers where ref access is safe
  const [dragFraction, setDragFraction] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [imgError, setImgError] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
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
    const deltaX = e.clientX - dragStartX.current
    const width = rootRef.current?.clientWidth ?? window.innerWidth
    const fraction = deltaX / width
    const atStart = slideIndex === 0 && fraction > 0
    const atEnd = slideIndex === SLIDE_COUNT - 1 && fraction < 0
    setDragFraction(atStart || atEnd ? fraction * 0.2 : fraction)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging.current || dragStartX.current === null) return
    const deltaX = e.clientX - dragStartX.current
    const width = rootRef.current?.clientWidth ?? window.innerWidth
    dragging.current = false
    dragStartX.current = null
    setAnimate(true)
    setDragFraction(0)
    if (Math.abs(deltaX / width) >= SWIPE_THRESHOLD) {
      goTo(slideIndex + (deltaX < 0 ? 1 : -1))
    }
  }

  // translateX is a % of the TRACK (SLIDE_COUNT × container wide).
  // One slide = SLIDE_PCT% of track = 100% of container.
  // dragFraction is already in container-width units, so SLIDE_PCT converts it to track %.
  const translateX = SLIDE_PCT * (-slideIndex + dragFraction)

  return (
    <div className={styles.root} ref={rootRef}>
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
              <span className={styles.photoFallbackName}>{person.name}</span>
            </div>
          ) : (
            <img
              className={styles.photo}
              src={photoUrl(person.url)}
              alt={person.name}
              referrerPolicy="no-referrer"
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
