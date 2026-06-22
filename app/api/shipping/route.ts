import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country") ?? "United States";

  try {
    const rows = await prisma.shippingRate.findMany({
      where: { country, isActive: true },
    });

    const rates: Record<string, { price: number; etaDaysMin: number; etaDaysMax: number }> = {};
    for (const r of rows) {
      rates[r.method] = {
        price: Number(r.price),
        etaDaysMin: r.etaDaysMin,
        etaDaysMax: r.etaDaysMax,
      };
    }

    // Fallback defaults if a country has no configured rates
    if (!rates.STANDARD) rates.STANDARD = { price: 9.95, etaDaysMin: 5, etaDaysMax: 10 };
    if (!rates.EXPRESS) rates.EXPRESS = { price: 24.95, etaDaysMin: 1, etaDaysMax: 3 };

    return NextResponse.json({ country, rates });
  } catch (e) {
    console.error("GET /api/shipping", e);
    return NextResponse.json({
      country,
      rates: {
        STANDARD: { price: 9.95, etaDaysMin: 5, etaDaysMax: 10 },
        EXPRESS: { price: 24.95, etaDaysMin: 1, etaDaysMax: 3 },
      },
    });
  }
}
