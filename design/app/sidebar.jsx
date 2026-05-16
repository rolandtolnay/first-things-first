/* global React, useFTF, SectionLabel, Card, Button, Icon, ListRow, Donut, EditableText, Checkbox, StatRow */
// Sidebar — Roles, Goals, Weekly Balance

const { useState: useStateSB, useMemo: useMemoSB } = React;

function GoalRow({ goal, role, onToggle, onEdit, onDelete, onDragStart }) {
  return (
    <div
      className="ftf-goal"
      draggable
      onDragStart={(e) => onDragStart(e, goal)}
    >
      <button
        className={'ds-listrow__check' + (goal.done ? ' ds-listrow__check--on' : '')}
        style={goal.done ? {background: role.color, borderColor: role.color} : null}
        onClick={() => onToggle(goal.id)}
      />
      <EditableText
        className={'ftf-goal__text' + (goal.done ? ' ftf-goal__text--done' : '')}
        value={goal.text}
        onSave={(v) => onEdit(goal.id, v)}
        as="span"
      />
      <button className="ftf-goal__del" onClick={() => onDelete(goal.id)} aria-label="Delete goal">
        <Icon name="x" size={11} />
      </button>
    </div>
  );
}

function RoleSection({ role }) {
  const { goals, setGoals, setRoles, roleHours } = useFTF();
  const roleGoals = useMemoSB(() => goals.filter(g => g.roleId === role.id), [goals, role.id]);
  const [adding, setAdding] = useStateSB(false);
  const [draft, setDraft] = useStateSB('');
  const hours = roleHours(role.id);

  const toggle = (id) => setGoals(gs => gs.map(g => g.id === id ? { ...g, done: !g.done } : g));
  const edit   = (id, v) => setGoals(gs => gs.map(g => g.id === id ? { ...g, text: v } : g));
  const del    = (id) => setGoals(gs => gs.filter(g => g.id !== id));
  const saveRoleName = (v) => setRoles(rs => rs.map(r => r.id === role.id ? { ...r, name: v } : r));

  const addGoal = () => {
    const t = draft.trim();
    if (!t) { setAdding(false); setDraft(''); return; }
    setGoals(gs => [...gs, { id: 'g' + Date.now(), roleId: role.id, text: t, done: false }]);
    setDraft('');
    setAdding(false);
  };

  const onGoalDragStart = (e, goal) => {
    e.dataTransfer.setData('application/x-ftf-goal', JSON.stringify({ goalId: goal.id, roleId: role.id }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="ftf-role" style={{'--role-color': role.color}}>
      <div className="ftf-role__head">
        <span className="ds-dot" style={{background: role.color}} />
        <EditableText value={role.name} onSave={saveRoleName} className="ftf-role__name" as="span" />
        <span className="ftf-role__hours">{hours > 0 ? `${hours}h` : '—'}</span>
        <button className="ftf-role__add" onClick={() => setAdding(true)} aria-label="Add goal">
          <Icon name="plus" size={11} />
        </button>
      </div>
      <div className="ftf-role__goals">
        {roleGoals.map(g => (
          <GoalRow key={g.id} goal={g} role={role}
            onToggle={toggle} onEdit={edit} onDelete={del}
            onDragStart={onGoalDragStart}
          />
        ))}
        {adding && (
          <input
            autoFocus
            className="ds-input ds-input--bare ftf-goal__input"
            placeholder="New goal…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={addGoal}
            onKeyDown={e => { if (e.key === 'Enter') addGoal(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
          />
        )}
      </div>
    </div>
  );
}

function WeeklyBalance() {
  const { roles, roleHours, totalScheduled } = useFTF();
  const data = roles.map(r => ({ r, h: roleHours(r.id) })).filter(d => d.h > 0);
  const max = Math.max(40, totalScheduled);

  return (
    <Card style={{padding: 14}}>
      <SectionLabel icon="grid">Weekly Balance</SectionLabel>
      <div className="ftf-balance">
        <div className="ftf-balance__total">
          <Donut completed={Math.min(totalScheduled, 40)} total={40} size={56} />
          <div className="ftf-balance__total-meta">
            <div className="ftf-balance__total-num ds-num">{totalScheduled}<span className="ds-dim ds-mono" style={{fontSize: 11, marginLeft: 2}}>h</span></div>
            <div className="ds-uppercase-label" style={{fontSize: 9}}>of 40h planned</div>
          </div>
        </div>
        <div className="ftf-balance__bars">
          {data.map(({r, h}) => (
            <div key={r.id} className="ftf-balance__bar">
              <span className="ds-dot" style={{background: r.color}} />
              <span className="ftf-balance__bar-name">{r.name}</span>
              <span className="ftf-balance__bar-track">
                <span className="ftf-balance__bar-fill" style={{background: r.color, width: `${(h/max)*100}%`}} />
              </span>
              <span className="ftf-balance__bar-h ds-num">{h}h</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Sidebar() {
  const { roles, setRoles } = useFTF();
  const [adding, setAdding] = useStateSB(false);
  const [draft, setDraft] = useStateSB('');

  const colors = ['var(--ds-c-amber)','var(--ds-c-violet)','var(--ds-c-rose)','var(--ds-c-mint)','var(--ds-c-sky)','var(--ds-c-sand)'];
  const addRole = () => {
    const t = draft.trim();
    if (!t) { setAdding(false); setDraft(''); return; }
    setRoles(rs => [...rs, { id: 'r' + Date.now(), name: t, color: colors[rs.length % colors.length] }]);
    setDraft('');
    setAdding(false);
  };

  return (
    <aside className="ftf-sidebar ds-scroll">
      <WeeklyBalance />

      <div style={{marginTop: 20}}>
        <SectionLabel icon="users" action={
          <Button size="icon-sm" variant="ghost" onClick={() => setAdding(true)} aria-label="Add role"><Icon name="plus" size={12} /></Button>
        }>Roles &amp; Goals</SectionLabel>

        <div className="ftf-roles">
          {roles.map(r => <RoleSection key={r.id} role={r} />)}
          {adding && (
            <input
              autoFocus
              className="ds-input"
              placeholder="New role…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={addRole}
              onKeyDown={e => { if (e.key === 'Enter') addRole(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
              style={{marginBottom: 8}}
            />
          )}
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
