/* global React */
// FTF Design System — reusable React components
// All component class names are prefixed `ds-` to match tokens.css.

const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ── Icons (inline SVGs, stroke-based) ─────────────────────────
const Icon = ({ name, size = 14, ...rest }) => {
  const paths = {
    menu:    <><path d="M3 6h12M3 10h12M3 14h12" /></>,
    settings:<><circle cx="11.5" cy="5.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M3 5.5h7M13 5.5h2M3 12.5h2M9 12.5h6"/></>,
    close:   <><path d="M4 4l10 10M14 4L4 14" /></>,
    minimize:<><path d="M3 9h12" /></>,
    maximize:<><rect x="3.5" y="3.5" width="11" height="11" rx="1" /></>,
    plus:    <><path d="M9 3v12M3 9h12" /></>,
    x:       <><path d="M4 4l10 10M14 4L4 14" /></>,
    chevronDown: <><path d="M4 7l5 5 5-5" /></>,
    chevronLeft: <><path d="M11 4L5 9l6 5" /></>,
    chevronRight:<><path d="M7 4l6 5-6 5" /></>,
    trash:   <><path d="M3 5h12M7 5V3.5h4V5M5 5l1 10h6l1-10" /></>,
    edit:    <><path d="M3 15h3l8.5-8.5-3-3L3 12v3z" /></>,
    grip:    <><circle cx="7" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="7" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="13" r="1" fill="currentColor" stroke="none"/></>,
    check:   <><path d="M3 9l4 4 8-9" /></>,
    clock:   <><circle cx="9" cy="9" r="6.5"/><path d="M9 5.5V9l2.5 2"/></>,
    target:  <><circle cx="9" cy="9" r="6.5"/><circle cx="9" cy="9" r="3"/><circle cx="9" cy="9" r="0.6" fill="currentColor" stroke="none"/></>,
    history: <><path d="M3 9a6 6 0 1 0 6-6"/><path d="M3 3v3h3"/><path d="M9 5v4l2.5 2"/></>,
    book:    <><path d="M3 4h5a2 2 0 0 1 2 2v9"/><path d="M15 4h-5a2 2 0 0 0-2 2v9"/><path d="M3 4v10h6"/><path d="M15 4v10H9"/></>,
    calendar:<><rect x="3" y="4" width="12" height="11" rx="1.5"/><path d="M3 7.5h12M6.5 2.5v3M11.5 2.5v3"/></>,
    sun:     <><circle cx="9" cy="9" r="3"/><path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M3.8 3.8l1 1M13.2 13.2l1 1M3.8 14.2l1-1M13.2 4.8l1-1"/></>,
    moon:    <><path d="M14 10a5.5 5.5 0 0 1-6.5-7.5A6 6 0 1 0 14 10z"/></>,
    flame:   <><path d="M9 16c2.5 0 5-2 5-5 0-2.5-2-3.5-2-5.5 0-1.2.5-2 .5-2S10 4 9 6.5C8 5 7 3 6 2 5 4 4 5 4 7c0 4 2.5 5 2.5 5S5 13 5 14c0 1 1.5 2 4 2z"/></>,
    coffee:  <><path d="M3 7h10v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"/><path d="M13 8h1.5a1.5 1.5 0 0 1 0 3H13"/><path d="M5 3v2M8 3v2M11 3v2"/></>,
    users:   <><circle cx="7" cy="7" r="2.5"/><path d="M2.5 14a4.5 4.5 0 0 1 9 0"/><circle cx="13" cy="6" r="2"/><path d="M11 13.5a3.5 3.5 0 0 1 5.5-2.5"/></>,
    sparkle: <><path d="M9 3v3M9 12v3M3 9h3M12 9h3M5 5l1.5 1.5M11.5 11.5L13 13M13 5l-1.5 1.5M5 13l1.5-1.5"/></>,
    grid:    <><rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/></>,
    moveH:   <><path d="M5 9h8M5 9l2-2M5 9l2 2M13 9l-2-2M13 9l-2 2"/></>,
    send:    <><path d="M15 3L8 10M15 3l-5 13-2-6-6-2 13-5z"/></>,
  };
  const stroke = name === 'grip' ? 0 : 1.4;
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name] || null}
    </svg>
  );
};

// ── Window chrome ────────────────────────────────────────────
function WindowChrome({ left, right, title }) {
  return (
    <div className="ds-chrome">
      <div className="ds-chrome__group">
        <button className="ds-chrome__btn ds-chrome__btn--menu" aria-label="Menu">
          <span className="ds-chrome__lines"><i/><i/><i/></span>
          <span>Menu</span>
        </button>
        <button className="ds-chrome__btn" aria-label="Settings"><Icon name="settings" /></button>
        {left}
      </div>
      <div className="ds-chrome__group" style={{gap: 4}}>
        {right}
        <button className="ds-chrome__btn" aria-label="Minimize"><Icon name="minimize" /></button>
        <button className="ds-chrome__btn" aria-label="Maximize"><Icon name="maximize" size={11} /></button>
        <button className="ds-chrome__btn" aria-label="Close"><Icon name="close" /></button>
      </div>
    </div>
  );
}

// ── Section label ───────────────────────────────────────────
function SectionLabel({ icon, children, action, style }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10, ...style}}>
      <span className="ds-section-label">
        {icon && <Icon name={icon} size={11} />}
        {children}
      </span>
      {action}
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────
function Card({ className = '', children, style, inset, ghost, ...rest }) {
  const cls = ['ds-card', inset && 'ds-card--inset', ghost && 'ds-card--ghost', className].filter(Boolean).join(' ');
  return <div className={cls} style={style} {...rest}>{children}</div>;
}

// ── Tab Pill ────────────────────────────────────────────────
function TabPill({ icon, label, onClose, onAdd, active }) {
  return (
    <span className="ds-tabpill" style={active ? {borderColor: 'var(--ds-line-strong)'} : null}>
      {icon && <span className="ds-tabpill__icon"><Icon name={icon} size={11} /></span>}
      <span>{label}</span>
      {onClose && <button className="ds-tabpill__close" onClick={onClose} aria-label="Close tab"><Icon name="x" size={10} /></button>}
      {onAdd   && <button className="ds-tabpill__add"   onClick={onAdd}   aria-label="New tab"><Icon name="plus" size={10} /></button>}
    </span>
  );
}

// ── Button ──────────────────────────────────────────────────
function Button({ variant = 'default', size, icon, children, className = '', ...rest }) {
  const cls = [
    'ds-btn',
    variant === 'accent' && 'ds-btn--accent',
    variant === 'ghost'  && 'ds-btn--ghost',
    size === 'sm'        && 'ds-btn--sm',
    size === 'icon'      && 'ds-btn--icon',
    size === 'icon-sm'   && 'ds-btn--icon-sm',
    className
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
}

// ── Stat row ────────────────────────────────────────────────
function StatRow({ label, value, accent }) {
  return (
    <div className="ds-statrow">
      <span className="ds-statrow__label">{label}</span>
      <span className={'ds-statrow__value' + (accent ? ' ds-statrow__value--accent' : '')}>{value}</span>
    </div>
  );
}

// ── Editable text (double-click to edit) ─────────────────────
function EditableText({ value, onSave, className = '', placeholder = '', as = 'span' }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  const ref = useRef(null);
  useEffect(() => { setV(value); }, [value]);
  useEffect(() => { if (editing && ref.current) { ref.current.focus(); ref.current.select(); } }, [editing]);
  const save = () => { const t = v.trim(); if (t && t !== value) onSave(t); else setV(value); setEditing(false); };
  const cancel = () => { setV(value); setEditing(false); };
  if (editing) {
    return (
      <input
        ref={ref}
        className={'ds-input ds-input--bare ' + className}
        value={v}
        onChange={e => setV(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); else if (e.key === 'Escape') cancel(); }}
        placeholder={placeholder}
      />
    );
  }
  const Tag = as;
  return <Tag className={className} onDoubleClick={() => setEditing(true)} style={{cursor: 'text'}}>{value || <span className="ds-dim">{placeholder}</span>}</Tag>;
}

// ── Checkbox ────────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      className={'ds-listrow__check' + (checked ? ' ds-listrow__check--on' : '')}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
    />
  );
}

// ── List row ────────────────────────────────────────────────
function ListRow({ checked, onCheck, title, meta, color, action, onClick, onDoubleClick, draggable, onDragStart, onDragEnd }) {
  return (
    <div
      className="ds-listrow"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{position: 'relative'}}
    >
      {onCheck && <Checkbox checked={!!checked} onChange={onCheck} />}
      {color && <span className="ds-dot" style={{background: color, marginTop: 6}} />}
      <div className="ds-listrow__body">
        <div className={'ds-listrow__title' + (checked ? ' ds-listrow__title--done' : '')}>{title}</div>
        {meta && <div className="ds-listrow__meta">{meta}</div>}
      </div>
      {action}
    </div>
  );
}

// ── Donut pie chart (completed / total) ─────────────────────
function Donut({ completed, total, size = 28, color }) {
  const r = size/2 - 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? completed / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--ds-line)" strokeWidth="2" />
      {total > 0 && (
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color || 'var(--ds-accent)'}
          strokeWidth="2"
          strokeDasharray={`${c*pct} ${c}`}
          strokeDashoffset={c*0.25}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      )}
    </svg>
  );
}

// ── Segmented control ──────────────────────────────────────
function Segmented({ value, onChange, options }) {
  return (
    <div className="ds-seg">
      {options.map(opt => (
        <button key={opt.value} className={value === opt.value ? 'is-on' : ''} onClick={() => onChange(opt.value)}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Chip toggle ────────────────────────────────────────────
function Chip({ on, icon, children, onClick }) {
  return (
    <button className={'ds-chip' + (on ? ' ds-chip--on' : '')} onClick={onClick}>
      {icon && <Icon name={icon} size={11} />}
      {children}
    </button>
  );
}

// ── Streak grid ────────────────────────────────────────────
function StreakGrid({ days = [] }) {
  return (
    <div className="ds-streak">
      {days.map((d, i) => (
        <div key={i} className={'ds-streak__cell' + (d === 2 ? ' ds-streak__cell--on' : d === 1 ? ' ds-streak__cell--mid' : '')} />
      ))}
    </div>
  );
}

// ── Theme toggle (Dark / Light) ─────────────────────────────
// Reads / writes the `.ds-light` class on <html>. Persists in localStorage.
function ThemeToggle({ storageKey = 'ds-theme' }) {
  const [mode, setMode] = useState(() => {
    if (typeof document === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return document.documentElement.classList.contains('ds-light') ? 'light' : 'dark';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('ds-light', mode === 'light');
    try { localStorage.setItem(storageKey, mode); } catch (e) {}
  }, [mode, storageKey]);
  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <button
      className="ds-chrome__btn"
      onClick={() => setMode(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={13} />
    </button>
  );
}

// ── Dialog / modal ──────────────────────────────────────────
function Dialog({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ds-dialog-backdrop" onClick={onClose} role="presentation">
      <div className="ds-dialog" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={width ? {maxWidth: width} : null}>
        {title && (
          <div className="ds-dialog__head">
            <div className="ds-dialog__title">{title}</div>
            <button className="ds-chrome__btn" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
          </div>
        )}
        <div className="ds-dialog__body">{children}</div>
        {footer && <div className="ds-dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── Tooltip ─────────────────────────────────────────────────
function Tooltip({ children, label, side = 'top', delay = 200 }) {
  const [show, setShow] = useState(false);
  const t = useRef(null);
  const enter = () => { t.current = setTimeout(() => setShow(true), delay); };
  const leave = () => { clearTimeout(t.current); setShow(false); };
  return (
    <span className="ds-tt-wrap" onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      {children}
      {show && <span className={'ds-tt ds-tt--' + side} role="tooltip">{label}</span>}
    </span>
  );
}

// ── Toast ───────────────────────────────────────────────────
const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    const t = typeof toast === 'string' ? { message: toast } : toast;
    setToasts(prev => [...prev, { id, ...t }]);
    const duration = t.duration ?? 3500;
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), duration);
    }
    return id;
  }, []);
  const dismiss = useCallback((id) => setToasts(prev => prev.filter(x => x.id !== id)), []);
  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="ds-toasts" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <div key={t.id} className={'ds-toast' + (t.kind ? ' ds-toast--' + t.kind : '')}>
            <div style={{flex: 1}}>
              {t.title && <div className="ds-toast__title">{t.title}</div>}
              <div className={t.title ? 'ds-toast__body' : ''}>{t.message}</div>
            </div>
            <button className="ds-toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="x" size={11} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.push;
}

// ── Dropdown menu ───────────────────────────────────────────
function DropdownMenu({ trigger, items = [], align = 'start' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey   = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <span className="ds-menu-wrap" ref={ref}>
      <span onClick={() => setOpen(o => !o)} style={{display: 'inline-flex'}}>{trigger}</span>
      {open && (
        <div className={'ds-menu ds-menu--' + align} role="menu">
          {items.map((it, i) =>
            it.kind === 'separator' ? <hr key={i} className="ds-menu__sep" /> : (
              <button
                key={i}
                role="menuitem"
                className={'ds-menu__item' + (it.danger ? ' ds-menu__item--danger' : '')}
                onClick={() => { it.onClick?.(); setOpen(false); }}
              >
                {it.icon && <Icon name={it.icon} size={12} />}
                <span>{it.label}</span>
                {it.kbd && <span className="ds-menu__item-kbd">{it.kbd}</span>}
              </button>
            )
          )}
        </div>
      )}
    </span>
  );
}

// ── Toggle (on/off switch) ──────────────────────────────────
function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className="ds-toggle" style={disabled ? {opacity: 0.5, cursor: 'not-allowed'} : null}>
      <span className={'ds-toggle__track' + (checked ? ' is-on' : '')}>
        <span className="ds-toggle__thumb" />
      </span>
      {label && <span className="ds-toggle__label">{label}</span>}
      <input type="checkbox" className="ds-sr" checked={!!checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} />
    </label>
  );
}

// ── Tabs ────────────────────────────────────────────────────
function Tabs({ value, onChange, tabs }) {
  return (
    <div className="ds-tabs">
      <div className="ds-tabs__list" role="tablist">
        {tabs.map(t => (
          <button
            key={t.value}
            role="tab"
            aria-selected={value === t.value}
            className={'ds-tabs__tab' + (value === t.value ? ' is-on' : '')}
            onClick={() => onChange(t.value)}
          >
            {t.icon && <Icon name={t.icon} size={12} />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Slider ──────────────────────────────────────────────────
function Slider({ value, onChange, min = 0, max = 100, step = 1, label }) {
  return (
    <div className="ds-col" style={{gap: 6}}>
      {label && (
        <div className="ds-row" style={{justifyContent: 'space-between'}}>
          <span className="ds-uppercase-label">{label}</span>
          <span className="ds-mono ds-num" style={{fontSize: 11, color: 'var(--ds-fg)'}}>{value}</span>
        </div>
      )}
      <input
        type="range" className="ds-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange?.(Number(e.target.value))}
      />
    </div>
  );
}

// ── Avatar ──────────────────────────────────────────────────
function Avatar({ name = '', src, size = 'md', accent }) {
  const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('');
  return (
    <span
      className={'ds-avatar ds-avatar--' + size + (accent ? ' ds-avatar--accent' : '')}
      title={name}
      aria-label={name}
    >
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

// ── Skeleton ────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 12, radius }) {
  return <span className="ds-skel" style={{ width, height, borderRadius: radius }} />;
}

// ── Empty state ─────────────────────────────────────────────
function EmptyState({ icon, title, children, action }) {
  return (
    <div className="ds-empty">
      {icon && <div className="ds-empty__icon"><Icon name={icon} size={24} /></div>}
      <div className="ds-empty__title">{title}</div>
      {children && <div className="ds-empty__sub">{children}</div>}
      {action && <div style={{marginTop: 8}}>{action}</div>}
    </div>
  );
}

// Export to window for cross-script use
Object.assign(window, {
  Icon, WindowChrome, SectionLabel, Card, TabPill, Button, StatRow,
  EditableText, Checkbox, ListRow, Donut, Segmented, Chip, StreakGrid,
  Dialog, Tooltip, ToastProvider, useToast,
  DropdownMenu, Toggle, Tabs, Slider, Avatar, Skeleton, EmptyState,
  ThemeToggle,
});
