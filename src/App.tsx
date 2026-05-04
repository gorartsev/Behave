import { Routes, Route, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './lib/db'
import BottomNav from './components/BottomNav'
import Today from './screens/Today'
import Habits from './screens/Habits'
import Scorecard from './screens/Scorecard'
import Review from './screens/Review'
import IdentityScreen from './screens/Identity'
import NewHabit from './screens/NewHabit'
import BreakHabit from './screens/BreakHabit'
import HabitDetail from './screens/HabitDetail'
import Onboarding from './screens/Onboarding'

export default function App() {
  const identity = useLiveQuery(() => db.identity.get('me'))

  if (identity === undefined) {
    return <div className="min-h-screen grid place-items-center font-display text-3xl text-pink-500 animate-flicker">BEHAVE…</div>
  }

  return (
    <>
      <Routes>
        {!identity && <Route path="*" element={<Onboarding />} />}
        {identity && <>
          <Route path="/" element={<Today />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habits/new" element={<NewHabit kind="good" />} />
          <Route path="/habits/break" element={<NewHabit kind="bad" />} />
          <Route path="/habits/break-flow" element={<BreakHabit />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/identity" element={<IdentityScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>}
      </Routes>
      {identity && <BottomNav />}
    </>
  )
}
