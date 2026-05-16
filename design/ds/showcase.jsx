/* global React, ReactDOM, Icon, WindowChrome, SectionLabel, Card, TabPill, Button, StatRow, EditableText, Checkbox, ListRow, Donut, Segmented, Chip, StreakGrid, Dialog, Tooltip, ToastProvider, useToast, DropdownMenu, Toggle, Tabs, Slider, Avatar, Skeleton, EmptyState */
// Design System Showcase

const { useState: useStateDS } = React;

const palette = [
  { name: '--ds-stage',       label: 'Stage' },
  { name: '--ds-window',      label: 'Window' },
  { name: '--ds-panel',       label: 'Panel' },
  { name: '--ds-panel-2',     label: 'Panel raised' },
  { name: '--ds-overlay',     label: 'Overlay' },
  { name: '--ds-line',        label: 'Line' },
  { name: '--ds-line-soft',   label: 'Line soft' },
  { name: '--ds-line-strong', label: 'Line strong' },
];
const textShades = [
  { name: '--ds-fg',         label: 'Foreground' },
  { name: '--ds-fg-muted',   label: 'Muted' },
  { name: '--ds-fg-dim',     label: 'Dim' },
  { name: '--ds-fg-faint',   label: 'Faint' },
];
const accentSwatches = [
  { name: '--ds-accent',       label: 'Accent' },
  { name: '--ds-accent-soft',  label: 'Accent soft' },
  { name: '--ds-accent-faint', label: 'Accent faint' },
];
const semantic = [
  { name: '--ds-c-amber',  label: 'Amber'  },
  { name: '--ds-c-rose',   label: 'Rose'   },
  { name: '--ds-c-violet', label: 'Violet' },
  { name: '--ds-c-sky',    label: 'Sky'    },
  { name: '--ds-c-mint',   label: 'Mint'   },
  { name: '--ds-c-sand',   label: 'Sand'   },
];

function Swatch({ name, label, large }) {
  return (
    <div className="dsx-swatch">
      <div className={'dsx-swatch__chip' + (large ? ' dsx-swatch__chip--lg' : '')} style={{ background: `var(${name})` }} />
      <div className="dsx-swatch__meta">
        <div className="dsx-swatch__label">{label}</div>
        <div className="dsx-swatch__name ds-mono">{name}</div>
      </div>
    </div>
  );
}

function Tile({ title, subtitle, children, span = 1, scroll }) {
  return (
    <section className="dsx-tile" style={{ gridColumn: `span ${span}` }}>
      <header className="dsx-tile__head">
        <div className="ds-section-label">{title}</div>
        {subtitle && <div className="dsx-tile__sub ds-mono">{subtitle}</div>}
      </header>
      <div className={'dsx-tile__body' + (scroll ? ' dsx-tile__body--scroll' : '')}>{children}</div>
    </section>
  );
}

function TypeRow({ name, size, sample, mono }) {
  return (
    <div className="dsx-typerow">
      <span className="dsx-typerow__label ds-mono">{name}</span>
      <span className="dsx-typerow__size ds-mono">{size}</span>
      <span className={'dsx-typerow__sample' + (mono ? ' ds-mono' : '')} style={{ fontSize: size }}>{sample}</span>
    </div>
  );
}

function DSApp() {
  const [seg, setSeg] = useStateDS('focus');
  const [chips, setChips] = useStateDS({ time: true, words: false, quote: false });
  const [check1, setCheck1] = useStateDS(false);
  const [check2, setCheck2] = useStateDS(true);
  const [editable, setEditable] = useStateDS('Double-click to edit');
  const [dlgOpen, setDlgOpen] = useStateDS(false);
  const [tabVal,  setTabVal]  = useStateDS('tokens');
  const [tog1,    setTog1]    = useStateDS(true);
  const [tog2,    setTog2]    = useStateDS(false);
  const [slider,  setSlider]  = useStateDS(60);

  return (
    <ToastProvider>
      <DSAppInner
        seg={seg} setSeg={setSeg}
        chips={chips} setChips={setChips}
        check1={check1} setCheck1={setCheck1}
        check2={check2} setCheck2={setCheck2}
        editable={editable} setEditable={setEditable}
        dlgOpen={dlgOpen} setDlgOpen={setDlgOpen}
        tabVal={tabVal} setTabVal={setTabVal}
        tog1={tog1} setTog1={setTog1}
        tog2={tog2} setTog2={setTog2}
        slider={slider} setSlider={setSlider}
      />
    </ToastProvider>
  );
}

function DSAppInner(p) {
  const { seg, setSeg, chips, setChips, check1, setCheck1, check2, setCheck2, editable, setEditable, dlgOpen, setDlgOpen, tabVal, setTabVal, tog1, setTog1, tog2, setTog2, slider, setSlider } = p;
  const toast = useToast();

  return (
    <div className="ds-stage">
      <div className="ds-glow" />

      <div className="ftf-window-wrap">
        <div className="ds-window">
          <WindowChrome right={<><ThemeToggle /><a className="ftf-design-link" href="starter.html">← Starter</a></>} />

          <div className="dsx">
            <header className="dsx-hero">
              <span className="ds-section-label">Dark Workspace · Design System</span>
              <h1 className="dsx-hero__title">A calm, dark workspace.<br/><span className="ds-dim">Amber-tinted. Quiet by default.</span></h1>
              <p className="dsx-hero__lede">A small, composable kit for dark-aesthetic apps. Tokens drive everything &mdash; swap a hue, change density, the system follows.</p>
            </header>

            <div className="dsx-grid">

              {/* ── Colors ─────────────────────────────────── */}
              <Tile title="Surfaces" subtitle="background → window → panel" span={2}>
                <div className="dsx-swatches">
                  {palette.map(s => <Swatch key={s.name} {...s} large />)}
                </div>
              </Tile>

              <Tile title="Text" subtitle="contrast cascade">
                <div className="dsx-swatches">
                  {textShades.map(s => (
                    <div key={s.name} className="dsx-swatch">
                      <div className="dsx-swatch__chip" style={{ background: 'var(--ds-panel)', color: `var(${s.name})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ds-font-mono)', fontSize: 11 }}>Aa</div>
                      <div className="dsx-swatch__meta">
                        <div className="dsx-swatch__label">{s.label}</div>
                        <div className="dsx-swatch__name ds-mono">{s.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tile>

              <Tile title="Accent" subtitle="one hue, three weights">
                <div className="dsx-swatches">
                  {accentSwatches.map(s => <Swatch key={s.name} {...s} large />)}
                </div>
                <div className="dsx-divider" />
                <div className="dsx-swatches">
                  {semantic.map(s => <Swatch key={s.name} {...s} />)}
                </div>
                <p className="dsx-note">Role colors share chroma + lightness, vary hue.</p>
              </Tile>

              {/* ── Typography ─────────────────────────────── */}
              <Tile title="Type" subtitle="Geist + Geist Mono" span={2}>
                <TypeRow name="display"   size="36px" sample="First Things First" />
                <TypeRow name="title"     size="24px" sample="Weekly planning, quietly." />
                <TypeRow name="heading"   size="17px" sample="Sharpen the saw" />
                <TypeRow name="body"      size="13px" sample="Each role carries goals; goals become time blocks; the calendar records the cost." />
                <TypeRow name="caption"   size="12px" sample="Wed · 14:00 · 1.5h" />
                <TypeRow name="micro"     size="10px" sample="UPPERCASE LABEL · MONO" mono />
              </Tile>

              {/* ── Section label ──────────────────────────── */}
              <Tile title="Section labels" subtitle="mono · uppercase · 0.12em">
                <div className="ds-col" style={{gap: 14}}>
                  <span className="ds-section-label"><Icon name="target" size={11} />Week Metrics</span>
                  <span className="ds-section-label"><Icon name="history" size={11} />History</span>
                  <span className="ds-section-label"><Icon name="users" size={11} />Roles &amp; Goals</span>
                  <span className="ds-section-label"><Icon name="flame" size={11} />Daily Streak</span>
                </div>
              </Tile>

              {/* ── Tab pills ──────────────────────────────── */}
              <Tile title="Tab Pills" subtitle="workspaces · sessions">
                <div className="ds-row" style={{gap: 8, flexWrap: 'wrap'}}>
                  <TabPill icon="calendar" label="Week of May 11" onAdd={() => {}} />
                  <TabPill icon="target"   label="Plan"          onClose={() => {}} />
                  <TabPill icon="sparkle"  label="Sharpen"       onClose={() => {}} />
                </div>
              </Tile>

              {/* ── Buttons ────────────────────────────────── */}
              <Tile title="Buttons" subtitle="ghost · default · accent">
                <div className="ds-row" style={{gap: 8, flexWrap: 'wrap'}}>
                  <Button variant="ghost">Ghost</Button>
                  <Button>Default</Button>
                  <Button variant="accent" icon="plus">New role</Button>
                </div>
                <div className="ds-row" style={{gap: 8, flexWrap: 'wrap', marginTop: 10}}>
                  <Button size="sm" variant="ghost">Small</Button>
                  <Button size="icon"><Icon name="settings" /></Button>
                  <Button size="icon-sm"><Icon name="plus" /></Button>
                </div>
              </Tile>

              {/* ── Segmented / chips ──────────────────────── */}
              <Tile title="Segmented & Chips" subtitle="for view filters">
                <div className="ds-col" style={{gap: 14}}>
                  <Segmented value={seg} onChange={setSeg} options={[
                    { value: 'focus',     label: 'Focus' },
                    { value: 'precise',   label: 'Precise' },
                    { value: 'character', label: 'Character' },
                  ]} />
                  <div className="ds-row" style={{gap: 6, flexWrap: 'wrap'}}>
                    <Chip icon="clock"    on={chips.time}  onClick={() => setChips(c => ({...c, time: !c.time}))}>time</Chip>
                    <Chip                  on={chips.words} onClick={() => setChips(c => ({...c, words: !c.words}))}>words</Chip>
                    <Chip icon="sparkle"  on={chips.quote} onClick={() => setChips(c => ({...c, quote: !c.quote}))}>quote</Chip>
                  </div>
                </div>
              </Tile>

              {/* ── Inputs ─────────────────────────────────── */}
              <Tile title="Inputs" subtitle="bare · framed · editable">
                <div className="ds-col" style={{gap: 10}}>
                  <input className="ds-input" placeholder="Type your input here…" />
                  <input className="ds-input ds-input--bare" defaultValue="Bare input — appears framed only on focus" />
                  <div style={{padding: '6px 0'}}>
                    <EditableText value={editable} onSave={setEditable} className="ds-listrow__title" as="span" />
                  </div>
                </div>
              </Tile>

              {/* ── Checkboxes ─────────────────────────────── */}
              <Tile title="Checkboxes" subtitle="tap, persist, line-through">
                <div className="ds-col" style={{gap: 8}}>
                  <div className="ds-row" style={{gap: 8}}>
                    <Checkbox checked={check1} onChange={setCheck1} />
                    <span className={check1 ? 'ds-listrow__title--done' : ''}>Click to toggle</span>
                  </div>
                  <div className="ds-row" style={{gap: 8}}>
                    <Checkbox checked={check2} onChange={setCheck2} />
                    <span className={check2 ? 'ds-listrow__title--done' : ''}>Ship the design system</span>
                  </div>
                </div>
              </Tile>

              {/* ── Stat rows ──────────────────────────────── */}
              <Tile title="Stat rows" subtitle="label · value · optional accent">
                <StatRow label="Planned"   value={<><span>29.5</span><span className="ds-dim ds-mono" style={{marginLeft: 3, fontSize: 11}}>h</span></>} />
                <StatRow label="Unfilled"  value="10.5h" accent />
                <StatRow label="Completed" value="3 / 29" />
                <StatRow label="Cost"      value="$0.000" />
              </Tile>

              {/* ── Donut ──────────────────────────────────── */}
              <Tile title="Progress donut" subtitle="completed / total">
                <div className="ds-row" style={{gap: 20, alignItems: 'center'}}>
                  <Donut completed={2} total={5} size={56} />
                  <Donut completed={5} total={5} size={36} />
                  <Donut completed={1} total={4} size={28} />
                  <Donut completed={0} total={3} size={20} />
                </div>
              </Tile>

              {/* ── Streak ─────────────────────────────────── */}
              <Tile title="Streak grid" subtitle="7-day rolling">
                <StreakGrid days={[2,2,1,2,2,2,0]} />
                <div style={{marginTop: 10}} className="ds-uppercase-label">M T W T F S S</div>
              </Tile>

              {/* ── List row ──────────────────────────────── */}
              <Tile title="List row" subtitle="goals · history · saw items" span={2}>
                <div className="ds-col" style={{gap: 6}}>
                  <ListRow color="var(--ds-c-amber)"  title="Close Q2 fundraise narrative" meta={<><span>Founder</span><span>·</span><span>4h scheduled</span></>} />
                  <ListRow color="var(--ds-c-violet)" title="Pair on auth refactor" meta={<><span>Technical Lead</span><span>·</span><span>1.5h scheduled</span></>} />
                  <ListRow color="var(--ds-c-mint)"   title="Finish Habit 3 chapter" checked meta={<><span>Self</span><span>·</span><span>done</span></>} onCheck={() => {}} />
                </div>
              </Tile>

              {/* ── Spacing scale ─────────────────────────── */}
              <Tile title="Spacing" subtitle="4px base">
                <div className="ds-col" style={{gap: 6}}>
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <div key={n} className="dsx-space">
                      <span className="ds-mono ds-dim" style={{width: 40, fontSize: 10}}>s-{n}</span>
                      <div className="dsx-space__bar" style={{ width: `var(--ds-s-${n})` }} />
                      <span className="ds-mono" style={{fontSize: 10, color: 'var(--ds-fg-muted)'}}>{[4,8,12,16,20,24,32,48][n-1]}px</span>
                    </div>
                  ))}
                </div>
              </Tile>

              {/* ── Radii ─────────────────────────────────── */}
              <Tile title="Radii" subtitle="xs → pill">
                <div className="ds-row" style={{gap: 10, flexWrap: 'wrap'}}>
                  {['xs','sm','md','lg','xl','pill'].map(r => (
                    <div key={r} className="dsx-radii">
                      <div className="dsx-radii__box" style={{ borderRadius: `var(--ds-r-${r})` }} />
                      <span className="ds-mono" style={{fontSize: 10, color: 'var(--ds-fg-muted)'}}>r-{r}</span>
                    </div>
                  ))}
                </div>
              </Tile>

              {/* ── Iconography ───────────────────────────── */}
              <Tile title="Icons" subtitle="1.4px stroke" span={2}>
                <div className="dsx-icons">
                  {['menu','settings','close','minimize','maximize','plus','x','chevronDown','chevronLeft','chevronRight','trash','edit','check','clock','target','history','book','calendar','sun','moon','flame','coffee','users','sparkle','grid','send'].map(n => (
                    <div key={n} className="dsx-icon">
                      <Icon name={n} size={16} />
                      <span className="ds-mono">{n}</span>
                    </div>
                  ))}
                </div>
              </Tile>

              {/* ── Overlays: Dialog · Tooltip · Toast · DropdownMenu ─── */}
              <Tile title="Dialog & Toast" subtitle="modal · transient">
                <div className="ds-col" style={{gap: 8}}>
                  <Button variant="accent" onClick={() => setDlgOpen(true)}>Open dialog</Button>
                  <Button onClick={() => toast({ title: 'Saved', message: 'Your changes are persisted.', kind: 'success' })}>Show success toast</Button>
                  <Button variant="ghost" onClick={() => toast({ message: 'Something went wrong.', kind: 'error' })}>Show error toast</Button>
                </div>
                <Dialog
                  open={dlgOpen}
                  onClose={() => setDlgOpen(false)}
                  title="Delete this role?"
                  footer={<><Button onClick={() => setDlgOpen(false)}>Cancel</Button><Button variant="accent" onClick={() => { setDlgOpen(false); toast({ message: 'Role deleted', kind: 'success' }); }}>Delete</Button></>}
                >
                  This will also delete all goals attached to this role. The action can&rsquo;t be undone.
                </Dialog>
              </Tile>

              <Tile title="Tooltip" subtitle="hover · 200ms delay">
                <div className="ds-row" style={{gap: 14, justifyContent: 'center', padding: '12px 0'}}>
                  <Tooltip label="Add new item"><Button size="icon" variant="ghost"><Icon name="plus" /></Button></Tooltip>
                  <Tooltip label="Settings" side="bottom"><Button size="icon" variant="ghost"><Icon name="settings" /></Button></Tooltip>
                  <Tooltip label="Delete" side="right"><Button size="icon" variant="ghost"><Icon name="trash" /></Button></Tooltip>
                </div>
              </Tile>

              <Tile title="Dropdown menu" subtitle="trigger · items · keyboard">
                <div className="ds-row" style={{justifyContent: 'flex-start'}}>
                  <DropdownMenu
                    trigger={<Button icon="settings">Options <Icon name="chevronDown" size={11} /></Button>}
                    items={[
                      { label: 'Rename', icon: 'edit', kbd: '⌘R',  onClick: () => toast('Renamed') },
                      { label: 'Duplicate', icon: 'plus', kbd: '⌘D', onClick: () => toast('Duplicated') },
                      { kind: 'separator' },
                      { label: 'Delete', icon: 'trash', danger: true, onClick: () => toast({ message: 'Deleted', kind: 'error' }) },
                    ]}
                  />
                </div>
              </Tile>

              {/* ── Tabs / Toggle / Slider ─────────────────────── */}
              <Tile title="Tabs" subtitle="multi-panel" span={2}>
                <Tabs value={tabVal} onChange={setTabVal} tabs={[
                  { value: 'tokens',     label: 'Tokens',     icon: 'grid' },
                  { value: 'components', label: 'Components', icon: 'sparkle' },
                  { value: 'patterns',   label: 'Patterns',   icon: 'book' },
                ]} />
                <div className="ds-tabs__panel">
                  {tabVal === 'tokens'     && <p style={{margin: 0, color: 'var(--ds-fg-muted)'}}>Tokens live in <span className="ds-mono ds-accent-fg">ds/tokens.css</span>. Surfaces, text, accent, role colors, radii, spacing, type scale, motion.</p>}
                  {tabVal === 'components' && <p style={{margin: 0, color: 'var(--ds-fg-muted)'}}>Components are in <span className="ds-mono ds-accent-fg">ds/components.jsx</span>. Drop into a <span className="ds-mono">&lt;script type=&quot;text/babel&quot;&gt;</span> after React + Babel.</p>}
                  {tabVal === 'patterns'   && <p style={{margin: 0, color: 'var(--ds-fg-muted)'}}>Compose a window shell with <span className="ds-mono">&lt;WindowChrome&gt;</span> + content + the <span className="ds-mono">.ds-glow</span> element. The signature stays.</p>}
                </div>
              </Tile>

              <Tile title="Toggle & Slider" subtitle="on/off · range">
                <div className="ds-col" style={{gap: 14}}>
                  <Toggle checked={tog1} onChange={setTog1} label="Enable notifications" />
                  <Toggle checked={tog2} onChange={setTog2} label="Reduced motion" />
                  <Slider value={slider} onChange={setSlider} label="Density" min={20} max={100} />
                </div>
              </Tile>

              {/* ── Avatar / Skeleton / Empty ─────────────────── */}
              <Tile title="Avatar" subtitle="initials · image · accent">
                <div className="ds-row" style={{gap: 10, alignItems: 'center'}}>
                  <Avatar name="Roland T" size="sm" />
                  <Avatar name="Roland T" />
                  <Avatar name="Roland T" size="lg" />
                  <Avatar name="RT" accent />
                </div>
              </Tile>

              <Tile title="Skeleton" subtitle="shimmer placeholder">
                <div className="ds-col" style={{gap: 8}}>
                  <Skeleton height={14} width="60%" />
                  <Skeleton height={10} width="90%" />
                  <Skeleton height={10} width="75%" />
                  <Skeleton height={10} width="40%" />
                </div>
              </Tile>

              <Tile title="Empty state" subtitle="zero data fallback">
                <EmptyState icon="calendar" title="No items yet" action={<Button variant="accent" size="sm" icon="plus">Add one</Button>}>
                  Start by adding your first item. It will show up here.
                </EmptyState>
              </Tile>

              {/* ── Composition note ──────────────────────── */}
              <Tile title="Window shell" subtitle="chrome · glow · panel" span={3}>
                <div className="dsx-shell-demo">
                  <div className="dsx-shell-demo__chrome">
                    <div className="dsx-shell-demo__group">
                      <span className="ds-mono dsx-shell-demo__tag">menu</span>
                      <span className="ds-mono dsx-shell-demo__tag">·</span>
                      <span className="ds-mono dsx-shell-demo__tag">settings</span>
                    </div>
                    <div className="dsx-shell-demo__group">
                      <span className="ds-mono dsx-shell-demo__tag">— □ ×</span>
                    </div>
                  </div>
                  <div className="dsx-shell-demo__content">
                    <div>
                      <p className="ds-uppercase-label" style={{marginBottom: 8}}>Anatomy</p>
                      <ul className="dsx-list">
                        <li><span className="ds-num">01</span>Stage — the canvas behind everything</li>
                        <li><span className="ds-num">02</span>Glow — the warm amber halo (signature)</li>
                        <li><span className="ds-num">03</span>Window — hairline-bordered card</li>
                        <li><span className="ds-num">04</span>Chrome — menu/settings, traffic lights</li>
                        <li><span className="ds-num">05</span>Sections — flat, separated by space alone</li>
                      </ul>
                    </div>
                    <div>
                      <p className="ds-uppercase-label" style={{marginBottom: 8}}>Rules</p>
                      <ul className="dsx-list">
                        <li><span className="ds-num">→</span>Never two heavy colors. One accent.</li>
                        <li><span className="ds-num">→</span>Borders are hairlines. No filled buttons.</li>
                        <li><span className="ds-num">→</span>Labels are mono uppercase. Body is sans.</li>
                        <li><span className="ds-num">→</span>Numbers are tabular. Time is mono.</li>
                        <li><span className="ds-num">→</span>The glow stays. It is the brand.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Tile>

            </div>

            <footer className="dsx-footer">
              <span className="ds-section-label">Dark Workspace Kit · v0.2</span>
              <a className="ftf-design-link" href="starter.html" style={{margin: 0}}>Open the starter template →</a>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DSApp />);
