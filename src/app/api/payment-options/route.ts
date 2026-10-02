import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAYMENT_OPTIONS = [
  { name: "Credit Card", type: "CARD", isDefault: true },
  { name: "Bank UPI (GPay / PhonePe)", type: "UPI", isDefault: true },
  { name: "Bank Account / NetBanking", type: "BANK", isDefault: true },
  { name: "Cash", type: "CASH", isDefault: true },
  { name: "Wallet (Paytm / Amazon Pay)", type: "WALLET", isDefault: true },
];

export async function GET() {
  try {
    let options = await prisma.paymentOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (options.length === 0) {
      for (const opt of DEFAULT_PAYMENT_OPTIONS) {
        await prisma.paymentOption.upsert({
          where: { name: opt.name },
          update: {},
          create: opt,
        });
      }
      options = await prisma.paymentOption.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ success: true, paymentOptions: options });
  } catch (error: any) {
    console.error("Error fetching payment options:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Payment option name is required" },
        { status: 400 }
      );
    }

    const option = await prisma.paymentOption.create({
      data: {
        name: name.trim(),
        type: type || "UPI",
        isDefault: false,
      },
    });

    return NextResponse.json({ success: true, paymentOption: option });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Payment option already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
