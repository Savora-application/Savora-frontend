import { useCallback, useEffect, useState } from "react"
import { Bot, ChevronDown, Compass, Gauge, LogOut, Menu, UserRound, WalletCards, X, Zap } from "lucide-react"
import { api, ApiError } from "./api"
import Auth from "./Auth"
import { Logo } from "./components"
import { AnalyzerView, AssistantView, Dashboard, DiscoverView, ProfileView, WalletView, type ViewProps } from "./Views"
import type { AuthResult, CreditCard, FinancialProfile, User, WalletCard } from "./types"

const TOKEN_KEY = "savora_access_token"
const navItems = [
  { id: "dashboard", label: "Overview", icon: Gauge },
  { id: "wallet", label: "Wallet", icon: WalletCards },
  { id: "analyze", label: "Purchase analyzer", icon: Zap },
  { id: "discover", label: "Discover cards", icon: Compass },
  { id: "assistant", label: "Ask Savora", icon: Bot }
]

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "")
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FinancialProfile | null>(null)
  const [wallet, setWallet] = useState<WalletCard[]>([])
  const [cards, setCards] = useState<CreditCard[]>([])
  const [page, setPage] = useState("dashboard")
  const [loading, setLoading] = useState(Boolean(token))
  const [mobileOpen, setMobileOpen] = useState(false)

  const signOut = useCallback(async () => {
    if (token) await api.logout(token).catch(() => undefined)
    localStorage.removeItem(TOKEN_KEY)
    setToken("")
    setUser(null)
    setProfile(null)
    setWallet([])
    setCards([])
  }, [token])

  const refresh = useCallback(async () => {
    if (!token) return
    const [currentUser, currentProfile, currentWallet, currentCards] = await Promise.all([api.me(token), api.getProfile(token), api.wallet(token), api.cards(token)])
    setUser(currentUser)
    setProfile(currentProfile)
    setWallet(currentWallet)
    setCards(currentCards)
  }, [token])

  useEffect(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    refresh().catch((error) => { if (error instanceof ApiError && error.status === 401) signOut() }).finally(() => setLoading(false))
  }, [token, refresh, signOut])

  function authenticated(result: AuthResult) {
    localStorage.setItem(TOKEN_KEY, result.token)
    setUser(result.user)
    setToken(result.token)
  }

  function navigate(nextPage: string) { setPage(nextPage); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }) }

  if (!token) return <Auth onAuthenticated={authenticated} />
  if (!user && loading) return <div className="app-loader"><Logo /><span /></div>
  if (!user) return <Auth onAuthenticated={authenticated} />

  const props: ViewProps = { token, user, profile, wallet, cards, loading, refresh, navigate }
  const views: Record<string, React.ReactNode> = {
    dashboard: <Dashboard {...props} />,
    wallet: <WalletView {...props} />,
    analyze: <AnalyzerView {...props} />,
    discover: <DiscoverView {...props} />,
    assistant: <AssistantView {...props} />,
    profile: <ProfileView {...props} />
  }
  const displayName = profile?.name || user.email.split("@")[0]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-top"><Logo /><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button></div>
      <nav>{navItems.map((item) => <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => navigate(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.id === "assistant" && <b>AI</b>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`user-menu ${page === "profile" ? "active" : ""}`} onClick={() => navigate("profile")}><span className="avatar">{displayName.charAt(0).toUpperCase()}</span><span><strong>{displayName}</strong><small>{user.email}</small></span><ChevronDown size={15} /></button><button className="logout" onClick={signOut}><LogOut size={17} />Sign out</button></div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <div className="app-main"><div className="mobile-bar"><button onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button><Logo /><button onClick={() => navigate("profile")} aria-label="Open profile"><UserRound /></button></div>{views[page] ?? views.dashboard}</div>
  </div>
}
