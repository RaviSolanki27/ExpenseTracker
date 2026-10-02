import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, date, from, to, type, notes, paymentMethod } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required." },
        { status: 400 }
      );
    }

    const settlement = await prisma.settlement.create({
      data: {
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        from: from || "WIFE",
        to: to || "HUSBAND",
        type: type || "DEBT_REDUCTION",
        notes: notes ? notes.trim() : null,
        paymentMethod: paymentMethod || "UPI",
      },
    });

    return NextResponse.json({ success: true, settlement });
  } catch (error: any) {
    console.error("Error creating settlement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record transfer" },
      { status: 500 }
    );
  }
}

