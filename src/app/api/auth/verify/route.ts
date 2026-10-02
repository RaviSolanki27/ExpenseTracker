import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasscode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { passcode } = body;

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a 4-digit passcode" },
        { status: 400 }
      );
    }

    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "default",
          husbandName: "Ravi",
          wifeName: "Chandani",
          currency: "₹",
          theme: "system",
          passcode: "0000",
        },
      });
    }

    const isValid = verifyPasscode(passcode.trim(), settings.passcode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect passcode. Default is 0000." },
        { status: 401 }
      );
    }

    // 24 hours from now
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return NextResponse.json({
      success: true,
      expiresAt,
      passcodeUpdatedAt: settings.passcodeUpdatedAt.toISOString(),
      husbandName: settings.husbandName,
      wifeName: settings.wifeName,
    });
  } catch (error: any) {
    console.error("Passcode verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify passcode" },
      { status: 500 }
    );
  }
}

