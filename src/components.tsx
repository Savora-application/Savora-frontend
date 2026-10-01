import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react"
import { LoaderCircle, X } from "lucide-react"
import type { CreditCard } from "./types"
import savoraLogo from "./assets/savora-logo.png"

export function Logo({ compact = false }: { compact?: boolean }) {
  return <svg className={`logo${compact ? " logo-compact" : ""}`} viewBox={compact ? "140 480 225 255" : "140 480 980 255"} role="img" aria-label="Savora"><image href={savoraLogo} width="1254" height="1254" /></svg>
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
  return <div className={`card-visual ${tone} ${small ? "small" : ""}`}><span className="card-chip" /><span className="card-brand">{card.issuer}</span><strong>{card.name}</strong><div><span>Savora card catalog</span><span>{card.network}</span></div></div>
}

export const money = (value: number | string | null | undefined, currency = "CAD") => new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value ?? 0))

export const categories = ["groceries", "dining", "gas", "travel", "transit", "entertainment", "shopping", "recurring-bills", "utilities", "drugstore", "other"]

export const titleCase = (value: string) => value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())


export const nullablePercent = (value: number | string | null | undefined) =>
  value === null || value === undefined ? "Not published" : `${(Number(value) * 100).toFixed(1)}%`

export function rewardRateLabel(
  value: number | string | null | undefined,
  rateType?: "CASHBACK_RATE" | "POINTS_PER_DOLLAR" | "MILES_PER_DOLLAR" | null,
) {
  if (value === null || value === undefined) return "Not published"
  const rate = Number(value)
  if (rateType === "CASHBACK_RATE") return `${(rate * 100).toFixed(rate * 100 % 1 ? 1 : 0)}%`
  if (rateType === "MILES_PER_DOLLAR") return `${rate} mi/$`
  return `${rate}×`
}
