import { NavLink } from 'react-router-dom'

const items = [
  { to: '/',          label: 'ДЕНЬ',     icon: '◉' },
  { to: '/habits',    label: 'ПРИВЫЧКИ', icon: '▣' },
  { to: '/scorecard', label: 'АУДИТ',    icon: '✎' },
  { to: '/review',    label: 'ОБЗОР',    icon: '↻' },
  { to: '/identity',  label: 'Я',        icon: '☼' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-pb px-3 pb-2">
      <div className="max-w-xl mx-auto bg-paper border-2 border-ink rounded-2xl shadow-brutal flex justify-between p-1.5">
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            className={({ isActive }) =>
              `flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[9px] tracking-widest font-bold uppercase transition-colors ${
                isActive ? 'bg-pink-500 text-paper' : 'text-ink hover:bg-pink-100'
              }`
            }
          >
            <span className="text-base leading-none">{it.icon}</span>
            <span className="truncate max-w-full">{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
