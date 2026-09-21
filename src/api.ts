import type { ApiErrorBody, AuthResult, ChatResult, CreditCard, FinancialProfile, PurchaseAnalysis, Recommendation, User, WalletCard } from "./types"

const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1"

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => ({})) as { data?: T } & ApiErrorBody
  if (!response.ok) throw new ApiError(response.status, body.error?.code ?? "REQUEST_FAILED", body.error?.message ?? "Something went wrong", body.error?.details)
  return body.data as T
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) })

export const api = {
  register: (email: string, password: string) => request<AuthResult>("/auth/register", { method: "POST", ...json({ email, password }) }),
  login: (email: string, password: string) => request<AuthResult>("/auth/login", { method: "POST", ...json({ email, password }) }),
  logout: (token: string) => request<void>("/auth/logout", { method: "POST" }, token),
  me: (token: string) => request<User>("/auth/me", {}, token),
  updateUser: (token: string, email: string) => request<User>("/users/me", { method: "PUT", ...json({ email }) }, token),
  deleteUser: (token: string) => request<void>("/users/me", { method: "DELETE" }, token),
  getProfile: (token: string) => request<FinancialProfile | null>("/profile", {}, token),
  saveProfile: (token: string, profile: Omit<FinancialProfile, "id" | "userId">) => request<FinancialProfile>("/profile", { method: "PUT", ...json(profile) }, token),
  deleteProfile: (token: string) => request<void>("/profile", { method: "DELETE" }, token),
  cards: (token: string) => request<CreditCard[]>("/credit-cards", {}, token),
  wallet: (token: string) => request<WalletCard[]>("/wallet", {}, token),
  addToWallet: (token: string, creditCardId: string, nickname?: string) => request<WalletCard>("/wallet", { method: "POST", ...json({ creditCardId, ...(nickname ? { nickname } : {}) }) }, token),
  updateWalletCard: (token: string, cardId: string, nickname: string | null) => request<WalletCard>(`/wallet/${cardId}`, { method: "PUT", ...json({ nickname }) }, token),
  removeFromWallet: (token: string, cardId: string) => request<void>(`/wallet/${cardId}`, { method: "DELETE" }, token),
  analyzePurchase: (token: string, purchase: { merchant?: string; amount: number; currency: string; category: string; description?: string }) => request<PurchaseAnalysis>("/purchases/analyze", { method: "POST", ...json(purchase) }, token),
  recommendations: (token: string) => request<Recommendation[]>("/recommendations/credit-cards", {}, token),
  chat: (token: string, message: string, conversationId?: string) => request<ChatResult>("/ai/chat", { method: "POST", ...json({ message, ...(conversationId ? { conversationId } : {}) }) }, token)
}
