export type ExpenseBucket = "HOUSEHOLD" | "MYSELF" | "WIFE" | "PARENTS";

export type PaidBy = "HUSBAND" | "WIFE";

export type SettlementType = "DEBT_REDUCTION" | "GENERAL_TRANSFER";

export type PaymentMethodType = "CARD" | "UPI" | "BANK" | "WALLET" | "CASH" | "OTHER";

export interface CategoryItem {
  id: string;
  name: string;
  bucket: ExpenseBucket;
  isDefault?: boolean;
}

export interface PaymentOptionItem {
  id: string;
  name: string;
  type: string;
  isDefault?: boolean;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  bucket: ExpenseBucket;
  category: string;
  paidBy: PaidBy;
  paymentMethod: string;
  date: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettlementItem {
  id: string;
  amount: number;
  date: string;
  from: PaidBy;
  to: PaidBy;
  type: SettlementType;
  notes?: string | null;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  id: string;
  husbandName: string;
  wifeName: string;
  currency: string;
  theme: "system" | "light" | "dark";
}

export interface SettlementCalculation {
  householdPaidByHusband: number;
  householdPaidByWife: number;
  householdTotal: number;

  myselfPaidByHusband: number;
  myselfPaidByWife: number;
  myselfTotal: number;

  wifePaidByHusband: number;
  wifePaidByWife: number;
  wifeTotal: number;

  parentsPaidByHusband: number;
  parentsPaidByWife: number;
  parentsTotal: number;

  // Household & Personal breakdown
  husbandPaidForHousehold: number;
  chandaniPaidForHousehold: number;
  chandaniPersonalPaidByHusband: number;

  // Direct settlements/transfers
  transfersWifeToHusband: number;
  transfersHusbandToWife: number;
  netTransfersWifeToHusband: number;

  // Net Balance
  // Positive: Chandani owes Ravi
  // Zero: All settled up
  // Negative: Ravi owes Chandani (or Chandani paid advance)
  netSettlementBalance: number;
  status: "WIFE_OWES_HUSBAND" | "SETTLED" | "HUSBAND_OWES_WIFE";

  totalExpenses: number;
  totalPaidByHusband: number;
  totalPaidByWife: number;
}
