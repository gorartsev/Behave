import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../lib/db'
import { Page, SectionTitle, Tile } from '../components/ui'

export default function Habits() {
  const habits = useLiveQuery(() => db.habits.orderBy('createdAt').reverse().toArray()) ?? []
  const active = habits.filter(h => h.active)
  const archived = habits.filter(h => !h.active)
  const good = active.filter(h => h.kind === 'good')
  const bad = active.filter(h => h.kind === 'bad')
  return (
    <Page title="ПРИВЫЧКИ">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Tile to="/habits/new" accent>
          <div className="font-display text-2xl leading-none">+ хорошая</div>
          <div className="text-[11px] uppercase tracking-widest mt-2">построить</div>
        </Tile>
        <Tile to="/habits/break">
          <div className="font-display text-2xl leading-none">× плохая</div>
          <div className="text-[11px] uppercase tracking-widest mt-2">сломать</div>
        </Tile>
      </div>

      <SectionTitle kicker={`good · ${good.length}`} title="Строю" />
      <ul className="space-y-2 mb-6">
        {good.map(h => (
          <li key={h.id}>
            <Link to={`/habits/${h.id}`} className="tile flex items-center justify-between gap-3 hover:bg-pink-50">
              <div className="min-w-0">
                <div className="font-bold truncate">{h.title}</div>
                <div className="text-[11px] uppercase tracking-widest text-ink/60">голос за · {h.identityTag || '—'}</div>
              </div>
              <span className="text-pink-500">→</span>
            </Link>
          </li>
        ))}
        {good.length === 0 && <li className="text-sm text-ink/60">Ничего ещё не строишь.</li>}
      </ul>

      <SectionTitle kicker={`bad · ${bad.length}`} title="Ломаю" />
      <ul className="space-y-2 mb-6">
        {bad.map(h => (
          <li key={h.id}>
            <Link to={`/habits/${h.id}`} className="tile flex items-center justify-between gap-3 hover:bg-pink-50">
              <div className="min-w-0">
                <div className="font-bold truncate">{h.title}</div>
                <div className="text-[11px] uppercase tracking-widest text-ink/60">не сорваться</div>
              </div>
              <span className="text-pink-500">→</span>
            </Link>
          </li>
        ))}
        {bad.length === 0 && <li className="text-sm text-ink/60">Все плохие сломаны.</li>}
      </ul>

      {archived.length > 0 && (
        <>
          <SectionTitle kicker={`архив · ${archived.length}`} title="Архив" sub="Привычки, которые ты отложил. Историю цепи можно посмотреть, открыв привычку." />
          <ul className="space-y-2">
            {archived.map(h => (
              <li key={h.id}>
                <Link to={`/habits/${h.id}`} className="tile flex items-center justify-between gap-3 hover:bg-pink-50 opacity-60">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{h.title}</div>
                    <div className="text-[11px] uppercase tracking-widest text-ink/60">{h.kind === 'good' ? 'хорошая' : 'плохая'} · {h.identityTag || '—'}</div>
                  </div>
                  <span className="text-pink-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  )
}
