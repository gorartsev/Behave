import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db, uid } from '../lib/db'
import { Field, Page, Quote, SectionTitle, TextInput } from '../components/ui'

type Verdict = '+' | '-' | '='

export default function Scorecard() {
  const list = useLiveQuery(() => db.scorecard.orderBy('createdAt').reverse().toArray()) ?? []
  const [text, setText] = useState('')
  const [verdict, setVerdict] = useState<Verdict>('=')

  const add = async () => {
    if (!text.trim()) return
    await db.scorecard.put({ id: uid(), text: text.trim(), verdict, createdAt: Date.now() })
    setText('')
    setVerdict('=')
  }

  const cycle = async (entry: typeof list[number]) => {
    // + → − → = → +
    const next: Verdict = entry.verdict === '+' ? '-' : entry.verdict === '-' ? '=' : '+'
    await db.scorecard.update(entry.id, { verdict: next })
  }

  return (
    <Page title="АУДИТ ПРИВЫЧЕК">
      <SectionTitle
        kicker="учётная карточка привычек"
        title="Что ты делаешь?"
        sub='Запиши всё, что делаешь за день — встал, открыл телефон, пошёл душ. Затем размечай каждое поведение: «+» помогает тому, кем хочешь стать; «–» мешает; «=» нейтрально. Цель — не менять, а УВИДЕТЬ.'
      />

      <Quote>«Помогает ли мне это поведение стать таким человеком, каким я хочу быть? Эта привычка даёт голоса за или против моей идентичности?»</Quote>

      <div className="tile mb-4">
        <Field label="Действие">
          <TextInput value={text} placeholder="просыпаюсь и беру телефон" onChange={e => setText(e.target.value)} />
        </Field>
        <div className="flex items-center gap-2 mt-3">
          {(['+', '-', '='] as Verdict[]).map(v => (
            <button
              key={v}
              onClick={() => setVerdict(v)}
              className={`btn flex-1 text-xs ${verdict === v ? (v === '+' ? 'btn-primary' : v === '-' ? 'btn-danger' : 'btn-ghost') : 'btn-ghost'}`}
            >{v === '+' ? '+ ХОРОШАЯ' : v === '-' ? '– ПЛОХАЯ' : '= НЕЙТРАЛЬНАЯ'}</button>
          ))}
        </div>
        <button onClick={add} className="btn btn-primary w-full mt-3" disabled={!text.trim()}>+ ДОБАВИТЬ</button>
      </div>

      <ul className="space-y-2">
        {list.map(e => (
          <li key={e.id} className="tile flex items-center gap-3">
            <button
              onClick={() => cycle(e)}
              className={`shrink-0 size-10 grid place-items-center font-display text-2xl border-2 border-ink rounded-lg ${
                e.verdict === '+' ? 'bg-pink-500 text-paper' : e.verdict === '-' ? 'bg-ink text-pink-500' : 'bg-paper text-ink'
              }`}
              title="нажми, чтобы переключить"
            >{e.verdict}</button>
            <span className="text-sm flex-1">{e.text}</span>
            <button
              onClick={() => db.scorecard.delete(e.id)}
              className="shrink-0 text-ink/40 hover:text-pink-500 text-xl px-2"
              aria-label="удалить"
              title="удалить"
            >×</button>
          </li>
        ))}
        {list.length === 0 && <li className="text-sm text-ink/60">Список пуст. Начни с самого утра.</li>}
      </ul>
    </Page>
  )
}
