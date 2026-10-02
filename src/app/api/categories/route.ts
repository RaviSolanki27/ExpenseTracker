import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Groceries & Supermarket", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Electricity Bill", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Water Bill", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Mobile Recharge", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Wifi & Internet", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Apartment Rent & Maintenance", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Maid & House Help", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Online Shopping (Household)", bucket: "HOUSEHOLD" as const, isDefault: true },
  { name: "Fuel & Fastag", bucket: "MYSELF" as const, isDefault: true },
  { name: "Personal Tech & Gadgets", bucket: "MYSELF" as const, isDefault: true },
  { name: "Salon & Personal Care", bucket: "WIFE" as const, isDefault: true },
  { name: "Clothing & Shopping", bucket: "WIFE" as const, isDefault: true },
  { name: "Dad's Medicines & Tests", bucket: "PARENTS" as const, isDefault: true },
  { name: "Parents Doctor Consultation", bucket: "PARENTS" as const, isDefault: true },
  { name: "Parents Health Insurance", bucket: "PARENTS" as const, isDefault: true },
  { name: "General / Other", bucket: "HOUSEHOLD" as const, isDefault: true },
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        });
      }
      categories = await prisma.category.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bucket } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        bucket: bucket || "HOUSEHOLD",
        isDefault: false,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Category already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
