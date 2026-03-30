import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, acType, condition, address } = body;
    if (!name || !phone || !acType || !condition || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        city: body.city?.trim() || "Mumbai",
        acType,
        condition,
        address: address.trim(),
        brand: body.brand?.trim() || null,
        tonnage: body.tonnage?.trim() || null,
        age: body.age?.trim() || null,
        expectedPrice: body.expectedPrice?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
