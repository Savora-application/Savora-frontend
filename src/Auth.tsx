import { useState, type FormEvent } from "react"
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react"
import { api, ApiError } from "./api"
import { Button, Field, Logo, Notice } from "./components"
import type { AuthResult } from "./types"

export default function Auth({ onAuthenticated }: { onAuthenticated: (result: AuthResult) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      onAuthenticated(mode === "login" ? await api.login(email.trim().toLowerCase(), password) : await api.register(email.trim().toLowerCase(), password))
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to reach Savora. Check that the API is running.")
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-shell">
    <section className="auth-story">
      <Logo />
      <div className="auth-pitch">
        <span className="eyebrow">Your money, working smarter</span>
        <h1>Make every purchase <em>count.</em></h1>
        <p>Savora finds the best card in your wallet for every purchase, so you never leave rewards on the table.</p>
        <div className="auth-benefits">
          <div><Sparkles /><span><strong>Personalized picks</strong><small>Recommendations built around your spending</small></span></div>
          <div><BarChart3 /><span><strong>Clear reward math</strong><small>See the real value behind every card</small></span></div>
          <div><ShieldCheck /><span><strong>No bank connections</strong><small>No bank logins, account numbers, or credit-card numbers</small></span></div>
        </div>
      </div>
      <p className="auth-foot">Built for Canadians who want more from their money.</p>
    </section>
    <section className="auth-panel">
      <div className="auth-form-wrap">
        <span className="mobile-logo"><Logo /></span>
        <div className="auth-heading"><span className="eyebrow">{mode === "login" ? "Welcome back" : "Start earning smarter"}</span><h2>{mode === "login" ? "Sign in to Savora" : "Create your account"}</h2><p>{mode === "login" ? "Your wallet is ready when you are." : "A better rewards strategy starts here."}</p></div>
        <div className="segmented"><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError("") }}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError("") }}>Create account</button></div>
        <form onSubmit={submit}>
          {error && <Notice>{error}</Notice>}
          <Field label="Email address" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Field label="Password" type="password" placeholder="At least 12 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required hint={mode === "register" ? "Use 12 or more characters" : undefined} />
          <Button type="submit" busy={busy}>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={18} /></Button>
        </form>
        <p className="terms">By continuing, you agree to Savora’s Terms and Privacy Policy.</p>
      </div>
    </section>
  </main>
}
