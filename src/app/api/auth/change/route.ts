import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasscode, verifyPasscode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPasscode, newPasscode } = body;

    if (!currentPasscode || typeof currentPasscode !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your current 4-digit passcode" },
        { status: 400 }
      );
    }

    if (!newPasscode || typeof newPasscode !== "string" || !/^\d{4}$/.test(newPasscode.trim())) {
      return NextResponse.json(
        { success: false, error: "New passcode must be exactly 4 digits (e.g. 1234)" },
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

    const isCurrentValid = verifyPasscode(currentPasscode.trim(), settings.passcode);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "Current passcode is incorrect." },
        { status: 401 }
      );
    }

    // Hash the new 4-digit passcode and update passcodeUpdatedAt timestamp
    const hashed = hashPasscode(newPasscode.trim());
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        passcode: hashed,
        passcodeUpdatedAt: new Date(),
      },
    });

    const newExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return NextResponse.json({
      success: true,
      message: "Passcode updated successfully!",
      expiresAt: newExpiresAt,
      passcodeUpdatedAt: updated.passcodeUpdatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Change passcode error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update passcode" },
      { status: 500 }
    );
  }
}

