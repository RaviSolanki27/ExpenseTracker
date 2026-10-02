const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  console.log(`Seeding database for ${monthStr}...`);

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

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  await prisma.expense.deleteMany({
    where: { date: { gte: startDate, lte: endDate } },
  });
  await prisma.settlement.deleteMany({
    where: { date: { gte: startDate, lte: endDate } },
  });

  const sampleExpenses = [
    {
      title: "Monthly Grocery & Supermarket",
      amount: 8500,
      bucket: "HOUSEHOLD",
      category: "Groceries & Supermarket",
      paidBy: "HUSBAND",
      paymentMethod: "Credit Card",
      date: new Date(year, month, 2, 11, 0),
      notes: "Paid via credit card at supermarket",
    },
    {
      title: "Electricity Bill (Tata Power)",
      amount: 3450,
      bucket: "HOUSEHOLD",
      category: "Electricity Bill",
      paidBy: "HUSBAND",
      paymentMethod: "Bank UPI (GPay / PhonePe)",
      date: new Date(year, month, 4, 14, 30),
      notes: "Monthly home electricity payment",
    },
    {
      title: "Mobile Recharge (Airtel)",
      amount: 899,
      bucket: "HOUSEHOLD",
      category: "Mobile Recharge",
      paidBy: "HUSBAND",
      paymentMethod: "Bank UPI (GPay / PhonePe)",
      date: new Date(year, month, 5, 9, 15),
      notes: "Prepaid 3-month recharge",
    },
    {
      title: "Water Bill & Society Maintenance",
      amount: 2200,
      bucket: "HOUSEHOLD",
      category: "Water Bill",
      paidBy: "HUSBAND",
      paymentMethod: "Bank Account / NetBanking",
      date: new Date(year, month, 6, 16, 0),
      notes: "Water tank & maintenance dues",
    },
    {
      title: "Kitchen Supplies & Online Shopping",
      amount: 1950,
      bucket: "HOUSEHOLD",
      category: "Online Shopping",
      paidBy: "HUSBAND",
      paymentMethod: "Credit Card",
      date: new Date(year, month, 7, 20, 10),
      notes: "Amazon order for kitchen essentials",
    },
    {
      title: "Fuel & Car Fastag Recharge",
      amount: 3200,
      bucket: "MYSELF",
      category: "Fuel & Fastag",
      paidBy: "HUSBAND",
      paymentMethod: "Credit Card",
      date: new Date(year, month, 8, 8, 30),
      notes: "Work commute fuel",
    },
    {
      title: "Dad's Monthly Medicines & Tests",
      amount: 5400,
      bucket: "PARENTS",
      category: "Dad's Medicines & Tests",
      paidBy: "HUSBAND",
      paymentMethod: "Credit Card",
      date: new Date(year, month, 9, 15, 45),
      notes: "Apollo Pharmacy BP & diabetes medicines",
    },
    {
      title: "Fresh Vegetables Market",
      amount: 1200,
      bucket: "HOUSEHOLD",
      category: "Groceries & Supermarket",
      paidBy: "HUSBAND",
      paymentMethod: "Cash",
      date: new Date(year, month, 10, 10, 30),
      notes: "Paid in cash at local mandi",
    },
    {
      title: "Wifi & Internet Fiber Bill",
      amount: 1180,
      bucket: "HOUSEHOLD",
      category: "Wifi & Internet",
      paidBy: "HUSBAND",
      paymentMethod: "Wallet (Paytm / Amazon Pay)",
      date: new Date(year, month, 11, 13, 0),
      notes: "Paid from Paytm wallet",
    },
    {
      title: "Chandani Salon & Hair Care",
      amount: 3600,
      bucket: "WIFE",
      category: "Salon & Personal Care",
      paidBy: "HUSBAND",
      paymentMethod: "Credit Card",
      date: new Date(year, month, 12, 18, 0),
      notes: "Ravi paid via credit card",
    },
  ];

  for (const exp of sampleExpenses) {
    await prisma.expense.create({ data: exp });
  }

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

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
