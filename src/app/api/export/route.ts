import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    const settlements = await prisma.settlement.findMany({
      orderBy: { date: "desc" },
    });
    const settings = await prisma.settings.findFirst();

    if (format === "csv") {
      let csv = "ID,Type,Date,Title/Note,Bucket,Category,Paid By,Payment Method,Amount\n";
      for (const e of expenses) {
        csv += `"${e.id}","Expense","${new Date(e.date).toISOString().slice(0, 10)}","${e.title.replace(/"/g, '""')}","${e.bucket}","${e.category}","${e.paidBy}","${e.paymentMethod}",${e.amount}\n`;
      }
      for (const s of settlements) {
        csv += `"${s.id}","Settlement","${new Date(s.date).toISOString().slice(0, 10)}","${(s.notes || "Transfer").replace(/"/g, '""')}","N/A","Settlement","${s.from} -> ${s.to}","${s.paymentMethod}",${s.amount}\n`;
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="duoledger-backup-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      exportDate: new Date().toISOString(),
      settings,
      expenses,
      settlements,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

