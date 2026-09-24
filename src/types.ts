export type User = {
  id: string
  email: string
  role?: string
  createdAt: string
  updatedAt: string
}

export type AuthResult = { user: User; token: string }

export type RewardRule = {
  id: string
  category: string
  multiplier: number | string
  earnRate?: number | string | null
  spendingCap: number | string | null
  capPeriod: string | null
}

export type CardBenefit = {
  id: string
  type: string
  name: string
  description: string
  estimatedAnnualValueCad?: number | null
}

export type CreditCard = {
  id: string
  name: string
  issuer: string
  network: string
  cardType?: string
  applicationUrl?: string | null
  imageUrl?: string | null
  annualFee: number | string | null
  baseRewardRate: number | string | null
  rewardCurrency: string | null
  foreignTransactionFee: number | string | null
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

export type SimpleBankRelationship = { hasAccount: boolean }

export type FinancialProfile = {
  id?: string
  userId?: string
  name: string
  province: string
  employmentStatus?: string | null
  annualPersonalIncome?: number | string | null
  annualHouseholdIncome?: number | string | null
  monthlyIncome?: number | string | null
  monthlyExpenses?: number | string | null
  monthlySavings?: number | string | null
  financialGoals: string[]
  spendingPreferences: Record<string, number>
  travelPreferences: {
    annualForeignCurrencySpendCad?: number
    travelsPerYear?: number
  }
  rewardPreferences: {
    preferredRewardTypes?: Array<"cashback" | "points" | "miles" | "travel">
  }
  annualFeePreference: "none" | "low" | "any"
  bankingRelationships: Record<string, SimpleBankRelationship>
  additionalPreferences: {
    hasCostcoMembership?: boolean
    willingToSwitchBanks?: boolean
    approximateSavingsCad?: number
    maxAnnualFeeCad?: number
  }
}

export type RewardBreakdown = {
  baseReward: number
  multiplier: number
  eligibleAmount: number
  totalReward: number
  estimatedValue: number
  estimatedValueCad?: number | null
  valuationAvailable?: boolean
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
  recommendationId?: string
  asOf?: string
  calculationVersion?: string
  rank: number
  card: Pick<CreditCard, "id" | "name" | "issuer" | "network" | "cardType" | "applicationUrl" | "imageUrl">
  eligibility: "ELIGIBLE" | "INELIGIBLE" | "UNKNOWN"
  eligibilityReasons: string[] | null
  estimatedAnnualValue: number
  estimatedOngoingValue?: number
  firstYearValue?: number | null
  estimatedRewards: number
  annualFee: number
  effectiveAnnualFee?: number | null
  benefitValue?: number | null
  welcomeOfferValue?: number | null
  foreignTransactionCost?: number | null
  pointValuation?: {
    valueCad: number | null
    source: "USER" | "CATALOG" | "NONE" | null
  }
  feeRebate?: {
    status: "ELIGIBLE" | "INELIGIBLE" | "UNKNOWN" | null
    amount: number | null
  }
  bankingSwitchScenario?: unknown
  reasons: string[]
  drawbacks: string[]
}

export type ChatResult = { conversationId: string; message: string }

export type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown }
}
