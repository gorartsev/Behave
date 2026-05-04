import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { db, weekStartISO, type ReviewKind } from '../lib/db'
import { Field, Page, Quote, SectionTitle, StripeBar, TextArea } from '../components/ui'

const TABS: { kind: ReviewKind; label: string; period: () => string; idPrefix: string }[] = [
  { kind: 'weekly',    label: 'НЕДЕЛЯ',         period: () => weekStartISO(),                   idPrefix: 'wk-' },
  { kind: 'annual',    label: 'ГОД',            period: () => String(new Date().getFullYear()), idPrefix: 'yr-' },
  { kind: 'integrity', label: 'ЦЕЛОСТНОСТЬ',    period: () => String(new Date().getFullYear()), idPrefix: 'int-' },
]

const PROMPTS: Record<ReviewKind, { intro: string; quote: string; q1: string; q2: string; q3: string }> = {
  weekly: {
    intro: 'Без обзора привычки становятся автопилотом, и ты застреваешь.',
    quote: '«Профессионалы придерживаются расписания — любители пускают жизнь на самотёк». Самая большая угроза успеху — не провал, а скука.',
    q1: 'Что сработало?',
    q2: 'Что не получилось?',
    q3: 'Что меняю на следующей неделе?',
  },
  annual: {
    intro: 'Годовой отчёт. В декабре подвожу итог: считаю выполнения, статьи, тренировки. Затем отвечаю на три вопроса (гл. 20).',
    quote: '«Улучшать — значит не только формировать новые привычки, но и корректировать старые». Без рефлексии ты просто повторяешь себя.',
    q1: 'Что получилось в этом году?',
    q2: 'Что не получилось в этом году?',
    q3: 'Чему я научился?',
  },
  integrity: {
    intro: 'Отчёт добросовестности. В разгар лета. Возвращаюсь к ценностям и проверяю, живу ли я в согласии с ними (гл. 20).',
    quote: '«Сохраняйте идентичность маленькой» — Пол Грэм. Переопределяй её, когда обстоятельства меняются.',
    q1: 'Какие главные ценности движут моей жизнью и работой?',
    q2: 'Живу и работаю ли я добросовестно прямо сейчас?',
    q3: 'Как я могу поставить перед собой более высокую планку в будущем?',
  },
}

export default function Review() {
  const [kind, setKind] = useState<ReviewKind>('weekly')
  const tab = useMemo(() => TABS.find(t => t.kind === kind)!, [kind])
  const periodOf = tab.period()
  const id = tab.idPrefix + periodOf
  const existing = useLiveQuery(() => db.reviews.get(id), [id])
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const past = useLiveQuery(() => db.reviews.where('kind').equals(kind).reverse().sortBy('periodOf'), [kind]) ?? []

  useEffect(() => {
    setQ1(existing?.q1 ?? '')
    setQ2(existing?.q2 ?? '')
    setQ3(existing?.q3 ?? '')
  }, [existing?.id, existing?.q1, existing?.q2, existing?.q3])

  const prompts = PROMPTS[kind]

  const save = async () => {
    await db.reviews.put({
      id, kind, periodOf,
      q1, q2, q3,
      createdAt: Date.now(),
    })
    setSavedAt(Date.now())
  }

  return (
    <Page title="ОБЗОР">
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {TABS.map(t => (
          <button
            key={t.kind}
            onClick={() => setKind(t.kind)}
            className={`btn text-[11px] py-2 px-2 ${kind === t.kind ? 'btn-primary' : 'btn-ghost'}`}
          >{t.label}</button>
        ))}
      </div>

      <SectionTitle
        kicker={kind === 'weekly' ? `неделя · ${periodOf}` : `${kind === 'annual' ? 'год' : 'целостность'} · ${periodOf}`}
        title={kind === 'weekly' ? 'Рефлексия + Обзор' : kind === 'annual' ? 'Годовой отчёт' : 'Отчёт добросовестности'}
        sub={prompts.intro}
      />
      <Quote>{prompts.quote}</Quote>

      <div className="space-y-4">
        <Field label={`1. ${prompts.q1}`}>
          <TextArea value={q1} onChange={e => setQ1(e.target.value)} />
        </Field>
        <Field label={`2. ${prompts.q2}`}>
          <TextArea value={q2} onChange={e => setQ2(e.target.value)} />
        </Field>
        <Field label={`3. ${prompts.q3}`}>
          <TextArea value={q3} onChange={e => setQ3(e.target.value)} />
        </Field>
        <button onClick={save} className="btn btn-primary w-full">СОХРАНИТЬ ОБЗОР</button>
        {savedAt && <p className="text-xs text-pink-600 text-center mt-1">сохранено {new Date(savedAt).toLocaleTimeString('ru-RU')}</p>}
      </div>

      {past.filter(r => r.id !== id).length > 0 && (
        <>
          <StripeBar pale />
          <SectionTitle kicker="архив" title="Прошлые периоды" />
          <ul className="space-y-2">
            {past.filter(r => r.id !== id).map(r => (
              <li key={r.id} className="tile">
                <div className="label-tag mb-1">{r.kind} · {r.periodOf}</div>
                {r.q1 && <p className="text-sm"><b>1.</b> {r.q1}</p>}
                {r.q2 && <p className="text-sm mt-1"><b>2.</b> {r.q2}</p>}
                {r.q3 && <p className="text-sm mt-1"><b>3.</b> {r.q3}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  )
}
