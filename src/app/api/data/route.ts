import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Groceries & Supermarket", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Electricity Bill", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Water Bill", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Mobile Recharge", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Wifi & Internet", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Apartment Rent & Maintenance", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Maid & House Help", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Online Shopping", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Fuel & Fastag", bucket: "MYSELF" as const, isDefault: true },
  { name: "Personal Tech & Gadgets", bucket: "MYSELF" as const, isDefault: true },
  { name: "Salon & Personal Care", bucket: "WIFE" as const, isDefault: true },
  { name: "Clothing & Shopping", bucket: "WIFE" as const, isDefault: true },
  { name: "Dad's Medicines & Tests", bucket: "PARENTS" as const, isDefault: true },
  { name: "Parents Doctor Consultation", bucket: "PARENTS" as const, isDefault: true },
  { name: "Parents Health Insurance", bucket: "PARENTS" as const, isDefault: true },
  { name: "General / Other", bucket: "HOUSEHOLD" as const, isDefault: true },
];

const DEFAULT_PAYMENT_OPTIONS = [
  { name: "Credit Card", type: "CARD", isDefault: true },
  { name: "Bank UPI (GPay / PhonePe)", type: "UPI", isDefault: true },
  { name: "Bank Account / NetBanking", type: "BANK", isDefault: true },
  { name: "Cash", type: "CASH", isDefault: true },
  { name: "Wallet (Paytm / Amazon Pay)", type: "WALLET", isDefault: true },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    // 1. Settings (defaults to Ravi and Chandani)
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "default",
          husbandName: "Ravi",
          wifeName: "Chandani",
          currency: "₹",
          theme: "system",
        },
      });
    }

    // 2. Categories
    let categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        });
      }
      categories = await prisma.category.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    // 3. Payment options
    let paymentOptions = await prisma.paymentOption.findMany({
      orderBy: { createdAt: "asc" },
    });
    if (paymentOptions.length === 0) {
      for (const opt of DEFAULT_PAYMENT_OPTIONS) {
        await prisma.paymentOption.upsert({
          where: { name: opt.name },
          update: {},
          create: opt,
        });
      }
      paymentOptions = await prisma.paymentOption.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    // 4. Date filter
    let dateFilter = {};
    let targetMonth = month;
    if (!targetMonth || targetMonth === "current") {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      targetMonth = `${y}-${m}`;
    }

    if (targetMonth !== "all") {
      const [yearStr, monthStr] = targetMonth.split("-");
      const year = parseInt(yearStr, 10);
      const mIndex = parseInt(monthStr, 10) - 1;

      const startDate = new Date(year, mIndex, 1, 0, 0, 0, 0);
      const endDate = new Date(year, mIndex + 1, 0, 23, 59, 59, 999);

      dateFilter = {
        gte: startDate,
        lte: endDate,
      };
    }

    // 5. Query expenses
    const expenses = await prisma.expense.findMany({
      where: targetMonth !== "all" ? { date: dateFilter } : undefined,
      orderBy: { date: "desc" },
    });

    // 6. Query settlements
    const settlements = await prisma.settlement.findMany({
      where: targetMonth !== "all" ? { date: dateFilter } : undefined,
      orderBy: { date: "desc" },
    });

    // 7. Distinct months
    const allDates = await prisma.expense.findMany({
      select: { date: true },
      orderBy: { date: "desc" },
    });
    const monthsSet = new Set<string>();
    const now = new Date();
    monthsSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

    for (const d of allDates) {
      const dt = new Date(d.date);
      const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(ym);
    }

    const availableMonths = Array.from(monthsSet).sort().reverse();

    return NextResponse.json({
      success: true,
      month: targetMonth,
      settings,
      categories,
      paymentOptions,
      expenses,
      settlements,
      availableMonths,
    });
  } catch (error: any) {
    console.error("API Error in /api/data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
