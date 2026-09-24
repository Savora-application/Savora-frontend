import { useMemo, useState, type FormEvent } from "react"
import { ArrowRight, Bot, Check, ChevronRight, CircleDollarSign, CreditCard as CardIcon, Lightbulb, MessageCircle, Pencil, Plus, Send, Sparkles, Trash2, TrendingUp, WalletCards, Zap } from "lucide-react"
import { api, ApiError } from "./api"
import { Button, CardVisual, EmptyState, Field, LoadingBlock, Notice, SelectField, categories, money, titleCase } from "./components"
import type { CreditCard, FinancialProfile, PurchaseAnalysis, Recommendation, User, WalletCard } from "./types"

export type ViewProps = { token: string; user: User; profile: FinancialProfile | null; wallet: WalletCard[]; cards: CreditCard[]; loading: boolean; refresh: () => Promise<void>; navigate: (page: string) => void }

export function Dashboard({ profile, wallet, loading, navigate }: ViewProps) {
  if (loading) return <LoadingBlock />
  const firstName = profile?.name.split(" ")[0] ?? "there"
  const bestRules = wallet.flatMap((item) => item.creditCard.rewardRules.map((rule) => ({ ...rule, card: item.creditCard.name }))).sort((a, b) => Number(b.multiplier) - Number(a.multiplier)).slice(0, 3)
  return <div className="page-content">
    <header className="page-header"><div><span className="eyebrow">Your rewards command centre</span><h1>Good to see you, {firstName}.</h1><p>Here’s how your wallet is working for you.</p></div><Button onClick={() => navigate("analyze")}><Zap size={18} />Analyze a purchase</Button></header>
    {!profile && <Notice type="info">Complete your financial profile to unlock personalized card recommendations. <button className="link-button" onClick={() => navigate("profile")}>Set it up</button></Notice>}
    <section className="metric-grid">
      <article className="metric-card featured"><div className="metric-icon"><WalletCards /></div><span>Cards in your wallet</span><strong>{wallet.length}</strong><small>{wallet.length ? "Ready for smarter spending" : "Add a card to get started"}</small></article>
      <article className="metric-card"><div className="metric-icon"><TrendingUp /></div><span>Top reward rate</span><strong>{bestRules[0] ? `${Number(bestRules[0].multiplier)}×` : "—"}</strong><small>{bestRules[0] ? `On ${titleCase(bestRules[0].category)}` : "Build your wallet"}</small></article>
      <article className="metric-card"><div className="metric-icon"><CircleDollarSign /></div><span>Annual fees</span><strong>{money(wallet.reduce((sum, item) => sum + Number(item.creditCard.annualFee), 0))}</strong><small>Across active cards</small></article>
    </section>
    <section className="dashboard-grid">
      <article className="panel"><div className="panel-heading"><div><span className="eyebrow">Your wallet</span><h2>Cards at a glance</h2></div><button className="text-action" onClick={() => navigate("wallet")}>View all <ChevronRight size={16} /></button></div>
        {wallet.length ? <div className="wallet-preview">{wallet.slice(0, 2).map((item) => <div className="wallet-preview-row" key={item.id}><CardVisual card={item.creditCard} small /><div><strong>{item.nickname || item.creditCard.name}</strong><span>{item.creditCard.issuer}</span><small>{Number(item.creditCard.baseRewardRate) * 100}% base rewards</small></div></div>)}</div> : <EmptyState icon={<CardIcon />} title="Your wallet is empty" copy="Add the cards you already carry to start comparing rewards." action={<Button onClick={() => navigate("wallet")}><Plus size={17} />Add a card</Button>} />}
      </article>
      <article className="panel insight-panel"><div className="panel-heading"><div><span className="eyebrow">Best in your wallet</span><h2>Top earning categories</h2></div><Sparkles /></div>
        {bestRules.length ? <div className="rule-list">{bestRules.map((rule, index) => <div key={`${rule.id}-${index}`}><span className="rank">{index + 1}</span><div><strong>{titleCase(rule.category)}</strong><small>{rule.card}</small></div><b>{Number(rule.multiplier)}×</b></div>)}</div> : <EmptyState icon={<Lightbulb />} title="Insights are waiting" copy="Add cards to see where your wallet earns the most." />}
      </article>
    </section>
    <section className="quick-section"><span className="eyebrow">Quick actions</span><div className="quick-grid"><button onClick={() => navigate("analyze")}><Zap /><span><strong>Which card should I use?</strong><small>Compare your wallet for a purchase</small></span><ArrowRight /></button><button onClick={() => navigate("discover")}><Sparkles /><span><strong>Find my next card</strong><small>Get picks based on your profile</small></span><ArrowRight /></button><button onClick={() => navigate("assistant")}><MessageCircle /><span><strong>Ask Savora</strong><small>Talk to your financial assistant</small></span><ArrowRight /></button></div></section>
  </div>
}

export function WalletView({ token, wallet, cards, loading, refresh }: ViewProps) {
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState("")
  const [nickname, setNickname] = useState("")
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const available = cards.filter((card) => !wallet.some((item) => item.creditCard.id === card.id))
  async function add(event: FormEvent) { event.preventDefault(); setBusy("add"); setError(""); try { await api.addToWallet(token, selected, nickname.trim() || undefined); setAdding(false); setSelected(""); setNickname(""); await refresh() } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Unable to add this card") } finally { setBusy("") } }
  async function remove(id: string) { setBusy(id); setError(""); try { await api.removeFromWallet(token, id); await refresh() } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Unable to remove this card") } finally { setBusy("") } }
  if (loading) return <LoadingBlock />
  return <div className="page-content"><header className="page-header"><div><span className="eyebrow">Your cards</span><h1>Wallet</h1><p>Keep the cards you carry in one place.</p></div><Button onClick={() => setAdding(!adding)} disabled={!available.length}><Plus size={18} />Add a card</Button></header>
    {error && <Notice onClose={() => setError("")}>{error}</Notice>}
    {adding && <form className="panel inline-form" onSubmit={add}><div className="panel-heading"><div><span className="eyebrow">Card catalog</span><h2>Add to your wallet</h2></div></div><div className="form-row"><SelectField label="Credit card" value={selected} onChange={(event) => setSelected(event.target.value)} required><option value="">Choose a card</option>{available.map((card) => <option value={card.id} key={card.id}>{card.name} · {card.issuer}</option>)}</SelectField><Field label="Nickname (optional)" value={nickname} maxLength={80} placeholder="My everyday card" onChange={(event) => setNickname(event.target.value)} /></div><div className="form-actions"><Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" busy={busy === "add"}>Add card</Button></div></form>}
    {wallet.length ? <div className="card-grid">{wallet.map((item) => <article className="panel wallet-card" key={item.id}><CardVisual card={item.creditCard} /><div className="wallet-card-info"><div><span className="eyebrow">{item.nickname || item.creditCard.issuer}</span><h2>{item.creditCard.name}</h2></div><div className="card-stats"><span><small>Base rate</small><strong>{(Number(item.creditCard.baseRewardRate) * 100).toFixed(1)}%</strong></span><span><small>Annual fee</small><strong>{money(item.creditCard.annualFee)}</strong></span><span><small>FX fee</small><strong>{(Number(item.creditCard.foreignTransactionFee) * 100).toFixed(1)}%</strong></span></div><div className="tags">{item.creditCard.rewardRules.slice(0, 3).map((rule) => <span key={rule.id}>{Number(rule.multiplier)}× {titleCase(rule.category)}</span>)}</div><Button variant="ghost" busy={busy === item.id} onClick={() => remove(item.id)}><Trash2 size={16} />Remove</Button></div></article>)}</div> : <div className="panel"><EmptyState icon={<WalletCards />} title="Build your wallet" copy="Add the cards you use today. Savora will compare their rewards whenever you make a purchase." action={<Button onClick={() => setAdding(true)} disabled={!available.length}><Plus size={17} />Add your first card</Button>} /></div>}
  </div>
}

export function AnalyzerView({ token, wallet }: ViewProps) {
  const [merchant, setMerchant] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("groceries")
  const [result, setResult] = useState<PurchaseAnalysis | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function analyze(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { setResult(await api.analyzePurchase(token, { merchant: merchant.trim() || undefined, amount: Number(amount), currency: "CAD", category })) } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Unable to analyze this purchase") } finally { setBusy(false) } }
  return <div className="page-content narrow"><header className="page-header"><div><span className="eyebrow">Smart spending</span><h1>Which card should I use?</h1><p>Tell us about your purchase. We’ll do the reward math.</p></div></header>
    {!wallet.length && <Notice type="info">Add at least one card to your wallet before analyzing a purchase.</Notice>}
    <form className="panel analyzer-form" onSubmit={analyze}><div className="form-row"><Field label="Purchase amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required /><Field label="Merchant (optional)" placeholder="Where are you shopping?" maxLength={200} value={merchant} onChange={(event) => setMerchant(event.target.value)} /></div><SelectField label="Spending category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}</SelectField>{error && <Notice>{error}</Notice>}<Button type="submit" busy={busy} disabled={!wallet.length}><Sparkles size={18} />Find my best card</Button></form>
    {result && <section className="results"><span className="eyebrow">Your best match</span><article className="result-winner"><div className="winner-mark"><Check /></div><div><small>Use this card</small><h2>{result.recommendation.card.name}</h2><p>{result.recommendation.card.issuer} · {result.recommendation.card.network}</p></div><div className="winner-value"><small>Estimated reward</small><strong>{money(result.recommendation.breakdown.estimatedValue, result.recommendation.breakdown.rewardCurrency)}</strong><span>{result.recommendation.breakdown.multiplier}× reward rate</span></div></article>{result.alternatives.length > 0 && <div className="alternatives"><h3>How your other cards compare</h3>{result.alternatives.map((item, index) => <div key={item.card.id}><span>{index + 2}</span><div><strong>{item.card.name}</strong><small>{item.card.issuer}</small></div><b>{money(item.breakdown.estimatedValue, item.breakdown.rewardCurrency)}</b></div>)}</div>}</section>}
  </div>
}

export function DiscoverView({ token, profile, loading, navigate }: ViewProps) {
  const [items, setItems] = useState<Recommendation[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function load() { setBusy(true); setError(""); try { setItems(await api.recommendations(token)) } catch (caught) { setError(caught instanceof ApiError ? caught.message : "Unable to load recommendations") } finally { setBusy(false) } }
  if (loading) return <LoadingBlock />
  return <div className="page-content"><header className="page-header"><div><span className="eyebrow">Made for you</span><h1>Discover cards</h1><p>Personalized recommendations based on how you spend.</p></div>{profile && <Button onClick={load} busy={busy}><Sparkles size={18} />{items ? "Refresh picks" : "Get my picks"}</Button>}</header>
    {!profile ? <div className="panel"><EmptyState icon={<Sparkles />} title="Tell us about your goals first" copy="Your profile gives Savora the information it needs to compare cards for your spending." action={<Button onClick={() => navigate("profile")}>Complete profile</Button>} /></div> : <>{error && <Notice>{error}</Notice>}{items === null ? <div className="discover-hero panel"><div className="big-icon"><Sparkles /></div><h2>Cards that fit your life, not the other way around.</h2><p>We’ll compare available cards against your expenses and spending preferences, then rank the three with the strongest estimated annual value.</p><Button onClick={load} busy={busy}>See my recommendations <ArrowRight size={18} /></Button></div> : items.length ? <div className="recommendation-grid">{items.map((item) => <article className={`panel recommendation-card ${item.rank === 1 ? "top" : ""}`} key={item.card.id}><div className="recommendation-rank">#{item.rank}{item.rank === 1 && <span>Best match</span>}</div><div><span className="eyebrow">{item.card.issuer}</span><h2>{item.card.name}</h2><p>{item.card.network}</p></div><div className="annual-value"><small>Estimated annual value</small><strong>{money(item.estimatedAnnualValue)}</strong><span>{money(item.estimatedRewards)} rewards − {money(item.annualFee)} fee</span></div><div className="reason-list">{item.reasons.map((reason) => <span key={reason}><Check size={15} />{reason}</span>)}{item.drawbacks.map((drawback) => <span className="drawback" key={drawback}>− {drawback}</span>)}</div></article>)}</div> : <div className="panel"><EmptyState icon={<Check />} title="Your wallet has it covered" copy="There are no additional active cards to recommend right now." /></div>}</>}
  </div>
}

const emptyProfile: Omit<FinancialProfile, "id" | "userId"> = {
  name: "",
  province: "ON",
  financialGoals: [],
  spendingPreferences: {},
  travelPreferences: {},
  rewardPreferences: {},
  annualFeePreference: "any",
  bankingRelationships: {},
  additionalPreferences: {}
}
const provinces = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]
const goalOptions = ["Travel more", "Save money", "Build credit", "Save for a home", "Maximize rewards"]
const bankOptions = [
  ["rbc", "RBC"],
  ["td", "TD"],
  ["cibc", "CIBC"],
  ["scotiabank", "Scotiabank"],
  ["bmo", "BMO"],
  ["national-bank", "National Bank"],
  ["tangerine", "Tangerine"],
  ["simplii", "Simplii"],
] as const
const profileSpendCategories = [
  ["groceries", "Groceries"],
  ["dining", "Dining / restaurants"],
  ["gas", "Gas"],
  ["transit", "Transit"],
  ["recurring-bills", "Recurring bills"],
  ["travel", "Travel"],
  ["shopping", "Shopping"],
  ["other", "Other"],
] as const

export function ProfileView({ token, user, profile, loading, refresh }: ViewProps) {
  const initial = useMemo(() => profile
    ? {
        ...emptyProfile,
        ...profile,
        annualPersonalIncome: profile.annualPersonalIncome ?? undefined,
        annualHouseholdIncome: profile.annualHouseholdIncome ?? undefined,
        monthlyExpenses: profile.monthlyExpenses ?? undefined,
        monthlySavings: profile.monthlySavings ?? undefined,
        spendingPreferences: profile.spendingPreferences ?? {},
        travelPreferences: profile.travelPreferences ?? {},
        bankingRelationships: profile.bankingRelationships ?? {},
        additionalPreferences: profile.additionalPreferences ?? {},
      }
    : emptyProfile, [profile])
  const [form, setForm] = useState(initial)
  const [email, setEmail] = useState(user.email)
  const [busy, setBusy] = useState("")
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  const update = (key: string, value: unknown) =>
    setForm((current) => ({ ...current, [key]: value }))

  const numberValue = (value: unknown) =>
    value === "" || value === undefined || value === null ? undefined : Number(value)

  function toggleGoal(goal: string) {
    update(
      "financialGoals",
      form.financialGoals.includes(goal)
        ? form.financialGoals.filter((item) => item !== goal)
        : [...form.financialGoals, goal],
    )
  }

  function toggleBank(slug: string) {
    setForm((current) => {
      const next = { ...current.bankingRelationships }
      if (next[slug]?.hasAccount) delete next[slug]
      else next[slug] = { hasAccount: true }
      return { ...current, bankingRelationships: next }
    })
  }

  function updateSpend(category: string, value: string) {
    setForm((current) => {
      const next = { ...current.spendingPreferences }
      if (value === "") delete next[category]
      else next[category] = Math.max(0, Number(value))
      return { ...current, spendingPreferences: next }
    })
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setBusy("profile")
    setMessage(null)
    try {
      await api.saveProfile(token, {
        ...form,
        annualPersonalIncome: numberValue(form.annualPersonalIncome),
        annualHouseholdIncome: numberValue(form.annualHouseholdIncome),
        monthlyExpenses: numberValue(form.monthlyExpenses),
        monthlySavings: numberValue(form.monthlySavings),
        travelPreferences: {
          annualForeignCurrencySpendCad: numberValue(form.travelPreferences.annualForeignCurrencySpendCad),
          travelsPerYear: numberValue(form.travelPreferences.travelsPerYear),
        },
        additionalPreferences: {
          ...form.additionalPreferences,
          approximateSavingsCad: numberValue(form.additionalPreferences.approximateSavingsCad),
          maxAnnualFeeCad: numberValue(form.additionalPreferences.maxAnnualFeeCad),
        },
      })
      await refresh()
      setMessage({ type: "success", text: "Your answers are saved. Savora can now personalize your recommendations." })
    } catch (caught) {
      setMessage({ type: "error", text: caught instanceof ApiError ? caught.message : "Unable to save your profile" })
    } finally {
      setBusy("")
    }
  }

  async function saveEmail(event: FormEvent) {
    event.preventDefault()
    setBusy("email")
    setMessage(null)
    try {
      await api.updateUser(token, email.trim().toLowerCase())
      await refresh()
      setMessage({ type: "success", text: "Your email has been updated." })
    } catch (caught) {
      setMessage({ type: "error", text: caught instanceof ApiError ? caught.message : "Unable to update your email" })
    } finally {
      setBusy("")
    }
  }

  if (loading) return <LoadingBlock />

  return <div className="page-content narrow">
    <header className="page-header">
      <div>
        <span className="eyebrow">Simple profile</span>
        <h1>Tell us about your spending</h1>
        <p>No bank logins, account numbers, or card numbers. Just a few estimates to personalize Savora.</p>
      </div>
    </header>

    {message && <Notice type={message.type} onClose={() => setMessage(null)}>{message.text}</Notice>}

    <form className="panel profile-form" onSubmit={saveProfile}>
      <div className="panel-heading">
        <div><span className="eyebrow">About you</span><h2>Basic information</h2></div>
        <Pencil size={20} />
      </div>

      <div className="form-row">
        <Field label="Name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
        <SelectField label="Province or territory" value={form.province} onChange={(event) => update("province", event.target.value)}>
          {provinces.map((item) => <option key={item}>{item}</option>)}
        </SelectField>
      </div>

      <h3>Income & savings</h3>
      <p className="section-copy">Approximate amounts are enough. We never ask where the money is held.</p>
      <div className="form-row three">
        <Field label="Annual personal income" type="number" min="0" step="100" value={form.annualPersonalIncome ?? ""} onChange={(event) => update("annualPersonalIncome", event.target.value)} placeholder="$0" />
        <Field label="Annual household income (optional)" type="number" min="0" step="100" value={form.annualHouseholdIncome ?? ""} onChange={(event) => update("annualHouseholdIncome", event.target.value)} placeholder="$0" />
        <Field label="Approximate savings" type="number" min="0" step="100" value={form.additionalPreferences.approximateSavingsCad ?? ""} onChange={(event) => setForm((current) => ({ ...current, additionalPreferences: { ...current.additionalPreferences, approximateSavingsCad: Number(event.target.value) || undefined } }))} placeholder="$0" />
      </div>

      <h3>Which banks do you use?</h3>
      <p className="section-copy">Select bank names only. Savora does not connect to your accounts.</p>
      <div className="choice-grid">
        {bankOptions.map(([slug, label]) => {
          const selected = Boolean(form.bankingRelationships[slug]?.hasAccount)
          return <button type="button" className={selected ? "selected" : ""} onClick={() => toggleBank(slug)} key={slug}>
            {selected && <Check size={15} />}{label}
          </button>
        })}
      </div>

      <h3>Typical monthly spending</h3>
      <p className="section-copy">Rough estimates are fine. Enter only the categories you regularly use.</p>
      <div className="form-row three spending-grid">
        {profileSpendCategories.map(([slug, label]) =>
          <Field key={slug} label={label} type="number" min="0" step="10" value={form.spendingPreferences[slug] ?? ""} onChange={(event) => updateSpend(slug, event.target.value)} placeholder="$0" />
        )}
      </div>

      <h3>Travel</h3>
      <div className="form-row">
        <Field label="Trips per year" type="number" min="0" step="1" value={form.travelPreferences.travelsPerYear ?? ""} onChange={(event) => setForm((current) => ({ ...current, travelPreferences: { ...current.travelPreferences, travelsPerYear: Number(event.target.value) || undefined } }))} placeholder="0" />
        <Field label="Foreign-currency spending per year" type="number" min="0" step="100" value={form.travelPreferences.annualForeignCurrencySpendCad ?? ""} onChange={(event) => setForm((current) => ({ ...current, travelPreferences: { ...current.travelPreferences, annualForeignCurrencySpendCad: Number(event.target.value) || undefined } }))} placeholder="$0" />
      </div>

      <h3>Preferences</h3>
      <div className="form-row">
        <SelectField label="Annual fee preference" value={form.annualFeePreference} onChange={(event) => update("annualFeePreference", event.target.value)}>
          <option value="none">No annual fee</option>
          <option value="low">Keep the fee low</option>
          <option value="any">Any fee if the value is worth it</option>
        </SelectField>
        {form.annualFeePreference === "low"
          ? <Field label="Maximum annual fee" type="number" min="0" step="10" value={form.additionalPreferences.maxAnnualFeeCad ?? ""} onChange={(event) => setForm((current) => ({ ...current, additionalPreferences: { ...current.additionalPreferences, maxAnnualFeeCad: Number(event.target.value) || undefined } }))} placeholder="$120" />
          : <SelectField label="Costco membership" value={form.additionalPreferences.hasCostcoMembership === undefined ? "" : form.additionalPreferences.hasCostcoMembership ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, additionalPreferences: { ...current.additionalPreferences, hasCostcoMembership: event.target.value === "" ? undefined : event.target.value === "yes" } }))}>
              <option value="">Prefer not to say</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </SelectField>}
      </div>
      {form.annualFeePreference === "low" && <div className="form-row">
        <SelectField label="Costco membership" value={form.additionalPreferences.hasCostcoMembership === undefined ? "" : form.additionalPreferences.hasCostcoMembership ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, additionalPreferences: { ...current.additionalPreferences, hasCostcoMembership: event.target.value === "" ? undefined : event.target.value === "yes" } }))}>
          <option value="">Prefer not to say</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </SelectField>
        <SelectField label="Would you consider switching banks for a better card deal?" value={form.additionalPreferences.willingToSwitchBanks ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, additionalPreferences: { ...current.additionalPreferences, willingToSwitchBanks: event.target.value === "yes" } }))}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </SelectField>
      </div>}

      <h3>What matters to you?</h3>
      <div className="choice-grid">
        {goalOptions.map((goal) => <button type="button" className={form.financialGoals.includes(goal) ? "selected" : ""} onClick={() => toggleGoal(goal)} key={goal}>
          {form.financialGoals.includes(goal) && <Check size={15} />}{goal}
        </button>)}
      </div>

      <div className="privacy-note">
        <strong>Your privacy</strong>
        <span>Savora only uses the answers you enter here. We do not ask for bank usernames, passwords, account numbers, or credit-card numbers.</span>
      </div>

      <div className="form-actions"><Button type="submit" busy={busy === "profile"}>Save answers</Button></div>
    </form>

    <form className="panel account-form" onSubmit={saveEmail}>
      <div className="panel-heading"><div><span className="eyebrow">Account</span><h2>Sign-in details</h2></div></div>
      <div className="account-row">
        <Field label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button type="submit" variant="secondary" busy={busy === "email"}>Update email</Button>
      </div>
    </form>
  </div>
}

type ChatMessage = { role: "user" | "assistant"; content: string }

export function AssistantView({ token }: ViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [conversationId, setConversationId] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function send(event: FormEvent) { event.preventDefault(); const message = text.trim(); if (!message) return; setMessages((items) => [...items, { role: "user", content: message }]); setText(""); setBusy(true); setError(""); try { const result = await api.chat(token, message, conversationId); setConversationId(result.conversationId); setMessages((items) => [...items, { role: "assistant", content: result.message }]) } catch (caught) { const detail = caught instanceof ApiError && caught.status === 404 ? "The AI assistant is not enabled on this server." : caught instanceof ApiError ? caught.message : "Unable to reach the assistant"; setError(detail) } finally { setBusy(false) } }
  const prompts = ["Which reward categories should I focus on?", "How can I get more value from my wallet?", "Should I consider a card with an annual fee?"]
  return <div className="assistant-page"><header className="assistant-header"><div className="bot-avatar"><Bot /></div><div><span className="eyebrow">Savora assistant</span><h1>Ask about your wallet</h1></div><span className="status"><i />AI-powered</span></header><div className="chat-body">{messages.length === 0 ? <div className="chat-welcome"><div className="big-icon"><Sparkles /></div><h2>What can I help you figure out?</h2><p>I can use your Savora profile, wallet, and recommendations to help you make sense of your options.</p><div>{prompts.map((prompt) => <button key={prompt} onClick={() => setText(prompt)}>{prompt}<ArrowRight size={15} /></button>)}</div></div> : <div className="messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={index}>{message.role === "assistant" && <span><Bot size={17} /></span>}<p>{message.content}</p></div>)}</div>}{error && <Notice onClose={() => setError("")}>{error}</Notice>}</div><form className="chat-compose" onSubmit={send}><input aria-label="Message Savora" placeholder="Ask Savora anything about your cards..." maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} /><Button type="submit" busy={busy} disabled={!text.trim()} aria-label="Send message"><Send size={18} /></Button></form><p className="ai-disclaimer">Savora can make mistakes. Verify important financial decisions.</p></div>
}
