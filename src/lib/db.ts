import Dexie, { type Table } from 'dexie'

export type HabitKind = 'good' | 'bad'

export interface Identity {
  id: 'me'
  whoIWantToBe: string         // "Я — человек, который..."
  identityWord: string         // "читатель" — одно слово
  createdAt: number
}

export interface Habit {
  id: string
  kind: HabitKind
  title: string                // "Читать 10 страниц"
  identityTag: string          // "читатель"
  // Implementation intention (Law 1: Make it Obvious)
  whenTime: string             // "в 21:30"
  whenPlace: string            // "в спальне"
  // Habit stacking
  stackAfter: string           // "После того как почищу зубы"
  // Law 2: Make it Attractive — temptation bundling / motivation reframing
  attractiveBundle: string     // "после чтения — серия Netflix"
  attractiveReframe: string    // "я могу читать..."
  // Law 3: Make it Easy — two-minute version + friction reduction
  twoMinute: string            // "Открыть книгу и прочитать 1 абзац"
  frictionReduction: string    // "Положить книгу на подушку"
  // Law 4: Make it Satisfying — immediate reward + tracker
  satisfyingReward: string     // "Поставить галочку, выпить чай"
  // For bad habits — inversion fields
  invisibleAction: string      // убрать триггер из среды
  unattractiveCost: string     // переосмыслить выгоду
  difficultBarrier: string     // commitment device
  unsatisfyingPenalty: string  // habit contract / штраф
  // Bookkeeping
  createdAt: number
  active: boolean
  archivedAt?: number
}

export interface CheckIn {
  id: string                   // habitId + date
  habitId: string
  date: string                 // YYYY-MM-DD
  done: boolean                // for good habit: did it. for bad: avoided it.
  twoMinuteOnly: boolean
  note?: string
  createdAt: number
}

export interface ScorecardEntry {
  id: string
  text: string                 // "Просыпаюсь и беру телефон"
  verdict: '+' | '-' | '='     // помогает / мешает / нейтрально
  createdAt: number
}

export type ReviewKind = 'weekly' | 'annual' | 'integrity'

export interface ReviewEntry {
  id: string                   // 'wk-YYYY-MM-DD' | 'yr-YYYY' | 'int-YYYY'
  kind: ReviewKind
  periodOf: string             // 'YYYY-MM-DD' for weekly; 'YYYY' for annual/integrity
  q1: string                   // weekly: что сработало | annual: что получилось | integrity: главные ценности
  q2: string                   // weekly: что не получилось | annual: что не получилось | integrity: живу ли в согласии
  q3: string                   // weekly: что меняю | annual: чему научился | integrity: как поднять планку
  createdAt: number
}

export interface HabitContract {
  id: string
  goal: string                 // долгосрочная цель
  phases: string               // фазы по кварталам
  dailyHabits: string          // ежедневные привычки
  penalty: string              // что произойдёт при нарушении
  partner1: string             // имя 1-го свидетеля
  partner2: string             // имя 2-го свидетеля (опционально)
  signedAt: number
}

export interface AuditItem {
  id: string
  question: string
  answer: string
  createdAt: number
}

class BehaveDB extends Dexie {
  identity!: Table<Identity, 'me'>
  habits!: Table<Habit, string>
  checkins!: Table<CheckIn, string>
  scorecard!: Table<ScorecardEntry, string>
  reviews!: Table<ReviewEntry, string>
  contracts!: Table<HabitContract, string>
  audit!: Table<AuditItem, string>

  constructor() {
    super('behave')
    // v1: original schema (kept for migration of any test installs)
    this.version(1).stores({
      identity:  '&id',
      habits:    '&id, kind, active, identityTag, createdAt',
      checkins:  '&id, habitId, date, done',
      scorecard: '&id, verdict, createdAt',
      reviews:   '&id, weekOf',
      contracts: '&id, signedAt',
    })
    // v2: drop `votes` from identity (now derived from check-ins),
    // add `identityWord`, restructure reviews, add audit table.
    this.version(2).stores({
      identity:  '&id',
      habits:    '&id, kind, active, identityTag, createdAt',
      checkins:  '&id, habitId, date, done',
      scorecard: '&id, verdict, createdAt',
      reviews:   '&id, kind, periodOf',
      contracts: '&id, signedAt',
      audit:     '&id, createdAt',
    }).upgrade(tx => tx.table('reviews').toCollection().modify((r: any) => {
      if (r.weekOf && !r.kind) {
        r.kind = 'weekly'
        r.periodOf = r.weekOf
        r.q1 = r.whatWorked ?? ''
        r.q2 = r.whatFailed ?? ''
        r.q3 = r.whatToChange ?? ''
        delete r.weekOf
        delete r.whatWorked
        delete r.whatFailed
        delete r.whatToChange
      }
    }))
  }
}

export const db = new BehaveDB()

export const todayISO = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const weekStartISO = (date = new Date()) => {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - day)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const uid = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36))

// Derived counter: total "votes" = total successful check-ins of GOOD habits.
// Storing this would create a race condition (read-then-write); deriving avoids it.
export async function totalVotes(): Promise<number> {
  const goodIds = (await db.habits.where('kind').equals('good').toArray()).map(h => h.id)
  if (goodIds.length === 0) return 0
  return db.checkins.where('habitId').anyOf(goodIds).filter(c => c.done).count()
}

// Votes per identityWord — used for "ты — человек, который ___" tally.
export async function votesForIdentity(word: string): Promise<number> {
  if (!word) return 0
  const habitIds = (await db.habits
    .where('kind').equals('good')
    .filter(h => h.identityTag.toLowerCase() === word.toLowerCase())
    .toArray()).map(h => h.id)
  if (habitIds.length === 0) return 0
  return db.checkins.where('habitId').anyOf(habitIds).filter(c => c.done).count()
}
