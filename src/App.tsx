import { Routes, Route, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Identity } from './lib/db'
import BottomNav from './components/BottomNav'
import Today from './screens/Today'
import Habits from './screens/Habits'
import Scorecard from './screens/Scorecard'
import Review from './screens/Review'
import IdentityScreen from './screens/Identity'
import NewHabit from './screens/NewHabit'
import HabitDetail from './screens/HabitDetail'
import Onboarding from './screens/Onboarding'
import Audit from './screens/Audit'
import Contract from './screens/Contract'

const LOADING = Symbol('loading')

export default function App() {
  // useLiveQuery returns `undefined` both while loading AND when the record
  // doesn't exist. We pass a sentinel default so we can distinguish the two
  // states cleanly: LOADING -> still resolving; undefined -> no identity yet;
  // Identity object -> ready.
  const identity = useLiveQuery<Identity | undefined, typeof LOADING>(
    () => db.identity.get('me'),
    [],
    LOADING,
  )

  if (identity === LOADING) {
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
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/review" element={<Review />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/identity" element={<IdentityScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>}
      </Routes>
      {identity && <BottomNav />}
    </>
  )
}
