import { type PropsWithChildren, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Page({ children, title, back }: PropsWithChildren<{ title?: string; back?: string }>) {
  const nav = useNavigate()
  const onBack = () => {
    if (!back) return
    if (back === '-1') nav(-1)
    else nav(back)
  }
  return (
    <div className="relative min-h-screen safe-pt safe-pb px-5 pb-24">
      <div className="relative z-10 max-w-xl mx-auto">
        {(title || back) && (
          <header className="flex items-center justify-between mb-6 mt-2">
            {back ? (
              <button onClick={onBack} className="btn btn-ghost text-xs px-3 py-2">← НАЗАД</button>
            ) : <span />}
            {title && <span className="label-tag">{title}</span>}
          </header>
        )}
        {children}
      </div>
    </div>
  )
}

export function Brand({ size = 'lg' }: { size?: 'lg' | 'md' | 'sm' }) {
  const s = size === 'lg' ? 'text-7xl' : size === 'md' ? 'text-4xl' : 'text-2xl'
  return (
    <div className={`h-display ${s} glitch`} data-text="BEHAVE">BEHAVE</div>
  )
}

export function Stamp({ children }: PropsWithChildren) {
  return <span className="stamp text-xs">{children}</span>
}

export function Tile({ children, className = '', onClick, to, accent }: {
  children: ReactNode
  className?: string
  onClick?: () => void
  to?: string
  accent?: boolean
}) {
  const cls = `tile ${accent ? 'tile-pink' : ''} ${className}`
  if (to) return <Link to={to} className={cls + ' block'}>{children}</Link>
  if (onClick) return <button onClick={onClick} className={cls + ' text-left w-full'}>{children}</button>
  return <div className={cls}>{children}</div>
}

export function Field({ label, hint, children }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="label-tag">{label}</span>
        {hint && <span className="text-[10px] text-ink/60 ml-2">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-paper border-2 border-ink rounded-lg px-3 py-2.5 font-mono text-base focus:outline-none focus:shadow-brutal-pink focus:-translate-x-[2px] focus:-translate-y-[2px] transition-all placeholder:text-ink/40 ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-paper border-2 border-ink rounded-lg px-3 py-2.5 font-mono text-base focus:outline-none focus:shadow-brutal-pink focus:-translate-x-[2px] focus:-translate-y-[2px] transition-all placeholder:text-ink/40 min-h-[88px] ${props.className ?? ''}`}
    />
  )
}

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-3">
      {kicker && <div className="label-tag mb-2">{kicker}</div>}
      <h2 className="h-display text-3xl">{title}</h2>
      {sub && <p className="text-sm text-ink/70 mt-2 leading-snug">{sub}</p>}
    </div>
  )
}

export function Quote({ children }: PropsWithChildren) {
  return (
    <blockquote className="relative border-l-4 border-pink-500 pl-4 py-1 text-sm italic text-ink/80 my-3">
      {children}
    </blockquote>
  )
}

export function StripeBar({ pale }: { pale?: boolean }) {
  return <div className={`h-2 ${pale ? 'stripe-pale' : 'stripe'} rounded-sm my-3`} />
}

export function Pin({ children }: PropsWithChildren) {
  return <span className="pin">{children}</span>
}
