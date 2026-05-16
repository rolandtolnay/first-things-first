/* global React, useFTF, SectionLabel, Card, Icon, StatRow, EditableText, StreakGrid, Donut, Button */
// Right rail — Sharpen the Saw + Session metrics + History

const { useState: useStateR, useMemo: useMemoR } = React;

function SawItem({ item, onToggle, onEdit, onDelete }) {
  return (
    <div className="ftf-saw-item">
      <button
        className={'ds-listrow__check' + (item.done ? ' ds-listrow__check--on' : '')}
        onClick={() => onToggle(item.id)}
      />
      <EditableText value={item.text} onSave={(v) => onEdit(item.id, v)} className={'ftf-saw-item__text' + (item.done ? ' ftf-saw-item__text--done' : '')} as="span" />
      {item.target !== undefined && (
        <span className="ftf-saw-item__count ds-mono ds-num">
          {item.count || 0}<span className="ds-dim">/{item.target}</span>
        </span>
      )}
      <button className="ftf-saw-item__del" onClick={() => onDelete(item.id)} aria-label="Delete">
        <Icon name="x" size={10} />
      </button>
    </div>
  );
}

function SawCategory({ cat }) {
  const { saw, setSaw } = useFTF();
  const [adding, setAdding] = useStateR(false);
  const [draft, setDraft] = useStateR('');

  const update = (mutator) => setSaw(prev => prev.map(c => c.key === cat.key ? mutator(c) : c));
  const toggle = (id) => update(c => ({...c, items: c.items.map(i => i.id === id ? {...i, done: !i.done} : i)}));
  const edit   = (id, v) => update(c => ({...c, items: c.items.map(i => i.id === id ? {...i, text: v} : i)}));
  const del    = (id) => update(c => ({...c, items: c.items.filter(i => i.id !== id)}));
  const add = () => {
    const t = draft.trim();
    if (!t) { setAdding(false); setDraft(''); return; }
    update(c => ({...c, items: [...c.items, { id: 's'+Date.now(), text: t, done: false }]}));
    setDraft(''); setAdding(false);
  };

  const doneCount = cat.items.filter(i => i.done).length;
  return (
    <div className="ftf-saw">
      <div className="ftf-saw__head">
        <span className="ftf-saw__head-left">
          <Icon name={cat.icon} size={11} />
          <span className="ds-uppercase-label" style={{color: 'var(--ds-fg-muted)'}}>{cat.label}</span>
        </span>
        <span className="ftf-saw__head-right">
          <span className="ds-mono ds-num" style={{fontSize: 10, color: 'var(--ds-fg-dim)'}}>{doneCount}/{cat.items.length}</span>
          <button className="ftf-saw__add" onClick={() => setAdding(true)} aria-label="Add"><Icon name="plus" size={10} /></button>
        </span>
      </div>
      <div className="ftf-saw__items">
        {cat.items.map(item => (
          <SawItem key={item.id} item={item} onToggle={toggle} onEdit={edit} onDelete={del} />
        ))}
        {adding && (
          <input
            autoFocus
            className="ds-input ds-input--bare"
            placeholder="New commitment…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
            style={{marginLeft: 22}}
          />
        )}
      </div>
    </div>
  );
}

function MetricsCard() {
  const { totalScheduled, priorities, blocks, evenings, saw } = useFTF();
  const totalItems = priorities.length + blocks.length + evenings.length;
  const doneItems = priorities.filter(p => p.done).length + blocks.filter(b => b.done).length + evenings.filter(e => e.done).length;
  const sawTotal = saw.reduce((a, c) => a + c.items.length, 0);
  const sawDone  = saw.reduce((a, c) => a + c.items.filter(i => i.done).length, 0);
  const remaining = 40 - totalScheduled;

  return (
    <Card style={{padding: 14}}>
      <SectionLabel icon="target">Week Metrics</SectionLabel>
      <div className="ftf-metrics">
        <StatRow label="Planned" value={<><span>{totalScheduled}</span><span className="ds-dim ds-mono" style={{marginLeft: 3, fontSize: 11}}>h</span></>} />
        <StatRow label="Unfilled" value={<><span className={remaining > 0 ? 'ds-accent-fg' : ''}>{remaining > 0 ? remaining : 0}</span><span className="ds-dim ds-mono" style={{marginLeft: 3, fontSize: 11}}>h</span></>} accent={remaining > 0} />
        <StatRow label="Completed" value={`${doneItems} / ${totalItems}`} />
        <StatRow label="Saw items" value={`${sawDone} / ${sawTotal}`} />
      </div>
    </Card>
  );
}

function StreakCard() {
  // streak: last 7 days, value 0/1/2
  const week = [2, 2, 1, 2, 2, 2, 0];
  return (
    <Card style={{padding: 14}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
        <span className="ds-section-label"><Icon name="flame" size={11} />Daily Streak</span>
        <span className="ds-mono ds-num ds-accent-fg" style={{fontSize: 13, fontWeight: 600}}>6<span className="ds-dim" style={{fontSize: 10, marginLeft: 2}}>d</span></span>
      </div>
      <StreakGrid days={week} />
      <div style={{marginTop: 10}} className="ds-uppercase-label">M T W T F S S</div>
    </Card>
  );
}

function Rail() {
  const { saw } = useFTF();
  return (
    <aside className="ftf-rail ds-scroll">
      <MetricsCard />
      <StreakCard />
      <div>
        <SectionLabel icon="sparkle">Sharpen the Saw</SectionLabel>
        <div className="ftf-saws">
          {saw.map(cat => <SawCategory key={cat.key} cat={cat} />)}
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Rail });
