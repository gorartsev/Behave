import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db, weekStartISO } from '../lib/db'
import { Field, Page, Quote, SectionTitle, TextArea } from '../components/ui'

export default function Review() {
  const week = weekStartISO()
  const id = 'wk-' + week
  const existing = useLiveQuery(() => db.reviews.get(id), [id])
  const [worked, setWorked] = useState('')
  const [failed, setFailed] = useState('')
  const [change, setChange] = useState('')
  const past = useLiveQuery(() => db.reviews.orderBy('weekOf').reverse().toArray()) ?? []

  useEffect(() => {
    if (existing) {
      setWorked(existing.whatWorked)
      setFailed(existing.whatFailed)
      setChange(existing.whatToChange)
    }
  }, [existing])

  const save = async () => {
    await db.reviews.put({
      id, weekOf: week,
      whatWorked: worked, whatFailed: failed, whatToChange: change,
      createdAt: Date.now(),
    })
  }

  return (
    <Page title="ОБЗОР НЕДЕЛИ">
      <SectionTitle
        kicker={`неделя · ${week}`}
        title="Рефлексия + Обзор"
        sub="Привычки + целенаправленная практика = мастерство. Без обзора привычки становятся автопилотом, и ты застреваешь."
      />
      <Quote>«Профессионалы придерживаются расписания — любители пускают жизнь на самотёк». Самая большая угроза успеху — не провал, а скука.</Quote>

      <div className="space-y-4">
        <Field label="Что сработало?" hint="конкретно: какая привычка дала результат, что помогло держать цепь">
          <TextArea value={worked} onChange={e => setWorked(e.target.value)} placeholder="..." />
        </Field>
        <Field label="Что не получилось?" hint="где сорвался, в чём был триггер">
          <TextArea value={failed} onChange={e => setFailed(e.target.value)} placeholder="..." />
        </Field>
        <Field label="Что меняю на следующей неделе?" hint="одно конкретное изменение в системе или среде">
          <TextArea value={change} onChange={e => setChange(e.target.value)} placeholder="..." />
        </Field>
        <button onClick={save} className="btn btn-primary w-full">СОХРАНИТЬ ОБЗОР</button>
      </div>

      {past.length > 1 && (
        <>
          <SectionTitle kicker="архив" title="Прошлые недели" />
          <ul className="space-y-2">
            {past.filter(r => r.id !== id).map(r => (
              <li key={r.id} className="tile">
                <div className="label-tag mb-1">неделя · {r.weekOf}</div>
                {r.whatWorked && <p className="text-sm"><b>+</b> {r.whatWorked}</p>}
                {r.whatFailed && <p className="text-sm"><b>–</b> {r.whatFailed}</p>}
                {r.whatToChange && <p className="text-sm"><b>→</b> {r.whatToChange}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  )
}
