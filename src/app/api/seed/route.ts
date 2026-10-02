import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    // 1. Settings with Ravi and Chandani
    await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        husbandName: "Ravi",
        wifeName: "Chandani",
        currency: "₹",
      },
      create: {
        id: "default",
        husbandName: "Ravi",
        wifeName: "Chandani",
        currency: "₹",
      },
    });

    // 2. Clear current month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    await prisma.expense.deleteMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
    await prisma.settlement.deleteMany({
      where: { date: { gte: startDate, lte: endDate } },
    });

    // 3. Sample Expenses reflecting real household life
    const sampleExpenses = [
      {
        title: "Monthly Grocery & Supermarket",
        amount: 8500,
        bucket: "HOUSEHOLD" as const,
        category: "Groceries & Supermarket",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Credit Card",
        date: new Date(year, month, 2, 11, 0),
        notes: "Paid via credit card at supermarket",
      },
      {
        title: "Electricity Bill (Tata Power)",
        amount: 3450,
        bucket: "HOUSEHOLD" as const,
        category: "Electricity Bill",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Bank UPI (GPay / PhonePe)",
        date: new Date(year, month, 4, 14, 30),
        notes: "Monthly home electricity payment",
      },
      {
        title: "Mobile Recharge (Airtel)",
        amount: 899,
        bucket: "HOUSEHOLD" as const,
        category: "Mobile Recharge",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Bank UPI (GPay / PhonePe)",
        date: new Date(year, month, 5, 9, 15),
        notes: "Prepaid 3-month recharge",
      },
      {
        title: "Water Bill & Society Maintenance",
        amount: 2200,
        bucket: "HOUSEHOLD" as const,
        category: "Water Bill",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Bank Account / NetBanking",
        date: new Date(year, month, 6, 16, 0),
        notes: "Water tank & maintenance dues",
      },
      {
        title: "Kitchen Supplies & Online Shopping",
        amount: 1950,
        bucket: "HOUSEHOLD" as const,
        category: "Online Shopping",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Credit Card",
        date: new Date(year, month, 7, 20, 10),
        notes: "Amazon order for kitchen essentials",
      },
      {
        title: "Fuel & Car Fastag Recharge",
        amount: 3200,
        bucket: "MYSELF" as const,
        category: "Fuel & Fastag",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Credit Card",
        date: new Date(year, month, 8, 8, 30),
        notes: "Work commute fuel",
      },
      {
        title: "Dad's Monthly Medicines & Tests",
        amount: 5400,
        bucket: "PARENTS" as const,
        category: "Dad's Medicines & Tests",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Credit Card",
        date: new Date(year, month, 9, 15, 45),
        notes: "Apollo Pharmacy BP & diabetes medicines",
      },
      {
        title: "Fresh Vegetables Market",
        amount: 1200,
        bucket: "HOUSEHOLD" as const,
        category: "Groceries & Supermarket",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Cash",
        date: new Date(year, month, 10, 10, 30),
        notes: "Paid in cash at local mandi",
      },
      {
        title: "Wifi & Internet Fiber Bill",
        amount: 1180,
        bucket: "HOUSEHOLD" as const,
        category: "Wifi & Internet",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Wallet (Paytm / Amazon Pay)",
        date: new Date(year, month, 11, 13, 0),
        notes: "Paid from Paytm wallet",
      },
      {
        title: "Chandani Salon & Hair Care",
        amount: 3600,
        bucket: "WIFE" as const,
        category: "Salon & Personal Care",
        paidBy: "HUSBAND" as const,
        paymentMethod: "Credit Card",
        date: new Date(year, month, 12, 18, 0),
        notes: "Ravi paid via credit card",
      },
    ];

    for (const exp of sampleExpenses) {
      await prisma.expense.create({ data: exp });
    }

    // 4. Sample transfer received from Chandani
    await prisma.settlement.create({
      data: {
        amount: 15000,
        date: new Date(year, month, 10, 12, 0),
        from: "WIFE",
        to: "HUSBAND",
        type: "DEBT_REDUCTION",
        notes: "Chandani transferred via GPay towards household expenses",
        paymentMethod: "Bank UPI (GPay / PhonePe)",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sample data loaded successfully for " + monthStr,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
