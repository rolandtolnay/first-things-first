# First Things First

Help users focus on what matters by making the connection between life roles, weekly goals, and scheduled time explicit and actionable.

Built with Next.js, React, Zustand, dnd-kit, and Dexie (IndexedDB).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Manual Testing Checklist

There are no automated tests. After making changes, verify the following:

- **Sidebar**: Add, edit (double-click), and delete roles and goals
- **Calendar**: Drag goals to day priorities, time grid, and evening slots
- **Calendar**: Drag time blocks and priorities between days
- **Evening**: Drag evening blocks between days
- **Delete**: Delete buttons work on all item types (roles, goals, priorities, time blocks, evening blocks)
- **Dark mode**: Toggle works without visual issues
