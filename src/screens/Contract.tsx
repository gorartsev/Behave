import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db, uid, type HabitContract } from '../lib/db'
import { Field, Page, Pin, Quote, SectionTitle, StripeBar, TextArea, TextInput, Tile } from '../components/ui'

export default function Contract() {
  const me = useLiveQuery(() => db.identity.get('me'))
  const contracts = useLiveQuery(() => db.contracts.orderBy('signedAt').reverse().toArray()) ?? []

  const [goal, setGoal] = useState('')
  const [phases, setPhases] = useState('')
  const [dailyHabits, setDailyHabits] = useState('')
  const [penalty, setPenalty] = useState('')
  const [partner1, setPartner1] = useState('')
  const [partner2, setPartner2] = useState('')
  const [signed, setSigned] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!editingId) return
    const c = contracts.find(c => c.id === editingId)
    if (!c) return
    setGoal(c.goal); setPhases(c.phases); setDailyHabits(c.dailyHabits)
    setPenalty(c.penalty); setPartner1(c.partner1); setPartner2(c.partner2)
  }, [editingId, contracts.length])

  const reset = () => {
    setGoal(''); setPhases(''); setDailyHabits(''); setPenalty('')
    setPartner1(''); setPartner2(''); setSigned(false); setEditingId(null)
  }

  const save = async () => {
    if (!goal.trim() || !penalty.trim() || !partner1.trim() || !signed) return
    const id = editingId ?? uid()
    const c: HabitContract = {
      id,
      goal: goal.trim(), phases: phases.trim(), dailyHabits: dailyHabits.trim(),
      penalty: penalty.trim(), partner1: partner1.trim(), partner2: partner2.trim(),
      signedAt: Date.now(),
    }
    await db.contracts.put(c)
    reset()
  }

  const remove = async (id: string) => {
    if (!confirm('Удалить контракт?')) return
    await db.contracts.delete(id)
    if (editingId === id) reset()
  }

  return (
    <Page back="/identity" title="КОНТРАКТ О ПРИВЫЧКЕ">
      <SectionTitle
        kicker="глава 17"
        title="Контракт с собой"
        sub="«Контракт о соблюдении привычки — устное или письменное соглашение, по которому ты обязуешься следовать привычке. Не делаешь — наказание». Брайан Харрис, гл. 17."
      />
      <Quote>«Поведение меняется лишь тогда, когда наказание достаточно болезненно и наступает незамедлительно».</Quote>

      <div className="tile space-y-4">
        <Field label="Я, кто подписывает" hint="заполняется автоматически из идентичности">
          <TextInput value={me?.whoIWantToBe ?? ''} disabled className="opacity-70" />
        </Field>

        <Field label="ЦЕЛЬ" hint="долгосрочная, измеримая">
          <TextArea value={goal} onChange={e => setGoal(e.target.value)} placeholder="вернуться к весу 75 кг при 12% жира к концу года" />
        </Field>

        <Field label="ФАЗЫ" hint="по кварталам / этапам">
          <TextArea value={phases} onChange={e => setPhases(e.target.value)} placeholder="Q1 — строгая диета. Q2 — отслеживание макро. Q3 — программа тренировок. Q4 — поддержка." />
        </Field>

        <Field label="ЕЖЕДНЕВНЫЕ ПРИВЫЧКИ" hint="что делаю каждый день">
          <TextArea value={dailyHabits} onChange={e => setDailyHabits(e.target.value)} placeholder="каждый день записываю всё съеденное и взвешиваюсь" />
        </Field>

        <Field label="ШТРАФ ЗА НАРУШЕНИЕ" hint="должен быть болезненным, осязаемым, немедленным">
          <TextArea value={penalty} onChange={e => setPenalty(e.target.value)} placeholder="за каждый пропуск — 2000 ₽ свидетелю на счёт; до конца квартала — носить только формальную одежду" />
        </Field>

        <Field label="СВИДЕТЕЛЬ 1" hint="имя — обязательно">
          <TextInput value={partner1} onChange={e => setPartner1(e.target.value)} placeholder="имя близкого человека" />
        </Field>

        <Field label="СВИДЕТЕЛЬ 2" hint="опционально">
          <TextInput value={partner2} onChange={e => setPartner2(e.target.value)} placeholder="имя второго свидетеля" />
        </Field>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={signed} onChange={e => setSigned(e.target.checked)} className="mt-1 size-5 accent-pink-500" />
          <span className="text-sm">Подписываю. Свидетели поставят свои подписи на бумаге / в чате.</span>
        </label>

        <div className="flex gap-2">
          {editingId && <button onClick={reset} className="btn btn-ghost flex-1 text-xs">ОТМЕНА</button>}
          <button
            onClick={save}
            className="btn btn-primary flex-1"
            disabled={!goal.trim() || !penalty.trim() || !partner1.trim() || !signed}
          >
            {editingId ? 'ОБНОВИТЬ' : 'ПОДПИСАТЬ'}
          </button>
        </div>
      </div>

      {contracts.length > 0 && (
        <>
          <StripeBar />
          <SectionTitle kicker="подписано" title="Действующие контракты" />
          <ul className="space-y-3">
            {contracts.map(c => (
              <li key={c.id} className="tile">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="label-tag">{new Date(c.signedAt).toLocaleDateString('ru-RU')}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(c.id)} className="text-xs underline text-pink-600">править</button>
                    <button onClick={() => remove(c.id)} className="text-xs underline text-ink/60">удалить</button>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><Pin>цель:</Pin> {c.goal}</p>
                  {c.phases && <p><Pin>фазы:</Pin> {c.phases}</p>}
                  {c.dailyHabits && <p><Pin>ежедневно:</Pin> {c.dailyHabits}</p>}
                  <p><Pin>штраф:</Pin> {c.penalty}</p>
                  <p className="text-[11px] uppercase tracking-widest text-ink/60 mt-2">
                    подписи: {me?.whoIWantToBe || '___'}{c.partner1 && ' · ' + c.partner1}{c.partner2 && ' · ' + c.partner2}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Tile className="mt-6">
        <div className="label-tag mb-2">формула боли &gt; формула удовольствия</div>
        <p className="text-sm leading-relaxed">
          Сила наказания должна <Pin>превышать</Pin> выигрыш от плохой привычки. Если штраф расплывчат и в будущем — он не работает. Делай его осязаемым и немедленным.
        </p>
      </Tile>
    </Page>
  )
}
