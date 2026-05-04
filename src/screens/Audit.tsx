import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db } from '../lib/db'
import { Page, Pin, Quote, SectionTitle, StripeBar, TextArea, Tile } from '../components/ui'

// Структура из глав 6, 7, 12: дизайн среды + «Одно пространство — одна задача» + «Перезагрузи комнату».
const QUESTIONS: { id: string; q: string; hint: string }[] = [
  { id: 'q1', q: 'Какие СТИМУЛЫ хороших привычек видны в твоей среде прямо сейчас?', hint: 'книга на подушке, гитара в гостиной, бутылка воды на столе' },
  { id: 'q2', q: 'Какие СТИМУЛЫ плохих привычек видны? Что можно убрать с глаз?', hint: 'телефон в спальне, печенье на столе, иконка приложения на 1-м экране' },
  { id: 'q3', q: 'Какие места ты используешь СРАЗУ для нескольких целей?', hint: '«Каждой привычке нужен свой дом. Одно пространство — одна задача»' },
  { id: 'q4', q: 'Что сделать ЗАРАНЕЕ, чтобы завтра привычка прошла без сопротивления?', hint: 'одежда с вечера, кофе в кофеварке, открытый документ' },
  { id: 'q5', q: 'Что подготовить к СЛЕДУЮЩЕМУ действию, выходя из комнаты?', hint: '«Перезагрузка комнаты». Уход = подготовка к возвращению' },
  { id: 'q6', q: 'Какие ТЕХНОЛОГИЧЕСКИЕ барьеры можно поставить против плохих привычек?', hint: 'блокировщик, удалить приложение, выйти из аккаунта, отдать пароль' },
  { id: 'q7', q: 'Какое единовременное РЕШЕНИЕ заменит десятки будущих?', hint: 'автоплатёж в копилку, подписка на доставку овощей, фильтр воды' },
  { id: 'q8', q: 'В каком кругу людей твоё нужное поведение — НОРМА?', hint: '«Окружите себя людьми, у которых есть привычки, которые вы хотели бы сформировать у себя»' },
]

export default function Audit() {
  const list = useLiveQuery(() => db.audit.toArray()) ?? []
  const map = new Map(list.map(i => [i.id, i]))
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const q of QUESTIONS) next[q.id] = map.get(q.id)?.answer ?? ''
    setDrafts(next)
  }, [list.length])

  const save = async (qid: string) => {
    const answer = (drafts[qid] ?? '').trim()
    if (!answer) {
      const ex = map.get(qid)
      if (ex) await db.audit.delete(qid)
      return
    }
    await db.audit.put({ id: qid, question: QUESTIONS.find(q => q.id === qid)!.q, answer, createdAt: Date.now() })
  }

  return (
    <Page back="/identity" title="АУДИТ СРЕДЫ">
      <SectionTitle
        kicker="дизайн окружения"
        title="Среда сильнее воли"
        sub="«Самоконтроль — это краткосрочная, а не долгосрочная стратегия». Не борись с триггером — убери его. Не заставляй себя — поставь среду на свою сторону."
      />
      <Quote>«Каждой привычке нужен свой дом». «Одно пространство — одна задача».</Quote>

      <ul className="space-y-3">
        {QUESTIONS.map((q, i) => (
          <li key={q.id} className="tile">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-display text-2xl text-pink-500">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <div className="text-sm font-bold leading-snug">{q.q}</div>
                <div className="text-[10px] uppercase tracking-widest text-ink/60 mt-0.5">{q.hint}</div>
              </div>
            </div>
            <TextArea
              value={drafts[q.id] ?? ''}
              onChange={e => setDrafts(s => ({ ...s, [q.id]: e.target.value }))}
              onBlur={() => save(q.id)}
              placeholder="..."
            />
          </li>
        ))}
      </ul>

      <StripeBar />

      <Tile className="mt-4">
        <div className="label-tag mb-2">4 ВОПРОСА КЛИРА</div>
        <p className="text-sm leading-relaxed">
          Когда привычка не идёт — спроси:<br />
          1. Как сделать её <Pin>очевидной</Pin>?<br />
          2. Как сделать её <Pin>привлекательной</Pin>?<br />
          3. Как сделать её <Pin>простой</Pin>?<br />
          4. Как сделать так, чтобы она приносила <Pin>удовлетворение</Pin>?
        </p>
      </Tile>
    </Page>
  )
}
