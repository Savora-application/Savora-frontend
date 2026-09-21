export type User = { id: string; email: string; role?: string; createdAt: string; updatedAt: string }

export type AuthResult = { user: User; token: string }

export type RewardRule = {
  id: string
  category: string
  multiplier: number | string
  spendingCap: number | string | null
  capPeriod: string | null
}

export type CardBenefit = { id: string; type: string; name: string; description: string }

export type CreditCard = {
  id: string
  name: string
  issuer: string
  network: string
  annualFee: number | string
  baseRewardRate: number | string
  rewardCurrency: string
  foreignTransactionFee: number | string
  rewardRules: RewardRule[]
  benefits: CardBenefit[]
}

export type WalletCard = {
  id: string
  nickname: string | null
  status: string
  addedAt: string
  creditCard: CreditCard
}

export type FinancialProfile = {
  id?: string
  userId?: string
  name: string
  dateOfBirth?: string | null
  province: string
  employmentStatus?: string | null
  income?: number | string | null
  monthlyIncome?: number | string | null
  monthlyExpenses?: number | string | null
  monthlySavings?: number | string | null
  financialGoals: string[]
  riskPreference?: string | null
  spendingPreferences: Record<string, number>
  travelPreferences: Record<string, unknown>
  rewardPreferences: Record<string, unknown>
  annualFeePreference: "none" | "low" | "any"
}

export type RewardBreakdown = {
  baseReward: number
  multiplier: number
  eligibleAmount: number
  totalReward: number
  estimatedValue: number
  rewardCurrency: string
  appliedCap: number | null
  relevantBenefits: string[]
}

export type PurchaseRanking = {
  card: Pick<CreditCard, "id" | "name" | "issuer" | "network">
  breakdown: RewardBreakdown
}

export type PurchaseAnalysis = {
  purchaseId: string
  recommendation: PurchaseRanking
  alternatives: PurchaseRanking[]
  calculation: string
}

export type Recommendation = {
  rank: number
  card: Pick<CreditCard, "id" | "name" | "issuer" | "network">
  estimatedAnnualValue: number
  estimatedRewards: number
  annualFee: number
  reasons: string[]
  drawbacks: string[]
}

export type ChatResult = { conversationId: string; message: string }

export type ApiErrorBody = { error?: { code?: string; message?: string; details?: unknown } }
