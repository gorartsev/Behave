import { db, type CheckIn } from './db'

export interface StreakInfo {
  current: number
  longest: number
  lastDate: string | null
  missedYesterday: boolean      // "никогда не пропускай дважды"
  missedTwiceInRow: boolean     // alarm
}

const dayDiff = (a: string, b: string) => {
  const da = new Date(a + 'T00:00:00')
  const db_ = new Date(b + 'T00:00:00')
  return Math.round((da.getTime() - db_.getTime()) / 86400000)
}

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export async function streakFor(habitId: string): Promise<StreakInfo> {
  const all = await db.checkins.where('habitId').equals(habitId).toArray()
  const done = all.filter(c => c.done).map(c => c.date).sort()
  if (done.length === 0) {
    return { current: 0, longest: 0, lastDate: null, missedYesterday: false, missedTwiceInRow: false }
  }
  let longest = 1, run = 1
  for (let i = 1; i < done.length; i++) {
    if (dayDiff(done[i], done[i - 1]) === 1) { run++; longest = Math.max(longest, run) }
    else run = 1
  }
  const today = todayISO()
  const last = done[done.length - 1]
  const gap = dayDiff(today, last)
  const current = gap === 0 ? run : (gap === 1 ? run : 0)

  // missed-twice detection: any two consecutive non-done days inside the active range
  const missedYesterday = gap === 1
  const missedTwiceInRow = gap >= 2
  return { current, longest, lastDate: last, missedYesterday, missedTwiceInRow }
}

export async function recentCheckins(habitId: string, days = 30): Promise<CheckIn[]> {
  const all = await db.checkins.where('habitId').equals(habitId).toArray()
  const map = new Map(all.map(c => [c.date, c]))
  const out: CheckIn[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const c = map.get(iso)
    if (c) out.push(c)
    else out.push({ id: habitId + iso, habitId, date: iso, done: false, twoMinuteOnly: false, createdAt: 0 })
  }
  return out
}
