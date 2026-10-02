import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, amount, bucket, category, paidBy, paymentMethod, date, notes } = body;

    if (!title || !amount || !bucket) {
      return NextResponse.json(
        { success: false, error: "Title, amount, and bucket are required." },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount: parseFloat(amount),
        bucket,
        category: category || "General",
        paidBy: paidBy || "HUSBAND",
        paymentMethod: paymentMethod || "CREDIT_CARD",
        date: date ? new Date(date) : new Date(),
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}

