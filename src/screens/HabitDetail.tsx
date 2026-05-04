import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, todayISO } from '../lib/db'
import { recentCheckins, streakFor } from '../lib/streak'
import { Page, Pin, Quote, SectionTitle, StripeBar, Tile } from '../components/ui'

export default function HabitDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const habit = useLiveQuery(() => db.habits.get(id), [id])
  const [streak, setStreak] = useState({ current: 0, longest: 0, missedTwiceInRow: false, missedYesterday: false })
  const [grid, setGrid] = useState<{ date: string; done: boolean; twoMinuteOnly: boolean }[]>([])
  const today = todayISO()
  const todayCheck = useLiveQuery(() => db.checkins.get(id + today), [id, today])
  const allChecks = useLiveQuery(() => db.checkins.where('habitId').equals(id).toArray(), [id])

  useEffect(() => {
    if (!id) return
    streakFor(id).then(setStreak)
    recentCheckins(id, 35).then(rs =>
      setGrid(rs.map(r => ({ date: r.date, done: r.done, twoMinuteOnly: r.twoMinuteOnly }))),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, allChecks?.length, todayCheck?.done, todayCheck?.twoMinuteOnly])

  if (!habit) return <Page back="/habits" title="ПРИВЫЧКА"><div className="text-sm text-ink/60">Не найдено.</div></Page>

  const toggle = async (twoMinuteOnly = false) => {
    const cid = id + today
    const existing = await db.checkins.get(cid)
    if (existing?.done) {
      await db.checkins.put({ ...existing, done: false, twoMinuteOnly: false })
    } else {
      await db.checkins.put({ id: cid, habitId: id, date: today, done: true, twoMinuteOnly, createdAt: Date.now() })
    }
  }

  const archive = async () => {
    if (!confirm('Архивировать привычку?')) return
    await db.habits.update(id, { active: false, archivedAt: Date.now() })
    nav('/habits')
  }

  const unarchive = async () => {
    await db.habits.update(id, { active: true, archivedAt: undefined })
  }

  const remove = async () => {
    if (!confirm('Удалить навсегда вместе с историей?')) return
    await db.habits.delete(id)
    await db.checkins.where('habitId').equals(id).delete()
    nav('/habits')
  }

  return (
    <Page back="/habits">
      <div className="mb-2">
        <span className="label-tag bg-pink-500 text-paper border-pink-500">
          {habit.kind === 'good' ? 'СТРОЮ ХОРОШУЮ' : 'ЛОМАЮ ПЛОХУЮ'}
        </span>
      </div>
      <h1 className="h-display text-4xl mt-1">{habit.title}</h1>
      <div className="text-xs text-ink/60 mt-1 uppercase tracking-widest">за идентичность · {habit.identityTag || '—'}</div>
      <StripeBar />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Tile className="text-center py-3">
          <div className="font-display text-3xl text-pink-500">{streak.current}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">цепь</div>
        </Tile>
        <Tile className="text-center py-3">
          <div className="font-display text-3xl">{streak.longest}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">рекорд</div>
        </Tile>
        <Tile className={`text-center py-3 ${streak.missedTwiceInRow ? 'tile-pink animate-flicker' : ''}`}>
          <div className="font-display text-3xl">{streak.missedTwiceInRow ? '!!' : streak.missedYesterday ? '!' : 'OK'}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">никогда не пропускай дважды</div>
        </Tile>
      </div>

      <button onClick={() => toggle(false)} className={`btn w-full text-base py-4 ${todayCheck?.done ? 'btn-danger' : 'btn-primary'}`}>
        {todayCheck?.done ? '✓ СДЕЛАНО СЕГОДНЯ — ОТМЕНИТЬ' : (habit.kind === 'good' ? '+ ОТДАТЬ ГОЛОС' : '✓ НЕ СОРВАЛСЯ')}
      </button>
      {habit.kind === 'good' && habit.twoMinute && !todayCheck?.done && (
        <button onClick={() => toggle(true)} className="btn btn-ghost w-full mt-2 text-xs">
          ⏱ 2-МИН ВЕРСИЯ: {habit.twoMinute}
        </button>
      )}

      <SectionTitle kicker="35 дней" title="Цепь" sub="«Не прерывай цепочку». Один квадрат = один день. Светлая заливка — 2-минутная версия." />
      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {grid.map(d => (
          <div
            key={d.date}
            title={`${d.date}${d.twoMinuteOnly ? ' · 2 мин' : ''}`}
            className={`aspect-square border border-ink rounded ${
              d.done
                ? (d.twoMinuteOnly ? 'bg-pink-200' : 'bg-pink-500')
                : 'bg-paper'
            } ${d.date === today ? 'outline outline-2 outline-pink-600 outline-offset-1' : ''}`}
          />
        ))}
      </div>

      {habit.kind === 'good' ? (
        <section className="space-y-3">
          <SectionTitle kicker="система" title="4 закона" />
          <Tile><div className="label-tag mb-1">1 · ПРИДАЙТЕ ОЧЕВИДНОСТИ</div><div className="text-sm">Я буду <Pin>{habit.title}</Pin> {habit.whenTime || '[время]'} {habit.whenPlace || '[место]'}.<br />{habit.stackAfter && <>После того как я <Pin>{habit.stackAfter}</Pin>, я <Pin>{habit.title}</Pin>.</>}</div></Tile>
          <Tile><div className="label-tag mb-1">2 · ДОБАВЬТЕ ПРИВЛЕКАТЕЛЬНОСТИ</div><div className="text-sm">{habit.attractiveBundle ? <>После того как я <Pin>{habit.title}</Pin>, я <Pin>{habit.attractiveBundle}</Pin>.</> : '—'}{habit.attractiveReframe && <><br />{habit.attractiveReframe}</>}</div></Tile>
          <Tile><div className="label-tag mb-1">3 · УПРОСТИТЕ</div><div className="text-sm"><div>2-мин версия: <Pin>{habit.twoMinute || '—'}</Pin></div><div className="mt-1">Подготовка: {habit.frictionReduction || '—'}</div></div></Tile>
          <Tile><div className="label-tag mb-1">4 · ПРИВНЕСИТЕ УДОВОЛЬСТВИЕ</div><div className="text-sm">Награда: <Pin>{habit.satisfyingReward || '—'}</Pin></div></Tile>
        </section>
      ) : (
        <section className="space-y-3">
          <SectionTitle kicker="инверсия" title="4 закона наоборот" />
          <Tile><div className="label-tag mb-1">1 · СДЕЛАЙТЕ НЕЗАМЕТНЫМ</div><div className="text-sm">{habit.invisibleAction || '—'}</div></Tile>
          <Tile><div className="label-tag mb-1">2 · СДЕЛАЙТЕ НЕПРИВЛЕКАТЕЛЬНЫМ</div><div className="text-sm">{habit.unattractiveCost || '—'}</div></Tile>
          <Tile><div className="label-tag mb-1">3 · УСЛОЖНИТЕ</div><div className="text-sm">{habit.difficultBarrier || '—'}</div></Tile>
          <Tile><div className="label-tag mb-1">4 · УБЕРИТЕ УДОВОЛЬСТВИЕ</div><div className="text-sm">{habit.unsatisfyingPenalty || '—'}</div></Tile>
        </section>
      )}

      <Quote>«Вы получаете то, что регулярно повторяете». — гл. 1</Quote>

      <div className="flex gap-2 mt-6">
        {habit.active
          ? <button onClick={archive} className="btn btn-ghost flex-1 text-xs">В АРХИВ</button>
          : <button onClick={unarchive} className="btn btn-primary flex-1 text-xs">ВЕРНУТЬ В РАБОТУ</button>}
        <button onClick={remove} className="btn btn-danger flex-1 text-xs">УДАЛИТЬ</button>
      </div>
    </Page>
  )
}
