import { useState, useRef, useEffect } from 'react'
import type { DutyPerson } from '../../types/duty'
import { photoUrl } from '../../utils/dutyResolver'
import styles from './DutyView.module.css'

// Pointer Events are absent on iOS < 13; touch handlers serve as fallback.
const SUPPORTS_POINTER_EVENTS = typeof window !== 'undefined' && 'PointerEvent' in window

const SLIDE_COUNT = 3
const SWIPE_THRESHOLD = 0.12 // fraction of container width
const TAP_MAX_DELTA = 8 // px — below this = tap, not drag
const SLIDE_PCT = 100 / SLIDE_COUNT // 33.33%
const IDLE_TIMEOUT_MS = 5 * 60 * 1000

interface DutyViewProps {
  person: DutyPerson
}

export default function DutyView({ person }: DutyViewProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [dragFraction, setDragFraction] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [imgError, setImgError] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef<number | null>(null)
  const dragging = useRef(false)

  function goTo(index: number) {
    setAnimate(true)
    setSlideIndex(Math.max(0, Math.min(SLIDE_COUNT - 1, index)))
  }

  // Auto-return to photo slide after 5 min of inactivity away from slide 0
  useEffect(() => {
    if (slideIndex === 0) return
    const id = setTimeout(() => {
      setAnimate(true)
      setSlideIndex(0)
    }, IDLE_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [slideIndex])

  // --- Pointer event handlers (modern browsers + iOS 13+) ---

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
    dragging.current = true
    setAnimate(false)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current || dragStartX.current === null) return
    const deltaX = e.clientX - dragStartX.current
    const width = rootRef.current ? rootRef.current.clientWidth : window.innerWidth
    const fraction = deltaX / width
    const atStart = slideIndex === 0 && fraction > 0
    const atEnd = slideIndex === SLIDE_COUNT - 1 && fraction < 0
    setDragFraction(atStart || atEnd ? fraction * 0.2 : fraction)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging.current || dragStartX.current === null) return
    const deltaX = e.clientX - dragStartX.current
    const width = rootRef.current ? rootRef.current.clientWidth : window.innerWidth
    dragging.current = false
    dragStartX.current = null
    setDragFraction(0)

    if (Math.abs(deltaX) < TAP_MAX_DELTA) {
      setAnimate(true)
      setSlideIndex((prev) => (prev + 1) % SLIDE_COUNT)
    } else if (Math.abs(deltaX / width) >= SWIPE_THRESHOLD) {
      goTo(slideIndex + (deltaX < 0 ? 1 : -1))
    } else {
      setAnimate(true)
    }
  }

  // iOS back-swipe fires pointercancel with ~0 delta — snap back, don't tap.
  function handlePointerCancel() {
    dragging.current = false
    dragStartX.current = null
    setDragFraction(0)
    setAnimate(true)
  }

  // --- Touch event fallbacks for iOS < 13 (no Pointer Events API) ---

  function handleTouchStart(e: React.TouchEvent) {
    if (SUPPORTS_POINTER_EVENTS) return
    dragStartX.current = e.touches[0].clientX
    dragging.current = true
    setAnimate(false)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (SUPPORTS_POINTER_EVENTS) return
    if (!dragging.current || dragStartX.current === null) return
    const deltaX = e.touches[0].clientX - dragStartX.current
    const width = rootRef.current ? rootRef.current.clientWidth : window.innerWidth
    const fraction = deltaX / width
    const atStart = slideIndex === 0 && fraction > 0
    const atEnd = slideIndex === SLIDE_COUNT - 1 && fraction < 0
    setDragFraction(atStart || atEnd ? fraction * 0.2 : fraction)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (SUPPORTS_POINTER_EVENTS) return
    if (!dragging.current || dragStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - dragStartX.current
    const width = rootRef.current ? rootRef.current.clientWidth : window.innerWidth
    dragging.current = false
    dragStartX.current = null
    setDragFraction(0)

    if (Math.abs(deltaX) < TAP_MAX_DELTA) {
      setAnimate(true)
      setSlideIndex((prev) => (prev + 1) % SLIDE_COUNT)
    } else if (Math.abs(deltaX / width) >= SWIPE_THRESHOLD) {
      goTo(slideIndex + (deltaX < 0 ? 1 : -1))
    } else {
      setAnimate(true)
    }
  }

  // iOS back-swipe on touch path fires touchcancel — reset state so the track
  // doesn't stay stuck at a mid-swipe position.
  function handleTouchCancel() {
    if (SUPPORTS_POINTER_EVENTS) return
    dragging.current = false
    dragStartX.current = null
    setDragFraction(0)
    setAnimate(true)
  }

  const translateX = SLIDE_PCT * (-slideIndex + dragFraction)

  const miniPhoto = imgError ? (
    <div className={styles.miniPhotoFallback}>
      <span className={styles.miniPhotoInitial}>{person.name[0]}</span>
    </div>
  ) : (
    <img
      className={styles.miniPhoto}
      src={photoUrl(person.url)}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  )

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
        onPointerCancel={handlePointerCancel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Slide 1: Full-screen photo + name */}
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
              onError={() => setImgError(true)}
              draggable={false}
            />
          )}
          <div className={styles.nameOverlay}>
            <span className={styles.name}>{person.name}</span>
          </div>
        </div>

        {/* Slide 2: Small photo header + daily responsibilities */}
        <div className={styles.slide}>
          <div className={styles.slideWithPhoto}>
            <div className={styles.miniPhotoHeader}>
              {miniPhoto}
              <div className={styles.miniNameOverlay}>
                <span className={styles.miniName}>{person.name}</span>
              </div>
            </div>
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
        </div>

        {/* Slide 3: Small photo header + weekly responsibilities */}
        <div className={styles.slide}>
          <div className={styles.slideWithPhoto}>
            <div className={styles.miniPhotoHeader}>
              {miniPhoto}
              <div className={styles.miniNameOverlay}>
                <span className={styles.miniName}>{person.name}</span>
              </div>
            </div>
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
