import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import { Brand, Field, Page, SectionTitle, StripeBar, TextInput, Quote, Pin } from '../components/ui'

const STEPS = 4

export default function Onboarding() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [identityWord, setIdentityWord] = useState('')   // "читатель"
  const [becomeWho, setBecomeWho] = useState('')         // "человек, который читает каждый день"
  const [proof, setProof] = useState('')                 // "одна страница в день"
  const [agree, setAgree] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, STEPS - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const finish = async () => {
    await db.identity.put({
      id: 'me',
      whoIWantToBe: becomeWho.trim() || identityWord.trim(),
      createdAt: Date.now(),
      votes: 0,
    })
    nav('/habits/new', { replace: true })
  }

  return (
    <Page>
      <div className="pt-8">
        <Brand />
        <div className="flex items-center gap-2 mt-2">
          <span className="label-tag">атомные привычки</span>
          <span className="label-tag bg-pink-500 text-paper border-pink-500">шаг {step + 1}/{STEPS}</span>
        </div>
        <StripeBar />
      </div>

      {step === 0 && (
        <section className="space-y-4">
          <SectionTitle kicker="01 — суть" title="1% в день. Каждый день." sub="Привычка — это сложный процент. Маленький выбор сегодня = другая жизнь через год." />
          <Quote>
            «Если сможете совершенствоваться всего на 1% каждый день в течение года, к концу периода вы станете в 37 раз лучше самого себя».
          </Quote>
          <p className="text-sm leading-relaxed">
            «Вам не надо подниматься на уровень своих целей. Вам нужно <Pin>углубиться</Pin> до уровня своей системы». Здесь ты не ставишь цели — ты строишь систему.
          </p>
          <p className="text-xs text-ink/60 leading-relaxed">
            Достижения — отложенная проекция привычек. Вес — результат пищевых привычек. Деньги — финансовых. Знания — учебных.
          </p>
          <div className="flex justify-end pt-2">
            <button className="btn btn-primary" onClick={next}>ДАЛЬШЕ →</button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <SectionTitle kicker="02 — личность" title="Кем ты хочешь стать?" sub="Три уровня изменения: результаты → процессы → идентичность. Глубокий уровень — личность. Поведение, противоречащее ей, не приживётся." />
          <Quote>
            «Каждое действие, которое вы совершаете, — это решение относительно того, что вы представляете собой как личность».
          </Quote>
          <Field label="Я — человек, который...">
            <TextInput
              autoFocus
              placeholder="...читает каждый день"
              value={becomeWho}
              onChange={e => setBecomeWho(e.target.value)}
            />
          </Field>
          <Field label="Одно слово — твоя идентичность" hint="читатель / бегун / художник / трезвый">
            <TextInput
              placeholder="читатель"
              value={identityWord}
              onChange={e => setIdentityWord(e.target.value)}
            />
          </Field>
          <div className="flex justify-between pt-2">
            <button className="btn btn-ghost" onClick={prev}>← НАЗАД</button>
            <button className="btn btn-primary" disabled={!becomeWho.trim()} onClick={next}>ДАЛЬШЕ →</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <SectionTitle kicker="03 — доказательство" title="Что докажет, что ты — этот человек?" sub="Двухступенчатый процесс: 1) реши, кто ты. 2) докажи это маленькими победами. Каждое доказательство = голос за идентичность." />
          <Quote>
            «Самый практичный способ изменить то, кто вы есть, — изменить то, что вы делаете».
          </Quote>
          <Field label="Маленькое ежедневное доказательство" hint="должно занимать ≤ 2 минут">
            <TextInput
              autoFocus
              placeholder="прочитать одну страницу"
              value={proof}
              onChange={e => setProof(e.target.value)}
            />
          </Field>
          <p className="text-xs text-ink/60 leading-relaxed">
            Не «прочитать книгу» — это цель. А <Pin>прочитать одну страницу</Pin> — это доказательство. Привычка должна быть настолько лёгкой, чтобы пропустить её было стыдно.
          </p>
          <div className="flex justify-between pt-2">
            <button className="btn btn-ghost" onClick={prev}>← НАЗАД</button>
            <button className="btn btn-primary" disabled={!proof.trim()} onClick={next}>ДАЛЬШЕ →</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <SectionTitle kicker="04 — контракт" title="Условия игры" />
          <div className="tile">
            <p className="text-sm leading-relaxed">
              Я, <Pin>{becomeWho || '___'}</Pin>, согласен(на) с тем, что:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>— я работаю над <Pin>системой</Pin>, а не над целями;</li>
              <li>— каждый день я отдаю один <Pin>голос</Pin> за того, кем хочу стать;</li>
              <li>— я <Pin>никогда не пропускаю дважды</Pin>;</li>
              <li>— если день тяжёлый — я делаю <Pin>2-минутную версию</Pin>;</li>
              <li>— я меняю среду до того, как полагаюсь на силу воли.</li>
            </ul>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 size-5 accent-pink-500" />
            <span className="text-sm">Согласен(на). Подписываю.</span>
          </label>
          <div className="flex justify-between pt-2">
            <button className="btn btn-ghost" onClick={prev}>← НАЗАД</button>
            <button className="btn btn-primary" disabled={!agree} onClick={finish}>ПОЕХАЛИ →</button>
          </div>
        </section>
      )}
    </Page>
  )
}
