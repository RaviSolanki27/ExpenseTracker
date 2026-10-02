import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { husbandName, wifeName, currency, theme } = body;

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        husbandName: husbandName?.trim() || "Ravi",
        wifeName: wifeName?.trim() || "Chandani",
        currency: currency?.trim() || "₹",
        theme: theme || "system",
      },
      create: {
        id: "default",
        husbandName: husbandName?.trim() || "Ravi",
        wifeName: wifeName?.trim() || "Chandani",
        currency: currency?.trim() || "₹",
        theme: theme || "system",
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
