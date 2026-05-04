import { db, type CheckIn } from './db'

export interface StreakInfo {
  current: number
  longest: number
  lastDate: string | null
  /** Yesterday was a miss AND today not yet done — actionable warning. */
  missedYesterday: boolean
  /** Two or more full days missed (yesterday + the day before). Already broke "never miss twice". */
  missedTwiceInRow: boolean
}

const isoOfDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const todayISO = () => isoOfDate(new Date())
const yesterdayISO = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return isoOfDate(d)
}

/** Number of calendar days between two YYYY-MM-DD strings (a - b), DST-safe. */
const dayDiff = (a: string, b: string) => {
  // Use UTC to avoid DST hour shifts producing 23h/25h spans.
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const ua = Date.UTC(ay, am - 1, ad)
  const ub = Date.UTC(by, bm - 1, bd)
  return Math.round((ua - ub) / 86400000)
}

export async function streakFor(habitId: string): Promise<StreakInfo> {
  const all = await db.checkins.where('habitId').equals(habitId).toArray()
  const done = all.filter(c => c.done).map(c => c.date).sort()
  if (done.length === 0) {
    return { current: 0, longest: 0, lastDate: null, missedYesterday: false, missedTwiceInRow: false }
  }
  // Run length ending at the latest done date.
  let longest = 1, run = 1
  for (let i = 1; i < done.length; i++) {
    if (dayDiff(done[i], done[i - 1]) === 1) {
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
    }
  }
  longest = Math.max(longest, run)

  const today = todayISO()
  const last = done[done.length - 1]
  const gap = dayDiff(today, last)
  // Streak considered "alive" only if today is done OR last done was yesterday
  // (today is still actionable until end of day — no premature alarm).
  const current = gap === 0 ? run : (gap === 1 ? run : 0)

  // Alarm only after we've crossed the line: "yesterday and today both missed".
  const missedTwiceInRow = gap >= 2
  // Mild warning only when at least 2 days have passed without a check-in
  // (yesterday confirmed missed). Avoid flagging in the morning of a new day.
  const missedYesterday = gap === 2 && !done.includes(yesterdayISO())
  return { current, longest, lastDate: last, missedYesterday, missedTwiceInRow }
}

export async function recentCheckins(habitId: string, days = 30): Promise<CheckIn[]> {
  const all = await db.checkins.where('habitId').equals(habitId).toArray()
  const map = new Map(all.map(c => [c.date, c]))
  const out: CheckIn[] = []
  // Iterate by UTC days to be DST-safe; then format using local date components
  // for display (the date string was originally produced from the local clock).
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = isoOfDate(d)
    const c = map.get(iso)
    if (c) out.push(c)
    else out.push({ id: habitId + iso, habitId, date: iso, done: false, twoMinuteOnly: false, createdAt: 0 })
  }
  return out
}
