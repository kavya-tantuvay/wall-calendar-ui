import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, StickyNote, X, Sun, Moon, ArrowRight } from 'lucide-react';
import './Calendar.css';

const YEAR_MIN = 2010;
const YEAR_MAX = 2040;

const MONTH_HERO = {
  0: { keyword: 'winter snow mountains', url: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1200&q=70' },
  1: { keyword: 'winter fog landscape', url: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=70' },
  2: { keyword: 'spring blossoms meadow', url: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=70' },
  3: { keyword: 'spring green hills', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=70' },
  4: { keyword: 'summer sunshine beach', url: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=1200&q=70' },
  5: { keyword: 'monsoon rain clouds', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=70' },
  6: { keyword: 'monsoon forest rain', url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1200&q=70' },
  7: { keyword: 'late monsoon valley', url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=1200&q=70' },
  8: { keyword: 'autumn leaves park', url: 'https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1200&q=70' },
  9: { keyword: 'autumn golden trees', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=70' },
  10: { keyword: 'early winter mist', url: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1200&q=70' },
  11: { keyword: 'winter festive lights', url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1200&q=70' },
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOLIDAYS = {
  '1-1': 'New Year',
  '1-26': 'Republic Day',
  '8-15': 'Independence Day',
  '10-2': 'Gandhi Jayanti',
  '12-25': 'Christmas',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function buildDateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function buildKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMonthKey(year, month) {
  return `month-${year}-${String(month + 1).padStart(2, '0')}`;
}

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [notes, setNotes] = useState(() => {
  const saved = localStorage.getItem("calendar-notes");
  return saved ? JSON.parse(saved) : {};
  });
  const [noteInput, setNoteInput] = useState('');
  const [activeNoteKey, setActiveNoteKey] = useState(buildMonthKey(today.getFullYear(), today.getMonth()));
  const [darkMode, setDarkMode] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const yearMenuRef = useRef(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const heroInfo = MONTH_HERO[currentMonth] || {
    keyword: 'nature landscape',
    url: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=70',
  };
  const imgSrc = imgFailed
    ? 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=70'
    : `${heroInfo.url}&fm=webp`;

  const baseYears = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);
  const yearOptions = [currentYear, ...baseYears.filter((y) => y !== currentYear)];

  useEffect(() => {
    setImgLoaded(false);
    setImgFailed(false);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    setActiveNoteKey((prev) =>
      prev.startsWith('month-') ? buildMonthKey(currentYear, currentMonth) : prev
    );
  }, [currentMonth, currentYear]);

  useEffect(() => {
    setNoteInput(notes[activeNoteKey] || '');
  }, [activeNoteKey, notes]);

  useEffect(() => {
  localStorage.setItem("calendar-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.body.classList.toggle('app-dark', darkMode);
    return () => document.body.classList.remove('app-dark');
  }, [darkMode]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (yearMenuRef.current && !yearMenuRef.current.contains(event.target)) {
        setYearMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function setDisplayedMonth(year, month, useFlip = false) {
    if (year < YEAR_MIN || year > YEAR_MAX) return;
    const apply = () => {
      setCurrentMonth(month);
      setCurrentYear(year);
      setStartDate(null);
      setEndDate(null);
      setHoveredDate(null);
      setActiveNoteKey(buildMonthKey(year, month));
      setAnimating(false);
    };
    if (!useFlip) { apply(); return; }
    setAnimating(true);
    setTimeout(apply, 250);
  }

  function changeMonth(dir) {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setDisplayedMonth(y, m, true);
  }

  function handleMonthJump(nextMonth) {
    setDisplayedMonth(currentYear, Number(nextMonth), false);
  }

  function handleYearJump(nextYear) {
    setDisplayedMonth(Number(nextYear), currentMonth, false);
    setYearMenuOpen(false);
  }

  function makeKey(day) {
    return buildKey(currentYear, currentMonth, day);
  }

  function handleDayClick(day) {
    const key = makeKey(day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate(null);
      setActiveNoteKey(key);
      return;
    }
    const start = buildDateFromKey(startDate);
    const clicked = buildDateFromKey(key);
    if (clicked < start) {
      setStartDate(key);
      setEndDate(null);
      setActiveNoteKey(key);
    } else {
      setEndDate(key);
      setActiveNoteKey(key);
    }
  }

  function isInRange(day) {
    if (!startDate) return false;
    const key = makeKey(day);
    const cellDate = buildDateFromKey(key);
    const start = buildDateFromKey(startDate);
    const end = endDate ? buildDateFromKey(endDate) : (hoveredDate ? buildDateFromKey(hoveredDate) : null);
    if (!end) return false;
    const lo = start < end ? start : end;
    const hi = start < end ? end : start;
    return cellDate > lo && cellDate < hi;
  }

  function dayState(day) {
    const key = makeKey(day);
    if (key === startDate) return 'start';
    if (key === endDate) return 'end';
    if (isInRange(day)) return 'range';
    return '';
  }

  function saveNote(val) {
    setNotes((prev) => ({ ...prev, [activeNoteKey]: val }));
    setNoteInput(val);
  }

  function clearSelection() {
    setStartDate(null);
    setEndDate(null);
    setHoveredDate(null);
    setActiveNoteKey(buildMonthKey(currentYear, currentMonth));
  }

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthDays = getDaysInMonth(prevMonthYear, prevMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + i + 1, type: 'overflow', source: 'prev' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'current' });
  }
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay++, type: 'overflow', source: 'next' });
  }

  const monthKey = buildMonthKey(currentYear, currentMonth);
  const isMonthNote = activeNoteKey === monthKey;
  const noteLabelText = isMonthNote
    ? `Notes — ${MONTH_NAMES[currentMonth]} ${currentYear}`
    : `Notes — ${activeNoteKey}`;

  const visibleNoteKeys = Object.keys(notes).filter((k) => {
    if (!notes[k]) return false;
    return (
      k.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`) ||
      k === monthKey
    );
  });

  return (
    <div className={`cal-root ${darkMode ? 'dark' : ''} ${animating ? 'is-flipping' : ''}`}>
      {/* Spiral bar at top */}
      <div className="spiral-bar">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      <div className={`cal-card ${animating ? 'page-flip' : ''}`}>

        {/* ── TOP HALF: Hero image ── */}
        <div className="cal-hero">
          <img
            src={imgSrc}
            alt={`${MONTH_NAMES[currentMonth]} hero`}
            className={`hero-img ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (!imgFailed) { setImgFailed(true); setImgLoaded(false); return; }
              setImgLoaded(true);
            }}
            loading="eager"
            decoding="async"
          />
          <div className="hero-overlay" />

          {/* Month + Year label on hero */}
          <div className="hero-month-label">
            <span className="hero-year">{currentYear}</span>
            <span className="hero-month">{MONTH_NAMES[currentMonth].toUpperCase()}</span>
          </div>

          {/* Dark/Light toggle */}
          <button
            className="theme-btn"
            onClick={() => setDarkMode((d) => !d)}
            type="button"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* ── BOTTOM HALF: Notes (left) + Calendar grid (right) ── */}
        <div className="cal-bottom">

          {/* LEFT: Notes panel */}
          <div className="notes-panel">
            <div className="notes-header">
              <StickyNote size={13} />
              <span>{noteLabelText}</span>
              {(startDate || endDate) && (
                <button className="clear-btn" onClick={clearSelection} title="Clear selection" type="button">
                  <X size={11} />
                </button>
              )}
            </div>

            {startDate && (
              <div className="range-info">
                <span className="range-dot start-dot" />
                <span>{startDate}</span>
                {endDate && (
                  <>
                    <span className="range-arrow"><ArrowRight size={11} strokeWidth={2.2} /></span>
                    <span className="range-dot end-dot" />
                    <span>{endDate}</span>
                  </>
                )}
              </div>
            )}

            {/* Lined notepad lines */}
            <div className="notepad-lines">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="notepad-line" />
              ))}
            </div>

            <textarea
              className="notes-area"
              placeholder="Tap a date or range to add notes…"
              value={noteInput}
              onChange={(e) => saveNote(e.target.value)}
            />

            {/* Note pips */}
            {visibleNoteKeys.length > 0 && (
              <div className="note-dots">
                {visibleNoteKeys.map((k) => (
                  <div
                    key={k}
                    className={`note-pip ${activeNoteKey === k ? 'active' : ''}`}
                    onClick={() => setActiveNoteKey(k)}
                    title={k}
                    role="button"
                    tabIndex={0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Calendar grid panel */}
          <div className="grid-panel">
            {/* Month nav */}
            <div className="month-nav">
              <button onClick={() => changeMonth(-1)} type="button" aria-label="Previous month">
                <ChevronLeft size={15} />
              </button>

              <div className="month-nav-center">
                <span className="month-title">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                <div className="jump-controls">
                  <select
                    className="jump-select"
                    aria-label="Select month"
                    value={currentMonth}
                    onChange={(e) => handleMonthJump(e.target.value)}
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>{name}</option>
                    ))}
                  </select>

                  <div className="year-select-wrap" ref={yearMenuRef}>
                    <button
                      type="button"
                      className="jump-select year-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={yearMenuOpen}
                      aria-label="Select year"
                      onClick={() => setYearMenuOpen((o) => !o)}
                    >
                      <span>{currentYear}</span>
                      <ChevronDown size={13} />
                    </button>
                    {yearMenuOpen && (
                      <div className="year-menu" role="listbox" aria-label="Years">
                        {yearOptions.map((year) => (
                          <button
                            key={year}
                            type="button"
                            role="option"
                            aria-selected={year === currentYear}
                            className={`year-item ${year === currentYear ? 'active' : ''}`}
                            onClick={() => handleYearJump(year)}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => changeMonth(1)} type="button" aria-label="Next month">
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Day headers */}
            <div className="day-headers">
              {DAY_NAMES.map((d) => (
                <div key={d} className={`day-header ${d === 'Sat' || d === 'Sun' ? 'weekend' : ''}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="day-grid">
              {cells.map((cell, i) => {
                const colIndex = i % 7;
                const isWeekend = colIndex >= 5;

                if (cell.type === 'overflow') {
                  return (
                    <div
                      key={`${cell.source}-${cell.day}-${i}`}
                      className={`day-cell overflow ${isWeekend ? 'weekend' : ''}`}
                    >
                      <span className="day-num">{cell.day}</span>
                    </div>
                  );
                }

                const state = dayState(cell.day);
                const isToday =
                  cell.day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();
                const holiday = HOLIDAYS[`${currentMonth + 1}-${cell.day}`];
                const hasNote = notes[makeKey(cell.day)];
                const isSingleDate = state === 'start' && !endDate;

                return (
                  <div
                    key={cell.day}
                    className={`day-cell ${state} ${isSingleDate ? 'single-date' : ''} ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
                    onClick={() => handleDayClick(cell.day)}
                    onMouseEnter={() => startDate && !endDate && setHoveredDate(makeKey(cell.day))}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={holiday || ''}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="day-num">{cell.day}</span>
                    {holiday && <span className="holiday-dot" title={holiday}>●</span>}
                    {hasNote && <span className="note-indicator">·</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}