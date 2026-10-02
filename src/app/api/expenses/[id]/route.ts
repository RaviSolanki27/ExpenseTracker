import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, amount, bucket, category, paidBy, paymentMethod, date, notes } = body;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        bucket: bucket !== undefined ? bucket : undefined,
        category: category !== undefined ? category : undefined,
        paidBy: paidBy !== undefined ? paidBy : undefined,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        notes: notes !== undefined ? (notes ? notes.trim() : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Expense deleted" });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}

