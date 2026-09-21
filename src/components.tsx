import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react"
import { LoaderCircle, X } from "lucide-react"
import type { CreditCard } from "./types"

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark">S</span>{!compact && <span>Savora</span>}</div>
}

export function Button({ children, variant = "primary", busy, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; busy?: boolean }) {
  return <button {...props} className={`button ${variant} ${props.className ?? ""}`} disabled={props.disabled || busy}>{busy ? <LoaderCircle className="spin" size={18} /> : children}</button>
}

export function Field({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="field"><span>{label}</span><input {...props} />{hint && <small>{hint}</small>}</label>
}

export function SelectField({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>
}

export function Notice({ children, type = "error", onClose }: { children: ReactNode; type?: "error" | "success" | "info"; onClose?: () => void }) {
  return <div className={`notice ${type}`} role="status"><span>{children}</span>{onClose && <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>}</div>
}

export function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{copy}</p>{action}</div>
}

export function LoadingBlock() {
  return <div className="loading-block"><LoaderCircle className="spin" size={26} /><span>Loading your Savora data</span></div>
}

export function CardVisual({ card, small = false }: { card: CreditCard; small?: boolean }) {
  const tone = card.network.toLowerCase().includes("visa") ? "indigo" : card.network.toLowerCase().includes("master") ? "coral" : "green"
  return <div className={`card-visual ${tone} ${small ? "small" : ""}`}><span className="card-chip" /><span className="card-brand">{card.issuer}</span><strong>{card.name}</strong><div><span>••••  {card.id.slice(-4).toUpperCase()}</span><span>{card.network}</span></div></div>
}

export const money = (value: number | string | null | undefined, currency = "CAD") => new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value ?? 0))

export const categories = ["groceries", "restaurants", "gas", "travel", "transit", "entertainment", "shopping", "recurring-bills", "utilities", "drugstores", "other"]

export const titleCase = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
