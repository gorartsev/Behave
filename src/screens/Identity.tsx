import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db } from '../lib/db'
import { Field, Page, Pin, Quote, SectionTitle, StripeBar, TextInput, Tile } from '../components/ui'

export default function IdentityScreen() {
  const me = useLiveQuery(() => db.identity.get('me'))
  const [text, setText] = useState('')

  useEffect(() => { if (me) setText(me.whoIWantToBe) }, [me?.whoIWantToBe])

  const save = async () => {
    if (!text.trim()) return
    await db.identity.update('me', { whoIWantToBe: text.trim() })
  }

  const reset = async () => {
    if (!confirm('Сбросить все данные? Это удалит привычки, цепи, обзоры.')) return
    await db.identity.clear()
    await db.habits.clear()
    await db.checkins.clear()
    await db.scorecard.clear()
    await db.reviews.clear()
    await db.contracts.clear()
    location.href = '/'
  }

  if (!me) return null

  return (
    <Page title="Я">
      <SectionTitle kicker="личность" title="Кто ты становишься" />

      <Tile accent className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-paper/80">я — человек, который</div>
        <div className="font-display text-4xl mt-1">{me.whoIWantToBe}</div>
      </Tile>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Tile className="text-center">
          <div className="font-display text-4xl text-pink-500">{me.votes}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">голосов</div>
        </Tile>
        <Tile className="text-center">
          <div className="font-display text-4xl">{Math.floor((Date.now() - me.createdAt) / 86400000)}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">дней в системе</div>
        </Tile>
      </div>

      <Quote>«Вы становитесь тем, что представляют собой ваши привычки». Каждое действие — это голос за того человека, которым ты хочешь стать.</Quote>
      <Quote>«Все улучшения являются временными, если они не становятся частью личности».</Quote>

      <Field label="Переписать идентичность">
        <TextInput value={text} onChange={e => setText(e.target.value)} />
      </Field>
      <button onClick={save} className="btn btn-primary w-full mt-3">СОХРАНИТЬ</button>

      <StripeBar />

      <p className="text-xs text-ink/60 leading-relaxed mt-4">
        Привычка — это сложный процент. <Pin>1%</Pin> в день = <Pin>×37</Pin> через год.<br />
        Не разрывай цепь. Никогда не пропускай дважды.
      </p>

      <button onClick={reset} className="btn btn-ghost w-full mt-6 text-xs">СБРОСИТЬ ВСЁ</button>
    </Page>
  )
}
