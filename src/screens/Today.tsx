import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db, todayISO, totalVotes, type Habit } from '../lib/db'
import { Brand, Pin, Quote, SectionTitle, StripeBar, Tile } from '../components/ui'

export default function Today() {
  const identity = useLiveQuery(() => db.identity.get('me'))
  const habits = useLiveQuery(() => db.habits.toArray()) ?? []
  const activeHabits = habits.filter(h => h.active)
  const today = todayISO()
  const todays = useLiveQuery(() => db.checkins.where('date').equals(today).toArray(), [today]) ?? []
  const votes = useLiveQuery(() => totalVotes(), []) ?? 0

  const doneSet = new Set(todays.filter(c => c.done).map(c => c.habitId))
  const doneCount = activeHabits.filter(h => doneSet.has(h.id)).length

  const toggle = async (h: Habit, twoMinuteOnly = false) => {
    const id = h.id + today
    const existing = await db.checkins.get(id)
    if (existing?.done) {
      await db.checkins.put({ ...existing, done: false, twoMinuteOnly: false })
    } else {
      await db.checkins.put({
        id,
        habitId: h.id,
        date: today,
        done: true,
        twoMinuteOnly,
        createdAt: Date.now(),
      })
    }
  }

  return (
    <div className="relative min-h-screen safe-pt safe-pb px-5 pb-28">
      <div className="relative z-10 max-w-xl mx-auto">
        <header className="pt-4 mb-2">
          <Brand size="md" />
          <div className="flex items-center justify-between mt-2">
            <span className="label-tag">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span className="label-tag bg-pink-500 text-paper border-pink-500">{doneCount}/{activeHabits.length}</span>
          </div>
          <StripeBar />
        </header>

        {identity && (
          <Tile className="mb-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-ink/60">я — человек, который</div>
            <div className="font-display text-3xl mt-1 text-pink-600">{identity.whoIWantToBe}</div>
            <div className="mt-2 text-xs">голосов отдано: <Pin>{votes}</Pin></div>
          </Tile>
        )}

        {activeHabits.length === 0 ? (
          <Tile className="text-center py-10">
            <div className="font-display text-2xl mb-2">пусто</div>
            <p className="text-sm mb-4">Создай первую привычку — и сделаешь первый шаг.</p>
            <div className="flex gap-2 justify-center">
              <Link to="/habits/new" className="btn btn-primary">+ ХОРОШУЮ</Link>
              <Link to="/habits/break" className="btn btn-ghost">× ПЛОХУЮ</Link>
            </div>
          </Tile>
        ) : (
          <>
            <SectionTitle kicker="01 — сегодня" title="Голосуй" sub="Отметь, что сделал. Каждое выполнение — голос за того, кем ты становишься." />
            <ul className="space-y-3">
              {activeHabits.map(h => {
                const c = todays.find(x => x.habitId === h.id && x.done)
                const done = !!c
                const twoMinOnly = !!c?.twoMinuteOnly
                return (
                  <li key={h.id}>
                    <div className={`tile flex items-center gap-3 ${done ? 'tile-pink' : ''}`}>
                      <button
                        onClick={() => toggle(h)}
                        className={`shrink-0 size-12 grid place-items-center border-2 border-ink rounded-xl text-2xl transition-all ${done ? 'bg-paper text-pink-500' : 'bg-pink-100'}`}
                        aria-label={done ? 'отменить' : 'выполнено'}
                      >
                        {done ? '✓' : '○'}
                      </button>
                      <Link to={`/habits/${h.id}`} className="flex-1 min-w-0">
                        <div className="font-bold text-base truncate">{h.title}</div>
                        <div className={`text-[11px] uppercase tracking-wider ${done ? 'text-paper/80' : 'text-ink/60'}`}>
                          {h.kind === 'good' ? 'голос за' : 'не сорваться'} · {h.identityTag || '—'} {twoMinOnly && '· 2 мин'}
                        </div>
                      </Link>
                      {!done && h.kind === 'good' && h.twoMinute && (
                        <button
                          onClick={() => toggle(h, true)}
                          className="shrink-0 text-[10px] uppercase tracking-widest border-2 border-ink rounded-lg px-2 py-1 bg-paper hover:bg-pink-100"
                          title={`2-минутная версия: ${h.twoMinute}`}
                        >
                          2 мин
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <Quote>«Не прерывай цепочку. Никогда не пропускай дважды. Пропустил один раз — случайность. Дважды подряд — начало новой привычки». — гл. 16</Quote>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Tile to="/habits/new" accent>
                <div className="font-display text-2xl">+ привычка</div>
                <div className="text-[11px] uppercase tracking-widest mt-1">построить хорошую</div>
              </Tile>
              <Tile to="/habits/break">
                <div className="font-display text-2xl">× сломать</div>
                <div className="text-[11px] uppercase tracking-widest mt-1">убить плохую</div>
              </Tile>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
