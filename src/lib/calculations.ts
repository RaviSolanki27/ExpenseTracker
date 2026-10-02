import {
  ExpenseItem,
  SettlementItem,
  AppSettings,
  SettlementCalculation,
} from "./types";

export function calculateSettlement(
  expenses: ExpenseItem[],
  settlements: SettlementItem[],
  settings: AppSettings
): SettlementCalculation {
  let householdPaidByHusband = 0;
  let householdPaidByWife = 0;

  let myselfPaidByHusband = 0;
  let myselfPaidByWife = 0;

  let wifePaidByHusband = 0;
  let wifePaidByWife = 0;

  let parentsPaidByHusband = 0;
  let parentsPaidByWife = 0;

  for (const exp of expenses) {
    const amount = Number(exp.amount) || 0;
    if (exp.bucket === "HOUSEHOLD") {
      if (exp.paidBy === "HUSBAND") householdPaidByHusband += amount;
      else householdPaidByWife += amount;
    } else if (exp.bucket === "MYSELF") {
      if (exp.paidBy === "HUSBAND") myselfPaidByHusband += amount;
      else myselfPaidByWife += amount;
    } else if (exp.bucket === "WIFE") {
      if (exp.paidBy === "HUSBAND") wifePaidByHusband += amount;
      else wifePaidByWife += amount;
    } else if (exp.bucket === "PARENTS") {
      if (exp.paidBy === "HUSBAND") parentsPaidByHusband += amount;
      else parentsPaidByWife += amount;
    }
  }

  const householdTotal = householdPaidByHusband + householdPaidByWife;
  const myselfTotal = myselfPaidByHusband + myselfPaidByWife;
  const wifeTotal = wifePaidByHusband + wifePaidByWife;
  const parentsTotal = parentsPaidByHusband + parentsPaidByWife;

  const totalExpenses = householdTotal + myselfTotal + wifeTotal + parentsTotal;
  const totalPaidByHusband =
    householdPaidByHusband + myselfPaidByHusband + wifePaidByHusband + parentsPaidByHusband;
  const totalPaidByWife =
    householdPaidByWife + myselfPaidByWife + wifePaidByWife + parentsPaidByWife;

  // Husband paid upfront for Household & Chandani personal
  const husbandPaidForHousehold = householdPaidByHusband;
  const chandaniPaidForHousehold = householdPaidByWife;
  const chandaniPersonalPaidByHusband = wifePaidByHusband;

  // Gross amount Chandani covers before spousal transfers:
  // (Household paid by Husband + Chandani personal paid by Husband) - (Parents paid directly by Chandani)
  const grossOwedByWife =
    husbandPaidForHousehold + chandaniPersonalPaidByHusband - parentsPaidByWife;

  // Transfers / Amount Chandani gave to Husband
  let transfersWifeToHusband = 0;
  let transfersHusbandToWife = 0;

  for (const s of settlements) {
    const amount = Number(s.amount) || 0;
    if (s.from === "WIFE" && s.to === "HUSBAND") {
      transfersWifeToHusband += amount;
    } else if (s.from === "HUSBAND" && s.to === "WIFE") {
      transfersHusbandToWife += amount;
    }
  }

  const netTransfersWifeToHusband = transfersWifeToHusband - transfersHusbandToWife;

  // Net Balance:
  // Difference = Gross Owed - Amount Chandani Gave
  const netSettlementBalance = grossOwedByWife - netTransfersWifeToHusband;

  let status: SettlementCalculation["status"] = "SETTLED";
  if (netSettlementBalance > 0.5) {
    status = "WIFE_OWES_HUSBAND";
  } else if (netSettlementBalance < -0.5) {
    status = "HUSBAND_OWES_WIFE";
  }

  return {
    householdPaidByHusband,
    householdPaidByWife,
    householdTotal,

    myselfPaidByHusband,
    myselfPaidByWife,
    myselfTotal,

    wifePaidByHusband,
    wifePaidByWife,
    wifeTotal,

    parentsPaidByHusband,
    parentsPaidByWife,
    parentsTotal,

    husbandPaidForHousehold,
    chandaniPaidForHousehold,
    chandaniPersonalPaidByHusband,

    transfersWifeToHusband,
    transfersHusbandToWife,
    netTransfersWifeToHusband,

    netSettlementBalance,
    status,

    totalExpenses,
    totalPaidByHusband,
    totalPaidByWife,
  };
}

export function formatCurrency(amount: number, currency: string = "₹"): string {
  const formatted = Math.abs(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${currency}${formatted}`;
}
