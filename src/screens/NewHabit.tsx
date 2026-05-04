import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, uid, type Habit, type HabitKind } from '../lib/db'
import { Brand, Field, Page, Pin, Quote, SectionTitle, StripeBar, TextArea, TextInput } from '../components/ui'

interface Props { kind: HabitKind }

const goodLaws = [
  { n: 1, key: 'obvious',     name: 'ПРИДАЙТЕ ОЧЕВИДНОСТИ',     desc: '1-й закон. Стимулы — время + место. Самоконтроль не работает в долгую: спрячь невидимое — выстави на вид нужное.' },
  { n: 2, key: 'attractive',  name: 'ДОБАВЬТЕ ПРИВЛЕКАТЕЛЬНОСТИ', desc: '2-й закон. Желание = ожидание награды. Сцепи нужное с тем, что и так любишь.' },
  { n: 3, key: 'easy',        name: 'УПРОСТИТЕ',                 desc: '3-й закон. Закон наименьшего усилия. Правило двух минут. Действие, а не движение.' },
  { n: 4, key: 'satisfying',  name: 'ПРИВНЕСИТЕ УДОВОЛЬСТВИЕ',   desc: '4-й закон. Что мгновенно вознаграждается — повторяется. Не прерывай цепочку. Никогда не пропускай дважды.' },
] as const

const badLaws = [
  { n: 1, key: 'invisible',     name: 'СДЕЛАЙТЕ НЕЗАМЕТНЫМ',     desc: 'Инверсия 1-го. Один сигнал держит петлю — убери его. Самоконтроль — стратегия краткосрочная.' },
  { n: 2, key: 'unattractive',  name: 'СДЕЛАЙТЕ НЕПРИВЛЕКАТЕЛЬНЫМ', desc: 'Инверсия 2-го. Перепиши историю: подсвети реальную цену. Метод Аллена Карра.' },
  { n: 3, key: 'difficult',     name: 'УСЛОЖНИТЕ',               desc: 'Инверсия 3-го. Увеличь число шагов между собой и срывом. Контракт Одиссея.' },
  { n: 4, key: 'unsatisfying',  name: 'УБЕРИТЕ УДОВОЛЬСТВИЕ',    desc: 'Инверсия 4-го. Боль немедленна. Контракт о привычке + публичное наказание.' },
] as const

export default function NewHabit({ kind }: Props) {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<Habit>>({
    kind,
    title: '',
    identityTag: '',
    whenTime: '',
    whenPlace: '',
    stackAfter: '',
    attractiveBundle: '',
    attractiveReframe: '',
    twoMinute: '',
    frictionReduction: '',
    satisfyingReward: '',
    invisibleAction: '',
    unattractiveCost: '',
    difficultBarrier: '',
    unsatisfyingPenalty: '',
  })

  const laws = kind === 'good' ? goodLaws : badLaws
  const totalSteps = 1 /* basics */ + laws.length + 1 /* review */

  const set = <K extends keyof Habit>(k: K, v: Habit[K]) => setForm(s => ({ ...s, [k]: v }))

  const intentSentence = useMemo(
    () => `Я буду «${form.title || '___'}» ${form.whenTime || 'в ___'} ${form.whenPlace || 'в ___'}.`,
    [form.title, form.whenTime, form.whenPlace],
  )
  const stackSentence = useMemo(
    () => `После «${form.stackAfter || '[текущая привычка]'}» я сделаю «${form.title || '___'}».`,
    [form.title, form.stackAfter],
  )
  const bundleSentence = useMemo(
    () => `После «${form.title || '[нужная привычка]'}» — «${form.attractiveBundle || '[желаемое действие]'}».`,
    [form.title, form.attractiveBundle],
  )

  const save = async () => {
    const habit: Habit = {
      id: uid(),
      kind,
      title: form.title!.trim(),
      identityTag: form.identityTag?.trim() ?? '',
      whenTime: form.whenTime ?? '',
      whenPlace: form.whenPlace ?? '',
      stackAfter: form.stackAfter ?? '',
      attractiveBundle: form.attractiveBundle ?? '',
      attractiveReframe: form.attractiveReframe ?? '',
      twoMinute: form.twoMinute ?? '',
      frictionReduction: form.frictionReduction ?? '',
      satisfyingReward: form.satisfyingReward ?? '',
      invisibleAction: form.invisibleAction ?? '',
      unattractiveCost: form.unattractiveCost ?? '',
      difficultBarrier: form.difficultBarrier ?? '',
      unsatisfyingPenalty: form.unsatisfyingPenalty ?? '',
      createdAt: Date.now(),
      active: true,
    }
    await db.habits.put(habit)
    nav(`/habits/${habit.id}`, { replace: true })
  }

  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))
  const canSaveBasics = !!form.title?.trim()

  return (
    <Page back="/habits">
      <div className="pt-2 mb-3">
        <div className="flex items-center justify-between">
          <Brand size="sm" />
          <span className="label-tag bg-pink-500 text-paper border-pink-500">
            {kind === 'good' ? 'НОВАЯ ПРИВЫЧКА' : 'СЛОМАТЬ ПЛОХУЮ'} · {step + 1}/{totalSteps}
          </span>
        </div>
        <StripeBar />
      </div>

      {step === 0 && (
        <section className="space-y-4">
          <SectionTitle
            kicker="00 — Основа"
            title={kind === 'good' ? 'Какую привычку хочешь построить?' : 'От какой привычки хочешь избавиться?'}
            sub="Не цель. Конкретное действие."
          />
          <Field label="Привычка" hint="одно действие, не процесс">
            <TextInput autoFocus placeholder={kind === 'good' ? 'прочитать страницу' : 'листать соцсети утром'} value={form.title ?? ''} onChange={e => set('title', e.target.value)} />
          </Field>
          <Field label="Это голос за кого?" hint="одно слово — твоя идентичность">
            <TextInput placeholder="читатель / трезвый / спортсмен" value={form.identityTag ?? ''} onChange={e => set('identityTag', e.target.value)} />
          </Field>
          <Quote>
            «Многие люди думают, что им не хватает мотивации, тогда как на самом деле им не хватает чёткости». Дальше — 4 закона, которые делают эту чёткость.
          </Quote>
          <div className="flex justify-end pt-2">
            <button className="btn btn-primary" disabled={!canSaveBasics} onClick={next}>ДАЛЬШЕ →</button>
          </div>
        </section>
      )}

      {laws.map((law, i) => step === i + 1 && (
        <section key={law.key} className="space-y-4">
          <SectionTitle
            kicker={`Закон ${law.n}${kind === 'bad' ? ' (инверсия)' : ''}`}
            title={law.name}
            sub={law.desc}
          />

          {kind === 'good' && law.key === 'obvious' && (
            <>
              <div className="tile p-3 text-sm">
                <span className="label-tag mb-1">намерение для реализации</span>
                <div className="mt-1">{intentSentence}</div>
              </div>
              <Field label="ВРЕМЯ" hint="конкретно: «в 21:30», а не «вечером»">
                <TextInput placeholder="в 21:30" value={form.whenTime} onChange={e => set('whenTime', e.target.value)} />
              </Field>
              <Field label="МЕСТО" hint="«каждой привычке нужен свой дом»">
                <TextInput placeholder="в спальне на кровати" value={form.whenPlace} onChange={e => set('whenPlace', e.target.value)} />
              </Field>
              <Field label="НАЛОЖЕНИЕ ПРИВЫЧЕК" hint='«После [ТЕКУЩАЯ ПРИВЫЧКА] я сделаю [НОВАЯ ПРИВЫЧКА]»'>
                <TextInput placeholder="почищу зубы" value={form.stackAfter} onChange={e => set('stackAfter', e.target.value)} />
              </Field>
              <div className="tile p-3 text-sm">
                <span className="label-tag mb-1">наложение</span>
                <div className="mt-1">{stackSentence}</div>
              </div>
              <Quote>«Сделайте стимулы хороших привычек очевидными, а стимулы плохих — незаметными».</Quote>
            </>
          )}

          {kind === 'good' && law.key === 'attractive' && (
            <>
              <Field label="СОЧЕТАНИЕ ПРИЯТНОГО С ПОЛЕЗНЫМ" hint='«После [НУЖНО] я буду [ХОЧУ]»'>
                <TextInput placeholder="смотреть сериал" value={form.attractiveBundle} onChange={e => set('attractiveBundle', e.target.value)} />
              </Field>
              <div className="tile p-3 text-sm">
                <span className="label-tag mb-1">связка</span>
                <div className="mt-1">{bundleSentence}</div>
              </div>
              <Field label="ПЕРЕФОРМУЛИРОВКА" hint='«я должен» → «у меня есть возможность»'>
                <TextArea placeholder="не «я должен заниматься», а «у меня есть возможность тренировать тело»" value={form.attractiveReframe} onChange={e => set('attractiveReframe', e.target.value)} />
              </Field>
              <Quote>«Именно ожидание вознаграждения, а не само его получение побуждает нас действовать».</Quote>
              <Quote>«Окружите себя людьми, у которых есть привычки, которые вы хотели бы сформировать у себя».</Quote>
            </>
          )}

          {kind === 'good' && law.key === 'easy' && (
            <>
              <Field label="ПРАВИЛО ДВУХ МИНУТ" hint="любая новая привычка должна занимать ≤ 2 минут">
                <TextInput placeholder="открыть книгу и прочитать одну страницу" value={form.twoMinute} onChange={e => set('twoMinute', e.target.value)} />
              </Field>
              <Field label="СНИЖЕНИЕ ТРЕНИЯ" hint="«перезагрузи комнату» под завтрашнее действие">
                <TextArea placeholder="положить книгу на подушку, очки рядом, телефон — в другую комнату" value={form.frictionReduction} onChange={e => set('frictionReduction', e.target.value)} />
              </Field>
              <Quote>«Сосредоточьтесь на действии, а не на движении». Планировать ≠ делать.</Quote>
              <Quote>«Стандартизация предшествует оптимизации». Сначала закрепи шаблон.</Quote>
            </>
          )}

          {kind === 'good' && law.key === 'satisfying' && (
            <>
              <Field label="НЕМЕДЛЕННАЯ НАГРАДА" hint="что-то приятное СРАЗУ после действия — и в духе твоей идентичности">
                <TextInput placeholder="галочка + чашка какао" value={form.satisfyingReward} onChange={e => set('satisfyingReward', e.target.value)} />
              </Field>
              <Quote>«Мы повторяем то, за что получаем немедленное вознаграждение. Мы избегаем того, за что несём немедленное наказание».</Quote>
              <p className="text-sm">После check-in BEHAVE добавит +1 голос за <Pin>{form.identityTag || 'твою идентичность'}</Pin> и продлит цепочку.</p>
              <p className="text-sm"><Pin>Не прерывай цепочку.</Pin> <Pin>Никогда не пропускай дважды.</Pin></p>
            </>
          )}

          {kind === 'bad' && law.key === 'invisible' && (
            <>
              <Field label="ЧТО УБРАТЬ ИЗ СРЕДЫ?" hint="один сигнал держит всю петлю">
                <TextArea placeholder="убрать телефон из спальни, удалить приложение, сложить алкоголь в подвал, выключить уведомления" value={form.invisibleAction} onChange={e => set('invisibleAction', e.target.value)} />
              </Field>
              <Quote>«Самоконтроль — это краткосрочная, а не долгосрочная стратегия. Проще избежать искушения, чем противостоять ему».</Quote>
            </>
          )}

          {kind === 'bad' && law.key === 'unattractive' && (
            <>
              <Field label="ПЕРЕОСМЫСЛИ ВЫГОДУ" hint="метод Аллена Карра: подсветить настоящую цену">
                <TextArea placeholder='не «расслабиться курением», а «отравить лёгкие». Не «соцсети — отдых», а «убить два часа жизни»' value={form.unattractiveCost} onChange={e => set('unattractiveCost', e.target.value)} />
              </Field>
              <Quote>«У каждого поведения есть поверхностный уровень желания и более глубокий — мотив, лежащий в его основе». Найди настоящий мотив — замени привычку.</Quote>
            </>
          )}

          {kind === 'bad' && law.key === 'difficult' && (
            <>
              <Field label="КОНТРАКТ ОДИССЕЯ" hint="увеличь число шагов между собой и срывом">
                <TextArea placeholder="блокировщик сайтов, отключить карту от подписки, выдать пароль другу, отдать ключи от бара" value={form.difficultBarrier} onChange={e => set('difficultBarrier', e.target.value)} />
              </Field>
              <Quote>Виктор Гюго запер всю одежду в сундук, чтобы дописать «Собор Парижской Богоматери». Сделай срыв технически сложным.</Quote>
            </>
          )}

          {kind === 'bad' && law.key === 'unsatisfying' && (
            <>
              <Field label="КОНТРАКТ О ПРИВЫЧКЕ + ШТРАФ" hint="свидетель + немедленная боль больше выигрыша от срыва">
                <TextArea placeholder='свидетель: Маша. Штраф: перевожу 2000 ₽ на её счёт за каждый срыв и публикую факт в общем чате.' value={form.unsatisfyingPenalty} onChange={e => set('unsatisfyingPenalty', e.target.value)} />
              </Field>
              <Quote>«Боль немедленна → привычка умирает быстро». Сила наказания должна превышать выигрыш от плохой привычки.</Quote>
            </>
          )}

          <div className="flex justify-between pt-2">
            <button className="btn btn-ghost" onClick={prev}>← НАЗАД</button>
            <button className="btn btn-primary" onClick={next}>ДАЛЬШЕ →</button>
          </div>
        </section>
      ))}

      {step === totalSteps - 1 && (
        <section className="space-y-4">
          <SectionTitle kicker="ИТОГ" title="Твоя система" sub="Проверь и подпиши." />
          <div className="tile space-y-3 text-sm">
            <div><span className="label-tag">привычка</span> <div className="text-base font-bold mt-1">{form.title}</div></div>
            <div><span className="label-tag">идентичность</span> <div className="mt-1">{form.identityTag || '—'}</div></div>
            {kind === 'good' ? (
              <>
                <div><span className="label-tag">когда</span> <div className="mt-1">{intentSentence}</div></div>
                <div><span className="label-tag">после чего</span> <div className="mt-1">{stackSentence}</div></div>
                <div><span className="label-tag">привлекательно</span> <div className="mt-1">{bundleSentence}</div></div>
                <div><span className="label-tag">2-минутная версия</span> <div className="mt-1">{form.twoMinute || '—'}</div></div>
                <div><span className="label-tag">трение</span> <div className="mt-1">{form.frictionReduction || '—'}</div></div>
                <div><span className="label-tag">награда</span> <div className="mt-1">{form.satisfyingReward || '—'}</div></div>
              </>
            ) : (
              <>
                <div><span className="label-tag">убрать триггер</span> <div className="mt-1">{form.invisibleAction || '—'}</div></div>
                <div><span className="label-tag">реальная цена</span> <div className="mt-1">{form.unattractiveCost || '—'}</div></div>
                <div><span className="label-tag">барьер</span> <div className="mt-1">{form.difficultBarrier || '—'}</div></div>
                <div><span className="label-tag">штраф</span> <div className="mt-1">{form.unsatisfyingPenalty || '—'}</div></div>
              </>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <button className="btn btn-ghost" onClick={prev}>← НАЗАД</button>
            <button className="btn btn-primary" onClick={save}>ЗАПУСТИТЬ →</button>
          </div>
        </section>
      )}
    </Page>
  )
}
