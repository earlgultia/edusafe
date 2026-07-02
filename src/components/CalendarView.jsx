import React, { useState, useMemo } from 'react';

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d) {
  const m = d.getMonth();
  return new Date(d.getFullYear(), m + 1, 0).getDate();
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function CalendarView({ events = [], year, month }) {
  const today = new Date();
  const current = useMemo(() => {
    if (year && typeof month !== 'undefined') return new Date(year, month - 1, 1);
    return startOfMonth(today);
  }, [year, month]);
  const [view, setView] = useState(current);
  const [selectedDate, setSelectedDate] = useState(null);
  const mapByDate = useMemo(() => {
    const m = {};
    (events || []).forEach((ev) => {
      try {
        const dt = new Date(ev.date);
        if (Number.isNaN(dt.getTime())) return;
        const key = formatDateKey(dt);
        m[key] = m[key] || [];
        m[key].push(ev);
      } catch (e) {
        // skip malformed dates
      }
    });
    return m;
  }, [events]);
  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const totalDays = daysInMonth(view);
  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let d = 1; d <= totalDays; d += 1) cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  const prevMonth = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const nextMonth = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
  return (
    <div className="monthCalendar">
      <div className="calendarHeader">
        <button className="smallBtn" onClick={prevMonth} aria-label="Previous month">‹</button>
        <div>
          <strong>{view.toLocaleString(undefined, { month: 'long' })} {view.getFullYear()}</strong>
        </div>
        <button className="smallBtn" onClick={nextMonth} aria-label="Next month">›</button>
      </div>
      <div className="calendarGrid">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="calendarWeekday">{d}</div>)}
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="calendarCell empty" />;
          const key = formatDateKey(cell);
          const list = mapByDate[key] || [];
          const isToday = formatDateKey(cell) === formatDateKey(new Date());
          return (
            <div key={key} className={`calendarCell ${isToday ? 'today' : ''}`} onClick={() => setSelectedDate(cell)}>
              <div className="dateLabel">{cell.getDate()}</div>
              {list.length > 0 && (
                <div className="badges">
                  {list.slice(0,3).map((ev) => <span key={ev.id} className="badge">{ev.title}</span>)}
                  {list.length > 3 && <span className="badge more">+{list.length - 3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div className="sheet overlay" role="dialog" aria-modal="true" onClick={() => setSelectedDate(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: 360 }}>
            <div className="sheetHead">
              <h2>Events on {selectedDate.toLocaleDateString()}</h2>
              <button className="iconButton" onClick={() => setSelectedDate(null)} aria-label="Close">✕</button>
            </div>
            <div style={{ padding: '0.75rem' }}>
              {(mapByDate[formatDateKey(selectedDate)] || []).map((ev) => (
                <article key={ev.id} className="reportRow">
                  <div>
                    <h3>{ev.title}</h3>
                    <p>{ev.date} · {ev.location || 'Campus'}</p>
                    {ev.details && <small>{ev.details}</small>}
                  </div>
                </article>
              ))}
              {(mapByDate[formatDateKey(selectedDate)] || []).length === 0 && <p className="emptyText">No events for this date.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { CalendarView };
