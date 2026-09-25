import { getPublicPricing } from "@/server/public-pricing";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getPublicPricing(), {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return Response.json(
      { error: "Prices are temporarily unavailable." },
      { status: 503 },
    );
  }
}
