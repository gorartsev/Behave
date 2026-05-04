import { useEffect, useState } from 'react'
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
import HabitDetail from './screens/HabitDetail'
import Onboarding from './screens/Onboarding'
import Audit from './screens/Audit'
import Contract from './screens/Contract'

export default function App() {
  // Two-step state: first await Dexie to actually open and tell us whether
  // an identity row exists. Then useLiveQuery follows live updates.
  const [ready, setReady] = useState(false)
  const [hasIdentity, setHasIdentity] = useState(false)
  const liveIdentity = useLiveQuery(() => db.identity.get('me'), [])

  useEffect(() => {
    db.identity.get('me')
      .then(r => { setHasIdentity(!!r); setReady(true) })
      .catch(err => {
        console.error('[BEHAVE] db open failed:', err)
        setReady(true)
      })
  }, [])

  // Sync hasIdentity with live updates after first load.
  useEffect(() => {
    if (ready) setHasIdentity(!!liveIdentity)
  }, [liveIdentity, ready])

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper font-mono text-pink-600">
        <div className="text-center">
          <div className="font-display text-5xl">BEHAVE</div>
          <div className="text-xs uppercase tracking-widest mt-2">загрузка…</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {!hasIdentity && <Route path="*" element={<Onboarding />} />}
        {hasIdentity && <>
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
      {hasIdentity && <BottomNav />}
    </>
  )
}
