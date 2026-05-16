/* global React, useFTF, DAYS, DAY_NUMS, HOURS, SLOTS_PER_HOUR, TOTAL_SLOTS, SLOT_PX, TODAY_INDEX, formatTimeFromSlot, SectionLabel, Icon, Donut, Button, EditableText, Checkbox, TabPill */
// Calendar — Week navigation + Day columns (priorities, time grid, evenings)

const { useState: useStateCal, useMemo: useMemoCal, useRef: useRefCal, useEffect: useEffectCal } = React;

// ── Week navigation header ─────────────────────────────────
function WeekNav({ weekLabel, onPrev, onNext, onToday }) {
  return (
    <div className="ftf-weeknav">
      <div className="ftf-weeknav__left">
        <TabPill icon="calendar" label={weekLabel} onAdd={() => {}} />
      </div>
      <div className="ftf-weeknav__center">
        <Button size="icon-sm" variant="ghost" onClick={onPrev} aria-label="Previous week"><Icon name="chevronLeft" size={13} /></Button>
        <button className="ftf-weeknav__today" onClick={onToday}>Today</button>
        <Button size="icon-sm" variant="ghost" onClick={onNext} aria-label="Next week"><Icon name="chevronRight" size={13} /></Button>
      </div>
      <div className="ftf-weeknav__right">
        <span className="ds-uppercase-label">Wk 20</span>
        <span className="ds-dim ds-mono" style={{fontSize: 10}}>·</span>
        <span className="ds-uppercase-label">May 2026</span>
      </div>
    </div>
  );
}

// ── Day header (day name + date number + donut) ────────────
function DayHeader({ dayIdx, isToday }) {
  const { dayStats } = useFTF();
  const { done, total } = dayStats(dayIdx);
  return (
    <div className="ftf-day__header" style={isToday ? {borderColor: 'var(--ds-line-strong)'} : null}>
      <div className="ftf-day__head-left">
        <span className="ds-uppercase-label" style={{fontSize: 10, letterSpacing: '0.14em'}}>{DAYS[dayIdx]}</span>
        {isToday ? (
          <span className="ftf-day__date-today ds-num">{DAY_NUMS[dayIdx]}</span>
        ) : (
          <span className="ftf-day__date ds-num">{DAY_NUMS[dayIdx]}</span>
        )}
      </div>
      <Donut completed={done} total={total} size={22} />
    </div>
  );
}

// ── Day priorities (free-form list at top of day) ──────────
function DayPriorities({ dayIdx }) {
  const { priorities, setPriorities } = useFTF();
  const list = useMemoCal(() => priorities.filter(p => p.day === dayIdx), [priorities, dayIdx]);
  const [adding, setAdding] = useStateCal(false);
  const [draft, setDraft] = useStateCal('');

  const toggle = (id) => setPriorities(ps => ps.map(p => p.id === id ? { ...p, done: !p.done } : p));
  const edit   = (id, v) => setPriorities(ps => ps.map(p => p.id === id ? { ...p, text: v } : p));
  const del    = (id) => setPriorities(ps => ps.filter(p => p.id !== id));
  const add = () => {
    const t = draft.trim();
    if (!t) { setAdding(false); setDraft(''); return; }
    setPriorities(ps => [...ps, { id: 'p' + Date.now(), day: dayIdx, text: t, done: false }]);
    setDraft('');
    setAdding(false);
  };

  return (
    <div className="ftf-day__priorities">
      <div className="ftf-day__priorities-head">
        <span className="ds-uppercase-label" style={{fontSize: 9}}>Priorities</span>
        <button className="ftf-day__priorities-add" onClick={() => setAdding(true)} aria-label="Add priority">
          <Icon name="plus" size={10} />
        </button>
      </div>
      <ul className="ftf-day__priorities-list">
        {list.map(p => (
          <li key={p.id} className={'ftf-priority' + (p.done ? ' ftf-priority--done' : '')}>
            <button
              className={'ds-listrow__check' + (p.done ? ' ds-listrow__check--on' : '')}
              onClick={() => toggle(p.id)}
            />
            <EditableText value={p.text} onSave={(v) => edit(p.id, v)} className="ftf-priority__text" as="span" />
            <button className="ftf-priority__del" onClick={() => del(p.id)} aria-label="Delete">
              <Icon name="x" size={10} />
            </button>
          </li>
        ))}
        {adding && (
          <input
            autoFocus
            className="ds-input ds-input--bare ftf-priority__input"
            placeholder="Quick capture…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
          />
        )}
      </ul>
    </div>
  );
}

// ── Time block card (inside day column grid) ────────────────
function TimeBlockCard({ block, role, goal, onDelete, onDragStart }) {
  const top = block.start * SLOT_PX;
  const height = block.span * SLOT_PX - 2;
  const color = role?.color || 'var(--ds-c-sand)';
  return (
    <div
      className={'ftf-block' + (block.free ? ' ftf-block--free' : '') + (block.span <= 2 ? ' ftf-block--short' : '')}
      style={{
        top,
        height,
        '--block-color': color,
      }}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, block)}
    >
      <div className="ftf-block__stripe" />
      <div className="ftf-block__body">
        <div className="ftf-block__title">{block.label || goal?.text || 'Untitled'}</div>
        <div className="ftf-block__meta">
          <span>{formatTimeFromSlot(block.start)}</span>
          <span className="ds-dim">·</span>
          <span>{block.span * 0.5}h</span>
          {block.free && <span className="ftf-block__tag">free</span>}
        </div>
      </div>
      <button className="ftf-block__del" onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} aria-label="Delete block">
        <Icon name="x" size={10} />
      </button>
    </div>
  );
}

// ── Day column: priorities + time grid + evening ────────────
function DayColumn({ dayIdx }) {
  const { blocks, setBlocks, evenings, setEvenings, roleById, goalById } = useFTF();
  const isToday = dayIdx === TODAY_INDEX;
  const dayBlocks = useMemoCal(() => blocks.filter(b => b.day === dayIdx), [blocks, dayIdx]);
  const dayEvenings = useMemoCal(() => evenings.filter(e => e.day === dayIdx), [evenings, dayIdx]);
  const [hoverSlot, setHoverSlot] = useStateCal(null);
  const gridRef = useRefCal(null);

  const onDropGoal = (e, slotIndex) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/x-ftf-goal');
    const blockData = e.dataTransfer.getData('application/x-ftf-block');
    setHoverSlot(null);
    if (data) {
      const { goalId, roleId } = JSON.parse(data);
      const goal = goalById[goalId];
      setBlocks(bs => [...bs, {
        id: 'b' + Date.now(),
        day: dayIdx, start: slotIndex, span: 2,
        goalId, role: roleId, label: goal?.text
      }]);
    } else if (blockData) {
      const { blockId } = JSON.parse(blockData);
      setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, day: dayIdx, start: slotIndex } : b));
    }
  };

  const onDragOverGrid = (e) => {
    if (e.dataTransfer.types.includes('application/x-ftf-goal') || e.dataTransfer.types.includes('application/x-ftf-block')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/x-ftf-block') ? 'move' : 'copy';
      const rect = gridRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slot = Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(y / SLOT_PX)));
      setHoverSlot(slot);
    }
  };

  const onBlockDragStart = (e, block) => {
    e.dataTransfer.setData('application/x-ftf-block', JSON.stringify({ blockId: block.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const deleteBlock = (id) => setBlocks(bs => bs.filter(b => b.id !== id));
  const deleteEvening = (id) => setEvenings(es => es.filter(e => e.id !== id));

  return (
    <div className={'ftf-day' + (isToday ? ' ftf-day--today' : '')}>
      <DayHeader dayIdx={dayIdx} isToday={isToday} />
      <DayPriorities dayIdx={dayIdx} />
      <div
        ref={gridRef}
        className="ftf-day__grid"
        style={{ height: TOTAL_SLOTS * SLOT_PX }}
        onDragOver={onDragOverGrid}
        onDragLeave={() => setHoverSlot(null)}
        onDrop={(e) => onDropGoal(e, hoverSlot ?? 0)}
      >
        {/* hour grid lines */}
        {HOURS.map((_, i) => (
          <div key={i} className="ftf-day__hour-line" style={{ top: i * SLOTS_PER_HOUR * SLOT_PX }} />
        ))}
        {HOURS.map((_, i) => (
          <div key={'h'+i} className="ftf-day__half-line" style={{ top: i * SLOTS_PER_HOUR * SLOT_PX + SLOT_PX }} />
        ))}
        {/* current time indicator on today */}
        {isToday && (() => {
          const now = new Date();
          const h = now.getHours();
          const m = now.getMinutes();
          if (h < 8 || h >= 21) return null;
          const offset = ((h - 8) * 60 + m) / 30 * SLOT_PX;
          return (
            <div className="ftf-now" style={{ top: offset }}>
              <span className="ftf-now__dot" />
              <span className="ftf-now__line" />
            </div>
          );
        })()}
        {/* drop preview */}
        {hoverSlot !== null && (
          <div className="ftf-drop-preview" style={{ top: hoverSlot * SLOT_PX, height: SLOT_PX * 2 - 2 }} />
        )}
        {/* blocks */}
        {dayBlocks.map(b => (
          <TimeBlockCard
            key={b.id}
            block={b}
            role={roleById[b.role]}
            goal={goalById[b.goalId]}
            onDelete={deleteBlock}
            onDragStart={onBlockDragStart}
          />
        ))}
      </div>
      {/* Evening */}
      <div className="ftf-day__evening">
        <div className="ftf-day__priorities-head">
          <span className="ds-uppercase-label" style={{fontSize: 9}}>Evening</span>
          <button className="ftf-day__priorities-add" aria-label="Add evening"><Icon name="plus" size={10} /></button>
        </div>
        {dayEvenings.map(ev => {
          const role = roleById[ev.role];
          return (
            <div key={ev.id} className="ftf-evening" style={{'--block-color': role?.color}}>
              <span className="ds-dot" style={{background: role?.color}} />
              <span className="ftf-evening__text">{ev.label}</span>
              <button className="ftf-evening__del" onClick={() => deleteEvening(ev.id)} aria-label="Delete">
                <Icon name="x" size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Time labels column ─────────────────────────────────────
function TimeLabels() {
  return (
    <div className="ftf-timelabels">
      {/* spacer for day header */}
      <div className="ftf-timelabels__spacer ftf-timelabels__spacer--head" />
      <div className="ftf-timelabels__spacer ftf-timelabels__spacer--priorities" />
      <div className="ftf-timelabels__grid" style={{ height: TOTAL_SLOTS * SLOT_PX }}>
        {HOURS.map((h, i) => (
          <div key={i} className="ftf-timelabels__hour" style={{ top: i * SLOTS_PER_HOUR * SLOT_PX - 6 }}>
            <span className="ds-mono">{String(h).padStart(2, '0')}</span>
            <span className="ds-dim ds-mono">:00</span>
          </div>
        ))}
      </div>
      <div className="ftf-timelabels__spacer ftf-timelabels__spacer--evening" />
    </div>
  );
}

// ── Calendar root ──────────────────────────────────────────
function Calendar() {
  const [weekOffset, setWeekOffset] = useStateCal(0);
  const baseLabel = 'Week of May 11';
  const label = weekOffset === 0 ? baseLabel : weekOffset > 0 ? `+${weekOffset}w` : `${weekOffset}w`;

  return (
    <section className="ftf-calendar">
      <WeekNav
        weekLabel={label}
        onPrev={() => setWeekOffset(w => w - 1)}
        onNext={() => setWeekOffset(w => w + 1)}
        onToday={() => setWeekOffset(0)}
      />
      <div className="ftf-calendar__grid ds-scroll">
        <TimeLabels />
        <div className="ftf-calendar__days">
          {DAYS.map((_, i) => <DayColumn key={i} dayIdx={i} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Calendar });
