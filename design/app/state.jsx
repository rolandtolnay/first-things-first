/* global React */
// FTF App State — roles, goals, week schedule

const { useState, useMemo, useEffect, useRef, useCallback, createContext, useContext } = React;

const FTF_ROLES = [
  { id: 'r1', name: 'Founder',       color: 'var(--ds-c-amber)'  },
  { id: 'r2', name: 'Technical Lead', color: 'var(--ds-c-violet)' },
  { id: 'r3', name: 'Parent',         color: 'var(--ds-c-rose)'   },
  { id: 'r4', name: 'Self',           color: 'var(--ds-c-mint)'   },
  { id: 'r5', name: 'Friend',         color: 'var(--ds-c-sky)'    },
];

const FTF_GOALS = [
  { id: 'g1', roleId: 'r1', text: 'Close Q2 fundraise narrative',  done: false },
  { id: 'g2', roleId: 'r1', text: 'Hire 2nd founding engineer',     done: false },
  { id: 'g3', roleId: 'r2', text: 'Ship calendar drag-drop v1',     done: true  },
  { id: 'g4', roleId: 'r2', text: 'Pair on auth refactor',          done: false },
  { id: 'g5', roleId: 'r3', text: 'Bike repair with kids Sat',      done: false },
  { id: 'g6', roleId: 'r4', text: 'Three runs > 5km',               done: false },
  { id: 'g7', roleId: 'r4', text: 'Finish Habit 3 chapter',         done: true  },
  { id: 'g8', roleId: 'r5', text: 'Dinner with M & A',              done: false },
];

const FTF_PRIORITIES = [
  { id: 'p1', day: 0, text: 'Weekly review',          done: true  },
  { id: 'p2', day: 0, text: 'Investor follow-ups',    done: false },
  { id: 'p3', day: 1, text: 'Recruiter intros',       done: false },
  { id: 'p4', day: 2, text: 'Doctor — 14:00',         done: false },
  { id: 'p5', day: 3, text: 'Shipping QA pass',       done: false },
  { id: 'p6', day: 4, text: 'Demo for design partner', done: false },
  { id: 'p7', day: 5, text: 'Family day',             done: false },
];

const FTF_BLOCKS = [
  // day index (0=Mon … 6=Sun), startSlot (slot index from 8:00, 30-min slots), span (slots), goalId or null
  { id: 'b1',  day: 0, start: 2,  span: 4, goalId: 'g1', role: 'r1', label: 'Investor narrative' },
  { id: 'b2',  day: 0, start: 8,  span: 2, goalId: 'g3', role: 'r2', label: 'Drag-drop' },
  { id: 'b3',  day: 0, start: 14, span: 3, goalId: 'g6', role: 'r4', label: 'Run + sauna', free: false },
  { id: 'b4',  day: 1, start: 0,  span: 2, goalId: null, role: 'r4', label: 'Reading hour', free: true },
  { id: 'b5',  day: 1, start: 4,  span: 4, goalId: 'g2', role: 'r1', label: 'Hiring loop' },
  { id: 'b6',  day: 1, start: 12, span: 2, goalId: null, role: 'r3', label: 'School pickup', free: true },
  { id: 'b7',  day: 2, start: 0,  span: 3, goalId: 'g4', role: 'r2', label: 'Auth refactor pair' },
  { id: 'b8',  day: 2, start: 6,  span: 2, goalId: null, role: 'r4', label: 'Lunch run' },
  { id: 'b9',  day: 2, start: 12, span: 2, goalId: null, role: 'r3', label: 'Doctor 14:00', free: true },
  { id: 'b10', day: 3, start: 2,  span: 4, goalId: 'g3', role: 'r2', label: 'QA + polish' },
  { id: 'b11', day: 3, start: 10, span: 2, goalId: 'g7', role: 'r4', label: 'Book — Habit 3' },
  { id: 'b12', day: 4, start: 4,  span: 5, goalId: 'g1', role: 'r1', label: 'Demo prep' },
  { id: 'b13', day: 4, start: 16, span: 2, goalId: null, role: 'r5', label: 'Dinner w/ M & A', free: true },
  { id: 'b14', day: 5, start: 6,  span: 3, goalId: 'g5', role: 'r3', label: 'Bike repair' },
  { id: 'b15', day: 5, start: 12, span: 4, goalId: null, role: 'r3', label: 'Family afternoon', free: true },
  { id: 'b16', day: 6, start: 4,  span: 3, goalId: null, role: 'r4', label: 'Long run' },
];

const FTF_EVENINGS = [
  { id: 'e1', day: 0, role: 'r2', label: 'Read tech RFCs' },
  { id: 'e2', day: 1, role: 'r4', label: 'Journal + plan' },
  { id: 'e3', day: 2, role: 'r3', label: 'Bedtime story' },
  { id: 'e4', day: 3, role: 'r5', label: 'Call N.' },
  { id: 'e5', day: 4, role: 'r4', label: 'Walk' },
  { id: 'e6', day: 5, role: 'r3', label: 'Movie night' },
];

const FTF_SAW = [
  { key: 'physical',  label: 'Physical',     icon: 'flame',   items: [
    { id: 's1', text: '3× runs', done: false, count: 1, target: 3 },
    { id: 's2', text: 'Sleep 7h+ every night', done: false }
  ]},
  { key: 'mental',    label: 'Mental',       icon: 'book',    items: [
    { id: 's3', text: 'Finish Habit 3', done: true },
    { id: 's4', text: '20 pages of fiction', done: false }
  ]},
  { key: 'spiritual', label: 'Spiritual',    icon: 'sparkle', items: [
    { id: 's5', text: 'Daily 10-min sit',     done: false, count: 4, target: 7 },
  ]},
  { key: 'social',    label: 'Social',       icon: 'users',   items: [
    { id: 's6', text: 'Dinner with friends',  done: false },
    { id: 's7', text: 'Call parents',          done: false },
  ]},
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_NUMS = [11, 12, 13, 14, 15, 16, 17]; // May 11-17, 2026 (week of May 16)
const SLOTS_PER_HOUR = 2;
const HOURS = Array.from({length: 13}, (_, i) => i + 8); // 8 → 20
const TOTAL_SLOTS = HOURS.length * SLOTS_PER_HOUR;
const SLOT_PX = 16;
const TODAY_INDEX = 5; // Saturday May 16 — current date is May 16, 2026

function formatTimeFromSlot(slotIndex) {
  const h = Math.floor(slotIndex / SLOTS_PER_HOUR) + 8;
  const m = (slotIndex % SLOTS_PER_HOUR) * 30;
  return `${h}:${m === 0 ? '00' : m}`;
}

function useFTFState() {
  const [roles, setRoles] = useState(FTF_ROLES);
  const [goals, setGoals] = useState(FTF_GOALS);
  const [priorities, setPriorities] = useState(FTF_PRIORITIES);
  const [blocks, setBlocks] = useState(FTF_BLOCKS);
  const [evenings, setEvenings] = useState(FTF_EVENINGS);
  const [saw, setSaw] = useState(FTF_SAW);

  const roleById = useMemo(() => Object.fromEntries(roles.map(r => [r.id, r])), [roles]);
  const goalById = useMemo(() => Object.fromEntries(goals.map(g => [g.id, g])), [goals]);

  const roleHours = useCallback((roleId) => {
    let h = 0;
    for (const b of blocks) if (b.role === roleId) h += b.span * 0.5;
    for (const e of evenings) if (e.role === roleId) h += 1;
    return h;
  }, [blocks, evenings]);

  const totalScheduled = useMemo(() =>
    blocks.reduce((a, b) => a + b.span * 0.5, 0) + evenings.length, [blocks, evenings]);

  const dayStats = useCallback((dayIdx) => {
    const ps = priorities.filter(p => p.day === dayIdx);
    const bs = blocks.filter(b => b.day === dayIdx);
    const es = evenings.filter(e => e.day === dayIdx);
    const total = ps.length + bs.length + es.length;
    const done = ps.filter(p => p.done).length + bs.filter(b => b.done).length + es.filter(e => e.done).length;
    return { total, done };
  }, [priorities, blocks, evenings]);

  return {
    roles, setRoles, goals, setGoals, priorities, setPriorities,
    blocks, setBlocks, evenings, setEvenings, saw, setSaw,
    roleById, goalById, roleHours, totalScheduled, dayStats,
  };
}

const FTFCtx = createContext(null);
const FTFProvider = ({ children }) => {
  const value = useFTFState();
  return React.createElement(FTFCtx.Provider, { value }, children);
};
const useFTF = () => useContext(FTFCtx);

Object.assign(window, {
  FTFProvider, useFTF, DAYS, DAY_NUMS, HOURS, SLOTS_PER_HOUR, TOTAL_SLOTS, SLOT_PX, TODAY_INDEX,
  formatTimeFromSlot,
});
