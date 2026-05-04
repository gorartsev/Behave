import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db, totalVotes } from '../lib/db'
import { Field, Page, Pin, Quote, SectionTitle, StripeBar, TextInput, Tile } from '../components/ui'

export default function IdentityScreen() {
  const me = useLiveQuery(() => db.identity.get('me'))
  const votes = useLiveQuery(() => totalVotes(), []) ?? 0
  const [text, setText] = useState('')
  const [word, setWord] = useState('')

  // Initialize once when identity arrives. Subsequent edits stay local until SAVE.
  useEffect(() => {
    if (!me) return
    if (text === '' && word === '') {
      setText(me.whoIWantToBe)
      setWord(me.identityWord ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id])

  const save = async () => {
    if (!text.trim()) return
    await db.identity.update('me', {
      whoIWantToBe: text.trim(),
      identityWord: word.trim(),
    })
  }

  const reset = async () => {
    if (!confirm('Сбросить все данные? Это удалит привычки, цепи, обзоры, контракты.')) return
    await db.identity.clear()
    await db.habits.clear()
    await db.checkins.clear()
    await db.scorecard.clear()
    await db.reviews.clear()
    await db.contracts.clear()
    await db.audit.clear()
    location.href = '/'
  }

  if (!me) return null

  return (
    <Page title="Я">
      <SectionTitle kicker="личность" title="Кто ты становишься" />

      <Tile accent className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-paper/80">я — человек, который</div>
        <div className="font-display text-4xl mt-1">{me.whoIWantToBe}</div>
        {me.identityWord && <div className="mt-2 text-[11px] uppercase tracking-widest text-paper/80">{me.identityWord}</div>}
      </Tile>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Tile className="text-center">
          <div className="font-display text-4xl text-pink-500">{votes}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">голосов</div>
        </Tile>
        <Tile className="text-center">
          <div className="font-display text-4xl">{Math.floor((Date.now() - me.createdAt) / 86400000)}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1">дней в системе</div>
        </Tile>
      </div>

      <Quote>«Вы становитесь тем, что представляют собой ваши привычки». Каждое действие — голос за того человека, которым ты хочешь стать.</Quote>
      <Quote>«Все улучшения являются временными, если они не становятся частью личности».</Quote>

      <SectionTitle kicker="инструменты" title="Дополнительные практики" sub="Из 17–20 глав. Не каждый день, но регулярно." />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Tile to="/audit">
          <div className="font-display text-2xl leading-none">⌗ среда</div>
          <div className="text-[11px] uppercase tracking-widest mt-2">аудит окружения</div>
        </Tile>
        <Tile to="/contract">
          <div className="font-display text-2xl leading-none">§ контракт</div>
          <div className="text-[11px] uppercase tracking-widest mt-2">с штрафом</div>
        </Tile>
      </div>

      <SectionTitle kicker="редактировать" title="Идентичность" />
      <Field label="Я — человек, который...">
        <TextInput value={text} onChange={e => setText(e.target.value)} />
      </Field>
      <div className="mt-3">
        <Field label="Одно слово" hint="используется как тег для привычек">
          <TextInput value={word} onChange={e => setWord(e.target.value)} placeholder="читатель / спортсмен / трезвый" />
        </Field>
      </div>
      <button onClick={save} className="btn btn-primary w-full mt-3">СОХРАНИТЬ</button>

      <StripeBar />

      <p className="text-xs text-ink/60 leading-relaxed mt-4">
        Привычка — это сложный процент. <Pin>1%</Pin> в день = <Pin>×37</Pin> через год.<br />
        Не прерывай цепочку. Никогда не пропускай дважды.
      </p>

      <Link to="/onboarding" className="btn btn-ghost w-full mt-6 text-xs">ПОВТОРИТЬ ОНБОРДИНГ</Link>
      <button onClick={reset} className="btn btn-danger w-full mt-2 text-xs">СБРОСИТЬ ВСЁ</button>
    </Page>
  )
}
