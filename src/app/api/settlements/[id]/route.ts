import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.settlement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Settlement deleted" });
  } catch (error: any) {
    console.error("Error deleting settlement:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete settlement" },
      { status: 500 }
    );
  }
}

