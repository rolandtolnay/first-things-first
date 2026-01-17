# Project Brief: Habit 3 Weekly Planner

## Overview

A web-based weekly planning tool implementing Stephen Covey's Habit 3 ("Put First Things First") principles from *The 7 Habits of Highly Effective People*. The application enables role-based goal setting and time-block scheduling to help users focus on Quadrant II activities (important but not urgent).

## Problem Statement

Tracking weekly goals across life roles using spreadsheets is functional but lacks interactivity, mobile access, and the polish of a dedicated tool. The current Google Sheets approach requires manual cell management and doesn't scale well across devices.

## Core Concepts

**Roles**: Areas of responsibility in life (e.g., Entrepreneur, Technical Lead, Parent, Friend). Each role represents a "hat" the user wears.

**Goals**: Weekly objectives tied to specific roles. These are the outcomes the user commits to achieving within the week.

**Time Blocks**: Scheduled periods when goals are actively worked on. Goals manifest as concrete calendar commitments.

**Sharpen the Saw**: Covey's Habit 7 renewal categories—Physical, Mental, Spiritual, Social/Emotional—with recurring personal commitments.

---

## Functional Requirements

### 1. Role & Goal Management

- Create, edit, delete roles (user-defined list)
- Each role supports multiple goals per week
- Goals are text-based with optional notes
- Visual association between roles and their goals

### 2. Weekly Calendar View

**Daily Priorities Section**
- Free-form area at the top of each day
- Quick capture for "must accomplish today" items
- Not time-bound, serves as daily focus reminder

**Time Block Schedule**
- Hours displayed: 8:00 – 20:00 (configurable)
- **30-minute granularity** for scheduling
- Goals can span multiple consecutive blocks
- Visual indication of which role/goal a block belongs to

**Freestyle Blocks**
- Ad-hoc entries not tied to weekly goals (e.g., "Workout", "Doctor appointment")
- Distinct visual treatment from goal-linked blocks

### 3. Sharpen the Saw Section

Four hardcoded categories:
1. **Physical** (1-3 goals)
2. **Mental** (1-3 goals)
3. **Spiritual** (1-3 goals)
4. **Social/Emotional** (1-3 goals)

These represent ongoing renewal commitments, not necessarily scheduled but tracked for the week.

### 4. Week Navigation

- View current week by default
- Navigate to previous/next weeks
- Week number and date range displayed

---

## Non-Functional Requirements

### Desktop Experience (Primary)
- Full weekly view visible without horizontal scrolling on standard monitors (1440px+)
- All roles, goals, and 7-day calendar visible simultaneously
- Drag-and-drop for scheduling goals into time blocks (stretch goal)

### Mobile Experience (Secondary)
- Single-day view as default
- Swipe or tap navigation between days
- Ability to add goals to roles
- Ability to schedule goals for selected day
- Sharpen the Saw section accessible but collapsed

### Data Persistence
- Local storage for MVP (no account required)
- Future: Optional cloud sync/account system

---

## User Flows

### Weekly Planning Session (Desktop)
1. User opens app at start of week
2. Reviews/updates roles if needed
3. Adds 1-3 goals per active role
4. Defines Sharpen the Saw commitments
5. Schedules high-priority goals into specific time blocks
6. Adds known appointments/commitments

### Daily Execution (Desktop or Mobile)
1. User checks today's priorities section
2. Reviews scheduled time blocks
3. Adds freestyle blocks as day unfolds
4. Optionally marks goals complete (stretch)

---

## Design Direction

- Clean, minimal aesthetic—avoid visual clutter
- Color coding by role for quick scanning
- Sufficient contrast for time block boundaries
- Typography-forward (the content is text-heavy)
- Inspired by the spreadsheet layout but with modern spacing and interaction patterns

---

## Technical Considerations

**Suggested Stack** (to be validated during planning):
- React or Vue for component architecture
- CSS Grid for the calendar layout
- Local Storage API for persistence
- Responsive breakpoints: Desktop (1200px+), Tablet (768px-1199px), Mobile (<768px)

**Key UI Components**:
- Role/Goal sidebar panel
- 7-day calendar grid
- Time block cells (interactive)
- Sharpen the Saw panel
- Day detail modal/view (mobile)

---

## Out of Scope (MVP)

- User accounts and authentication
- Multi-week analytics or reporting
- Recurring goal templates
- Calendar integrations (Google Calendar, etc.)
- Collaboration/sharing features
- Goal completion tracking with history

---

## Open Questions

1. Should goals be checkable/completable, or is this purely a planning tool?
2. What happens to unscheduled goals—visual indicator? Carry-forward to next week?
3. Should time blocks support overlapping entries (parallel work)?
4. Evening hours (20:00+)—include or cut off?
5. How strictly to replicate the spreadsheet aesthetic vs. modernize freely?

---

## Success Criteria

- User can complete a full weekly planning session in under 10 minutes
- Week view renders correctly on 1440px+ screens without scrolling
- Mobile users can view and edit a single day's schedule effectively
- Data persists across browser sessions

---

## Next Steps

1. Validate brief and answer open questions
2. Create wireframes for desktop and mobile views
3. Define component hierarchy and state management approach
4. Build static layout prototype
5. Implement interactivity incrementally